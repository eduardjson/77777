import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Autocomplete,
  Typography,
  Alert,
  CircularProgress,
  Grid,
} from "@mui/material";
import { useGetAllProductsQuery } from "../../services";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAddStockMutation, useGetWarehouseQuery } from "../../services";

export interface AddStockDto {
  productId: string;
  quantity: number;
  purchasePrice?: number;
  estimatePrice?: number;
  salePrice?: number;
  discount?: number;
}

export interface StockItem {
  id: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  purchasePrice?: number;
  estimatePrice?: number;
  salePrice?: number;
  discount?: number;
  createdAt: string;
  updatedAt: string;
  product: Product;
}

// Расширенная схема с ценами и скидкой
const stockSchema = z.object({
  productId: z.string().min(1, "Выберите товар"),
  quantity: z
    .number()
    .min(1, "Количество должно быть больше 0")
    .int("Количество должно быть целым числом"),
  purchasePrice: z.preprocess(
    val => (val === "" ? undefined : Number(val)),
    z.number().positive("Цена должна быть положительной").optional(),
  ),
  estimatePrice: z.preprocess(
    val => (val === "" ? undefined : Number(val)),
    z.number().positive("Цена должна быть положительной").optional(),
  ),
  salePrice: z.preprocess(
    val => (val === "" ? undefined : Number(val)),
    z.number().positive("Цена должна быть положительной").optional(),
  ),
  discount: z.preprocess(
    val => (val === "" ? undefined : Number(val)),
    z
      .number()
      .min(0, "Скидка не может быть меньше 0")
      .max(100, "Скидка не может быть больше 100")
      .optional(),
  ),
});

type StockFormData = z.infer<typeof stockSchema>;

interface AddStockFormProps {
  open: boolean;
  onClose: () => void;
  warehouseId: string;
  warehouseName: string;
}

export const AddStockForm: React.FC<AddStockFormProps> = ({
  open,
  onClose,
  warehouseId,
  warehouseName,
}) => {
  const [addStock, { isLoading: isAdding }] = useAddStockMutation();
  const { data: products, isLoading: productsLoading } =
    useGetAllProductsQuery();
  const { data: warehouse, refetch: refetchWarehouse } = useGetWarehouseQuery(
    warehouseId,
    { skip: !open },
  );

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<StockFormData>({
    resolver: zodResolver(stockSchema),
    defaultValues: {
      productId: "",
      quantity: 1,
      purchasePrice: "",
      estimatePrice: "",
      salePrice: "",
      discount: "",
    },
  });

  // Сброс формы при открытии/закрытии
  useEffect(() => {
    if (open) {
      reset({
        productId: "",
        quantity: 1,
        purchasePrice: "",
        estimatePrice: "",
        salePrice: "",
        discount: "",
      });
      setSelectedProduct(null);
      setSuccessMessage(null);
      setErrorMessage(null);
    }
  }, [open, reset]);

  // Получение текущего остатка товара на складе
  const getCurrentStock = (productId: string): number => {
    const stockItem = warehouse?.stockItems?.find(
      (item: any) => item.productId === productId,
    );
    return stockItem?.quantity || 0;
  };

  const handleProductChange = (event: any, newValue: any) => {
    setSelectedProduct(newValue);
    setValue("productId", newValue?.id || "", { shouldValidate: true });
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const onSubmit = async (data: StockFormData) => {
    try {
      setErrorMessage(null);
      // Передаём все поля в мутацию
      const result = await addStock({
        warehouseId,
        body: data, // теперь data содержит цены и скидку
      }).unwrap();

      setSuccessMessage(`Товар успешно добавлен на склад!`);
      await refetchWarehouse();

      setTimeout(() => {
        reset({
          productId: "",
          quantity: 1,
          purchasePrice: "",
          estimatePrice: "",
          salePrice: "",
          discount: "",
        });
        setSelectedProduct(null);
        setSuccessMessage(null);
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error("Failed to add stock:", error);
      setErrorMessage(
        error.data?.message || "Ошибка при добавлении товара на склад",
      );
    }
  };

  const getProductOptionLabel = (product: any) => {
    const currentStock = getCurrentStock(product.id);
    return `${product.title} (${product.manufacturer}) - Текущий остаток: ${currentStock} ${product.unit || "шт"}`;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Добавить товар на склад "{warehouseName}"</DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3}>
            {successMessage && (
              <Alert severity="success" onClose={() => setSuccessMessage(null)}>
                {successMessage}
              </Alert>
            )}

            {errorMessage && (
              <Alert severity="error" onClose={() => setErrorMessage(null)}>
                {errorMessage}
              </Alert>
            )}

            {/* Выбор товара */}
            <Controller
              name="productId"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  {...field}
                  options={products || []}
                  loading={productsLoading}
                  getOptionLabel={option =>
                    typeof option === "string" ? option : option.title
                  }
                  value={selectedProduct}
                  onChange={handleProductChange}
                  renderOption={(props, option) => (
                    <li {...props}>
                      <Box>
                        <Typography variant="body1">{option.title}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {option.manufacturer} | Категория: {option.category} |
                          Текущий остаток: {getCurrentStock(option.id)}{" "}
                          {option.unit || "шт"}
                        </Typography>
                      </Box>
                    </li>
                  )}
                  renderInput={params => (
                    <TextField
                      {...params}
                      label="Выберите товар"
                      error={!!errors.productId}
                      helperText={errors.productId?.message}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {productsLoading && <CircularProgress size={20} />}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
              )}
            />

            {/* Количество */}
            <Controller
              name="quantity"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  label="Количество"
                  error={!!errors.quantity}
                  helperText={errors.quantity?.message}
                  fullWidth
                  onChange={e => field.onChange(Number(e.target.value))}
                  inputProps={{ min: 1, step: 1 }}
                />
              )}
            />

            {/* Блок цен и скидки */}
            <Typography variant="subtitle1" sx={{ mt: 1 }}>
              Цены и скидка (необязательно)
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Controller
                  name="purchasePrice"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      label="Цена закупки"
                      error={!!errors.purchasePrice}
                      helperText={errors.purchasePrice?.message}
                      fullWidth
                      value={field.value ?? ""}
                      onChange={e =>
                        field.onChange(
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                      inputProps={{ step: 0.01, min: 0 }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <Controller
                  name="estimatePrice"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      label="Цена для сметы"
                      error={!!errors.estimatePrice}
                      helperText={errors.estimatePrice?.message}
                      fullWidth
                      value={field.value ?? ""}
                      onChange={e =>
                        field.onChange(
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                      inputProps={{ step: 0.01, min: 0 }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <Controller
                  name="salePrice"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      label="Цена для продажи"
                      error={!!errors.salePrice}
                      helperText={errors.salePrice?.message}
                      fullWidth
                      value={field.value ?? ""}
                      onChange={e =>
                        field.onChange(
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                      inputProps={{ step: 0.01, min: 0 }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <Controller
                  name="discount"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      label="Скидка (%)"
                      error={!!errors.discount}
                      helperText={errors.discount?.message}
                      fullWidth
                      value={field.value ?? ""}
                      onChange={e =>
                        field.onChange(
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                      inputProps={{ step: 1, min: 0, max: 100 }}
                    />
                  )}
                />
              </Grid>
            </Grid>

            {/* Информация о выбранном товаре */}
            {selectedProduct && (
              <Box bgcolor="#f5f5f5" p={2} borderRadius={1}>
                <Typography variant="subtitle2" gutterBottom>
                  Информация о товаре:
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Название:
                    </Typography>
                    <Typography variant="body2">
                      {selectedProduct.title}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Производитель:
                    </Typography>
                    <Typography variant="body2">
                      {selectedProduct.manufacturer}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Категория:
                    </Typography>
                    <Typography variant="body2">
                      {selectedProduct.category}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Единица измерения:
                    </Typography>
                    <Typography variant="body2">
                      {selectedProduct.unit || "шт"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                      Текущий остаток на складе:
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {getCurrentStock(selectedProduct.id)}{" "}
                      {selectedProduct.unit || "шт"}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Предупреждение о новом товаре */}
            {selectedProduct && getCurrentStock(selectedProduct.id) === 0 && (
              <Alert severity="info">
                Этот товар отсутствует на складе. После добавления он появится в
                списке остатков.
              </Alert>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={isAdding}>
            Отмена
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || isAdding || !selectedProduct}
            startIcon={isAdding ? <CircularProgress size={20} /> : null}
          >
            {isAdding ? "Добавление..." : "Добавить на склад"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
