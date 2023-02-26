import chai from 'chai';
import { HTMLUtility, StringUtility } from '../../src/orgcheck/datatypes';

describe('Test the Datatypes module', function () {

    describe('Test the HTML utility', function () {
        describe('HTMLUtility.securise', function () {
            it('should return an empty string if the unsafe value is undefined', function () {
                chai.expect(HTMLUtility.securise(undefined)).to.be.equal('');
            });
            it('should return an empty string if the unsafe value is NaN', function () {
                chai.expect(HTMLUtility.securise(NaN)).to.be.equal('');
            });
            it('should return an empty string if the unsafe value is null', function () {
                chai.expect(HTMLUtility.securise(null)).to.be.equal('');
            });
            it('should return a string with &amp; if the unsafe value contains a &', function () {
                chai.expect(HTMLUtility.securise('this is & a test')).to.be.equal('this is &amp; a test');
            });
            it('should return a string with &amp; if the unsafe value contains multiple &', function () {
                chai.expect(HTMLUtility.securise('&this is & a & test&')).to.be.equal('&amp;this is &amp; a &amp; test&amp;');
            });
            it('should return a string with &lt; if the unsafe value contains a <', function () {
                chai.expect(HTMLUtility.securise('this is < a test')).to.be.equal('this is &lt; a test');
            });
            it('should return a string with &lt; if the unsafe value contains multiple <', function () {
                chai.expect(HTMLUtility.securise('<this is < a < test<')).to.be.equal('&lt;this is &lt; a &lt; test&lt;');
            });
            it('should return a string with &gt; if the unsafe value contains a >', function () {
                chai.expect(HTMLUtility.securise('this is > a test')).to.be.equal('this is &gt; a test');
            });
            it('should return a string with &gt; if the unsafe value contains multiple >', function () {
                chai.expect(HTMLUtility.securise('>this is > a > test>')).to.be.equal('&gt;this is &gt; a &gt; test&gt;');
            });
            it('should return a string with &quot; if the unsafe value contains a "', function () {
                chai.expect(HTMLUtility.securise('this is " a test')).to.be.equal('this is &quot; a test');
            });
            it('should return a string with &quot; if the unsafe value contains multiple "', function () {
                chai.expect(HTMLUtility.securise('"this is " a " test"')).to.be.equal('&quot;this is &quot; a &quot; test&quot;');
            });
            it('should return a string with &#039; if the unsafe value contains a \'', function () {
                chai.expect(HTMLUtility.securise('this is \' a test')).to.be.equal('this is &#039; a test');
            });
            it('should return a string with &#039; if the unsafe value contains multiple \'', function () {
                chai.expect(HTMLUtility.securise('\'this is \' a \' test\'')).to.be.equal('&#039;this is &#039; a &#039; test&#039;');
            });
            it('should return a string with all replacements if the unsafe value contains multiple special characters', function () {
                chai.expect(HTMLUtility.securise('"this is \' >a & test<')).to.be.equal('&quot;this is &#039; &gt;a &amp; test&lt;');
            });
        });
    });

    describe('Test the string utility', function () {
        describe('StringUtility.format', function () {
            it('should return a string with two substitution values (only once in the label)', function () {
                chai.expect(StringUtility.format('This {0} is a {1}', 'one', 'test')).to.be.equal('This one is a test');
            });
            it('should return a string with two substitution values (that are multiple times in the label)', function () {
                chai.expect(StringUtility.format('This {0} is a {1} -- This {0} is a {1} -- This {0} is a {1}', 'one', 'test')).to.be.equal('This one is a test -- This one is a test -- This one is a test');
            });
            it('should not throw an error if the list of params does not match the references in the label', function () {
                chai.expect(StringUtility.format('This {0} is a {1}', 'one', 'test', 'that')).to.be.equal('This one is a test');
            });
            it('should throw an error if the label reference a parameter out of the list', function () {
                chai.expect(() => { StringUtility.format('This {0} is a {5}', 'one', 'test'); }).to.throw('format: The label references an index (5) which exceeds the params list length (2)');
            });
            it('should not throw an error if one of the params is undefined but not to be used', function () {
                chai.expect(StringUtility.format('This {0} is a {1}', 'one', 'test', undefined)).to.be.equal('This one is a test');
            });
            it('should throw an error if one of the params is undefined and meant to be used at the same time', function () {
                chai.expect(() => { StringUtility.format('This {0} is a {1}', 'one', undefined); }).to.throw('format: The label references an index (1) which value is undefined in the params list');
            });
        });

        describe('StringUtility.percentage', function () {
            it('should return an empty string if the value is undefined', function () {
                chai.expect(StringUtility.percentage(undefined)).to.be.equal('');
            });
            it('should return a string with "0 %" (no decimal) if the value is numerical zero', function () {
                chai.expect(StringUtility.percentage(0)).to.be.equal('0 %');
            });
            it('should return an empty string if the value is not a string representation of a number', function () {
                chai.expect(StringUtility.percentage('NotADoctor')).to.be.equal('');
            });
            it('should return a string with "12.00 %" if the value is numerical 0.12', function () {
                chai.expect(StringUtility.percentage(0.12)).to.be.equal('12.00 %');
            });
            it('should return a string with "12.00 %" if the value is string "0.12"', function () {
                chai.expect(StringUtility.percentage('0.12')).to.be.equal('12.00 %');
            });
            it('should return a string with "12.99 %" if the value is numerical 0.12991', function () {
                chai.expect(StringUtility.percentage(0.12991)).to.be.equal('12.99 %');
            });
            it('should return a string with "12.99 %" if the value is string "0.12991"', function () {
                chai.expect(StringUtility.percentage('0.12991')).to.be.equal('12.99 %');
            });
            it('should return a string with "13.00 %" (rounded up) if the value is numerical 0.1299999', function () {
                chai.expect(StringUtility.percentage(0.1299999)).to.be.equal('13.00 %');
            });
            it('should return a string with "13.00 %" (rounded up) if the value is string "0.1299999"', function () {
                chai.expect(StringUtility.percentage('0.1299999')).to.be.equal('13.00 %');
            });
        });

        describe('StringUtility.shrink', function () {
            it('should return an empty string if the value is undefined', function () {
                chai.expect(StringUtility.shrink(undefined)).to.be.equal('');
            });
            it('should return the same string if the size is less than 150 (default)', function () {
                chai.expect(StringUtility.shrink('abcdef')).to.be.equal('abcdef');
            });
            it('should return a shrink string if the size is more than 150 (default) with leading three dots', function () {
                chai.expect(StringUtility.shrink(
                    '123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890THISWILLBESKPIED'
                )).to.be.equal(
                    '123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890...'
                );
            });
            it('should return "abc..." if value is "abcdef" and size is specified to 3', function () {
                chai.expect(StringUtility.shrink('abcdef', 3)).to.be.equal('abc...');
            });
            it('should return "abc==== if value is "abcdef", size is specified to 3, and appendStr is specified to "===="', function () {
                chai.expect(StringUtility.shrink('abcdef', 3, '====')).to.be.equal('abc====');
            });
        });
    });
});