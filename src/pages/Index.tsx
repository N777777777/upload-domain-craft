import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Server, Zap, Shield, Globe } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16 space-y-6">
          <div className="inline-block p-4 bg-gradient-to-br from-primary to-accent rounded-3xl shadow-[var(--shadow-elegant)] mb-4">
            <Server className="w-16 h-16 text-primary-foreground" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-pulse">
            منصة الاستضافة
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            استضف مواقعك بسهولة وسرعة - ارفع ملفات HTML و ZIP واحصل على رابط فوري
          </p>
          <div className="flex gap-4 justify-center pt-6">
            <Button
              onClick={() => navigate("/auth")}
              size="lg"
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all shadow-lg text-lg px-8"
            >
              ابدأ الآن
            </Button>
            <Button
              onClick={() => navigate("/auth")}
              size="lg"
              variant="outline"
              className="text-lg px-8"
            >
              تسجيل دخول
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="p-6 rounded-2xl border bg-card shadow-lg hover:shadow-[var(--shadow-elegant)] transition-all">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">سرعة فائقة</h3>
            <p className="text-muted-foreground">
              ارفع موقعك واحصل على رابط جاهز في ثوانٍ معدودة
            </p>
          </div>

          <div className="p-6 rounded-2xl border bg-card shadow-lg hover:shadow-[var(--shadow-elegant)] transition-all">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">آمن ومحمي</h3>
            <p className="text-muted-foreground">
              ملفاتك ومواقعك محمية بأعلى معايير الأمان
            </p>
          </div>

          <div className="p-6 rounded-2xl border bg-card shadow-lg hover:shadow-[var(--shadow-elegant)] transition-all">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Globe className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">روابط مخصصة</h3>
            <p className="text-muted-foreground">
              اختر الاسم الذي تريده لرابط موقعك
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
