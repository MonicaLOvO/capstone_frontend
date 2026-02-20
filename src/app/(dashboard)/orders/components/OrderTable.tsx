'use client';

import { Checkbox, Box, Sheet, Table, Typography, Chip, Link, Avatar } from '@mui/joy';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import BlockIcon from '@mui/icons-material/Block';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useEffect, useMemo, useState } from 'react';
import { ordersApi } from '@/services/api/orders/orders.api';
import type { Order } from '@/services/api/orders/orders.mapper';

interface RowData {
  id: string;
  date: string;
  status: 'Pending' | 'Processing' | 'Unknown';
  customer: {
    name: string;
    email: string;
    initial: string;
  };
}

type SortOrder = 'asc' | 'desc';

type OrderTableProps = {
  page: number;
  pageSize: number;
  statusFilter: 'all' | '0' | '1';
  onTotalChange: (total: number) => void;
};

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
  const customerName = order.customerName || 'Unknown Customer';
  const customerEmail = order.customerEmail || '-';

  return {
    id: order.id,
    date: toDisplayDate(order.orderDate),
    status: toStatusLabel(order.orderStatus),
    customer: {
      name: customerName,
      email: customerEmail,
      initial: customerName.charAt(0).toUpperCase() || '?',
    },
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

export default function OrderTable({ page, pageSize, statusFilter, onTotalChange }: OrderTableProps) {
  const [order, setOrder] = useState<SortOrder>('desc');
  const [selected, setSelected] = useState<readonly string[]>([]);
  const [rows, setRows] = useState<RowData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

        if (cancelled) return;
        setRows(response.items.map(mapOrderToRow));
        onTotalChange(response.total ?? 0);
      } catch (err) {
        if (cancelled) return;
        setRows([]);
        onTotalChange(0);
        setError(err instanceof Error ? err.message : 'Failed to load orders');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadOrders();
    return () => {
      cancelled = true;
    };
  }, [onTotalChange, page, pageSize, statusFilter]);

  useEffect(() => {
    setSelected((ids) => ids.filter((id) => rows.some((row) => row.id === id)));
  }, [rows]);

  const sortedRows = useMemo(() => {
    return [...rows].sort(getComparator(order, 'id'));
  }, [rows, order]);

  const allSelected = rows.length > 0 && selected.length === rows.length;
  const hasPartialSelection = selected.length > 0 && selected.length < rows.length;

  return (
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
            <th style={{ width: 120, padding: '12px 6px' }}>
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
            <th style={{ width: 140, padding: '12px 6px' }}>Date</th>
            <th style={{ width: 140, padding: '12px 6px' }}>Status</th>
            <th style={{ width: 260, padding: '12px 6px' }}>Customer</th>
            <th style={{ width: 140, padding: '12px 6px' }}></th>
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
                <td style={{ textAlign: 'center', width: 120 }}>
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
                  <Chip
                    variant="soft"
                    size="sm"
                    startDecorator={
                      {
                        Processing: <AutorenewRoundedIcon />,
                        Pending: <CheckRoundedIcon />,
                        Unknown: <BlockIcon />,
                      }[row.status]
                    }
                    color={
                      {
                        Processing: 'neutral',
                        Pending: 'success',
                        Unknown: 'danger',
                      }[row.status] as 'success' | 'neutral' | 'danger'
                    }
                  >
                    {row.status}
                  </Chip>
                </td>
                <td>
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <Box>
                      <Typography level="body-xs">{row.customer.name}</Typography>
                      <Typography level="body-xs">{row.customer.email}</Typography>
                    </Box>
                  </Box>
                </td>
                <td>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Link level="body-xs" component="button">
                      Download
                    </Link>
                  </Box>
                </td>
              </tr>
            ))}
        </tbody>
      </Table>
    </Sheet>
  );
}
