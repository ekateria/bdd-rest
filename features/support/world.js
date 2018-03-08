const util = require('util');
const yaml = require('js-yaml');
const fs   = require('fs');
const args = require("args-parser")(process.argv)
const randomstring = require("randomstring");
const {setWorldConstructor, setDefaultTimeout} = require('cucumber');

setWorldConstructor(CustomWorld)

function getCurrentProfileName() {
	return args.profile === undefined ? 'default' : args.profile;
}

function CustomWorld(parameters) {
	this.attach = parameters.attach;
	this.parameters = parameters.parameters;
	this.tokens = {};
	this.profile = getCurrentProfileName();
	let configFileName = 'profiles/' + this.profile  + '/config.yml';
	this.config = yaml.safeLoad(fs.readFileSync(configFileName, 'utf8'));
	this.baseUrl = this.config.url;
	this.headers = [];
	this.util = util;
	this.matcher = new Matcher();
	this.lastResponse = null;
	this.lastRequest = null;
	this.lastRequestBody = null;
	let timeoutInMilisec = 10 * 1000;
	if (this.config.timeout !== undefined) {
		timeoutInMilisec = this.config.timeout
	}
	setDefaultTimeout(timeoutInMilisec);
}

function Matcher(){
	this.variables = {};
};

Matcher.prototype.extractVarRegex = /\$\{(\w+?)\}/gm;
Matcher.prototype.insertVarRegex = /\$\{(\w+?)\}/gm;

Matcher.prototype.matchValues = function(actual, expected){
	var variableName = null;
	if(typeof expected === "undefined"){
		throw { name: "Unmatched" , expected: expected, actual: actual };
	} else if(expected === "*"){
		//ignore this property
		return;
	} else if(typeof expected === "string" && (variableName = expected.match(this.extractVarRegex)) !== null){
		//extract var and store as variable
		variableName = variableName[0];
		this.variables[variableName.replace(/\$|\{|\}/g,"")] = actual;
	} else if(typeof expected === "string" 
		|| typeof expected === "number"
		|| expected === null
	) {
		if(actual !== expected){
			throw { name: "Unmatched" , expected: expected, actual: actual };
		}
	} else if(Array.isArray(actual)){
		//iterate the array value
		this.iterateArray(actual, expected);
	} else if(typeof actual === "object"){
		//iterate the object value
		this.iterateObject(actual, expected);
	}
};

Matcher.prototype.iterateObject = function(actual, expected){
	for(var key in actual){
		if(actual.hasOwnProperty(key)){
			var acPropValue = actual[key];
			var expPropValue = expected[key];
			this.matchValues(acPropValue, expPropValue);		
		}
		delete expected[key];
	}
	if(Object.keys(expected).length > 0){
		throw { name: "Unmatched" , message: "Expected output to have keys "+Object.keys(expected).join(" ")};
	}
};

Matcher.prototype.iterateArray = function(actual, expected){
	if(actual.length !== expected.length){
		throw { name: "Unmatched" , message: "Expected array \n"+expected+"\n got \n"+actual };
	}
	for(var i=0; i<actual.length; i++){
		var actArrVal = actual[i];
		var expArrVal = expected[i];
		this.matchValues(actArrVal, expArrVal);
	}
};

// function to find ${variables} and replace them with their value
Matcher.prototype.template = function(str ){
	var variableList = this.variables;
	Object.keys(variableList).forEach(function(key,index) {
		let variableValue = variableList[key];
		if (variableValue.toString().indexOf('randomString') !=-1) {
			variableList[key] = generateRandomStr(variableValue); 
		}
		if (variableValue.toString().indexOf('randomInt') !=-1) {
			variableList[key] = generateRandomStr(variableValue, 'int'); 
		}
		if (variableValue.toString().indexOf('randomBool') !=-1) {
			variableList[key] = generateRandomBoolValue(); 
		}
	});
	return str.replace(this.insertVarRegex, function(match){
		if (match.indexOf('randomString') !=-1) {
			return generateRandomStr(match);
		}
		if (match.indexOf('randomInt') !=-1) {
			return generateRandomStr(match, 'int');
		}
		if (match.indexOf('randomBool') !=-1) {
			return generateRandomBoolValue();
		}
		return variableList[match.replace(/\$|\{|\}/g,"")]
	});
};

Matcher.prototype.match = function(actual, expected){
	try{
		var actualJSON = JSON.parse(actual);
		var expectedJSON = JSON.parse(expected);
		this.matchValues(actualJSON, expectedJSON);	
		return true;
	} catch (e){
		console.log("Error ", e);
		return false;
	}
};

Matcher.prototype.getVariable = function(varName){
	return this.variables[varName];
};

Matcher.prototype.setVariable = function(varName, value){
	this.variables[varName] = value;
};

Matcher.prototype.getVariables = function(){
	return JSON.parse(JSON.stringify(this.variables));
};

function generateRandomStr(pattern, type = 'string') { 
	var strLength = 20;
	if (pattern.match(/\d+/)) {
		strLength = pattern.match(/\d+/)[0];
	}
	if (type === 'string') {
		return randomstring.generate(parseInt(strLength));   
	}
	if (type === 'int') {
		return randomstring.generate({
			length: parseInt(strLength),
			charset: 'numeric'
		});
		randomstring.generate(parseInt(strLength));   
	}
	return randomstring.generate(parseInt(strLength));   
};

function generateRandomBoolValue() {
	return Math.random() >= 0.5;
}

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
