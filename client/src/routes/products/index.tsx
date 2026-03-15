import { createFileRoute } from "@tanstack/react-router";
import { ProductList } from "../../components";

export const Route = createFileRoute("/products/")({
  component: ProductIndex,
});

function ProductIndex() {
  return (
    <div>
      <ProductList />
    </div>
  );
}
