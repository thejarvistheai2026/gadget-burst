import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useFindOne, useAction, useFindFirst } from "@gadgetinc/react";
import { api } from "../../api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function EditBurst() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Fetch burst data
  const [{ data: burst, fetching, error }] = useFindOne(api.burst, id, {
    select: {
      id: true,
      name: true,
      status: true,
      emailTemplates: {
        edges: {
          node: {
            id: true,
            subject: true,
            delayOffset: true,
            body: { markdown: true }
          }
        }
      }
    }
  });

  // Fetch user settings for global BCC
  const [{ data: userSettings }] = useFindFirst(api.userSettings);

  // Form state
  const [burstName, setBurstName] = useState("");
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [deletedTemplateIds, setDeletedTemplateIds] = useState([]);
  const [saving, setSaving] = useState(false);

  // Actions
  const [, updateBurst] = useAction(api.burst.update);
  const [, updateEmailTemplate] = useAction(api.emailTemplate.update);
  const [, createEmailTemplate] = useAction(api.emailTemplate.create);
  const [, deleteEmailTemplate] = useAction(api.emailTemplate.delete);

  // Initialize form state when burst data loads
  useEffect(() => {
    if (burst) {
      setBurstName(burst.name);
      const templates = burst.emailTemplates.edges.map((edge) => ({
        id: edge.node.id,
        subject: edge.node.subject,
        delayOffset: edge.node.delayOffset,
        body: edge.node.body.markdown
      }));
      setEmailTemplates(templates);
    }
  }, [burst]);

  const addEmailTemplate = () => {
    setEmailTemplates([
      ...emailTemplates,
      { subject: "", body: "", delayOffset: 0 }
    ]);
  };

  const removeEmailTemplate = (index) => {
    const template = emailTemplates[index];
    if (template.id) {
      setDeletedTemplateIds([...deletedTemplateIds, template.id]);
    }
    setEmailTemplates(emailTemplates.filter((_, i) => i !== index));
  };

  const updateEmailTemplateField = (index, field, value) => {
    const updated = [...emailTemplates];
    updated[index] = { ...updated[index], [field]: value };
    setEmailTemplates(updated);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Update burst name
      await updateBurst({
        id,
        name: burstName
      });

      // Delete removed templates
      for (const templateId of deletedTemplateIds) {
        await deleteEmailTemplate({ id: templateId });
      }

      // Update or create email templates
      for (const template of emailTemplates) {
        if (template.id) {
          // Update existing template
          await updateEmailTemplate({
            id: template.id,
            subject: template.subject,
            delayOffset: template.delayOffset,
            body: { markdown: template.body }
          });
        } else {
          // Create new template
          await createEmailTemplate({
            subject: template.subject,
            delayOffset: template.delayOffset,
            body: { markdown: template.body },
            burst: { _link: id }
          });
        }
      }

      toast.success("Burst updated successfully");
      navigate(`/bursts/${id}`);
    } catch (error) {
      console.error("Error saving burst:", error);
      toast.error("Failed to update burst");
    } finally {
      setSaving(false);
    }
  };

  if (fetching && !burst) {
    return (
      <div className="container mx-auto p-6">
        <div>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-red-500">Error loading burst: {error.message}</div>
      </div>
    );
  }

  if (!burst) {
    return (
      <div className="container mx-auto p-6">
        <div>Burst not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center gap-4">
        <Link to={`/bursts/${id}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Edit Burst</h1>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Burst Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Burst Name
                </label>
                <Input
                  value={burstName}
                  onChange={(e) => setBurstName(e.target.value)}
                  placeholder="Enter burst name"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Email Templates</CardTitle>
            <Button onClick={addEmailTemplate} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Email
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {emailTemplates.map((template, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium">Email {index + 1}</h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeEmailTemplate(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Subject Line
                        </label>
                        <Input
                          value={template.subject}
                          onChange={(e) =>
                            updateEmailTemplateField(index, "subject", e.target.value)
                          }
                          placeholder="Enter subject line"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Delay (days)
                        </label>
                        <Input
                          type="number"
                          value={template.delayOffset}
                          onChange={(e) =>
                            updateEmailTemplateField(
                              index,
                              "delayOffset",
                              parseInt(e.target.value) || 0
                            )
                          }
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Email Body
                        </label>
                        <Textarea
                          value={template.body}
                          onChange={(e) =>
                            updateEmailTemplateField(index, "body", e.target.value)
                          }
                          placeholder="Enter email body"
                          rows={6}
                        />
                      </div>

                      {userSettings?.globalBcc && (
                        <div className="text-sm text-muted-foreground">
                          BCC: {userSettings.globalBcc}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {emailTemplates.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No email templates yet. Click "Add Email" to create one.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link to={`/bursts/${id}`}>
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button onClick={handleSave} disabled={saving || !burstName}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}