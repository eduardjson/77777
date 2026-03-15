import { AppBar, Box, Tab, Tabs, Typography } from "@mui/material";
import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Profile } from "../Profile/Profile";

const tabs = [
  { label: "Номенклатура", path: "/products" },
  { label: "Прайсы", path: "/prices" },
  { label: "Управление складом", path: "/warehouses" },
  { label: "Заказчики", path: "/contractors" },
  { label: "Перемещения", path: "/shipments" },
  { label: "Чат документов", path: "/free-chat" },
  { label: "Доступные проекты", path: "/projects" },
  { label: "Сотрудники", path: "/employees" },
];

const pathToTabIndex: Record<string, number> = {
  "/products": 0,
  "/prices": 1,
  "/warehouses": 2,
  "/contractors": 3,
  "/shipments": 4,
  "/free-chat": 5,
  "/projects": 6,
  "/employees": 7,
};

export const Header = () => {
  const navigate = useNavigate();
  const router = useRouter();
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    const unsubscribe = router.subscribe("onLoad", () => {
      const currentPath = router.state.location.pathname;
      const newIndex = pathToTabIndex[currentPath];

      if (newIndex !== undefined && newIndex !== tabIndex) {
        setTabIndex(newIndex);
      }
    });

    const currentPath = router.state.location.pathname;
    const initialIndex = pathToTabIndex[currentPath];
    if (initialIndex !== undefined) {
      setTabIndex(initialIndex);
    }

    return () => {
      unsubscribe();
    };
  }, [router]);

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
    navigate({ to: tabs[newValue].path });
  };

  return (
    <div className="flex flex-col w-full">
      <AppBar
        position="sticky"
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 20px",
          height: "56px",
          bgcolor: "white",
          color: "text.primary",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        }}
      >
        <div className="flex flex-row items-center gap-4">
          <Link
            to="/"
            className="font-bold text-primary-600 hover:text-primary-700 transition-colors"
          >
            <Typography variant="h5" fontWeight={700}>
              СПБ-СНАБЖЕНИЕ
            </Typography>
          </Link>
        </div>
        <Profile />
      </AppBar>

      <Box className="w-full border-b border-gray-200">
        <Tabs
          value={tabIndex}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="auto"
          className="min-h-10"
          classes={{
            indicator: "bg-primary-600 h-0.5",
            root: "min-h-[40px]",
            flexContainer: "min-h-[40px]",
          }}
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontSize: "0.85rem",
              padding: "8px 16px",
            },
          }}
        >
          {tabs.map(tab => (
            <Tab
              key={tab.path}
              label={tab.label}
              className="min-h-10 py-1 text-gray-600 hover:text-gray-900 transition-colors"
            />
          ))}
        </Tabs>
      </Box>
    </div>
  );
};
