var path = require('path');
var version = require('./package.json').version;

var rules = [
    { test: /\.css$/, use: ['style-loader', 'css-loader']}
]

module.exports = [
    {// Notebook extension
        entry: './lib/extension.js',
        output: {
            filename: 'extension.js',
            path: path.resolve(__dirname, '../bqplot_linlog/nbextension'),
            libraryTarget: 'amd',
            publicPath: "",
        }
    },
    {// Bundle for the notebook
        entry: './lib/index.js',
        output: {
            filename: 'index.js',
            path: path.resolve(__dirname, '../bqplot_linlog/nbextension'),
            libraryTarget: 'amd',
            publicPath: "",
        },
        devtool: 'source-map',
        module: {
            rules: rules
        },
        externals: ['@jupyter-widgets/base', 'bqplot']
    },
    {// Embeddable bundle
        entry: './lib/embed.js',
        output: {
            filename: 'index.js',
            path: path.resolve(__dirname, 'dist'),
            libraryTarget: 'amd',
            publicPath: 'https://unpkg.com/bqplot-linlog@' + version + '/dist/',
        },
        devtool: 'source-map',
        module: {
            rules: rules
        },
        externals: ['@jupyter-widgets/base', 'bqplot']
    }
];
