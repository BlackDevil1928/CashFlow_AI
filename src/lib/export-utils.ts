import { supabase } from '@/integrations/supabase/client';

export interface ExportData {
  expenses: any[];
  income: any[];
  budgets: any[];
  goals: any[];
  bills: any[];
  wallets: any[];
}

// Fetch all user data for export
export async function fetchAllUserData(): Promise<ExportData> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const [expenses, income, budgets, goals, bills, wallets] = await Promise.all([
    supabase.from('expenses').select('*').eq('user_id', user.id),
    supabase.from('income').select('*').eq('user_id', user.id),
    supabase.from('budgets').select('*').eq('user_id', user.id),
    supabase.from('goals').select('*').eq('user_id', user.id),
    supabase.from('bills_emis').select('*').eq('user_id', user.id),
    supabase.from('wallets').select('*').eq('user_id', user.id),
  ]);

  return {
    expenses: expenses.data || [],
    income: income.data || [],
    budgets: budgets.data || [],
    goals: goals.data || [],
    bills: bills.data || [],
    wallets: wallets.data || [],
  };
}

// Convert data to CSV format
export function convertToCSV(data: any[], headers: string[]): string {
  const csvRows = [];
  
  // Add headers
  csvRows.push(headers.join(','));
  
  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header.toLowerCase().replace(/ /g, '_')];
      // Escape quotes and wrap in quotes if contains comma
      const escaped = ('' + value).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}

// Export expenses to CSV
export function exportExpensesToCSV(expenses: any[]): void {
  const headers = ['Date', 'Category', 'Amount', 'Description', 'Payment Method'];
  const csv = convertToCSV(expenses, headers);
  downloadFile(csv, 'expenses.csv', 'text/csv');
}

// Export income to CSV
export function exportIncomeToCSV(income: any[]): void {
  const headers = ['Date', 'Source', 'Amount', 'Description'];
  const csv = convertToCSV(income, headers);
  downloadFile(csv, 'income.csv', 'text/csv');
}

// Export all data to JSON
export function exportToJSON(data: ExportData): void {
  const json = JSON.stringify(data, null, 2);
  downloadFile(json, 'expensemuse-data.json', 'application/json');
}

// Export specific dataset to JSON
export function exportDatasetToJSON(data: any[], filename: string): void {
  const json = JSON.stringify(data, null, 2);
  downloadFile(json, `${filename}.json`, 'application/json');
}

// Helper function to download file
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Export summary report as text
export function exportSummaryReport(data: ExportData): void {
  const totalExpenses = data.expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalIncome = data.income.reduce((sum, i) => sum + (i.amount || 0), 0);
  const netSavings = totalIncome - totalExpenses;
  
  const report = `
CashFlow AI - Financial Summary Report
Generated: ${new Date().toLocaleString()}

========================================
OVERVIEW
========================================
Total Income:     ₹${totalIncome.toLocaleString()}
Total Expenses:   ₹${totalExpenses.toLocaleString()}
Net Savings:      ₹${netSavings.toLocaleString()}
Savings Rate:     ${((netSavings / totalIncome) * 100).toFixed(1)}%

========================================
ACCOUNTS
========================================
Wallets:          ${data.wallets.length}
Total Balance:    ₹${data.wallets.reduce((sum, w) => sum + (w.balance || 0), 0).toLocaleString()}

========================================
TRANSACTIONS
========================================
Expenses:         ${data.expenses.length} transactions
Income:           ${data.income.length} transactions

========================================
GOALS & BUDGETS
========================================
Active Goals:     ${data.goals.filter((g: any) => g.status === 'active').length}
Active Budgets:   ${data.budgets.length}
Pending Bills:    ${data.bills.filter((b: any) => b.status === 'pending').length}

========================================
TOP EXPENSE CATEGORIES
========================================
${getTopCategories(data.expenses).map(([cat, amount]) => 
  `${cat.padEnd(20)} ₹${amount.toLocaleString()}`
).join('\n')}

========================================
END OF REPORT
========================================
  `.trim();
  
  downloadFile(report, 'financial-summary.txt', 'text/plain');
}

// Get top expense categories
function getTopCategories(expenses: any[]): [string, number][] {
  const categoryTotals: Record<string, number> = {};
  
  expenses.forEach(expense => {
    const category = expense.category || 'other';
    categoryTotals[category] = (categoryTotals[category] || 0) + (expense.amount || 0);
  });
  
  return Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);
}

// Import data from JSON (validates structure)
export async function importFromJSON(jsonData: string): Promise<{ success: boolean; message: string }> {
  try {
    const data = JSON.parse(jsonData);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, message: 'Not authenticated' };
    }

    // Validate data structure
    if (!data.expenses && !data.income && !data.budgets && !data.goals) {
      return { success: false, message: 'Invalid data format' };
    }

    let imported = 0;

    // Import expenses
    if (data.expenses && Array.isArray(data.expenses)) {
      const expensesToImport = data.expenses.map((e: any) => ({
        ...e,
        user_id: user.id,
        id: undefined, // Remove old IDs
      }));
      
      const { error } = await supabase.from('expenses').insert(expensesToImport);
      if (!error) imported += expensesToImport.length;
    }

    // Import income
    if (data.income && Array.isArray(data.income)) {
      const incomeToImport = data.income.map((i: any) => ({
        ...i,
        user_id: user.id,
        id: undefined,
      }));
      
      const { error } = await supabase.from('income').insert(incomeToImport);
      if (!error) imported += incomeToImport.length;
    }

    return { 
      success: true, 
      message: `Successfully imported ${imported} records` 
    };
  } catch (error: any) {
    return { 
      success: false, 
      message: error.message || 'Failed to import data' 
    };
  }
}
