import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import { useGetObjectsQuery, useDeleteObjectMutation } from "../../services";
import { ObjectForm } from "./ObjectForm";
import { ObjectDetails } from "./ObjectDetails";
import { Object as ObjectType } from "../../types";

export const ObjectList: React.FC = () => {
  const { data: objects, isLoading } = useGetObjectsQuery();
  const [deleteObject] = useDeleteObjectMutation();
  const [openForm, setOpenForm] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [selectedObject, setSelectedObject] = useState<ObjectType | null>(null);

  const handleEdit = (object: ObjectType) => {
    setSelectedObject(object);
    setOpenForm(true);
  };

  const handleView = (object: ObjectType) => {
    setSelectedObject(object);
    setOpenDetails(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Вы уверены, что хотите удалить объект?")) {
      await deleteObject(id);
    }
  };

  if (isLoading) {
    return <Typography>Загрузка...</Typography>;
  }

  return (
    <Box>
      <div className="flex flex-row justify-between">
        <Typography variant="h5">Заказчики</Typography>{" "}
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setSelectedObject(null);
            setOpenForm(true);
          }}
        >
          Добавить объект
        </Button>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Название</TableCell>
              <TableCell>Адрес</TableCell>
              <TableCell>Описание</TableCell>
              <TableCell>Количество отгрузок</TableCell>
              <TableCell>Дата создания</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {objects?.map(object => (
              <TableRow key={object.id}>
                <TableCell>{object.name}</TableCell>
                <TableCell>{object.address || "—"}</TableCell>
                <TableCell>
                  {object.description
                    ? object.description.length > 50
                      ? `${object.description.substring(0, 50)}...`
                      : object.description
                    : "—"}
                </TableCell>
                <TableCell>
                  <Chip
                    label={object.shipments?.length || 0}
                    size="small"
                    color={object.shipments?.length ? "primary" : "default"}
                  />
                </TableCell>
                <TableCell>
                  {new Date(object.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleView(object)}
                    title="Просмотр"
                  >
                    <ViewIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(object)}
                    title="Редактировать"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(object.id)}
                    title="Удалить"
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <ObjectForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        object={selectedObject}
      />
      {selectedObject && (
        <ObjectDetails
          open={openDetails}
          onClose={() => setOpenDetails(false)}
          objectId={selectedObject.id}
        />
      )}
    </Box>
  );
};
