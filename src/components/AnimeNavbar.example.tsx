import { AnimeNavBar } from "./AnimeNavbar";
import { LayoutDashboard, BarChart3, DollarSign, PiggyBank, Target, Wallet, TrendingUp, Receipt, Settings } from "lucide-react";

// Example usage of AnimeNavbar
export function AnimeNavbarExample() {
  const navItems = [
    { name: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { name: "Analytics", url: "/analytics", icon: BarChart3 },
    { name: "Expenses", url: "/expenses", icon: DollarSign },
    { name: "Budget", url: "/budget", icon: PiggyBank },
    { name: "Goals", url: "/goals", icon: Target },
    { name: "Wallets", url: "/wallets", icon: Wallet },
    { name: "Income", url: "/income", icon: TrendingUp },
    { name: "Bills", url: "/bills", icon: Receipt },
    { name: "Settings", url: "/settings", icon: Settings },
  ];

  return (
    <div>
      <AnimeNavBar items={navItems} defaultActive="Dashboard" />
      {/* Your page content here */}
      <div className="pt-32 p-8">
        <h1 className="text-3xl font-bold">Your Page Content</h1>
      </div>
    </div>
  );
}
