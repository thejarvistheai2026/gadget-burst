import { useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { AutoTable } from "@/components/auto";
import { useFindMany } from "@gadgetinc/react";
import { api } from "../api";
import { useNavigate } from "react-router";
import { ChevronLeft, ChevronRight, Mail, Users, DollarSign, AlertCircle, Send } from "lucide-react";

export default function () {
  const navigate = useNavigate();
  const [monthOffset, setMonthOffset] = useState(0);
  
  // Calculate month range
  const now = new Date();
  const targetMonth = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
  const monthStart = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
  const monthEnd = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0, 23, 59, 59);
  
  const monthLabel = targetMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Fetch churn events for this month
  const [{ data: churnEvents, fetching, error }] = useFindMany(api.churnEvent, {
    filter: {
      churnDate: { 
        gte: monthStart.toISOString(),
        lte: monthEnd.toISOString()
      }
    },
    sort: { churnDate: "Descending" }
  });

  // Show loading or error states
  if (fetching) return <div className="p-6">Loading churn data...</div>;
  if (error) return <div className="p-6 text-red-600">Error loading data: {error.message}</div>;

  const getReasonBadge = (reason) => {
    const styles = {
      price: "bg-red-100 text-red-800 border-red-200",
      other_solution: "bg-yellow-100 text-yellow-800 border-yellow-200",
      other: "bg-gray-100 text-gray-800 border-gray-200"
    };
    const labels = {
      price: "Price",
      other_solution: "Chose Alternative",
      other: "Other"
    };
    return (
      <Badge variant="outline" className={styles[reason] || styles.other}>
        {labels[reason] || reason}
      </Badge>
    );
  };

  const getStatusBadge = (status) => {
    const styles = {
      sent: "bg-green-100 text-green-800 border-green-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      failed: "bg-red-100 text-red-800 border-red-200"
    };
    return (
      <Badge variant="outline" className={styles[status] || styles.pending}>
        {status}
      </Badge>
    );
  };

  const stats = [
    { 
      label: "Total Churned", 
      value: churnEvents?.length || 0,
      icon: Users
    },
    { 
      label: "Price Related", 
      value: churnEvents?.filter(e => e.churnReason === "price").length || 0,
      icon: DollarSign
    },
    { 
      label: "Alternative Chosen", 
      value: churnEvents?.filter(e => e.churnReason === "other_solution").length || 0,
      icon: AlertCircle
    },
    { 
      label: "Emails Sent", 
      value: churnEvents?.filter(e => e.emailStatus === "sent").length || 0,
      icon: Send
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Churn Tracker</h1>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setMonthOffset(m => m + 1)}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-lg font-medium min-w-[150px] text-center">{monthLabel}</span>
          <Button 
            variant="outline" 
            onClick={() => setMonthOffset(m => Math.max(0, m - 1))}
            disabled={monthOffset === 0}
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button onClick={() => navigate("/churn-templates")} variant="outline">
            <Mail className="mr-2 h-4 w-4" />
            Manage Templates
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map(stat => (
          <Card key={stat.label} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <stat.icon className="h-8 w-8 text-muted-foreground opacity-50" />
            </div>
          </Card>
        ))}
      </div>

      {/* Churn Events Table */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Churned Accounts</h2>
        {!churnEvents || churnEvents.length === 0 ? (
          <p className="text-muted-foreground">No churn events for {monthLabel}. Data will appear here when Slack webhooks arrive.</p>
        ) : (
          <AutoTable
            model={api.churnEvent}
            filter={{
              churnDate: { 
                gte: monthStart.toISOString(),
                lte: monthEnd.toISOString()
              }
            }}
            columns={[
              { header: "Account", field: "accountName" },
              { header: "Email", field: "accountEmail" },
              { header: "Company", field: "company" },
              {
                header: "Reason",
                render: ({ record }) => getReasonBadge(record.churnReason)
              },
              {
                header: "Date",
                render: ({ record }) => record.churnDate ? new Date(record.churnDate).toLocaleDateString() : "-"
              },
              {
                header: "Email Status",
                render: ({ record }) => getStatusBadge(record.emailStatus)
              }
            ]}
          />
        )}
      </Card>
    </div>
  );
}
