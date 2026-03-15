import { createFileRoute, useParams } from "@tanstack/react-router";

import {
  useGetProjectQuery,
  useUpdateProjectMutation,
} from "../../../services";
import { useNavigate } from "@tanstack/react-router";
import { CircularProgress, Box, Alert } from "@mui/material";
import { ProjectForm } from "../../../components/Project/ProjectForm";

const EditProjectPage: React.FC = () => {
  const { projectId: id } = useParams({ from: "/projects/$projectId/edit" });
  const navigate = useNavigate();

  const { data: project, isLoading, error } = useGetProjectQuery(id);
  const [updateProject, { isLoading: isUpdating }] = useUpdateProjectMutation();

  const handleSubmit = async (formData: FormData) => {
    try {
      await updateProject({ id, formData }).unwrap();
      navigate({ to: `/projects/${id}` });
    } catch (error) {
      console.error("Ошибка обновления проекта:", error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !project) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Проект не найден или ошибка загрузки</Alert>
      </Box>
    );
  }

  return (
    <ProjectForm
      initialData={project}
      onSubmit={handleSubmit}
      loading={isUpdating}
    />
  );
};

export const Route = createFileRoute("/products/edit/")({
  component: EditProjectPage,
});
