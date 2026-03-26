"use client";

import React, { useState, useEffect } from "react";
import {
  Box, Typography, Input, Textarea, Button, Select, Option,
  Sheet, Breadcrumbs, Link, Divider,
  Modal, ModalDialog, ModalClose, Stack,
} from "@mui/joy";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";

// ── Enum matching backend InventoryReportType ──
enum InventoryReportType {
  Lost = "lost",
  Damaged = "Damaged",
  Expired = "Expired",
  Stolen = "stolen",
}

const reportTypeLabels: Record<InventoryReportType, string> = {
  [InventoryReportType.Lost]: "Lost",
  [InventoryReportType.Damaged]: "Damaged",
  [InventoryReportType.Expired]: "Expired",
  [InventoryReportType.Stolen]: "Stolen",
};

// ── Your backend API base URL ──

const API_ENDPOINT = "http://localhost:4000/api/inventory";

// ── Today's date formatted as YYYY-MM-DD ──
const TODAY = new Date().toISOString().split("T")[0];

// ── Empty form template ──
const emptyForm = {
  ItemName: "",
  reportedBy: "",           
  ReportType: "" as InventoryReportType | "",
  Description: "",
  AdditionalNotes: "",      // optional
};

export default function InventoryReportPage() {
  // ── Pull the logged-in user and token from localStorage (saved on login) ──
  const [currentUser, setCurrentUser] = useState("");
  const [authToken, setAuthToken] = useState("");

  useEffect(() => {
  const loginAndStoreToken = async () => {
    try {
      
      const res = await fetch("http://localhost:4000/api/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Username: "SuperAdmin",
          Password: "SuperAdmin",
        }),
      });

      const data = await res.json();

      if (data?.Data?.token) {
        localStorage.setItem("token", data.Data.token);
        localStorage.setItem("user", JSON.stringify(data.Data.user));

        setAuthToken(data.Data.token);

        const user = data.Data.user;
        const displayName =
          user.FirstName && user.LastName
            ? `${user.FirstName} ${user.LastName}`
            : user.Username;

        setCurrentUser(displayName);

        console.log("Auto login success");
      } else {
        console.error("Login failed", data);
      }
    } catch (err) {
      console.error(" Login error", err);
    }
  };

  loginAndStoreToken();
}, []);

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  // ── Keep reportedBy in sync once localStorage loads the user ──
  useEffect(() => {
    setForm((prev) => ({ ...prev, reportedBy: currentUser }));
  }, [currentUser]);

  // ── Update a single field in the form ──
  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // ── Check required fields before submitting ──
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.ItemName.trim())  newErrors.ItemName    = "Item name is required.";
    else {
      const itemNameWords = form.ItemName.trim().split(/\s+/).length;
      if (itemNameWords > 50) newErrors.ItemName = "Item name cannot exceed 50 words.";
    }
    if (!form.ReportType)       newErrors.ReportType  = "Please select a report type.";
    if (!form.Description.trim()) newErrors.Description = "Description is required.";
    else {
      const descWords = form.Description.trim().split(/\s+/).length;
      if (descWords > 250) newErrors.Description = "Description cannot exceed 250 words.";
    }
    if (form.AdditionalNotes.trim()) {
      const notesWords = form.AdditionalNotes.trim().split(/\s+/).length;
      if (notesWords > 300) newErrors.AdditionalNotes = "Additional notes cannot exceed 300 words.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // true = no errors
  };

 const handleSubmit = async () => {
  if (!validate()) return;
  setSubmitting(true);

  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        ProductName: form.ItemName,

        
        Description: `
Report Type: ${form.ReportType}
Reported By: ${form.reportedBy}

${form.Description}

Additional Notes: ${form.AdditionalNotes || "N/A"}
        `,

        Quantity: 0,
        UnitPrice: 0,
        QrCodeValue: null,
        ImageUrl: null,
        Category: "Report",
        Location: "N/A",
        Sku: `REPORT-${Date.now()}`,
        Status: 0,
      }),
    });

    const data = await response.json();

    if (response.ok && data.Success) {
      setSuccessOpen(true);
    } else if (response.status === 401) {
      alert("Session expired. Please log in again.");
    } else if (response.status === 403) {
      alert("You do not have permission to submit inventory.");
    } else {
      console.error(data);
      alert("Submission failed. Check backend logs.");
    }
  } catch (error) {
    console.error(error);
    alert("Connection Error: Is the backend running on port 4000?");
  } finally {
    setSubmitting(false);
  }
};
  // ── Reset every field back to empty (keeps reportedBy from logged-in user) ──
  const handleReset = () => {
    setForm({ ...emptyForm, reportedBy: currentUser });
    setErrors({});
  };

  // ── "Create Another" button inside the success modal ──
  const handleCreateAnother = () => {
    handleReset();
    setSuccessOpen(false);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.body", px: { xs: 2, sm: 4, md: 6 }, py: { xs: 3, md: 4 } }}>

      {/* ── Breadcrumb: Home > Reports > Inventory Reports ── */}
      <Breadcrumbs size="sm" separator={<ChevronRightRoundedIcon fontSize="small" />} sx={{ mb: 2, pl: 0 }}>
        <Link underline="none" color="neutral" href="/dashboard" aria-label="Home" sx={{ display: "flex", alignItems: "center" }}>
          <HomeRoundedIcon fontSize="small" />
        </Link>
        <Link underline="hover" color="neutral" href="/reports" sx={{ fontSize: "sm", fontWeight: 500 }}>
          Reports
        </Link>
        <Typography color="primary" fontWeight={500} fontSize="sm">
          Inventory Reports
        </Typography>
      </Breadcrumbs>

      {/* ── Page Title ── */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 4 }}>
        <AssessmentRoundedIcon sx={{ fontSize: 32, color: "primary.500" }} />
        <Box>
          <Typography level="h2" fontWeight={600}>Inventory Reports</Typography>
          <Typography level="body-sm" textColor="text.tertiary">
            Submit a new inventory discrepancy report
          </Typography>
        </Box>
      </Box>

      {/* ── Main Form Card ── */}
      <Sheet variant="outlined" sx={{ maxWidth: 780, borderRadius: "lg", p: { xs: 3, md: 4 }, boxShadow: "sm" }}>
        <Typography level="title-md" fontWeight={600} mb={0.5}>Report Details</Typography>
        <Typography level="body-sm" textColor="text.tertiary" mb={3}>
          All fields are required unless marked optional.
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Stack spacing={3}>

          {/* Item Name */}
          <Box>
            <Typography level="title-sm" fontWeight={500} mb={0.75}>
              Item Name <Typography component="span" color="danger">*</Typography>
            </Typography>
            <Input
              size="lg"
              placeholder="e.g. Barcode Scanner Model X200"
              value={form.ItemName}
              onChange={(e) => update("ItemName", e.target.value)}
              error={!!errors.ItemName}
              sx={{ width: "100%" }}
            />
            {errors.ItemName && <Typography level="body-xs" color="danger" mt={0.5}>{errors.ItemName}</Typography>}
            <Typography level="body-xs" textColor="text.tertiary" mt={0.5}>Max 50 words</Typography>
          </Box>

          {/* Reported By — read-only, auto-filled from JWT user in localStorage */}
          <Box>
            <Typography level="title-sm" fontWeight={500} mb={0.75}>Reported By</Typography>
            <Input
              size="lg"
              value={form.reportedBy}
              readOnly
              placeholder={currentUser ? "" : "Loading..."}
              endDecorator={<Typography level="body-xs" textColor="text.tertiary">Auto-filled</Typography>}
              sx={{ width: "100%", bgcolor: "background.level1", cursor: "not-allowed", "& input": { cursor: "not-allowed" } }}
            />
            <Typography level="body-xs" textColor="text.tertiary" mt={0.5}>
              Automatically set to your logged-in account name.
            </Typography>
          </Box>

          {/* Report Type — dropdown */}
          <Box>
            <Typography level="title-sm" fontWeight={500} mb={0.75}>
              Report Type <Typography component="span" color="danger">*</Typography>
            </Typography>
            <Select
              placeholder="Select a report type…"
              value={form.ReportType || null}
              onChange={(_, val) => update("ReportType", val as string)}
              size="lg"
              color={errors.ReportType ? "danger" : "neutral"}
              sx={{ width: "100%" }}
            >
              {Object.values(InventoryReportType).map((type) => (
                <Option key={type} value={type}>{reportTypeLabels[type]}</Option>
              ))}
            </Select>
            {errors.ReportType && <Typography level="body-xs" color="danger" mt={0.5}>{errors.ReportType}</Typography>}
          </Box>

          {/* Description */}
          <Box>
            <Typography level="title-sm" fontWeight={500} mb={0.75}>
              Description <Typography component="span" color="danger">*</Typography>
            </Typography>
            <Textarea
              placeholder="Provide a clear description of the issue…"
              value={form.Description}
              onChange={(e) => update("Description", e.target.value)}
              minRows={4}
              maxRows={12}
              error={!!errors.Description}
              sx={{ width: "100%", resize: "vertical" }}
            />
            {errors.Description && <Typography level="body-xs" color="danger" mt={0.5}>{errors.Description}</Typography>}
            <Typography level="body-xs" textColor="text.tertiary" mt={0.5}>Max 250 words</Typography>
          </Box>

          {/* Additional Notes — optional */}
          <Box>
            <Typography level="title-sm" fontWeight={500} mb={0.75}>
              Additional Notes <Typography component="span" level="body-xs" textColor="text.tertiary">(optional)</Typography>
            </Typography>
            <Textarea
              placeholder="Any extra context, reference numbers, or follow-up actions…"
              value={form.AdditionalNotes}
              onChange={(e) => update("AdditionalNotes", e.target.value)}
              minRows={3}
              maxRows={10}
              sx={{ width: "100%", resize: "vertical" }}
            />
            {errors.AdditionalNotes && <Typography level="body-xs" color="danger" mt={0.5}>{errors.AdditionalNotes}</Typography>}
            <Typography level="body-xs" textColor="text.tertiary" mt={0.5}>Max 300 words</Typography>
          </Box>

          {/* Submit + Clear buttons */}
          <Box sx={{ display: "flex", gap: 2, pt: 1 }}>
            <Button size="lg" onClick={handleSubmit} loading={submitting} sx={{ flex: 1 }}>
              Submit Report
            </Button>
            <Button size="lg" variant="outlined" color="neutral" onClick={handleReset} disabled={submitting}>
              Clear
            </Button>
          </Box>

        </Stack>
      </Sheet>

      {/* ── Success Modal ── */}
      <Modal open={successOpen} onClose={() => setSuccessOpen(false)}>
        <ModalDialog variant="outlined" size="md" sx={{ maxWidth: 420, textAlign: "center", borderRadius: "lg" }}>
          <ModalClose />
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, py: 1 }}>
            <CheckCircleOutlineRoundedIcon sx={{ fontSize: 56, color: "success.500" }} />
            <Typography level="h3" fontWeight={600}>Report Submitted!</Typography>
            <Typography level="body-md" textColor="text.secondary">
              Your inventory report has been successfully created and logged in the system.
            </Typography>
            <Divider sx={{ width: "100%" }} />
            <Stack spacing={1.5} sx={{ width: "100%" }}>
              <Button size="lg" fullWidth onClick={handleCreateAnother}>
                Create Another Report
              </Button>
              <Button size="lg" variant="outlined" color="neutral" fullWidth component="a" href="/dashboard">
                Go Back to Dashboard
              </Button>
            </Stack>
          </Box>
        </ModalDialog>
      </Modal>

    </Box>
  );
}