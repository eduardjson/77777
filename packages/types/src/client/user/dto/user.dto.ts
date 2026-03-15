import { Role } from '@prisma/client';

export interface UserDto {
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
}
