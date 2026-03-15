import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { ThemeProviderComponent, useTheme } from "./contexts/ThemeContext";

import Layout from "./components/Layout"; // Пример вашего компонента
import { darkTheme, lightTheme } from "./theme/muiTheme";

// Внутренний компонент, который имеет доступ к контексту темы
export const AppContent = () => {
  const { theme } = useTheme();
  const muiTheme = theme === "light" ? lightTheme : darkTheme;

  return (
    <MuiThemeProvider theme={muiTheme}>
      {/* CssBaseline сбрасывает стили и применяет базовые цвета из темы MUI */}
      <CssBaseline />
      <Layout />
    </MuiThemeProvider>
  );
};

function App() {
  return (
    <ThemeProviderComponent>
      <AppContent />
    </ThemeProviderComponent>
  );
}

export default App;
