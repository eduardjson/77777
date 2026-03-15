import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Typography,
  Paper,
  Alert,
  Grid,
  CircularProgress,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useCreateShipmentMutation,
  useGetWarehousesQuery,
  useGetObjectsQuery,
} from "../../services";
import { useGetAllProductsQuery } from "../../services";

import { Shipment } from "../../types";

const shipmentSchema = z.object({
  warehouseId: z.string().min(1, "Выберите склад"),
  objectId: z.string().min(1, "Выберите объект"),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, "Выберите товар"),
        quantity: z.number().min(1, "Количество должно быть больше 0"),
      }),
    )
    .min(1, "Добавьте хотя бы одну позицию"),
});

type ShipmentFormData = z.infer<typeof shipmentSchema>;

interface ShipmentFormProps {
  open: boolean;
  onClose: () => void;
  shipment?: Shipment | null;
}

export const ShipmentForm = ({
  open,
  onClose,
  shipment,
}: ShipmentFormProps) => {
  const [createShipment] = useCreateShipmentMutation();
  const { data: warehouses } = useGetWarehousesQuery();
  const { data: objects } = useGetObjectsQuery();
  const { data: products } = useGetAllProductsQuery();
  const [stockError, setStockError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ShipmentFormData>({
    resolver: zodResolver(shipmentSchema),
    defaultValues: {
      warehouseId: "",
      objectId: "",
      items: [{ productId: "", quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const selectedWarehouseId = watch("warehouseId");
  const selectedWarehouse = warehouses?.find(w => w.id === selectedWarehouseId);

  // Получаем остатки на выбранном складе
  const stockItems = selectedWarehouse?.stockItems || [];

  // Создаем мапу товар -> количество на складе
  const stockMap = new Map(
    stockItems.map(item => [item.productId, item.quantity]),
  );

  // Фильтруем товары, которые есть на складе
  const availableProducts =
    products?.filter(
      product => stockMap.has(product.id) && stockMap.get(product.id)! > 0,
    ) || [];

  useEffect(() => {
    if (shipment) {
      // Для редактирования (если понадобится)
      reset({
        warehouseId: shipment.warehouseId,
        objectId: shipment.objectId,
        items: shipment.items?.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })) || [{ productId: "", quantity: 1 }],
      });
    } else {
      reset({
        warehouseId: "",
        objectId: "",
        items: [{ productId: "", quantity: 1 }],
      });
    }
    setStockError(null);
  }, [shipment, reset, open]);

  const onSubmit = async (data: ShipmentFormData) => {
    // Проверяем наличие товаров на складе перед отправкой
    for (const item of data.items) {
      const available = stockMap.get(item.productId) || 0;
      if (available < item.quantity) {
        const product = products?.find(p => p.id === item.productId);
        setStockError(
          `Недостаточно товара "${product?.title}" на складе. ` +
            `Доступно: ${available}, запрошено: ${item.quantity}`,
        );
        return;
      }
    }

    try {
      await createShipment(data).unwrap();
      onClose();
    } catch (error: any) {
      console.error("Failed to create shipment:", error);
      if (error.data?.message) {
        setStockError(error.data.message);
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {shipment ? "Редактировать отгрузку" : "Новая отгрузка"}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3}>
            {stockError && (
              <Alert severity="error" onClose={() => setStockError(null)}>
                {stockError}
              </Alert>
            )}

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Controller
                  name="warehouseId"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.warehouseId}>
                      <InputLabel>Склад</InputLabel>
                      <Select {...field} label="Склад">
                        {warehouses?.map(warehouse => (
                          <MenuItem key={warehouse.id} value={warehouse.id}>
                            {warehouse.name} (
                            {warehouse.address || "без адреса"})
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.warehouseId && (
                        <Typography variant="caption" color="error">
                          {errors.warehouseId.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={6}>
                <Controller
                  name="objectId"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.objectId}>
                      <InputLabel>Объект</InputLabel>
                      <Select {...field} label="Объект">
                        {objects?.map(object => (
                          <MenuItem key={object.id} value={object.id}>
                            {object.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.objectId && (
                        <Typography variant="caption" color="error">
                          {errors.objectId.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Позиции отгрузки
              </Typography>

              {!selectedWarehouseId && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Сначала выберите склад, чтобы увидеть доступные товары
                </Alert>
              )}

              {selectedWarehouseId && availableProducts.length === 0 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  На выбранном складе нет товаров в наличии
                </Alert>
              )}

              {fields.map((field, index) => (
                <Paper key={field.id} sx={{ p: 2, mb: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={6}>
                      <Controller
                        name={`items.${index}.productId`}
                        control={control}
                        render={({ field }) => (
                          <FormControl
                            fullWidth
                            error={!!errors.items?.[index]?.productId}
                          >
                            <InputLabel>Товар</InputLabel>
                            <Select
                              {...field}
                              label="Товар"
                              disabled={!selectedWarehouseId}
                            >
                              {availableProducts.map(product => {
                                const available = stockMap.get(product.id) || 0;
                                return (
                                  <MenuItem
                                    key={product.id}
                                    value={product.id}
                                    disabled={available === 0}
                                  >
                                    {product.title} - {product.manufacturer}
                                    (доступно: {available}{" "}
                                    {product.unit || "шт"})
                                  </MenuItem>
                                );
                              })}
                            </Select>
                          </FormControl>
                        )}
                      />
                    </Grid>

                    <Grid item xs={4}>
                      <Controller
                        name={`items.${index}.quantity`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            type="number"
                            label="Количество"
                            fullWidth
                            disabled={!selectedWarehouseId}
                            error={!!errors.items?.[index]?.quantity}
                            helperText={
                              errors.items?.[index]?.quantity?.message
                            }
                            onChange={e =>
                              field.onChange(Number(e.target.value))
                            }
                            inputProps={{ min: 1 }}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={2}>
                      <IconButton
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>

                    {field.productId && (
                      <Grid item xs={12}>
                        <Typography variant="caption" color="textSecondary">
                          Доступно на складе:{" "}
                          <strong>
                            {stockMap.get(field.productId) || 0}{" "}
                            {products?.find(p => p.id === field.productId)
                              ?.unit || "шт"}
                          </strong>
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              ))}

              <Button
                startIcon={<AddIcon />}
                onClick={() => append({ productId: "", quantity: 1 })}
                disabled={
                  !selectedWarehouseId || availableProducts.length === 0
                }
                sx={{ mt: 1 }}
              >
                Добавить позицию
              </Button>

              {errors.items && (
                <Typography
                  variant="caption"
                  color="error"
                  display="block"
                  sx={{ mt: 1 }}
                >
                  {errors.items.message}
                </Typography>
              )}
            </Box>

            {selectedWarehouseId && fields.length > 0 && (
              <Alert severity="info">
                <Typography variant="body2">
                  Всего позиций: {fields.length}, Общее количество:{" "}
                  {fields.reduce((sum, field, index) => {
                    const quantity = watch(`items.${index}.quantity`) || 0;
                    return sum + quantity;
                  }, 0)}{" "}
                  шт
                </Typography>
              </Alert>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Отмена</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || !selectedWarehouseId}
          >
            {isSubmitting ? <CircularProgress size={24} /> : "Создать отгрузку"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
