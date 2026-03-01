import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useFindOne, useAction } from "@gadgetinc/react";
import { api } from "../../api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Plus, Edit, Play, Pause } from "lucide-react";
import { format } from "date-fns";
import { AddContactModal } from "@/components/AddContactModal";
import { EnrolledContactsModal } from "@/components/EnrolledContactsModal";

export default function BurstDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [{ data: burst, fetching, error }, refetch] = useFindOne(api.burst, id, {
    select: {
      id: true,
      name: true,
      status: true,
      createdDate: true,
      numberOfEnrolledContacts: true,
      emailTemplates: {
        edges: {
          node: {
            id: true,
            subject: true,
            delayOffset: true,
            body: { markdown: true },
          },
        },
      },
    },
  });

  const [{ fetching: updating }, updateBurst] = useAction(api.burst.update);
  const [addContactModalOpen, setAddContactModalOpen] = useState(false);
  const [contactsModalOpen, setContactsModalOpen] = useState(false);

  const handleStatusToggle = async () => {
    const currentStatus = burst?.status;
    const newStatus = currentStatus === "Active" ? "Paused" : "Active";

    try {
      await updateBurst({
        id: id,
        status: newStatus,
      });
      toast.success(`Burst ${newStatus === "Active" ? "activated" : "paused"} successfully`);
      await refetch();
    } catch (err) {
      toast.error(`Failed to update burst: ${err.message}`);
    }
  };

  if (fetching && !burst) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading burst details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <p className="text-destructive">Error loading burst: {error.message}</p>
          <Button onClick={() => navigate("/signed-in")}>Back to Bursts</Button>
        </div>
      </div>
    );
  }

  if (!burst) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <p className="text-muted-foreground">Burst not found</p>
          <Button onClick={() => navigate("/signed-in")}>Back to Bursts</Button>
        </div>
      </div>
    );
  }

  const emailTemplates = burst.emailTemplates?.edges?.map((edge) => edge.node) || [];

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-500";
      case "Paused":
        return "bg-yellow-500";
      case "Draft":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatDelayOffset = (offset) => {
    if (offset === 0) return "Immediately";
    if (offset === 1) return "Day 1";
    return `Day ${offset}`;
  };

  const truncateMarkdown = (markdown, maxLength = 100) => {
    if (!markdown) return "";
    if (markdown.length <= maxLength) return markdown;
    return markdown.substring(0, maxLength) + "...";
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/signed-in")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">{burst.name}</h1>
          <Badge className={getStatusColor(burst.status)}>{burst.status}</Badge>
        </div>

        <div className="flex gap-2 ml-14">
          <Button variant="outline" onClick={() => setAddContactModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Contacts
          </Button>
          <Button variant="outline" onClick={() => navigate(`/bursts/${id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Burst
          </Button>
          <Button
            variant={burst.status === "Active" ? "outline" : "default"}
            onClick={handleStatusToggle}
            disabled={updating}
          >
            {burst.status === "Active" ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Activate
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Burst Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Burst Details</CardTitle>
            <CardDescription>Overview of this burst campaign</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="text-base">{burst.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <div className="mt-1">
                  <Badge className={getStatusColor(burst.status)}>{burst.status}</Badge>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Created Date</p>
                <p className="text-base">
                  {burst.createdDate ? format(new Date(burst.createdDate), "PPP") : "Not set"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Enrolled Contacts</p>
                <div className="flex items-center gap-2">
                  <p className="text-base">{burst.numberOfEnrolledContacts}</p>
                  {burst.numberOfEnrolledContacts > 0 && (
                    <button
                      onClick={() => setContactsModalOpen(true)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      See more
                    </button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email Templates Card */}
        <Card>
          <CardHeader>
            <CardTitle>Email Templates</CardTitle>
            <CardDescription>
              {emailTemplates.length} email{emailTemplates.length !== 1 ? "s" : ""} in this burst
            </CardDescription>
          </CardHeader>
          <CardContent>
            {emailTemplates.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No email templates yet</p>
            ) : (
              <div className="space-y-4">
                {emailTemplates.map((template, index) => (
                  <Card key={template.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">Email {index + 1}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {formatDelayOffset(template.delayOffset)}
                            </span>
                          </div>
                          <CardTitle className="text-lg">{template.subject}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Preview</p>
                        <p className="text-sm text-muted-foreground">
                          {truncateMarkdown(template.body?.markdown)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <EnrolledContactsModal
        open={contactsModalOpen}
        onOpenChange={setContactsModalOpen}
        burstId={id}
        onContactDeleted={() => refetch()}
      />

      <AddContactModal
        open={addContactModalOpen}
        onOpenChange={setAddContactModalOpen}
        burstId={id}
        onSuccess={() => refetch()}
      />
    </div>
  );
}