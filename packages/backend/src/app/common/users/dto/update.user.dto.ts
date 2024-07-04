import { PartialType } from "@nestjs/mapped-types";
import { User } from "../user.entity";

export class UpdateUserDto extends PartialType(User) {}
