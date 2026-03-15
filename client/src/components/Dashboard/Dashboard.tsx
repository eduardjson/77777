import {
  Timeline as ActivityIcon,
  ArrowDownward as ArrowDownIcon,
  ArrowUpward as ArrowUpIcon,
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
  Construction as ConstructionIcon,
  Build as HardHatIcon,
  Group as UsersIcon,
  Warehouse as WarehouseIcon,
} from "@mui/icons-material";
import {
  alpha,
  Avatar,
  Box,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useState } from "react";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `dashboard-tab-${index}`,
    "aria-controls": `dashboard-tabpanel-${index}`,
  };
}

export const Dashboard: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const metrics = [
    {
      title: "Количество сотрудников",
      value: "47",
      change: "+12",
      trend: "up",
      icon: UsersIcon,
      color: theme.palette.primary.main,
      secondaryValue: "8 в найме",
    },
    {
      title: "Количество заказчиков",
      value: "124",
      change: "+23",
      trend: "up",
      icon: HardHatIcon,
      color: theme.palette.success.main,
      secondaryValue: "18 активных",
    },
    {
      title: "Завершенные объекты",
      value: "86",
      change: "+15",
      trend: "up",
      icon: CheckCircleIcon,
      color: theme.palette.info.main,
      secondaryValue: "2,450 м²",
    },
    {
      title: "Объекты в процессе",
      value: "12",
      change: "-2",
      trend: "down",
      icon: ActivityIcon,
      color: theme.palette.warning.main,
      secondaryValue: "4 на стадии фундамента",
    },
  ];

  const monthlyProfit = [
    { month: "Янв", profit: 850000, forecast: 780000 },
    { month: "Фев", profit: 920000, forecast: 850000 },
    { month: "Мар", profit: 1100000, forecast: 950000 },
    { month: "Апр", profit: 1050000, forecast: 1000000 },
    { month: "Май", profit: 1250000, forecast: 1100000 },
    { month: "Июн", profit: 1350000, forecast: 1200000 },
    { month: "Июл", profit: 1420000, forecast: 1300000 },
    { month: "Авг", profit: 1380000, forecast: 1350000 },
    { month: "Сен", profit: 1510000, forecast: 1400000 },
    { month: "Окт", profit: 1650000, forecast: 1500000 },
    { month: "Ноя", profit: 1580000, forecast: 1550000 },
    { month: "Дек", profit: 1820000, forecast: 1600000 },
  ];

  const warehouseItems = [
    {
      category: "Пиломатериалы",
      quantity: 1450,
      unit: "м³",
      value: 3450000,
      color: "#f59e0b",
    },
    {
      category: "Металлоконструкции",
      quantity: 28,
      unit: "т",
      value: 2850000,
      color: "#64748b",
    },
    {
      category: "Кровельные материалы",
      quantity: 560,
      unit: "м²",
      value: 980000,
      color: "#ef4444",
    },
    {
      category: "Утеплитель",
      quantity: 320,
      unit: "м³",
      value: 760000,
      color: "#60a5fa",
    },
    {
      category: "Электрика",
      quantity: 1250,
      unit: "шт",
      value: 450000,
      color: "#eab308",
    },
    {
      category: "Сантехника",
      quantity: 340,
      unit: "шт",
      value: 680000,
      color: "#06b6d4",
    },
    {
      category: "Инструмент",
      quantity: 215,
      unit: "ед",
      value: 1250000,
      color: "#a855f7",
    },
  ];

  const recentProjects = [
    {
      name: 'Модульный дом "Эко-Люкс"',
      client: "Смирнов А.В.",
      progress: 85,
      deadline: "15.05.2024",
      status: "active",
    },
    {
      name: 'Дачный комплекс "Скандинавия"',
      client: "Петрова Е.М.",
      progress: 62,
      deadline: "30.06.2024",
      status: "active",
    },
    {
      name: "Банный комплекс с террасой",
      client: 'ООО "Загород"',
      progress: 100,
      deadline: "10.03.2024",
      status: "completed",
    },
    {
      name: "Модульный офис",
      client: "ИП Кузнецов",
      progress: 35,
      deadline: "20.08.2024",
      status: "active",
    },
    {
      name: 'Жилой модуль "Минимал"',
      client: "Козлова И.С.",
      progress: 100,
      deadline: "05.02.2024",
      status: "completed",
    },
  ];

  const maxProfit = Math.max(...monthlyProfit.map(m => m.profit));
  const totalWarehouseValue = warehouseItems.reduce(
    (sum, item) => sum + item.value,
    0,
  );
  const totalWarehouseItems = warehouseItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("ru-RU").format(num);
  };

  return (
    <Box className="px-4 gap-4">
      <Typography variant="h6">Аналитика</Typography>
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        aria-label="dashboard tabs"
      >
        <Tab
          icon={<AssessmentIcon />}
          iconPosition="start"
          label="Общая аналитика"
          {...a11yProps(0)}
        />
        <Tab
          icon={<WarehouseIcon />}
          iconPosition="start"
          label="Склад"
          {...a11yProps(1)}
        />
        <Tab
          icon={<ConstructionIcon />}
          iconPosition="start"
          label="Объекты"
          {...a11yProps(2)}
        />
      </Tabs>
      <TabPanel value={tabValue} index={0}>
        <Grid item xs={12}>
          <List disablePadding>
            {metrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <ListItem
                  key={index}
                  divider={index < metrics.length - 1}
                  disablePadding
                  sx={{ py: 1.5 }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Avatar
                      sx={{ bgcolor: metric.color, width: 32, height: 32 }}
                    >
                      <Icon sx={{ fontSize: 18 }} />
                    </Avatar>
                  </ListItemIcon>

                  <ListItemText
                    primary={
                      <Typography variant="body2" color="text.secondary">
                        {metric.title}
                      </Typography>
                    }
                    secondary={
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: 2,
                        }}
                      >
                        <Typography variant="body1" fontWeight="medium">
                          {metric.value}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {metric.secondaryValue}
                        </Typography>
                      </Box>
                    }
                    secondaryTypographyProps={{ component: "div" }}
                  />

                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    {metric.trend === "up" ? (
                      <ArrowUpIcon
                        sx={{ color: "success.main", fontSize: 16 }}
                      />
                    ) : (
                      <ArrowDownIcon
                        sx={{ color: "error.main", fontSize: 16 }}
                      />
                    )}
                    <Typography
                      variant="caption"
                      sx={{
                        color:
                          metric.trend === "up" ? "success.main" : "error.main",
                        fontWeight: "medium",
                      }}
                    >
                      {metric.change}
                    </Typography>
                  </Box>
                </ListItem>
              );
            })}
          </List>
        </Grid>
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box
              sx={{
                height: 300,
                display: "flex",
                alignItems: "flex-end",
                gap: 1,
              }}
            >
              {monthlyProfit.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <Box
                    sx={{
                      width: "100%",
                      height: `${(item.profit / maxProfit) * 200}px`,
                      bgcolor: "primary.main",
                      borderRadius: 1,
                      opacity: 0.8,
                      transition: "height 0.3s",
                      "&:hover": { opacity: 1 },
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {item.month}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <Grid item xs={12}>
          <Box sx={{ mb: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 0.5,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Всего позиций
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {formatNumber(totalWarehouseItems)} ед
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">
                Общая стоимость
              </Typography>
              <Typography
                variant="body2"
                fontWeight="medium"
                color="success.main"
              >
                {formatNumber(totalWarehouseValue)} ₽
              </Typography>
            </Box>
          </Box>
          <Box sx={{ overflowY: "auto", pr: 1, mb: 2 }}>
            {warehouseItems.map((item, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                  <Box
                    sx={{
                      width: 4,
                      height: 32,
                      bgcolor: item.color,
                      borderRadius: 2,
                      mr: 1.5,
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography variant="body2" fontWeight="medium">
                        {item.category}
                      </Typography>
                      <Typography variant="body2">
                        {item.quantity} {item.unit}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Стоимость
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatNumber(item.value)} ₽
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(item.value / totalWarehouseValue) * 100}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: alpha(item.color, 0.1),
                    "& .MuiLinearProgress-bar": {
                      bgcolor: item.color,
                    },
                  }}
                />
              </Box>
            ))}
          </Box>
        </Grid>
      </TabPanel>
      <TabPanel value={tabValue} index={2}>
        <Grid item xs={12}>
          <Stack spacing={2}>
            {recentProjects.map((project, index) => (
              <Box key={index}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <Box>
                    <Typography variant="body1" fontWeight="medium">
                      {project.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Заказчик: {project.client}
                    </Typography>
                  </Box>
                  <Chip
                    label={
                      project.status === "completed" ? "Завершен" : "В работе"
                    }
                    size="small"
                    color={
                      project.status === "completed" ? "success" : "primary"
                    }
                    variant="outlined"
                  />
                </Box>
                <Box sx={{ mt: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 0.5,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Прогресс
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {project.progress}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={project.progress}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      mb: 0.5,
                      bgcolor: alpha(
                        project.status === "completed"
                          ? theme.palette.success.main
                          : theme.palette.info.main,
                        0.1,
                      ),
                      "& .MuiLinearProgress-bar": {
                        bgcolor:
                          project.status === "completed"
                            ? "success.main"
                            : "info.main",
                      },
                    }}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Срок
                    </Typography>
                    <Typography
                      variant="caption"
                      color={
                        new Date(
                          project.deadline.split(".").reverse().join("-"),
                        ) < new Date()
                          ? "error"
                          : "text.primary"
                      }
                    >
                      {project.deadline}
                    </Typography>
                  </Box>
                </Box>
                {index < recentProjects.length - 1 && (
                  <Divider sx={{ mt: 2 }} />
                )}
              </Box>
            ))}
          </Stack>
        </Grid>
      </TabPanel>
    </Box>
  );
};

export default Dashboard;
