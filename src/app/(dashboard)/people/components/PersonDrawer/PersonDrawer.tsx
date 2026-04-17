"use client";

import { useEffect, useState } from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Alert,
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  Stack,
  Button,
} from "@mui/joy";
import CloseIcon from "@mui/icons-material/Close";
import WarningAmberRounded from "@mui/icons-material/WarningAmberRounded";
import { Person, type BackendRoleName } from "../PeopleTable";
import { PersonForm, type PersonFormSubmitData } from "./PersonForm";

interface Props {
  open: boolean;
  mode: "create" | "edit";
  person?: Person | null;
  /** Increment when opening Add Person so the form remounts with empty defaults (unsaved draft is discarded). */
  createFormKey?: number;
  /** Increment when opening Edit so the form remounts from saved person data each session. */
  editFormKey?: number;
  currentUserRole: Person["role"];
  /** Backend role – only SuperAdmin can change another Admin's role/status */
  currentUserBackendRole?: BackendRoleName;
  departments: { id: string; name: string }[];
  /** Only roles that exist in DB (from GET /api/role/list) */
  availableRoles: { role: Person["role"]; label: string }[];
  onClose: () => void;
  onSubmit: (data: PersonFormSubmitData) => void | Promise<void>;
  /** Shown when API (create/update) fails */
  submitError?: string | null;
}

export function PersonDrawer({
  open,
  mode,
  person,
  createFormKey = 0,
  editFormKey = 0,
  currentUserRole,
  currentUserBackendRole,
  departments,
  availableRoles,
  onClose,
  onSubmit,
  submitError,
}: Props) {
  const [formDirty, setFormDirty] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      setFormDirty(false);
      setDiscardOpen(false);
    }
  }, [open]);

  function requestClose() {
    if (formDirty) {
      setDiscardOpen(true);
      return;
    }
    onClose();
  }

  return (
    <>
      <Drawer
        open={open}
        onClose={() => requestClose()}
        anchor="right"
        size="md"
        sx={{
          "& .MuiDrawer-content": {
            width: { xs: "100%", sm: 420 },
          },
        }}
      >
        <Box
          sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column" }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography level="h4">
              {mode === "create" ? "Add Person" : "Edit Person"}
            </Typography>

            <IconButton variant="plain" onClick={requestClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          {submitError && (
            <Alert color="danger" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}

          <PersonForm
            key={
              mode === "create"
                ? `create-${createFormKey}`
                : `edit-${person?.id ?? "unknown"}-${editFormKey}`
            }
            mode={mode}
            person={person}
            departments={departments}
            availableRoles={availableRoles}
            currentUserRole={currentUserRole}
            currentUserBackendRole={currentUserBackendRole}
            onSubmit={onSubmit}
            onDirtyChange={setFormDirty}
          />
        </Box>
      </Drawer>

      <Modal
        open={discardOpen}
        onClose={() => setDiscardOpen(false)}
      >
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
            <Stack direction="row" spacing={1.5} sx={{ mt: 2, justifyContent: "flex-end" }}>
              <Button variant="plain" onClick={() => setDiscardOpen(false)}>
                Go back
              </Button>
              <Button
                color="danger"
                variant="solid"
                onClick={() => {
                  setDiscardOpen(false);
                  setFormDirty(false);
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
