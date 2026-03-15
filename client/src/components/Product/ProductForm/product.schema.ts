import z from "zod";

export const productSchema = z.object({
  title: z.string().min(2, { message: "Название обязательно" }),
  description: z.string().min(2, "Это поле обязательно к заполнению"),
  category: z.string().min(2, "Это поле обязательно к заполнению"),
  manufacturer: z.string().min(2, "Это поле обязательно к заполнению"),
  imageUrl: z.string().min(2, "Это поле обязательно к заполнению"),
});

export type ProductFormSchema = z.infer<typeof productSchema>;
