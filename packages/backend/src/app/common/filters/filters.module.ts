import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FiltersController } from "./filters.controller";
import { FiltersService } from "./filters.service";
import { Filter } from "./filter.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Filter])],
    controllers: [FiltersController],
    providers: [FiltersService],
    exports: [FiltersService],
})
export class FiltersModule {}
