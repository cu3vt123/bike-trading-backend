import { RouterProvider as ReactRouterProvider } from "react-router-dom";
import { router } from "@/app/router";

export function RouterProvider() {
  return <ReactRouterProvider router={router} />;
}
