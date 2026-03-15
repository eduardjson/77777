import { Button, LinearProgress, Typography } from "@mui/material";

import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  useDeleteProductMutation,
  useGetProductByIdQuery,
} from "../../services";
import { setCurrentProductId } from "../../services/slices/currentProductSlice";
import { useAppDispatch } from "../../store";
import { ActionModal } from "../ActionModal";
import { ProductForm } from "./ProductForm";

export const ProductCard = ({ id }: { id: string }) => {
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleManagePrices = () => {
    dispatch(setCurrentProductId(product.id));
    navigate({ to: "/prices" });
  };

  const { data: product } = useGetProductByIdQuery(id);

  const [deleteProduct, { isLoading }] = useDeleteProductMutation();

  const handleDeleteProduct = async () => {
    await deleteProduct(id)
      .then(() => {
        navigate({ to: "/products" });
      })
      .catch(() => console.error("Не удалось удалить продукт"));
  };

  if (isLoading) {
    return <LinearProgress />;
  }

  if (editDialog) {
    return (
      <ProductForm
        mode="update"
        onClose={() => setEditDialog(false)}
        product={product}
      />
    );
  }

  return (
    <div className="flex flex-row-reverse gap-4 w-200 justify-between border-blue-100 border p-5 rounded-sm">
      {product?.imageUrl && (
        <img
          src={product.imageUrl}
          alt={`Фото ${product.title}`}
          height={400}
          width={400}
          className="object-cover h-50 rounded-lg"
        />
      )}
      <div className="min-w-100 max-w-200 flex flex-col gap-4">
        <Typography variant="h6">{product?.title}</Typography>
        <Typography color="text.secondary">
          Категория: {product?.category}
        </Typography>
        <Typography color="text.secondary">
          Производитель: {product?.manufacturer}
        </Typography>
        <Typography color="text.secondary">
          Описание: {product?.description}
        </Typography>
        <div className="flex flex-row mt-auto gap-2">
          <Button
            size="small"
            color="primary"
            variant="outlined"
            onClick={() => setEditDialog(true)}
          >
            Редактировать
          </Button>
          <Button
            size="small"
            color="primary"
            variant="outlined"
            onClick={() => setDeleteDialog(true)}
          >
            Удалить
          </Button>
          <button onClick={handleManagePrices}>Управление ценами</button>
        </div>
      </div>
      <ActionModal
        title="Подтвердите удаление"
        content="Данная позиция будет удалена из номенклатуры товаров. Действие нельзя
          будет отменить"
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        onSubmitAction={handleDeleteProduct}
        actionName="Удалить"
        cancelName="Выйти"
      />
    </div>
  );
};
