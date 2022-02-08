import SequelizeRepository from './sequelizeRepository';
import AuditLogRepository from './auditLogRepository';
import lodash from 'lodash';
import SequelizeFilterUtils from '../utils/sequelizeFilterUtils';
import Error404 from '../../errors/Error404';
import Sequelize from 'sequelize';
import UserRepository from './userRepository';
import { IRepositoryOptions } from './IRepositoryOptions';
import { getConfig } from '../../config';
import highlight from 'cli-highlight';

const Op = Sequelize.Op;

let seq = new (<any>Sequelize)(
  getConfig().DATABASE_DATABASE,
  getConfig().DATABASE_USERNAME,
  getConfig().DATABASE_PASSWORD,
  {
    host: getConfig().DATABASE_HOST,
    dialect: getConfig().DATABASE_DIALECT,
    logging:
      getConfig().DATABASE_LOGGING === 'true'
        ? (log) =>
            console.log(
              highlight(log, {
                language: 'sql',
                ignoreIllegals: true,
              }),
            )
        : false,
  },
);

const { QueryTypes } = require('sequelize');

class informacoesRepository {
  static async create(data, options: IRepositoryOptions) {

    console.log("hgahahahahaha 3")
    
    const currentUser =
      SequelizeRepository.getCurrentUser(options);
    const tenant =
      SequelizeRepository.getCurrentTenant(options);

    const record = await options.database.informacoes.create({
      ...lodash.pick(data, [
        'telefone',
        'seguranca',
        'logradouro',
        'bairro',
        'cnpj',
        'cep',
        'sobre',
        'direitos',
        'cidade',
        'estado',
        'numero',
        'complemento',
      ]),
      tenantId: tenant.id,
      createdById: currentUser.id,
      updatedById: currentUser.id,
    });

    await this._createAuditLog(
      AuditLogRepository.CREATE,
      record,
      data,
      options,
    );
    console.log(record)
    return record
    // return this.findById(record.id, options);
  }

  static async update(
    id,
    data,
    options: IRepositoryOptions,
   ) {
    const currentUser = SequelizeRepository.getCurrentUser(
      options,
    );

    const transaction = SequelizeRepository.getTransaction(
      options,
    );


    const currentTenant = SequelizeRepository.getCurrentTenant(
      options,
    );

    let record = await options.database.informacoes.findOne(
      {
        where: {
          id
        },
        transaction,
      },
    );

    console.log(record)

    if (!record) {
      throw new Error404();
    }

    record = await record.update(
      {
        ...lodash.pick(data, [
          'telefone',
          'seguranca',
          'logradouro',
          'bairro',
          'cnpj',
          'cep',
          'sobre',
          'direitos',
          'cidade',
          'estado',
          'numero',
          'complemento',
        ]),
        updatedById: currentUser.id,
      },
      {
        transaction,
      },
    );


    // await this._createAuditLog(
    //   AuditLogRepository.UPDATE,
    //   record,
    //   data,
    //   options,
    // );

    return this.findById(record.id, options);
  }

  static async destroy(id, options: IRepositoryOptions) {
    const currentTenant =
      SequelizeRepository.getCurrentTenant(options);

    let record = await options.database.informacoes.findOne({
      where: {
        id,
        tenantId: currentTenant.id,
      },
    });

    if (!record) {
      throw new Error404();
    }

    await record.destroy();

    await this._createAuditLog(
      AuditLogRepository.DELETE,
      record,
      record,
      options,
    );
  }

  static async findById(id, options: IRepositoryOptions) {
    let query =
      `SELECT 
        *
        FROM
        informacoes
        where id = '${id}';`;

    let record = await seq.query(query, {
      type: QueryTypes.SELECT,
    });

    if (!record) {
      throw new Error404();
    }

    return record;
  }
  
  static async findByinformacoes(id) {
    let query =
      `SELECT 
      c.*,
      u.fullName,
      u.firstName
      FROM
      informacoes c
       inner JOIN
    users u ON u.id = c.userId 
        where c.informacoesId = '${id}';`;

    let record = await seq.query(query, {
      type: QueryTypes.SELECT,
    });

    if (!record) {
      throw new Error404();
    }

    return record;
    
  }

  static async findByEmpresa(id) {
    let query =
      `SELECT 
      c.*,
      u.fullName,
      u.firstName
      FROM
      informacoes c
       inner JOIN
    users u ON u.id = c.userId 
        where c.fornecedorEmpresaId = '${id}';`;

    let record = await seq.query(query, {
      type: QueryTypes.SELECT,
    });

    if (!record) {
      throw new Error404();
    }

    return record;
    
  }

  static async filterIdInTenant(
    id,
    options: IRepositoryOptions,
  ) {
    return lodash.get(
      await this.filterIdsInTenant([id], options),
      '[0]',
      null,
    );
  }

  static async filterIdsInTenant(
    ids,
    options: IRepositoryOptions,
  ) {
    if (!ids || !ids.length) {
      return [];
    }

    const currentTenant =
      SequelizeRepository.getCurrentTenant(options);

    const where = {
      id: {
        [Op.in]: ids,
      },
      tenantId: currentTenant.id,
    };

    const records = await options.database.informacoes.findAll({
      attributes: ['id'],
      where,
    });

    return records.map((record) => record.id);
  }

  static async count(filter, options: IRepositoryOptions) {
    const tenant =
      SequelizeRepository.getCurrentTenant(options);

    return options.database.informacoes.count({
      where: {
        ...filter,
        tenantId: tenant.id,
      },
    });
  }

  static async findAndCountAll(
    { filter, limit = 0, offset = 0, orderBy = '' },
    options: IRepositoryOptions,
   ) {
    // try{
    //   const tenant =
    //   SequelizeRepository.getCurrentTenant(options);

    // let whereAnd: Array<any> = [];
    // let include = [
    //   {
    //     model: options.database.user,
    //     as: 'compradorUser',
    //     include: {
    //       model: options.database.pessoaFisica,
    //       as: 'pessoaFisica',
    //     },
    //   },
    //   {
    //     model: options.database.empresa,
    //     as: 'fornecedorEmpresa',
    //   },
    // ];

    // whereAnd.push({
    //   tenantId: tenant.id,
    // });

    // if (filter) {
    //   if (filter.id) {
    //     whereAnd.push({
    //       ['id']: SequelizeFilterUtils.uuid(filter.id),
    //     });
    //   }


    //   if (filter.user) {
    //     whereAnd.push({
    //       ['userId']: SequelizeFilterUtils.uuid(
    //         filter.user,
    //       ),
    //     });
    //   }

    //   if (filter.fornecedorEmpresa) {
    //     whereAnd.push({
    //       ['fornecedorEmpresaId']:
    //         SequelizeFilterUtils.uuid(
    //           filter.fornecedorEmpresa,
    //         ),
    //     });
    //   }
    // }

    // const where = { [Op.and]: whereAnd };

    // let { rows, count } =
    //   await options.database.informacoes.findAndCountAll({
    //     where,
    //     include,
    //     limit: limit ? Number(limit) : undefined,
    //     offset: offset ? Number(offset) : undefined,
    //     order: orderBy
    //       ? [orderBy.split('_')]
    //       : [['createdAt', 'DESC']],
    //     transaction:
    //       SequelizeRepository.getTransaction(options),
    //   });
    // return { rows, count };
    // }
    // catch (e){
    //   console.log(e)
    // }
  
  let seq = new (<any>Sequelize)(
    getConfig().DATABASE_DATABASE,
    getConfig().DATABASE_USERNAME,
    getConfig().DATABASE_PASSWORD,
    {
      host: getConfig().DATABASE_HOST,
      dialect: getConfig().DATABASE_DIALECT,
      logging:
        getConfig().DATABASE_LOGGING === 'true'
          ? (log) =>
            console.log(
              highlight(log, {
                language: 'sql',
                ignoreIllegals: true,
              }),
            )
          : false,
      timezone: getConfig().DATABASE_TIMEZONE,
    },

  );

  let record = await seq.query(
    `SELECT 
      *
      from
        informacoes c`
    ,
    {
      nest: true,
      type: QueryTypes.SELECT,
    }
  );

  // console.log(record)
  return { record };
  }


  static async _createAuditLog(
    action,
    record,
    data,
    options: IRepositoryOptions,
  ) {
    let values = {};

    if (data) {
      values = {
        ...record.get({ plain: true }),
        informacoesIds: data.informacoes,
      };
    }

    await AuditLogRepository.log(
      {
        entityName: 'informacoes',
        entityId: record.id,
        action,
        values,
      },
      options,
    );
  }

  static async _fillWithRelationsAndFilesForRows(
    rows,
    options: IRepositoryOptions,
  ) {
    if (!rows) {
      return rows;
    }

    return Promise.all(
      rows.map((record) =>
        this._fillWithRelationsAndFiles(record, options),
      ),
    );
  }

  static async _fillWithRelationsAndFiles(
    record,
    options: IRepositoryOptions,
  ) {
    if (!record) {
      return record;
    }

    const output = record.get({ plain: true });

    output.compradorUser =
      UserRepository.cleanupForRelationships(
        output.compradorUser,
      );

    output.informacoes = await record.getinformacoes();

    return output;
  }

}

export default informacoesRepository;
