import { AuthGuard } from "@/components/AuthGuard";
import { Navbar } from "@/components/Navbar";
import { WalletManager } from "@/components/WalletManager";

export default function Wallets() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <WalletManager />
        </main>
      </div>
    </AuthGuard>
  );
}
