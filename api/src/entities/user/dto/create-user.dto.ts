import {
  IsEmail,
  IsString,
  IsStrongPassword,
  Length,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'Имя должно быть строкой' })
  @Length(2, 20, { message: 'Длина имени должна быть от 6 до 20 символов' })
  username: string;

  @IsString({ message: 'Имя должно быть строкой' })
  @Length(2, 20, { message: 'Длина имени должна быть от 6 до 20 символов' })
  firstName: string;

  @IsString({ message: 'Имя должно быть строкой' })
  @Length(2, 20, { message: 'Длина имени должна быть от 6 до 20 символов' })
  lastName: string;

  @IsEmail({}, { message: 'Введите email корректно' })
  email: string;

  @IsString({ message: 'Телефон должен быть строкой' })
  @Length(6, 20, { message: 'Длина телефона должна быть от 6 до 20 символов' })
  phone: string;

  @IsStrongPassword(
    {},
    {
      message:
        'Пароль должен содержать цифры, заглавные и строчные буквы, а так же специальные символы',
    },
  )
  @MinLength(8, { message: 'Пароль должен содержать ровно 8 символов' })
  password: string;

  @IsString({ message: 'Вы должны загрузить изображение' })
  avatar: string;
}
