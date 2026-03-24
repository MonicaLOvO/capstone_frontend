// "use client";

// import { Modal, ModalDialog, DialogTitle } from "@mui/joy";
// import { Html5QrcodeScanner } from "html5-qrcode";
// import { useEffect } from "react";

// export default function InventoryScannerModal({ open, onClose }: any) {

//   useEffect(() => {

//     if (!open) return;

//     const scanner = new Html5QrcodeScanner(
//       "scanner",
//       { fps: 10, qrbox: 250 },
//       false
//     );

//     scanner.render(
//       (decodedText) => {
//         window.location.href = decodedText;
//       },
//       () => {}
//     );

//     return () => {
//       scanner.clear();
//     };

//   }, [open]);

//   return (
//     <Modal open={open} onClose={onClose}>
//       <ModalDialog>

//         <DialogTitle>Scan QR Code</DialogTitle>

//         <div id="scanner" />

//       </ModalDialog>
//     </Modal>
//   );
// }