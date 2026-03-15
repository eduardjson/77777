import { Role } from '@prisma/client';
import { TokenInterface } from '../../token/entities/token.entity';

export interface UserInterface {
  id: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role[];
  email: string;
  phone: string;
  age: number;
  address: string;
  avatar: string;
  createdAt: Date;
  updatedAt: Date;
  tokens?: TokenInterface[];
}
