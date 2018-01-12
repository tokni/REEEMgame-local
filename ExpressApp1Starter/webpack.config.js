"use strict";

module.exports = {
    entry: {
        partBundle: "./public/express-publicDev/clientTypescript/Participant.ts",
        connectBundle: "./public/express-publicDev/clientTypescript/ClientControl/connection.ts",
        facilitatorBundle: "./public/express-publicDev/clientTypescript/Facilitator.ts",
        facilitatorMainBundle: "./public/express-publicDev/clientTypescript/ClientControl/FacilitatorMainScreenController.ts",
        listOfWorldsUpdaterBundle: "./public/express-publicDev/clientTypescript/ClientControl/ListOfWorldsUpdater.ts",
        connectionMainBundle: "./public/express-publicDev/clientTypescript/ClientControl/MainScreenConnection.ts",
        browserBundle: "./public/express-publicDev/clientTypescript/REEEMbrowser.ts",
        reactBundle: "./public/reactHW.tsx",
        reactPartBundle: "./public/reactPart.tsx"
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
        "react": "React",
        "react-dom": "ReactDOM"
    }
    //node: {
    //    fs: 'empty'
    //}
};