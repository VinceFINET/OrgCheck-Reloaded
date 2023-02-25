"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Salesforce = exports.OrganizationType = void 0;
const jsforce_1 = require("jsforce");
var OrganizationType;
(function (OrganizationType) {
    OrganizationType[OrganizationType["NOT_SET"] = 0] = "NOT_SET";
    OrganizationType[OrganizationType["DeveperEdition"] = 1] = "DeveperEdition";
    OrganizationType[OrganizationType["Sandbox"] = 2] = "Sandbox";
    OrganizationType[OrganizationType["TrialOrDemo"] = 3] = "TrialOrDemo";
    OrganizationType[OrganizationType["Production"] = 4] = "Production";
})(OrganizationType = exports.OrganizationType || (exports.OrganizationType = {}));
class Salesforce {
    constructor(currentUserId, accessToken) {
        // Calculates the 'almost' latest API Version of Salesforce in Production
        const TODAY = new Date();
        const THIS_YEAR = TODAY.getFullYear();
        const THIS_MONTH = TODAY.getMonth() + 1;
        this._apiVersion = 3 * (THIS_YEAR - 2022) + 53 + (THIS_MONTH <= 2 ? 0 : (THIS_MONTH <= 6 ? 1 : (THIS_MONTH <= 10 ? 2 : 3)));
        // Setting some Ids
        this._userId = currentUserId;
        this._orgId = accessToken.split('!')[0];
        // Creates a connection to Salesforce using the access toekn from Visual Force page
        this._connection = new jsforce_1.Connection({
            accessToken: accessToken,
            version: this._apiVersion + '.0',
            maxRequest: 10000
        });
        this._orgType = OrganizationType.NOT_SET;
    }
    ;
    getApiVersion() {
        return this._apiVersion;
    }
    getOrganisationId() {
        return this._orgId;
    }
    getOrganisationType() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._orgType === OrganizationType.NOT_SET) {
                // Get the type of the org and potentially check if Org Check should be used
                yield this._connection.query('SELECT Id, Name, IsSandbox, OrganizationType, TrialExpirationDate FROM Organization')
                    .on('record', (r) => {
                    // if the current Org is DE, it's ok to use Org Check!
                    if (r.OrganizationType === 'Developer Edition') {
                        this._orgType = OrganizationType.DeveperEdition;
                    }
                    // if the current Org is a Sandbox, it's ok to use Org Check!
                    else if (r.IsSandbox === true) {
                        this._orgType = OrganizationType.Sandbox;
                    }
                    // if the current Org is not a Sandbox but a Trial Demo, it's ok to use Org Check!
                    else if (r.IsSandbox === false && r.TrialExpirationDate) {
                        this._orgType = OrganizationType.TrialOrDemo;
                    }
                    // Other cases need to set a BYPASS (in home page) to continue using the app.
                    else {
                        this._orgType = OrganizationType.Production;
                    }
                })
                    .run();
            }
            return this._orgType;
        });
    }
    getUserId() {
        return this._userId;
    }
    safeCaseId(id) {
        if (id && id.length == 18)
            return id.substring(0, 15);
        return id;
    }
    isVersionOld(version) {
        return ((this._apiVersion - version) / 3) >= 3;
    }
    secureSOQLBindingVariable(unsafe) {
        // If unset, return directly an empty string
        if (!unsafe && unsafe !== false && unsafe !== 0)
            return "''";
        // If already an array of something, use that array, else create a new one with one element
        const unsafeArray = Array.isArray(unsafe) ? Array.from(unsafe) : [unsafe];
        unsafeArray.forEach((e, i, a) => {
            // If unset or not primary type, use an empty string
            if ((!e && e !== false && unsafe !== 0) || (e && typeof (e) == 'object')) {
                a[i] = "''";
            }
            // If not a string typed value, return value is itself (case of a numeric)
            else if (typeof (e) !== 'string') {
                a[i] = e;
            }
            // If a string value, we substitute the quotes
            else {
                a[i] = "'" + e.replace(/'/g, "\'") + "'";
            }
        });
        return unsafeArray.join(',');
    }
    dependencyApi() {
    }
    query() {
    }
    describeGlobal() {
    }
    describe() {
    }
    readMetadata() {
    }
    readMetadataAtScale() {
    }
    httpCall() {
    }
}
exports.Salesforce = Salesforce;
