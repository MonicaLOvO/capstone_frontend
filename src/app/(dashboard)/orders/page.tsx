import { Box, Typography, Button, Sheet } from '@mui/joy';

export default function OrdersPage() {
  return (
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

      {/* Table Container */}
      <Sheet
        variant="outlined"
        sx={{
          borderRadius: 'md',
          p: 2,
        }}
      >
        <Typography level="body-md">
          Orders table will go here.
        </Typography>
      </Sheet>
    </Box>
  );
}