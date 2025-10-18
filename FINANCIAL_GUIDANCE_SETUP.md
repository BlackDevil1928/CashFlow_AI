# Financial Guidance Learning System Setup

## Overview
The Financial Guidance feature is a comprehensive learning platform that helps users master financial concepts through interactive lessons and quizzes.

## Features

### 1. **Interactive Learning Modules**
- 5 financial concepts covering beginner to advanced topics
- Emergency Fund basics
- 50/30/20 Budget Rule
- Compound Interest principles
- Investment Diversification
- Tax-Saving Investments

### 2. **Quiz System**
- 3 multiple-choice questions per concept
- Real-time feedback with correct/incorrect highlighting
- 70% passing score required to mark concept as completed
- Unlimited retake attempts
- Progress tracking per user

### 3. **User Progress Tracking**
- Individual progress for each concept
- Status indicators: Not Started, In Progress, Quiz Taken, Completed
- Visual badges showing completion status
- Quiz attempt counter and best scores

### 4. **AI Recommendations**
- Personalized financial advice based on user data
- Categories: Savings, Investments, Debt Management
- Priority-based recommendations (High/Medium/Low)

### 5. **Investment Planning**
- Three pre-configured investment plans:
  - Conservative (Low Risk, 8-10% returns)
  - Balanced (Medium Risk, 12-15% returns)
  - Aggressive (High Risk, 18-25% returns)
- Detailed asset allocation breakdowns
- Risk level indicators

## Database Setup

### Step 1: Run the Migration
Copy and run the SQL from `supabase/migrations/CREATE_LEARNING_SYSTEM.sql` in your Supabase SQL Editor:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Create a new query
4. Paste the contents of `CREATE_LEARNING_SYSTEM.sql`
5. Execute the query

### Step 2: Verify Tables Created
The migration creates two tables:

#### `user_learning_progress`
Tracks user progress through financial concepts:
- `user_id`: Reference to authenticated user
- `concept_id`: ID of the financial concept
- `status`: Current status (not_started, in_progress, quiz_taken, completed)
- `quiz_score`: Best quiz score (0-100)
- `quiz_attempts`: Number of quiz attempts
- `time_spent_minutes`: Time spent on the concept
- `completed_at`: Timestamp when concept was completed

#### `quiz_results`
Stores individual quiz attempt results:
- `user_id`: Reference to authenticated user
- `concept_id`: ID of the financial concept
- `score`: Number of correct answers
- `total_questions`: Total questions in quiz
- `time_taken_seconds`: Time taken to complete quiz
- `answers`: JSON array of user's answers
- `passed`: Boolean indicating if quiz was passed

## Usage

### For Users

1. **Navigate to Financial Guidance**
   - Click "More Features" in navbar
   - Select "Financial Guidance"

2. **Learn Concepts**
   - Browse through financial concepts in the sidebar
   - Click on any concept to view detailed content
   - Read through key points and explanations
   - Click "Mark as Read" to track progress

3. **Take Quizzes**
   - Click "Take Quiz" button
   - Answer all 3 questions
   - Submit to see results
   - Must score 70% or higher to mark concept as completed
   - Retake as many times as needed

4. **Track Progress**
   - See completion badges on concepts
   - View "Concepts Learned" counter in stats
   - Monitor your learning streak

5. **Get AI Recommendations**
   - Switch to "AI Recommendations" tab
   - View personalized financial advice
   - Prioritized by importance (High/Medium/Low)

6. **Explore Investment Plans**
   - Switch to "Investment Plans" tab
   - Compare three investment strategies
   - View detailed asset allocations
   - Choose based on risk tolerance

## Features to Add (Future Enhancements)

### 1. Personalized AI Recommendations
Currently showing static recommendations. To make them live:
- Analyze user's expense data from the expenses table
- Calculate spending patterns and ratios
- Generate recommendations based on:
  - High expense categories
  - Missing emergency fund
  - Poor savings rate
  - Debt-to-income ratio

### 2. Financial Health Score
- Calculate overall financial health (0-100)
- Based on:
  - Emergency fund adequacy
  - Savings rate
  - Debt levels
  - Investment diversification
  - Budget adherence (50/30/20 rule)

### 3. Learning Insights
- Time tracking for each concept
- Completion streaks and milestones
- Gamification with badges and achievements
- Leaderboards (optional)

### 4. Advanced Quizzes
- Dynamic difficulty based on user level
- Scenario-based questions
- Timed challenges
- Explanation after each answer

### 5. Practical Tools
- Emergency fund calculator
- Compound interest calculator
- Tax savings estimator
- Portfolio rebalancer

## Technical Implementation

### Frontend Components
- **FinancialGuidance.tsx**: Main page component
- Uses React hooks for state management
- Supabase for data persistence
- Framer Motion for animations
- shadcn/ui components for UI

### Database Integration
- Row Level Security (RLS) enabled
- Users can only access their own data
- Automatic timestamp updates
- Indexed for performance

### Quiz Logic
- Answers stored as zero-indexed positions
- Score calculated as percentage
- Passing threshold: 70%
- Status progression: not_started → in_progress → quiz_taken → completed

## Testing

1. **Test Quiz Functionality**
   - Take a quiz and intentionally fail (score < 70%)
   - Verify status shows "quiz_taken" not "completed"
   - Retake quiz and pass
   - Verify concept now shows "Completed" badge

2. **Test Progress Tracking**
   - Mark a concept as read
   - Refresh page and verify progress persists
   - Complete quiz for another concept
   - Verify completion count updates

3. **Test Data Isolation**
   - Create multiple user accounts
   - Complete different concepts on each
   - Verify each user only sees their own progress

## Troubleshooting

### Migration Errors
If the migration fails:
1. Check if tables already exist: `SELECT * FROM user_learning_progress LIMIT 1;`
2. Drop existing tables if needed (careful - this deletes data!)
3. Verify RLS is enabled
4. Check that the `update_updated_at_column()` function exists

### Quiz Not Submitting
- Check browser console for errors
- Verify Supabase connection
- Ensure user is authenticated
- Check RLS policies are correct

### Progress Not Saving
- Verify user is logged in
- Check network tab for failed requests
- Verify table permissions in Supabase dashboard
- Check RLS policies allow INSERT and UPDATE

## API Endpoints Used

- `supabase.auth.getUser()` - Get current user
- `supabase.from('user_learning_progress').select()` - Fetch progress
- `supabase.from('user_learning_progress').insert()` - Create progress record
- `supabase.from('user_learning_progress').update()` - Update progress
- `supabase.from('quiz_results').insert()` - Save quiz result

## Security

- All database operations protected by RLS
- Users can only access their own data
- SQL injection prevented by Supabase client
- Authentication required for all operations

## Performance

- Indexes on user_id and concept_id for fast queries
- Progress data cached in component state
- Minimal re-renders with React hooks
- Lazy loading of quiz data

---

**Created**: 2025-01-18  
**Version**: 1.0.0  
**Status**: Ready for Production
