"use client";

import React from "react";
import { Dropdown, Menu, MenuButton, MenuItem, IconButton } from "@mui/joy";

/**
 * InventoryRowMenu
 * - Three-dot menu for actions on each row
 * - Calls the handlers passed from the inventory page
 */
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
      {/* Three-dot trigger button */}
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

      {/* Dropdown menu */}
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