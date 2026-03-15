import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ProjectForm } from "../../../components/Project";
import {
  useGetProjectQuery,
  useUpdateProjectMutation,
} from "../../../services";

export const Route = createFileRoute("/projects/$projectId/edit")({
  component: EditProjectPage,
});

function EditProjectPage() {
  const navigate = useNavigate();
  // Получаем ID из параметров маршрута
  const { projectId } = Route.useParams();

  // Загружаем данные проекта
  const { data: project, isLoading, error } = useGetProjectQuery(projectId);

  const [updateProject, { isLoading: isUpdating }] = useUpdateProjectMutation();

  const handleSubmit = async (formData: FormData) => {
    try {
      await updateProject({
        id: projectId,
        formData,
      }).unwrap();
      navigate({ to: "/projects/$projectId", params: { projectId } });
    } catch (error) {
      console.error("Ошибка обновления проекта:", error);
      throw error;
    }
  };

  return (
    <ProjectForm
      initialData={project}
      onSubmit={handleSubmit}
      loading={isUpdating}
    />
  );
}
