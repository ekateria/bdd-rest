var reporter = require('cucumber-html-reporter');

const currentDate = getFormattedDate();

var options = {
    theme: 'bootstrap',
    jsonFile: 'report/cucumber-report.json',
    output: 'report/' + currentDate + '-cucumber-report.html',
    reportSuiteAsScenarios: true,
    launchReport: true,
    brandTitle: 'Massive',
    name: 'REST API tests'
};

reporter.generate(options);

function getFormattedDate() {
    var date = new Date();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var min = date.getMinutes();
    var sec = date.getSeconds();
    
    month = (month < 10 ? "0" : "") + month;
    day = (day < 10 ? "0" : "") + day;
    hour = (hour < 10 ? "0" : "") + hour;
    min = (min < 10 ? "0" : "") + min;
    sec = (sec < 10 ? "0" : "") + sec;
    return date.getFullYear() + "-" + month + "-" + day + "_" +  hour + "-" + min + "-" + sec;
}