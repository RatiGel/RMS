"use client";

import { useState } from "react";

// React 19 warns about <script> tags in client components even with dangerouslySetInnerHTML.
// next-themes injects an inline script for flash-of-wrong-theme prevention — this is
// intentional and correct, but React 19 doesn't execute inline scripts on client renders
// (only during SSR, which is exactly when next-themes needs it). Suppress the false alarm.
if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
  const _consoleError = console.error.bind(console);
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === "string" && args[0].includes("Encountered a script tag")) return;
    _consoleError(...args);
  };
}
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60_000, retry: 1 },
        },
      })
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ThemeProvider>
  );
}
