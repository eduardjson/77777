import {
  ArrowDownward as ArrowDownIcon,
  ArrowUpward as ArrowUpIcon,
  CheckCircle as CheckCircleIcon,
  Construction as ConstructionIcon,
  Group as UsersIcon,
  Warehouse as WarehouseIcon,
} from '@mui/icons-material';
import {
  alpha,
  Avatar,
  Box,
  Chip,
  Grid,
  LinearProgress,
  Paper,
  Typography,
  useTheme,
} from '@mui/material';
import React from 'react';

export const Dashboard: React.FC = () => {
  const theme = useTheme();

  const metrics = [
    {
      title: 'Количество сотрудников',
      value: '47',
      change: '+12',
      trend: 'up',
      icon: UsersIcon,
      color: theme.palette.primary.main,
      secondaryValue: '8 в найме',
    },
    {
      title: 'Количество заказчиков',
      value: '124',
      change: '+23',
      trend: 'up',
      icon: UsersIcon,
      color: theme.palette.success.main,
      secondaryValue: '18 активных',
    },
    {
      title: 'Завершенные объекты',
      value: '86',
      change: '+15',
      trend: 'up',
      icon: CheckCircleIcon,
      color: theme.palette.info.main,
      secondaryValue: '2,450 м²',
    },
    {
      title: 'Объекты в процессе',
      value: '12',
      change: '-2',
      trend: 'down',
      icon: ConstructionIcon,
      color: theme.palette.warning.main,
      secondaryValue: '4 на стадии фундамента',
    },
  ];

  const monthlyProfit = [
    { month: 'Янв', profit: 850000 },
    { month: 'Фев', profit: 920000 },
    { month: 'Мар', profit: 1100000 },
    { month: 'Апр', profit: 1050000 },
    { month: 'Май', profit: 1250000 },
    { month: 'Июн', profit: 1350000 },
    { month: 'Июл', profit: 1420000 },
    { month: 'Авг', profit: 1380000 },
    { month: 'Сен', profit: 1510000 },
    { month: 'Окт', profit: 1650000 },
    { month: 'Ноя', profit: 1580000 },
    { month: 'Дек', profit: 1820000 },
  ];

  const warehouseItems = [
    {
      category: 'Пиломатериалы',
      quantity: 1450,
      unit: 'м³',
      value: 3450000,
      color: '#f59e0b',
    },
    {
      category: 'Металлоконструкции',
      quantity: 28,
      unit: 'т',
      value: 2850000,
      color: '#64748b',
    },
    {
      category: 'Кровельные материалы',
      quantity: 560,
      unit: 'м²',
      value: 980000,
      color: '#ef4444',
    },
    {
      category: 'Утеплитель',
      quantity: 320,
      unit: 'м³',
      value: 760000,
      color: '#60a5fa',
    },
    {
      category: 'Электрика',
      quantity: 1250,
      unit: 'шт',
      value: 450000,
      color: '#eab308',
    },
    {
      category: 'Сантехника',
      quantity: 340,
      unit: 'шт',
      value: 680000,
      color: '#06b6d4',
    },
  ];

  const recentProjects = [
    {
      name: 'Модульный дом "Эко-Люкс"',
      client: 'Смирнов А.В.',
      progress: 85,
      deadline: '15.05.2024',
      status: 'active',
    },
    {
      name: 'Дачный комплекс "Скандинавия"',
      client: 'Петрова Е.М.',
      progress: 62,
      deadline: '30.06.2024',
      status: 'active',
    },
    {
      name: 'Банный комплекс с террасой',
      client: 'ООО "Загород"',
      progress: 100,
      deadline: '10.03.2024',
      status: 'completed',
    },
    {
      name: 'Модульный офис',
      client: 'ИП Кузнецов',
      progress: 35,
      deadline: '20.08.2024',
      status: 'active',
    },
  ];

  const maxProfit = Math.max(...monthlyProfit.map((m) => m.profit));
  const totalWarehouseValue = warehouseItems.reduce((sum, item) => sum + item.value, 0);
  const totalWarehouseItems = warehouseItems.reduce((sum, item) => sum + item.quantity, 0);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ru-RU').format(num);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      {/* Заголовок */}
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Панель управления
      </Typography>

      {/* Основные метрики */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
          Основные показатели
        </Typography>
        <Grid container spacing={2}>
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <Grid item xs={12} sm={6} key={index}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <Avatar sx={{ bgcolor: alpha(metric.color, 0.1), color: metric.color }}>
                    <Icon sx={{ fontSize: 20 }} />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {metric.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {metric.value}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {metric.secondaryValue}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {metric.trend === 'up' ? (
                      <ArrowUpIcon sx={{ color: 'success.main', fontSize: 18 }} />
                    ) : (
                      <ArrowDownIcon sx={{ color: 'error.main', fontSize: 18 }} />
                    )}
                    <Typography
                      variant="body2"
                      sx={{
                        color: metric.trend === 'up' ? 'success.main' : 'error.main',
                        fontWeight: 500,
                      }}
                    >
                      {metric.change}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      {/* График прибыли и склад - по 50% ширины */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              height: '100%',
            }}
          >
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Прибыль по месяцам
            </Typography>
            <Box
              sx={{
                height: 200,
                display: 'flex',
                alignItems: 'flex-end',
                gap: 1,
              }}
            >
              {monthlyProfit.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  <Box
                    sx={{
                      width: '100%',
                      height: `${(item.profit / maxProfit) * 160}px`,
                      bgcolor: 'primary.main',
                      borderRadius: 1,
                      opacity: 0.8,
                      transition: 'height 0.3s',
                      '&:hover': { opacity: 1 },
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

        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              height: '100%',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <WarehouseIcon sx={{ color: 'text.secondary' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Склад
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" color="text.secondary">
                  Всего позиций
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {formatNumber(totalWarehouseItems)} ед
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Общая стоимость
                </Typography>
                <Typography variant="body2" fontWeight={600} color="success.main">
                  {formatNumber(totalWarehouseValue)} ₽
                </Typography>
              </Box>
            </Box>

            <Box sx={{ maxHeight: 150, overflowY: 'auto', pr: 1 }}>
              {warehouseItems.map((item, index) => (
                <Box key={index} sx={{ mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <Box
                      sx={{
                        width: 3,
                        height: 24,
                        bgcolor: item.color,
                        borderRadius: 2,
                        mr: 1,
                      }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">{item.category}</Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {item.quantity} {item.unit}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(item.value / totalWarehouseValue) * 100}
                    sx={{
                      height: 4,
                      borderRadius: 2,
                      bgcolor: alpha(item.color, 0.1),
                      '& .MuiLinearProgress-bar': {
                        bgcolor: item.color,
                      },
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Активные проекты */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
          Активные проекты
        </Typography>
        <Grid container spacing={2}>
          {recentProjects.map((project, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {project.name}
                  </Typography>
                  <Chip
                    label={project.status === 'completed' ? 'Завершен' : 'В работе'}
                    size="small"
                    color={project.status === 'completed' ? 'success' : 'primary'}
                    variant="outlined"
                    sx={{ height: 20, '& .MuiChip-label': { px: 1, fontSize: '0.7rem' } }}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                  Заказчик: {project.client}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
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
                      height: 6,
                      borderRadius: 3,
                      mb: 0.5,
                      bgcolor: alpha(
                        project.status === 'completed'
                          ? theme.palette.success.main
                          : theme.palette.info.main,
                        0.1
                      ),
                      '& .MuiLinearProgress-bar': {
                        bgcolor: project.status === 'completed' ? 'success.main' : 'info.main',
                      },
                    }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                      Срок
                    </Typography>
                    <Typography
                      variant="caption"
                      color={
                        new Date(project.deadline.split('.').reverse().join('-')) < new Date()
                          ? 'error'
                          : 'text.primary'
                      }
                      fontWeight={500}
                    >
                      {project.deadline}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

export default Dashboard;
