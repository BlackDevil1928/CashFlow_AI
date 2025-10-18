import { AuthGuard } from "@/components/AuthGuard";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Bell, Globe, Palette, Lock, LogOut, Mail, Save, Download, Upload, FileText, Database } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { 
  fetchAllUserData, 
  exportToJSON, 
  exportExpensesToCSV, 
  exportIncomeToCSV, 
  exportSummaryReport,
  importFromJSON 
} from "@/lib/export-utils";

export default function Settings() {
  const navigate = useNavigate();
  const { theme: systemTheme, setTheme: setSystemTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [language, setLanguage] = useState("en");
  
  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [goalReminders, setGoalReminders] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);
  const [exporting, setExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user data
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        setEmail(user.email || "");
        setFullName(user.user_metadata?.full_name || "");
        
        // Load preferences from user metadata
        const metadata = user.user_metadata || {};
        setCurrency(metadata.currency || "INR");
        setLanguage(metadata.language || "en");
        setEmailNotifications(metadata.email_notifications !== false);
        setBudgetAlerts(metadata.budget_alerts !== false);
        setGoalReminders(metadata.goal_reminders !== false);
        setWeeklyReports(metadata.weekly_reports || false);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      });

      if (error) throw error;
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    }
  };

  const handleSavePreferences = async () => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          currency,
          language,
          email_notifications: emailNotifications,
          budget_alerts: budgetAlerts,
          goal_reminders: goalReminders,
          weekly_reports: weeklyReports
        }
      });

      if (error) throw error;
      
      // Also update theme
      if (setSystemTheme) {
        localStorage.setItem('theme-preference', systemTheme || 'system');
      }
      
      toast.success("Preferences saved successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to save preferences");
    }
  };

  const handleChangePassword = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`
      });
      
      if (error) throw error;
      toast.success("Password reset email sent! Check your inbox.");
    } catch (error: any) {
      toast.error(error.message || "Failed to send password reset email");
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = confirm(
      "Are you absolutely sure? This will permanently delete your account and all associated data. This action cannot be undone."
    );
    
    if (!confirmed) return;

    const doubleConfirm = confirm(
      "Last chance! Type 'DELETE' in the prompt to confirm."
    );

    if (!doubleConfirm) return;

    try {
      // Delete user data from all tables
      const { error: deleteError } = await supabase.rpc('delete_user_data', { user_id: userId });
      
      if (deleteError) {
        console.error('Error deleting user data:', deleteError);
      }

      // Sign out
      await supabase.auth.signOut();
      toast.success("Account deleted successfully");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete account");
    }
  };

  const handleExportJSON = async () => {
    try {
      setExporting(true);
      const data = await fetchAllUserData();
      exportToJSON(data);
      toast.success("Data exported successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to export data");
    } finally {
      setExporting(false);
    }
  };

  const handleExportCSV = async (type: 'expenses' | 'income') => {
    try {
      setExporting(true);
      const data = await fetchAllUserData();
      
      if (type === 'expenses') {
        exportExpensesToCSV(data.expenses);
      } else {
        exportIncomeToCSV(data.income);
      }
      
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} exported to CSV!`);
    } catch (error: any) {
      toast.error(error.message || "Failed to export data");
    } finally {
      setExporting(false);
    }
  };

  const handleExportSummary = async () => {
    try {
      setExporting(true);
      const data = await fetchAllUserData();
      exportSummaryReport(data);
      toast.success("Summary report exported!");
    } catch (error: any) {
      toast.error(error.message || "Failed to export summary");
    } finally {
      setExporting(false);
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const result = await importFromJSON(text);
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to import data");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
      navigate("/auth");
    } catch (error: any) {
      toast.error("Error signing out: " + error.message);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="container mx-auto px-4 py-8 space-y-8 max-w-4xl">
          <div className="animate-fade-in">
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-primary bg-clip-text text-transparent">Settings</span>
            </h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>

          {/* Profile Section */}
          <Card className="shadow-elegant">
            <CardHeader>
              <div className="flex items-center gap-3">
                <User className="h-5 w-5" />
                <div>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal information</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-2xl">JD</AvatarFallback>
                </Avatar>
                <Button variant="outline">Change Avatar</Button>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="flex gap-2">
                    <Mail className="h-4 w-4 mt-3 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveProfile} className="bg-gradient-primary hover:opacity-90">
                <Save className="mr-2 h-4 w-4" />
                Save Profile
              </Button>
            </CardContent>
          </Card>

          {/* Preferences Section */}
          <Card className="shadow-elegant">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5" />
                <div>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>Customize your experience</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="JPY">JPY (¥)</SelectItem>
                      <SelectItem value="CAD">CAD (C$)</SelectItem>
                      <SelectItem value="AUD">AUD (A$)</SelectItem>
                      <SelectItem value="INR">INR (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="ja">日本語</SelectItem>
                      <SelectItem value="zh">中文</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select value={systemTheme} onValueChange={(value: any) => setSystemTheme?.(value)}>
                  <SelectTrigger id="theme">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSavePreferences} variant="outline">
                <Save className="mr-2 h-4 w-4" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>

          {/* Notifications Section */}
          <Card className="shadow-elegant">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5" />
                <div>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Manage your notification preferences</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email updates about your account
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Budget Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when approaching budget limits
                  </p>
                </div>
                <Switch
                  checked={budgetAlerts}
                  onCheckedChange={setBudgetAlerts}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Goal Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Reminders about your savings goals
                  </p>
                </div>
                <Switch
                  checked={goalReminders}
                  onCheckedChange={setGoalReminders}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Weekly Reports</Label>
                  <p className="text-sm text-muted-foreground">
                    Get weekly spending summary emails
                  </p>
                </div>
                <Switch
                  checked={weeklyReports}
                  onCheckedChange={setWeeklyReports}
                />
              </div>
            </CardContent>
          </Card>

          {/* Data Export & Backup */}
          <Card className="shadow-elegant">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5" />
                <div>
                  <CardTitle>Data Export & Backup</CardTitle>
                  <CardDescription>Export or import your financial data</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Export Options</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    className="justify-start"
                    onClick={handleExportJSON}
                    disabled={exporting}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export All Data (JSON)
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="justify-start"
                    onClick={() => handleExportCSV('expenses')}
                    disabled={exporting}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Export Expenses (CSV)
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="justify-start"
                    onClick={() => handleExportCSV('income')}
                    disabled={exporting}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Export Income (CSV)
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="justify-start"
                    onClick={handleExportSummary}
                    disabled={exporting}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Export Summary Report
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm font-medium">Import Data</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                />
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Import from JSON
                </Button>
                <p className="text-xs text-muted-foreground">
                  Import previously exported data. Duplicate entries will be skipped.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Security Section */}
          <Card className="shadow-elegant">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5" />
                <div>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>Manage your account security</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start" onClick={handleChangePassword}>
                <Lock className="mr-2 h-4 w-4" />
                Change Password
              </Button>
              
              <div className="rounded-lg border p-4 space-y-2">
                <p className="text-sm font-medium">Account ID</p>
                <p className="text-xs text-muted-foreground font-mono break-all">{userId}</p>
              </div>

              <Separator />

              <Button
                variant="destructive"
                className="w-full justify-start"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="shadow-elegant border-red-200 dark:border-red-900">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-500">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Delete Account</p>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all data
                  </p>
                </div>
                <Button variant="destructive" onClick={handleDeleteAccount}>Delete Account</Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </AuthGuard>
  );
}
