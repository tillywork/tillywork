export interface User {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  photo: string;
  onboarding: any;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  country?: string;
}
