'use client';

import { ReactNode } from 'react';
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';

export default function ThemeRegistry({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <CssVarsProvider>
      <CssBaseline />
      {children}
    </CssVarsProvider>
  );
}