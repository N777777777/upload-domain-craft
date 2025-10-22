import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Shield, UserPlus, Globe, Trash2, ArrowLeft, Users } from "lucide-react";

interface Website {
  id: string;
  user_id: string;
  site_name: string;
  file_type: string;
  site_url: string;
  storage_path: string;
  created_at: string;
}

const Admin = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/dashboard");
      toast.error("ليس لديك صلاحيات الوصول لهذه الصفحة");
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchAllWebsites();
    }
  }, [user, isAdmin]);

  const fetchAllWebsites = async () => {
    try {
      const { data, error } = await supabase
        .from("websites")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWebsites(data || []);
    } catch (error: any) {
      console.error("Error fetching websites:", error);
      toast.error("خطأ في تحميل المواقع");
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
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

      toast.success("تم إنشاء المستخدم بنجاح!");
      setEmail("");
      setPassword("");
      setUsername("");
    } catch (error: any) {
      console.error("Create user error:", error);
      if (error.message.includes("already registered")) {
        toast.error("هذا البريد الإلكتروني مسجل مسبقاً");
      } else {
        toast.error("خطأ في إنشاء المستخدم");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWebsite = async (websiteId: string, storagePath: string) => {
    try {
      const { error: storageError } = await supabase.storage
        .from("websites")
        .remove([storagePath]);

      if (storageError) console.error("Storage delete error:", storageError);

      const { error: dbError } = await supabase
        .from("websites")
        .delete()
        .eq("id", websiteId);

      if (dbError) throw dbError;

      toast.success("تم حذف الموقع بنجاح");
      fetchAllWebsites();
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error("خطأ في حذف الموقع");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2 flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              لوحة الإدارة
            </h1>
            <p className="text-muted-foreground">إدارة المستخدمين والمواقع</p>
          </div>
          <Button onClick={() => navigate("/dashboard")} variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            العودة للوحة التحكم
          </Button>
        </div>

        <Card className="shadow-[var(--shadow-elegant)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              إنشاء مستخدم جديد
            </CardTitle>
            <CardDescription>يمكن للأدمن فقط إنشاء حسابات جديدة</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newUsername">اسم المستخدم</Label>
                <Input
                  id="newUsername"
                  type="text"
                  placeholder="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newEmail">البريد الإلكتروني</Label>
                <Input
                  id="newEmail"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">كلمة المرور</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-accent"
              >
                {loading ? "جاري الإنشاء..." : "إنشاء مستخدم"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-[var(--shadow-elegant)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              جميع المواقع المرفوعة ({websites.length})
            </CardTitle>
            <CardDescription>عرض وإدارة جميع مواقع المستخدمين</CardDescription>
          </CardHeader>
          <CardContent>
            {websites.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">لا توجد مواقع مرفوعة</p>
            ) : (
              <div className="space-y-3">
                {websites.map((website) => (
                  <div
                    key={website.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-md transition-all"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{website.site_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        نوع الملف: {website.file_type.toUpperCase()}
                      </p>
                      <a
                        href={website.site_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:text-accent transition-colors"
                      >
                        {website.site_url}
                      </a>
                      <p className="text-xs text-muted-foreground mt-1">
                        تاريخ الرفع: {new Date(website.created_at).toLocaleDateString("ar")}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteWebsite(website.id, website.storage_path)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;