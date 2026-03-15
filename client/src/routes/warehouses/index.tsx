import { createFileRoute } from "@tanstack/react-router";
import { WarehouseList } from "../../components";

export const Route = createFileRoute("/warehouses/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <WarehouseList />;
}
