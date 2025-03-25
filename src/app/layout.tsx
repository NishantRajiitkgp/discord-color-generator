import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import { createTheme } from '@mantine/core';
import '@mantine/core/styles.css';
import type { Metadata } from 'next';
import './globals.css';

const theme = createTheme({
  /** Your theme configuration here */
});

export const metadata: Metadata = {
  title: 'Discord Colored Text Generator',
  description: 'Generate colored text for Discord using ANSI codes',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider theme={theme}>
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}