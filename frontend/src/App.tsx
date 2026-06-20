import { RouterProvider } from "react-router";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { router } from "@/app/router";

export function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
      <Toaster richColors />
    </ThemeProvider>
  );
}

export default App;
