import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useGetAllUsersQuery } from "../../services";
import {
  Card,
  CardContent,
  Avatar,
  Chip,
  Box,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { ruRU } from "@mui/x-data-grid/locales";

export const Route = createFileRoute("/employees/")({
  component: Employees,
});

function Employees() {
  const { data, isLoading } = useGetAllUsersQuery();
  const navigate = useNavigate();

  const getRoleColor = (role: string) => {
    if (!role) return "default";
    if (role.includes("ADMIN")) return "error";
    if (role.includes("MANAGER")) return "warning";
    if (role.includes("USER")) return "success";
    return "primary";
  };

  // Колонки для Data Grid
  const columns: GridColDef[] = [
    {
      field: "fullName",
      headerName: "Сотрудник",
      flex: 2,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            height: "100%",
            width: "100%",
            py: 0, // убираем вертикальные отступы
          }}
        >
          <Typography variant="body2" fontWeight={500}>
            {params.row.firstName || ""} {params.row.lastName || ""}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            @{params.row.username}
          </Typography>
        </Box>
      ),
    },
    {
      field: "role",
      headerName: "Роль",
      flex: 1.5,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => {
        const roles = Array.isArray(params.value)
          ? params.value
          : [params.value];
        return (
          <Box
            sx={{
              display: "flex",
              gap: 0.5,
              flexWrap: "wrap",
              alignItems: "center",
              height: "100%",
              width: "100%",
            }}
          >
            {roles.map((role: string, index: number) => (
              <Chip
                key={index}
                label={role}
                size="small"
                color={getRoleColor(role)}
                variant="outlined"
                sx={{ height: 24 }}
              />
            ))}
          </Box>
        );
      },
    },
    {
      field: "avatar",
      headerName: "Фото",
      width: 80,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            width: "100%",
          }}
        >
          <Avatar
            src={params.value}
            alt={`${params.row.firstName || ""} ${params.row.lastName || ""}`.trim()}
            sx={{
              width: 36,
              height: 36,
              bgcolor: "primary.light",
            }}
          >
            {!params.value &&
              (params.row.firstName?.[0] || params.row.username?.[0] || "U")}
          </Avatar>
        </Box>
      ),
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1.5,
      minWidth: 180,
      renderCell: (params: GridRenderCellParams) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            height: "100%",
            width: "100%",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: "phone",
      headerName: "Телефон",
      flex: 1,
      minWidth: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            height: "100%",
            width: "100%",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {params.value || "—"}
          </Typography>
        </Box>
      ),
    },
    {
      field: "createdAt",
      headerName: "Регистрация",
      flex: 1,
      minWidth: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            height: "100%",
            width: "100%",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {new Date(params.value).toLocaleDateString()}
          </Typography>
        </Box>
      ),
    },
  ];

  // Подготовка данных для таблицы
  const rows =
    data?.map(user => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      createdAt: user.createdAt,
    })) || [];

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Typography variant="h5">Сотрудники</Typography>
      <CardContent sx={{ flex: 1, p: 0, "&:last-child": { pb: 0 } }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={isLoading}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10, page: 0 },
            },
            sorting: {
              sortModel: [{ field: "fullName", sort: "asc" }],
            },
          }}
          pageSizeOptions={[5, 10, 25, 50]}
          disableRowSelectionOnClick
          onRowClick={params => {
            navigate({ to: `/employees/${params.id}` });
          }}
          localeText={ruRU.components.MuiDataGrid.defaultProps.localeText}
          sx={{
            border: "none",
            "& .MuiDataGrid-cell": {
              cursor: "pointer",
              display: "flex",
              alignItems: "center", // Это ключевое свойство для вертикального центрирования
            },
            "& .MuiDataGrid-row:hover": {
              bgcolor: "action.hover",
              cursor: "pointer",
            },
            "& .MuiDataGrid-columnHeaders": {
              bgcolor: "grey.50",
              color: "text.secondary",
              fontWeight: 400,
            },
            // Убираем лишние отступы в ячейках
            "& .MuiDataGrid-cellContent": {
              display: "flex",
              alignItems: "center",
            },
          }}
        />
      </CardContent>
    </Card>
  );
}
