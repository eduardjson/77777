import { createFileRoute } from "@tanstack/react-router";
import { ProductCard } from "../../components";

type ProductParam = {
  page: number;
};

export const Route = createFileRoute("/products/$productId")({
  component: ProductItem,
  validateSearch: (search: Record<string, unknown>): ProductParam => {
    return {
      page: Number(search?.page ?? 1),
    };
  },
});

function ProductItem() {
  const { productId } = Route.useParams();
  return <ProductCard id={productId} />;
}
