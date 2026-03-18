import {
  Add as AddIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Description as DocIcon,
  TableChart as ExcelIcon,
  PictureAsPdf as PdfIcon,
} from '@mui/icons-material';
import { Button, CircularProgress, IconButton, TextField, Typography } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';
import React, { useEffect, useState } from 'react';
import { useLazyGetImageBlobQuery } from '../../services';

interface EstimateItem {
  id?: string;
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  price: number;
  costType: 'MATERIAL' | 'LABOR';
}

interface ProjectFormProps {
  initialData?: any;
  onSubmit: (data: FormData) => Promise<void>;
  loading?: boolean;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  initialData,
  onSubmit,
  loading = false,
}) => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrls, setImageUrls] = useState<Map<string, string>>(new Map());

  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [existingDocuments, setExistingDocuments] = useState<any[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newDocuments, setNewDocuments] = useState<File[]>([]);

  const [estimateItems, setEstimateItems] = useState<EstimateItem[]>([]);
  const [laborCost, setLaborCost] = useState(0);

  const [fetchImageBlob] = useLazyGetImageBlobQuery();

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setDescription(initialData.description || '');
      setExistingImages(initialData.images || []);
      setExistingDocuments(initialData.documents || []);
      setEstimateItems(initialData.estimate?.items || []);
      setLaborCost(initialData.estimate?.laborCost || 0);
    }
  }, [initialData]);

  useEffect(() => {
    const loadExistingImages = async () => {
      for (const image of existingImages) {
        if (!imageUrls.has(image.id)) {
          try {
            const blob = await fetchImageBlob(image.id).unwrap();
            const url = URL.createObjectURL(blob);
            setImageUrls((prev) => new Map(prev).set(image.id, url));
          } catch (error) {
            console.error(`Ошибка загрузки изображения ${image.id}:`, error);
          }
        }
      }
    };

    loadExistingImages();
  }, [existingImages, fetchImageBlob, imageUrls]);

  useEffect(() => {
    return () => {
      imageUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const handleAddEstimateItem = () => {
    setEstimateItems([
      ...estimateItems,
      {
        name: '',
        quantity: 1,
        unit: 'шт',
        price: 0,
        costType: 'MATERIAL',
      },
    ]);
  };

  const handleUpdateEstimateItem = (index: number, field: keyof EstimateItem, value: any) => {
    const updated = [...estimateItems];
    updated[index] = { ...updated[index], [field]: value };
    setEstimateItems(updated);
  };

  const handleRemoveEstimateItem = (index: number) => {
    setEstimateItems(estimateItems.filter((_, i) => i !== index));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setNewImages([...newImages, ...Array.from(event.target.files)]);
    }
  };

  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setNewDocuments([...newDocuments, ...Array.from(event.target.files)]);
    }
  };

  const removeNewImage = (index: number) => {
    setNewImages(newImages.filter((_, i) => i !== index));
  };

  const removeNewDocument = (index: number) => {
    setNewDocuments(newDocuments.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);

    // Добавляем новые изображения
    newImages.forEach((image) => {
      formData.append('images', image);
    });

    // Добавляем новые документы
    newDocuments.forEach((doc) => {
      formData.append('documents', doc);
    });

    // Добавляем смету - ВАЖНО: отправляем как JSON строку
    formData.append(
      'estimate',
      JSON.stringify({
        laborCost,
        items: estimateItems,
      })
    );

    await onSubmit(formData);
  };

  const getDocumentIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return <PdfIcon className="w-5 h-5" />;
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet'))
      return <ExcelIcon className="w-5 h-5" />;
    return <DocIcon className="w-5 h-5" />;
  };

  const totalCost = estimateItems.reduce((sum, item) => sum + item.quantity * item.price, 0);

  if (!initialData && loading) {
    return (
      <div className="flex justify-center mt-8">
        <CircularProgress />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6 space-y-6">
      <Typography variant="h4" className="mb-6">
        {initialData ? 'Редактировать проект' : 'Новый проект'}
      </Typography>

      {/* Основная информация */}
      <div className="space-y-4">
        <TextField
          fullWidth
          label="Название проекта"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          size="small"
        />

        <TextField
          fullWidth
          label="Описание"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          rows={3}
          size="small"
        />
      </div>

      {/* Медиафайлы */}
      <div className="space-y-4">
        <Typography variant="h6">Медиафайлы</Typography>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Изображения */}
          <div className="space-y-3">
            <Typography variant="subtitle1">Изображения</Typography>

            {existingImages.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Загруженные ({existingImages.length})</p>
                <div className="grid grid-cols-3 gap-2">
                  {existingImages.map((img) => (
                    <div key={img.id} className="border rounded overflow-hidden">
                      {imageUrls.has(img.id) ? (
                        <img
                          src={imageUrls.get(img.id)}
                          alt={img.filename}
                          className="w-full h-20 object-cover"
                        />
                      ) : (
                        <div className="w-full h-20 bg-gray-100 flex items-center justify-center">
                          <CircularProgress size={24} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
              fullWidth
              size="small"
            >
              Загрузить изображения
              <input type="file" hidden multiple accept="image/*" onChange={handleImageUpload} />
            </Button>

            {newImages.map((file, idx) => (
              <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <span className="text-sm truncate flex-1">{file.name}</span>
                <span className="text-xs text-gray-500 mx-2">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
                <IconButton size="small" onClick={() => removeNewImage(idx)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </div>
            ))}
          </div>

          {/* Документы */}
          <div className="space-y-3">
            <Typography variant="subtitle1">Документы</Typography>

            {existingDocuments.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Загруженные ({existingDocuments.length})
                </p>
                <div className="space-y-1">
                  {existingDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                      {getDocumentIcon(doc.mimeType)}
                      <span className="text-sm truncate flex-1">{doc.filename}</span>
                      <span className="text-xs text-gray-500">
                        {(doc.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
              fullWidth
              size="small"
            >
              Загрузить документы
              <input
                type="file"
                hidden
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                onChange={handleDocumentUpload}
              />
            </Button>

            {newDocuments.map((file, idx) => (
              <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {getDocumentIcon(file.type)}
                  <span className="text-sm truncate">{file.name}</span>
                </div>
                <span className="text-xs text-gray-500 mx-2">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
                <IconButton size="small" onClick={() => removeNewDocument(idx)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Смета */}
      <div className="space-y-4">
        <Typography variant="h6">Смета</Typography>

        <TextField
          label="Стоимость работ"
          type="number"
          value={laborCost}
          onChange={(e) => setLaborCost(Number(e.target.value))}
          fullWidth
          size="small"
        />

        <div className="space-y-3">
          {estimateItems.map((item, idx) => (
            <div key={item.id || idx} className="border rounded p-3 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2">
                <TextField
                  label="Наименование"
                  value={item.name}
                  onChange={(e) => handleUpdateEstimateItem(idx, 'name', e.target.value)}
                  size="small"
                  className="lg:col-span-2"
                />

                <TextField
                  label="Кол-во"
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    handleUpdateEstimateItem(idx, 'quantity', Number(e.target.value))
                  }
                  size="small"
                />

                <TextField
                  label="Ед."
                  value={item.unit}
                  onChange={(e) => handleUpdateEstimateItem(idx, 'unit', e.target.value)}
                  size="small"
                />

                <TextField
                  label="Цена"
                  type="number"
                  value={item.price}
                  onChange={(e) => handleUpdateEstimateItem(idx, 'price', Number(e.target.value))}
                  size="small"
                />

                <TextField
                  label="Сумма"
                  value={item.quantity * item.price}
                  size="small"
                  InputProps={{ readOnly: true }}
                />

                <div className="flex items-center gap-1">
                  <select
                    value={item.costType}
                    onChange={(e) =>
                      handleUpdateEstimateItem(
                        idx,
                        'costType',
                        e.target.value as 'MATERIAL' | 'LABOR'
                      )
                    }
                    className="flex-1 h-9 border rounded px-2 text-sm bg-white"
                  >
                    <option value="MATERIAL">Материал</option>
                    <option value="LABOR">Работа</option>
                  </select>

                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleRemoveEstimateItem(idx)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button
          startIcon={<AddIcon />}
          onClick={handleAddEstimateItem}
          variant="outlined"
          size="small"
        >
          Добавить позицию
        </Button>

        <div className="border-t pt-4 flex justify-end">
          <Typography variant="h6">Итого: {(totalCost + laborCost).toLocaleString()} ₽</Typography>
        </div>
      </div>

      {/* Кнопки действий */}
      <div className="flex gap-2 justify-end">
        <Button variant="outlined" onClick={() => navigate({ to: '/projects' })}>
          Отмена
        </Button>
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? 'Сохранение...' : initialData ? 'Сохранить' : 'Создать'}
        </Button>
      </div>
    </form>
  );
};
