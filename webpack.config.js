const path = require('path');

const HtmlWebPackPlugin = require("html-webpack-plugin");

const htmlPlugin = new HtmlWebPackPlugin({
    template: "./src/template.html",
    filename: "./index.html",
    favicon: './src/img/favicon.ico',
    title: 'Final Project',
    hash: true,
});

module.exports = {
    devServer: {
        host: '0.0.0.0',
        port: 3000
    },
    entry: ['babel-polyfill', './src/index.js'],
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
        pathinfo: false
    },
    plugins: [htmlPlugin],
    // devtool: "cheap-module-eval-source-map",
    devtool: false,
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                include: path.resolve(__dirname, 'src'),
                exclude: /node_modules|test|bulk/,
                use: ['babel-loader']
            }
        ]
    },
    resolve: {
        // extensions: ['*', '.js', '.jsx']
        symlinks: false
    },
    watchOptions: {
        aggregateTimeout: 300,
        poll: 1000,
        ignored: /node_modules|coverage/
    }
};