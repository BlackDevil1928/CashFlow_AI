import { AuthGuard } from "@/components/AuthGuard";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Upload, Send, Phone, Bot, CheckCircle } from "lucide-react";
import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function BillScanner() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [telegramConnected, setTelegramConnected] = useState(false);
  const [telegramUsername, setTelegramUsername] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('bills')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Send notification via Telegram
      if (telegramConnected && telegramUsername) {
        await sendTelegramNotification(fileName);
      }

      toast.success("Bill uploaded successfully!");
      setSelectedFile(null);
      setPreview("");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload bill");
    } finally {
      setUploading(false);
    }
  };

  const sendTelegramNotification = async (fileName: string) => {
    try {
      // This would integrate with your Telegram bot
      // For now, we'll simulate it
      const botToken = "YOUR_TELEGRAM_BOT_TOKEN"; // Replace with actual bot token
      const chatId = telegramUsername;
      
      const message = `🧾 New bill uploaded!\n\nFile: ${fileName}\nTime: ${new Date().toLocaleString()}\n\nCheck your CashFlow AI dashboard for details.`;
      
      // Note: In production, you should use a backend endpoint for security
      // This is just a placeholder
      console.log("Would send to Telegram:", message);
      toast.success("Telegram notification sent!");
    } catch (error) {
      console.error("Failed to send Telegram notification:", error);
    }
  };

  const connectTelegram = () => {
    if (telegramUsername) {
      setTelegramConnected(true);
      toast.success("Telegram connected! You'll receive notifications for new uploads.");
    }
  };

  const callAgent = () => {
    // This would initiate a call to your voice agent
    const agentNumber = "+1-800-EXPENSE"; // Example number
    toast.info(`Dial ${agentNumber} to add expenses via voice!`, {
      duration: 5000,
    });
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="container mx-auto px-4 py-8 space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Bill Scanner & <span className="bg-gradient-primary bg-clip-text text-transparent">Voice Agent</span>
            </h1>
            <p className="text-muted-foreground">
              Scan receipts, get Telegram updates, or call our AI agent
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Photo Upload Section */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Upload Bill Photo
                </CardTitle>
                <CardDescription>
                  Take a photo or upload an image of your bill/receipt
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {preview && (
                  <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden">
                    <img 
                      src={preview} 
                      alt="Preview" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => cameraInputRef.current?.click()}
                  >
                    <Camera className="h-4 w-4" />
                    Take Photo
                  </Button>
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleFileSelect}
                  />

                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4" />
                    Upload File
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </div>

                {selectedFile && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Selected: {selectedFile.name}
                    </p>
                    <Button
                      onClick={handleUpload}
                      disabled={uploading}
                      className="w-full bg-gradient-primary hover:opacity-90"
                    >
                      {uploading ? "Uploading..." : "Upload Bill"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Telegram Integration */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Telegram Notifications
                </CardTitle>
                <CardDescription>
                  Get instant notifications when bills are uploaded
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!telegramConnected ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="telegram">Telegram Username or Chat ID</Label>
                      <Input
                        id="telegram"
                        placeholder="@username or chat_id"
                        value={telegramUsername}
                        onChange={(e) => setTelegramUsername(e.target.value)}
                      />
                    </div>

                    <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
                      <p className="font-semibold">How to connect:</p>
                      <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                        <li>Search for @CashFlowAI_Bot on Telegram</li>
                        <li>Start a chat with the bot</li>
                        <li>Send /start command</li>
                        <li>Enter your username or chat ID here</li>
                      </ol>
                    </div>

                    <Button
                      onClick={connectTelegram}
                      disabled={!telegramUsername}
                      className="w-full bg-gradient-primary hover:opacity-90"
                    >
                      Connect Telegram
                    </Button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2 p-4 bg-green-500/10 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-green-500 font-medium">
                        Telegram Connected!
                      </span>
                    </div>
                    <p className="text-sm text-center text-muted-foreground">
                      You'll receive notifications at {telegramUsername}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setTelegramConnected(false)}
                      className="w-full"
                    >
                      Disconnect
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Voice Calling Agent */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Voice Calling Agent
              </CardTitle>
              <CardDescription>
                Call our AI agent to add expenses hands-free
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-primary p-4 rounded-full">
                      <Bot className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">AI Voice Assistant</h3>
                      <p className="text-sm text-muted-foreground">
                        Available 24/7 for expense tracking
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm font-medium">Agent Number:</span>
                      <span className="text-lg font-bold text-primary">+1-800-EXPENSE</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm font-medium">Alternative:</span>
                      <span className="text-lg font-bold text-primary">+1-800-228-3973</span>
                    </div>
                  </div>

                  <Button
                    onClick={callAgent}
                    className="w-full bg-gradient-primary hover:opacity-90 gap-2"
                    size="lg"
                  >
                    <Phone className="h-5 w-5" />
                    Get Call Instructions
                  </Button>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 p-6 rounded-lg border">
                  <h4 className="font-semibold mb-3">How it works:</h4>
                  <ol className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs">
                        1
                      </span>
                      <span>Call the agent number</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs">
                        2
                      </span>
                      <span>Tell the AI your expense details</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs">
                        3
                      </span>
                      <span>AI confirms and saves to your account</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs">
                        4
                      </span>
                      <span>Check your dashboard for the entry</span>
                    </li>
                  </ol>
                  
                  <div className="mt-4 p-3 bg-white/50 dark:bg-black/20 rounded">
                    <p className="text-xs text-muted-foreground">
                      <strong>Example:</strong> "Hi, I spent $45.50 on groceries at Whole Foods today."
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500/10 p-2 rounded-lg">
                  <Camera className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Instant Scan</h3>
                  <p className="text-sm text-muted-foreground">
                    Capture bills instantly
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-500/10 p-2 rounded-lg">
                  <Send className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Auto Notify</h3>
                  <p className="text-sm text-muted-foreground">
                    Telegram alerts enabled
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-purple-500/10 p-2 rounded-lg">
                  <Phone className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Voice Ready</h3>
                  <p className="text-sm text-muted-foreground">
                    Call anytime, anywhere
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
