import { PartialType } from "@nestjs/mapped-types";
import { CreateWatcherDto } from "./create.watcher.dto";

export class UpdateWatcherDto extends PartialType(CreateWatcherDto) {}
