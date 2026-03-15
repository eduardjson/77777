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
  useCreateObjectMutation,
  useUpdateObjectMutation,
} from "../../services";
import { Object as ObjectType } from "../../types";

const objectSchema = z.object({
  name: z.string().min(1, "Название обязательно"),
  address: z.string().optional(),
  description: z.string().optional(),
});

type ObjectFormData = z.infer<typeof objectSchema>;

interface ObjectFormProps {
  open: boolean;
  onClose: () => void;
  object?: ObjectType | null;
}

export const ObjectForm: React.FC<ObjectFormProps> = ({
  open,
  onClose,
  object,
}) => {
  const [createObject] = useCreateObjectMutation();
  const [updateObject] = useUpdateObjectMutation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ObjectFormData>({
    resolver: zodResolver(objectSchema),
    defaultValues: {
      name: "",
      address: "",
      description: "",
    },
  });

  useEffect(() => {
    if (object) {
      reset({
        name: object.name,
        address: object.address || "",
        description: object.description || "",
      });
    } else {
      reset({
        name: "",
        address: "",
        description: "",
      });
    }
  }, [object, reset]);

  const onSubmit = async (data: ObjectFormData) => {
    try {
      if (object) {
        await updateObject({ id: object.id, body: data }).unwrap();
      } else {
        await createObject(data).unwrap();
      }
      onClose();
    } catch (error) {
      console.error("Failed to save object:", error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {object ? "Редактировать объект" : "Новый объект"}
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
                  label="Название объекта"
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
                />
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Описание"
                  error={!!errors.description}
                  helperText={errors.description?.message}
                  fullWidth
                  multiline
                  rows={3}
                />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Отмена</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {object ? "Сохранить" : "Создать"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
