import { RouterProvider } from "@/app/providers";
import { ThemeProvider } from "@/app/providers/ThemeProvider";

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider />
    </ThemeProvider>
  );
}
