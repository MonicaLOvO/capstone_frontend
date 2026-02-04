'use client'

import { useEffect, useState } from 'react';
import { Box, Typography, Button, Sheet, FormControl, Input, FormLabel, Avatar, Link, Table, Checkbox, Chip, ColorPaletteProp } from '@mui/joy';
import SearchIcon from '@mui/icons-material/Search';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useRouter } from 'next/navigation';

export default function OrderTable() {

    const router = useRouter();
    // const { isAuthenticated } = useAuth();

    const [order, setOrder] = useState<Order>('desc');
    const [rows, setRows] = useState([]);
    const [selected, setSelected] = useState<readonly string[]>([]);
    
    // Check if user is logged in
    // useEffect(() => {
    //     if (isAuthenticated) {
    //         router.replace('/(tabs)/home');
    //     }
    // }, [isAuthenticated, router]);

    //Sort orders descending
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


    return(

        <Sheet
            className="OrderTableContainer"
            variant="plain"
            sx={{
                display: { xs: 'none', sm: 'initial' },
                width: '100%',
                borderRadius: 'sm',
                flexShrink: 1,
                overflow: 'auto',
                minHeight: 0,
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
                {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
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
                        slotProps={{ checkbox: { sx: { textAlign: 'left' } } }}
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
                            Paid: <CheckRoundedIcon />,
                            Refunded: <AutorenewRoundedIcon />,
                            Cancelled: <BlockIcon />,
                        }[row.status]
                        }
                        color={
                        {
                            Paid: 'success',
                            Refunded: 'neutral',
                            Cancelled: 'danger',
                        }[row.status] as ColorPaletteProp
                        }
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
                        {/* <RowMenu /> */}
                    </Box>
                    </td>
                </tr>
                ))}
            </tbody>
            </Table>
        </Sheet>
    );
}