import { AuthGuard } from "@/components/AuthGuard";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, AlertCircle, CheckCircle, Calendar, DollarSign, Bell, FileText, CreditCard } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useBills } from '@/hooks/useBills';

const CATEGORY_ICONS: Record<string, string> = {
  utility: '💡',
  rent: '🏠',
  insurance: '🛡️',
  loan: '🏦',
  subscription: '📱',
  emi: '💳',
  other: '📄',
};

export default function Bills() {
  const { bills, loading, reminders, pendingBills, overdueBills, totalPending, totalOverdue, addBill, markAsPaid, deleteBill } = useBills();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [newRecurrence, setNewRecurrence] = useState<'one_time' | 'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [newCategory, setNewCategory] = useState('utility');
  const [reminderDays, setReminderDays] = useState("3");

  const handleAddBill = async () => {
    if (!newName || !newAmount || !newDueDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await addBill(
        newName,
        parseFloat(newAmount),
        newDueDate,
        newRecurrence,
        newCategory,
        parseInt(reminderDays)
      );

      setNewName("");
      setNewAmount("");
      setNewDueDate("");
      setNewRecurrence('monthly');
      setNewCategory('utility');
      setReminderDays("3");
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error in handleAddBill:', error);
    }
  };

  const handleMarkPaid = async (id: string) => {
    await markAsPaid(id);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this bill?')) {
      await deleteBill(id);
    }
  };

  const formatDueDate = (dueDate: string) => {
    return new Date(dueDate).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getDaysUntilDue = (dueDate: string) => {
    const days = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="container mx-auto px-4 py-8 space-y-8">
          <div className="flex justify-between items-start animate-fade-in">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                <span className="bg-gradient-primary bg-clip-text text-transparent">Bills</span> & EMIs
              </h1>
              <p className="text-muted-foreground">
                Track your recurring payments and never miss a due date
              </p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-primary hover:opacity-90">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Bill
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Bill/EMI</DialogTitle>
                  <DialogDescription>
                    Set up a new bill or EMI payment to track
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Bill Name</Label>
                    <Input
                      id="name"
                      placeholder="Electricity Bill, Home Loan EMI, etc."
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (₹)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="2500"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recurrence">Frequency</Label>
                    <Select value={newRecurrence} onValueChange={(v: any) => setNewRecurrence(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="one_time">One Time</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={newCategory} onValueChange={setNewCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="utility">Utility</SelectItem>
                        <SelectItem value="rent">Rent</SelectItem>
                        <SelectItem value="insurance">Insurance</SelectItem>
                        <SelectItem value="loan">Loan</SelectItem>
                        <SelectItem value="subscription">Subscription</SelectItem>
                        <SelectItem value="emi">EMI</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reminder">Remind Me (days before)</Label>
                    <Input
                      id="reminder"
                      type="number"
                      placeholder="3"
                      value={reminderDays}
                      onChange={(e) => setReminderDays(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleAddBill} className="w-full">
                    Add Bill
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Reminders */}
          {reminders.length > 0 && (
            <div className="space-y-3 animate-fade-in">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Upcoming & Overdue
              </h2>
              {reminders.map((reminder) => (
                <Alert 
                  key={reminder.billId} 
                  variant={reminder.urgency === 'critical' ? 'destructive' : 'default'}
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{reminder.billName}</strong> - ₹{reminder.amount.toLocaleString()}
                    {reminder.daysUntilDue < 0 
                      ? ` - Overdue by ${Math.abs(reminder.daysUntilDue)} days`
                      : ` - Due in ${reminder.daysUntilDue} days`}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-scale-in">
            <Card className="shadow-elegant hover-lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{bills.length}</div>
                <p className="text-xs text-muted-foreground">Active bills</p>
              </CardContent>
            </Card>

            <Card className="shadow-elegant hover-lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingBills.length}</div>
                <p className="text-xs text-muted-foreground">₹{totalPending.toLocaleString()}</p>
              </CardContent>
            </Card>

            <Card className="shadow-elegant hover-lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">{overdueBills.length}</div>
                <p className="text-xs text-muted-foreground">₹{totalOverdue.toLocaleString()}</p>
              </CardContent>
            </Card>

            <Card className="shadow-elegant hover-lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{totalPending.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Total due</p>
              </CardContent>
            </Card>
          </div>

          {/* Bills List */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">All Bills</h2>
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading bills...</div>
            ) : bills.length === 0 ? (
              <Card className="shadow-elegant">
                <CardContent className="py-12 text-center">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">No bills added yet</p>
                  <Button onClick={() => setIsDialogOpen(true)} className="bg-gradient-primary">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Your First Bill
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {bills.map((bill) => {
                  const daysUntil = getDaysUntilDue(bill.due_date);
                  const isOverdue = daysUntil < 0 && bill.status === 'pending';
                  const isDueSoon = daysUntil >= 0 && daysUntil <= 3 && bill.status === 'pending';

                  return (
                    <Card key={bill.id} className="shadow-elegant hover-lift">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="text-3xl">{CATEGORY_ICONS[bill.category] || '📄'}</div>
                            <div>
                              <CardTitle>{bill.name}</CardTitle>
                              <CardDescription className="capitalize">
                                {bill.recurrence.replace('_', ' ')} • {bill.category}
                              </CardDescription>
                            </div>
                          </div>
                          {bill.status === 'paid' ? (
                            <Badge className="bg-green-500">Paid</Badge>
                          ) : isOverdue ? (
                            <Badge variant="destructive">Overdue</Badge>
                          ) : isDueSoon ? (
                            <Badge variant="secondary" className="bg-yellow-500 text-white">Due Soon</Badge>
                          ) : (
                            <Badge variant="outline">Pending</Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-muted-foreground">Amount</p>
                            <p className="text-2xl font-bold">₹{bill.amount.toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Due Date</p>
                            <p className="font-semibold">{formatDueDate(bill.due_date)}</p>
                            {bill.status === 'pending' && (
                              <p className={`text-xs ${isOverdue ? 'text-red-500' : isDueSoon ? 'text-yellow-500' : 'text-muted-foreground'}`}>
                                {isOverdue 
                                  ? `${Math.abs(daysUntil)} days overdue`
                                  : `${daysUntil} days remaining`}
                              </p>
                            )}
                          </div>
                        </div>

                        {bill.auto_debit && (
                          <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                            <CheckCircle className="h-4 w-4" />
                            <span>Auto-pay enabled</span>
                          </div>
                        )}

                        <div className="flex gap-2">
                          {bill.status === 'pending' && (
                            <Button 
                              onClick={() => handleMarkPaid(bill.id)} 
                              className="flex-1"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark as Paid
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            onClick={() => handleDelete(bill.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
