module.exports = function (config) {
    config.set({
        files: [{ pattern: 'test/**/*.spec.js', watched: false }],
        frameworks: ['jasmine'],
        browsers: ['Chrome'],
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