"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Sheet,
  Table,
  Modal,
  ModalDialog,
  DialogContent,
  Stack,
  DialogTitle,
} from "@mui/joy";
import {
  departmentsApi,
  ApiDepartment,
} from "@/services/api/departments/departments.api";
import {
  DepartmentDialog,
  DepartmentForm,
} from "./components/DepartmentDialog";
import { Dropdown, Menu, MenuButton, MenuItem, IconButton } from "@mui/joy";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Chip } from "@mui/joy";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<ApiDepartment[]>([]);
  const [loading, setLoading] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ApiDepartment | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<ApiDepartment | null>(null);

  async function loadDepartments() {
    try {
      setLoading(true);

      const res = await departmentsApi.list();
      setDepartments(res.Data ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDepartments();
  }, []);

  return (
    <Box sx={{ width: "100%" }}>
      {/* Header */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          alignItems: { xs: "flex-start", md: "center" },
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography level="h1" sx={{ fontSize: "2.5rem", fontWeight: 700 }}>
            Departments
          </Typography>

          <Typography level="body-sm" sx={{ color: "text.tertiary", mt: 0.5 }}>
            Manage organization departments.
          </Typography>
        </Box>

        <Button
          size="md"
          color="primary"
          sx={{ mt: { xs: 1, md: 0 } }}
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          + Add Department
        </Button>
      </Box>

      {/* Table */}
      <Sheet variant="outlined" sx={{ borderRadius: "lg", overflow: "hidden" }}>
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography level="body-sm">
            Showing {departments.length} department(s)
          </Typography>
        </Box>

        <Table hoverRow sx={{ tableLayout: "fixed" }}>
          <thead>
            <tr>
              <th style={{ width: "30%" }}>Name</th>
              <th style={{ width: "45%" }}>Description</th>
              <th style={{ width: "15%" }}>Status</th>
              <th style={{ width: 80, textAlign: "right" }}></th>
            </tr>
          </thead>

          <tbody>
            {departments.map((d) => (
              <tr key={d.Id}>
                <td>{d.DepartmentName}</td>
                <td>{d.Description || "—"}</td>
                <td>
                  <Chip
                    size="sm"
                    color={d.IsActive ? "success" : "danger"}
                    variant="soft"
                    sx={
                      !d.IsActive
                        ? {
                            bgcolor: "danger.softBg",
                            color: "danger.softColor",
                            opacity: 0.75,
                          }
                        : undefined
                    }
                  >
                    {d.IsActive ? "Active" : "Inactive"}
                  </Chip>
                </td>
                <td style={{ textAlign: "right", paddingRight: "12" }}>
                  <Dropdown>
                    <MenuButton
                      slots={{ root: IconButton }}
                      slotProps={{
                        root: { size: "sm", variant: "soft", color: "neutral" },
                      }}
                    >
                      <MoreHorizIcon />
                    </MenuButton>

                    <Menu placement="bottom-end">
                      {/* EDIT */}
                      <MenuItem
                        onClick={() => {
                          setEditing(d);
                          setDialogOpen(true);
                        }}
                      >
                        Edit
                      </MenuItem>

                      {/* ENABLE / DISABLE */}
                      <MenuItem
                        onClick={async () => {
                          await departmentsApi.update(d.Id, {
                            IsActive: !d.IsActive,
                          });

                          await loadDepartments();
                        }}
                      >
                        {d.IsActive ? "Disable" : "Enable"}
                      </MenuItem>

                      {/* DELETE */}
                      <MenuItem
                        color="danger"
                        onClick={() => {
                          setSelected(d);
                          setDeleteOpen(true);
                        }}
                      >
                        Delete
                      </MenuItem>
                    </Menu>
                  </Dropdown>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Sheet>

      <DepartmentDialog
        key={editing?.Id ?? "create"}
        open={dialogOpen}
        initial={
          editing
            ? {
                name: editing.DepartmentName,
                description: editing.Description ?? "",
              }
            : null
        }
        onClose={() => setDialogOpen(false)}
        onSubmit={async (data) => {
          if (editing) {
            await departmentsApi.update(editing.Id, {
              DepartmentName: data.name,
              Description: data.description,
            });
          } else {
            try {
              await departmentsApi.create({
                DepartmentName: data.name,
                Description: data.description,
              });
            } catch (e) {
              console.error("Create department failed:", e);
            }
          }

          await loadDepartments();
          setDialogOpen(false);
          setEditing(null);
        }}
      />

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <ModalDialog
          variant="outlined"
          role="alertdialog"
          sx={{ borderRadius: "lg", width: 420 }}
        >
          <DialogTitle>Delete department?</DialogTitle>

          <DialogContent>
            <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
              This action cannot be undone.
            </Typography>

            <Typography sx={{ mt: 1 }} fontWeight={600}>
              {selected?.DepartmentName}
            </Typography>

            <Stack
              direction="row"
              justifyContent="flex-end"
              spacing={1.5}
              sx={{ mt: 2 }}
            >
              <Button variant="outlined" onClick={() => setDeleteOpen(false)}>
                Cancel
              </Button>

              <Button
                color="danger"
                onClick={async () => {
                  if (!selected) return;

                  await departmentsApi.remove(selected.Id);
                  await loadDepartments();

                  setDeleteOpen(false);
                  setSelected(null);
                }}
              >
                Delete
              </Button>
            </Stack>
          </DialogContent>
        </ModalDialog>
      </Modal>
    </Box>
  );
}
