import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProjectInviteCode } from "./project.invite.code.entity";

@Module({
    imports: [TypeOrmModule.forFeature([ProjectInviteCode])],
    controllers: [],
    providers: [],
    exports: [],
})
export class ProjectInviteCodesModule {}
