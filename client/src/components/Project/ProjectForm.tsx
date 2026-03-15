import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Tab,
  Tabs,
  Card,
  CardMedia,
  CircularProgress,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  TableChart as ExcelIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { useNavigate } from "@tanstack/react-router";
import { useLazyGetImageBlobQuery } from "../../services";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index} style={{ paddingTop: 16 }}>
    {value === index && children}
  </div>
);

interface EstimateItem {
  id?: string;
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  price: number;
  costType: "MATERIAL" | "LABOR";
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
  const [tabValue, setTabValue] = useState(0);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrls, setImageUrls] = useState<Map<string, string>>(new Map());

  // Файлы
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [existingDocuments, setExistingDocuments] = useState<any[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newDocuments, setNewDocuments] = useState<File[]>([]);

  // Смета
  const [estimateItems, setEstimateItems] = useState<EstimateItem[]>([]);
  const [laborCost, setLaborCost] = useState(0);

  // Хук для загрузки изображений
  const [fetchImageBlob] = useLazyGetImageBlobQuery();

  // Загружаем данные при изменении initialData
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      setExistingImages(initialData.images || []);
      setExistingDocuments(initialData.documents || []);
      setEstimateItems(initialData.estimate?.items || []);
      setLaborCost(initialData.estimate?.laborCost || 0);
    }
  }, [initialData]);

  // Загружаем изображения для существующих картинок
  useEffect(() => {
    const loadExistingImages = async () => {
      if (existingImages.length > 0) {
        existingImages.forEach(async image => {
          if (!imageUrls.has(image.id)) {
            try {
              const blob = await fetchImageBlob(image.id).unwrap();
              const url = URL.createObjectURL(blob);
              setImageUrls(prev => new Map(prev).set(image.id, url));
            } catch (error) {
              console.error(`Ошибка загрузки изображения ${image.id}:`, error);
            }
          }
        });
      }
    };

    loadExistingImages();
  }, [existingImages]);

  // Очистка URL при размонтировании
  useEffect(() => {
    return () => {
      imageUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const handleAddEstimateItem = () => {
    setEstimateItems([
      ...estimateItems,
      {
        name: "",
        quantity: 1,
        unit: "шт",
        price: 0,
        costType: "MATERIAL",
      },
    ]);
  };

  const handleUpdateEstimateItem = (
    index: number,
    field: keyof EstimateItem,
    value: any,
  ) => {
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
    formData.append("name", name);
    formData.append("description", description);

    // Добавляем новые изображения
    newImages.forEach(image => {
      formData.append("images", image);
    });

    // Добавляем новые документы
    newDocuments.forEach(doc => {
      formData.append("documents", doc);
    });

    // Добавляем смету
    formData.append(
      "estimate",
      JSON.stringify({
        laborCost,
        items: estimateItems,
      }),
    );

    await onSubmit(formData);
  };

  const getDocumentIcon = (mimeType: string) => {
    if (mimeType.includes("pdf")) return <PdfIcon />;
    if (mimeType.includes("excel") || mimeType.includes("spreadsheet"))
      return <ExcelIcon />;
    return <DocIcon />;
  };

  const totalCost = estimateItems.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0,
  );

  // Показываем загрузку, пока initialData загружается
  if (!initialData && loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ maxWidth: 1200, mx: "auto", p: 3 }}
    >
      <Typography variant="h4" gutterBottom>
        {initialData ? "Редактировать проект" : "Новый проект"}
      </Typography>

      <Paper sx={{ width: "100%", mb: 2 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label="Основная информация" />
          <Tab label="Медиафайлы" />
          <Tab label="Смета" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Название проекта"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Описание"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  multiline
                  rows={4}
                />
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={4}>
              {/* Изображения */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Изображения
                </Typography>

                {/* Существующие изображения */}
                {existingImages.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Загруженные изображения ({existingImages.length})
                    </Typography>
                    <Grid container spacing={1}>
                      {existingImages.map(img => (
                        <Grid item xs={4} key={img.id}>
                          <Card>
                            {imageUrls.has(img.id) ? (
                              <CardMedia
                                component="img"
                                height="100"
                                image={imageUrls.get(img.id)}
                                alt={img.filename}
                                sx={{ objectFit: "cover" }}
                              />
                            ) : (
                              <Box
                                sx={{
                                  height: 100,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  bgcolor: "grey.200",
                                }}
                              >
                                <CircularProgress size={30} />
                              </Box>
                            )}
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}

                {/* Новые изображения */}
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  Загрузить изображения
                  <input
                    type="file"
                    hidden
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </Button>

                <List>
                  {newImages.map((file, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={file.name}
                        secondary={`${(file.size / 1024).toFixed(2)} KB`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => removeNewImage(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Grid>

              {/* Документы */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Документы
                </Typography>

                {/* Существующие документы */}
                {existingDocuments.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Загруженные документы ({existingDocuments.length})
                    </Typography>
                    <List>
                      {existingDocuments.map(doc => (
                        <ListItem key={doc.id}>
                          {getDocumentIcon(doc.mimeType)}
                          <ListItemText
                            primary={doc.filename}
                            secondary={`${(doc.size / 1024).toFixed(2)} KB`}
                            sx={{ ml: 1 }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {/* Новые документы */}
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  fullWidth
                  sx={{ mb: 2 }}
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

                <List>
                  {newDocuments.map((file, index) => (
                    <ListItem key={index}>
                      {getDocumentIcon(file.type)}
                      <ListItemText
                        primary={file.name}
                        secondary={`${(file.size / 1024).toFixed(2)} KB`}
                        sx={{ ml: 1 }}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => removeNewDocument(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Смета проекта
              </Typography>

              <TextField
                label="Стоимость работ"
                type="number"
                value={laborCost}
                onChange={e => setLaborCost(Number(e.target.value))}
                fullWidth
                sx={{ mb: 3 }}
              />

              <Typography variant="subtitle1" gutterBottom>
                Материалы и работы
              </Typography>

              {estimateItems.map((item, index) => (
                <Paper key={item.id || index} sx={{ p: 2, mb: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        label="Наименование"
                        value={item.name}
                        onChange={e =>
                          handleUpdateEstimateItem(
                            index,
                            "name",
                            e.target.value,
                          )
                        }
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6} sm={1}>
                      <TextField
                        fullWidth
                        label="Кол-во"
                        type="number"
                        value={item.quantity}
                        onChange={e =>
                          handleUpdateEstimateItem(
                            index,
                            "quantity",
                            Number(e.target.value),
                          )
                        }
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6} sm={1}>
                      <TextField
                        fullWidth
                        label="Ед."
                        value={item.unit}
                        onChange={e =>
                          handleUpdateEstimateItem(
                            index,
                            "unit",
                            e.target.value,
                          )
                        }
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6} sm={1.5}>
                      <TextField
                        fullWidth
                        label="Цена"
                        type="number"
                        value={item.price}
                        onChange={e =>
                          handleUpdateEstimateItem(
                            index,
                            "price",
                            Number(e.target.value),
                          )
                        }
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6} sm={1.5}>
                      <TextField
                        fullWidth
                        label="Сумма"
                        value={item.quantity * item.price}
                        size="small"
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={8} sm={2}>
                      <select
                        value={item.costType}
                        onChange={e =>
                          handleUpdateEstimateItem(
                            index,
                            "costType",
                            e.target.value,
                          )
                        }
                        style={{ width: "100%", padding: 8 }}
                      >
                        <option value="MATERIAL">Материал</option>
                        <option value="LABOR">Работа</option>
                      </select>
                    </Grid>
                    <Grid item xs={4} sm={1}>
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveEstimateItem(index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Paper>
              ))}

              <Button
                startIcon={<AddIcon />}
                onClick={handleAddEstimateItem}
                variant="outlined"
                sx={{ mt: 2 }}
              >
                Добавить позицию
              </Button>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Typography variant="h6">
                  Итого: {(totalCost + laborCost).toLocaleString()} ₽
                </Typography>
              </Box>
            </Box>
          </TabPanel>
        </Box>
      </Paper>

      <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
        <Button
          variant="outlined"
          onClick={() => navigate({ to: "/projects" })}
        >
          Отмена
        </Button>
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? "Сохранение..." : initialData ? "Сохранить" : "Создать"}
        </Button>
      </Box>
    </Box>
  );
};
