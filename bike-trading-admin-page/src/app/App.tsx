import { RouterProvider } from "@/app/providers";
import { QueryClientProvider } from "@/app/providers/QueryClientProvider";
import { ThemeProvider } from "@/app/providers/ThemeProvider";
import { ErrorBoundary } from "@/app/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary variant="page">
      <QueryClientProvider>
        <ThemeProvider>
          <RouterProvider />
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
