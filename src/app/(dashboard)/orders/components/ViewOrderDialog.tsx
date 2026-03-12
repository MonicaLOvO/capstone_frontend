'use client';

import {
  Box,
  Sheet,
  Typography,
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  Stack,
  Button,
  Divider,
} from '@mui/joy';
import { useEffect, useState } from 'react';
import { inventoryApi } from '@/services/api/inventory/inventory.api';
import type { Order } from '@/services/api/orders/orders.mapper';

type ViewOrderDialogProps = {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  error: string | null;
  order: Order | null;
};

function toStatusLabel(status: string): string {
  if (status === '0') return 'Processing';
  if (status === '1') return 'Pending';
  return 'Unknown';
}

function toDisplayDate(value: string): string {
  if (!value) return '-';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString();
}

function formatMoney(value: number): string {
  return `$${value.toFixed(2)}`;
}

function FormField({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ flex: 1 }}>
      <Typography level="body-xs" sx={{ color: 'text.tertiary', mb: 0.5 }}>
        {label}
      </Typography>
      <Sheet variant="soft" sx={{ borderRadius: 'sm', p: 1.25 }}>
        <Typography level="body-sm">{value || '-'}</Typography>
      </Sheet>
    </Box>
  );
}

export default function ViewOrderDialog({
  open,
  onClose,
  loading,
  error,
  order,
}: ViewOrderDialogProps) {
  const [resolvedNames, setResolvedNames] = useState<Record<string, string>>({});
  const total = order
    ? order.orderItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
    : 0;

  useEffect(() => {
    if (!open || !order) return;

    const itemIdsToResolve = Array.from(
      new Set(
        order.orderItems
          .filter((item) => !item.productName && item.inventoryItemId)
          .map((item) => item.inventoryItemId),
      ),
    );

    if (itemIdsToResolve.length === 0) return;

    let cancelled = false;

    async function loadNames() {
      const entries = await Promise.all(
        itemIdsToResolve.map(async (inventoryItemId) => {
          try {
            const inventoryItem = await inventoryApi.getById(inventoryItemId);
            return [inventoryItemId, inventoryItem.productName || inventoryItemId] as const;
          } catch {
            return [inventoryItemId, inventoryItemId] as const;
          }
        }),
      );

      if (!cancelled) {
        setResolvedNames(Object.fromEntries(entries));
      }
    }

    void loadNames();

    return () => {
      cancelled = true;
    };
  }, [open, order]);

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        size="lg"
        sx={{
          width: { xs: '95vw', sm: 760 },
          borderRadius: 'lg',
        }}
      >
        <DialogTitle>
          <Stack spacing={0.5}>
            <Typography level="h3">View Order</Typography>
            <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
              Review the order details and included inventory items.
            </Typography>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {loading ? (
              <Typography level="body-sm">Loading order...</Typography>
            ) : error ? (
              <Typography level="body-sm" color="danger">
                {error}
              </Typography>
            ) : order ? (
              <>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <FormField label="Order Type" value={order.orderType || '-'} />
                  <FormField label="Status" value={toStatusLabel(order.orderStatus)} />
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <FormField label="Order Date" value={toDisplayDate(order.orderDate)} />
                  <FormField
                    label="Completed Date"
                    value={toDisplayDate(order.orderCompletedDate)}
                  />
                </Stack>

                <Stack spacing={1}>
                  <Typography level="title-sm">Items in Order</Typography>
                  {order.orderItems.length === 0 ? (
                    <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
                      No inventory items attached to this order.
                    </Typography>
                  ) : (
                    <Sheet variant="soft" sx={{ borderRadius: 'sm', p: 1 }}>
                      <Stack spacing={1}>
                        {order.orderItems.map((item) => (
                          <Stack
                            key={item.id}
                            direction={{ xs: 'column', sm: 'row' }}
                            justifyContent="space-between"
                            alignItems={{ xs: 'stretch', sm: 'center' }}
                            spacing={1}
                            sx={{ p: 1, borderRadius: 'sm', bgcolor: 'background.surface' }}
                          >
                            <Box>
                              <Typography level="body-sm" fontWeight={600}>
                                {item.productName ||
                                  resolvedNames[item.inventoryItemId] ||
                                  item.inventoryItemId ||
                                  'Unnamed Item'}
                              </Typography>
                              <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                                {item.inventoryItemId}
                              </Typography>
                            </Box>
                            <Stack direction="row" spacing={2}>
                              <Typography level="body-sm">Qty: {item.quantity}</Typography>
                              <Typography level="body-sm">
                                Price: {formatMoney(item.unitPrice * item.quantity)}
                              </Typography>
                            </Stack>
                          </Stack>
                        ))}
                      </Stack>
                    </Sheet>
                  )}
                </Stack>

                <Divider />

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography level="title-md">Total: {formatMoney(total)}</Typography>
                  <Button onClick={onClose}>Close</Button>
                </Stack>
              </>
            ) : null}
          </Stack>
        </DialogContent>
      </ModalDialog>
    </Modal>
  );
}
