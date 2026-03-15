import { Typography, Box, Chip } from "@mui/material";
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  Badge as BadgeIcon,
  CalendarToday as CalendarIcon,
  AdminPanelSettings as AdminIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface UserCardProps {
  user: {
    id: string | number;
    avatar?: string;
    firstName?: string;
    lastName?: string;
    username: string;
    email: string;
    phone?: string;
    role?: string | string[];
    createdAt?: string;
  } | null;
}
const InfoItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}) => (
  <Box className="flex items-start gap-2">
    <Box className="text-gray-400 min-w-6">{icon}</Box>
    <Box>
      <Typography variant="body2" className="text-gray-500">
        {label}
      </Typography>
      <Typography variant="body1" className="font-medium">
        {value || "—"}
      </Typography>
    </Box>
  </Box>
);
export function UserDetails({ user }: UserCardProps) {
  if (!user) return null;

  const fullName =
    `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Пользователь";
  const roles = Array.isArray(user.role) ? user.role : [user.role];
  const isAdmin = roles.some(
    role => role?.toUpperCase?.() === "ADMIN" || role === "admin",
  );

  return (
    <Box className="bg-white flex flex-col gap-6 p-6 relative">
      {/* Шапка с аватаром и именем */}
      <Box className="flex flex-row gap-4 items-start">
        <div className="w-24 h-24 overflow-hidden rounded-sm shrink-0">
          <img
            src={user.avatar || "/default-avatar.png"}
            alt={fullName}
            className="w-full h-full object-cover"
          />
        </div>
        <Box className="flex flex-col gap-2 flex-1">
          <Typography variant="h5" className="font-semibold">
            {fullName}
          </Typography>
          <Box className="flex gap-2 flex-wrap items-center">
            <Chip
              label={`@${user.username}`}
              size="small"
              variant="outlined"
              className="border-gray-200"
            />
            {isAdmin && (
              <Chip
                label="Администратор"
                size="small"
                icon={<AdminIcon />}
                className="bg-amber-50 text-amber-700 border-amber-200"
              />
            )}
            {roles.map(
              (role, index) =>
                role?.toUpperCase?.() === "USER" && (
                  <Chip
                    key={index}
                    label="Пользователь"
                    size="small"
                    variant="outlined"
                    className="border-green-600"
                  />
                ),
            )}
          </Box>
        </Box>
      </Box>

      {/* Информация о пользователе */}
      <Box className="flex flex-col gap-3 mt-2">
        <InfoItem
          icon={<EmailIcon fontSize="small" />}
          label="Email"
          value={user.email}
        />
        <InfoItem
          icon={<PhoneIcon fontSize="small" />}
          label="Телефон"
          value={user.phone}
        />
        <InfoItem
          icon={<BadgeIcon fontSize="small" />}
          label="Username"
          value={user.username}
        />
        <InfoItem
          icon={<PersonIcon fontSize="small" />}
          label="Имя"
          value={user.firstName}
        />
        <InfoItem
          icon={<PersonIcon fontSize="small" />}
          label="Фамилия"
          value={user.lastName}
        />
        <InfoItem
          icon={<CalendarIcon fontSize="small" />}
          label="Зарегистрирован"
          value={
            user.createdAt
              ? format(new Date(user.createdAt), "d MMMM yyyy", {
                  locale: ru,
                })
              : undefined
          }
        />
      </Box>

      {/* ID пользователя */}
      <Box className="flex justify-end mt-2">
        <Typography variant="body2" className="text-gray-400 font-mono">
          ID: {user.id}
        </Typography>
      </Box>
    </Box>
  );
}
