import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { AutoForm, AutoTable } from "@/components/auto";
import { useFindMany } from "@gadgetinc/react";
import { api } from "../api";
import { useNavigate } from "react-router";
import { ArrowLeft, Mail, Plus } from "lucide-react";

export default function () {
  const navigate = useNavigate();
  const [{ data: templates, fetching }] = useFindMany(api.churnTemplate, {
    sort: { name: "Ascending" }
  });

  const getReasonLabel = (reason) => {
    const labels = {
      price: "💰 Price",
      other_solution: "🔄 Chose Alternative",
      other: "❓ Other"
    };
    return labels[reason] || reason;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/churn-tracker")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Churn Email Templates</h1>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Templates List */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Existing Templates
          </h2>
          <AutoTable
            model={api.churnTemplate}
            columns={[
              { header: "Name", field: "name" },
              {
                header: "Reason",
                render: ({ record }) => getReasonLabel(record.churnReason)
              },
              {
                header: "Status",
                render: ({ record }) => 
                  record.isActive ? 
                    <span className="text-green-600 font-medium">✅ Active</span> : 
                    <span className="text-gray-500">❌ Inactive</span>
              }
            ]}
            onClick={(record) => navigate(`/churn-templates/${record.id}`)}
          />
        </Card>

        {/* Create Template */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Template
          </h2>
          <AutoForm
            model={api.churnTemplate}
            action={api.churnTemplate.create}
            onSuccess={() => window.location.reload()}
            exclude={["user"], "isActive"]}
            defaultValues={{ isActive: true }}
          />
        </Card>
      </div>
    </div>
  );
}
