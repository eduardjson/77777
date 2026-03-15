import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  IconButton,
  Dialog,
  DialogContent,
  ImageList,
  ImageListItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Edit,
  Delete,
  Download,
  PictureAsPdf,
  Description,
  Close,
} from "@mui/icons-material";
import { useParams } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import {
  useGetProjectQuery,
  useDeleteProjectMutation,
  useLazyGetImageBlobQuery,
  useLazyGetDocumentBlobQuery,
} from "../../services/api/projectApi";
import { generateEstimatePDF } from "../../services/utils/estimateGenerator";

export const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams({ from: "/projects/$projectId/" });
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<Map<string, string>>(new Map());
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());

  // RTK Query hooks
  const {
    data: project,
    isLoading,
    error,
    refetch,
  } = useGetProjectQuery(projectId!, {
    skip: !projectId,
  });

  const [deleteProject, { isLoading: isDeleting }] = useDeleteProjectMutation();

  // Lazy query hooks для загрузки файлов
  const [fetchImageBlob] = useLazyGetImageBlobQuery();
  const [fetchDocumentBlob] = useLazyGetDocumentBlobQuery();

  // Загрузка изображения
  const loadImage = useCallback(
    async (imageId: string) => {
      // Проверяем, не загружено ли уже
      if (imageUrls.has(imageId)) return;

      // Проверяем, не загружается ли сейчас
      if (loadingImages.has(imageId)) return;

      setLoadingImages(prev => new Set(prev).add(imageId));

      try {
        const blob = await fetchImageBlob(imageId).unwrap();
        const url = URL.createObjectURL(blob);
        setImageUrls(prev => new Map(prev).set(imageId, url));
      } catch (error) {
        console.error("Ошибка загрузки изображения:", error);
      } finally {
        setLoadingImages(prev => {
          const newSet = new Set(prev);
          newSet.delete(imageId);
          return newSet;
        });
      }
    },
    [imageUrls, loadingImages, fetchImageBlob],
  );

  // Скачивание документа
  const handleDownloadDocument = useCallback(
    async (docId: string, filename: string) => {
      try {
        const blob = await fetchDocumentBlob(docId).unwrap();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Ошибка скачивания документа:", error);
      }
    },
    [fetchDocumentBlob],
  );

  // Предзагрузка первого изображения
  useEffect(() => {
    if (project?.images?.[0]) {
      loadImage(project.images[0].id);
    }
  }, [project, loadImage]);

  // Очистка URL при размонтировании
  useEffect(() => {
    return () => {
      imageUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const handleDelete = async () => {
    if (!window.confirm("Удалить проект?")) return;

    try {
      await deleteProject(id!).unwrap();
      navigate({ to: "/projects" });
    } catch (error) {
      console.error("Ошибка при удалении проекта:", error);
    }
  };

  const handleGenerateEstimate = async () => {
    if (!project) return;

    try {
      const pdfBlob = await generateEstimatePDF(project);
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `смета_${project.name}_${new Date().toISOString().split("T")[0]}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Ошибка генерации сметы:", error);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={refetch}>
              Повторить
            </Button>
          }
        >
          Ошибка загрузки проекта
        </Alert>
      </Box>
    );
  }

  if (!project) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Проект не найден</Alert>
      </Box>
    );
  }

  const totalEstimate =
    (project.estimate?.items || []).reduce(
      (sum: number, item: any) => sum + item.total,
      0,
    ) + (project.estimate?.laborCost || 0);

  return (
    <Box sx={{ p: 3 }}>
      {/* Шапка */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">{project.name}</Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            onClick={handleGenerateEstimate}
            sx={{ mr: 1 }}
            disabled={!project.estimate}
          >
            Сформировать смету
          </Button>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => navigate(`/projects/${id}/edit`)}
            sx={{ mr: 1 }}
          >
            Редактировать
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Удаление..." : "Удалить"}
          </Button>
        </Box>
      </Box>

      <Typography
        variant="caption"
        color="text.secondary"
        display="block"
        sx={{ mb: 2 }}
      >
        Создан: {new Date(project.createdAt).toLocaleString()}
      </Typography>

      <Grid container spacing={3}>
        {/* Основная информация */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Описание
            </Typography>
            <Typography variant="body1">
              {project.description || "Нет описания"}
            </Typography>
          </Paper>
        </Grid>

        {/* Изображения */}
        {project.images?.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Изображения ({project.images.length})
              </Typography>
              <ImageList sx={{ height: 450 }} cols={3} rowHeight={200}>
                {project.images.map((image: any) => (
                  <ImageListItem
                    key={image.id}
                    onClick={() => {
                      loadImage(image.id);
                      setSelectedImage(image.id);
                    }}
                    sx={{ cursor: "pointer", position: "relative" }}
                  >
                    {imageUrls.has(image.id) ? (
                      <img
                        src={imageUrls.get(image.id)}
                        alt={image.filename}
                        style={{
                          objectFit: "cover",
                          height: "100%",
                          width: "100%",
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: "action.hover",
                          flexDirection: "column",
                          gap: 1,
                        }}
                      >
                        {loadingImages.has(image.id) ? (
                          <CircularProgress size={40} />
                        ) : (
                          <>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {image.filename}
                            </Typography>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={e => {
                                e.stopPropagation();
                                loadImage(image.id);
                              }}
                            >
                              Загрузить
                            </Button>
                          </>
                        )}
                      </Box>
                    )}
                  </ImageListItem>
                ))}
              </ImageList>
            </Paper>
          </Grid>
        )}

        {/* Документы */}
        {project.documents?.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Документы ({project.documents.length})
              </Typography>
              <Grid container spacing={2}>
                {project.documents.map((doc: any) => (
                  <Grid item xs={12} sm={6} md={4} key={doc.id}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        "&:hover": {
                          bgcolor: "action.hover",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          overflow: "hidden",
                        }}
                      >
                        {doc.mimeType.includes("pdf") ? (
                          <PictureAsPdf color="error" />
                        ) : (
                          <Description color="primary" />
                        )}
                        <Typography
                          sx={{
                            ml: 1,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: 200,
                          }}
                        >
                          {doc.filename}
                        </Typography>
                      </Box>
                      <IconButton
                        onClick={() =>
                          handleDownloadDocument(doc.id, doc.filename)
                        }
                        size="small"
                        color="primary"
                      >
                        <Download />
                      </IconButton>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        )}

        {/* Смета */}
        {project.estimate && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Смета
              </Typography>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>№</TableCell>
                      <TableCell>Наименование</TableCell>
                      <TableCell align="right">Кол-во</TableCell>
                      <TableCell>Ед.</TableCell>
                      <TableCell align="right">Цена</TableCell>
                      <TableCell align="right">Сумма</TableCell>
                      <TableCell>Тип</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {project.estimate.items.map((item: any, index: number) => (
                      <TableRow key={item.id || index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell align="right">
                          {item.price.toLocaleString()} ₽
                        </TableCell>
                        <TableCell align="right">
                          {item.total.toLocaleString()} ₽
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={
                              item.costType === "LABOR" ? "Работа" : "Материал"
                            }
                            size="small"
                            color={
                              item.costType === "LABOR"
                                ? "secondary"
                                : "primary"
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    {project.estimate.laborCost > 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="right">
                          <strong>Стоимость работ</strong>
                        </TableCell>
                        <TableCell align="right">
                          <strong>
                            {project.estimate.laborCost.toLocaleString()} ₽
                          </strong>
                        </TableCell>
                        <TableCell>
                          <Chip label="Работа" size="small" color="secondary" />
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow>
                      <TableCell colSpan={5} align="right">
                        <Typography variant="h6">ИТОГО:</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="h6" color="primary">
                          {totalEstimate.toLocaleString()} ₽
                        </Typography>
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Модальное окно для просмотра изображений */}
      <Dialog
        open={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent>
          <Box sx={{ position: "relative" }}>
            <IconButton
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                zIndex: 1,
                bgcolor: "background.paper",
                "&:hover": { bgcolor: "background.paper" },
              }}
              onClick={() => setSelectedImage(null)}
            >
              <Close />
            </IconButton>
            {selectedImage && imageUrls.has(selectedImage) ? (
              <img
                src={imageUrls.get(selectedImage)}
                alt=""
                style={{
                  width: "100%",
                  height: "auto",
                  maxHeight: "80vh",
                  objectFit: "contain",
                }}
              />
            ) : (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};
