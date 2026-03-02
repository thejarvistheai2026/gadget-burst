import { useState, useRef } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { AutoTable } from "@/components/auto";
import { useFindMany } from "@gadgetinc/react";
import { api } from "../api";
import { useNavigate } from "react-router";
import { ChevronLeft, ChevronRight, Mail, Users, DollarSign, AlertCircle, Send, Upload } from "lucide-react";
import { toast } from "sonner";

function getReasonBadge(reason) {
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
  const style = styles[reason] || styles.other;
  const label = labels[reason] || reason;
  return <Badge variant="outline" className={style}>{label}</Badge>;
}

function getStatusBadge(status) {
  const styles = {
    sent: "bg-green-100 text-green-800 border-green-200",
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    failed: "bg-red-100 text-red-800 border-red-200"
  };
  const style = styles[status] || styles.pending;
  return <Badge variant="outline" className={style}>{status}</Badge>;
}

export default function () {
  const navigate = useNavigate();
  const [monthOffset, setMonthOffset] = useState(0);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(null);
  const fileInputRef = useRef(null);

  const handleCSVImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);

    try {
      const text = await file.text();
      const lines = text.split("\n").map(line => line.trim()).filter(line => line.length > 0);
      if (lines.length < 2) {
        toast.error("CSV file must have a header row and at least one data row.");
        setImporting(false);
        return;
      }

      // First row is headers
      const headers = lines[0].split(",").map(h => h.trim());
      const dataRows = lines.slice(1);

      setImportProgress({ current: 0, total: dataRows.length });

      let importedCount = 0;
      for (let i = 0; i < dataRows.length; i++) {
        const values = dataRows[i].split(",").map(v => v.trim());
        const row = {};
        headers.forEach((header, idx) => {
          row[header] = values[idx] ?? "";
        });

        const record = {
          accountName: row.accountName,
          accountEmail: row.accountEmail,
          churnReason: row.churnReason,
          churnDate: row.churnDate,
        };

        if (row.company) record.company = row.company;
        if (row.mrr) record.mrr = parseFloat(row.mrr);
        if (row.planTier) record.planTier = row.planTier;

        await api.churnEvent.create(record);
        importedCount++;
        setImportProgress({ current: importedCount, total: dataRows.length });
      }

      toast.success(`Successfully imported ${importedCount} record${importedCount !== 1 ? "s" : ""}.`);
      fileInputRef.current.value = "";
    } catch (err) {
      toast.error(`Import error: ${err.message}`);
    }

    setImporting(false);
    setImportProgress(null);
  };
  
  // Calculate month range
  const now = new Date();
  const targetMonth = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
  const monthStart = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
  const monthEnd = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0, 23, 59, 59);
  const monthLabel = targetMonth.toLocaleString("default", { month: "long", year: "numeric" });

  // Fetch churn events for this month
  const [{ data: churnEvents, fetching, error }] = useFindMany(api.churnEvent, {
    filter: {
      churnDate: { 
        greaterThanOrEqual: monthStart.toISOString(),
        lessThanOrEqual: monthEnd.toISOString()
      }
    },
    sort: { churnDate: "Descending" }
  });

  // Show loading or error states
  if (fetching) {
    return <div className="p-6">Loading churn data...</div>;
  }
  
  if (error) {
    return <div className="p-6 text-red-600">Error loading data: {error.message}</div>;
  }

  const totalChurned = churnEvents?.length || 0;
  const priceCount = churnEvents?.filter(e => e.churnReason === "price").length || 0;
  const alternativeCount = churnEvents?.filter(e => e.churnReason === "other_solution").length || 0;
  const emailsSent = churnEvents?.filter(e => e.emailStatus === "sent").length || 0;

  const stats = [
    { label: "Total Churned", value: totalChurned, icon: Users },
    { label: "Price Related", value: priceCount, icon: DollarSign },
    { label: "Alternative Chosen", value: alternativeCount, icon: AlertCircle },
    { label: "Emails Sent", value: emailsSent, icon: Send }
  ];

  const columns = [
    { header: "Account", field: "accountName" },
    { header: "Email", field: "accountEmail" },
    { header: "Company", field: "company" },
    { 
      header: "Reason", 
      field: "churnReason",
      render: ({ record }) => getReasonBadge(record.churnReason)
    },
    { 
      header: "Date", 
      field: "churnDate",
      render: ({ record }) => {
        const date = record.churnDate;
        return date ? new Date(date).toLocaleDateString() : "-";
      }
    },
    { 
      header: "Email Status", 
      field: "emailStatus",
      render: ({ record }) => getStatusBadge(record.emailStatus)
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Churn Tracker</h1>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => setMonthOffset(m => m + 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-lg font-medium min-w-[150px] text-center">{monthLabel}</span>
          <Button 
            variant="outline" 
            onClick={() => setMonthOffset(m => Math.max(0, m - 1))}
            disabled={monthOffset === 0}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button onClick={() => navigate("/churn-templates")} variant="outline">
            <Mail className="mr-2 h-4 w-4" />
            Manage Templates
          </Button>
          <Button
            variant="outline"
            disabled={importing}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            {importProgress ? `Importing ${importProgress.current}/${importProgress.total}...` : "Import CSV"}
          </Button>
          {/* Expected CSV format: accountName, accountEmail, company, churnReason, churnDate, mrr, planTier */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleCSVImport}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map(stat => {
          const IconComponent = stat.icon;
          return (
            <Card key={stat.label} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <IconComponent className="h-8 w-8 text-muted-foreground opacity-50" />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Churn Events Table */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Churned Accounts</h2>
        {!churnEvents || churnEvents.length === 0 ? (
          <p className="text-muted-foreground">
            No churn events for {monthLabel}. Data will appear here when Slack webhooks arrive.
          </p>
        ) : (
          <AutoTable
            model={api.churnEvent}
            filter={{
              churnDate: { 
                greaterThanOrEqual: monthStart.toISOString(),
                lessThanOrEqual: monthEnd.toISOString()
              }
            }}
            columns={columns}
          />
        )}
      </Card>
    </div>
  );
}
