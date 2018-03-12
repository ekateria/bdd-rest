const request = require('superagent');
const _ = require('lodash');
const chai = require('chai')
const chaiSubset = require('chai-subset');
const chaiString = require('chai-string');
chai.use(chaiSubset);
chai.use(chaiString);
const assert = chai.assert;
const yaml = require('js-yaml');
const fs = require('fs');
const { Given, When, Then, After, StepResult } = require('cucumber');

const seeReportMessage = "Please generate report by command 'yarn report' to see more.";

Given('valid account token with scope {string}', function (scope) {
	if (this.responseAccountAuthorizationToken && this.responseAccountAuthorizationToken[scope]) {
		this.authorizationToken = this.responseAccountAuthorizationToken[scope];
		this.lastBearerToken = {source : "response", type: "account", scope: scope, value: this.authorizationToken }
	}
	else {
		this.authorizationToken = this.config.userAccountTokens[scope];
		this.lastBearerToken = {source : "config", type: "account", scope: scope, value: this.authorizationToken }
	}
	if (!this.authorizationToken) {
		assert.fail(scope, "", "There is no account token with scope " + scope + " saved from response nor in config.yml");
	}
});

Given('valid profile token with scope {string}', function (scope) {
	if (this.responseProfileAuthorizationToken && this.responseProfileAuthorizationToken[scope]) {
		this.authorizationToken = this.responseProfileAuthorizationToken[scope];
		this.lastBearerToken = {source : "response", type: "profile", scope: scope, value: this.authorizationToken }
	}
	else {
		this.authorizationToken = this.config.userProfileTokens[scope];
		this.lastBearerToken = {source : "config", type: "profile", scope: scope, value: this.authorizationToken }
	}
	if (!this.authorizationToken) {
		assert.fail(scope, "", "There is no profile token with scope " + scope + " saved from response nor in config.yml");
	}
});

Given('base url is {string}', function (url) {
	this.baseUrl = url;
});

Given('request header {string} is {string}', function (key, value) {
	value = this.matcher.template(value);
	const item = { key, value };
	this.headers.push(item);
});

Given('variable {string} is {string}', function (name, value) {
	this.matcher.setVariable(name, value);
});

Given('imported profile data from {string}', function (fileName) {
	const data = yaml.safeLoad(fs.readFileSync('./profiles/' + this.profile + '/' + fileName, 'utf8'));
	const self = this;
	Object.keys(data).forEach(function (key, index) {
		self.matcher.setVariable(key, data[key]);
	});
});

When('GET request to {string}', function (url, callback) {
	const endpointUrl = this.matcher.template(this.baseUrl + url);
	const req = request.get(endpointUrl);
	setupHeaders(this, req);
	this.lastRequest = req;
	const self = this;
	req.end(function (err, res) {
		console.log("\nGET " + endpointUrl);
		self.lastResponse = res;
		callback();
	});
});

When('DELETE request to {string}', function (url, callback) {
	const endpointUrl = this.matcher.template(this.baseUrl + url);
	const req = request.delete(endpointUrl);
	setupHeaders(this, req);
	const self = this;
	self.lastRequest = req;
	req.end(function (err, res) {
		console.log("\nDELETE " + endpointUrl);
		self.lastResponse = res;
		callback();
	});
});

When('PUT request to {string}', function (url, callback) {
	const self = this;
	const endpointUrl = this.matcher.template(this.baseUrl + url);
	const req = request.put(endpointUrl);
	setupHeaders(this, req);
	self.lastRequest = req;	req.end(function (err, res) {
		console.log("\nPUT " + endpointUrl);
		self.lastResponse = res;
		callback();
	});
});

When('PATCH request to {string}', function (url, callback) {
	const self = this;
	const endpointUrl = this.matcher.template(this.baseUrl + url);
	const req = request.patch(endpointUrl);
	setupHeaders(this, req);
	self.lastRequest = req;
	req.end(function (err, res) {
		console.log("\nPATCH " + endpointUrl);
		self.lastResponse = res;
		callback();
	});
});

When(/^POST request to "(.*)" with body:$/, function (url, body, callback) {
	const self = this;
	const endpointUrl = this.matcher.template(this.baseUrl + url);
	const req = request.post(endpointUrl).set('Content-Type', 'application/json');
	setupHeaders(this, req);
	self.lastRequest = req;
	this.lastRequestBody = this.matcher.template(body);
	req.send(this.lastRequestBody)
		.end(function (err, res) {
			console.log("\nPOST " + endpointUrl);
			self.lastResponse = res;
			callback();
		});
});

// refactor this, duplicated code
When(/^PUT request to "(.*)" with body:$/, function (url, body, callback) {
	const self = this;
	const endpointUrl = this.matcher.template(this.baseUrl + url);
	req = request.put(endpointUrl).set('Content-Type', 'application/json');
	setupHeaders(this, req);
	self.lastRequest = req;
	this.lastRequestBody = this.matcher.template(body);
	req.send(this.lastRequestBody)
		.end(function (err, res) {
			console.log("\nPUT " + endpointUrl);
			self.lastResponse = res;
			callback();
		});
});

When(/^PATCH request to "(.*)" with body:$/, function (url, body, callback) {
	const self = this;
	const endpointUrl = this.matcher.template(this.baseUrl + url);
	req = request.patch(endpointUrl).set('Content-Type', 'application/json');
	setupHeaders(this, req);
	self.lastRequest = req;
	this.lastRequestBody = this.matcher.template(body);
	req.send(this.lastRequestBody)
		.end(function (err, res) {
			console.log("\nPATCH " + endpointUrl);
			self.lastResponse = res;
			callback();
		});
});

When('response {string} value is saved to {string}', function (expectedObjPath, expectedValue) {
	if (!this.lastResponse) {
		assert.fail(true, false, "There is no response for last request." + seeReportMessage );
	}
	const actualJsonBody = eval(this.lastResponse.body);
	const actualValue = _.get(actualJsonBody, expectedObjPath);

	if (actualValue === undefined) {
		assert.fail(expectedObjPath, "", "Can not find key: " + expectedObjPath + " in response. " + seeReportMessage);
	}
	this.matcher.setVariable(expectedValue, actualValue);
});

When('response {string} value is saved as valid account token with scope {string}', function (expectedObjPath, scope) {
	this.responseAccountAuthorizationToken = {};
	const actualJsonBody = eval(this.lastResponse.body);
	const actualValue = _.get(actualJsonBody, expectedObjPath);
	if (actualValue === undefined) {
		assert.fail(expectedObjPath, "", "Can not find key: " + expectedObjPath + " in response " + JSON.stringify(this.lastResponse.body));
	}
	this.responseAccountAuthorizationToken[scope] = actualValue;
});

When('response {string} value is saved as valid profile token with scope {string}', function (expectedObjPath, scope) {
	this.responseProfileAuthorizationToken = {};
	const actualJsonBody = eval(this.lastResponse.body);
	const actualValue = _.get(actualJsonBody, expectedObjPath);
	if (actualValue === undefined) {
		assert.fail(expectedObjPath, "", "Can not find key: " + expectedObjPath + " in response " + JSON.stringify(this.lastResponse.body));
	}
	this.responseProfileAuthorizationToken[scope] = actualValue;
});

When('variable {string} has any value THEN variable {string} is {string}', function (evalVariableName, assignVariableName, assignVariableValue) {
	const actualEvalVariable = this.matcher.getVariable(evalVariableName);
	if (actualEvalVariable) {
		this.matcher.setVariable(assignVariableName, assignVariableValue);
	}
});

When('variable {string} is empty THEN variable {string} is {string}', function (evalVariableName, assignVariableName, assignVariableValue) {
	const actualEvalVariable = this.matcher.getVariable(evalVariableName);
	if (!actualEvalVariable) {
		this.matcher.setVariable(assignVariableName, assignVariableValue);
	}
});

When('variable {string} has value {string} THEN variable {string} is {string}', function (evalVariableName, expectedEvalVariableValue, assignVariableName, assignVariableValue) {
	const actualEvalVariable = this.matcher.getVariable(evalVariableName);
	if (expectedEvalVariableValue == actualEvalVariable) {
		this.matcher.setVariable(assignVariableName, assignVariableValue);
	}
});

When('variable {string} has value {string} THEN variable {string} is empty', function (evalVariableName, expectedEvalVariableValue, assignVariableName) {
	const actualEvalVariable = this.matcher.getVariable(evalVariableName);
	if (expectedEvalVariableValue == actualEvalVariable) {
		this.matcher.setVariable(assignVariableName, "");
	}
});

Then('response status is {int}', function (expectedStatusCode) {
	if (!this.lastResponse) {
		assert.fail("There is no response to assert");
	}
	assert.equal(this.lastResponse.status, expectedStatusCode, "Status response does not match for endpoint");
});

Then('response status is {string}', function (expectedStatusCode) {
	if (!this.lastResponse) {
		assert.fail("There is no response to assert");
	}
	expectedStatusCode = this.matcher.template(expectedStatusCode);
	assert.equal(this.lastResponse.status, expectedStatusCode, "Status response does not match for endpoint");
});

Then('response values are:', function (table) {
	const actualJsonBody = eval(this.lastResponse.body);
	table.hashes().forEach(row => {
		const keys = Object.keys(row);
		if (keys[0] !== 'KEY') {
			assert.fail("", "", "Unsupported column header, column has to be named PATH");
		}
		if (keys[1] !== 'VALUE') {
			assert.fail("", "", "Unsupported column header, column has to be named VALUE");
		}
		const actualValue = _.get(actualJsonBody, row['KEY']);
		if (actualValue === undefined) {
			assert.fail(row['KEY'], "", "Can not find key: " + row['KEY'] + " in response. " + seeReportMessage);
		}
		row['VALUE'] = this.matcher.template(row['VALUE']);
		if (typeof (actualValue) === "boolean") {
			expectedValue = JSON.parse(row['VALUE']);
			assert.strictEqual(actualValue, expectedValue, "Response value " + row['KEY']);
		}
		else {
			assert.equal(actualValue, row['VALUE'], "Response value " + row['KEY']);
		}
	})
});

Then('response {string} values are:', function (expectedObjPath, table) {
	expectedObjPath = this.matcher.template(expectedObjPath);
	const actualJsonBody = eval(this.lastResponse.body);
	const actualValue = _.get(actualJsonBody, expectedObjPath);
	if (actualValue === undefined) {
		assert.fail(expectedObjPath, "", "Can not find key: " + expectedObjPath + " in response. " + seeReportMessage);
	}
	table.hashes().forEach(row => {
		const keys = Object.keys(row);
		if (keys[0] !== 'KEY') {
			assert.fail("", "", "Unsupported column header, column has to be named PATH");
		}
		if (keys[1] !== 'VALUE') {
			assert.fail("", "", "Unsupported column header, column has to be named VALUE");
		}
		const actualValue = _.get(_.get(actualJsonBody, expectedObjPath), row['KEY']);
		if (actualValue === undefined) {
			assert.fail(row['KEY'], "", "Can not find key: " + row['KEY'] + " in response. " + seeReportMessage);
		}
		row['VALUE'] = this.matcher.template(row['VALUE']);
		if (typeof (actualValue) === "boolean") {
			expectedValue = JSON.parse(row['VALUE']);
			assert.strictEqual(actualValue, expectedValue, "Response value " + row['KEY']);
		}
		else {
			assert.equal(actualValue, row['VALUE'], "Response value " + row['KEY']);
		}
	});
});

Then(/^response "(.*)" is:$/, function (expectedObjPath, expectedValue) {
	const actualJsonBody = eval(this.lastResponse.body);
	const actualValue = _.get(actualJsonBody, expectedObjPath);
	assert.equal(actualValue, expectedValue);
});	


Then('response {string} is {string}', function (expectedObjPath, expectedValue) {
	expectedValue = this.matcher.template(expectedValue);
	expectedObjPath = this.matcher.template(expectedObjPath);
	if (!this.lastResponse) {
		assert.fail(true, false, "There is no response for last request. " + seeReportMessage);
	}
	const actualJsonBody = eval(this.lastResponse.body);
	const actualValue = _.get(actualJsonBody, expectedObjPath);
	if (actualValue === undefined) {
		assert.fail(expectedObjPath, "", "Can not find key: " + expectedObjPath + " in response. " + seeReportMessage);
	}
	if (typeof (actualValue) === "boolean") {
		expectedValue = JSON.parse(expectedValue);
		assert.strictEqual(actualValue, expectedValue, "Response value " + expectedObjPath);
	}
	else {
		assert.equal(actualValue, expectedValue, "Response value " + expectedObjPath);
	}
});

Then('response {string} size is at least {int}', function (expectedObjPath, size) {
	expectedObjPath = this.matcher.template(expectedObjPath);
	const actualJsonBody = eval(this.lastResponse.body);
	const actualArray = _.get(actualJsonBody, expectedObjPath);
	if (actualArray === undefined) {
		assert.fail(expectedObjPath, "", "Can not find key: " + expectedObjPath + " in response."); 
	}
	assert.isAtLeast(actualArray.length, size, "Size of array " + expectedObjPath);
});

Then('response {string} size is {int}', function (expectedObjPath, size) {
	expectedObjPath = this.matcher.template(expectedObjPath);
	const actualJsonBody = eval(this.lastResponse.body);
	const actualArray = _.get(actualJsonBody, expectedObjPath);
	if (actualArray === undefined) {
		assert.fail(expectedObjPath, "", "Can not find key: " + expectedObjPath + " in response");
	}
	assert.equal(actualArray.length, size, "Size of array " + expectedObjPath);
});

Then('response {string} is equal {string}', function (firstKey, secondKey) {
	firstKey = this.matcher.template(firstKey);
	secondKey = this.matcher.template(secondKey);
	const actualJsonBody = eval(this.lastResponse.body);
	const firstValue = _.get(actualJsonBody, firstKey);
	const secondValue = _.get(actualJsonBody, secondKey);
	if (firstValue === undefined) {
		assert.fail(firstKey, "", "Can not find key: " + firstKey + " in response. " + seeReportMessage);
	}
	if (secondKey === undefined) {
		assert.fail(secondKey, "", "Can not find key: " + secondKey + " in response. " + seeReportMessage);
	}
	assert.equal(firstValue, secondValue, "Response value " + firstKey + " and " + secondKey);
});

// refactor this, repeated code
Then('response {string} is not equal {string}', function (firstKey, secondKey) {
	firstKey = this.matcher.template(firstKey);
	secondKey = this.matcher.template(secondKey);
	const actualJsonBody = eval(this.lastResponse.body);
	const firstValue = _.get(actualJsonBody, firstKey);
	const secondValue = _.get(actualJsonBody, secondKey);
	if (firstValue === undefined) {
		assert.fail(firstKey, "", "Can not find key: " + firstKey + " in response. " + seeReportMessage);
	}
	if (secondKey === undefined) {
		assert.fail(secondKey, "", "Can not find key: " + secondKey + " in response. " + seeReportMessage);
	}
	assert.notEqual(firstValue, secondValue, "Response value " + firstKey + " and " + secondKey);
});

Then('response {string} contains {string}', function (expectedObjPath, expectedValue) {
	expectedValue = this.matcher.template(expectedValue);
	expectedObjPath = this.matcher.template(expectedObjPath);
	if (!this.lastResponse) {
		assert.fail(true, false, "There is no response for last request. " + seeReportMessage);
	}
	const actualJsonBody = eval(this.lastResponse.body);
	const actualValue = _.get(actualJsonBody, expectedObjPath);
	if (actualValue === undefined) {
		assert.fail(expectedObjPath, "", "Can not find key: " + expectedObjPath + " in response. " + seeReportMessage);
	}
	else {
		//checks that a string contains another one, by ignoring the CASE.
		assert.containIgnoreCase(actualValue, expectedValue, "Response value " + expectedObjPath);
	}
});

Then('response {string} is not empty', function (key) {

	key = this.matcher.template(key);
	const actualJsonBody = eval(this.lastResponse.body);
	const value = _.get(actualJsonBody, key);
	if (value === undefined) {
		assert.fail(firstKey, "", "Can not find key: " + firstKey + " in response. " + seeReportMessage);
	}
	assert.exists(value, "Response value " + key);
});

Then('response header {string} is {string}', function (key, expectedValue) {
	key = this.matcher.template(key);
	expectedValue = this.matcher.template(expectedValue);
	if (!this.lastResponse.headers.hasOwnProperty(key)) {
		assert.fail(this.lastResponse.headers, key, "Can not found response header " + key);
	}
	const actualValue = this.lastResponse.headers[key];
	if (typeof (actualValue) === "boolean") {
		expectedValue = JSON.parse(expectedValue);
		assert.strictEqual(actualValue, expectedValue, "Response header " + key);
	}
	else {
		assert.equal(actualValue, expectedValue, "Response header " + key);
	}
});

Then('response header {string} is not empty', function (key) {
	key = this.matcher.template(key);
	if (!this.lastResponse.headers.hasOwnProperty(key)) {
		assert.fail(this.lastResponse.headers, key, "Can not found response header: " + key);
	}
	else 
		assert.exists(this.lastResponse.headers[key]);
});

Then('response body is empty', function () {
	const isResponseEmpty = _.isEmpty(eval(this.lastResponse.body));
	assert.isTrue(isResponseEmpty, "Response is empty");
});

Then('response body is not empty', function () {
	const isResponseEmpty = _.isEmpty(eval(this.lastResponse.body));
	assert.isFalse(isResponseEmpty, "Response is not empty");
});

Then('variable {string} has value {string}', function (variableName, expectedVariableValue) {
	const actualValue = this.matcher.getVariable(variableName);
	assert.equal(actualValue, expectedVariableValue, "Variable " + variableName + " has value.");
});

Then('variable {string} has value {int}', function (variableName, expectedVariableValue) {
	const actualValue = this.matcher.getVariable(variableName);
	assert.equal(actualValue, expectedVariableValue, "Variable " + variableName + " has value.");
});

Then('variable {string} has any value', function (variableName) {
	const actualValue = this.matcher.getVariable(variableName);
	assert.isNotEmpty(actualValue, "Variable " + variableName + " has any value.");
});

Then('variable {string} is empty', function (variableName) {
	const actualValue = this.matcher.getVariable(variableName);
	assert.isEmpty(actualValue, "Variable is " + variableName + " empty.");
});

Then('variable {string} has not value {string}', function (variableName, expectedVariableValue) {
	const actualValue = this.matcher.getVariable(variableName);
	assert.notEqual(actualValue, expectedVariableValue, "Variable " + variableName + "has not value " + expectedVariableValue);
});

Then('response {string} has items {string}', function (variableName, expectedValues) {
	//check if the input value in the format <data.id> or just <data>
	const arrDataName = variableName.split('.');
	console.log(JSON.parse(expectedValues));
	if (arrDataName.length > 1) {
		const actualValues = JSON.parse(this.lastResponse["text"])[arrDataName[0]];
		const subLevel = arrDataName[1];
		for (var i = 0; i < actualValues.length; i++) {
			assert.equal(actualValues[i][subLevel], JSON.parse(expectedValues)[i], "Variable " + variableName + "has value " + actualValues[i][subLevel] + " at the index " + i);
		}
	} else {
		assert.fail("", "", "Format of variable is expected in the format <data.id>");
	}
});

Then('response {string} has items', function (variableName, dataTable) {
	//check if the input value in the format <data.id> or just <data>
	const arrDataName = variableName.split('.');
	if (arrDataName.length > 1) {
		const actualValues = JSON.parse(this.lastResponse["text"])[arrDataName[0]];
		const subLevel = arrDataName[1];
		for (var i = 0; i < actualValues.length; i++) {
			assert.equal(actualValues[i][subLevel], dataTable.raw()[i][0], "Variable " + variableName + "has value " + actualValues[i][subLevel] + " at the index " + i);
		}
	} else {
		const actualValues = JSON.parse(this.lastResponse["text"])[arrDataName[0]];
		var attributes = [];
		dataTable.raw()[0].forEach(attr => {
			attributes.push(attr)
		})
		const data = dataTable.rows();
		for (var i = 0; i < actualValues.length; i++) {
			for (var j = 0; j < attributes.length; j++) {
				const currentAttribute = attributes[j];
				assert.equal(actualValues[i][currentAttribute], data[i][j], "Variable " + variableName + "has value " + actualValues[i][currentAttribute] + " at the index " + i);
			}
		}
	}
});

After(function (scenario,done) {
	if (scenario.result.status === 'failed') {
		this.attach(getTokensDebug(this.lastBearerToken));
		this.attach(getVariablesDebug(this.matcher));
		this.attach(getDebugInfo(this.lastRequest, this.lastResponse, this.lastRequestBody));
	}
	done();	
});

function setupHeaders(world, req) {
	for (var i = 0; i < world.headers.length; i++) {
		req.set(world.headers[i].key, world.headers[i].value)
	}
	if (world.authorizationToken) {
		req.set('Authorization', 'Bearer ' + world.authorizationToken);
	}
}

function getDebugInfo(lastRequest, lastResponse, lastRequestBody) {
	let debugInfo = "<strong>Request </strong> <br />" +
		"Method: " + lastRequest.method + "<br />" +
		"URL: " + lastRequest.url + "<br />" +
		"Headers: " + JSON.stringify(lastRequest.header, undefined, 2) + "<br />";

	if (lastRequestBody) {
		debugInfo += "Body: <br />" + lastRequestBody + "<br />";
	}
	debugInfo += "<br/><br />";

	if (lastResponse) {
		debugInfo += "<strong>Response</strong> <br />";
		debugInfo += "Status: " + lastResponse.status + "<br />";
		debugInfo += "Headers: " + JSON.stringify(lastResponse.headers, undefined, 2) + "<br />";
		if (lastRequest.response) {
			debugInfo += "Body: <br />" + JSON.stringify(lastResponse.body, undefined, 2);
		}
	}
	debugInfo += "<br />";
	return debugInfo;
}

function getTokensDebug(lastBearerToken) {
	if (lastBearerToken) {
		return  "<strong>Auth token</strong><br />" + JSON.stringify(lastBearerToken, undefined, 2) + "<br />";
	}
	return "<strong>Auth token</strong><br />No auth token used<br />";
}

function getVariablesDebug(matcher) {
	if (_.isEmpty(matcher.variables)) {
		return "";
	}
	return  "<strong>Variables</strong><br />" + JSON.stringify(matcher.variables, undefined, 2) + "<br />";
}

