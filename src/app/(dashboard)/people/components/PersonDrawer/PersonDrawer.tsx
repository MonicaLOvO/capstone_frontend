"use client";

import { Drawer, Box, Typography, IconButton } from "@mui/joy";
import CloseIcon from "@mui/icons-material/Close";
import { Person } from "../PeopleTable";
import { PersonForm } from "./PersonForm";

interface Props {
  open: boolean;
  mode: "create" | "edit";
  person?: Person | null;
  currentUserRole: Person["role"]; 
  departments: { id: string; name: string }[];
  onClose: () => void;
  onSubmit: (data: Partial<Person>) => void;
}

export function PersonDrawer({
  open,
  mode,
  person,
  currentUserRole,
  departments,
  onClose,
  onSubmit,

}: Props) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
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

          <IconButton variant="plain" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <PersonForm
          key={person?.id ?? "create"}
          mode={mode}
          person={person}
          departments={departments}
          currentUserRole={currentUserRole}
          onSubmit={onSubmit}
        />
      </Box>
    </Drawer>
  );
}
