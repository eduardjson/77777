import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { ReactNode } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { darkTheme, lightTheme } from "../theme/muiTheme";

interface MuiThemeWrapperProps {
  children: ReactNode;
}

export const MuiThemeWrapper = ({ children }: MuiThemeWrapperProps) => {
  const { theme } = useTheme();
  const muiTheme = theme === "light" ? lightTheme : darkTheme;

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};
