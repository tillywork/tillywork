import { User } from "../../users/user.entity";

export class CreateProjectDto {
    name: string;
    ownerId?: number;
    users?: User[];
}
