'use client';

import { Box, Typography, Button, FormControl, Input, FormLabel, Select, Option, Breadcrumbs, Link } from '@mui/joy';
import SearchIcon from '@mui/icons-material/Search';
import React, { useCallback, useState } from 'react';
import OrderTable from './components/OrderTable';
import OrderList from './components/OrderList';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';

export default function OrdersPage() {
  
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [statusFilter, setStatusFilter] = useState<'all' | '0' | '1'>('all');

  const [total, setTotal] = useState(0);
  const handleTotalChange = useCallback((nextTotal: number) => {
    setTotal(nextTotal);
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  // const { isAuthenticated } = useAuth();

  // Check if user is logged in
    // useEffect(() => {
    //     if (isAuthenticated) {
    //         router.replace('/(tabs)/home');
    //     }
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

          <Button variant="solid" color="primary">
            Download PDF
          </Button>
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
            <Input size="sm" placeholder="Search" startDecorator={<SearchIcon />} />
          </FormControl>

          {renderFilters()}
        </Box>
        {/* Table Container */}
        
          <OrderTable
            page={page}
            pageSize={pageSize}
            statusFilter={statusFilter}
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
    </React.Fragment>
  );
}
