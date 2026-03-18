import {
  AdminPanelSettings as AdminIcon,
  Badge as BadgeIcon,
  CalendarToday as CalendarIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import { Box, Card, Chip, Typography } from '@mui/material';
import { useParams } from '@tanstack/react-router';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useGetAllUsersQuery } from '../../services';

// Константы для ролей
const ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const;

// Маппинг ролей для отображения
const ROLE_DISPLAY = {
  [ROLES.ADMIN]: 'Администратор',
  [ROLES.USER]: 'Пользователь',
} as const;

// Конфигурация полей для InfoItem
const INFO_FIELDS = [
  { icon: EmailIcon, label: 'Email', key: 'email' },
  { icon: PhoneIcon, label: 'Телефон', key: 'phone' },
  { icon: BadgeIcon, label: 'Username', key: 'username' },
  { icon: PersonIcon, label: 'Имя', key: 'firstName' },
  { icon: PersonIcon, label: 'Фамилия', key: 'lastName' },
  { icon: CalendarIcon, label: 'Зарегистрирован', key: 'createdAt', isDate: true },
] as const;

// Переиспользуемый компонент для отображения поля с иконкой
const InfoItem = ({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value?: string | null;
}) => (
  <Box className="flex items-start gap-2">
    <Icon fontSize="small" className="text-gray-400 mt-0.5" />
    <Box>
      <Typography variant="body2" className="text-gray-500">
        {label}
      </Typography>
      <Typography variant="body1" className="font-medium">
        {value || '—'}
      </Typography>
    </Box>
  </Box>
);

// Компонент для отображения ролей пользователя
const UserRoles = ({ roles }: { roles: string[] }) => {
  const hasAdmin = roles.some((role) => role?.toUpperCase() === ROLES.ADMIN);
  const hasUser = roles.some((role) => role?.toUpperCase() === ROLES.USER);

  return (
    <Box className="flex gap-2 flex-wrap items-center">
      {hasAdmin && (
        <Chip
          label={ROLE_DISPLAY[ROLES.ADMIN]}
          size="small"
          icon={<AdminIcon />}
          className="bg-amber-50 text-amber-700 border-amber-200"
        />
      )}
      {hasUser && (
        <Chip
          label={ROLE_DISPLAY[ROLES.USER]}
          size="small"
          variant="outlined"
          className="border-green-600"
        />
      )}
    </Box>
  );
};

export function EmployeeDetails() {
  const { employeeId } = useParams({ from: '/employees/$employeeId' });
  const { data, isLoading } = useGetAllUsersQuery();

  // Ранний возврат для состояния загрузки
  if (isLoading) {
    return (
      <Box className="p-6">
        <Typography color="text.secondary">Загрузка...</Typography>
      </Box>
    );
  }

  const user = data?.find((u) => String(u.id) === String(employeeId));

  // Ранний возврат если пользователь не найден
  if (!user) {
    return (
      <Box className="p-6">
        <Typography color="text.secondary">Сотрудник не найден</Typography>
      </Box>
    );
  }

  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Пользователь';
  const roles = Array.isArray(user.role) ? user.role : [user.role];

  // Форматирование значения для отображения
  const formatValue = (key: string, value: any) => {
    if (key === 'createdAt' && value) {
      return format(new Date(value), 'd MMMM yyyy', { locale: ru });
    }
    return value;
  };

  return (
    <Card className="bg-white flex flex-col gap-6 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
      {/* Шапка с аватаром и именем */}
      <Box className="flex flex-row gap-4 items-start">
        <div className="w-24 h-24 overflow-hidden rounded-sm shrink-0">
          <img
            src={user.avatar || '/default-avatar.png'}
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
            <UserRoles roles={roles} />
          </Box>
        </Box>
      </Box>

      {/* Информация о пользователе */}
      <Box className="flex flex-col gap-3 mt-2">
        {INFO_FIELDS.map(({ icon, label, key, isDate }) => (
          <InfoItem
            key={key}
            icon={icon}
            label={label}
            value={formatValue(key, user[key as keyof typeof user])}
          />
        ))}
      </Box>

      {/* ID пользователя */}
      <Box className="flex justify-end mt-2">
        <Typography variant="body2" className="text-gray-400 font-mono">
          ID: {user.id}
        </Typography>
      </Box>
    </Card>
  );
}
