import z from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .min(2, "Введите минимум 2 символа")
    .max(20, "Введите не более 20 символов"),
  firstName: z
    .string()
    .min(2, "Введите минимум 2 символа")
    .max(20, "Введите не более 20 символов"),
  lastName: z
    .string()
    .min(2, "Введите минимум 2 символа")
    .max(20, "Введите не более 20 символов"),
  email: z.email("Введите корректный email"),
  phone: z
    .string()
    .regex(/^[0-9]{11}$/, "Номер телефона должен состоять из 11 цифр"),
  password: z
    .string()
    .min(8, "Пароль должен содержать минимум 8 символов")
    .regex(
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
      "Пароль должен содержать строчные и заглавные латинские буквы, цифры и спецсимволы",
    ),
  repeatPassword: z
    .string()
    .min(8, "Пароль должен содержать минимум 8 символов")
    .regex(
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
      "Пароль должен содержать строчные и заглавные латинские буквы, цифры и спецсимволы",
    ),
  avatar: z.string(),
});

export const loginSchema = z.object({
  email: z.email("Введите корректный email"),
  password: z
    .string()
    .min(8, "Пароль должен содержать минимум 8 символов")
    .regex(
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
      "Пароль должен содержать строчные и заглавные латинские буквы, цифры и спецсимволы",
    ),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
