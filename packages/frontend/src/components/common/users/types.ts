export interface User {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  photo: string;
  onboarding: any;
}

export function getUserFullName(user: User): string {
  return `${user.firstName} ${user.lastName}`;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  country?: string;
}
