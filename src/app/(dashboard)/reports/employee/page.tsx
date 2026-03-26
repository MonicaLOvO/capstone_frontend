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
import AssignmentIndRoundedIcon from "@mui/icons-material/AssignmentIndRounded";

// ── Enum matching your backend EmployeeReportTypeEnum ──
enum EmployeeReportTypeEnum {
  Performance = "Performance",
  Conduct = "Conduct",
  Attendance = "Attendance",
  Safety = "Safety Violation",
  Grievance = "Grievance",
  Other = "Other",
}

// ── Backend API base URL ──
const API_ENDPOINT = "http://localhost:4000/api/employee-reports";

// ── Today's date formatted as YYYY-MM-DD ──
const TODAY = new Date().toISOString().split("T")[0];

// ── Empty form template (used on load and after reset) ──
const emptyForm = {
  employeeName: "",
  department: "",           // optional
  reportType: "" as EmployeeReportTypeEnum | "",
  reportDate: TODAY,        // fixed to today
  reportedBy: "",           // auto-filled from logged-in user
  description: "",
  previousWarnings: "",     // optional
  actionTaken: "",          // optional
  additionalNotes: "",      // optional
};

export default function EmployeeReportPage() {
  // ── Pull the logged-in user and token (same pattern as inventory/injury pages) ──
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

  // ── Keep reportedBy in sync once the user loads ──
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
    if (!form.employeeName.trim()) newErrors.employeeName = "Employee name is required.";
    if (!form.reportType)          newErrors.reportType   = "Please select a report type.";
    if (!form.description.trim())  newErrors.description  = "Incident description is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit the form ──
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
          EmployeeName:     form.employeeName,
          Department:       form.department       || null,
          ReportType:       form.reportType,
          ReportDate:       form.reportDate,
          ReportedBy:       form.reportedBy,
          Description:      form.description,
          PreviousWarnings: form.previousWarnings || null,
          ActionTaken:      form.actionTaken      || null,
          AdditionalNotes:  form.additionalNotes  || null,
        }),
      });

      // ── Safer parsing: read as text first ──
      const text = await response.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Invalid JSON from server");
      }

      if (response.ok && data.Success) {
        setSuccessOpen(true);
      } else if (response.status === 401) {
        alert("Session expired. Please log in again.");
      } else if (response.status === 403) {
        alert("You do not have permission to submit employee reports.");
      } else {
        console.error("Backend error:", data);
        alert(data?.Message || "Submission failed.");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      alert("Cannot connect to backend. Make sure server is running on port 4000.");
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

      {/* ── Breadcrumb: Home > Reports > Employee Report ── */}
      <Breadcrumbs size="sm" separator={<ChevronRightRoundedIcon fontSize="small" />} sx={{ mb: 2, pl: 0 }}>
        <Link underline="none" color="neutral" href="/dashboard" aria-label="Home" sx={{ display: "flex", alignItems: "center" }}>
          <HomeRoundedIcon fontSize="small" />
        </Link>
        <Link underline="hover" color="neutral" href="/reports" sx={{ fontSize: "sm", fontWeight: 500 }}>
          Reports
        </Link>
        <Typography color="primary" fontWeight={500} fontSize="sm">
          Employee Report
        </Typography>
      </Breadcrumbs>

      {/* ── Page Title ── */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 4 }}>
        <AssignmentIndRoundedIcon sx={{ fontSize: 32, color: "primary.500" }} />
        <Box>
          <Typography level="h2" fontWeight={600}>Employee Report</Typography>
          <Typography level="body-sm" textColor="text.tertiary">
            Submit a new employee incident or conduct report
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

          {/* Employee Full Name */}
          <Box>
            <Typography level="title-sm" fontWeight={500} mb={0.75}>
              Full Name <Typography component="span" color="danger">*</Typography>
            </Typography>
            <Input
              size="lg"
              placeholder="Full name of the employee being reported"
              value={form.employeeName}
              onChange={(e) => update("employeeName", e.target.value)}
              error={!!errors.employeeName}
              sx={{ width: "100%" }}
            />
            {errors.employeeName && (
              <Typography level="body-xs" color="danger" mt={0.5}>{errors.employeeName}</Typography>
            )}
          </Box>

          {/* Department — optional */}
          <Box>
            <Typography level="title-sm" fontWeight={500} mb={0.75}>
              Department{" "}
              <Typography component="span" level="body-xs" textColor="text.tertiary">(optional)</Typography>
            </Typography>
            <Input
              size="lg"
              placeholder="e.g. Warehouse, Logistics, HR"
              value={form.department}
              onChange={(e) => update("department", e.target.value)}
              sx={{ width: "100%" }}
            />
          </Box>

          {/* Reported By — read-only, auto-filled from JWT user */}
          <Box>
            <Typography level="title-sm" fontWeight={500} mb={0.75}>Reported By</Typography>
            <Input
              size="lg"
              value={form.reportedBy}
              readOnly
              placeholder={currentUser ? "" : "Loading..."}
              endDecorator={<Typography level="body-xs" textColor="text.tertiary">Auto-filled</Typography>}
              sx={{
                width: "100%",
                bgcolor: "background.level1",
                cursor: "not-allowed",
                "& input": { cursor: "not-allowed" },
              }}
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
              value={form.reportDate}
              readOnly
              endDecorator={<Typography level="body-xs" textColor="text.tertiary">Auto-filled</Typography>}
              sx={{
                width: "100%",
                maxWidth: 320,
                bgcolor: "background.level1",
                cursor: "not-allowed",
                "& input": { cursor: "not-allowed" },
              }}
            />
            <Typography level="body-xs" textColor="text.tertiary" mt={0.5}>
              Automatically set to today's date.
            </Typography>
          </Box>

          {/* Report Type — dropdown */}
          <Box>
            <Typography level="title-sm" fontWeight={500} mb={0.75}>
              Report Type <Typography component="span" color="danger">*</Typography>
            </Typography>
            <Select
              placeholder="Select a report type…"
              value={form.reportType || null}
              onChange={(_, val) => update("reportType", val as string)}
              size="lg"
              color={errors.reportType ? "danger" : "neutral"}
              sx={{ width: "100%" }}
            >
              {Object.values(EmployeeReportTypeEnum).map((type) => (
                <Option key={type} value={type}>{type}</Option>
              ))}
            </Select>
            {errors.reportType && (
              <Typography level="body-xs" color="danger" mt={0.5}>{errors.reportType}</Typography>
            )}
          </Box>

          {/* Incident Description */}
          <Box>
            <Typography level="title-sm" fontWeight={500} mb={0.75}>
              Incident Description <Typography component="span" color="danger">*</Typography>
            </Typography>
            <Textarea
              placeholder="Describe the incident in detail…"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              minRows={4}
              maxRows={12}
              error={!!errors.description}
              sx={{ width: "100%", resize: "vertical" }}
            />
            {errors.description && (
              <Typography level="body-xs" color="danger" mt={0.5}>{errors.description}</Typography>
            )}
          </Box>

          {/* Previous Warnings — optional */}
          <Box>
            <Typography level="title-sm" fontWeight={500} mb={0.75}>
              Previous Warnings{" "}
              <Typography component="span" level="body-xs" textColor="text.tertiary">(optional)</Typography>
            </Typography>
            <Textarea
              placeholder="List any previous warnings issued to this employee…"
              value={form.previousWarnings}
              onChange={(e) => update("previousWarnings", e.target.value)}
              minRows={3}
              maxRows={8}
              sx={{ width: "100%", resize: "vertical" }}
            />
          </Box>

          {/* Action Taken — optional */}
          <Box>
            <Typography level="title-sm" fontWeight={500} mb={0.75}>
              Action Taken{" "}
              <Typography component="span" level="body-xs" textColor="text.tertiary">(optional)</Typography>
            </Typography>
            <Textarea
              placeholder="Describe any disciplinary actions taken…"
              value={form.actionTaken}
              onChange={(e) => update("actionTaken", e.target.value)}
              minRows={3}
              maxRows={8}
              sx={{ width: "100%", resize: "vertical" }}
            />
          </Box>

          {/* Additional Notes — optional */}
          <Box>
            <Typography level="title-sm" fontWeight={500} mb={0.75}>
              Additional Notes{" "}
              <Typography component="span" level="body-xs" textColor="text.tertiary">(optional)</Typography>
            </Typography>
            <Textarea
              placeholder="Any extra context or follow-up details…"
              value={form.additionalNotes}
              onChange={(e) => update("additionalNotes", e.target.value)}
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
              Employee record for{" "}
              <Typography component="span" fontWeight={600} textColor="primary.500">
                {form.employeeName}
              </Typography>{" "}
              has been successfully created and logged in the system.
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
