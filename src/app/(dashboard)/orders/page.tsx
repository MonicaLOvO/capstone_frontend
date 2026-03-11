'use client';

import { Box, Typography, Button, FormControl, Input, FormLabel, Select, Option, Breadcrumbs, Link, Stack } from '@mui/joy';
import SearchIcon from '@mui/icons-material/Search';
import React, { useCallback, useEffect, useState } from 'react';
import OrderTable from './components/OrderTable';
import OrderList from './components/OrderList';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import { OrderDialog } from './components/OrderDialog';
import { ordersApi } from '@/services/api/orders/orders.api';
import type { UpsertOrderDTO } from '@/services/api/orders/orders.types';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import router from 'next/router';
import { useAuth } from '@/auth/AuthProvider';

export default function OrdersPage() {
  
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [statusFilter, setStatusFilter] = useState<'all' | '0' | '1'>('all');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 350);
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [total, setTotal] = useState(0);
  const handleTotalChange = useCallback((nextTotal: number) => {
    setTotal(nextTotal);
  }, []);

  async function handleCreate(payload: UpsertOrderDTO) {
    setSubmitting(true);
    try {
      await ordersApi.create(payload);
      setPage(1);
      setRefreshKey((k) => k + 1);
    } finally {
      setSubmitting(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  // const { isAuthenticated } = useAuth();

  // Check if user is logged in
    // useEffect(() => {
        // if (isAuthenticated) {
            // router.replace('/(tabs)/home');
        // }
    // }, [isAuthenticated, router]);

    

  const renderFilters = () => (
    <React.Fragment>
      <FormControl size="sm">

        {/* Status Filter */}
        <FormLabel>Status</FormLabel>
        <Select
          size="sm"
          placeholder="All"
          value={statusFilter}
          onChange={(_, value) => {
            const next = (value ?? 'all') as 'all' | '0' | '1';
            setStatusFilter(next);
            setPage(1);
          }}
          slotProps={{ button: { sx: { whiteSpace: 'nowrap' } } }}
        >
          <Option value="all">All</Option>
          <Option value="1">Pending</Option>
          <Option value="0">Processing</Option>

        </Select>
      </FormControl>
      
      <FormControl size="sm">

        {/* Customer Filter */}
        <FormLabel>Customer</FormLabel>
        <Select size="sm" placeholder="All">
          <Option value="all">All</Option>
        </Select>
      </FormControl>
    </React.Fragment>
  );
  
  return (
    <React.Fragment> 
      <Box
      sx={{
        flex: 1,          
        minHeight: 0,     
        display: 'flex',
        flexDirection: 'column',
      }}
      >

        {/* Page Path */}

        <Breadcrumbs
          size="sm"
          aria-label="breadcrumbs"
          separator={<ChevronRightRoundedIcon fontSize="small" />}
          sx={{ pl: 0 }}
        >
              <Link
                underline="none"
                color="neutral"
                href="#some-link"
                aria-label="Home"
              >
                <HomeRoundedIcon />
              </Link>
              <Link
                underline="hover"
                color="neutral"
                href="/dashboard"
                sx={{ fontSize: 12, fontWeight: 500 }}
              >
                Dashboard
              </Link>
              <Typography color="primary" sx={{ fontWeight: 500, fontSize: 12 }}>
                Orders
              </Typography>
            </Breadcrumbs>
            
        {/* Page Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography level="h2">Orders</Typography>

          <Stack direction="row" spacing={1.5}>
            <Button variant="solid" color="primary">
              Download PDF
            </Button>

            <Button color="primary" variant="solid" onClick={() => setCreateOpen(true)}>
              + Add Order
            </Button>
          </Stack>
          
        </Box>
        

        {/* Table Filters */}

        <Box
          className="SearchAndFilters-tabletUp"
          sx={{
            borderRadius: 'sm',
            py: 2,
            display: { xs: 'none', sm: 'flex' },
            flexWrap: 'wrap',
            gap: 1.5,
            '& > *': {
              minWidth: { xs: '120px', md: '160px' },
            },
          }}
        >
          
          <FormControl sx={{ flex: 1 }} size="sm">
            <FormLabel>Search for order</FormLabel>
            <Input
              size="sm"
              placeholder="Search by order ID, type, customer, or email"
              startDecorator={<SearchIcon />}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </FormControl>

          {renderFilters()}
        </Box>
        {/* Table Container */}
        
          <OrderTable
            key={refreshKey}
            page={page}
            pageSize={pageSize}
            statusFilter={statusFilter}
            search={debouncedSearch}
            onTotalChange={handleTotalChange}
          />
          <OrderList />
      </Box>

       <Box
          sx={{
            px: 2,
            py: 1.5,
            borderTop: "1px solid",
            borderColor: "divider",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="outlined"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>

          <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
            Page {page} of {totalPages}
          </Typography>

          <Button
            variant="outlined"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </Box>

      <OrderDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
        submitting={submitting}
      />
    </React.Fragment>
  );
}
