const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    entry: path.join(__dirname, "examples/src/index.js"),
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: ["babel-loader"]
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            },
        ]
    },
    devServer: {
        port: 3001
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(__dirname, "examples/src/index.html"),
            filename: "./index.html"
        })
    ],
    resolve: {
        extensions: [".js", ".jsx"]
    },
};