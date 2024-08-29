const path = require('path');
const Dotenv = require('dotenv-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CompressionWebpackPlugin = require('compression-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
  const isDevelopment = argv.mode === 'development';

  return {
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].[contenthash].js',
      clean: true,
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
          },
        },
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.scss$/i,
          use: ['style-loader', 'css-loader', 'sass-loader'],
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource',
        },
      ],
    },
    resolve: {
      extensions: ['.js', '.jsx'],
    },
    devtool: isDevelopment ? 'eval-source-map' : 'source-map',
    plugins: [
      new Dotenv(), // This will load the .env file and make it available to the app
      new HtmlWebpackPlugin({
        template: './index.html',
        inject: 'body', // Inject the script and styles tag in the body, ensuring the load of the assets with the unique generated name by the content hash.
      }),
      // This plugin compress the files with gzip
      new CompressionWebpackPlugin({
        algorithm: 'gzip',
        test: /\.js$|\.css$|\.html$/,
        threshold: 10240,
        minRatio: 0.8,
      }),
      new CopyWebpackPlugin({
        patterns: [
          { from: 'favicon.svg', to: '' }, // Copy the favicon.svg to the dist folder
        ],
      }),
    ],
    optimization: {
      // Configure the code splitting to ensure that the files are not bigger than an specific size.
      splitChunks: {
        chunks: 'all',
        maxSize: 243 * 1024, // 244 KiB
      },

      // This TerserPlugin minify the js files and remove the console.log and other elements.
      minimize: !isDevelopment,
      minimizer: [new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
          },
        },
      })],
    },

    devServer: {
      static: {
        directory: path.resolve(__dirname, 'dist'),
      },
      compress: true,
      port: 9000,
    },
  };
};
