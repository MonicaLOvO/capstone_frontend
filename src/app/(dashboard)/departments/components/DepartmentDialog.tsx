"use client";

import {
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  FormControl,
  FormLabel,
  Input,
  Button,
  Stack,
  Typography,
} from "@mui/joy";
import WarningAmberRounded from "@mui/icons-material/WarningAmberRounded";
import { useEffect, useMemo, useState } from "react";
import { validateDepartment, DepartmentInput } from "@/validation/department.validation";

export interface DepartmentForm {
  name: string;
  description: string;
}

function getInitialForm(initial?: DepartmentForm | null): DepartmentForm {
  return {
    name: initial?.name ?? "",
    description: initial?.description ?? "",
  };
}

function formIsDirty(a: DepartmentForm, b: DepartmentForm): boolean {
  return a.name !== b.name || a.description !== b.description;
}

export function DepartmentDialog({
  open,
  initial,
  onClose,
  onSubmit,
  submitError,
}: {
  open: boolean;
  initial?: DepartmentForm | null;
  onClose: () => void;
  onSubmit: (data: DepartmentForm) => Promise<void>;
  submitError?: string | null;
}) {
  const [form, setForm] = useState<DepartmentForm>(() => getInitialForm(initial));
  const baseline = useMemo(
    () => getInitialForm(initial),
    [initial?.name, initial?.description],
  );

  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [touched, setTouched] =
    useState<Partial<Record<keyof DepartmentInput, boolean>>>({});
  const [discardOpen, setDiscardOpen] = useState(false);

  const validation = useMemo(() => validateDepartment(form), [form]);
  const visibleErrors = useMemo(() => {
    if (hasSubmitted) return validation;
    const next: Partial<Record<keyof DepartmentInput, string>> = {};
    (Object.keys(validation) as (keyof DepartmentInput)[]).forEach((key) => {
      if (touched[key]) next[key] = validation[key];
    });
    return next;
  }, [validation, touched, hasSubmitted]);

  const isDirty = useMemo(() => formIsDirty(form, baseline), [form, baseline]);

  useEffect(() => {
    if (!open) {
      setDiscardOpen(false);
      setHasSubmitted(false);
      setTouched({});
    }
  }, [open]);

  const setField = <K extends keyof DepartmentForm>(
    key: K,
    value: DepartmentForm[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setTouched((prev) => ({ ...prev, [key]: true }));
  };

  function requestClose() {
    if (isDirty) {
      setDiscardOpen(true);
      return;
    }
    onClose();
  }

  return (
    <>
      <Modal open={open} onClose={() => requestClose()}>
        <ModalDialog
          size="md"
          sx={{
            width: 520,
            borderRadius: "lg",
          }}
        >
          <DialogTitle>
            <Stack spacing={0.5}>
              <Typography level="h3">
                {initial ? "Edit Department" : "Add Department"}
              </Typography>

              <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                Departments organize users and permissions across the system.
              </Typography>
            </Stack>
          </DialogTitle>

          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              {submitError ? (
                <Typography level="body-sm" color="danger">
                  {submitError}
                </Typography>
              ) : null}
              <FormControl required>
                <FormLabel>Department Name</FormLabel>
                <Input
                  placeholder="e.g. IT, Sales, Warehouse"
                  value={form.name}
                  error={!!visibleErrors.name}
                  onChange={(e) => setField("name", e.target.value)}
                />
                {visibleErrors.name && (
                  <Typography level="body-xs" color="danger">
                    {visibleErrors.name}
                  </Typography>
                )}
              </FormControl>

              <FormControl error={!!visibleErrors.description}>
                <FormLabel>Description</FormLabel>
                <Input
                  placeholder="Optional description (max 200 characters)"
                  value={form.description}
                  error={!!visibleErrors.description}
                  onChange={(e) => setField("description", e.target.value)}
                />
                {visibleErrors.description && (
                  <Typography level="body-xs" color="danger">
                    {visibleErrors.description}
                  </Typography>
                )}
              </FormControl>

              <Stack
                direction="row"
                justifyContent="flex-end"
                spacing={1.5}
                sx={{ pt: 1 }}
              >
                <Button variant="outlined" onClick={requestClose}>
                  Cancel
                </Button>

                <Button
                  color="primary"
                  onClick={() => {
                    setHasSubmitted(true);

                    if (Object.keys(validation).length > 0) return;

                    onSubmit({
                      name: form.name.trim(),
                      description: form.description.trim(),
                    });
                  }}
                >
                  Save Department
                </Button>
              </Stack>
            </Stack>
          </DialogContent>
        </ModalDialog>
      </Modal>

      <Modal open={discardOpen} onClose={() => setDiscardOpen(false)}>
        <ModalDialog
          variant="outlined"
          role="alertdialog"
          sx={{ borderRadius: "lg", maxWidth: 420 }}
        >
          <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <WarningAmberRounded color="warning" />
            Discard changes?
          </DialogTitle>
          <DialogContent>
            <Typography level="body-sm" sx={{ color: "text.secondary" }}>
              Are you sure you want to close? Any unsaved changes will be lost.
            </Typography>
            <Stack
              direction="row"
              spacing={1.5}
              sx={{ mt: 2, justifyContent: "flex-end" }}
            >
              <Button variant="plain" onClick={() => setDiscardOpen(false)}>
                Go back
              </Button>
              <Button
                color="danger"
                variant="solid"
                onClick={() => {
                  setDiscardOpen(false);
                  onClose();
                }}
              >
                Yes, discard
              </Button>
            </Stack>
          </DialogContent>
        </ModalDialog>
      </Modal>
    </>
  );
}
