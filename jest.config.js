module.exports = {
    reporters: [
            "default",
            ["<rootDir>/node_modules/jest-html-reporters", {
                "publicPath": "./src/report",
                "filename": "report.html",
                "expand": true
            }]
        ],
    coverageDirectory: './src/coverage',
    collectCoverage: true,
    collectCoverageFrom: ['./src/**/*.{js}', '!**/node_modules/**', '!**/dist/**'],
    coverageReporters: ['html', 'text-summary']

};