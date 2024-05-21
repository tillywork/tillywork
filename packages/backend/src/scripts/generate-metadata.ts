/* eslint-disable @typescript-eslint/no-var-requires */
const { PluginMetadataGenerator } = require("@nestjs/cli/lib/compiler/plugins");
const { ReadonlyVisitor } = require("@nestjs/swagger/dist/plugin");
const path = require("path");

const generator = new PluginMetadataGenerator();
generator.generate({
    visitors: [
        new ReadonlyVisitor({
            introspectComments: true,
            pathToSource: path.join(__dirname, "../"),
        }),
    ],
    outputDir: path.join(__dirname, "../"),
    watch: false,
    tsconfigPath: "packages/backend/tsconfig.app.json",
});
