# 🧩 CashFlow AI – Intelligent Expense & Budget Assistant

A smart expense management system that helps users track, analyze, and forecast their spending, while offering AI-driven insights and financial recommendations using the **Gemini 2.5 Flash API**.

🔗 Live Links

- 🌐 Live Demo: [CashFlow AI](https://cashflowxai.vercel.app/)
- 📞 Call the AI Assistant: Adding very soon😊


## 🎯 Features

### Core Features
- ✅ **Expense Entry & Auto-Categorization** - Add expenses with automatic category detection
- 📊 **Visual Analytics** - Interactive charts for category-wise and monthly spending
- 💰 **Budget Management** - Set and track monthly budgets with progress indicators
- 📈 **ML-Based Forecasting** - Predict next month's spending using linear regression
- 🤖 **AI-Powered Insights** - Get personalized recommendations from Gemini 2.5 Flash
- 💬 **Conversational AI Assistant** - Chat with AI about your spending habits

### Technology Stack
- **Frontend**: React, Material-UI, Recharts
- **Backend**: Node.js, Express
- **Database**: Supabase
- **AI**: Google Gemini 2.5 Flash API
- **ML**: Simple linear regression for forecasting

## 🚀Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Gemini API Key ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.

git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>
=======
git clone <GIT_URL>

# Step 2: Navigate to the project directory.
cd <PROJECT_NAME>


# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

The app will open at `http://localhost:3000`

## 📖Usage Guide

### 1. **Dashboard**
- View total monthly spending
- See expense count and next month's forecast
- Quick glance at category breakdown
- Track budget progress

### 2. **Add Expenses**
- Navigate to the Expenses page
- Click "Add Expense"
- Enter expense details:
  - Name (e.g., "Swiggy Order")
  - Amount
  - Category (auto-detected or manual)
  - Date
  - Description (optional)
- Categories are auto-detected based on keywords!

### 3. **Set Budgets**
- Go to Budgets page
- Click "Set Budget"
- Choose category and amount
- Track progress with visual indicators

### 4. **View Analytics**
- Monthly spending trends (line chart)
- Category-wise breakdown (bar chart)
- ML-based forecast for next month
- Confidence levels and trend analysis

### 5. **Chat with AI Assistant**
- Navigate to AI Assistant
- View automatic insights
- Ask questions like:
  - "How much did I spend on food last month?"
  - "How can I save more money?"
  - "What are my top spending categories?"
- Get personalized recommendations

### Gemini API Setup

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with Google account
3. Click "Get API Key"
4. Copy the API key
5. Add to backend `.env` file:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   ```

## 🎨Key Features Explained

### Auto-Categorization
The system uses keyword matching to automatically categorize expenses:
- "Swiggy" → Food
- "Uber" → Transportation
- "Netflix" → Entertainment
- "Amazon" → Shopping
- And more!

### ML Forecasting
Uses simple linear regression on historical data:
- Analyzes last 6 months of spending
- Predicts next month's expenses
- Provides trend direction and confidence level

### AI Insights
Powered by Gemini 2.5 Flash:
- Analyzes spending patterns
- Identifies trends and anomalies
- Provides actionable savings tips
- Answers natural language questions

## 👥 Target Users
- 🎓 College students managing limited budgets
- 💼 Working professionals tracking monthly expenses
- 🏢 Small business owners monitoring operational costs


## 📝 Future Enhancements
- [✔️] User authentication (Firebase/Auth0)
- [✔️] Recurring expense tracking
- [✔️] Export to CSV/PDF
- [ ] Multi-currency support
- [ ] Mobile app (React Native)
- [ ] Shared budgets for families
- [ ] Receipt scanning with OCR

## 📄 License
MIT License - feel free to use this project for learning and development!

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

---

**Built with ❤️ for the hackathon**

Made by Team SLAY
