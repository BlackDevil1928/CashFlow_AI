import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const COLORS = {
  Food: "#8b5cf6",
  Transport: "#3b82f6",
  Entertainment: "#ec4899",
  Bills: "#f59e0b",
  Shopping: "#10b981",
  Health: "#ef4444",
  Education: "#06b6d4",
  Other: "#6b7280",
};

export const ExpenseCharts = () => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  const categoryData = Object.entries(
    expenses.reduce((acc: any, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + parseFloat(expense.amount);
      return acc;
    }, {})
  ).map(([name, value]) => ({
    name,
    value: parseFloat(value as string),
  }));

  const last7Days = expenses
    .filter((exp) => {
      const expDate = new Date(exp.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return expDate >= weekAgo;
    })
    .reduce((acc: any, expense) => {
      const date = new Date(expense.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      acc[date] = (acc[date] || 0) + parseFloat(expense.amount);
      return acc;
    }, {});

  const dailyData = Object.entries(last7Days).map(([date, amount]) => ({
    date,
    amount: parseFloat(amount as string),
  }));

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 animate-pulse">
          <div className="h-64 bg-muted rounded"></div>
        </Card>
        <Card className="p-6 animate-pulse">
          <div className="h-64 bg-muted rounded"></div>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
      <Card className="p-6 bg-gradient-card shadow-elegant">
        <h3 className="text-xl font-semibold mb-4">Expenses by Category</h3>
        {categoryData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            No expenses yet. Add your first expense!
          </div>
        )}
      </Card>

      <Card className="p-6 bg-gradient-card shadow-elegant">
        <h3 className="text-xl font-semibold mb-4">Last 7 Days Spending</h3>
        {dailyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="amount" fill="hsl(var(--primary))" animationDuration={800} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            No expenses in the last 7 days
          </div>
        )}
      </Card>
    </div>
  );
};
