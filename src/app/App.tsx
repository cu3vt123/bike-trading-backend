import { Toaster } from "sonner";
import { RouterProvider } from "@/app/providers";

export default function App() {
  return (
    <>
      <RouterProvider />
      <Toaster position="top-right" richColors closeButton />
    </>
  );
}
