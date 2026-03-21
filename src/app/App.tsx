import { RouterProvider } from "@/app/providers";
import { ThemeProvider } from "@/app/providers/ThemeProvider";
import { ErrorBoundary } from "@/app/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary variant="page">
      <ThemeProvider>
        <RouterProvider />
      </ThemeProvider>
    </ErrorBoundary>
  );
}
