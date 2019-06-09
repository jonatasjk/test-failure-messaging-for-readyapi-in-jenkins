/*Importing modules*/
const http = require('http');
var url = require('url');
var readline = require('readline');
var stream = require('request');
var cheerio = require('cheerio');
var responsibles = require('./responsibles.json');

/*Environment variables*/
var jenkinsUser = process.env.JENKINS_USER;
var jenkinsPass = process.env.JENKINS_PASS;
var jenkinsHost = process.env.JENKINS_HOST;

/*Defines the Hostname and Port*/
const hostname = jenkinsHost;
const user = jenkinsUser;
const pass = jenkinsPass;
const port = 3000;

/*Temporary variables*/
var failures = '';
var failuresFound = '';
var uriToSendMessage = '';

/*Creates the service*/
const server = http.createServer(
	(req, res) => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'text/plain');
		
		/*"build" is a query param, use like this: http://localhost:3000/?build=1*/
		var q = url.parse(req.url, true).query;
		var build = q.build;

		res.write("Build: " + build + "\n");
		
		failuresFound = getFailures(build);
		console.log("Failures: " + failuresFound);
		getTestCases(failuresFound);

		failuresFound = '';
		res.end();
	}
);

/*Runs the service on defined Hostname and Port*/
server.listen(port, hostname, () => {
	console.log('Server running at http://${hostname}:${port}/');
}

/*Gets the content source of Failures Report from Jenkins*/
function getFailures(build){
	var uriRequest = "https://" + user + ":" + pass + "@jenkins.jonataskirsch.com/view/Scheduled%20Jobs/jobs/Run_QA_Test/" + build + "/TestResults/Test-fails.html";
	uriToSendMessage = "https://jenkins.jonataskirsch.com/view/Scheduled%20Jobs/job/Run_QA_Test/" + build + "/TestResults/Test-fails.html";

	request({
		uri: uriRequest,
	}, function(error, response, body){
		if(!error && response.statusCode == 200){
			var $ = cheerio.load(body);
			$('tr.Failure').each(function(i, element){
				var tr = $(this);
				failures = failures + tr;
			});
		}
	});
	return failures;
}

/*Identifies the names of test cases and calls the messaging*/
function getTestCases(failuresFound){
	var buf = new Buffer(failuresFound);
	var bufferStream = new stream.PassThrough();
	bufferStream.end(buf);

	var rl = readline.createInterface({
		input: bufferStream,
	)};

	var count = 0;
	rl.on('line', function(line){
		if(line.indexOf("<td><a name") > -1){
			var $ = cheerio.load(line);
			var testCase = $('a').attr('name');
			var responsible = '';

			responsible = getResponsible(testCase);
			if(responsible === ""){
				responsible = 'no-responsible-yet';
			}
			console.log("Test case: " + testCase + " | Responsible: " + responsible);
			messaging(testCase, responsible);
		}
	});
}

/*Identifies the responsible of a test case*/
function getResponsible(testCaseName){
	var experienceObject = responsibles;
	var objectEntries = Object.entries(experienceObject);
	var isIdentified = false;
	var responsibleForFeature = 'no-responsible-yet';

	Object.entries(experienceObject).forEach(([key, value]) => {
		var values = Object.entries(value);
		Object.entries(value).forEach(([key, value]) => {
			if(isIdentified === true){
				responsibleForFeature = value;
				isIdentified = false;
			}
			if(value.indexOf(testCaseName) > -1){
				isIdentified = true;
			}
		});
		isIdentified = false;
	});
	return responsibleForFeature;
}

/*Sends the report to responsible*/
function messaging(testCase, responsible){
	var Slack = require('slack-node');
	var webhookUri = "https://hooks.slack.com/services/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";
	var	slack = new Slack();
	slack.setWebhook(webhookUri);
	
	slack.webhook({
		channel: "#software-testing",
		text: "<@" + responsible + ">, " + " test failed:\n" + testCase + "\n<" + uriToSendMessage + ">"
	}, function(err, response){
		console.log(response);
	});
}