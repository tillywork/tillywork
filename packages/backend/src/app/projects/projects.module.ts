import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { Project } from './project.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Project]),
    ],
    controllers: [ProjectsController],
    providers: [
        ProjectsService,
    ],
    exports: [ProjectsService],
})
export class ProjectsModule { }
