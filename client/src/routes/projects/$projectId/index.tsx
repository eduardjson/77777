import { createFileRoute } from "@tanstack/react-router";
import { ProjectDetailPage } from "../../../components/Project";

export const Route = createFileRoute("/projects/$projectId/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <ProjectDetailPage />;
}
