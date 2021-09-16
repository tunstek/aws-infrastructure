const APP_NAME = process.env.APP_NAME;

const path = require('path');

// update from 23.12.2018
const nodeExternals = require('webpack-node-externals');

// const ExtractTextPlugin = require('extract-text-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const pkg = require('./package.json');

module.exports = {
   mode: process.env.NODE_ENV,
   entry: path.join(__dirname, 'src', 'init', 'main.js'),
   output: {
      path: path.join(__dirname, 'build'),
      filename: '[name].[chunkhash].js',
      publicPath: '/'
   },
   devServer: {
      inline: true,
      port: 8000
   },
   resolve: {
    modules: [path.resolve(__dirname, 'src'), "node_modules"],
    extensions: [ '.js' ]
   },
   module: {
      rules: [
         {
            test: /\.js?$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
            query: {
               presets: ['@babel/env', '@babel/react']
            }
         },
         {
           test: /\.css$/,
           use:  [  'style-loader', MiniCssExtractPlugin.loader, 'css-loader']
         }
      ]
   },
   plugins:[
      new HtmlWebpackPlugin({
         template: path.join(__dirname, 'src', 'init', 'index.html'),
      }),
      new webpack.DefinePlugin({
        APP_VERSION: JSON.stringify(pkg.version),
        'process.env': {
          APP_NAME: JSON.stringify(APP_NAME),
          NODE_ENV: JSON.stringify(process.env.NODE_ENV),
          AUTH0_DOMAIN: JSON.stringify(process.env.AUTH0_DOMAIN),
          AUTH0_PUB_KEY: JSON.stringify(process.env.AUTH0_PUB_KEY),
          BASE_URL: JSON.stringify(process.env.BASE_URL),
          API_ROOT: JSON.stringify(process.env.API_ROOT)
        },
      }),
      new MiniCssExtractPlugin({
        filename: 'style.css',
      }),
   ]
}
