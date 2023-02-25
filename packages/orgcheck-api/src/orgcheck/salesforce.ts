import { Connection, SalesforceId } from 'jsforce';

export enum OrganizationType {
    NOT_SET,
    DeveperEdition,
    Sandbox,
    TrialOrDemo,
    Production
}

export class Salesforce {

    private _apiVersion: number;
    private _orgId: SalesforceId;
    private _orgType: OrganizationType;
    private _userId: SalesforceId;
    private _connection: Connection;    
    
    public constructor(currentUserId: string, accessToken: string) {

        // Calculates the 'almost' latest API Version of Salesforce in Production
        const TODAY: Date = new Date();
        const THIS_YEAR: number = TODAY.getFullYear();
        const THIS_MONTH: number = TODAY.getMonth() + 1;
        this._apiVersion = 3 * (THIS_YEAR - 2022) + 53 + (THIS_MONTH <= 2 ? 0 : (THIS_MONTH <= 6 ? 1 : (THIS_MONTH <= 10 ? 2 : 3 )));

        // Setting some Ids
        this._userId = currentUserId;
        this._orgId = accessToken.split('!')[0];

        // Creates a connection to Salesforce using the access toekn from Visual Force page
        this._connection = new Connection({
            accessToken: accessToken,
            version: this._apiVersion + '.0',
            maxRequest: 10000
        });

        this._orgType = OrganizationType.NOT_SET;
    };

    public getApiVersion(): number {
        return this._apiVersion;        
    }

    public getOrganisationId(): string {
        return this._orgId;        
    }

    public async getOrganisationType(): Promise<OrganizationType> {
        if (this._orgType === OrganizationType.NOT_SET) {
            // Get the type of the org and potentially check if Org Check should be used
            await this._connection.query('SELECT Id, Name, IsSandbox, OrganizationType, TrialExpirationDate FROM Organization')
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
    }

    public getUserId(): string {
        return this._userId;        
    }

    public safeCaseId(id: string): string {
        if (id && id.length == 18) return id.substring(0, 15);
        return id;
    }

    public isVersionOld(version: number) {
        return ((this._apiVersion - version) / 3) >= 3;
    }

    public secureSOQLBindingVariable(unsafe: any | undefined) {
        // If unset, return directly an empty string
        if (!unsafe && unsafe !== false && unsafe !== 0) return "''";

        // If already an array of something, use that array, else create a new one with one element
        const unsafeArray = Array.isArray(unsafe) ? Array.from(unsafe) : [ unsafe ];
        unsafeArray.forEach((e, i, a) => {
            // If unset or not primary type, use an empty string
            if ((!e && e !== false && unsafe !== 0) || (e && typeof(e) == 'object')) { 
                a[i] = "''";
            } 
            // If not a string typed value, return value is itself (case of a numeric)
            else if (typeof(e) !== 'string') { 
                a[i] = e;
            } 
            // If a string value, we substitute the quotes
            else { 
                a[i] = "'" + e.replace(/'/g, "\'") + "'";
            }
        });
        return unsafeArray.join(',');
    }

    public dependencyApi(): void {
        
    }

    public query(): void {
        
    }

    public describeGlobal(): void {
        
    }

    public describe(): void {
        
    }

    public readMetadata(): void {
        
    }

    public readMetadataAtScale(): void {
        
    }

    public httpCall(): void {
        
    }
}