export class CreateUserDto {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber?: string;
    country?: string;
    inviteCode?: string;
}
