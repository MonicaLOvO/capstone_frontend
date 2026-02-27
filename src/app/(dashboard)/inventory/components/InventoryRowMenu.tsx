"use client";

import React from "react";
import { Dropdown, Menu, MenuButton, MenuItem, IconButton } from "@mui/joy";

export function InventoryRowMenu({
  onEdit,
  onQr,
  onDelete,
}: {
  onEdit: () => void;
  onQr: () => void;
  onDelete: () => void;
}) {
  return (
    <Dropdown>
      <MenuButton
        slots={{ root: IconButton }}
        slotProps={{
          root: {
            variant: "soft",
            color: "neutral",
            size: "sm",
            "aria-label": "Row actions",
          },
        }}
      >
        ⋯
      </MenuButton>

      <Menu placement="bottom-end" variant="outlined">
        <MenuItem onClick={onEdit}>Edit</MenuItem>
        <MenuItem onClick={onQr}>QR Code</MenuItem>
        <MenuItem color="danger" onClick={onDelete}>
          Delete
        </MenuItem>
      </Menu>
    </Dropdown>
  );
}
