const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = {
    mode: 'production',
    entry: {
        common: './common.js',
        filter: './filter.js',
        status: './status.js',
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, '../static/static/'),
    },
    plugins: [
        new VueLoaderPlugin(),
        new MiniCssExtractPlugin({filename: 'style.css'}),
    ],
    module: {
        rules: [
        {
            test: /\.css$/, // for Vue
            loader: [
                // MiniCssExtractPlugin.loader,
                'vue-style-loader',
                'css-loader',
            ]
        },
        {
            test: /\.(scss)$/,
            use: [ {
                loader: MiniCssExtractPlugin.loader, // generate CSS file
                }, {
                loader: 'css-loader', // translates CSS into CommonJS modules
                }, {
                loader: 'postcss-loader', // Run postcss actions
                options: {
                    plugins: function () { // postcss plugins, can be exported to postcss.config.js
                    return [
                        require('autoprefixer')
                    ];
                    }
                }
                }, {
                loader: 'sass-loader' // compiles Sass to CSS
            }]
        },
        {
            test: /\.vue$/,
            loader: 'vue-loader',
        }
        ]
    }
};