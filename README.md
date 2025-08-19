# OrgCheck

OrgCheck is an easy-to-install and easy-to-use "Salesforce application" and a "sfdx plugin" in order to quickly analyze your org and its technical debt.

Here is a presentation of the approach:
https://sfdc.co.OrgCheck-Presentation


## Installation of the Salesforce application

Here is the links of OrgCheck's unlocked packages:
- Version 2.0: https://test.salesforce.com/packaging/installPackage.apexp?p0=TOBEDEFINED

PLEASE install it in sandbox ONLY!!!

If already installed, just go to the link and it will update the application.

For some orgs that have Apex class not compiling, you can install the package without checking Apex classes (advanced setting when installing the app).


## Installation of the sfdx plugin

```
sfdx plugin install TOBEDEFINED
```


## History

OrgCheck was previously only a salesforce application with a big Javascript file that included all the "magic" of the tool.
One of the idea I had, after I created the first version of the salesforce app, was that the same code should be run in the salesforce app but also in a SFDX plugin.
So to be short, I needed to get the "magic" in a core package, and then use it in a salesforce application and a sfdx plugin.


## Repository structure

To maintain only one repository, I use lerna to split the repo into three different packages: one for the "magic", one for the salesforce application, and one for the sfdx plugin.

```
├── lerna.json
├── package.json
├── packages
│   ├── orgcheck-api
│   │   ├── package.json
│   │   └── src
│   │       ├── ...
│   └── orgcheck-salesforce-app
│       ├── package.json
│       └── src
│           └── ...
│   └── orgcheck-sfdx-plugin
│       ├── package.json
│       └── src
│           └── ...
├── README.md
└── yarn.lock
```
