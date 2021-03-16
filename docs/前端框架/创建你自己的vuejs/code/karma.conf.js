module.exports = function (config) {
    config.set({
        files: [{ pattern: 'test/**/*.spec.js', watched: false }],
        frameworks: ['jasmine'],
        browsers: [
            'ChromeDebugging'
        ],
        customLaunchers: {
            ChromeDebugging: {
                base: 'Chrome',
                flags: ['--remote-debugging-port=9333']
            }
        },
        preprocessors: {
            './test/**/*.js': ['rollup']
        },
        rollupPreprocessor: {
            plugins: [
                require('rollup-plugin-buble')(),
            ],
            output: {
                format: 'iife',
                name: 'Vue',
                sourcemap: 'inline'
            }
        }
    })
}