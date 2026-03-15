import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
} from "@mui/material";
import {
  Warehouse as WarehouseIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
} from "@mui/icons-material";
import { useGetShipmentQuery } from "../../services/api2";
import { ShipmentStatus } from "../../types";

const statusIcons: Record<ShipmentStatus, React.ReactNode> = {
  PENDING: <PendingIcon color="primary" />,
  COMPLETED: <CheckIcon color="success" />,
  CANCELLED: <CancelIcon color="error" />,
};

const statusLabels: Record<ShipmentStatus, string> = {
  PENDING: "В обработке",
  COMPLETED: "Выполнена",
  CANCELLED: "Отменена",
};

const statusColors: Record<ShipmentStatus, "primary" | "success" | "error"> = {
  PENDING: "primary",
  COMPLETED: "success",
  CANCELLED: "error",
};

interface ShipmentDetailsProps {
  open: boolean;
  onClose: () => void;
  shipmentId: string;
}

export const ShipmentDetails: React.FC<ShipmentDetailsProps> = ({
  open,
  onClose,
  shipmentId,
}) => {
  const { data: shipment, isLoading } = useGetShipmentQuery(shipmentId);

  if (isLoading) {
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogContent>
          <Typography>Загрузка...</Typography>
        </DialogContent>
      </Dialog>
    );
  }

  if (!shipment) {
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogContent>
          <Alert severity="error">Отгрузка не найдена</Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    );
  }

  const totalItems = shipment.items?.length || 0;
  const totalQuantity =
    shipment.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <span>Детали отгрузки</span>
          <Chip
            icon={statusIcons[shipment.status]}
            label={statusLabels[shipment.status]}
            color={statusColors[shipment.status]}
            size="small"
          />
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={3}>
          {/* Основная информация */}
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Информация об отгрузке
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box display="flex" alignItems="center" gap={1}>
                  <WarehouseIcon fontSize="small" color="action" />
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Со склада
                    </Typography>
                    <Typography variant="body2">
                      {shipment.warehouse?.name}
                    </Typography>
                    {shipment.warehouse?.address && (
                      <Typography variant="caption" color="textSecondary">
                        {shipment.warehouse.address}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={6}>
                <Box display="flex" alignItems="center" gap={1}>
                  <LocationIcon fontSize="small" color="action" />
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      На объект
                    </Typography>
                    <Typography variant="body2">
                      {shipment.object?.name}
                    </Typography>
                    {shipment.object?.address && (
                      <Typography variant="caption" color="textSecondary">
                        {shipment.object.address}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={6}>
                <Box display="flex" alignItems="center" gap={1}>
                  <CalendarIcon fontSize="small" color="action" />
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Дата создания
                    </Typography>
                    <Typography variant="body2">
                      {new Date(shipment.created_at).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={6}>
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    ID отгрузки
                  </Typography>
                  <Typography variant="body2" fontFamily="monospace">
                    {shipment.id}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Статистика */}
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Статистика
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Box textAlign="center">
                  <Typography variant="h6">{totalItems}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    Позиций
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box textAlign="center">
                  <Typography variant="h6">{totalQuantity}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    Всего единиц
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box textAlign="center">
                  <Typography variant="h6">
                    {shipment.items?.length || 0}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Уникальных товаров
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Список товаров */}
          <Paper variant="outlined">
            <Box p={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Состав отгрузки
              </Typography>
            </Box>
            <Divider />
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Товар</TableCell>
                    <TableCell>Производитель</TableCell>
                    <TableCell align="right">Количество</TableCell>
                    <TableCell align="right">Ед. изм.</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {shipment.items?.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>{item.product?.title}</TableCell>
                      <TableCell>{item.product?.manufacturer}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">
                        {item.product?.unit || "шт"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Описание объекта, если есть */}
          {shipment.object?.description && (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography
                variant="subtitle2"
                color="textSecondary"
                gutterBottom
              >
                Описание объекта
              </Typography>
              <Typography variant="body2">
                {shipment.object.description}
              </Typography>
            </Paper>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Закрыть</Button>
      </DialogActions>
    </Dialog>
  );
};
