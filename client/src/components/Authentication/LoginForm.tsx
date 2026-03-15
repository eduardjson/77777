import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { LoginFormData, loginSchema } from "./schema";
import { TextField, Button, Dialog, Typography } from "@mui/material";
import { Link, useRouter } from "@tanstack/react-router";
import { useLoginMutation } from "../../services";

export const LoginForm = () => {
  const {
    watch,
    formState: { errors },
    setValue,
    handleSubmit,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {},
  });

  const { navigate } = useRouter();

  const [login] = useLoginMutation();

  const { email, password } = watch();

  const handleFinish = async (values: LoginFormData) => {
    try {
      const { data } = await login(values);

      const token = data?.accessToken;
      if (!token) {
        throw new Error("Токены не найдены");
      }
      localStorage.setItem("accessToken", `Bearer ${token}`);
      navigate({ to: "/" });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Dialog open={true}>
      <div className="flex flex-col p-5 gap-4">
        <Typography variant="h6">Вход</Typography>
        <div className="flex flex-col gap-4 w-100">
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
            onChange={e => {
              console.log(typeof e.target.value);
              setValue("password", e.target.value ?? "", {
                shouldValidate: true,
                shouldDirty: true,
              });
            }}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
        </div>
        <div className="flex flex-col gap-4">
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit(handleFinish)}
          >
            Войти
          </Button>
          <Typography
            variant="subtitle2"
            className="w-full flex flex-row gap-4 justify-center"
          >
            <div>Нет аккаунта?</div>
            <Link
              to="/auth/register"
              className="text-blue-600 hover:text-blue-400"
            >
              Зарегистрируйтесь
            </Link>
          </Typography>
        </div>
      </div>
    </Dialog>
  );
};
