import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Shield } from "lucide-react";

const Setup = () => {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminExists();
  }, []);

  const checkAdminExists = async () => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*")
        .eq("role", "admin")
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        navigate("/");
        toast.error("النظام تم إعداده مسبقاً");
      }
    } catch (error) {
      console.error("Error checking admin:", error);
    } finally {
      setChecking(false);
    }
  };

  const createFirstAdmin = async () => {
    setLoading(true);

    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: "admin@hosting.com",
        password: "bot123",
        options: {
          data: {
            username: "bto123"
          }
        }
      });

      if (signUpError) throw signUpError;

      if (signUpData.user) {
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({
            user_id: signUpData.user.id,
            role: "admin"
          });

        if (roleError) throw roleError;

        toast.success("تم إنشاء حساب الأدمن بنجاح!");
        
        await supabase.auth.signOut();
        
        navigate("/auth");
      }
    } catch (error: any) {
      console.error("Setup error:", error);
      toast.error(error.message || "حدث خطأ في الإعداد");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحقق...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-secondary/20 to-background">
      <Card className="w-full max-w-md shadow-[var(--shadow-elegant)]">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            إعداد أول مرة
          </CardTitle>
          <CardDescription className="text-base">
            إنشاء حساب الأدمن الأول للنظام
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-secondary/50 p-4 rounded-lg space-y-2">
            <p className="font-semibold">بيانات الأدمن:</p>
            <p className="text-sm">اسم المستخدم: bto123</p>
            <p className="text-sm">البريد: admin@hosting.com</p>
            <p className="text-sm">كلمة المرور: bot123</p>
          </div>

          <Button
            onClick={createFirstAdmin}
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all shadow-lg"
          >
            {loading ? "جاري الإنشاء..." : "إنشاء حساب الأدمن"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Setup;
