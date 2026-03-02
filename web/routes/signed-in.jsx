import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import { AutoTable } from "@/components/auto";
import { useAction } from "@gadgetinc/react";
import { useNavigate } from "react-router";
import { Pause, Play, Plus } from "lucide-react";
import { api } from "../api";

export default function () {
  const navigate = useNavigate();
  const [{ fetching: updatingBurst }, updateBurst] = useAction(api.burst.update);

  const handleStatusToggle = async (burst) => {
    const newStatus = burst.status === "Active" ? "Paused" : "Active";
    await updateBurst({
      id: burst.id,
      status: newStatus,
    });
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "Active":
        return "default";
      case "Paused":
        return "secondary";
      case "Draft":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Outbound Campaigns</h1>
        <Button onClick={() => navigate("/bursts/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Burst
        </Button>
      </div>

      <Card className="p-6">
        <AutoTable
          model={api.burst}
          onClick={(record) => navigate(`/bursts/${record.id}`)}
          columns={[
            "name",
            {
              header: "Created Date",
              field: "createdDate",
            },
            {
              header: "Enrolled Contacts",
              field: "numberOfEnrolledContacts",
            },
            {
              header: "Status",
              render: ({ record }) => (
                <Badge variant={getStatusBadgeVariant(record.status)}>
                  {record.status}
                </Badge>
              ),
            },
            {
              header: "Actions",
              render: ({ record }) => (
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  {record.status === "Active" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusToggle(record)}
                      disabled={updatingBurst}
                    >
                      <Pause className="mr-2 h-4 w-4" />
                      Pause
                    </Button>
                  ) : record.status === "Paused" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusToggle(record)}
                      disabled={updatingBurst}
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Resume
                    </Button>
                  ) : null}
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}