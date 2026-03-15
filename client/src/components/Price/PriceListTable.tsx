import {
  Box,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React, { useState } from "react";

import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useGetAllPriceListsQuery } from "../../services";

export const PriceListTable: React.FC = () => {
  const { data, isLoading, error } = useGetAllPriceListsQuery();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    warehouse: "",
    category: "",
    manufacturer: "",
  });

  if (isLoading) return <Typography>Загрузка прайс-листов...</Typography>;
  if (error)
    return <Typography color="error">Ошибка загрузки данных</Typography>;

  // Группируем товары по складам
  const groupedByWarehouse = data?.items.reduce(
    (acc, item) => {
      if (!acc[item.warehouseName]) {
        acc[item.warehouseName] = [];
      }
      acc[item.warehouseName].push(item);
      return acc;
    },
    {} as Record<string, typeof data.items>,
  );

  const toggleRow = (warehouseName: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(warehouseName)) {
        newSet.delete(warehouseName);
      } else {
        newSet.add(warehouseName);
      }
      return newSet;
    });
  };

  // Получаем уникальные значения для фильтров
  const warehouses = [...new Set(data?.items.map(item => item.warehouseName))];
  const categories = [...new Set(data?.items.map(item => item.category))];
  const manufacturers = [
    ...new Set(data?.items.map(item => item.manufacturer)),
  ];

  // Фильтруем товары
  const filteredItems = data?.items.filter(item => {
    return (
      (!filters.warehouse || item.warehouseName === filters.warehouse) &&
      (!filters.category || item.category === filters.category) &&
      (!filters.manufacturer || item.manufacturer === filters.manufacturer)
    );
  });

  // Форматирование даты
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd.MM.yyyy", { locale: ru });
  };

  // Форматирование цены
  const formatPrice = (price?: number) => {
    return price ? price.toLocaleString("ru-RU") + " ₽" : "—";
  };

  return (
    <Box>
      {/* Фильтры */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Фильтры
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <FormControl fullWidth>
              <InputLabel>Склад</InputLabel>
              <Select
                value={filters.warehouse}
                label="Склад"
                onChange={e =>
                  setFilters({ ...filters, warehouse: e.target.value })
                }
              >
                <MenuItem value="">Все склады</MenuItem>
                {warehouses.map(warehouse => (
                  <MenuItem key={warehouse} value={warehouse}>
                    {warehouse}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={4}>
            <FormControl fullWidth>
              <InputLabel>Категория</InputLabel>
              <Select
                value={filters.category}
                label="Категория"
                onChange={e =>
                  setFilters({ ...filters, category: e.target.value })
                }
              >
                <MenuItem value="">Все категории</MenuItem>
                {categories.map(category => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={4}>
            <FormControl fullWidth>
              <InputLabel>Производитель</InputLabel>
              <Select
                value={filters.manufacturer}
                label="Производитель"
                onChange={e =>
                  setFilters({ ...filters, manufacturer: e.target.value })
                }
              >
                <MenuItem value="">Все производители</MenuItem>
                {manufacturers.map(manufacturer => (
                  <MenuItem key={manufacturer} value={manufacturer}>
                    {manufacturer}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Таблица прайс-листов */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell width="40px"></TableCell>
              <TableCell>Товар</TableCell>
              <TableCell>Производитель</TableCell>
              <TableCell>Категория</TableCell>
              <TableCell align="right">Цена закупки</TableCell>
              <TableCell align="right">Цена для сметы</TableCell>
              <TableCell align="right">Цена для продажи</TableCell>
              <TableCell align="right">Скидка</TableCell>
              <TableCell align="right">Остаток</TableCell>
              <TableCell>Поступление</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredItems?.map((item, index) => (
              <TableRow key={index} hover>
                <TableCell>
                  <Chip
                    label={item.warehouseName}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {item.productName}
                  </Typography>
                </TableCell>
                <TableCell>{item.manufacturer}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell align="right">
                  {formatPrice(item.purchasePrice)}
                </TableCell>
                <TableCell align="right">
                  {formatPrice(item.estimatePrice)}
                </TableCell>
                <TableCell align="right">
                  {formatPrice(item.salePrice)}
                </TableCell>
                <TableCell align="right">
                  {item.discount ? `${item.discount}%` : "—"}
                </TableCell>
                <TableCell align="right">
                  <Chip
                    label={`${item.quantity} ${item.unit}`}
                    size="small"
                    color={item.quantity > 10 ? "success" : "warning"}
                  />
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography
                      variant="caption"
                      display="block"
                      color="textSecondary"
                    >
                      Первое: {formatDate(item.firstArrivalDate)}
                    </Typography>
                    <Typography
                      variant="caption"
                      display="block"
                      color="textSecondary"
                    >
                      Обновлено: {formatDate(item.lastUpdated)}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Итоговая информация */}
      <Paper sx={{ p: 2, mt: 2 }}>
        <Typography variant="body2" color="textSecondary">
          Всего позиций: {filteredItems?.length} | Сформировано:{" "}
          {data?.generatedAt && formatDate(data.generatedAt)}
        </Typography>
      </Paper>
    </Box>
  );
};
