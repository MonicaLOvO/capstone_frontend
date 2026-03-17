"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Input,
  Textarea,
  Select,
  Option,
  Button,
  Sheet,
  Breadcrumbs,
  Link,
  Divider,
  Modal,
  ModalDialog,
  ModalClose,
  Stack,
} from "@mui/joy";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";

// ────────────────────────────────────────────────
// Enum matching backend InventoryReportType
// ────────────────────────────────────────────────
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

// ────────────────────────────────────────────────
// Form state type (mirrors InventoryReportsItem entity)
// ────────────────────────────────────────────────
interface InventoryReportForm {
  ItemName: string;
  reportedBy: string; // auto-populated
  ReportType: InventoryReportType | "";
  Description: string;
  AdditionalNotes: string;
}

// ────────────────────────────────────────────────
// Simulated logged-in user (replace with auth hook)
// ────────────────────────────────────────────────
const CURRENT_USER = "John Smith"; // Replace: const { user } = useAuth();

export default function InventoryReportPage() {
  const [form, setForm] = useState<InventoryReportForm>({
    ItemName: "",
    reportedBy: CURRENT_USER,
    ReportType: "",
    Description: "",
    AdditionalNotes: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof InventoryReportForm, string>>>({});
  const [successOpen, setSuccessOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ── Validation ──────────────────────────────
  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!form.ItemName.trim()) newErrors.ItemName = "Item name is required.";
    if (!form.ReportType) newErrors.ReportType = "Please select a report type.";
    if (!form.Description.trim()) newErrors.Description = "Description is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit ───────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);

    // TODO: replace with real API call
    // await fetch("/api/inventory-reports", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(form),
    // });

    await new Promise((r) => setTimeout(r, 600)); // simulate network
    setSubmitting(false);
    setSuccessOpen(true);
  };

  // ── Reset form ───────────────────────────────
  const resetForm = () => {
    setForm({
      ItemName: "",
      reportedBy: CURRENT_USER,
      ReportType: "",
      Description: "",
      AdditionalNotes: "",
    });
    setErrors({});
  };

  const handleCreateAnother = () => {
    resetForm();
    setSuccessOpen(false);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.body",
        px: { xs: 2, sm: 4, md: 6 },
        py: { xs: 3, md: 4 },
      }}
    >
      {/* ── Breadcrumb ─────────────────────────── */}
      <Breadcrumbs
        size="sm"
        aria-label="breadcrumbs"
        separator={<ChevronRightRoundedIcon fontSize="small" />}
        sx={{ mb: 2, pl: 0 }}
      >
        <Link
          underline="none"
          color="neutral"
          href="/dashboard"
          aria-label="Home"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <HomeRoundedIcon fontSize="small" />
        </Link>
        <Link
          underline="hover"
          color="neutral"
          href="/reports"
          sx={{ fontSize: "sm", fontWeight: 500 }}
        >
          Reports
        </Link>
        <Typography color="primary" fontWeight={500} fontSize="sm">
          Inventory Reports
        </Typography>
      </Breadcrumbs>

      {/* ── Page heading ────────────────────────── */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 4 }}>
        <AssessmentRoundedIcon sx={{ fontSize: 32, color: "primary.500" }} />
        <Box>
          <Typography level="h2" fontWeight={600}>
            Inventory Reports
          </Typography>
          <Typography level="body-sm" textColor="text.tertiary">
            Submit a new inventory discrepancy report
          </Typography>
        </Box>
      </Box>

      {/* ── Form card ───────────────────────────── */}
      <Sheet
        variant="outlined"
        sx={{
          maxWidth: 780,
          borderRadius: "lg",
          p: { xs: 3, md: 4 },
          boxShadow: "sm",
        }}
      >
        <Typography level="title-md" fontWeight={600} mb={0.5}>
          Report Details
        </Typography>
        <Typography level="body-sm" textColor="text.tertiary" mb={3}>
          All fields are required unless marked optional.
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Stack spacing={3}>
          {/* Item Name */}
          <Box>
            <Typography level="title-sm" mb={0.75} fontWeight={500}>
              Item Name <Typography component="span" color="danger">*</Typography>
            </Typography>
            <Input
              placeholder="e.g. Barcode Scanner Model X200"
              value={form.ItemName}
              onChange={(e) => setForm({ ...form, ItemName: e.target.value })}
              error={!!errors.ItemName}
              size="lg"
              sx={{ width: "100%" }}
            />
            {errors.ItemName && (
              <Typography level="body-xs" color="danger" mt={0.5}>
                {errors.ItemName}
              </Typography>
            )}
          </Box>

          {/* Reported By (auto-populated, read-only) */}
          <Box>
            <Typography level="title-sm" mb={0.75} fontWeight={500}>
              Reported By
            </Typography>
            <Input
              value={form.reportedBy}
              readOnly
              size="lg"
              sx={{
                width: "100%",
                bgcolor: "background.level1",
                cursor: "not-allowed",
                "& input": { cursor: "not-allowed" },
              }}
              endDecorator={
                <Typography level="body-xs" textColor="text.tertiary">
                  Auto-filled
                </Typography>
              }
            />
            <Typography level="body-xs" textColor="text.tertiary" mt={0.5}>
              Automatically set to your account name.
            </Typography>
          </Box>

          {/* Report Type */}
          <Box>
            <Typography level="title-sm" mb={0.75} fontWeight={500}>
              Report Type <Typography component="span" color="danger">*</Typography>
            </Typography>
            <Select
              placeholder="Select a report type…"
              value={form.ReportType || null}
              onChange={(_, val) =>
                setForm({ ...form, ReportType: val as InventoryReportType })
              }
              size="lg"
              color={errors.ReportType ? "danger" : "neutral"}
              sx={{ width: "100%" }}
            >
              {Object.values(InventoryReportType).map((type) => (
                <Option key={type} value={type}>
                  {reportTypeLabels[type]}
                </Option>
              ))}
            </Select>
            {errors.ReportType && (
              <Typography level="body-xs" color="danger" mt={0.5}>
                {errors.ReportType}
              </Typography>
            )}
          </Box>

          {/* Description */}
          <Box>
            <Typography level="title-sm" mb={0.75} fontWeight={500}>
              Description <Typography component="span" color="danger">*</Typography>
            </Typography>
            <Textarea
              placeholder="Provide a clear description of the issue…"
              value={form.Description}
              onChange={(e) => setForm({ ...form, Description: e.target.value })}
              minRows={4}
              maxRows={12}
              error={!!errors.Description}
              sx={{ width: "100%", resize: "vertical" }}
            />
            {errors.Description && (
              <Typography level="body-xs" color="danger" mt={0.5}>
                {errors.Description}
              </Typography>
            )}
          </Box>

          {/* Additional Notes (optional) */}
          <Box>
            <Typography level="title-sm" mb={0.75} fontWeight={500}>
              Additional Notes{" "}
              <Typography component="span" level="body-xs" textColor="text.tertiary">
                (optional)
              </Typography>
            </Typography>
            <Textarea
              placeholder="Any extra context, reference numbers, or follow-up actions…"
              value={form.AdditionalNotes}
              onChange={(e) => setForm({ ...form, AdditionalNotes: e.target.value })}
              minRows={3}
              maxRows={10}
              sx={{ width: "100%", resize: "vertical" }}
            />
          </Box>

          {/* Actions */}
          <Box sx={{ display: "flex", gap: 2, pt: 1 }}>
            <Button
              size="lg"
              onClick={handleSubmit}
              loading={submitting}
              sx={{ flex: 1 }}
            >
              Submit Report
            </Button>
            <Button
              size="lg"
              variant="outlined"
              color="neutral"
              onClick={resetForm}
              disabled={submitting}
            >
              Clear
            </Button>
          </Box>
        </Stack>
      </Sheet>

      {/* ── Success Modal ────────────────────────── */}
      <Modal open={successOpen} onClose={() => setSuccessOpen(false)}>
        <ModalDialog
          variant="outlined"
          size="md"
          sx={{ maxWidth: 420, textAlign: "center", borderRadius: "lg" }}
        >
          <ModalClose />
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, py: 1 }}>
            <CheckCircleOutlineRoundedIcon
              sx={{ fontSize: 56, color: "success.500" }}
            />
            <Typography level="h3" fontWeight={600}>
              Report Submitted!
            </Typography>
            <Typography level="body-md" textColor="text.secondary">
              Your inventory report has been successfully created and logged in the system.
            </Typography>
            <Divider sx={{ width: "100%" }} />
            <Stack spacing={1.5} sx={{ width: "100%" }}>
              <Button
                size="lg"
                fullWidth
                onClick={handleCreateAnother}
              >
                Create Another Report
              </Button>
              <Button
                size="lg"
                variant="outlined"
                color="neutral"
                fullWidth
                component="a"
                href="/dashboard"
              >
                Go Back to Dashboard
              </Button>
            </Stack>
          </Box>
        </ModalDialog>
      </Modal>
    </Box>
  );
}
