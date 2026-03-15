import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Paper,
  Grid,
  Typography,
  Slider,
  Chip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Search, Clear, FilterList } from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  setSearchQuery,
  setManufacturer,
  setMinPrice,
  setMaxPrice,
  resetFilters,
} from "../../services/slices/filterSlice";
import {
  selectUniqueManufacturers,
  selectFilterStats,
} from "../../services/selectors/productSelectors";
import debounce from "lodash/debounce";

export const ProductFilter: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.between("md", "lg"));

  const dispatch = useAppDispatch();
  const manufacturers = useAppSelector(selectUniqueManufacturers);
  const stats = useAppSelector(selectFilterStats);
  const selectedManufacturer = useAppSelector(
    state => state.filter.manufacturer,
  );

  const [localSearch, setLocalSearch] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);

  const debouncedSearch = React.useMemo(
    () =>
      debounce((value: string) => {
        dispatch(setSearchQuery(value));
      }, 300),
    [dispatch],
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setLocalSearch(value);
    debouncedSearch(value);
  };

  const handleManufacturerChange = (event: any) => {
    dispatch(setManufacturer(event.target.value));
  };

  const handlePriceChange = (_event: Event, newValue: number | number[]) => {
    const range = newValue as [number, number];
    setPriceRange(range);
    dispatch(setMinPrice(range[0]));
    dispatch(setMaxPrice(range[1]));
  };

  const handleReset = () => {
    setLocalSearch("");
    setPriceRange([0, 100000]);
    dispatch(resetFilters());
  };

  const hasActiveFilters = () => {
    return (
      localSearch !== "" ||
      selectedManufacturer !== "" ||
      priceRange[0] > 0 ||
      priceRange[1] < 100000
    );
  };

  // Адаптивные размеры полей
  const fieldSize = isMobile ? "small" : "medium";

  return (
    <Paper
      elevation={2}
      sx={{
        p: { xs: 2, sm: 3 },
        mb: 3,
        borderRadius: 2,
      }}
    >
      {/* Заголовок с фильтрами */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 3,
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <FilterList sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h6" fontWeight={600}>
            Фильтры товаров
          </Typography>
        </Box>

        {hasActiveFilters() && (
          <Chip
            label={`Найдено: ${stats.totalCount}`}
            color="primary"
            size="small"
            sx={{ ml: { xs: 0, sm: 2 }, fontWeight: 500 }}
          />
        )}
      </Box>

      <Grid
        container
        spacing={isMobile ? 2 : 3}
        className="flex flex-row items-center"
      >
        {/* Поиск по названию */}
        <Grid item xs={12} md={5} lg={4}>
          <TextField
            className="w-100"
            label="Поиск по названию"
            value={localSearch}
            onChange={handleSearchChange}
            placeholder="Введите название товара..."
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: "action.active" }} />,
            }}
            size={fieldSize}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 1.5,
              },
            }}
          />
        </Grid>

        {/* Фильтр по производителю */}
        <Grid item xs={12} md={3} lg={3}>
          <FormControl fullWidth size={fieldSize}>
            <InputLabel>Производитель</InputLabel>
            <Select
              value={selectedManufacturer}
              label="Производитель"
              onChange={handleManufacturerChange}
              sx={{ borderRadius: 1.5 }}
              className="w-100"
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

        {/* Фильтр по цене */}
        <Grid item xs={12} md={4} lg={3}>
          <Box sx={{ px: isMobile ? 0 : 1 }}>
            <Typography
              gutterBottom
              variant="body2"
              fontWeight={500}
              sx={{ mb: 1 }}
            >
              Цена
            </Typography>
            <Slider
              value={priceRange}
              size="medium"
              color="success"
              onChange={handlePriceChange}
              valueLabelDisplay="auto"
              min={500}
              max={100000}
              step={1000}
              valueLabelFormat={value => `${value.toLocaleString()} ₽`}
              sx={{
                width: 390, // фиксированная ширина в пикселях
                // или
                // width: '35rem',
                // или
                // width: '100%',
                // maxWidth: 600,
                mt: 1,
                "& .MuiSlider-valueLabel": {
                  fontSize: "0.75rem",
                  fontWeight: 500,
                },
              }}
            />
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mt: 0.5,
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={500}
              >
                {priceRange[0].toLocaleString()} ₽
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={500}
              >
                {priceRange[1].toLocaleString()} ₽
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Кнопка сброса */}
        <Grid item xs={12} lg={2}>
          <Button
            fullWidth
            variant="outlined"
            color="secondary"
            onClick={handleReset}
            startIcon={<Clear />}
            sx={{
              borderRadius: 1.5,
              borderWidth: 2,
              fontWeight: 500,
              "&:hover": {
                borderWidth: 2,
              },
            }}
          >
            Сбросить фильтры
          </Button>
        </Grid>
      </Grid>

      {/* Статистика фильтрации */}
      {hasActiveFilters() && (
        <Box
          sx={{
            mt: 3,
            display: "flex",
            gap: { xs: 2, sm: 4 },
            flexWrap: "wrap",
            p: 2,
            bgcolor: "grey.50",
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mb: 0.5 }}
            >
              Средняя цена
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {stats.averagePrice.toLocaleString()} ₽
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mb: 0.5 }}
            >
              Общий остаток
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {stats.totalQuantity.toLocaleString()} шт.
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mb: 0.5 }}
            >
              Диапазон цен
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {stats.minPrice?.toLocaleString()} -{" "}
              {stats.maxPrice?.toLocaleString()} ₽
            </Typography>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default ProductFilter;
