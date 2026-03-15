import { Add } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  LinearProgress,
  Paper,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip,
  Typography,
} from "@mui/material";
import { useNavigate } from "@tanstack/react-router";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useCallback, useMemo, useRef, useState } from "react";
import { ProductDTO } from "../../dto";
import { useGetAllProductsQuery } from "../../services";
import { selectFilteredProducts } from "../../services/selectors/productSelectors";
import { useAppSelector } from "../../store/hooks";
import ProductFilter from "./ProductFilter";

type Order = "asc" | "desc";

export const ProductList = () => {
  const navigate = useNavigate();
  const { isLoading } = useGetAllProductsQuery();
  const filteredProducts = useAppSelector(selectFilteredProducts);

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [orderBy, setOrderBy] = useState<keyof ProductDTO>("title");
  const [order, setOrder] = useState<Order>("asc");

  // Сортировка продуктов
  const sortedProducts = useMemo(() => {
    if (!filteredProducts) return [];

    return [...filteredProducts].sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];

      if (
        orderBy === "title" ||
        orderBy === "category" ||
        orderBy === "manufacturer"
      ) {
        return order === "asc"
          ? (aValue as string).localeCompare(bValue as string)
          : (bValue as string).localeCompare(aValue as string);
      }

      return 0;
    });
  }, [filteredProducts, orderBy, order]);

  // Виртуализатор
  const rowVirtualizer = useVirtualizer({
    count: sortedProducts.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 52, // Высота строки в пикселях
    overscan: 5, // Количество строк для предварительной загрузки
  });

  const handleRequestSort = (property: keyof ProductDTO) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleRowClick = useCallback(
    (product: ProductDTO) => {
      navigate({ to: `/products/${product.id}` });
    },
    [navigate],
  );

  const columns = [
    {
      id: "imageUrl" as keyof ProductDTO,
      label: "",
      width: 80,
      sortable: false,
    },
    {
      id: "title" as keyof ProductDTO,
      label: "Наименование",
      width: 200,
      sortable: true,
    },
    {
      id: "category" as keyof ProductDTO,
      label: "Категория",
      width: 150,
      sortable: true,
    },
    {
      id: "manufacturer" as keyof ProductDTO,
      label: "Производитель",
      width: 150,
      sortable: true,
    },
  ];

  return (
    <Box sx={{ height: "100%", width: "100%", p: 2 }}>
      {isLoading && <LinearProgress />}

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5">Список товаров</Typography>
        <Tooltip title="Добавьте позицию в номенклатуру">
          <Button
            onClick={() => navigate({ to: "/products/add" })}
            variant="contained"
            startIcon={<Add />}
          >
            Добавить товар
          </Button>
        </Tooltip>
      </Box>

      <ProductFilter />

      {filteredProducts && (
        <Paper
          elevation={3}
          sx={{ mt: 2, borderRadius: 2, overflow: "hidden" }}
        >
          {/* Заголовок таблицы */}
          <TableContainer
            component="div"
            sx={{ borderBottom: "1px solid", borderColor: "divider" }}
          >
            <Table sx={{ minWidth: 650 }} aria-label="таблица товаров">
              <TableHead>
                <TableRow>
                  {columns.map(column => (
                    <TableCell
                      key={column.id}
                      sortDirection={orderBy === column.id ? order : false}
                      sx={{
                        width: column.width,
                        fontWeight: 600,
                        bgcolor: "grey.50",
                        cursor: column.sortable ? "pointer" : "default",
                      }}
                      onClick={() =>
                        column.sortable && handleRequestSort(column.id)
                      }
                    >
                      {column.sortable ? (
                        <TableSortLabel
                          active={orderBy === column.id}
                          direction={orderBy === column.id ? order : "asc"}
                        >
                          {column.label}
                        </TableSortLabel>
                      ) : (
                        column.label
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
            </Table>
          </TableContainer>

          {/* Виртуализированный список */}
          <Box
            ref={tableContainerRef}
            sx={{
              height: "calc(100vh - 300px)",
              overflow: "auto",
              position: "relative",
            }}
          >
            <Box
              sx={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}
            >
              {rowVirtualizer.getVirtualItems().map(virtualRow => {
                const product = sortedProducts[virtualRow.index];

                return (
                  <TableRow
                    key={product.id}
                    hover
                    onClick={() => handleRowClick(product)}
                    sx={{
                      display: "flex",
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                      cursor: "pointer",
                      borderBottom: "1px solid",
                      borderColor: "divider",
                      "&:hover": {
                        backgroundColor: "action.hover",
                      },
                    }}
                  >
                    <TableCell
                      sx={{ width: 80, display: "flex", alignItems: "center" }}
                    >
                      {product.imageUrl && (
                        <Avatar
                          src={product.imageUrl}
                          alt={product.title}
                          variant="rounded"
                          sx={{ width: 36, height: 36 }}
                        />
                      )}
                    </TableCell>
                    <TableCell
                      sx={{ width: 200, display: "flex", alignItems: "center" }}
                    >
                      {product.title}
                    </TableCell>
                    <TableCell
                      sx={{ width: 150, display: "flex", alignItems: "center" }}
                    >
                      {product.category}
                    </TableCell>
                    <TableCell
                      sx={{ width: 150, display: "flex", alignItems: "center" }}
                    >
                      {product.manufacturer}
                    </TableCell>
                  </TableRow>
                );
              })}
            </Box>
          </Box>

          {/* Информация о количестве записей */}
          <Box
            sx={{
              p: 1,
              borderTop: "1px solid",
              borderColor: "divider",
              bgcolor: "grey.50",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Всего записей: {sortedProducts.length}
            </Typography>
          </Box>
        </Paper>
      )}
    </Box>
  );
};
