'use strict';

import { task, src, dest, watch as _watch, parallel } from 'gulp';
import webpack from 'webpack-stream';
import { stream, reload, init } from 'browser-sync';

const dist = './dist/';
// const dist = "/Applications/MAMP/htdocs/test"; // Ссылка на вашу папку на сервере

task('copy-html', () => {
    return src('./src/*.html')
        .pipe(dest(dist))
        .pipe(stream());
});

task('build-js', () => {
    return src('./src/js/main.js')
        .pipe(webpack({
            mode: 'development',
            output: {
                filename: 'script.js'
            },
            watch: false,
            devtool: 'source-map',
            module: {
                rules: [
                    {
                        test: /\.m?js$/,
                        exclude: /(node_modules|bower_components)/,
                        use: {
                            loader: 'babel-loader',
                            options: {
                                presets: [['@babel/preset-env', {
                                    debug: true,
                                    corejs: 3,
                                    useBuiltIns: 'usage'
                                }]]
                            }
                        }
                    }
                ]
            }
        }))
        .pipe(dest(dist))
        .on('end', reload);
});

task('copy-assets', () => {
    return src('./src/assets/**/*.*')
        .pipe(dest(dist + '/assets'))
        .on('end', reload);
});

task('watch', () => {
    init({
        server: {
            baseDir: './dist/',
            serveStaticOptions: {
                extensions: ['html']
            }
        },
        port: 4000,
        notify: true
    });
    
    _watch('./src/*.html', parallel('copy-html'));
    _watch('./src/assets/**/*.*', parallel('copy-assets'));
    _watch('./src/js/**/*.js', parallel('build-js'));
});

task('build', parallel('copy-html', 'copy-assets', 'build-js'));

task('build-prod-js', () => {
    return src('./src/js/main.js')
        .pipe(webpack({
            mode: 'production',
            output: {
                filename: 'script.js'
            },
            module: {
                rules: [
                    {
                        test: /\.m?js$/,
                        exclude: /(node_modules|bower_components)/,
                        use: {
                            loader: 'babel-loader',
                            options: {
                                presets: [['@babel/preset-env', {
                                    corejs: 3,
                                    useBuiltIns: 'usage'
                                }]]
                            }
                        }
                    }
                ]
            }
        }))
        .pipe(dest(dist));
});

task('default', parallel('watch', 'build'));