import { ViewTypes } from "../types";

export class CreateViewDto {
  name: string;
  type?: ViewTypes;
  spaceId: number;
}
