# Test failure messaging for ReadyAPI reports in Jenkins
> This application reads ReadyAPI reports from Jenkins and sends notification via Slack to the responsible of each failing test.

## Requirements

* [Jenkins](https://jenkins.io)
* [ReadyAPI configured to run in Jenkins](https://support.smartbear.com/readyapi/docs/integrations/jenkins.html)
* [Node.js](https://nodejs.org/en/)
* [Slack](https://slack.com)
* [Slack app with a webhook](https://api.slack.com/apps?new_app=1)

## Project Structure

```
responsibles.json
server.js
```

* The _responsibles.json_ is the file where you will define the responsibles for each test case.

* The _server.js_ contains the code of application.

## Setup

Once you have the required tools installed, edit the variables in the code, such as the user and password of Jenkins, the Slack channel and the url of the webhook.

Configure your Jenkins to call this node service when Jenkins finishes the test execution.

Make it call the url http:hostname:port/?build=<Jenkins build number>

Example:
http://localhost:3000/?build=1

## Meta

Jonatas Kirsch – [Linkedin](https://linkedin.com/in/jonataskirsch)


## Contributing

1. Fork it (<https://github.com/jonatask/test-failure-messaging-for-readyapi-in-jenkins/fork>)
2. Create your feature branch (`git checkout -b feature/fooBar`)
3. Commit your changes (`git commit -am 'Add some fooBar'`)
4. Push to the branch (`git push origin feature/fooBar`)
5. Create a new Pull Request
