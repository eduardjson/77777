import { UserInterface } from '../../user/entities/user.entity';

export interface TokenInterface {
  token: string;
  expires: Date;
  userId: string;
  user?: UserInterface;
}
