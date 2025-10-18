import * as tf from '@tensorflow/tfjs';
import { supabase } from '@/integrations/supabase/client';

export interface TrainingData {
  features: number[][];
  labels: number[];
}

export interface PredictionResult {
  predictedValue: number;
  confidence: number;
  explanation: string;
}

/**
 * ML Engine for CashFlow AI
 * Handles training and predictions for various financial models
 */
export class MLEngine {
  private models: Map<string, tf.LayersModel> = new Map();
  private modelVersion = '1.0.0';

  /**
   * Initialize pre-trained models or load from storage
   */
  async initialize() {
    try {
      // Try to load models from browser storage
      await this.loadModels();
    } catch (error) {
      console.log('No pre-trained models found, will train on first use');
    }
  }

  /**
   * Create a neural network model for spending prediction
   */
  private createSpendingPredictionModel(inputShape: number): tf.Sequential {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [inputShape], units: 64, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 16, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'linear' })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });

    return model;
  }

  /**
   * Create model for anomaly detection
   */
  private createAnomalyDetectionModel(inputShape: number): tf.Sequential {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [inputShape], units: 32, activation: 'relu' }),
        tf.layers.dense({ units: 16, activation: 'relu' }),
        tf.layers.dense({ units: 8, activation: 'relu' }),
        tf.layers.dense({ units: 16, activation: 'relu' }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ units: inputShape, activation: 'sigmoid' })
      ]
    });

    model.compile({
      optimizer: 'adam',
      loss: 'meanSquaredError'
    });

    return model;
  }

  /**
   * Train spending prediction model
   */
  async trainSpendingPrediction(data: TrainingData): Promise<void> {
    const model = this.createSpendingPredictionModel(data.features[0].length);
    
    const xs = tf.tensor2d(data.features);
    const ys = tf.tensor2d(data.labels, [data.labels.length, 1]);

    await model.fit(xs, ys, {
      epochs: 50,
      batchSize: 32,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Epoch ${epoch}: loss = ${logs?.loss.toFixed(4)}`);
        }
      }
    });

    this.models.set('spending_prediction', model);
    await this.saveModel('spending_prediction', model);

    xs.dispose();
    ys.dispose();
  }

  /**
   * Predict future spending for a category
   */
  async predictSpending(features: number[]): Promise<PredictionResult> {
    let model = this.models.get('spending_prediction');
    
    if (!model) {
      // Load or create new model
      try {
        model = await tf.loadLayersModel('indexeddb://spending_prediction');
        this.models.set('spending_prediction', model);
      } catch {
        // Return default prediction if model doesn't exist
        return {
          predictedValue: 0,
          confidence: 0,
          explanation: 'Insufficient data for prediction. Add more transactions.'
        };
      }
    }

    const inputTensor = tf.tensor2d([features]);
    const prediction = model.predict(inputTensor) as tf.Tensor;
    const value = (await prediction.data())[0];
    
    inputTensor.dispose();
    prediction.dispose();

    return {
      predictedValue: Math.max(0, value),
      confidence: 0.75, // Can be calculated based on model performance
      explanation: `Predicted based on ${features.length} historical data points`
    };
  }

  /**
   * Detect anomalies in spending patterns
   */
  async detectAnomaly(transaction: {
    amount: number;
    category: string;
    dayOfWeek: number;
    hourOfDay: number;
  }): Promise<{ isAnomaly: boolean; score: number; explanation: string }> {
    // Get historical averages for this category
    const { data: historicalData } = await supabase
      .from('expenses')
      .select('amount')
      .eq('category', transaction.category)
      .order('date', { ascending: false })
      .limit(50);

    if (!historicalData || historicalData.length < 10) {
      return {
        isAnomaly: false,
        score: 0,
        explanation: 'Insufficient historical data'
      };
    }

    const amounts = historicalData.map(d => d.amount);
    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const stdDev = Math.sqrt(
      amounts.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / amounts.length
    );

    // Z-score calculation
    const zScore = Math.abs((transaction.amount - mean) / stdDev);
    const isAnomaly = zScore > 2; // More than 2 standard deviations

    return {
      isAnomaly,
      score: Math.min(zScore / 3, 1), // Normalize to 0-1
      explanation: isAnomaly
        ? `This transaction is ${zScore.toFixed(1)}x higher than your usual ${transaction.category} spending`
        : 'Normal spending pattern'
    };
  }

  /**
   * Calculate cashflow health score (0-100)
   */
  calculateCashflowScore(metrics: {
    monthlyIncome: number;
    monthlyExpenses: number;
    savings: number;
    debts: number;
    liquidity: number;
  }): {
    score: number;
    breakdown: {
      income: number;
      expense: number;
      savings: number;
      debt: number;
      liquidity: number;
    };
    trend: 'improving' | 'stable' | 'declining';
    recommendations: string[];
  } {
    const { monthlyIncome, monthlyExpenses, savings, debts, liquidity } = metrics;

    // Income stability score (0-25)
    const incomeScore = monthlyIncome > 0 ? Math.min(25, (monthlyIncome / 50000) * 25) : 0;

    // Expense efficiency score (0-25)
    const expenseRatio = monthlyExpenses / monthlyIncome;
    const expenseScore = expenseRatio < 0.5 ? 25 : expenseRatio < 0.7 ? 20 : expenseRatio < 0.9 ? 15 : 10;

    // Savings score (0-20)
    const savingsRatio = savings / monthlyIncome;
    const savingsScore = savingsRatio > 0.3 ? 20 : savingsRatio > 0.2 ? 15 : savingsRatio > 0.1 ? 10 : 5;

    // Debt score (0-15)
    const debtRatio = debts / monthlyIncome;
    const debtScore = debtRatio < 0.3 ? 15 : debtRatio < 0.5 ? 10 : debtRatio < 1 ? 5 : 0;

    // Liquidity score (0-15)
    const liquidityMonths = liquidity / monthlyExpenses;
    const liquidityScore = liquidityMonths > 6 ? 15 : liquidityMonths > 3 ? 12 : liquidityMonths > 1 ? 8 : 3;

    const totalScore = Math.round(incomeScore + expenseScore + savingsScore + debtScore + liquidityScore);

    const recommendations: string[] = [];
    if (expenseScore < 15) recommendations.push('Reduce your monthly expenses to improve cashflow');
    if (savingsScore < 10) recommendations.push('Increase your savings rate to at least 20% of income');
    if (debtScore < 10) recommendations.push('Focus on reducing high-interest debt');
    if (liquidityScore < 10) recommendations.push('Build an emergency fund covering 3-6 months of expenses');

    return {
      score: totalScore,
      breakdown: {
        income: Math.round(incomeScore),
        expense: Math.round(expenseScore),
        savings: Math.round(savingsScore),
        debt: Math.round(debtScore),
        liquidity: Math.round(liquidityScore)
      },
      trend: totalScore > 70 ? 'improving' : totalScore > 50 ? 'stable' : 'declining',
      recommendations
    };
  }

  /**
   * Auto-categorize expense based on description and amount
   */
  async categorizExpense(description: string, amount: number): Promise<{
    category: string;
    confidence: number;
    subcategory?: string;
  }> {
    const keywords: Record<string, string[]> = {
      food: ['restaurant', 'cafe', 'food', 'meal', 'lunch', 'dinner', 'breakfast', 'swiggy', 'zomato', 'dominos', 'pizza'],
      transport: ['uber', 'ola', 'petrol', 'fuel', 'metro', 'bus', 'auto', 'taxi', 'rapido'],
      shopping: ['amazon', 'flipkart', 'myntra', 'mall', 'shop', 'store', 'clothing', 'fashion'],
      entertainment: ['movie', 'cinema', 'netflix', 'spotify', 'prime', 'hotstar', 'game'],
      bills: ['electricity', 'water', 'gas', 'internet', 'wifi', 'broadband', 'phone', 'mobile'],
      health: ['hospital', 'doctor', 'medicine', 'pharmacy', 'medical', 'clinic', 'health'],
      groceries: ['grocery', 'supermarket', 'dmart', 'reliance', 'fresh', 'vegetables'],
      education: ['school', 'college', 'course', 'udemy', 'coursera', 'book', 'tuition']
    };

    const lowerDesc = description.toLowerCase();
    let bestMatch = 'other';
    let confidence = 0.3;

    for (const [category, words] of Object.entries(keywords)) {
      for (const word of words) {
        if (lowerDesc.includes(word)) {
          bestMatch = category;
          confidence = 0.85;
          break;
        }
      }
      if (confidence > 0.5) break;
    }

    return {
      category: bestMatch,
      confidence,
      subcategory: undefined
    };
  }

  /**
   * Save model to browser storage
   */
  private async saveModel(name: string, model: tf.LayersModel): Promise<void> {
    try {
      await model.save(`indexeddb://${name}`);
      console.log(`Model ${name} saved successfully`);
    } catch (error) {
      console.error(`Failed to save model ${name}:`, error);
    }
  }

  /**
   * Load models from storage
   */
  private async loadModels(): Promise<void> {
    try {
      const model = await tf.loadLayersModel('indexeddb://spending_prediction');
      this.models.set('spending_prediction', model);
      console.log('Loaded spending prediction model');
    } catch (error) {
      console.log('No saved models found');
    }
  }

  /**
   * Log prediction for adaptive learning
   */
  async logPrediction(
    userId: string,
    type: string,
    predicted: number,
    actual?: number
  ): Promise<void> {
    await supabase.from('ai_predictions').insert({
      user_id: userId,
      prediction_type: type,
      predicted_value: predicted,
      actual_value: actual,
      model_version: this.modelVersion,
      prediction_date: new Date().toISOString().split('T')[0]
    });
  }

  /**
   * Get training data from user's transaction history
   */
  async getTrainingData(userId: string, category?: string): Promise<TrainingData> {
    const query = supabase
      .from('expenses')
      .select('amount, date, category')
      .eq('user_id', userId)
      .order('date', { ascending: true });

    if (category) {
      query.eq('category', category);
    }

    const { data: expenses } = await query.limit(500);

    if (!expenses || expenses.length < 30) {
      throw new Error('Insufficient data for training');
    }

    // Feature engineering: day of month, month, day of week, previous amounts
    const features: number[][] = [];
    const labels: number[] = [];

    for (let i = 7; i < expenses.length; i++) {
      const date = new Date(expenses[i].date);
      const prevAmounts = expenses.slice(i - 7, i).map(e => e.amount);
      
      features.push([
        date.getDate(), // Day of month
        date.getMonth() + 1, // Month
        date.getDay(), // Day of week
        ...prevAmounts // Previous 7 days amounts
      ]);
      
      labels.push(expenses[i].amount);
    }

    return { features, labels };
  }
}

// Singleton instance
export const mlEngine = new MLEngine();
