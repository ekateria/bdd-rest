var fs = require('fs-extra');
var cucumberJunit = require('cucumber-junit');

try {
  const reportRaw = fs.readFileSync('report/cucumber-report.json').toString().trim();
  var xmlOuput = cucumberJunit(reportRaw);
  fs.writeFileSync('report/cucumber-report.xml', xmlOuput);
} catch (e) {
  console.error('Unable to parse cucumberjs output into json:', e);
}


