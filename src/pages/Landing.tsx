import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Sparkles, TrendingUp, Target, Shield, Zap, BarChart3, 
  PiggyBank, Trophy, CheckCircle, Star, ArrowRight, Wallet, Brain,
  Lightbulb, Sparkle, CircuitBoard, Bot, Cpu
} from "lucide-react";
import Orb from "@/components/Orb";
import { Boxes } from "@/components/ui/background-boxes";

export default function Landing() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      } else {
        setLoading(false);
      }
    });
  }, [navigate]);

  if (loading) {
    return null; // or a loading spinner
  }

  const features = [
    {
      icon: Brain,
      title: "Neural Expense Analysis",
      description: "Advanced AI algorithms analyze your spending patterns and predict future expenses with unprecedented accuracy",
      color: "text-purple-400",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Cpu,
      title: "Real-Time Processing",
      description: "Lightning-fast expense categorization and insights powered by machine learning models",
      color: "text-cyan-400",
      gradient: "from-cyan-500 to-blue-500"
    },
    {
      icon: CircuitBoard,
      title: "Smart Automation",
      description: "Automated budget optimization and intelligent alerts that learn from your behavior",
      color: "text-emerald-400",
      gradient: "from-emerald-500 to-teal-500"
    },
    {
      icon: Lightbulb,
      title: "Predictive Intelligence",
      description: "AI-powered forecasting helps you plan ahead and avoid financial surprises",
      color: "text-amber-400",
      gradient: "from-amber-500 to-orange-500"
    },
    {
      icon: Bot,
      title: "AI Assistant",
      description: "Chat with your personal financial AI that understands context and provides tailored advice",
      color: "text-indigo-400",
      gradient: "from-indigo-500 to-purple-500"
    },
    {
      icon: Shield,
      title: "Quantum Security",
      description: "Military-grade encryption with AI-powered fraud detection keeps your data fortress-secure",
      color: "text-rose-400",
      gradient: "from-rose-500 to-pink-500"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Small Business Owner",
      content: "ExpenseMuse AI helped me save over $5,000 in my first year! The AI insights are incredibly accurate.",
      rating: 5,
      avatar: "SJ"
    },
    {
      name: "Michael Chen",
      role: "Software Engineer",
      content: "The gamification aspect makes budgeting actually fun. I've maintained my streak for 6 months now!",
      rating: 5,
      avatar: "MC"
    },
    {
      name: "Emily Rodriguez",
      role: "Freelance Designer",
      content: "Best expense tracker I've ever used. The analytics help me understand my spending patterns perfectly.",
      rating: 5,
      avatar: "ER"
    }
  ];

  const pricingFeatures = [
    "Unlimited expense tracking",
    "AI-powered insights & recommendations",
    "Advanced analytics & reports",
    "Budget management",
    "Savings goal tracking",
    "Achievement system",
    "Priority support"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-slate-800/50 bg-black/30 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary blur-lg opacity-60"></div>
              <div className="relative bg-gradient-primary p-2 rounded-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                ExpenseMuse AI
              </span>
              <div className="flex items-center gap-1 -mt-1">
                <div className="w-1 h-1 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-[10px] text-green-400 font-mono">NEURAL ACTIVE</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-slate-300 hover:text-white" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
            <Button className="bg-gradient-primary hover:opacity-90 shadow-lg shadow-purple-500/50" onClick={() => navigate("/auth")}>
              <Sparkle className="mr-2 h-4 w-4" />
              Launch AI
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-black min-h-[90vh] flex items-center">
        {/* Background Orb Animation */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50">
          <div className="w-[700px] h-[700px] md:w-[1000px] md:h-[1000px]">
            <Orb hue={260} hoverIntensity={0.3} rotateOnHover={false} forceHoverState={false} />
          </div>
        </div>
        
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]"></div>
        
        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="max-w-5xl mx-auto text-center space-y-8 animate-fade-in">
            <Badge className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-purple-300 border border-purple-500/30 backdrop-blur-sm px-4 py-1.5">
              <Brain className="h-3 w-3 mr-2 inline-block" />
              Next-Gen AI Financial Intelligence
            </Badge>
            
            <h1 className="text-6xl md:text-8xl font-black leading-tight">
              <span className="block mb-2">Master Your Money</span>
              <span className="block">
                with{" "}
                <span className="relative inline-block">
                  <span className="absolute inset-0 blur-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 opacity-50"></span>
                  <span className="relative bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                    AI Intelligence
                  </span>
                </span>
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Experience the future of financial management with neural-powered insights,
              <span className="text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text font-semibold"> real-time analytics</span>, and
              intelligent automation that evolves with you.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Button 
                size="lg" 
                className="relative group bg-gradient-primary hover:opacity-90 text-lg px-10 py-7 rounded-xl shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300"
                onClick={() => navigate("/auth")}
              >
                <span className="flex items-center">
                  <Zap className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                  Activate AI Now
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-10 py-7 rounded-xl border-slate-700 bg-slate-900/50 backdrop-blur-sm hover:bg-slate-800/50 text-slate-200"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                See AI in Action
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 pt-12 text-sm">
              <div className="flex items-center gap-2 text-slate-400">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                No credit card required
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                Instant AI activation
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>
                Free forever
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-32 bg-black overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <Boxes />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center space-y-6 mb-20 animate-fade-in">
            <Badge className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-cyan-300 border border-cyan-500/30 backdrop-blur-sm px-4 py-1.5">
              <CircuitBoard className="h-3 w-3 mr-2 inline-block" />
              Neural Architecture
            </Badge>
            <h2 className="text-5xl md:text-6xl font-black">
              <span className="block mb-2 text-white">Cutting-Edge AI</span>
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Technology Stack
              </span>
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Powered by advanced machine learning models and neural networks,
              delivering intelligence that adapts to your financial behavior
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group relative bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20"
                >
                  {/* Glow effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity duration-300" style={{ backgroundImage: `linear-gradient(135deg, var(--${feature.gradient}))` }}></div>
                  
                  <div className="relative z-10">
                    <div className="mb-6">
                      <div className="relative inline-block">
                        <div className={`absolute inset-0 blur-xl ${feature.color} opacity-50 group-hover:opacity-100 transition-opacity duration-300`}>
                          <Icon className="h-12 w-12" />
                        </div>
                        <Icon className={`h-12 w-12 ${feature.color} relative`} />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-cyan-400 group-hover:bg-clip-text transition-all duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                    
                    {/* Tech indicator */}
                    <div className="mt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                      <span className="text-xs text-green-400 font-mono">ACTIVE</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative py-32 bg-slate-950 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <Boxes />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center space-y-6 mb-20">
            <Badge className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-purple-300 border border-purple-500/30 backdrop-blur-sm px-4 py-1.5">
              <Star className="h-3 w-3 mr-2 inline-block" />
              User Feedback
            </Badge>
            <h2 className="text-5xl md:text-6xl font-black">
              <span className="block mb-2 text-white">Trusted by</span>
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Financial Visionaries
              </span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Real stories from users who transformed their finances with AI
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="group relative bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300"
              >
                <div className="absolute top-4 right-4 flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-primary blur-md opacity-60"></div>
                    <div className="relative h-12 w-12 rounded-full bg-gradient-primary text-white flex items-center justify-center font-bold">
                      {testimonial.avatar}
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p className="text-sm text-slate-400">{testimonial.role}</p>
                  </div>
                </div>
                
                <p className="text-slate-300 leading-relaxed">
                  "{testimonial.content}"
                </p>
                
                <div className="mt-4 pt-4 border-t border-slate-800 flex items-center gap-2 text-xs text-slate-500">
                  <CheckCircle className="h-3 w-3 text-green-400" />
                  Verified User
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative py-32 bg-black overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-15">
          <Boxes />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center space-y-6 mb-20">
            <Badge className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-cyan-300 border border-cyan-500/30 backdrop-blur-sm px-4 py-1.5">
              <Zap className="h-3 w-3 mr-2 inline-block" />
              Zero Cost. Infinite Value.
            </Badge>
            <h2 className="text-5xl md:text-6xl font-black">
              <span className="block mb-2 text-white">Revolutionary AI</span>
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Completely Free
              </span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Full access to enterprise-grade AI features. No hidden costs, ever.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="relative group">
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
              
              <div className="relative bg-slate-900/90 backdrop-blur-xl border-2 border-purple-500/50 rounded-3xl overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500"></div>
                
                <div className="p-10">
                  <div className="text-center mb-8">
                    <Badge className="mb-4 bg-gradient-primary text-white border-none px-4 py-2">
                      <Sparkle className="h-3 w-3 mr-2 inline-block" />
                      AI Premium Access
                    </Badge>
                    <h3 className="text-4xl font-black text-white mb-4">
                      Full Neural Suite
                    </h3>
                    <div className="flex items-baseline justify-center gap-3 mb-2">
                      <span className="text-7xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                        $0
                      </span>
                      <span className="text-slate-400 text-xl">/forever</span>
                    </div>
                    <p className="text-slate-400">
                      No credit card. No trials. Just pure AI power.
                    </p>
                  </div>

                  <div className="space-y-4 mb-8">
                    {pricingFeatures.map((feature, index) => (
                      <div 
                        key={index} 
                        className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="relative">
                          <div className="absolute inset-0 blur-md bg-green-400 opacity-50"></div>
                          <CheckCircle className="h-5 w-5 text-green-400 relative" />
                        </div>
                        <span className="text-slate-200">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    size="lg" 
                    className="w-full bg-gradient-primary hover:opacity-90 text-lg py-7 rounded-xl shadow-2xl shadow-purple-500/50"
                    onClick={() => navigate("/auth")}
                  >
                    <Brain className="mr-2 h-5 w-5" />
                    Activate Your AI Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  
                  <div className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      <span>Enterprise Security</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      <span>Instant Setup</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Brain className="h-3 w-3" />
                      <span>24/7 AI Support</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 bg-slate-950 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <Boxes />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="relative max-w-5xl mx-auto">
            {/* Animated glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-3xl blur-3xl opacity-20 animate-pulse"></div>
            
            <div className="relative bg-gradient-to-br from-purple-900/50 via-slate-900/50 to-cyan-900/50 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-12 md:p-16 text-center">
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-primary/20 border border-purple-500/30 text-purple-300 text-sm mb-6">
                  <Brain className="h-4 w-4" />
                  <span className="font-mono">AI.READY.NOW</span>
                </div>
              </div>
              
              <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
                Your Financial Future
                <span className="block mt-2 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  Starts with AI
                </span>
              </h2>
              
              <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10">
                Join thousands who've transformed their finances with neural-powered intelligence.
                Start your journey in seconds.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  size="lg" 
                  className="bg-white text-slate-900 hover:bg-slate-100 text-lg px-10 py-7 rounded-xl font-bold shadow-2xl"
                  onClick={() => navigate("/auth")}
                >
                  <Zap className="mr-2 h-5 w-5" />
                  Launch AI Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-lg px-10 py-7 rounded-xl border-purple-500/50 bg-transparent text-white hover:bg-purple-500/10"
                >
                  <Bot className="mr-2 h-5 w-5" />
                  Talk to AI
                </Button>
              </div>
              
              <div className="mt-12 flex items-center justify-center gap-8 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                  <span>5,000+ Active Users</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                  <span>99.9% Uptime</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>
                  <span>24/7 AI Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-16 bg-black">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-primary blur-lg opacity-60"></div>
                <div className="relative bg-gradient-primary p-2 rounded-lg">
                  <Brain className="h-5 w-5 text-white" />
                </div>
              </div>
              <div>
                <span className="font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  ExpenseMuse AI
                </span>
                <div className="flex items-center gap-1 -mt-1">
                  <div className="w-1 h-1 rounded-full bg-green-400"></div>
                  <span className="text-[10px] text-slate-500 font-mono">Neural Financial Intelligence</span>
                </div>
              </div>
            </div>
            <p className="text-slate-500 text-sm">
              © 2025 ExpenseMuse AI. Powered by Advanced Neural Networks.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
