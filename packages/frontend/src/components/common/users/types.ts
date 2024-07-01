export interface User {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  photo: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onboarding: any;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  country?: string;
  inviteCode?: string;
}
