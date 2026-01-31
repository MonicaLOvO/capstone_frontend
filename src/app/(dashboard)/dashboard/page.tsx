import { Typography, Box } from '@mui/joy';

export default function DashboardPage() {
  return (
    <Box>
      <Typography level="h2" sx={{ mb: 2 }}>
        Dashboard
      </Typography>

      <Box
        sx={{
          height: 200,
          bgcolor: 'background.surface',
          borderRadius: 'md',
        }}
      />
    </Box>
  );
}
