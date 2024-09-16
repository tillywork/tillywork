import { Project } from '../projects';

export interface User {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  photo: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onboarding: any;
  /** The user's currently active project */
  project?: Project;
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
