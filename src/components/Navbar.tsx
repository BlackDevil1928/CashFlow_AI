import { Moon, Sun, LogOut, Wallet, LayoutDashboard, BarChart3, Target, Settings as SettingsIcon, PiggyBank, TrendingUp, Receipt, IndianRupee, DollarSign, Sparkles, Menu, X, ScanLine, ChevronDown, Layers, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      navigate("/auth");
    } catch (error: any) {
      toast.error("Failed to log out");
    }
  };

  const mainNavItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/analytics", label: "Analytics", icon: BarChart3 },
    { path: "/expenses", label: "Expenses", icon: DollarSign },
    { path: "/budget", label: "Budget", icon: PiggyBank },
    { path: "/goals", label: "Goals", icon: Target },
    { path: "/bills", label: "Bills", icon: Receipt },
  ];

  const moreFeatures = [
    { path: "/wallets", label: "Wallets", icon: Wallet, description: "Manage accounts" },
    { path: "/income", label: "Income", icon: TrendingUp, description: "Track earnings" },
    { path: "/bill-scanner", label: "Bill Scanner", icon: ScanLine, description: "Scan & upload bills" },
    { path: "/financial-guidance", label: "Financial Guidance", icon: IndianRupee, description: "AI learning & tips" },
    { path: "/redemption", label: "Rewards Center", icon: Trophy, description: "Redeem points & vouchers" },
    { path: "/settings", label: "Settings", icon: SettingsIcon, description: "App preferences" },
  ];

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="bg-card/50 backdrop-blur-sm sticky top-0 z-50"
    >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-2 group relative">
              <motion.div 
                className="relative"
                whileHover={{ 
                  scale: 1.1,
                  rotate: [0, -10, 10, -10, 10, 0],
                  transition: { duration: 0.5 }
                }}
                animate={{
                  y: [0, -5, 0],
                }}
                transition={{
                  y: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
              >
                {/* Animated glow layers */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-primary blur-2xl"
                  animate={{ 
                    scale: [1, 1.4, 1],
                    opacity: [0.4, 0.8, 0.4],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 blur-xl"
                  animate={{ 
                    scale: [1.2, 1, 1.2],
                    opacity: [0.3, 0.6, 0.3],
                    rotate: [360, 180, 0]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                <motion.div 
                  className="relative bg-gradient-primary p-2 rounded-lg"
                  whileHover={{
                    boxShadow: "0 0 30px rgba(168, 85, 247, 0.6)"
                  }}
                >
                  <motion.div
                    animate={{
                      rotate: [0, 360]
                    }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  >
                    <IndianRupee className="h-6 w-6 text-white" />
                  </motion.div>
                </motion.div>
                
                {/* Orbiting particles */}
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-cyan-400 rounded-full"
                    animate={{
                      x: [0, 20 * Math.cos((i * 2 * Math.PI) / 3), 0],
                      y: [0, 20 * Math.sin((i * 2 * Math.PI) / 3), 0],
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.3,
                      ease: "easeInOut"
                    }}
                    style={{
                      top: '50%',
                      left: '50%'
                    }}
                  />
                ))}
              </motion.div>
              <div className="flex flex-col">
                <motion.span 
                  className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent leading-tight"
                  animate={{ 
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  style={{ backgroundSize: '200% 200%' }}
                >
                  CashFlow AI
                </motion.span>
                <div className="flex items-center gap-1">
                  <motion.div 
                    className="w-1 h-1 rounded-full bg-green-400"
                    animate={{ 
                      scale: [1, 1.5, 1],
                      opacity: [1, 0.5, 1]
                    }}
                    transition={{ 
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <span className="text-[10px] text-green-400 font-mono uppercase tracking-wide">Neural Active</span>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="h-2 w-2 text-green-400" />
                  </motion.div>
                </div>
              </div>
            </Link>

            {/* Navigation Links - Hidden on mobile */}
            <div className="hidden lg:flex items-center gap-1">
              {mainNavItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || location.pathname === "/" && item.path === "/dashboard";
                
                return (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    onMouseEnter={() => setHoveredItem(item.path)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <Link to={item.path}>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant="ghost"
                          className={cn(
                            "gap-2 relative overflow-hidden",
                            isActive && "bg-accent text-accent-foreground"
                          )}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="navbar-active"
                              className="absolute inset-0 bg-gradient-primary/10 rounded-md"
                              initial={false}
                              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                          )}
                          <motion.div
                            animate={hoveredItem === item.path ? { rotate: [0, -10, 10, 0] } : {}}
                            transition={{ duration: 0.3 }}
                          >
                            <Icon className="h-4 w-4 relative z-10" />
                          </motion.div>
                          <span className="relative z-10">{item.label}</span>
                          {hoveredItem === item.path && (
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: "100%" }}
                              className="absolute bottom-0 left-0 h-0.5 bg-gradient-primary"
                            />
                          )}
                        </Button>
                      </motion.div>
                    </Link>
                  </motion.div>
                );
              })}
              
              {/* More Features Dropdown */}
              <motion.div
                className="relative"
                onMouseEnter={() => setMoreMenuOpen(true)}
                onMouseLeave={() => setMoreMenuOpen(false)}
              >
                <Button
                  variant="ghost"
                  className="gap-2"
                >
                  <Layers className="h-4 w-4" />
                  More Features
                  <motion.div
                    animate={{ rotate: moreMenuOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.div>
                </Button>

                <AnimatePresence>
                  {moreMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full right-0 mt-2 w-72 bg-card border rounded-lg shadow-xl overflow-hidden z-50"
                    >
                      <div className="bg-gradient-primary p-3">
                        <h3 className="text-white font-semibold text-sm">More Features</h3>
                        <p className="text-white/80 text-xs">Explore additional tools</p>
                      </div>
                      <div className="p-2">
                        {moreFeatures.map((item, index) => {
                          const Icon = item.icon;
                          const isActive = location.pathname === item.path;
                          
                          return (
                            <Link
                              key={item.path}
                              to={item.path}
                              onClick={() => setMoreMenuOpen(false)}
                            >
                              <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ x: 4 }}
                                className={cn(
                                  "flex items-start gap-3 p-3 rounded-lg transition-colors",
                                  isActive
                                    ? "bg-gradient-primary/10"
                                    : "hover:bg-accent"
                                )}
                              >
                                <div className={cn(
                                  "p-2 rounded-lg",
                                  isActive ? "bg-gradient-primary" : "bg-primary/10"
                                )}>
                                  <Icon className={cn(
                                    "h-4 w-4",
                                    isActive ? "text-white" : "text-primary"
                                  )} />
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-sm">{item.label}</div>
                                  <div className="text-xs text-muted-foreground">{item.description}</div>
                                </div>
                                {isActive && (
                                  <motion.div
                                    layoutId="more-active"
                                    className="w-1 h-full bg-gradient-primary rounded-full"
                                  />
                                )}
                              </motion.div>
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile menu button */}
            <Button
              variant="outline"
              size="icon"
              className="lg:hidden rounded-full"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* Desktop buttons */}
            <motion.div
              className="hidden lg:block"
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button
                variant="outline"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-full relative overflow-hidden"
              >
                <AnimatePresence mode="wait">
                  {theme === "dark" ? (
                    <motion.div
                      key="sun"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Sun className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Moon className="h-5 w-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
            
            <motion.div
              className="hidden lg:block"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button
                variant="outline"
                size="icon"
                onClick={handleLogout}
                className="rounded-full relative group"
                title="Logout"
              >
                <motion.div
                  whileHover={{ x: 2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <LogOut className="h-5 w-5" />
                </motion.div>
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1.5, opacity: 0.2 }}
                  className="absolute inset-0 bg-red-500 rounded-full"
                />
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t bg-card/95 backdrop-blur-sm"
            >
              <div className="container mx-auto px-4 py-4 space-y-2">
                {/* Main navigation items */}
                {mainNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path || location.pathname === "/" && item.path === "/dashboard";
                  
                  return (
                    <Link 
                      key={item.path} 
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        className="w-full justify-start gap-3"
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Button>
                    </Link>
                  );
                })}
                
                {/* More features section in mobile */}
                <div className="pt-2 mt-2 border-t">
                  <p className="text-xs text-muted-foreground px-3 py-2 font-semibold">More Features</p>
                  {moreFeatures.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    
                    return (
                      <Link 
                        key={item.path} 
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Button
                          variant={isActive ? "default" : "ghost"}
                          className="w-full justify-start gap-3"
                        >
                          <Icon className="h-5 w-5" />
                          <div className="flex flex-col items-start">
                            <span className="text-sm">{item.label}</span>
                            <span className="text-xs opacity-70">{item.description}</span>
                          </div>
                        </Button>
                      </Link>
                    );
                  })}
                </div>
                
                <div className="pt-4 border-t flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="rounded-full flex-1"
                  >
                    {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    className="rounded-full flex-1 gap-2"
                  >
                    <LogOut className="h-5 w-5" />
                    Logout
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
  );
};
