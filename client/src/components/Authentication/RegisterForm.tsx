import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRef } from "react";

import { RegisterFormData, registerSchema } from "./schema";
import { TextField, Button, Dialog, Typography } from "@mui/material";
import { Link, useRouter } from "@tanstack/react-router";
import { useRegisterMutation } from "../../services";

const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = event => resolve(event.target!.result!.toString());
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
};

export const RegisterForm = () => {
  const { navigate } = useRouter();
  const [register] = useRegisterMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    watch,
    formState: { errors },
    setValue,
    handleSubmit,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {},
  });

  const {
    username,
    firstName,
    lastName,
    password,
    repeatPassword,
    email,
    phone,
  } = watch();

  console.log(watch());

  const handleFinish = async (values: RegisterFormData) => {
    try {
      await register(values).unwrap();
      navigate({ to: "/auth/login" });
    } catch (e) {
      if (e) console.error(e);
    }
  };

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]; // Получаем первый выбранный файл
    if (file) {
      const base64 = await convertToBase64(file); // Преобразуем файл в base64
      setValue("avatar", base64); // Устанавливаем значение поля "avatar"
    }
  };

  return (
    <Dialog open={true}>
      <div className="flex flex-col p-5 gap-4">
        <Typography variant="h6">Регистрация</Typography>
        <div className="flex flex-col gap-4 w-100">
          <TextField
            required
            fullWidth
            label="Имя пользователя"
            type="text"
            value={username}
            onChange={e => setValue("username", e.target.value)}
            error={!!errors.username}
            helperText={errors.username?.message}
          />
          <TextField
            required
            fullWidth
            label="Имя"
            type="text"
            value={firstName}
            onChange={e => setValue("firstName", e.target.value)}
            error={!!errors.firstName}
            helperText={errors.firstName?.message}
          />
          <TextField
            required
            fullWidth
            label="Фамилия"
            type="text"
            value={lastName}
            onChange={e => setValue("lastName", e.target.value)}
            error={!!errors.lastName}
            helperText={errors.lastName?.message}
          />
          <TextField
            required
            fullWidth
            label="Номер телефона"
            type="tel"
            value={phone}
            onChange={e => setValue("phone", e.target.value)}
            error={!!errors.phone}
            helperText={errors.phone?.message}
          />
          <TextField
            required
            fullWidth
            label="Электронная почта"
            type="email"
            value={email}
            onChange={e => setValue("email", e.target.value)}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
          <TextField
            required
            fullWidth
            label="Пароль"
            type="password"
            value={password}
            onChange={e =>
              setValue("password", e.target.value ?? "", {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          <TextField
            required
            fullWidth
            label="Повтор пароля"
            type="password"
            value={repeatPassword}
            onChange={e => setValue("repeatPassword", e.target.value)}
            error={!!errors.repeatPassword}
            helperText={errors.repeatPassword?.message}
          />

          {/* Поле для выбора файла аватара */}
          <label htmlFor="upload-file-input" className="cursor-pointer">
            <Button
              variant="outlined"
              component="span"
              style={{ marginBottom: "1rem" }}
            >
              Загрузить аватар
            </Button>
          </label>
          <input
            hidden
            id="upload-file-input"
            type="file"
            accept="image/png,image/jpeg"
            onChange={handleAvatarUpload}
            ref={fileInputRef}
          />
        </div>
        <div className="flex flex-row justify-end gap-5">
          <Button color="primary" type="submit">
            <Link to="/">Отмена</Link>
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit(handleFinish)}
          >
            Зарегистрироваться
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
