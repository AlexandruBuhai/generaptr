import utils from '../../../commons/utils/utils';
import schemaUtils from '../../../commons/utils/schemaUtil';
import { Schema, Table, Column } from '../../../commons/types';

/**
 * Class which implements the logic for generating valid sequelize repositories.
 *
 * @export
 * @class SequelizeRepositoryGenerator
 */
export default class SequelizeRepositoryGenerator {

  /**
   * Generate repositories for a given schema.
   *
   * @param {Schema} schema - api schema
   * @return {{name: string, content: string}[]}
   */
  public getRepositories(schema: Schema): {name: string; content: string}[] {
    const repositories: {name: string; content: string}[] = [];
    schema.forEach((table: Table) => {
      repositories.push({
        name: `${utils.toTitleCase(table.name)}Repository.js`,
        content: this.getRepositoryForTable(table),
      });
    });

    return repositories;
  }
  /**
   * Generate repository for a given table.
   *
   * @param {Table} table - schema for table
   * @return {{name: string, content: string}}
   */
  public getRepositoryForTable(table: Table): string {
    const related: {names: string[]; includes: string[]} = this.getRelatedEntites(table);
    const entity: string = utils.toTitleCase(table.name);

    return `const ${entity} = require('../models').${entity.toLowerCase()};
${related.names.map((name: string) => `const ${name} = require('../models').${name.toLowerCase()};`).join('\n')}

class ${entity}Repository {
  get(id) {
    return ${entity}.findOne({where: {id}, include: [${related.includes.join(', ')}]});
  }

  getAll(offset, limit) {
    return ${entity}.findAll({limit, offset, include: [${related.includes.join(', ')}]});
  }

  save(data) {
    return ${entity}.create(data).then((created) => {
      return created.id;
    });
  }

  update(id, data) {
    return ${entity}.findOne({where: {id}}).then(
      (${entity}) => {
        return ${entity}.update(data, {where: {id}});
      }
    )
  }

  delete(id) {
    return ${entity}.destroy({where: {id}});
  }

  exists(id) {
    return ${entity}.count({where: {id}}).then((count) => Boolean(count));
  }

  count() {
    return ${entity}.count();
  }
}

module.exports = new ${entity}Repository();
`;
  }

  /**
   * Generate repositories factory.
   *
   * @param {Schema} schema - api schema
   * @return {{name: string, content: string}}
   */
  public getRepositoryFactory(schema: Schema): {name: string; content: string} {
    const models: string[] = schema.map((table: Table) => utils.toTitleCase(table.name));

    return {
      name: 'repositoryFactory.js',
      content: `${models.map((name: string) => `const ${name.toLowerCase()}Repository = require('./${name}Repository');`).join('\n')}

class RepositoryFactory {
  getRepositoryForModel(model) {
    switch(model) {
${models.map((name: string) => `      case '${name}':
        return ${name.toLowerCase()}Repository;`).join('\n')}
      default:
        throw new Error('Repository not implemented for this model');
    }
  }
}

module.exports = new RepositoryFactory();

`,
    };
  }

  protected getRelatedEntites(table: Table): {names: string[]; includes: string[]} {
    const relations: Column[] = schemaUtils.getRelatedTablesForTable(table);

    return {
      names: relations.map((column: Column) => utils.toTitleCase(column.dataType.type)).filter((item: string, index: number, array: string[]) => index === array.indexOf(item)),
      includes: relations.map((column: Column) => `{model: ${utils.toTitleCase(column.dataType.type)}, as: '${column.name}'}`).filter((item: string, index: number, array: string[]) => index === array.indexOf(item)),
    };
  }
}
