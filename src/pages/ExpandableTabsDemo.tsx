import { AuthGuard } from "@/components/AuthGuard";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpandableTabs } from "@/components/ui/expandable-tabs";
import { 
  Bell, 
  Home, 
  HelpCircle, 
  Settings, 
  Shield, 
  Mail, 
  User, 
  FileText, 
  Lock,
  LayoutDashboard,
  BarChart3,
  DollarSign,
  PiggyBank,
  Target,
  Wallet,
  TrendingUp,
  Receipt
} from "lucide-react";
import { useState } from "react";

export default function ExpandableTabsDemo() {
  const [selectedDefault, setSelectedDefault] = useState<number | null>(null);
  const [selectedCustom, setSelectedCustom] = useState<number | null>(null);
  const [selectedFinancial, setSelectedFinancial] = useState<number | null>(null);

  const defaultTabs = [
    { title: "Dashboard", icon: Home },
    { title: "Notifications", icon: Bell },
    { type: "separator" as const },
    { title: "Settings", icon: Settings },
    { title: "Support", icon: HelpCircle },
    { title: "Security", icon: Shield },
  ];

  const customColorTabs = [
    { title: "Profile", icon: User },
    { title: "Messages", icon: Mail },
    { type: "separator" as const },
    { title: "Documents", icon: FileText },
    { title: "Privacy", icon: Lock },
  ];

  const financialTabs = [
    { title: "Dashboard", icon: LayoutDashboard },
    { title: "Analytics", icon: BarChart3 },
    { title: "Expenses", icon: DollarSign },
    { type: "separator" as const },
    { title: "Budget", icon: PiggyBank },
    { title: "Goals", icon: Target },
    { title: "Wallets", icon: Wallet },
    { type: "separator" as const },
    { title: "Income", icon: TrendingUp },
    { title: "Bills", icon: Receipt },
  ];

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="container mx-auto px-4 py-8 space-y-8">
          <div className="animate-fade-in">
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-primary bg-clip-text text-transparent">Expandable Tabs</span>
            </h1>
            <p className="text-muted-foreground">
              Interactive expandable tabs with smooth animations
            </p>
          </div>

          {/* Default Example */}
          <Card className="shadow-elegant animate-scale-in">
            <CardHeader>
              <CardTitle>Default Expandable Tabs</CardTitle>
              <CardDescription>
                Click on any tab to expand and see the label. Click outside to collapse.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ExpandableTabs 
                tabs={defaultTabs} 
                onChange={(index) => setSelectedDefault(index)}
              />
              {selectedDefault !== null && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm">
                    Selected: <strong>{defaultTabs[selectedDefault]?.title || "None"}</strong>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Custom Color Example */}
          <Card className="shadow-elegant animate-scale-in" style={{ animationDelay: "0.1s" }}>
            <CardHeader>
              <CardTitle>Custom Color Tabs</CardTitle>
              <CardDescription>
                Tabs with custom active color and border styling
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ExpandableTabs 
                tabs={customColorTabs} 
                activeColor="text-blue-500"
                className="border-blue-200 dark:border-blue-800"
                onChange={(index) => setSelectedCustom(index)}
              />
              {selectedCustom !== null && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    Selected: <strong>{customColorTabs[selectedCustom]?.title || "None"}</strong>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Financial App Integration Example */}
          <Card className="shadow-elegant animate-scale-in" style={{ animationDelay: "0.2s" }}>
            <CardHeader>
              <CardTitle>CashFlow AI Navigation</CardTitle>
              <CardDescription>
                Expandable tabs integrated with your financial management sections
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ExpandableTabs 
                tabs={financialTabs} 
                activeColor="text-purple-500"
                className="border-purple-200 dark:border-purple-800"
                onChange={(index) => setSelectedFinancial(index)}
              />
              {selectedFinancial !== null && (
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-lg border border-purple-200 dark:border-purple-800">
                  <p className="text-sm">
                    Navigate to: <strong>{financialTabs[selectedFinancial]?.title || "None"}</strong>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    This could trigger navigation or filter content in your app
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Features Card */}
          <Card className="shadow-elegant animate-scale-in" style={{ animationDelay: "0.3s" }}>
            <CardHeader>
              <CardTitle>Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span><strong>Click to Expand:</strong> Tabs expand on click to show full labels</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span><strong>Outside Click Detection:</strong> Automatically collapses when clicking outside</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span><strong>Smooth Animations:</strong> Spring-based transitions with framer-motion</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span><strong>Separators:</strong> Visual separators to group related tabs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span><strong>Custom Colors:</strong> Customizable active state colors</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span><strong>Responsive:</strong> Works on all screen sizes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span><strong>Accessible:</strong> Keyboard navigation support</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Usage Example */}
          <Card className="shadow-elegant animate-scale-in" style={{ animationDelay: "0.4s" }}>
            <CardHeader>
              <CardTitle>Usage Example</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
{`import { ExpandableTabs } from "@/components/ui/expandable-tabs";
import { Home, Settings, Bell } from "lucide-react";

const tabs = [
  { title: "Home", icon: Home },
  { title: "Settings", icon: Settings },
  { type: "separator" },
  { title: "Notifications", icon: Bell },
];

<ExpandableTabs 
  tabs={tabs}
  activeColor="text-purple-500"
  onChange={(index) => console.log("Selected:", index)}
/>`}
              </pre>
            </CardContent>
          </Card>
        </main>
      </div>
    </AuthGuard>
  );
}
