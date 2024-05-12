import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Put,
    UseGuards
} from "@nestjs/common";
import { ViewFindAllResult, ViewsService } from "./views.service";
import { View } from "./view.entity";
import { CreateViewDto } from "./dto/create.view.dto";
import { UpdateViewDto } from "./dto/update.view.dto";
import { JwtAuthGuard } from "../auth/guards/jwt.auth.guard";

@UseGuards(JwtAuthGuard)
@Controller({
    path: "views",
    version: "1",
})
export class ViewsController {
    constructor(private readonly viewsService: ViewsService) {}

    @Get()
    findAll(): Promise<ViewFindAllResult> {
        return this.viewsService.findAll();
    }

    @Get(":id")
    findOne(@Param("id") id: string): Promise<View> {
        return this.viewsService.findOne(+id);
    }

    @Post()
    create(
        @Body() createViewDto: CreateViewDto
    ): Promise<View> {
        return this.viewsService.create(createViewDto);
    }

    @Put(":id")
    update(
        @Param("id") id: string,
        @Body() updateUserDto: UpdateViewDto
    ): Promise<View> {
        return this.viewsService.update(+id, updateUserDto);
    }

    @Delete(":id")
    remove(@Param("id") id: string): Promise<void> {
        return this.viewsService.remove(+id);
    }
}
