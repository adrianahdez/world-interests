const path = require('path');
const { DefinePlugin } = require('webpack');
const Dotenv = require('dotenv-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CompressionWebpackPlugin = require('compression-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// Reads a .env file and returns a plain key→value object without mutating process.env.
function parseEnvFile(filePath) {
  const result = {};
  try {
    require('fs').readFileSync(filePath, 'utf8')
      .split('\n')
      .forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const eq = trimmed.indexOf('=');
        if (eq === -1) return;
        const key = trimmed.slice(0, eq).trim();
        const val = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
        if (key) result[key] = val;
      });
  } catch (_) {
    // File absent or unreadable — return empty object.
  }
  return result;
}

module.exports = (env, argv) => {
  const isDevelopment = argv.mode === 'development';

  const prodEnv = parseEnvFile(path.resolve(__dirname, '.env.production'));
  const prodEnvExists = Object.keys(prodEnv).length > 0;
  // These are true only in dev when .env.production exists but is missing the var — compiled away in production.
  const siteUrlMissing = isDevelopment && prodEnvExists && !prodEnv.REACT_APP_SITE_URL;
  const gaIdMissing    = isDevelopment && prodEnvExists && !prodEnv.REACT_APP_GA_ID;

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
      new Dotenv({
        path: isDevelopment ? './.env' : './.env.production',
        systemvars: true, // also pick up env vars set by the CI/CD environment (e.g. Cloudflare Pages)
      }),
      // DefinePlugin is placed after Dotenv so its definitions take precedence for any overlapping keys.
      new DefinePlugin({
        // Baked-in booleans; Terser eliminates the warning blocks entirely in production builds.
        __DEV_WARN_SITE_URL_MISSING__: JSON.stringify(siteUrlMissing),
        __DEV_WARN_GA_ID_MISSING__:    JSON.stringify(gaIdMissing),
        // In dev, forcibly blank out REACT_APP_GA_ID so a value accidentally added to .env can never
        // reach the GA script — GA must only ever read its ID from .env.production in production builds.
        ...(isDevelopment && { 'process.env.REACT_APP_GA_ID': JSON.stringify('') }),
      }),
      new HtmlWebpackPlugin({
        template: './index.html',
        inject: 'body', // Inject the script and styles tag in the body, ensuring the load of the assets with the unique generated name by the content hash.
        isProd: !isDevelopment,
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
          { from: 'sitemap.xml', to: '' }, // Copy the sitemap.xml to the dist folder
          { from: 'screenshot.jpg', to: '' }, // Copy the screenshot.jpg to the dist folder
          { from: '_redirects', to: '' }, // Copy the redirects file to the dist folder
          { from: 'robots.txt', to: '' }, // Copy the robots.txt to the dist folder
        ],
      }),
    ],
    optimization: {
      // Configure the code splitting to ensure that the files are not bigger than an specific size.
      splitChunks: {
        chunks: 'all',
        maxSize: 243 * 1024, // 244 KiB
      },

      // This TerserPlugin minify the js files and removes console.log calls.
      // console.warn and console.error are preserved so operational warnings remain visible in production.
      minimize: !isDevelopment,
      minimizer: [new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: ['log'],
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
