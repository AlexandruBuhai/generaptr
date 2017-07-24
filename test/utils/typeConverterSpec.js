const typeConverter = require('../../src/commons/utils/typeConverter');
const assert = require('assert');

describe('it should convert types to standard', () => {
  it('should convert to string types', () => {
    assert.equal(typeConverter.convertSqlType('varchar'), 'string');
  });

  it('should convert to number type', () => {
    assert.equal(typeConverter.convertSqlType('decimal'), 'number');
  });

  it('should convert to date-only type', () => {
    assert.equal(typeConverter.convertSqlType('date'), 'date-only');
  });

  it('should convert to datetime type', () => {
    assert.equal(typeConverter.convertSqlType('datetime'), 'datetime');
  });

  it('should convert to time-only type', () => {
    assert.equal(typeConverter.convertSqlType('time'), 'time-only');
  });

  it('should throw an error if type not found', () => {
    try {
      typeConverter.convertSqlType('type-that-does-not-exist');
    } catch (e) {
      assert.equal(e.message, 'Type not found');
    }
  });

  it('should throw an error for no-sql types as those are not implemented yet', () => {
    try {
      typeConverter.convertNoSqlType('int');
    } catch (e) {
      assert.equal(e.message, 'Not yet implemented');
    }
  });

  it('should should convert raml enum types', () => {
      const converted = typeConverter.convertRamlTypes({type: 'Yes | No'});
      assert.equal(converted.type, 'enum');
      assert.equal(converted.values.length, 2);
  });

  it('should should convert raml array types', () => {
    const converted = typeConverter.convertRamlTypes({type: 'array', items: 'User'});
    assert.equal(converted.type, 'User');
    assert.equal(converted.isArray, true);
  });

  it('should should convert raml ordinary types', () => {
    const converted = typeConverter.convertRamlTypes({type: 'number'});
    assert.equal(converted.type, 'number');
    assert.equal(converted.isArray, false);
  });
});