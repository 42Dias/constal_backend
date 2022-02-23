import SequelizeRepository from '../../database/repositories/sequelizeRepository';
import AuditLogRepository from '../../database/repositories/auditLogRepository';
import lodash from 'lodash';
import SequelizeFilterUtils from '../../database/utils/sequelizeFilterUtils';
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

class ComentarioRepository {
  static async create(data, options: IRepositoryOptions) {
    const currentUser =
      SequelizeRepository.getCurrentUser(options);
    const tenant =
      SequelizeRepository.getCurrentTenant(options);

    const record = await options.database.comentarios.create({
      ...lodash.pick(data, [
        'comentario',
        'resposta',
        'produtoId',
        'fornecedorEmpresaId',
        'userId'
      ]),
      dataComentario: new Date(),
      compradorUserId: currentUser.id || null,
      tenantId: tenant.id,
      createdById: currentUser.id,
      updatedById: currentUser.id,
      fornecedorEmpresaId: data.fornecedorEmpresaId,
      userId: data.userId,
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
  //   const currentUser =
  //     SequelizeRepository.getCurrentUser(options);

  //   const currentTenant =
  //     SequelizeRepository.getCurrentTenant(options);

  //   let record = await options.database.comentarios.findOne({
  //     where: {
  //       id,
  //       tenantId: currentTenant.id,
  //     },
  //   });

  //   if (!record) {
  //     throw new Error404();
  //   }

  //   record = await record.update({
  //     status: data.status,
  //     updatedById: currentUser.id,
  //   });

  //   await this._createAuditLog(
  //     AuditLogRepository.UPDATE,
  //     record,
  //     data,
  //     options,
  //   );

  //   return this.findById(record.id, options);
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
    let rows = await seq.query(
      `
      UPDATE comentarios c
      SET c.isRespondido = '${data.isRespondido}',
      c.isDenunciado = '${data.isDenunciado}',
      c.comentario = '${data.comentario}',
      c.resposta = '${data.resposta}'
      WHERE c.id = '${id}';
      `
    );
    let rows2 = await seq.query(
      `SELECT 
      * from comentarios c
      WHERE
          c.id = '${id}'
      `
      ,
      {
        type: QueryTypes.SELECT,
      }
    );
    let count = rows2.length;
    console.log(rows)
    
    return { rows2, count };
  }

  static async destroy(id, options: IRepositoryOptions) {
    const currentTenant =
      SequelizeRepository.getCurrentTenant(options);

    let record = await options.database.comentarios.findOne({
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
        comentarios

        where id = '${id}';`;

    let record = await seq.query(query, {
      type: QueryTypes.SELECT,
    });

    if (!record) {
      throw new Error404();
    }

    return record;
  }
  
  static async findByProduto(id) {
    let query =
      `SELECT 
      c.*,
      u.fullName,
      u.firstName
      FROM
      comentarios c
       inner JOIN
    users u ON u.id = c.userId 
        where c.produtoId = '${id}'
        and c.isDenunciado not like 1;`;

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
      `
      SELECT 
    c.*, u.fullName, u.firstName, p.nome as 'nomeDoProduto'
    FROM
      comentarios c
          INNER JOIN
      users u ON u.id = c.userId
      INNER JOIN
    produtos p ON p.id = c.produtoId
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

    const records = await options.database.comentarios.findAll({
      attributes: ['id'],
      where,
    });

    return records.map((record) => record.id);
  }

  static async count(filter, options: IRepositoryOptions) {
    const tenant =
      SequelizeRepository.getCurrentTenant(options);

    return options.database.comentarios.count({
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
    //   await options.database.comentarios.findAndCountAll({
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
      c.*,
      e.nome,
      e.razaoSocial,
      e.cnpj
      from
        comentarios c
        left JOIN empresas e
        ON c.fornecedorEmpresaId = e.id;`
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
        produtoIds: data.produto,
      };
    }

    await AuditLogRepository.log(
      {
        entityName: 'comentarios',
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

    output.produto = await record.getProduto();

    return output;
  }

}

export default ComentarioRepository;
