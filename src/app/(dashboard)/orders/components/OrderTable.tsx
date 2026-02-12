'use client';

import { Checkbox, Box, Sheet, Table, Typography, Chip, Link } from '@mui/joy';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'; // Import the icons
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import BlockIcon from '@mui/icons-material/Block';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface RowData {
    id: string;
    date: string;
    status: 'Paid' | 'Refunded' | 'Cancelled';
    customer: {
        name: string;
        email: string;
    };
}

export default function OrderTable() {
    const router = useRouter();

    const [order, setOrder] = useState<Order>('desc');
    // const [rows, setRows] = useState<RowData[]>([]); // Define the type of rows
    const [selected, setSelected] = useState<readonly string[]>([]);

    // Temporary hardcoded data
    const rows = [
  {
    id: 'INV-1234',
    date: 'Feb 3, 2023',
    status: 'Refunded',
    customer: {
      initial: 'O',
      name: 'Olivia Ryhe',
      email: 'olivia@email.com',
    },
  },
  {
    id: 'INV-1233',
    date: 'Feb 3, 2023',
    status: 'Paid',
    customer: {
      initial: 'S',
      name: 'Steve Hampton',
      email: 'steve.hamp@email.com',
    },
  },
  {
    id: 'INV-1232',
    date: 'Feb 3, 2023',
    status: 'Refunded',
    customer: {
      initial: 'C',
      name: 'Ciaran Murray',
      email: 'ciaran.murray@email.com',
    },
  },
  {
    id: 'INV-1231',
    date: 'Feb 3, 2023',
    status: 'Refunded',
    customer: {
      initial: 'M',
      name: 'Maria Macdonald',
      email: 'maria.mc@email.com',
    },
  },
  {
    id: 'INV-1230',
    date: 'Feb 3, 2023',
    status: 'Cancelled',
    customer: {
      initial: 'C',
      name: 'Charles Fulton',
      email: 'fulton@email.com',
    },
  },
  {
    id: 'INV-1229',
    date: 'Feb 3, 2023',
    status: 'Cancelled',
    customer: {
      initial: 'J',
      name: 'Jay Hooper',
      email: 'hooper@email.com',
    },
  },
  {
    id: 'INV-1228',
    date: 'Feb 3, 2023',
    status: 'Refunded',
    customer: {
      initial: 'K',
      name: 'Krystal Stevens',
      email: 'k.stevens@email.com',
    },
  },
  {
    id: 'INV-1227',
    date: 'Feb 3, 2023',
    status: 'Paid',
    customer: {
      initial: 'S',
      name: 'Sachin Flynn',
      email: 's.flyn@email.com',
    },
  },
  {
    id: 'INV-1226',
    date: 'Feb 3, 2023',
    status: 'Cancelled',
    customer: {
      initial: 'B',
      name: 'Bradley Rosales',
      email: 'brad123@email.com',
    },
  },
  {
    id: 'INV-1225',
    date: 'Feb 3, 2023',
    status: 'Paid',
    customer: {
      initial: 'O',
      name: 'Olivia Ryhe',
      email: 'olivia@email.com',
    },
  },
  {
    id: 'INV-1224',
    date: 'Feb 3, 2023',
    status: 'Cancelled',
    customer: {
      initial: 'S',
      name: 'Steve Hampton',
      email: 'steve.hamp@email.com',
    },
  },
  {
    id: 'INV-1223',
    date: 'Feb 3, 2023',
    status: 'Paid',
    customer: {
      initial: 'C',
      name: 'Ciaran Murray',
      email: 'ciaran.murray@email.com',
    },
  },
  {
    id: 'INV-1221',
    date: 'Feb 3, 2023',
    status: 'Refunded',
    customer: {
      initial: 'M',
      name: 'Maria Macdonald',
      email: 'maria.mc@email.com',
    },
  },
  {
    id: 'INV-1220',
    date: 'Feb 3, 2023',
    status: 'Paid',
    customer: {
      initial: 'C',
      name: 'Charles Fulton',
      email: 'fulton@email.com',
    },
  },
  {
    id: 'INV-1219',
    date: 'Feb 3, 2023',
    status: 'Cancelled',
    customer: {
      initial: 'J',
      name: 'Jay Hooper',
      email: 'hooper@email.com',
    },
  },
  {
    id: 'INV-1218',
    date: 'Feb 3, 2023',
    status: 'Cancelled',
    customer: {
      initial: 'K',
      name: 'Krystal Stevens',
      email: 'k.stevens@email.com',
    },
  },
  {
    id: 'INV-1217',
    date: 'Feb 3, 2023',
    status: 'Paid',
    customer: {
      initial: 'S',
      name: 'Sachin Flynn',
      email: 's.flyn@email.com',
    },
  },
  {
    id: 'INV-1216',
    date: 'Feb 3, 2023',
    status: 'Cancelled',
    customer: {
      initial: 'B',
      name: 'Bradley Rosales',
      email: 'brad123@email.com',
    },
  },
];

    // Sort orders descending
    function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
        if (b[orderBy] < a[orderBy]) {
            return -1;
        }
        if (b[orderBy] > a[orderBy]) {
            return 1;
        }
        return 0;
    }

    type Order = 'asc' | 'desc';

    // Sort order items ascending or descending
    function getComparator<Key extends PropertyKey>(
        order: Order,
        orderBy: Key,
    ): (
        a: { [key in Key]: number | string },
        b: { [key in Key]: number | string },
    ) => number {
        return order === 'desc'
            ? (a, b) => descendingComparator(a, b, orderBy)
            : (a, b) => -descendingComparator(a, b, orderBy);
    }

    return (
        <Sheet
            className="OrderTableContainer"
            variant="outlined"
            sx={{
                flex:1,
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
                            {/* Order ID Checkbox */}
                            <Checkbox
                                size="sm"
                                indeterminate={
                                    selected.length > 0 && selected.length !== rows.length
                                }
                                checked={selected.length === rows.length}
                                onChange={(event) => {
                                    setSelected(
                                        event.target.checked ? rows.map((row) => row.id) : [],
                                    );
                                }}
                                color={
                                    selected.length > 0 || selected.length === rows.length
                                        ? 'primary'
                                        : undefined
                                }
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
                                            transform:
                                                order === 'desc' ? 'rotate(0deg)' : 'rotate(180deg)',
                                        },
                                    },
                                    order === 'desc'
                                        ? { '& svg': { transform: 'rotate(0deg)' } }
                                        : { '& svg': { transform: 'rotate(180deg)' } },
                                ]}
                            >
                                Order ID
                            </Link>
                        </th>
                        <th style={{ width: 140, padding: '12px 6px' }}>Date</th>
                        <th style={{ width: 140, padding: '12px 6px' }}>Status</th>
                        <th style={{ width: 240, padding: '12px 6px' }}>Customer</th>
                        <th style={{ width: 140, padding: '12px 6px' }}> </th>
                    </tr>
                </thead>

                <tbody>
                    {[...rows].sort(getComparator(order, 'id')).map((row) => (
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
                                    startDecorator={{
                                        Paid: <CheckRoundedIcon />,
                                        Refunded: <AutorenewRoundedIcon />,
                                        Cancelled: <BlockIcon />,
                                    }[row.status]}
                                    color={{
                                        Paid: 'success',
                                        Refunded: 'neutral',
                                        Cancelled: 'danger',
                                    }[row.status] as 'success' | 'neutral' | 'danger'}
                                >
                                    {row.status}
                                </Chip>
                            </td>
                            <td>
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                    <div>
                                        <Typography level="body-xs">{row.customer.name}</Typography>
                                        <Typography level="body-xs">{row.customer.email}</Typography>
                                    </div>
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