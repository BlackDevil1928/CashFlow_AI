import { AuthGuard } from "@/components/AuthGuard";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  BookOpen, 
  TrendingUp, 
  Target, 
  Lightbulb, 
  GraduationCap,
  PiggyBank,
  LineChart,
  Shield,
  Wallet,
  Award,
  Zap,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const financialConcepts = [
  {
    id: "emergency-fund",
    title: "Emergency Fund",
    level: "Beginner",
    duration: "5 min read",
    icon: Shield,
    description: "Build a safety net for unexpected expenses",
    content: "An emergency fund is money set aside for unexpected expenses like medical bills, car repairs, or job loss. Aim for 3-6 months of living expenses.",
    keyPoints: [
      "Start with ₹1,000 and build from there",
      "Keep it in a high-yield savings account",
      "Don't touch it unless it's truly an emergency",
      "Replenish it after use"
    ],
    quiz: [
      {
        question: "How many months of living expenses should an emergency fund ideally cover?",
        options: ["1-2 months", "3-6 months", "9-12 months", "2 years"],
        correct: 1
      },
      {
        question: "Where should you keep your emergency fund?",
        options: ["Under your mattress", "In stocks", "In a high-yield savings account", "In cryptocurrency"],
        correct: 2
      },
      {
        question: "When should you use your emergency fund?",
        options: ["For vacation", "For a new phone", "For unexpected car repairs", "For shopping sales"],
        correct: 2
      }
    ]
  },
  {
    id: "budget-rule-503020",
    title: "50/30/20 Budget Rule",
    level: "Beginner",
    duration: "4 min read",
    icon: PiggyBank,
    description: "Simple budgeting method for financial balance",
    content: "Allocate 50% of income to needs, 30% to wants, and 20% to savings and debt repayment.",
    keyPoints: [
      "50% - Essential needs (rent, food, utilities)",
      "30% - Wants (entertainment, dining out)",
      "20% - Savings, investments, debt",
      "Adjust percentages based on your situation"
    ],
    quiz: [
      {
        question: "According to the 50/30/20 rule, what percentage should go to needs?",
        options: ["30%", "40%", "50%", "60%"],
        correct: 2
      },
      {
        question: "What category does 'dining out' fall under?",
        options: ["Needs", "Wants", "Savings", "Debt"],
        correct: 1
      },
      {
        question: "What percentage should go to savings and debt repayment?",
        options: ["10%", "20%", "30%", "40%"],
        correct: 1
      }
    ]
  },
  {
    id: "compound-interest",
    title: "Compound Interest",
    level: "Intermediate",
    duration: "6 min read",
    icon: TrendingUp,
    description: "The power of money growing on itself",
    content: "Compound interest is when your money earns interest, and that interest also earns interest. It's the key to building wealth over time.",
    keyPoints: [
      "Start investing early to maximize returns",
      "Reinvest dividends and interest",
      "Time in market > timing the market",
      "Small amounts can grow significantly"
    ],
    quiz: [
      {
        question: "What is compound interest?",
        options: ["Interest on principal only", "Interest earned on interest", "A type of bank account", "A penalty fee"],
        correct: 1
      },
      {
        question: "When should you start investing to maximize compound returns?",
        options: ["After retirement", "In your 40s", "As early as possible", "Only when you have ₹1 lakh"],
        correct: 2
      },
      {
        question: "What's more important for compound interest growth?",
        options: ["Timing the market", "Time in the market", "Day trading", "Frequent withdrawals"],
        correct: 1
      }
    ]
  },
  {
    id: "diversification",
    title: "Diversification",
    level: "Intermediate",
    duration: "7 min read",
    icon: LineChart,
    description: "Don't put all eggs in one basket",
    content: "Diversification means spreading investments across different assets to reduce risk. If one investment fails, others can compensate.",
    keyPoints: [
      "Mix stocks, bonds, and cash",
      "Invest across different sectors",
      "Consider international exposure",
      "Rebalance portfolio periodically"
    ],
    quiz: [
      {
        question: "What is the main purpose of diversification?",
        options: ["Maximize returns", "Reduce risk", "Avoid taxes", "Increase fees"],
        correct: 1
      },
      {
        question: "Which is an example of diversification?",
        options: ["Buying only tech stocks", "Investing in one company", "Mixing stocks, bonds, and cash", "Keeping all money in savings"],
        correct: 2
      },
      {
        question: "How often should you rebalance your portfolio?",
        options: ["Daily", "Never", "Periodically", "Only when losing money"],
        correct: 2
      }
    ]
  },
  {
    id: "tax-saving-investments",
    title: "Tax-Saving Investments",
    level: "Advanced",
    duration: "8 min read",
    icon: Award,
    description: "Reduce taxes while building wealth",
    content: "Use Section 80C, 80D, and other tax-saving instruments to reduce taxable income and grow wealth.",
    keyPoints: [
      "80C: ₹1.5L deduction (PPF, ELSS, EPF)",
      "80D: Health insurance premiums",
      "NPS: Additional ₹50K deduction",
      "Plan before financial year end"
    ],
    quiz: [
      {
        question: "What is the maximum deduction under Section 80C?",
        options: ["₹50,000", "₹1,00,000", "₹1,50,000", "₹2,00,000"],
        correct: 2
      },
      {
        question: "What does Section 80D cover?",
        options: ["Education loans", "Home loans", "Health insurance premiums", "Car loans"],
        correct: 2
      },
      {
        question: "How much additional deduction can NPS provide?",
        options: ["₹25,000", "₹50,000", "₹75,000", "₹1,00,000"],
        correct: 1
      }
    ]
  }
];

const aiRecommendations = [
  {
    category: "Savings",
    icon: PiggyBank,
    color: "text-green-500",
    bg: "bg-green-500/10",
    recommendations: [
      { text: "Set up automatic transfers to savings account", priority: "High" },
      { text: "Reduce dining out expenses by 30%", priority: "Medium" },
      { text: "Cancel unused subscriptions (₹2,500/month potential saving)", priority: "High" }
    ]
  },
  {
    category: "Investments",
    icon: TrendingUp,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    recommendations: [
      { text: "Start SIP in index funds (₹5,000/month)", priority: "High" },
      { text: "Rebalance portfolio - reduce equity exposure", priority: "Medium" },
      { text: "Consider debt funds for emergency corpus", priority: "Low" }
    ]
  },
  {
    category: "Debt Management",
    icon: Shield,
    color: "text-red-500",
    bg: "bg-red-500/10",
    recommendations: [
      { text: "Pay off high-interest credit card debt first", priority: "High" },
      { text: "Consolidate loans to lower interest rate", priority: "Medium" },
      { text: "Avoid new loans until credit utilization < 30%", priority: "High" }
    ]
  }
];

const investmentPlans = [
  {
    name: "Conservative Plan",
    riskLevel: "Low",
    expectedReturn: "8-10%",
    timeline: "Short-term (1-3 years)",
    icon: Shield,
    allocation: [
      { asset: "Fixed Deposits", percentage: 40 },
      { asset: "Debt Mutual Funds", percentage: 30 },
      { asset: "Liquid Funds", percentage: 20 },
      { asset: "Gold", percentage: 10 }
    ],
    suitableFor: "Risk-averse investors, near retirement, emergency fund",
    color: "blue"
  },
  {
    name: "Balanced Plan",
    riskLevel: "Medium",
    expectedReturn: "12-15%",
    timeline: "Medium-term (3-7 years)",
    icon: LineChart,
    allocation: [
      { asset: "Equity Mutual Funds", percentage: 40 },
      { asset: "Debt Funds", percentage: 30 },
      { asset: "Fixed Income", percentage: 20 },
      { asset: "Gold/Commodities", percentage: 10 }
    ],
    suitableFor: "Moderate risk appetite, long-term goals, steady growth",
    color: "purple"
  },
  {
    name: "Aggressive Plan",
    riskLevel: "High",
    expectedReturn: "18-25%",
    timeline: "Long-term (7+ years)",
    icon: Zap,
    allocation: [
      { asset: "Equity Stocks", percentage: 50 },
      { asset: "Equity Mutual Funds", percentage: 30 },
      { asset: "International Funds", percentage: 15 },
      { asset: "Debt/FD", percentage: 5 }
    ],
    suitableFor: "High risk tolerance, young investors, wealth creation",
    color: "orange"
  }
];

export default function FinancialGuidance() {
  const [selectedConcept, setSelectedConcept] = useState(financialConcepts[0]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [userProgress, setUserProgress] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserProgress();
  }, []);

  const fetchUserProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_learning_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const progressMap: Record<string, any> = {};
      data?.forEach(item => {
        progressMap[item.concept_id] = item;
      });
      setUserProgress(progressMap);
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = () => {
    setShowQuiz(true);
    setQuizAnswers(new Array(selectedConcept.quiz.length).fill(-1));
    setQuizSubmitted(false);
  };

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...quizAnswers];
    newAnswers[questionIndex] = answerIndex;
    setQuizAnswers(newAnswers);
  };

  const handleSubmitQuiz = async () => {
    if (quizAnswers.includes(-1)) {
      toast({
        title: "Incomplete Quiz",
        description: "Please answer all questions before submitting.",
        variant: "destructive"
      });
      return;
    }

    const correctAnswers = selectedConcept.quiz.filter(
      (q, idx) => q.correct === quizAnswers[idx]
    ).length;
    const score = Math.round((correctAnswers / selectedConcept.quiz.length) * 100);
    const passed = score >= 70;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Insert quiz result
      await supabase.from('quiz_results').insert({
        user_id: user.id,
        concept_id: selectedConcept.id,
        score: correctAnswers,
        total_questions: selectedConcept.quiz.length,
        answers: quizAnswers,
        passed
      });

      // Update or insert learning progress
      const existingProgress = userProgress[selectedConcept.id];
      const newStatus = passed ? 'completed' : 'quiz_taken';
      
      if (existingProgress) {
        await supabase
          .from('user_learning_progress')
          .update({
            status: newStatus,
            quiz_score: score,
            quiz_attempts: existingProgress.quiz_attempts + 1,
            completed_at: passed ? new Date().toISOString() : existingProgress.completed_at
          })
          .eq('id', existingProgress.id);
      } else {
        await supabase.from('user_learning_progress').insert({
          user_id: user.id,
          concept_id: selectedConcept.id,
          status: newStatus,
          quiz_score: score,
          quiz_attempts: 1,
          completed_at: passed ? new Date().toISOString() : null
        });
      }

      setQuizSubmitted(true);
      await fetchUserProgress();

      toast({
        title: passed ? "Quiz Passed! 🎉" : "Quiz Completed",
        description: passed 
          ? `Great job! You scored ${score}%. Concept marked as learned.`
          : `You scored ${score}%. You need 70% to pass. Try again!`,
        variant: passed ? "default" : "destructive"
      });
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast({
        title: "Error",
        description: "Failed to submit quiz. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleMarkAsLearned = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const existingProgress = userProgress[selectedConcept.id];
      
      if (existingProgress) {
        await supabase
          .from('user_learning_progress')
          .update({
            status: 'in_progress',
            last_accessed_at: new Date().toISOString()
          })
          .eq('id', existingProgress.id);
      } else {
        await supabase.from('user_learning_progress').insert({
          user_id: user.id,
          concept_id: selectedConcept.id,
          status: 'in_progress',
          last_accessed_at: new Date().toISOString()
        });
      }

      await fetchUserProgress();
      toast({
        title: "Progress Saved",
        description: "Take the quiz to mark this concept as completed."
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const getConceptStatus = (conceptId: string) => {
    const progress = userProgress[conceptId];
    if (!progress) return null;
    return progress.status;
  };

  const completedCount = Object.values(userProgress).filter(
    (p: any) => p.status === 'completed'
  ).length;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="container mx-auto px-4 py-8 space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4 animate-fade-in">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="inline-block"
            >
              <div className="bg-gradient-primary p-4 rounded-2xl">
                <Brain className="h-12 w-12 text-white" />
              </div>
            </motion.div>
            <h1 className="text-4xl font-bold">
              Financial <span className="bg-gradient-primary bg-clip-text text-transparent">Guidance</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              AI-powered learning platform to master financial concepts, get personalized recommendations, 
              and build wealth with smart investment strategies
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: "Concepts Learned", value: `${completedCount}/${financialConcepts.length}`, icon: BookOpen, color: "text-blue-500" },
              { label: "AI Recommendations", value: "8 Active", icon: Lightbulb, color: "text-yellow-500" },
              { label: "Investment Plans", value: "3 Available", icon: TrendingUp, color: "text-green-500" },
              { label: "Learning Streak", value: "5 Days", icon: Zap, color: "text-orange-500" }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover-lift">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`${stat.color}`}>
                        <stat.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="learn" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
              <TabsTrigger value="learn" className="gap-2">
                <GraduationCap className="h-4 w-4" />
                Learn Concepts
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="gap-2">
                <Lightbulb className="h-4 w-4" />
                AI Recommendations
              </TabsTrigger>
              <TabsTrigger value="invest" className="gap-2">
                <Target className="h-4 w-4" />
                Investment Plans
              </TabsTrigger>
            </TabsList>

            {/* Learn Concepts Tab */}
            <TabsContent value="learn" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Concepts List */}
                <div className="lg:col-span-1 space-y-3">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Financial Concepts
                  </h3>
                  {financialConcepts.map((concept) => {
                    const Icon = concept.icon;
                    return (
                      <Card
                        key={concept.id}
                        className={`cursor-pointer transition-all ${
                          selectedConcept.id === concept.id
                            ? "border-primary shadow-lg"
                            : "hover:border-primary/50"
                        }`}
                        onClick={() => {
                          setSelectedConcept(concept);
                          setShowQuiz(false);
                          setQuizSubmitted(false);
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="bg-primary/10 p-2 rounded-lg relative">
                              <Icon className="h-5 w-5 text-primary" />
                              {getConceptStatus(concept.id) === 'completed' && (
                                <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5">
                                  <CheckCircle2 className="h-3 w-3 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm">{concept.title}</h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                {concept.description}
                              </p>
                              <div className="flex gap-2 mt-2 flex-wrap">
                                <Badge variant="secondary" className="text-xs">
                                  {concept.level}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {concept.duration}
                                </Badge>
                                {getConceptStatus(concept.id) === 'completed' && (
                                  <Badge className="text-xs bg-green-500">
                                    Completed
                                  </Badge>
                                )}
                                {getConceptStatus(concept.id) === 'in_progress' && (
                                  <Badge className="text-xs bg-yellow-500">
                                    In Progress
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Concept Details */}
                <div className="lg:col-span-2">
                  <Card className="shadow-elegant">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="bg-gradient-primary p-3 rounded-xl">
                            {(() => {
                              const Icon = selectedConcept.icon;
                              return <Icon className="h-6 w-6 text-white" />;
                            })()}
                          </div>
                          <div>
                            <CardTitle className="text-2xl">{selectedConcept.title}</CardTitle>
                            <CardDescription className="mt-2">
                              {selectedConcept.description}
                            </CardDescription>
                            <div className="flex gap-2 mt-3">
                              <Badge>{selectedConcept.level}</Badge>
                              <Badge variant="outline">{selectedConcept.duration}</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {!showQuiz ? (
                        <>
                          <div>
                            <h4 className="font-semibold mb-3">What is it?</h4>
                            <p className="text-muted-foreground leading-relaxed">
                              {selectedConcept.content}
                            </p>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-3">Key Points to Remember</h4>
                            <div className="space-y-3">
                              {selectedConcept.keyPoints.map((point, index) => (
                                <div key={index} className="flex items-start gap-3">
                                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                  <p className="text-muted-foreground">{point}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex gap-3 pt-4 border-t">
                            <Button 
                              className="flex-1 bg-gradient-primary"
                              onClick={handleMarkAsLearned}
                              disabled={getConceptStatus(selectedConcept.id) === 'completed'}
                            >
                              {getConceptStatus(selectedConcept.id) === 'completed' 
                                ? 'Completed' 
                                : 'Mark as Read'}
                            </Button>
                            <Button 
                              variant="outline" 
                              className="flex-1"
                              onClick={handleStartQuiz}
                            >
                              <BookOpen className="h-4 w-4 mr-2" />
                              Take Quiz
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-lg">Quiz Time! 📝</h4>
                            <Badge>
                              {quizAnswers.filter(a => a !== -1).length} / {selectedConcept.quiz.length}
                            </Badge>
                          </div>

                          <div className="space-y-6">
                            {selectedConcept.quiz.map((q, qIdx) => (
                              <div key={qIdx} className="space-y-3">
                                <p className="font-medium">
                                  {qIdx + 1}. {q.question}
                                </p>
                                <div className="space-y-2">
                                  {q.options.map((option, oIdx) => {
                                    const isSelected = quizAnswers[qIdx] === oIdx;
                                    const isCorrect = q.correct === oIdx;
                                    const showResult = quizSubmitted;

                                    return (
                                      <button
                                        key={oIdx}
                                        onClick={() => !quizSubmitted && handleAnswerSelect(qIdx, oIdx)}
                                        disabled={quizSubmitted}
                                        className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                                          showResult
                                            ? isCorrect
                                              ? 'border-green-500 bg-green-500/10'
                                              : isSelected
                                              ? 'border-red-500 bg-red-500/10'
                                              : 'border-muted'
                                            : isSelected
                                            ? 'border-primary bg-primary/10'
                                            : 'border-muted hover:border-primary/50'
                                        }`}
                                      >
                                        <div className="flex items-center justify-between">
                                          <span>{option}</span>
                                          {showResult && isCorrect && (
                                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                                          )}
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>

                          {quizSubmitted ? (
                            <div className="flex gap-3 pt-4 border-t">
                              <Button
                                className="flex-1"
                                onClick={() => {
                                  setShowQuiz(false);
                                  setQuizSubmitted(false);
                                }}
                              >
                                Back to Lesson
                              </Button>
                              {userProgress[selectedConcept.id]?.status !== 'completed' && (
                                <Button
                                  variant="outline"
                                  className="flex-1"
                                  onClick={handleStartQuiz}
                                >
                                  Try Again
                                </Button>
                              )}
                            </div>
                          ) : (
                            <div className="flex gap-3 pt-4 border-t">
                              <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setShowQuiz(false)}
                              >
                                Cancel
                              </Button>
                              <Button
                                className="flex-1 bg-gradient-primary"
                                onClick={handleSubmitQuiz}
                              >
                                Submit Quiz
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* AI Recommendations Tab */}
            <TabsContent value="recommendations" className="space-y-6">
              <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-transparent">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-primary p-2 rounded-lg">
                      <Brain className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle>Personalized AI Recommendations</CardTitle>
                      <CardDescription>
                        Based on your spending patterns and financial goals
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {aiRecommendations.map((category, index) => {
                  const Icon = category.icon;
                  return (
                    <motion.div
                      key={category.category}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="h-full">
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            <div className={`${category.bg} p-2 rounded-lg`}>
                              <Icon className={`h-5 w-5 ${category.color}`} />
                            </div>
                            <CardTitle className="text-lg">{category.category}</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {category.recommendations.map((rec, idx) => (
                              <div
                                key={idx}
                                className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                              >
                                <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="text-sm">{rec.text}</p>
                                  <Badge
                                    variant={
                                      rec.priority === "High"
                                        ? "destructive"
                                        : rec.priority === "Medium"
                                        ? "default"
                                        : "secondary"
                                    }
                                    className="mt-2 text-xs"
                                  >
                                    {rec.priority} Priority
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>

            {/* Investment Plans Tab */}
            <TabsContent value="invest" className="space-y-6">
              <Card className="border-green-500/50 bg-gradient-to-br from-green-500/5 to-transparent">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="bg-green-500 p-2 rounded-lg">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle>Smart Investment Plans</CardTitle>
                      <CardDescription>
                        Choose a plan based on your risk appetite and financial goals
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <div className="grid lg:grid-cols-3 gap-6">
                {investmentPlans.map((plan, index) => {
                  const Icon = plan.icon;
                  const colorClasses = {
                    blue: "border-blue-500/50 bg-blue-500/5",
                    purple: "border-purple-500/50 bg-purple-500/5",
                    orange: "border-orange-500/50 bg-orange-500/5"
                  };
                  
                  return (
                    <motion.div
                      key={plan.name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.15 }}
                    >
                      <Card className={`h-full ${colorClasses[plan.color as keyof typeof colorClasses]}`}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-xl">{plan.name}</CardTitle>
                              <CardDescription className="mt-2">
                                {plan.timeline}
                              </CardDescription>
                            </div>
                            <div className="bg-gradient-primary p-2 rounded-lg">
                              <Icon className="h-5 w-5 text-white" />
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Badge variant="outline">Risk: {plan.riskLevel}</Badge>
                            <Badge className="bg-green-500">{plan.expectedReturn}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-sm mb-3">Asset Allocation</h4>
                            <div className="space-y-2">
                              {plan.allocation.map((asset) => (
                                <div key={asset.asset}>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="text-muted-foreground">{asset.asset}</span>
                                    <span className="font-medium">{asset.percentage}%</span>
                                  </div>
                                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-primary"
                                      style={{ width: `${asset.percentage}%` }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="pt-3 border-t">
                            <p className="text-xs text-muted-foreground">
                              <strong>Suitable for:</strong> {plan.suitableFor}
                            </p>
                          </div>

                          <Button className="w-full bg-gradient-primary">
                            Start with This Plan
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </AuthGuard>
  );
}
