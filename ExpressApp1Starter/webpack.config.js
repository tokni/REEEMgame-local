"use strict";
var nodeExternals = require('webpack-node-externals');

module.exports = [{
    entry: {
        connectBundle: "./public/express-publicDev/clientTypescript/ClientControl/connection.ts",
        facilitatorBundle: "./public/express-publicDev/clientTypescript/Facilitator.ts",
        facilitatorMainBundle: "./public/express-publicDev/clientTypescript/ClientControl/FacilitatorMainScreenController.ts",
        listOfWorldsUpdaterBundle: "./public/express-publicDev/clientTypescript/ClientControl/ListOfWorldsUpdater.ts",
        connectionMainBundle: "./public/express-publicDev/clientTypescript/ClientControl/MainScreenConnection.ts",
    }, 
    output: {
        filename: "./public/express-publicDev/dist/[name].js",
        library: '[name]'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx']
    },
    devtool: 'source-map',
    module: {
        
        loaders: [
            {
                test: /\.tsx?$/,
                loader: ['babel-loader', 'awesome-typescript-loader'],
                //loader: ['awesome-typescript-loader'],
                exclude: /node-modules/

            },
            {
                test: /\.jsx?$/,
                loader: ["babel-loader"],
                exclude: /node-modules/
            }
        ]
    },
    externals: {
    }
    //node: {
    //    fs: 'empty'
    //}
}, {
    entry: "./app2",
    output: { filename: "./app.js" },
    target: 'node',
    externals: [nodeExternals()],
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx']
    },
    module: {

        loaders: [
            {
                test: /\.tsx?$/,
                loader: ['babel-loader', 'awesome-typescript-loader'],
                //loader: ['awesome-typescript-loader'],
                exclude: /node-modules/
            }
        ]
    },
    node: {
        __dirname: true
    }
}
];