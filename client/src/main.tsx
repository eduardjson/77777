import { Provider } from "react-redux";
import "./index.css";
import { store } from "./store/store";

import { createRouter, RouterProvider } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ToastContainer } from "react-toastify";
import { routeTree } from "./routeTree.gen";
// Импортируем новые компоненты для темы
import { MuiThemeWrapper } from "./components/MuiThemeWrapper";
import { ThemeProvider } from "./contexts/ThemeContext";

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const isProduction = process.env.NODE_ENV === "production";
const container = document.getElementById("root");

if (container) {
  const root = createRoot(container);

  root.render(
    <StrictMode>
      <Provider store={store}>
        {/* Оборачиваем всё в ThemeProvider */}
        <ThemeProvider>
          {/* MuiThemeWrapper использует тему из контекста */}
          <MuiThemeWrapper>
            <ToastContainer
              // Добавляем поддержку темы для тостов
              theme={
                window.document.documentElement.classList.contains("dark")
                  ? "dark"
                  : "light"
              }
              position="top-right"
              autoClose={3000}
            />
            <RouterProvider router={router} />
            {!isProduction && (
              <TanStackRouterDevtools router={router} position="bottom-left" />
            )}
          </MuiThemeWrapper>
        </ThemeProvider>
      </Provider>
    </StrictMode>,
  );
} else {
  throw new Error(
    "Root element with ID 'root' was not found in the document. Ensure there is a corresponding HTML element with the ID 'root' in your HTML file.",
  );
}
