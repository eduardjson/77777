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
} from "@mui/material";
import {
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Inventory as ShipmentIcon,
} from "@mui/icons-material";
import { useGetObjectQuery } from "../../services";

interface ObjectDetailsProps {
  open: boolean;
  onClose: () => void;
  objectId: string;
}

export const ObjectDetails: React.FC<ObjectDetailsProps> = ({
  open,
  onClose,
  objectId,
}) => {
  const { data: object, isLoading } = useGetObjectQuery(objectId);

  if (isLoading) {
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogContent>
          <Typography>Загрузка...</Typography>
        </DialogContent>
      </Dialog>
    );
  }

  if (!object) {
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogContent>
          <Typography color="error">Объект не найден</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    );
  }

  const totalShipments = object.shipments?.length || 0;
  const completedShipments =
    object.shipments?.filter(s => s.status === "COMPLETED").length || 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          {object.name}
          <Chip
            label={`${totalShipments} отгрузок`}
            size="small"
            color={totalShipments > 0 ? "primary" : "default"}
          />
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={3}>
          {/* Основная информация */}
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Информация об объекте
            </Typography>
            <Grid container spacing={2}>
              {object.address && (
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <LocationIcon fontSize="small" color="action" />
                    <Typography variant="body2">{object.address}</Typography>
                  </Box>
                </Grid>
              )}

              <Grid item xs={6}>
                <Box display="flex" alignItems="center" gap={1}>
                  <CalendarIcon fontSize="small" color="action" />
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Дата создания
                    </Typography>
                    <Typography variant="body2">
                      {new Date(object.created_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={6}>
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    ID объекта
                  </Typography>
                  <Typography variant="body2" fontFamily="monospace">
                    {object.id}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Статистика отгрузок */}
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Статистика отгрузок
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Box textAlign="center">
                  <Typography variant="h6">{totalShipments}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    Всего отгрузок
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box textAlign="center">
                  <Typography variant="h6">{completedShipments}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    Выполнено
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box textAlign="center">
                  <Typography variant="h6">
                    {totalShipments - completedShipments}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    В обработке
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Описание */}
          {object.description && (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography
                variant="subtitle2"
                color="textSecondary"
                gutterBottom
              >
                Описание
              </Typography>
              <Typography variant="body2">{object.description}</Typography>
            </Paper>
          )}

          {/* История отгрузок */}
          {object.shipments && object.shipments.length > 0 && (
            <Paper variant="outlined">
              <Box p={2}>
                <Typography variant="subtitle2" color="textSecondary">
                  История отгрузок
                </Typography>
              </Box>
              <Divider />
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Дата</TableCell>
                      <TableCell>Со склада</TableCell>
                      <TableCell>Статус</TableCell>
                      <TableCell align="right">Позиций</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {object.shipments.map(shipment => (
                      <TableRow key={shipment.id}>
                        <TableCell>
                          {new Date(shipment.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{shipment.warehouse?.name}</TableCell>
                        <TableCell>
                          <Chip
                            label={shipment.status}
                            size="small"
                            color={
                              shipment.status === "COMPLETED"
                                ? "success"
                                : shipment.status === "CANCELLED"
                                  ? "error"
                                  : "primary"
                            }
                          />
                        </TableCell>
                        <TableCell align="right">
                          {shipment.items?.length || 0}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
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
