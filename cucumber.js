var common = '--format=json:report/cucumber-report.json '

module.exports = {
    'default': common,
    'dev': common + '--tags @dev'
};
