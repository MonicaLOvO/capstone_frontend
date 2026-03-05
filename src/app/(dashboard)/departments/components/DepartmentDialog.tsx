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
import { useState } from "react";
import { useEffect } from "react";
import { validateDepartment, DepartmentInput } from "@/validation/department.validation";

export interface DepartmentForm {
  name: string;
  description: string;
}

export function DepartmentDialog({
  open,
  initial,
  onClose,
  onSubmit,
}: {
  open: boolean;
  initial?: DepartmentForm | null;
  onClose: () => void;
  onSubmit: (data: DepartmentForm) => Promise<void>;
}) {
  const [form, setForm] = useState<DepartmentForm>(() => ({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
  }));

  const [errors, setErrors] =
  useState<Partial<Record<keyof DepartmentInput, string>>>({});

  // IMPORTANT:
  // when dialog closes, React unmounts and remounts
  // so state resets automatically — no effect needed

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose}>
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
            <FormControl required>
              <FormLabel>Department Name</FormLabel>
              <Input
                placeholder="e.g. IT, Sales, Warehouse"
                value={form.name}
                error={!!errors.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
              />
              {errors.name && (
                <Typography level="body-xs" color="danger">
                  {errors.name}
                </Typography>
              )}
            </FormControl>

            <FormControl error={!!errors.description}>
              <FormLabel>Description</FormLabel>
              <Input
                placeholder="Optional description (max 200 characters)"
                value={form.description}
                error={!!errors.description}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    description: e.target.value,
                  }))
                }
              />
              {errors.description && (
                <Typography level="body-xs" color="danger">
                  {errors.description}
                </Typography>
              )}
            </FormControl>

            <Stack
              direction="row"
              justifyContent="flex-end"
              spacing={1.5}
              sx={{ pt: 1 }}
            >
              <Button variant="outlined" onClick={onClose}>
                Cancel
              </Button>

              <Button
                color="primary"
                onClick={() => {
                  // if (!form.name.trim()) return;

                  const validation = validateDepartment(form);
                  setErrors(validation);

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
  );
}
