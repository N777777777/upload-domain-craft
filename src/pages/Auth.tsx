import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Eye, EyeOff, Server } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        if (data.user) {
          toast.success("تم تسجيل الدخول بنجاح!");
          navigate("/dashboard");
        }
      } else {
        if (!username.trim()) {
          toast.error("يرجى إدخال اسم المستخدم");
          setLoading(false);
          return;
        }

        const redirectUrl = `${window.location.origin}/dashboard`;
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              username: username,
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          toast.success("تم إنشاء الحساب بنجاح!");
          navigate("/dashboard");
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      
      if (error.message.includes("Invalid login credentials")) {
        toast.error("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      } else if (error.message.includes("User already registered")) {
        toast.error("هذا البريد الإلكتروني مسجل مسبقاً");
      } else if (error.message.includes("Password")) {
        toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      } else {
        toast.error(error.message || "حدث خطأ، يرجى المحاولة مرة أخرى");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-secondary/20 to-background">
      <Card className="w-full max-w-md shadow-[var(--shadow-elegant)]">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
            <Server className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            منصة الاستضافة
          </CardTitle>
          <CardDescription className="text-base">
            {isLogin ? "سجل دخولك للوصول إلى مواقعك" : "أنشئ حساب جديد للبدء"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="username">اسم المستخدم</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required={!isLogin}
                  className="transition-all"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all shadow-lg"
            >
              {loading ? "جاري المعالجة..." : isLogin ? "تسجيل الدخول" : "إنشاء حساب"}
            </Button>

            <div className="text-center text-sm">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary hover:text-accent transition-colors font-medium"
              >
                {isLogin ? "ليس لديك حساب؟ سجل الآن" : "لديك حساب؟ سجل دخولك"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;