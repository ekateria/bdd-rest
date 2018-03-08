var reporter = require('cucumber-html-reporter');

var options = {
    theme: 'bootstrap',
    jsonFile: 'report/cucumber-report.json',
    output: 'report-cucumber.html',
    reportSuiteAsScenarios: true,
    launchReport: true,
    brandTitle: 'Massive',
    name: 'REST API tests'
};

reporter.generate(options);

