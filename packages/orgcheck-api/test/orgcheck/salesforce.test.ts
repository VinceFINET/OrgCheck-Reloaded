import chai from 'chai';
import sinon, { SinonMatcher, SinonStub } from 'sinon';
import jsforce from 'jsforce';
import { OrganizationType, Salesforce } from '../../src/orgcheck/salesforce';

class MockSOQL {

  private MOCK = sinon.stub(jsforce.Connection.prototype, 'request');
  private matchers: Map<string, SinonMatcher>;
  private results: Map<string, Array<any>>;

  constructor() {
    this.matchers = new Map<string, SinonMatcher>();
    this.results = new Map<string, Array<any>>();
  }

  public setSOQL(name: string, query: string): void {
    this.matchers.set(name, sinon.match(((value: any) => value?.url?.endsWith(encodeURIComponent(query)))));
  }

  public setResult(name: string, record: any): void {
    this.setResults(name, [ record ]);
  }

  public setResults(name: string, records: Array<any>): void {
    this.results.set(name, records);
    this.__getStub(name).returns(
      new Promise((s,e) => {
        const a = this.results.get(name);
       // console.error(this.__getStub(name).)
        s({ done: true, totalSize: a?.length, records: a });
      })
    );
  }

  private __getStub(name: string): SinonStub {
    if (this.matchers.has(name)) {
      const matcher = this.matchers.get(name);
      if (matcher) return this.MOCK.withArgs(matcher);
    }
    return this.MOCK;
  }
}


describe('Test the Salesforce module', function () {

  // Some common values across all tests
  const USER_ID = '005000000000006789';
  const ORG_ID = '00D000000000006789';
  const ACCESS_TOKEN = ORG_ID+'!ABVCDEFGHUUYTUTEVJHHJSHGSJHGJGXXXXXXX';

  // Setup the salesforce MOCK
  const salesforceMOCK = new MockSOQL();
  salesforceMOCK.setSOQL('org', 'SELECT Id, Name, IsSandbox, OrganizationType, TrialExpirationDate FROM Organization');

  describe('getUserId', function () {
    const orgcheck_salesforce: Salesforce = new Salesforce(USER_ID, ACCESS_TOKEN);
    it('should return the current user id', function () {
      const userId = orgcheck_salesforce.getUserId();
      chai.expect(userId).to.be.equal(USER_ID);
    });
  });

  describe('getApiVersion', function () {
    const orgcheck_salesforce: Salesforce = new Salesforce(USER_ID, ACCESS_TOKEN);
    it('should return a number as api version', function () {
      const api = orgcheck_salesforce.getApiVersion();
      chai.expect(api).to.be.an('number');
    });
  });

  describe('isVersionOld', function () {
    const orgcheck_salesforce: Salesforce = new Salesforce(USER_ID, ACCESS_TOKEN);
    const currentVersion = orgcheck_salesforce.getApiVersion();
    it('should return that an API is young before it gets 9 releases away', function () {
      for (let i=-3; i<9; i++) {
        chai.expect(orgcheck_salesforce.isVersionOld(currentVersion - i)).to.be.equal(false);
      }
    });
    it('should return that an API is old after it gets 9 releases away', function () {
      for (let i=9; i<12; i++) {
        chai.expect(orgcheck_salesforce.isVersionOld(currentVersion - i)).to.be.equal(true);
      }
    });
  });

  describe('getOrganisationId', function () {
    const orgcheck_salesforce: Salesforce = new Salesforce(USER_ID, ACCESS_TOKEN);
    it('should return the organization id', function () {
      const orgId = orgcheck_salesforce.getOrganisationId();
      chai.expect(orgId).to.be.equal(ORG_ID);
    });
  });

  describe('getOrganisationType', function () {
    it('should return that organization is a DE', async function () {
      const orgcheck_salesforce: Salesforce = new Salesforce(USER_ID, ACCESS_TOKEN);
      salesforceMOCK.setResult('org', { IsSandbox: false, OrganizationType: 'Developer Edition' });
      const orgType = await orgcheck_salesforce.getOrganisationType();
      chai.expect(orgType).to.be.equal(OrganizationType.DeveperEdition);
      chai.expect(orgType).to.be.not.equal(OrganizationType.Sandbox);
      chai.expect(orgType).to.be.not.equal(OrganizationType.TrialOrDemo);
      chai.expect(orgType).to.be.not.equal('Production');
    });
    it('should return that organization is a sandbox', async function () {
      const orgcheck_salesforce: Salesforce = new Salesforce(USER_ID, ACCESS_TOKEN);
      salesforceMOCK.setResult('org', { IsSandbox: true });
      const orgType = await orgcheck_salesforce.getOrganisationType();
      chai.expect(orgType).to.be.equal(OrganizationType.Sandbox);
      chai.expect(orgType).to.be.not.equal(OrganizationType.DeveperEdition);
      chai.expect(orgType).to.be.not.equal(OrganizationType.TrialOrDemo);
      chai.expect(orgType).to.be.not.equal(OrganizationType.Production);
    });
    it('should return that organization is a Trial or a Demo', async function () {
      const orgcheck_salesforce: Salesforce = new Salesforce(USER_ID, ACCESS_TOKEN);
      salesforceMOCK.setResult('org', { IsSandbox: false, TrialExpirationDate: new Date() });
      const orgType = await orgcheck_salesforce.getOrganisationType();
      chai.expect(orgType).to.be.equal(OrganizationType.TrialOrDemo);
      chai.expect(orgType).to.be.not.equal(OrganizationType.DeveperEdition);
      chai.expect(orgType).to.be.not.equal(OrganizationType.Sandbox);
      chai.expect(orgType).to.be.not.equal(OrganizationType.Production);
    });
    it('should return that organization is a Production', async function () {
      const orgcheck_salesforce: Salesforce = new Salesforce(USER_ID, ACCESS_TOKEN);
      salesforceMOCK.setResult('org', { IsSandbox: false, OrganizationType: 'WHATEVER', TrialExpirationDate: undefined });
      const orgType = await orgcheck_salesforce.getOrganisationType();
      chai.expect(orgType).to.be.equal(OrganizationType.Production);
      chai.expect(orgType).to.be.not.equal(OrganizationType.TrialOrDemo);
      chai.expect(orgType).to.be.not.equal(OrganizationType.DeveperEdition);
      chai.expect(orgType).to.be.not.equal(OrganizationType.Sandbox);
    });
  });

  describe('safeCaseId', function () {
    it('should return a safe case 15-long Salesforce id', function () {
      const orgcheck_salesforce: Salesforce = new Salesforce(USER_ID, ACCESS_TOKEN);
      chai.expect(orgcheck_salesforce.safeCaseId(USER_ID)).to.be.lengthOf(15);
    });
  });

  describe('secureSOQLBindingVariable', function() {
    const orgcheck_salesforce: Salesforce = new Salesforce(USER_ID, ACCESS_TOKEN);
    it('should return an empty string surrounded by quotes if the given value is undefined', function () {
      chai.expect(orgcheck_salesforce.secureSOQLBindingVariable(undefined)).to.be.equal("''");
    });
    it('should return a list of strings surrounded by quotes, comma separeted, without space in between if the given value is an array of safe strings', function () {
      chai.expect(orgcheck_salesforce.secureSOQLBindingVariable([ 'test', 'test2' ])).to.be.equal("'test','test2'");
    });
    it('should return the exact same string surrounded by quotes if the given value is a safe string', function () {
      chai.expect(orgcheck_salesforce.secureSOQLBindingVariable('test')).to.be.equal("'test'");
    });
    it('should return a list of empty strings surrounded by quotes if the given value is an array of objects', function () {
      chai.expect(orgcheck_salesforce.secureSOQLBindingVariable([ { a: 'b' }, { a: 'c' } ])).to.be.equal("'',''");
    });
    it('should return an empty string surrounded by quotes if the given value is an object', function () {
      chai.expect(orgcheck_salesforce.secureSOQLBindingVariable({ a: 'b' })).to.be.equal("''");
    });
    it('should return an empty string if the given value is an array of booleans', function () {
      chai.expect(orgcheck_salesforce.secureSOQLBindingVariable([ true, false, true ])).to.be.equal("true,false,true");
    });
    it('should return an empty string if the given value is a boolean set to true', function () {
      chai.expect(orgcheck_salesforce.secureSOQLBindingVariable(true)).to.be.equal("true");
    });
    it('should return an empty string if the given value is a boolean set to false', function () {
      chai.expect(orgcheck_salesforce.secureSOQLBindingVariable(false)).to.be.equal("false");
    });
    it('should return a zero string if the given value is a number set to zero', function () {
      chai.expect(orgcheck_salesforce.secureSOQLBindingVariable(0)).to.be.equal("0");
    });
    it('should return the number as a string without separator if the given value is a number set to 1290', function () {
      chai.expect(orgcheck_salesforce.secureSOQLBindingVariable(1290)).to.be.equal("1290");
    });
    it('should return the float as a string without separator, omitting leading zeros after comma, if the given value is a number set to 12.90', function () {
      chai.expect(orgcheck_salesforce.secureSOQLBindingVariable(12.90)).to.be.equal("12.9");
    });
    it('should return a string with escaping original quotes, surrounded by quotes, if the given value is unsafe', function () {
      chai.expect(orgcheck_salesforce.secureSOQLBindingVariable('This is \'a test')).to.be.equal("'This is \'a test'");
    });
    it('should return a string with escaping original quotes, surrounded by quotes, if the given value is really unsafe', function () {
      chai.expect(orgcheck_salesforce.secureSOQLBindingVariable("This' AND true=true")).to.be.equal("'This\' AND true=true'");
    });
  });

});