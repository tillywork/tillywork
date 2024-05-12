import { Module } from "@nestjs/common";
import { QueryBuilderHelper } from "./query.builder.helper";
import { ObjectHelper } from "./object.helper";

@Module({
    imports: [],
    controllers: [],
    providers: [QueryBuilderHelper, ObjectHelper],
    exports: [QueryBuilderHelper, ObjectHelper],
})
export class HelpersModule {}
