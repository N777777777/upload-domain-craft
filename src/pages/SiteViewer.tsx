import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";

const SiteViewer = () => {
  const { siteName } = useParams();
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (siteName) {
      loadSite();
    }
  }, [siteName]);

  const loadSite = async () => {
    try {
      const { data: website, error: dbError } = await supabase
        .from("websites")
        .select("storage_path, file_type")
        .eq("site_name", siteName)
        .maybeSingle();

      if (dbError) throw dbError;

      if (!website) {
        setError("الموقع غير موجود");
        setLoading(false);
        return;
      }

      const { data, error: storageError } = await supabase.storage
        .from("websites")
        .download(website.storage_path);

      if (storageError) throw storageError;

      if (website.file_type === "html") {
        const text = await data.text();
        setHtmlContent(text);
      } else if (website.file_type === "zip") {
        setError("ملفات ZIP تحتاج لمعالجة خاصة - قريباً");
      }
    } catch (error: any) {
      console.error("Error loading site:", error);
      setError("حدث خطأ في تحميل الموقع");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل الموقع...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-destructive mb-4">خطأ</h1>
          <p className="text-muted-foreground">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full h-screen">
      <iframe
        srcDoc={htmlContent}
        className="w-full h-full border-0"
        title={siteName}
        sandbox="allow-scripts allow-same-origin allow-forms"
      />
    </div>
  );
};

export default SiteViewer;