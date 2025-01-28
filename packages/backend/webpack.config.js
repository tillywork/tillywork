const { NxAppWebpackPlugin } = require('@nx/webpack/src/plugins/nx-webpack-plugin/nx-app-webpack-plugin');
const { join } = require('path');
const swcDefaultConfig = require('@nestjs/cli/lib/compiler/defaults/swc-defaults').swcDefaultsFactory().swcOptions;

module.exports = {
    output: {
        path: join(__dirname, '../../dist/packages/backend'),
    },
    plugins: [
        new NxAppWebpackPlugin({
            target: 'node',
            compiler: 'tsc',
            main: './src/main.ts',
            tsConfig: './tsconfig.app.json',
            assets: ['./src/assets'],
            optimization: false,
            outputHashing: 'none',
        }),
    ],
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: {
                    loader: 'swc-loader',
                    options: swcDefaultConfig,
                },
            },
        ],
    },
};
