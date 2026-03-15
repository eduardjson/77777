import { CreateUserDto } from 'src/entities/user/dto/create-user.dto';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class MatchPasswordsConstraint implements ValidatorConstraintInterface {
  validate(repeatPassword: string, validationArguments: ValidationArguments) {
    const { password } = validationArguments.object as CreateUserDto;
    console.log(password, repeatPassword);
    return password === repeatPassword;
  }

  defaultMessage(): string {
    return 'Введенные пароли не совпадают';
  }
}
