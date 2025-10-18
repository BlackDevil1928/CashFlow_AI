import { AuthGuard } from "@/components/AuthGuard";
import { Navbar } from "@/components/Navbar";
import { IncomeTracker } from "@/components/IncomeTracker";

export default function Income() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <IncomeTracker />
        </main>
      </div>
    </AuthGuard>
  );
}
