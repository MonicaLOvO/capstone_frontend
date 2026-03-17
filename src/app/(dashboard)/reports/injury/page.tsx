"use client";

import React, { useState } from "react";
import {
  Box, Typography, Input, Textarea, Button,
  Sheet, Breadcrumbs, Link, Divider,
  Modal, ModalDialog, ModalClose, Stack,
} from "@mui/joy";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import MedicalServicesRoundedIcon from "@mui/icons-material/MedicalServicesRounded";

// ── The logged-in user's name  ──
const CURRENT_USER = "John Smith";

// ── Today's date formatted as YYYY-MM-DD ──
const TODAY = new Date().toISOString().split("T")[0];

// ── Empty form template (used on load and after reset) ──
const emptyForm = {
  EmployeeName: "",
  ReportedBy: CURRENT_USER,  // always auto-filled
  ReportDate: TODAY,          // always fixed to today
  InjuryType: "",
  Location: "",
  Description: "",
  Witnesses: "",              // optional
  AdditionalNotes: "",        // optional
};

export default function InjuryReportPage() {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  // ── Update a single field in the form ──
  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // ── Check required fields before submitting ──
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.EmployeeName.trim()) newErrors.EmployeeName = "Employee name is required.";
    if (!form.InjuryType.trim())   newErrors.InjuryType   = "Injury type is required.";
    if (!form.Location.trim())     newErrors.Location      = "Location is required.";
    if (!form.Description.trim())  newErrors.Description   = "Description is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // true = no errors
  };

  // ── Submit the form ──
  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);

    // TODO: replace with your real API call, e.g.:
    // await fetch("/api/injury-reports", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(form),
    // });

    await new Promise((r) => setTimeout(r, 600)); // simulates network delay
    setSubmitting(false);
    setSuccessOpen(true);
  };

  // ── Reset every field back to empty ──
  const handleReset = () => {
    setForm(emptyForm);
    setErrors({});
  };

  // ── "Create Another" button inside the success modal ──
  const handleCreateAnother = () => {
    handleReset();
    setSuccessOpen(false);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.body", px: { xs: 2, sm: 4, md: 6 }, py: { xs: 3, md: 4 } }}>

      {/* ── Breadcrumb: Home > Reports > Injury Reports ── */}
      <Breadcrumbs size="sm" separator={<ChevronRightRoundedIcon fontSize="small" />} sx={{ mb: 2, pl: 0 }}>
        <Link underline="none" color="neutral" href="/dashboard" aria-label="Home" sx={{ display: "flex", alignItems: "center" }}>
          <HomeRoundedIcon fontSize="small" />
        </Link>
        <Link underline="hover" color="neutral" href="/reports" sx={{ fontSize: "sm", fontWeight: 500 }}>
          Reports
        </Link>
        <Typography color="primary" fontWeight={500} fontSize="sm">
          Injury Reports
        </Typography>
      </Breadcrumbs>

      {/* ── Page Title ── */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 4 }}>
        <MedicalServicesRoundedIcon sx={{ fontSize: 32, color: "primary.500" }} />
        <Box>
          <Typography level="h2" fontWeight={600}>Injury Reports</Typography>
          <Typography level="body-sm" textColor="text.tertiary">
            Submit a new workplace injury or incident report
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

          {/* Employee Name */}
          <Box>
            <Typography level="title-sm" fontWeight={500} mb={0.75}>
              Employee Name <Typography component="span" color="danger">*</Typography>
            </Typography>
            <Input
              size="lg"
              placeholder="Full name of the injured employee"
              value={form.EmployeeName}
              onChange={(e) => update("EmployeeName", e.target.value)}
              error={!!errors.EmployeeName}
              sx={{ width: "100%" }}
            />
            {errors.EmployeeName && <Typography level="body-xs" color="danger" mt={0.5}>{errors.EmployeeName}</Typography>}
          </Box>

          {/* Reported By — read-only, auto-filled */}
          <Box>
            <Typography level="title-sm" fontWeight={500} mb={0.75}>Reported By</Typography>
            <Input
              size="lg"
              value={form.ReportedBy}
              readOnly
              endDecorator={<Typography level="body-xs" textColor="text.tertiary">Auto-filled</Typography>}
              sx={{ width: "100%", bgcolor: "background.level1", cursor: "not-allowed", "& input": { cursor: "not-allowed" } }}
            />
            <Typography level="body-xs" textColor="text.tertiary" mt={0.5}>
              Automatically set to your account name.
            </Typography>
          </Box>

          {/* Report Date — read-only, always today */}
          <Box>
            <Typography level="title-sm" fontWeight={500} mb={0.75}>Report Date</Typography>
            <Input
              size="lg"
              value={form.ReportDate}
              readOnly
              endDecorator={<Typography level="body-xs" textColor="text.tertiary">Auto-filled</Typography>}
              sx={{ width: "100%", maxWidth: 320, bgcolor: "background.level1", cursor: "not-allowed", "& input": { cursor: "not-allowed" } }}
            />
            <Typography level="body-xs" textColor="text.tertiary" mt={0.5}>
              Automatically set to today's date.
            </Typography>
          </Box>

          {/* Injury Type */}
          <Box>
            <Typography level="title-sm" fontWeight={500} mb={0.75}>
              Injury Type <Typography component="span" color="danger">*</Typography>
            </Typography>
            <Input
              size="lg"
              placeholder="e.g. Laceration, Sprain, Fracture, Burns"
              value={form.InjuryType}
              onChange={(e) => update("InjuryType", e.target.value)}
              error={!!errors.InjuryType}
              sx={{ width: "100%" }}
            />
            {errors.InjuryType && <Typography level="body-xs" color="danger" mt={0.5}>{errors.InjuryType}</Typography>}
          </Box>

          {/* Location */}
          <Box>
            <Typography level="title-sm" fontWeight={500} mb={0.75}>
              Location <Typography component="span" color="danger">*</Typography>
            </Typography>
            <Input
              size="lg"
              placeholder="e.g. Warehouse Floor A, Loading Dock 3"
              value={form.Location}
              onChange={(e) => update("Location", e.target.value)}
              error={!!errors.Location}
              sx={{ width: "100%" }}
            />
            {errors.Location && <Typography level="body-xs" color="danger" mt={0.5}>{errors.Location}</Typography>}
          </Box>

          {/* Description */}
          <Box>
            <Typography level="title-sm" fontWeight={500} mb={0.75}>
              Description <Typography component="span" color="danger">*</Typography>
            </Typography>
            <Textarea
              placeholder="Describe what happened, how the injury occurred, and any immediate actions taken…"
              value={form.Description}
              onChange={(e) => update("Description", e.target.value)}
              minRows={4}
              maxRows={12}
              error={!!errors.Description}
              sx={{ width: "100%", resize: "vertical" }}
            />
            {errors.Description && <Typography level="body-xs" color="danger" mt={0.5}>{errors.Description}</Typography>}
          </Box>

          {/* Witnesses — optional */}
          <Box>
            <Typography level="title-sm" fontWeight={500} mb={0.75}>
              Witnesses <Typography component="span" level="body-xs" textColor="text.tertiary">(optional)</Typography>
            </Typography>
            <Textarea
              placeholder="List the names of any witnesses present at the time of the incident…"
              value={form.Witnesses}
              onChange={(e) => update("Witnesses", e.target.value)}
              minRows={3}
              maxRows={8}
              sx={{ width: "100%", resize: "vertical" }}
            />
          </Box>

          {/* Additional Notes — optional */}
          <Box>
            <Typography level="title-sm" fontWeight={500} mb={0.75}>
              Additional Notes <Typography component="span" level="body-xs" textColor="text.tertiary">(optional)</Typography>
            </Typography>
            <Textarea
              placeholder="Any extra context, follow-up actions required, or medical treatment details…"
              value={form.AdditionalNotes}
              onChange={(e) => update("AdditionalNotes", e.target.value)}
              minRows={3}
              maxRows={10}
              sx={{ width: "100%", resize: "vertical" }}
            />
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
              Your injury report has been successfully created and logged in the system.
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
