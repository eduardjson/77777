import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "../contexts/ThemeContext";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <IconButton
      onClick={toggleTheme}
      color="inherit"
      sx={{
        position: "fixed",
        bottom: 16,
        right: 16,
        zIndex: 9999,
        bgcolor: "background.paper",
        boxShadow: 3,
        "&:hover": {
          bgcolor: "action.hover",
        },
      }}
      className="dark:bg-gray-800 dark:text-white"
    >
      {theme === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
    </IconButton>
  );
};
