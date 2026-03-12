'use client';

import {
  Checkbox,
  Sheet,
  Table,
  Typography,
  Chip,
  Dropdown,
  Menu,
  MenuButton,
  MenuItem,
  IconButton,
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  Stack,
  Button,
  Link,
} from '@mui/joy';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import BlockIcon from '@mui/icons-material/Block';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { useEffect, useMemo, useState } from 'react';
import { ordersApi } from '@/services/api/orders/orders.api';
import type { Order } from '@/services/api/orders/orders.mapper';
import ViewOrderDialog from './ViewOrderDialog';

interface RowData {
  id: string;
  date: string;
  status: 'Pending' | 'Processing' | 'Unknown';
  type: string;
}

type SortOrder = 'asc' | 'desc';

type OrderTableProps = {
  page: number;
  pageSize: number;
  statusFilter: 'all' | '0' | '1';
  search: string;
  onTotalChange: (total: number) => void;
};

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function toStatusLabel(status: string): RowData['status'] {
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

function mapOrderToRow(order: Order): RowData {
  return {
    id: order.id,
    date: toDisplayDate(order.orderDate),
    status: toStatusLabel(order.orderStatus),
    type: order.orderType || '-',
  };
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}

function getComparator<Key extends PropertyKey>(
  order: SortOrder,
  orderBy: Key,
): (
  a: { [key in Key]: number | string },
  b: { [key in Key]: number | string },
) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function statusChipProps(status: RowData['status']) {
  return {
    startDecorator: {
      Processing: <AutorenewRoundedIcon />,
      Pending: <CheckRoundedIcon />,
      Unknown: <BlockIcon />,
    }[status],
    color: {
      Processing: 'neutral',
      Pending: 'success',
      Unknown: 'danger',
    }[status] as 'success' | 'neutral' | 'danger',
  };
}

export default function OrderTable({
  page,
  pageSize,
  statusFilter,
  search,
  onTotalChange,
}: OrderTableProps) {
  const [order, setOrder] = useState<SortOrder>('desc');
  const [selected, setSelected] = useState<readonly string[]>([]);
  const [rows, setRows] = useState<RowData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [viewOpen, setViewOpen] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState<string | null>(null);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadOrders() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await ordersApi.list({
          Page: page,
          PageSize: pageSize,
          OrderStatus: statusFilter === 'all' ? undefined : statusFilter,
        });

        const term = normalize(search);
        const matchesTerm = (item: Order): boolean => {
          if (!term) return true;

          return (
            normalize(item.id).includes(term) ||
            normalize(item.orderType).includes(term)
          );
        };

        let items = response.items;
        let total = response.total ?? 0;

        if (term) {
          const [byId, byType] = await Promise.all([
            ordersApi.list({
              Page: page,
              PageSize: pageSize,
              OrderStatus: statusFilter === 'all' ? undefined : statusFilter,
              Id: search.trim(),
            }),
            ordersApi.list({
              Page: page,
              PageSize: pageSize,
              OrderStatus: statusFilter === 'all' ? undefined : statusFilter,
              OrderType: search.trim(),
            }),
          ]);

          const merged = new Map<string, Order>();
          [...response.items, ...byId.items, ...byType.items].forEach((item) => {
            if (matchesTerm(item)) merged.set(item.id, item);
          });

          items = Array.from(merged.values());
          total = items.length;
        }

        if (cancelled) return;
        setRows(items.map(mapOrderToRow));
        onTotalChange(total);
      } catch (err) {
        if (cancelled) return;
        setRows([]);
        onTotalChange(0);
        setError(err instanceof Error ? err.message : 'Failed to load orders');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadOrders();
    return () => {
      cancelled = true;
    };
  }, [onTotalChange, page, pageSize, reloadKey, search, statusFilter]);

  useEffect(() => {
    setSelected((ids) => ids.filter((id) => rows.some((row) => row.id === id)));
  }, [rows]);

  const sortedRows = useMemo(() => {
    return [...rows].sort(getComparator(order, 'id'));
  }, [rows, order]);

  const allSelected = rows.length > 0 && selected.length === rows.length;
  const hasPartialSelection = selected.length > 0 && selected.length < rows.length;
  async function handleView(orderId: string) {
    try {
      setViewOpen(true);
      setViewLoading(true);
      setViewError(null);
      const fullOrder = await ordersApi.getById(orderId);
      setViewOrder(fullOrder);
    } catch (err) {
      setViewOrder(null);
      setViewError(err instanceof Error ? err.message : 'Failed to load order');
    } finally {
      setViewLoading(false);
    }
  }

  function requestDelete(orderId: string) {
    setDeleteId(orderId);
    setDeleteError(null);
    setDeleteOpen(true);
  }

  async function confirmDelete() {
    if (!deleteId) return;

    try {
      setDeleteSubmitting(true);
      setDeleteError(null);
      await ordersApi.remove(deleteId);
      setDeleteOpen(false);
      setDeleteId(null);
      setReloadKey((current) => current + 1);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete order');
    } finally {
      setDeleteSubmitting(false);
    }
  }

  return (
    <>
      <Sheet
        className="OrderTableContainer"
        variant="outlined"
        sx={{
          flex: 1,
          display: { xs: 'none', sm: 'initial' },
          width: '100%',
          borderRadius: 'sm',
          flexShrink: 1,
          overflow: 'auto',
          minHeight: 0,
          maxHeight: 375,
        }}
      >
        <Table
          aria-labelledby="tableTitle"
          stickyHeader
          hoverRow
          sx={{
            '--TableCell-headBackground': 'var(--joy-palette-background-level1)',
            '--Table-headerUnderlineThickness': '1px',
            '--TableRow-hoverBackground': 'var(--joy-palette-background-level1)',
            '--TableCell-paddingY': '4px',
            '--TableCell-paddingX': '8px',
          }}
        >
          <thead>
            <tr>
              <th style={{ width: 48, textAlign: 'center', padding: '12px 6px' }}>
                <Checkbox
                  size="sm"
                  indeterminate={hasPartialSelection}
                  checked={allSelected}
                  onChange={(event) => {
                    setSelected(event.target.checked ? rows.map((row) => row.id) : []);
                  }}
                  color={hasPartialSelection || allSelected ? 'primary' : undefined}
                  sx={{ verticalAlign: 'text-bottom' }}
                />
              </th>
              <th style={{ width: '38.5%', padding: '12px 6px' }}>
                <Link
                  underline="none"
                  color="primary"
                  component="button"
                  onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
                  endDecorator={<ArrowDropDownIcon />}
                  sx={[
                    {
                      fontWeight: 'lg',
                      '& svg': {
                        transition: '0.2s',
                        transform: order === 'desc' ? 'rotate(0deg)' : 'rotate(180deg)',
                      },
                    },
                  ]}
                >
                  Order ID
                </Link>
              </th>
              <th style={{ width: '16%', padding: '12px 6px' }}>Date</th>
              <th style={{ width: '24%', padding: '12px 6px' }}>Type</th>
              <th style={{ width: '14%', padding: '12px 6px' }}>Status</th>
              <th style={{ width: '7.5%', padding: '12px 6px' }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6}>
                  <Typography level="body-sm">Loading orders...</Typography>
                </td>
              </tr>
            )}
            {!isLoading && error && (
              <tr>
                <td colSpan={6}>
                  <Typography level="body-sm" color="danger">
                    {error}
                  </Typography>
                </td>
              </tr>
            )}
            {!isLoading && !error && sortedRows.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <Typography level="body-sm">No orders found.</Typography>
                </td>
              </tr>
            )}
            {!isLoading &&
              !error &&
              sortedRows.map((row) => (
                <tr key={row.id}>
                  <td style={{ textAlign: 'center', width: 48 }}>
                    <Checkbox
                      size="sm"
                      checked={selected.includes(row.id)}
                      color={selected.includes(row.id) ? 'primary' : undefined}
                      onChange={(event) => {
                        setSelected((ids) =>
                          event.target.checked
                            ? ids.concat(row.id)
                            : ids.filter((itemId) => itemId !== row.id),
                        );
                      }}
                      slotProps={{ input: { sx: { textAlign: 'left' } } }}
                      sx={{ verticalAlign: 'text-bottom' }}
                    />
                  </td>
                  <td>
                    <Typography level="body-xs">{row.id}</Typography>
                  </td>
                  <td>
                    <Typography level="body-xs">{row.date}</Typography>
                  </td>
                  <td>
                    <Typography level="body-xs">{row.type}</Typography>
                  </td>
                  <td>
                    <Chip variant="soft" size="sm" {...statusChipProps(row.status)}>
                      {row.status}
                    </Chip>
                  </td>
                  <td>
                    <Dropdown>
                      <MenuButton
                        slots={{ root: IconButton }}
                        slotProps={{
                          root: {
                            size: 'sm',
                            variant: 'soft',
                            color: 'neutral',
                            'aria-label': 'Row actions',
                          },
                        }}
                      >
                        <MoreHorizRoundedIcon />
                      </MenuButton>
                      <Menu size="sm" placement="bottom-end">
                        <MenuItem onClick={() => handleView(row.id)}>
                          <VisibilityRoundedIcon />
                          View
                        </MenuItem>
                        <MenuItem color="danger" onClick={() => requestDelete(row.id)}>
                          <DeleteRoundedIcon />
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

      <ViewOrderDialog
        open={viewOpen}
        onClose={() => {
          setViewOpen(false);
          setViewOrder(null);
          setViewError(null);
        }}
        loading={viewLoading}
        error={viewError}
        order={viewOrder}
      />

      <Modal
        open={deleteOpen}
        onClose={() => {
          if (!deleteSubmitting) {
            setDeleteOpen(false);
            setDeleteId(null);
            setDeleteError(null);
          }
        }}
      >
        <ModalDialog size="sm">
          <DialogTitle>Delete Order?</DialogTitle>
          <DialogContent>
            <Stack spacing={2}>
              <Typography level="body-sm">
                Delete order {deleteId}? This action cannot be undone.
              </Typography>
              {deleteError ? (
                <Typography level="body-sm" color="danger">
                  {deleteError}
                </Typography>
              ) : null}
              <Stack direction="row" justifyContent="flex-end" spacing={1}>
                <Button
                  variant="outlined"
                  color="neutral"
                  onClick={() => {
                    setDeleteOpen(false);
                    setDeleteId(null);
                    setDeleteError(null);
                  }}
                  disabled={deleteSubmitting}
                >
                  Cancel
                </Button>
                <Button color="danger" onClick={confirmDelete} loading={deleteSubmitting}>
                  Delete
                </Button>
              </Stack>
            </Stack>
          </DialogContent>
        </ModalDialog>
      </Modal>
    </>
  );
}
