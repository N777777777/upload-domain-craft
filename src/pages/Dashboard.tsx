import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, LogOut, Shield, Globe, Trash2 } from "lucide-react";

interface Website {
  id: string;
  site_name: string;
  file_type: string;
  site_url: string;
  storage_path: string;
  created_at: string;
}

const Dashboard = () => {
  const { user, session, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [uploading, setUploading] = useState(false);
  const [siteName, setSiteName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchWebsites();
    }
  }, [user]);

  const fetchWebsites = async () => {
    try {
      const { data, error } = await supabase
        .from("websites")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWebsites(data || []);
    } catch (error: any) {
      console.error("Error fetching websites:", error);
      toast.error("خطأ في تحميل المواقع");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["text/html", "application/zip", "application/x-zip-compressed"];
    if (!validTypes.includes(file.type) && !file.name.endsWith(".html") && !file.name.endsWith(".zip")) {
      toast.error("يُسمح فقط بملفات HTML و ZIP");
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile || !siteName.trim()) {
      toast.error("يرجى اختيار ملف وإدخال اسم الموقع");
      return;
    }

    setUploading(true);

    try {
      const fileExt = selectedFile.name.split(".").pop()?.toLowerCase();
      const fileName = `${user?.id}/${siteName}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("websites")
        .upload(fileName, selectedFile, {
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("websites")
        .getPublicUrl(fileName);

      const siteUrl = `${window.location.origin}/site/${siteName}`;

      const { error: dbError } = await supabase.from("websites").insert({
        user_id: user?.id,
        site_name: siteName,
        file_type: fileExt || "unknown",
        storage_path: fileName,
        site_url: siteUrl,
      });

      if (dbError) throw dbError;

      toast.success("تم رفع الموقع بنجاح!");
      setSiteName("");
      setSelectedFile(null);
      fetchWebsites();
    } catch (error: any) {
      console.error("Upload error:", error);
      if (error.message.includes("duplicate")) {
        toast.error("اسم الموقع موجود مسبقاً، اختر اسماً آخر");
      } else {
        toast.error("خطأ في رفع الملف");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (websiteId: string, storagePath: string) => {
    try {
      const { error: storageError } = await supabase.storage
        .from("websites")
        .remove([storagePath]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from("websites")
        .delete()
        .eq("id", websiteId);

      if (dbError) throw dbError;

      toast.success("تم حذف الموقع بنجاح");
      fetchWebsites();
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error("خطأ في حذف الموقع");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
              لوحة التحكم
            </h1>
            <p className="text-muted-foreground">مرحباً بك في منصة الاستضافة</p>
          </div>
          <div className="flex gap-3">
            {isAdmin && (
              <Button
                onClick={() => navigate("/admin")}
                variant="outline"
                className="gap-2"
              >
                <Shield className="w-4 h-4" />
                لوحة الإدارة
              </Button>
            )}
            <Button onClick={handleLogout} variant="outline" className="gap-2">
              <LogOut className="w-4 h-4" />
              تسجيل خروج
            </Button>
          </div>
        </div>

        <Card className="shadow-[var(--shadow-elegant)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              رفع موقع جديد
            </CardTitle>
            <CardDescription>ارفع ملف HTML أو ZIP لاستضافة موقعك</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">اسم الموقع (سيظهر في الرابط)</Label>
                <Input
                  id="siteName"
                  placeholder="my-website"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  required
                />
                {siteName && (
                  <p className="text-sm text-muted-foreground">
                    رابط الموقع: {window.location.origin}/site/{siteName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">اختر الملف (HTML أو ZIP)</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".html,.zip"
                  onChange={handleFileChange}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={uploading}
                className="w-full bg-gradient-to-r from-primary to-accent"
              >
                {uploading ? "جاري الرفع..." : "رفع الموقع"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-[var(--shadow-elegant)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              مواقعي ({websites.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {websites.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">لا توجد مواقع مرفوعة بعد</p>
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
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(website.id, website.storage_path)}
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

export default Dashboard;