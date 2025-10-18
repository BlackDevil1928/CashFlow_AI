import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Bot, Send, User } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const AIChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your AI expense assistant. Ask me anything about your spending habits, budget tips, or financial insights!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getIntelligentResponse = async (userInput: string): Promise<string> => {
    const input = userInput.toLowerCase();
    
    // Fetch user's expenses for context
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return "Please log in to get personalized insights.";

      const { data: expenses } = await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(30);

      const totalExpenses = expenses?.reduce((sum, e) => sum + parseFloat(e.amount), 0) || 0;
      const avgExpense = expenses?.length ? totalExpenses / expenses.length : 0;

      // Intelligent responses based on keywords
      if (input.includes("spend") || input.includes("spending")) {
        return `You've spent $${totalExpenses.toFixed(2)} in total recently. Your average expense is $${avgExpense.toFixed(2)}. ${totalExpenses > 1000 ? "Consider reviewing your budget to optimize spending." : "You're managing your expenses well!"}`;
      }
      
      if (input.includes("save") || input.includes("saving")) {
        return "To save more: 1) Track every expense 2) Set a monthly budget 3) Cut unnecessary subscriptions 4) Cook at home more often 5) Use the 50/30/20 rule (50% needs, 30% wants, 20% savings).";
      }
      
      if (input.includes("budget")) {
        return "A good budget follows the 50/30/20 rule: 50% for necessities, 30% for wants, and 20% for savings. Start by tracking your income and expenses for a month to understand your spending patterns.";
      }
      
      if (input.includes("invest")) {
        return "Investment tips: 1) Start with an emergency fund (3-6 months expenses) 2) Pay off high-interest debt first 3) Consider index funds for beginners 4) Diversify your portfolio 5) Think long-term.";
      }
      
      if (input.includes("tip") || input.includes("advice")) {
        const tips = [
          "Track every expense to understand your spending patterns.",
          "Set specific financial goals and create a plan to achieve them.",
          "Automate your savings - pay yourself first!",
          "Review your subscriptions monthly and cancel unused ones.",
          "Use cash-back cards wisely but avoid debt."
        ];
        return tips[Math.floor(Math.random() * tips.length)] + " Would you like more personalized advice?";
      }

      if (input.includes("category") || input.includes("where")) {
        const categoryTotals: any = {};
        expenses?.forEach((e: any) => {
          categoryTotals[e.category] = (categoryTotals[e.category] || 0) + parseFloat(e.amount);
        });
        const topCategory = Object.entries(categoryTotals).sort(([,a]: any, [,b]: any) => b - a)[0];
        if (topCategory) {
          return `Your highest spending category is ${topCategory[0]} with $${(topCategory[1] as number).toFixed(2)}. Consider if this aligns with your financial goals.`;
        }
      }

      // Default helpful response
      return "I can help you with: spending analysis, savings tips, budgeting advice, investment basics, and expense insights. What would you like to know more about?";
      
    } catch (error) {
      console.error("Error generating response:", error);
      return "I can help you with budgeting, saving, investing, and expense tracking. What would you like to know?";
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setLoading(true);

    try {
      // Try to use Supabase edge function first
      const { data, error } = await supabase.functions.invoke("chat-insights", {
        body: { message: currentInput },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response || await getIntelligentResponse(currentInput),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      // Fallback to local intelligent responses
      console.log("Using local AI responses");
      
      const response = await getIntelligentResponse(currentInput);
      const assistantMessage: Message = {
        role: "assistant",
        content: response,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-[500px] bg-gradient-card shadow-elegant">
      <div className="p-4 border-b flex items-center gap-2">
        <div className="bg-gradient-primary p-2 rounded-lg">
          <Bot className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold">AI Expense Assistant</h3>
          <p className="text-xs text-muted-foreground">Powered by Gemini 2.5 Flash</p>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              } animate-slide-up`}
            >
              {message.role === "assistant" && (
                <div className="bg-primary/10 p-2 rounded-full h-fit">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === "user"
                    ? "bg-gradient-primary text-white"
                    : "bg-muted"
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
              {message.role === "user" && (
                <div className="bg-primary/10 p-2 rounded-full h-fit">
                  <User className="h-4 w-4 text-primary" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3 justify-start animate-pulse">
              <div className="bg-primary/10 p-2 rounded-full h-fit">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="bg-muted rounded-lg p-3">
                <p className="text-sm">Thinking...</p>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="Ask about your expenses..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            disabled={loading}
          />
          <Button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-gradient-primary hover:opacity-90 transition-opacity"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
