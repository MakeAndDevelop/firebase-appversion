# Firebase Increment App Version
Github action to retrieve the latest app version from a firebase app distribution project.
_Only tested with Android App Distributions_

## Example usage

```yml
name: Build & increase version & upload to Firebase

on: [push]

jobs:
  build:

    runs-on: ubuntu-latest

    steps:
    
    # Your Preparation steps
    - name: Get app version
    - name: Get latest app version
      id: version
      uses: MakeAndDevelop/firebase-latest-app-version@v1
      with:
        appId: ${{secrets.FIREBASE_APP_ID}}
        projectNumber: ${{secrets.FIREBASE_PROJECT_NUMBER}}
        serviceAccount: ${{secrets.FIREBASE_SERVICE_ACCOUNT}}

    # For flutter use below to increment version:
    - name: Update version in YAML
      run: | 
        sed -i 's/version: [0-9]*\.[0-9]*\.[0-9]*+[0-9]*/version: ${{ steps.version.outputs.newFlutterVersionString }}/' pubspec.yaml
        
     # On mac agent: sed -i '' 's/version: [0-9]*\.[0-9]*\.[0-9]*+[0-9]*/version: ${{ steps.version.outputs.newFlutterVersionString }}/' pubspec.yaml

     # Your Build and Distribution steps steps
     # eg: wzieba/Firebase-Distribution-Github-Action@v1
```

## Inputs

### serviceAccount : string
Service account json string 

**!-- Make sure to include this as github secret --!**

See: `https://console.firebase.google.com/project/{YOUR_PROJECT_NAME}/settings/serviceaccounts/adminsdk` to create one. The json string should at least look like this:

```json
{
    "client_email": "service account email"
    "private_key": "service account private key"
}
```

Make sure the service account has the following roles:
- `Firebase App Distribution Admin SDK Service Agent`: *Firebase App Distribution Admin SDK Service Agent*
- `Firebase App Distribution Admin SDK Service Agent`: *Firebase App Distribution Admin SDK Service Agent*

These roles can be set from: `https://console.cloud.google.com/iam-admin/iam?project={YOUR_PROJECT_NAME}` 

### projectNumber : string

***Preferably include this as github secret***

The project number of the firebase app distribution project where your app is located
THis can be found on the https://console.firebase.google.com/project/{YOUR_PROJECT_NAME}/settings/general

### appId : string

***Preferably include this as github secret***

The id of the firebase app distribution you want to retrieve the latest version from.
THis can be found on the https://console.firebase.google.com/project/{YOUR_PROJECT_NAME}/settings/general

## Outputs

### displayVersion : string
The latest app version string (eg: 1.0.0)
  
### buildVersion : string
The latest app build number (eg: 10)
  
### flutterVersionString : string
The latest app version + build number (eg: 1.0.0+10)

### newDisplayVersion : string
The latest app version string (eg: 1.0.1)
  
### newBuildVersion : string
The latest app build number (eg: 11)
  
### newFlutterVersionString : string
The latest app version + build number (eg: 1.0.1+11)
