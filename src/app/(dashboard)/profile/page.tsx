import { Box, Typography, Sheet, Avatar } from "@mui/joy";

export default function ProfilePage() {
  return (
    <Box>
      <Typography level="h2" sx={{ mb: 3 }}>
        My Profile
      </Typography>

      <Sheet
        variant="outlined"
        sx={{
          p: 3,
          borderRadius: "lg",
          maxWidth: 500,
        }}
      >
        <Avatar size="lg" sx={{ mb: 2 }} />

        <Typography level="body-md">
          Name: John Doe
        </Typography>

        <Typography level="body-md">
          Email: john@test.com
        </Typography>

        <Typography level="body-md">
          Role: Manager
        </Typography>
      </Sheet>
    </Box>
  );
}
