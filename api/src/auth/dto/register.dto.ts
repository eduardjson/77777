import { IsStrongPassword, MinLength, Validate } from 'class-validator';
import { MatchPasswordsConstraint } from 'src/validators/match-passwords-constraint';
import { CreateUserDto } from 'src/entities/user/dto/create-user.dto';

export class RegisterDto extends CreateUserDto {
  @IsStrongPassword(
    {},
    {
      message:
        'Пароль повторный должен содержать цифры, заглавные и строчные буквы, а так же специальные символы',
    },
  )
  @MinLength(8, {
    message: 'Пароль повторный должен содержать ровно 8 символов',
  })
  @Validate(MatchPasswordsConstraint)
  repeatPassword: string;
}
