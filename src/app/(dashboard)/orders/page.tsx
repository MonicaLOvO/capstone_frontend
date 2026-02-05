'use client';

import { Box, Typography, Button, Sheet, FormControl, Input, FormLabel, Select, Option } from '@mui/joy';
import SearchIcon from '@mui/icons-material/Search';
import React, { useState } from 'react';
import OrderTable from './components/OrderTable';
import OrderList from './components/OrderList';


export default function OrdersPage() {
  
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [total, setTotal] = useState(0);

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
          placeholder="Filter by status"
          slotProps={{ button: { sx: { whiteSpace: 'nowrap' } } }}
        >
          <Option value="all">All</Option>
          <Option value="paid">Idle</Option>
          <Option value="pending">In Progress</Option>
        </Select>
      </FormControl>
      <FormControl size="sm">

        {/* Category Filter */}
        <FormLabel>Category</FormLabel>
        <Select size="sm" placeholder="All">
          <Option value="all">All</Option>
          <Option value="refund">Refund</Option>
          <Option value="purchase">Purchase</Option>
          <Option value="debit">Debit</Option>
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
      <Box>
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
        
          <OrderTable />
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