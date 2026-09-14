import { useState, useEffect } from "react";
import { Image, Save } from "lucide-react";
import { Card, PageHeader, Button } from "../components/ui";

export default function SiteSettings() {
  const [settings, setSettings] = useState({
    loginBgImage: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=1200",
    homeHeroImage: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=1000",
  });

  useEffect(() => {
    // LocalStorage se save settings load karna
    const saved = localStorage.getItem("voltra_site_settings");
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem("voltra_site_settings", JSON.stringify(settings));
    alert("Site banner images updated successfully! Public Home & Login page will reflect changes instantly.");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader 
        title="Site Appearance & Banners" 
        subtitle="Manage public home and login page background images dynamically from the CRM." 
      />

      <Card className="p-6">
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
              Login Page Background Image URL
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="url"
                required
                className="w-full px-3 py-2.5 border rounded-lg text-sm bg-surface"
                value={settings.loginBgImage}
                onChange={(e) => setSettings({ ...settings, loginBgImage: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            {settings.loginBgImage && (
              <div className="mt-3 h-32 w-48 rounded-lg overflow-hidden border border-black/10">
                <img src={settings.loginBgImage} alt="Login Preview" className="h-full w-full object-cover" />
              </div>
            )}
          </div>

          <hr className="border-black/5" />

          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
              Home Page Hero Scooter Image URL
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="url"
                required
                className="w-full px-3 py-2.5 border rounded-lg text-sm bg-surface"
                value={settings.homeHeroImage}
                onChange={(e) => setSettings({ ...settings, homeHeroImage: e.target.value })}
                placeholder="https://example.com/scooter.jpg"
              />
            </div>
            {settings.homeHeroImage && (
              <div className="mt-3 h-32 w-48 rounded-lg overflow-hidden border border-black/10">
                <img src={settings.homeHeroImage} alt="Home Preview" className="h-full w-full object-cover" />
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" variant="primary">
              <Save size={16} /> Save Banner Settings
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}