import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRef, useState } from "react";

import {
  TextField,
  Button,
  Box,
  CircularProgress,
  Typography,
  Avatar,
} from "@mui/material";

const BASE_URL = "http://localhost:5000/api/";

import { AddAPhoto } from "@mui/icons-material";

import {
  useCreateProductMutation,
  useUpdateProductMutation,
} from "../../../services";
import { ProductFormSchema, productSchema } from "./product.schema";
import { readImageAsBase64 } from "./utils";
import { CreateProductDTO, UpdateProductDTO } from "../../../dto";

type ProductFormProps = {
  product?: any;
  onClose: () => void;
  mode: "create" | "update";
};

export const ProductForm = ({ product, onClose, mode }: ProductFormProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);

  const {
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ProductFormSchema>({
    resolver: zodResolver(productSchema),
    defaultValues: product || {},
  });

  const { title, description, category, manufacturer, imageUrl } = watch();

  console.log(watch());

  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedImages, setUploadedImages] = useState<
    { id: string; url: string }[]
  >([]);

  const isLoading = isCreating || isUpdating;
  const isCreateMode = mode === "create";
  const submit = isCreateMode ? createProduct : updateProduct;

  const submitHandler = async (data: UpdateProductDTO | CreateProductDTO) => {
    console.log(data);
    try {
      const result = await submit({ data, id: product?.id }).unwrap();

      // if create mode, result is new product id
      const productId = product?.id ?? result?.id ?? (result as any);

      // загрузка изображений, если выбраны файлы
      if (selectedFiles.length > 0 && productId) {
        const token = localStorage.getItem("accessToken");
        const formData = new FormData();

        const url = `${BASE_URL}products/${productId}/images`;
        selectedFiles.forEach(f => formData.append("images", f)); // Кладем файлы в formData

        const uploadRes = await fetch(url, {
          method: "POST",
          body: formData, // Сам объект FormData
          headers: {
            Authorization: `${token}`, // Токен авторизации оставляем
            // "Content-Type": "multipart/form-data", <-- Удаляем этот заголовок
          },
        });

        if (!uploadRes.ok) {
          throw new Error(`Upload failed with status code ${uploadRes.status}`);
        }
      }

      reset();
      onClose();
    } catch (err) {
      console.error("Ошибка при сохранении продукта:", err);
    }
  };

  console.log(uploadedImages);

  const handleFileSelect2 = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    console.log(event);
    const file = event.target.files?.item(0);
    if (!file) return;

    const result = await readImageAsBase64(file);
    console.log(result);
    setValue("imageUrl", result);
  };

  // обработчик выбора файлов
  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    // сохраняем в состояние
    setSelectedFiles(prev => [...prev, ...files].slice(0, 20)); // максимум 20
    // показываем превью для первых файлов
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // превью существующих/предыдущих изображений
  const previewImages = [...uploadedImages];
  if (imageUrl) {
    // если есть основное изображение, можно добавить как превью
    previewImages.unshift({ id: "local-main", url: imageUrl });
  }

  const formTitle = isCreateMode
    ? "Добавление продукта"
    : "Редактирование продукта";

  const actionName = isCreateMode ? "Добавить продукт" : "Обновить продукт";

  return (
    <div className="flex flex-col p-5 gap-4 min-w-100 max-w-200 border-blue-100 border rounded-sm">
      <Typography variant="h6">{formTitle}</Typography>
      <div className="flex flex-col gap-4 w-full">
        <TextField
          fullWidth
          label="Наименование"
          type="text"
          value={title}
          onChange={e => setValue("title", e.target.value)}
          error={!!errors.title}
          helperText={errors.title?.message}
        />
        <TextField
          fullWidth
          label="Описание"
          type="text"
          value={description}
          onChange={e => setValue("description", e.target.value)}
          error={!!errors.description}
          helperText={errors.description?.message}
        />
        <TextField
          fullWidth
          label="Категория"
          type="text"
          value={category}
          onChange={e => setValue("category", e.target.value)}
          error={!!errors.category}
          helperText={errors.category?.message}
        />
        <TextField
          fullWidth
          label="Производитель"
          type="text"
          value={manufacturer}
          onChange={e => setValue("manufacturer", e.target.value)}
          error={!!errors.manufacturer}
          helperText={errors.manufacturer?.message}
        />
        <Box className="flex flex-row gap-2">
          <Button
            variant="contained"
            color="success"
            startIcon={<AddAPhoto />}
            onClick={() => fileInputRef2.current?.click()}
          >
            Выберите изображение
          </Button>
          {imageUrl && (
            <img src={imageUrl} width={36} height={36} className="rounded-sm" />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect2}
            ref={fileInputRef2}
          />
        </Box>
        <Box className="flex flex-row gap-2 items-center">
          <Button
            variant="contained"
            color="success"
            startIcon={<AddAPhoto />}
            onClick={() => fileInputRef.current?.click()}
          >
            Выберите изображения
          </Button>
          {selectedFiles.length > 0 && (
            <span>{selectedFiles.length} файла(ов) выбрано</span>
          )}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            ref={fileInputRef}
            style={{ display: "none" }}
          />
        </Box>

        {selectedFiles.length > 0 && (
          <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
            {selectedFiles.map((f, idx) => (
              <Box
                key={idx}
                display="flex"
                flexDirection="column"
                alignItems="center"
              >
                <Avatar
                  variant="rounded"
                  src={URL.createObjectURL(f)}
                  sx={{ width: 72, height: 72 }}
                />
                <Button
                  size="small"
                  color="secondary"
                  onClick={() => removeSelectedFile(idx)}
                >
                  Удалить
                </Button>
              </Box>
            ))}
          </Box>
        )}

        <Box display="flex" gap={2} flexWrap="wrap">
          {previewImages.map(img => (
            <Box
              key={img.id}
              display="flex"
              flexDirection="column"
              alignItems="center"
            >
              <img
                src={img.url}
                alt="preview"
                width={72}
                height={72}
                style={{ objectFit: "cover" }}
              />
            </Box>
          ))}
        </Box>

        <div className="flex flex-row justify-end gap-2">
          <Button onClick={onClose}>Выйти</Button>
          <Button
            type="submit"
            onClick={handleSubmit(submitHandler)}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : actionName}
          </Button>
        </div>
      </div>
    </div>
  );
};
