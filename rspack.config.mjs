import path from "path";
import { fileURLToPath } from "url";

import { rspack } from '@rspack/core'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isRunningWebpack = !!process.env.WEBPACK;
const isRunningRspack = !!process.env.RSPACK;
if (!isRunningRspack && !isRunningWebpack) {
  throw new Error("Unknown bundler");
}

const CssExtractPlugin = isRunningRspack ? rspack.CssExtractRspackPlugin : MiniCssExtractPlugin;

/**
 * @type {import('webpack').Configuration | import('@rspack/cli').Configuration}
 */
const config = {
  mode: "development",
  devtool: false,
  entry: {
    main: "./src/index",
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
           CssExtractPlugin.loader,
          'css-loader',
        ]
      }
    ]
  },
  plugins: [
    new CssExtractPlugin(),
    /**
      * @param {import('@rspack/core').Compiler} compiler 
      */
    (compiler) => {
      let initial = true;
      compiler.hooks.thisCompilation.tap('test', (compilation) => {
        compilation.hooks.finishModules.tap('test', (modules) => {
          if (!initial) {
            return
          }
          initial = false;

          for (const module of modules) {
            if (module.resource?.includes('.css')) {
              compilation.rebuildModule(module, err => {
                console.log('rebuildModule failed', err)
              })
            }
          }
        })
      })
    }
  ],
  output: {
    clean: true,
    path: isRunningWebpack
      ? path.resolve(__dirname, "webpack-dist")
      : path.resolve(__dirname, "rspack-dist"),
    filename: "[name].js",
  },
};

export default config;
