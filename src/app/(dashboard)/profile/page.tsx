'use client';

import * as React from "react";
import { useRef } from "react";
import Image from "next/image";
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
  Button,
  Avatar,
  CircularProgress,
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
} from "@mui/joy";

import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import { useAuth } from "@/auth/AuthProvider";
import { useUserProfileMedia } from "@/hooks/useUserProfileMedia";
import { usersApi } from "@/services/api/users/users.api";

function ProfileDetailsForm({
  userId,
  initialFirstName,
  initialLastName,
  email,
  roleLabel,
  onSaved,
}: {
  userId?: string;
  initialFirstName: string;
  initialLastName: string;
  email: string;
  roleLabel: string;
  onSaved: (nextFirstName: string, nextLastName: string) => void;
}) {
  const [firstName, setFirstName] = React.useState(initialFirstName);
  const [lastName, setLastName] = React.useState(initialLastName);
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [confirmSaveOpen, setConfirmSaveOpen] = React.useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = React.useState(false);

  const isChanged =
    firstName !== initialFirstName || lastName !== initialLastName;

  async function handleSave() {
    if (!userId) return;

    try {
      setSaving(true);
      setSaveError(null);

      await usersApi.updateCurrent({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });

      setConfirmSaveOpen(false);
      onSaved(firstName.trim(), lastName.trim());
    } catch (error: unknown) {
      setSaveError(
        error instanceof Error ? error.message : "Failed to update profile",
      );
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setFirstName(initialFirstName);
    setLastName(initialLastName);
    setSaveError(null);
    setConfirmCancelOpen(false);
  }

  return (
    <>
      <Stack spacing={2} sx={{ flexGrow: 1, alignItems: "stretch" }}>
        <Stack spacing={1}>
          <FormLabel>Name</FormLabel>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <FormControl>
              <Input
                size="sm"
                placeholder="First name"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
              />
            </FormControl>

            <FormControl sx={{ flexGrow: 1 }}>
              <Input
                size="sm"
                placeholder="Last name"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
              />
            </FormControl>
          </Stack>
        </Stack>

        <Stack direction="row" spacing={2}>
          <FormControl>
            <FormLabel>Role</FormLabel>
            <Input size="sm" value={roleLabel} readOnly />
          </FormControl>

          <FormControl sx={{ flexGrow: 1 }}>
            <FormLabel>Email</FormLabel>
            <Input
              size="sm"
              type="email"
              value={email}
              readOnly
              startDecorator={<EmailRoundedIcon />}
            />
          </FormControl>
        </Stack>

        {saveError ? (
          <Typography level="body-sm" color="danger">
            {saveError}
          </Typography>
        ) : null}

        {isChanged ? (
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ alignSelf: "flex-end", pt: 1 }}
          >
            <Button
              size="sm"
              variant="outlined"
              color="neutral"
              onClick={() => setConfirmCancelOpen(true)}
              disabled={saving}
            >
              Cancel
            </Button>

            <Button
              size="sm"
              variant="solid"
              onClick={() => setConfirmSaveOpen(true)}
              loading={saving}
            >
              Save
            </Button>
          </Stack>
        ) : null}
      </Stack>

      <Modal open={confirmSaveOpen} onClose={() => setConfirmSaveOpen(false)}>
        <ModalDialog size="sm">
          <DialogTitle>Confirm Save</DialogTitle>
          <DialogContent>
            <Stack spacing={2}>
              <Typography level="body-sm">
                Save changes to your first and last name?
              </Typography>
              <Stack direction="row" justifyContent="flex-end" spacing={1}>
                <Button
                  variant="outlined"
                  color="neutral"
                  onClick={() => setConfirmSaveOpen(false)}
                  disabled={saving}
                >
                  Back
                </Button>
                <Button onClick={handleSave} loading={saving}>
                  Confirm Save
                </Button>
              </Stack>
            </Stack>
          </DialogContent>
        </ModalDialog>
      </Modal>

      <Modal open={confirmCancelOpen} onClose={() => setConfirmCancelOpen(false)}>
        <ModalDialog size="sm">
          <DialogTitle>Confirm Cancel</DialogTitle>
          <DialogContent>
            <Stack spacing={2}>
              <Typography level="body-sm">
                Discard your unsaved profile name changes?
              </Typography>
              <Stack direction="row" justifyContent="flex-end" spacing={1}>
                <Button
                  variant="outlined"
                  color="neutral"
                  onClick={() => setConfirmCancelOpen(false)}
                >
                  Keep Editing
                </Button>
                <Button color="danger" onClick={handleCancel}>
                  Confirm Cancel
                </Button>
              </Stack>
            </Stack>
          </DialogContent>
        </ModalDialog>
      </Modal>
    </>
  );
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { avatarUrl, avatarError, avatarUploading, uploadProfileMedia } =
    useUserProfileMedia(user?.id);

  const roleLabel = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : "";

  async function handleProfileImageSelected(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !user?.id) return;

    try {
      await uploadProfileMedia(file);
      window.dispatchEvent(new CustomEvent("profile-media-updated"));
    } catch {}
  }

  return (
    <Box>
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
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={`${user?.name ?? "User"} profile`}
                    fill
                    sizes="120px"
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <Avatar
                    size="lg"
                    sx={{ width: "100%", height: "100%", fontSize: 40 }}
                  >
                    {user?.name?.charAt(0).toUpperCase() ?? "U"}
                  </Avatar>
                )}
              </AspectRatio>

              <IconButton
                size="sm"
                variant="outlined"
                color="neutral"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading || !user?.id}
                sx={{
                  bgcolor: "background.body",
                  position: "absolute",
                  borderRadius: "50%",
                  left: 100,
                  top: 190,
                  boxShadow: "sm",
                }}
              >
                {avatarUploading ? (
                  <CircularProgress size="sm" />
                ) : (
                  <EditRoundedIcon />
                )}
              </IconButton>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleProfileImageSelected}
                style={{ display: "none" }}
              />
              {avatarError ? (
                <Typography level="body-xs" color="danger">
                  {avatarError}
                </Typography>
              ) : null}
            </Stack>

            <ProfileDetailsForm
              key={`${user?.id ?? ""}:${user?.firstName ?? ""}:${user?.lastName ?? ""}:${user?.email ?? ""}:${roleLabel}`}
              userId={user?.id}
              initialFirstName={user?.firstName ?? ""}
              initialLastName={user?.lastName ?? ""}
              email={user?.email ?? ""}
              roleLabel={roleLabel}
              onSaved={(nextFirstName, nextLastName) =>
                updateUser({
                  firstName: nextFirstName,
                  lastName: nextLastName,
                  name:
                    [nextFirstName, nextLastName].filter(Boolean).join(" ") ||
                    user?.name ||
                    "User",
                })
              }
            />
          </Stack>
        </Card>
      </Sheet>
    </Box>
  );
}
