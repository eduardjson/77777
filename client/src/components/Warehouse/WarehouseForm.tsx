import React, { useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useCreateWarehouseMutation,
  useUpdateWarehouseMutation,
} from "../../services";
import { Warehouse } from "../../types";

const warehouseSchema = z.object({
  name: z.string().min(1, "Название обязательно"),
  address: z.string().optional(),
});

type WarehouseFormData = z.infer<typeof warehouseSchema>;

interface WarehouseFormProps {
  open: boolean;
  onClose: () => void;
  warehouse?: Warehouse | null;
}

export const WarehouseForm: React.FC<WarehouseFormProps> = ({
  open,
  onClose,
  warehouse,
}) => {
  const [createWarehouse] = useCreateWarehouseMutation();
  const [updateWarehouse] = useUpdateWarehouseMutation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WarehouseFormData>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      name: "",
      address: "",
    },
  });

  useEffect(() => {
    if (warehouse) {
      reset({
        name: warehouse.name,
        address: warehouse.address || "",
      });
    } else {
      reset({
        name: "",
        address: "",
      });
    }
  }, [warehouse, reset]);

  const onSubmit = async (data: WarehouseFormData) => {
    try {
      if (warehouse) {
        await updateWarehouse({ id: warehouse.id, body: data }).unwrap();
      } else {
        await createWarehouse(data).unwrap();
      }
      onClose();
    } catch (error) {
      console.error("Failed to save warehouse:", error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {warehouse ? "Редактировать склад" : "Новый склад"}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Название склада"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  fullWidth
                  autoFocus
                />
              )}
            />
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Адрес"
                  error={!!errors.address}
                  helperText={errors.address?.message}
                  fullWidth
                  multiline
                  rows={2}
                />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Отмена</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {warehouse ? "Сохранить" : "Создать"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
