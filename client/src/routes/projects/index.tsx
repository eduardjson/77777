import { createFileRoute } from "@tanstack/react-router";
import { ProjectsPage } from "../../components/Project/ProjectsPage";

export const Route = createFileRoute("/projects/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <ProjectsPage />;
}
