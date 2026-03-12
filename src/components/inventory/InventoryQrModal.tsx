"use client";

import { Modal, ModalDialog, DialogTitle, Button } from "@mui/joy";
import { QRCodeCanvas } from "qrcode.react";

export default function InventoryQrModal({ open, value, onClose }: any) {

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog>

        <DialogTitle>QR Code</DialogTitle>

        <QRCodeCanvas
          value={value}
          size={240}
        />

        <Button onClick={onClose}>
          Close
        </Button>

      </ModalDialog>
    </Modal>
  );
}