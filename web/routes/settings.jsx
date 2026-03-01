import { useState, useEffect } from "react";
import { useFindFirst, useAction, useUser } from "@gadgetinc/react";
import { api } from "../api";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function Settings() {
  const user = useUser();
  const [globalBcc, setGlobalBcc] = useState("");
  const [fromName, setFromName] = useState("");
  
  const [{ data: settings, fetching: fetchingSettings, error: fetchError }, refetchSettings] = useFindFirst(
    api.userSettings
  );
  
  const [{ fetching: creating }, createSettings] = useAction(api.userSettings.create);
  const [{ fetching: updating }, updateSettings] = useAction(api.userSettings.update);

  // Initialize settings if they don't exist
  useEffect(() => {
    if (!fetchingSettings && !settings && !fetchError && user) {
      createSettings({
        user: {
          _link: user.id,
        },
      }).then(() => {
        refetchSettings();
      }).catch((error) => {
        toast.error("Failed to initialize settings: " + error.message);
      });
    }
  }, [fetchingSettings, settings, fetchError, user, createSettings, refetchSettings]);

  // Populate form fields when settings are loaded
  useEffect(() => {
    if (settings) {
      if (settings.globalBcc) {
        setGlobalBcc(settings.globalBcc);
      }
      if (settings.fromName) {
        setFromName(settings.fromName);
      }
    }
  }, [settings]);

  const handleSaveSettings = async () => {
    if (!settings?.id) {
      toast.error("Settings not found");
      return;
    }

    try {
      await updateSettings({
        id: settings.id,
        globalBcc: globalBcc || null,
        fromName: fromName || null,
      });
      toast.success("Settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings: " + error.message);
    }
  };

  if (fetchingSettings || creating) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <div className="space-y-6 max-w-2xl">
        {/* Email Defaults Section */}
        <Card>
          <CardHeader>
            <CardTitle>Email Defaults</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fromName">From Name</Label>
              <Input
                id="fromName"
                type="text"
                placeholder="Your Name or Company"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                The name that appears in the 'From' field of sent emails (e.g., 'Franco from Gadget')
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="globalBcc">Global BCC</Label>
              <Input
                id="globalBcc"
                type="email"
                placeholder="email@example.com"
                value={globalBcc}
                onChange={(e) => setGlobalBcc(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                This email will be BCC'd on all emails sent from bursts
              </p>
            </div>
            <Button onClick={handleSaveSettings} disabled={updating}>
              {updating ? "Saving..." : "Save Settings"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}