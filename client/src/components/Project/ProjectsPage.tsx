import React, { useEffect, useState } from "react";
import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  Button,
  IconButton,
  Box,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Visibility,
  Edit,
  Delete,
  Image as ImageIcon,
  Description as DocumentIcon,
} from "@mui/icons-material";
import { useNavigate } from "@tanstack/react-router";

import {
  useGetProjectsQuery,
  useDeleteProjectMutation,
  useLazyGetImageBlobQuery,
} from "../../services";

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const [imageUrls, setImageUrls] = useState<Map<string, string>>(new Map());
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());

  // RTK Query хуки
  const { data: projects = [], isLoading, error } = useGetProjectsQuery();
  const [deleteProject, { isLoading: isDeleting }] = useDeleteProjectMutation();
  const [fetchImageBlob] = useLazyGetImageBlobQuery();

  // Загрузка изображения для карточки
  const loadImageForProject = async (projectId: string, imageId: string) => {
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
      console.error(
        `Ошибка загрузки изображения для проекта ${projectId}:`,
        error,
      );
    } finally {
      setLoadingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(imageId);
        return newSet;
      });
    }
  };

  // Загружаем изображения для всех проектов при получении списка
  useEffect(() => {
    if (projects.length > 0) {
      projects.forEach(project => {
        if (project.images && project.images[0]) {
          loadImageForProject(project.id, project.images[0].id);
        }
      });
    }
  }, [projects]);

  // Очищаем URL при размонтировании
  useEffect(() => {
    return () => {
      imageUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Вы уверены, что хотите удалить проект?")) {
      try {
        await deleteProject(id).unwrap();
        // Очищаем URL удаленного проекта из кэша
        const project = projects.find(p => p.id === id);
        if (project?.images?.[0]) {
          const imageId = project.images[0].id;
          const url = imageUrls.get(imageId);
          if (url) {
            URL.revokeObjectURL(url);
            setImageUrls(prev => {
              const newMap = new Map(prev);
              newMap.delete(imageId);
              return newMap;
            });
          }
        }
      } catch (error) {
        console.error("Ошибка удаления:", error);
      }
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
        <Alert severity="error">
          Ошибка загрузки проектов: {JSON.stringify(error)}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h5">Проекты</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate({ to: "/projects/new" })}
        >
          Создать проект
        </Button>
      </Box>

      <Grid container spacing={3}>
        {projects.map(project => {
          const firstImage = project.images?.[0];
          const imageId = firstImage?.id;
          const imageUrl = imageId ? imageUrls.get(imageId) : null;
          const isLoadingImage = imageId ? loadingImages.has(imageId) : false;

          return (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {firstImage && imageUrl ? (
                  <CardMedia
                    component="img"
                    height="200"
                    image={imageUrl}
                    alt={project.name}
                    sx={{ objectFit: "cover", cursor: "pointer" }}
                    onClick={() => navigate({ to: `/projects/${project.id}` })}
                  />
                ) : (
                  <Box
                    sx={{
                      height: 200,
                      bgcolor: "grey.200",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      position: "relative",
                    }}
                    onClick={() => navigate({ to: `/projects/${project.id}` })}
                  >
                    {isLoadingImage ? (
                      <CircularProgress size={40} />
                    ) : (
                      <ImageIcon sx={{ fontSize: 64, color: "grey.400" }} />
                    )}
                  </Box>
                )}

                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography
                    gutterBottom
                    variant="h6"
                    component="h2"
                    sx={{ cursor: "pointer" }}
                    onClick={() => navigate({ to: `/projects/${project.id}` })}
                  >
                    {project.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {project.description?.substring(0, 100)}
                    {project.description?.length &&
                    project.description.length > 100
                      ? "..."
                      : ""}
                  </Typography>

                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Chip
                      icon={<ImageIcon />}
                      label={project._count?.images || 0}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      icon={<DocumentIcon />}
                      label={project._count?.documents || 0}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </CardContent>

                <CardActions>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => navigate({ to: `/projects/${project.id}` })}
                  >
                    <Visibility />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="secondary"
                    onClick={() =>
                      navigate({ to: `/projects/${project.id}/edit` })
                    }
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={e => handleDelete(project.id, e)}
                    disabled={isDeleting}
                  >
                    <Delete />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};
