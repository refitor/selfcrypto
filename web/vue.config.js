const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CompressionWebpackPlugin = require('compression-webpack-plugin');
const { HashedModuleIdsPlugin } = require('webpack');

function resolve(dir) {
    return path.join(__dirname, dir)
}

const isProduction = true;

module.exports = {
    outputDir: '../selfcrypto',

    assetsDir: '../selfcrypto/assets',

    devServer: {
        overlay: {
            warnings: true,
            errors: true
        },
        port: 8000,
        https: false,
        open: false,
        hot: true,
        proxy: {
            "/api": {
                target: 'http://localhost:3157',
                changeOrigin: false,
                secure: false,
            }
        }
    },
    productionSourceMap: false,

    chainWebpack: config => {
        config.resolve.alias
            .set('@', resolve('src'))

        // compress images
        config.module
            .rule('images')
            .test(/\.(png|jpe?g|gif|svg)(\?.*)?$/)
            .use('image-webpack-loader')
            .loader('image-webpack-loader')
            .options({ bypassOnDebug: true })

        // delete webpack config
        config.optimization.delete('splitChunks')

        // config
        //     .plugin('webpack-bundle-analyzer')
        //     .use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin)
    },
    configureWebpack: config => {
        const plugins = [];

        if (isProduction) {
            // basic
            plugins.push(
                new UglifyJsPlugin({
                    uglifyOptions: {
                        output: {
                            comments: true,
                        },
                        warnings: false,
                        compress: {
                            drop_console: true,
                            drop_debugger: true,
                            pure_funcs: ['console.log']//移除console
                        }
                    }
                })
            )

            // gzip
            plugins.push(
                new CompressionWebpackPlugin({
                    algorithm: 'gzip',
                    test: /\.(js|css)$/,
                    threshold: 10000,
                    deleteOriginalAssets: false,
                    minRatio: 0.8
                })
            )

            // prod
            plugins.push(
                new HashedModuleIdsPlugin()
            )

            // split js
            config.optimization = {
                runtimeChunk: 'single',
                splitChunks: {
                    chunks: 'all',
                    maxInitialRequests: Infinity,
                    minSize: 1000 * 60,
                    cacheGroups: {
                        vendor: {
                            test: /[\\/]node_modules[\\/]/,
                            name(module) {
                                const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1]
                                return `npm.${packageName.replace('@', '')}`
                            }
                        }
                    }
                }
            };

            // ignore warning
            config.performance = {
                hints: 'warning',
                maxEntrypointSize: 1000 * 500,
                maxAssetSize: 1000 * 1000,
                assetFilter: function(assetFilename) {
                    return assetFilename.endsWith('.js');
                }
            }
        }

        return { plugins }
    },
}