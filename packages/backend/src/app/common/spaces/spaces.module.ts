import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SpacesController } from "./spaces.controller";
import { SpacesService } from "./spaces.service";
import { Space } from "./space.entity";
import { ListsModule } from "../lists/lists.module";
import { SpaceSideEffectsService } from "./space.side.effects.service";
import { AuthModule } from "../auth/auth.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Space]),
        ListsModule,
        forwardRef(() => AuthModule),
    ],
    controllers: [SpacesController],
    providers: [SpacesService, SpaceSideEffectsService],
    exports: [SpacesService, SpaceSideEffectsService],
})
export class SpacesModule {}
