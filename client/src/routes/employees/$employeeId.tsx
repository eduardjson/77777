import {} from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { useGetAllUsersQuery } from "../../services";

import { UserDetails } from "../../components/User/UserDetails";

export const Route = createFileRoute("/employees/$employeeId")({
  component: EmployeeDetail,
});

function EmployeeDetail() {
  const { employeeId } = Route.useParams();
  const { data } = useGetAllUsersQuery();

  const user = data?.find(u => String(u.id) === String(employeeId));

  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="text.secondary">
          Загрузка… или сотрудник не найден
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 900 }}>
      {user && <UserDetails user={user} />}
    </Box>
  );
}
