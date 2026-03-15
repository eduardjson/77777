import { createFileRoute } from "@tanstack/react-router";
import { ProjectForm } from "../../../components/Project/ProjectForm";
import { useCreateProjectMutation } from "../../../services";
import { useNavigate } from "@tanstack/react-router";

const NewProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const [createProject, { isLoading }] = useCreateProjectMutation();

  const handleSubmit = async (formData: FormData) => {
    try {
      await createProject(formData).unwrap();
      navigate({ to: "/projects" });
    } catch (error) {
      console.error("Ошибка создания проекта:", error);
      throw error;
    }
  };

  return <ProjectForm onSubmit={handleSubmit} loading={isLoading} />;
};

export const Route = createFileRoute("/projects/new/")({
  component: NewProjectPage,
});
