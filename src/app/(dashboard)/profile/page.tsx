'use client';

import { useState } from "react";
import {
  Box,
  Typography,
  Sheet,
  Link,
  Breadcrumbs,
  Divider,
  AspectRatio,
  Stack,
  Card,
  IconButton,
  FormControl,
  FormLabel,
  Input,
  CardOverflow,
  CardActions,
  Button,
} from "@mui/joy";

import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";

export default function ProfilePage() {
  // Initial values
  const initialValues = {
    firstName: "",
    lastName: "",
    role: "",
    email: "",
  };

  const [formData, setFormData] = useState(initialValues);
  const [isDirty, setIsDirty] = useState(false);

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Check if form differs from initial values
    const updated = { ...formData, [field]: value };
    const hasChanged = Object.keys(initialValues).some(
      (key) => initialValues[key as keyof typeof initialValues] !== updated[key as keyof typeof updated]
    );

    setIsDirty(hasChanged);
  };

  const handleCancel = () => {
    setFormData(initialValues);
    setIsDirty(false);
  };

  const handleSave = () => {
    console.log("Saving:", formData);

    // After successful save, update initialValues reference
    Object.assign(initialValues, formData);
    setIsDirty(false);
  };

  return (
    <Box>

      {/* Breadcrumbs */}
      <Breadcrumbs
        size="sm"
        separator={<ChevronRightRoundedIcon fontSize="small" />}
        sx={{ pl: 0 }}
      >
        <Link underline="none" color="neutral" href="#">
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
          My Profile
        </Typography>
      </Breadcrumbs>

      <Typography level="h2" sx={{ mb: 3 }}>
        My Profile
      </Typography>

      <Sheet
        variant="outlined"
        sx={{
          p: 3,
          borderRadius: "lg",
          maxWidth: 800,
          mx: "auto",
        }}
      >
        <Card>
          <Box sx={{ mb: 1 }}>
            <Typography level="title-md">Personal info</Typography>
            <Typography level="body-sm">
              Customize how your profile information will appear to the network.
            </Typography>
          </Box>

          <Divider />

          {/* Desktop Layout */}
          <Stack
            direction="row"
            spacing={3}
            sx={{ display: { xs: "none", md: "flex" }, my: 2 }}
          >
            <Stack direction="column" spacing={1}>
              <AspectRatio
                ratio="1"
                maxHeight={200}
                sx={{ minWidth: 120, borderRadius: "100%" }}
              >
                
              </AspectRatio>

              <IconButton
                size="sm"
                variant="outlined"
                color="neutral"
                sx={{
                  bgcolor: "background.body",
                  position: "absolute",
                  borderRadius: "50%",
                  left: 100,
                  top: 170,
                  boxShadow: "sm",
                }}
              >
                <EditRoundedIcon />
              </IconButton>
            </Stack>

            <Stack spacing={2} sx={{ flexGrow: 1 }}>
              {/* Name */}
              <Stack spacing={1}>
              <FormLabel>Name</FormLabel>

              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
              >
                <FormControl>
                  <Input
                    size="sm"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={handleChange("firstName")}
                  />
                </FormControl>

                <FormControl sx={{ flexGrow: 1 }}>
                  <Input
                    size="sm"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={handleChange("lastName")}
                  />
                </FormControl>
              </Stack>
            </Stack>

              {/* Role + Email */}
              <Stack direction="row" spacing={2}>
                <FormControl>
                  <FormLabel>Role</FormLabel>
                  <Input
                    size="sm"
                    value={formData.role}
                    onChange={handleChange("role")}
                  />
                </FormControl>

                <FormControl sx={{ flexGrow: 1 }}>
                  <FormLabel>Email</FormLabel>
                  <Input
                    size="sm"
                    type="email"
                    value={formData.email}
                    readOnly
                    startDecorator={<EmailRoundedIcon />}
                  />
                </FormControl>
              </Stack>
            </Stack>
          </Stack>

          {/* Buttons Only When Dirty */}
          {isDirty && (
            <CardOverflow sx={{ borderTop: "1px solid", borderColor: "divider" }}>
              <CardActions sx={{ alignSelf: "flex-end", pt: 2 }}>
                <Button
                  size="sm"
                  variant="outlined"
                  color="neutral"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>

                <Button
                  size="sm"
                  variant="solid"
                  onClick={handleSave}
                >
                  Save
                </Button>
              </CardActions>
            </CardOverflow>
          )}
        </Card>
      </Sheet>
    </Box>
  );
}