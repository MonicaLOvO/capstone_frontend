"use client";

import React, { useState, useEffect } from "react";
import {
  Box, Typography, Input, Textarea, Button,
  Sheet, Breadcrumbs, Link, Divider,
  Modal, ModalDialog, ModalClose, Stack,
} from "@mui/joy";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import MedicalServicesRoundedIcon from "@mui/icons-material/MedicalServicesRounded";


// The injury-reports endpoint
const API_ENDPOINT = "http://localhost:4000/api/injury-reports";

// ── Today's date formatted as YYYY-MM-DD ──
const TODAY = new Date().toISOString().split("T")[0];

// ── Empty form template ──
const emptyForm = {
  EmployeeName: "",
  ReportedBy: "",       // auto-filled from logged-in user
  ReportDate: TODAY,    // always fixed to today
  InjuryType: "",
  Location: "",
  Description: "",
  Witnesses: "",        // optional
  AdditionalNotes: "",  // optional
};

export default function InjuryReportPage() {
  const [currentUser, setCurrentUser] = useState("");
  const [authToken, setAuthToken] = useState("");

  // ── Auto-login on page load (same pattern as inventory page) ──
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

  // ── Keep ReportedBy in sync once login loads the user ──
  useEffect(() => {
    setForm((prev) => ({ ...prev, ReportedBy: currentUser }));
  }, [currentUser]);

  // ── Update a single field in the form ──
  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // ── Check required fields before submitting ──
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.EmployeeName.trim()) newErrors.EmployeeName = "Employee name is required.";
    else {
      const employeeNameWords = form.EmployeeName.trim().split(/\s+/).length;
      if (employeeNameWords > 50) newErrors.EmployeeName = "Employee name cannot exceed 50 words.";
    }
    if (!form.InjuryType.trim())   newErrors.InjuryType   = "Injury type is required.";
    else {
      const injuryTypeWords = form.InjuryType.trim().split(/\s+/).length;
      if (injuryTypeWords > 80) newErrors.InjuryType = "Injury type cannot exceed 80 words.";
    }
    if (!form.Location.trim())     newErrors.Location     = "Location is required.";
    else {
      const locationWords = form.Location.trim().split(/\s+/).length;
      if (locationWords > 100) newErrors.Location = "Location cannot exceed 100 words.";
    }
    if (!form.Description.trim())  newErrors.Description  = "Description is required.";
    else {
      const descWords = form.Description.trim().split(/\s+/).length;
      if (descWords > 300) newErrors.Description = "Description cannot exceed 300 words.";
    }
    setErrors(newErrors);
    
    return Object.keys(newErrors).length === 0; // true = no errors
  };

  // ── Submit the form to the backend ──
 const handleSubmit = async () => {
  if (!validate()) return;

  const token = authToken || localStorage.getItem("token");

if (!token) {
  alert("Not logged in. Please wait...");
  return;
}

  setSubmitting(true);

  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        EmployeeName:    form.EmployeeName,

        
        Description: `
Employee: ${form.EmployeeName}
Reported By: ${form.ReportedBy}
Date: ${form.ReportDate}
Injury Type: ${form.InjuryType}
Location: ${form.Location}

${form.Description}

Witnesses: ${form.Witnesses || "N/A"}
Additional Notes: ${form.AdditionalNotes || "N/A"}
        `,
      }),
    });

    const data = await response.json();

    if (response.ok && data.Success) {
      setSuccessOpen(true);
    } else if (response.status === 401) {
      alert("Session expired. Please log in again.");
    } else if (response.status === 403) {
      alert("You do not have permission to submit injury reports.");
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

  // ── Reset every field back to empty (keeps ReportedBy from logged-in user) ──
  const handleReset = () => {
    setForm({ ...emptyForm, ReportedBy: currentUser });
    setErrors({});
  };

  // ── "Create Another" button inside the success modal ──
  const handleCreateAnother = () => {
    handleReset();
    setSuccessOpen(false);
  };

  if (!authToken) {
  return <Typography>Loading user session...</Typography>;
}

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
            <Typography level="body-xs" textColor="text.tertiary" mt={0.5}>Max 50 words</Typography>
          </Box>

          {/* Reported By — read-only, auto-filled from login */}
          <Box>
            <Typography level="title-sm" fontWeight={500} mb={0.75}>Reported By</Typography>
            <Input
              size="lg"
              value={form.ReportedBy}
              readOnly
              placeholder={currentUser ? "" : "Loading..."}
              endDecorator={<Typography level="body-xs" textColor="text.tertiary">Auto-filled</Typography>}
              sx={{ width: "100%", bgcolor: "background.level1", cursor: "not-allowed", "& input": { cursor: "not-allowed" } }}
            />
            <Typography level="body-xs" textColor="text.tertiary" mt={0.5}>
              Automatically set to your logged-in account name.
            </Typography>
          </Box>

          {/* Report Date — read-only, fixed to today */}
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
            <Typography level="body-xs" textColor="text.tertiary" mt={0.5}>Max 80 words</Typography>
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
            <Typography level="body-xs" textColor="text.tertiary" mt={0.5}>Max 100 words</Typography>
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
            <Typography level="body-xs" textColor="text.tertiary" mt={0.5}>Max 300 words</Typography>
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
            <Button
  size="lg"
  onClick={handleSubmit}
  loading={submitting}
  disabled={!authToken}   // ✅ ADD THIS
  sx={{ flex: 1 }}
>
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