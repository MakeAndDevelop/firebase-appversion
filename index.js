const core = require('@actions/core');
const github = require('@actions/github');
const request = require('request');
const { google } = require("googleapis");

const scopes = [
    "https://www.googleapis.com/auth/cloud-platform",
];

const serviceAccount = JSON.parse(core.getInput('serviceAccount'));
const projectNumber = core.getInput('projectNumber');
const appId = core.getInput('appId');

try {
    // Authenticate a JWT client with the service account.
    var jwtClient = googleJwtClient();

    // Use the JWT client to generate an access token.
    jwtClient.authorize(function (error, tokens) {
        if (error) {
            return core.setFailed(`Authentication failed: ${error.message}`);
        } else if (tokens.access_token === null) {
            core.setFailed('Provided service account does not have permission to generate access tokens');
        } else {
            // Get latest release and parse it's version to the current and new version
            getLatestRelease(tokens.access_token);
        }
    });

} catch (error) {
    core.setFailed(error.message);
}

function googleJwtClient() {
    return new google.auth.JWT(
        serviceAccount['client_email'],
        null,
        serviceAccount['private_key'],
        scopes
    );
}

function getLatestRelease(accessToken) {
    const url = `https://firebaseappdistribution.googleapis.com/v1/projects/${projectNumber}/apps/${appId}/releases?orderBy=createTime%20desc&pageSize=1`;

    const options = {
        url: url,
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    };

    request(options, (error, res, body) => {
        if (error) {
            return core.setFailed(`Something went wrong, make sure your service account has the "Firebase App Distribution Admin" role. ${error.message}`);
        };

        if (!error && res.statusCode == 200) {
            setVersionOutput(body);
        };
    });
}

function setVersionOutput(body) {
    const json = JSON.parse(body);
    const displayVersion = json['releases'][0]['displayVersion'];
    const buildVersion = json['releases'][0]['buildVersion'];

    console.log(`Current version: ${displayVersion}+${buildVersion}`);

    core.setOutput('displayVersion', displayVersion);
    core.setOutput('buildVersion', buildVersion);
    core.setOutput('flutterVersionString', `${displayVersion}+${buildVersion}`);

    const newDisplayVersion = incrementVersion(displayVersion);
    const newBuildVersion = parseInt(buildVersion) + 1;
    console.log(`New version: ${newDisplayVersion}+${newBuildVersion}`);

    core.setOutput('newDisplayVersion', newDisplayVersion);
    core.setOutput('newBuildVersion', newBuildVersion);
    core.setOutput('newFlutterVersionString', `${newDisplayVersion}+${newBuildVersion}`);
}

function incrementVersion(displayVersion) {
    const versionComponents = displayVersion.split('.');
    const newRevision = parseInt(versionComponents[2]) + 1;
    return `${versionComponents[0]}.${versionComponents[1]}.${newRevision}`;
}