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
      ]),
      dataComentario: new Date(),
      compradorUserId: currentUser.id || null,
      fornecedorEmpresaId: data.fornecedorEmpresa || null,
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
    return record
    // return this.findById(record.id, options);
  }

  static async update(
    id,
    data,
    options: IRepositoryOptions,
  ) {
    const currentUser =
      SequelizeRepository.getCurrentUser(options);

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

    record = await record.update({
      status: data.status,
      updatedById: currentUser.id,
    });

    await this._createAuditLog(
      AuditLogRepository.UPDATE,
      record,
      data,
      options,
    );

    return this.findById(record.id, options);
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
    //id = '08d42fa0-916f-4e59-89f6-c5f4d9e5f9e8'
    let queryComentario =
      `SELECT 
          p.id AS 'id',
          p.codigo AS 'codigo',
          p.quantidadeProdutos AS 'quantidadeProdutos',
          p.formaPagamento 'formaPagamento',
          p.valorTotal AS 'valorTotal',
          p.valorFrete AS 'valorFrete',
          p.dataPedido AS 'dataPedido',
          p.dataProcessamento AS 'dataProcessamento',
          p.dataEnvio AS 'dataEnvio',
          p.dataEntrega AS 'dataEntrega',
          p.dataFaturamento AS 'dataFaturamento',
          p.status AS 'status',
          p.compradorUserId AS 'compradorUserId',
          e.id AS 'empresa.id',
          e.razaoSocial AS 'empresa.razaoSocial',
          e.cnpj AS 'empresa.cnpj',
          pf.*
      FROM
          pedidos p
              LEFT JOIN
          empresas e ON p.fornecedorEmpresaId = e.id
              LEFT JOIN
          pessoaFisicas pf ON p.compradorUserId = pf.userId
      WHERE
          p.id = '${id}'`;

    let record = await seq.query(queryComentario, {
      nest: true,
      type: QueryTypes.SELECT,
    });

    if (record.length == 0) {
      throw new Error404();
    }

    record = record[0];

    record.produtos = new Array();

    let queryProdutos = `
    SELECT pp.id, pp.quantidade, pp.produtoId, pp.precoUnitario, pp.precoTotal, p.nome
     FROM pedidoProdutos pp
     
     LEFT JOIN produtos p
     ON pp.produtoId = p.id

     WHERE pp.pedidoId = '${id}';`;

    let produtos = await seq.query(queryProdutos, {
      type: QueryTypes.SELECT,
    });
    var total = 0.00
    produtos.forEach((e) => {
      console.log(e.precoTotal);
      total += parseFloat(e.precoTotal);
      console.log(total);
      record.produtos.push(e);
    });
    record.valorTotal = total.toFixed(2)
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
      * from
        comentarios
      LIMIT 0, 10;`
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
