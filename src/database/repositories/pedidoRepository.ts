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

class PedidoRepository {
  static async create(data, options: IRepositoryOptions) {
    const currentUser =
      SequelizeRepository.getCurrentUser(options);

    const tenant =
      SequelizeRepository.getCurrentTenant(options);

    const record = await options.database.pedido.create({
      ...lodash.pick(data, [
        'codigo',
        'quantidadeProdutos',
        'formaPagamento',
        'valorTotal',
        /* 'dataProcessamento',
          'dataEnvio',
          'dataEntrega',
          'dataFaturamento', */
        'valorFrete',
        'importHash',
      ]),
      dataPedido: new Date(),
      status: 'pendente',

      compradorUserId: currentUser.id || null,
      fornecedorEmpresaId: data.fornecedorEmpresa || null,
      tenantId: tenant.id || 'c4a740fc-2e98-48b6-a837-6aa0feccfcfb',
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

    let record = await options.database.pedido.findOne({
      where: {
        id,
        tenantId: currentTenant.id || 'c4a740fc-2e98-48b6-a837-6aa0feccfcfb',
      },
    });

    if (!record) {
      throw new Error404();
    }

    record = await record.update({
      dataProcessamento:
        record.dataProcessamento == null
          ? data.dataProcessamento
          : record.dataProcessamento,
      dataEnvio:
        record.dataEnvio == null
          ? data.dataEnvio
          : record.dataEnvio,
      dataEntrega:
        record.dataEntrega == null
          ? data.dataEntrega
          : record.dataEntrega,
      dataFaturamento:
        record.dataFaturamento == null
          ? data.dataFaturamento
          : record.dataFaturamento,
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

    let record = await options.database.pedido.findOne({
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
    let queryPedido =
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

    let record = await seq.query(queryPedido, {
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

    WHERE pp.pedidoId = '${id}'; `;

    let produtos = await seq.query(queryProdutos, {
      type: QueryTypes.SELECT,
    });
    record.produtos = produtos

    var total = 0.00
    produtos.forEach((e) => {
      total += parseFloat(e.precoTotal);
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

    const records = await options.database.pedido.findAll({
      attributes: ['id'],
      where,
    });

    return records.map((record) => record.id);
  }

  static async count(filter, options: IRepositoryOptions) {
    const tenant =
      SequelizeRepository.getCurrentTenant(options);

    return options.database.pedido.count({
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
    const tenant =
      SequelizeRepository.getCurrentTenant(options);

    let whereAnd: Array<any> = [];
    let include = [
      {
        model: options.database.user,
        as: 'compradorUser',
        include: {
          model: options.database.pessoaFisica,
          as: 'pessoaFisica',
        },
      },
      {
        model: options.database.empresa,
        as: 'fornecedorEmpresa',
      },
    ];

    whereAnd.push({
      tenantId: tenant.id,
    });

    if (filter) {
      if (filter.id) {
        whereAnd.push({
          ['id']: SequelizeFilterUtils.uuid(filter.id),
        });
      }

      if (filter.codigo) {
        whereAnd.push(
          SequelizeFilterUtils.ilikeIncludes(
            'pedido',
            'codigo',
            filter.codigo,
          ),
        );
      }

      if (filter.quantidadeProdutosRange) {
        const [start, end] = filter.quantidadeProdutosRange;

        if (
          start !== undefined &&
          start !== null &&
          start !== ''
        ) {
          whereAnd.push({
            quantidadeProdutos: {
              [Op.gte]: start,
            },
          });
        }

        if (
          end !== undefined &&
          end !== null &&
          end !== ''
        ) {
          whereAnd.push({
            quantidadeProdutos: {
              [Op.lte]: end,
            },
          });
        }
      }

      if (filter.formaPagamento) {
        whereAnd.push(
          SequelizeFilterUtils.ilikeIncludes(
            'pedido',
            'formaPagamento',
            filter.formaPagamento,
          ),
        );
      }

      if (filter.valorTotalRange) {
        const [start, end] = filter.valorTotalRange;

        if (
          start !== undefined &&
          start !== null &&
          start !== ''
        ) {
          whereAnd.push({
            valorTotal: {
              [Op.gte]: start,
            },
          });
        }

        if (
          end !== undefined &&
          end !== null &&
          end !== ''
        ) {
          whereAnd.push({
            valorTotal: {
              [Op.lte]: end,
            },
          });
        }
      }

      if (filter.dataPedidoRange) {
        const [start, end] = filter.dataPedidoRange;

        if (
          start !== undefined &&
          start !== null &&
          start !== ''
        ) {
          whereAnd.push({
            dataPedido: {
              [Op.gte]: start,
            },
          });
        }

        if (
          end !== undefined &&
          end !== null &&
          end !== ''
        ) {
          whereAnd.push({
            dataPedido: {
              [Op.lte]: end,
            },
          });
        }
      }

      if (filter.dataProcessamentoRange) {
        const [start, end] = filter.dataProcessamentoRange;

        if (
          start !== undefined &&
          start !== null &&
          start !== ''
        ) {
          whereAnd.push({
            dataProcessamento: {
              [Op.gte]: start,
            },
          });
        }

        if (
          end !== undefined &&
          end !== null &&
          end !== ''
        ) {
          whereAnd.push({
            dataProcessamento: {
              [Op.lte]: end,
            },
          });
        }
      }

      if (filter.dataEnvioRange) {
        const [start, end] = filter.dataEnvioRange;

        if (
          start !== undefined &&
          start !== null &&
          start !== ''
        ) {
          whereAnd.push({
            dataEnvio: {
              [Op.gte]: start,
            },
          });
        }

        if (
          end !== undefined &&
          end !== null &&
          end !== ''
        ) {
          whereAnd.push({
            dataEnvio: {
              [Op.lte]: end,
            },
          });
        }
      }

      if (filter.dataEntregaRange) {
        const [start, end] = filter.dataEntregaRange;

        if (
          start !== undefined &&
          start !== null &&
          start !== ''
        ) {
          whereAnd.push({
            dataEntrega: {
              [Op.gte]: start,
            },
          });
        }

        if (
          end !== undefined &&
          end !== null &&
          end !== ''
        ) {
          whereAnd.push({
            dataEntrega: {
              [Op.lte]: end,
            },
          });
        }
      }

      if (filter.dataFaturamentoRange) {
        const [start, end] = filter.dataFaturamentoRange;

        if (
          start !== undefined &&
          start !== null &&
          start !== ''
        ) {
          whereAnd.push({
            dataFaturamento: {
              [Op.gte]: start,
            },
          });
        }

        if (
          end !== undefined &&
          end !== null &&
          end !== ''
        ) {
          whereAnd.push({
            dataFaturamento: {
              [Op.lte]: end,
            },
          });
        }
      }

      if (filter.status) {
        switch (filter.status) {
          case 'pendente':
            whereAnd.push({
              status: {
                [Op.in]: [
                  'pendente',
                  'pago',
                  'enviado',
                  'recebido',
                  'transito',
                ],
              },
            });
            break;

          case 'devolvido':
            whereAnd.push({
              status: 'cancelado',
            });
            break;

          case 'confirmado':
            whereAnd.push({
              status: 'entregue',
            });
            break;
        }
      }

      if (filter.valorFreteRange) {
        const [start, end] = filter.valorFreteRange;

        if (
          start !== undefined &&
          start !== null &&
          start !== ''
        ) {
          whereAnd.push({
            valorFrete: {
              [Op.gte]: start,
            },
          });
        }

        if (
          end !== undefined &&
          end !== null &&
          end !== ''
        ) {
          whereAnd.push({
            valorFrete: {
              [Op.lte]: end,
            },
          });
        }
      }

      if (filter.compradorUser) {
        whereAnd.push({
          ['compradorUserId']: SequelizeFilterUtils.uuid(
            filter.compradorUser,
          ),
        });
      }

      if (filter.fornecedorEmpresa) {
        whereAnd.push({
          ['fornecedorEmpresaId']:
            SequelizeFilterUtils.uuid(
              filter.fornecedorEmpresa,
            ),
        });
      }

      if (filter.createdAtRange) {
        const [start, end] = filter.createdAtRange;

        if (
          start !== undefined &&
          start !== null &&
          start !== ''
        ) {
          whereAnd.push({
            ['createdAt']: {
              [Op.gte]: start,
            },
          });
        }

        if (
          end !== undefined &&
          end !== null &&
          end !== ''
        ) {
          whereAnd.push({
            ['createdAt']: {
              [Op.lte]: end,
            },
          });
        }
      }
    }

    const where = { [Op.and]: whereAnd };

    let { rows, count } =
      await options.database.pedido.findAndCountAll({
        where,
        include,
        limit: limit ? Number(limit) : undefined,
        offset: offset ? Number(offset) : undefined,
        order: orderBy
          ? [orderBy.split('_')]
          : [['createdAt', 'DESC']],
        transaction:
          SequelizeRepository.getTransaction(options),
      });

    /* rows = await this._fillWithRelationsAndFilesForRows(
      rows,
      options,
    ); */

    return { rows, count };
  }

  static async findAllAutocomplete(
    query,
    limit,
    options: IRepositoryOptions,
  ) {
    const tenant =
      SequelizeRepository.getCurrentTenant(options);

    let whereAnd: Array<any> = [
      {
        tenantId: tenant.id,
      },
    ];

    if (query) {
      whereAnd.push({
        [Op.or]: [
          { ['id']: SequelizeFilterUtils.uuid(query) },
          {
            [Op.and]: SequelizeFilterUtils.ilikeIncludes(
              'pedido',
              'codigo',
              query,
            ),
          },
        ],
      });
    }

    const where = { [Op.and]: whereAnd };

    const records = await options.database.pedido.findAll({
      attributes: ['id', 'codigo'],
      where,
      limit: limit ? Number(limit) : undefined,
      order: [['codigo', 'ASC']],
    });

    return records.map((record) => ({
      id: record.id,
      label: record.codigo,
    }));
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
        entityName: 'pedido',
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

  static async findProximoCodigo() {
    let query =
      'SELECT IFNULL(MAX(codigo), 0) as `codigo`' +
      ` FROM pedidos;`;

    let record = await seq.query(query, {
      type: QueryTypes.SELECT,
    });

    record = Number(record[0].codigo) + 1;

    return record;
  }
  static async findPedidoWithProduct(
    options: IRepositoryOptions
    ) {
      
    const currentUser = SequelizeRepository.getCurrentUser(options);
    let query =
    `select 
      p.* ,
      ped.status,
      pp.precoTotal
      from pedidoProdutos pp
        inner join produtos p  on pp.produtoId = p.id
          inner join pedidos ped on pp.pedidoId = ped.id
          where pp.compradorUserId = '${currentUser.id}'`;
    
    let record = await seq.query(query, {
      type: QueryTypes.SELECT,
    });





    if (!record) {
      throw new Error404();
    }

    return record;
  }

  static async findPedidoWithProductToEmpresa(
    empresaId, { filter, limit = 0, offset = 0, orderBy = '' }
    ) {

    let where = '';
    if(filter){
      if(filter.pedidoId){
        where = `and ped.id = '${filter.pedidoId}' `
      }
      else if(filter.produtoId){
        where = `and p.id = '${filter.produtoId}' `
      } 
      else{
        where = `where ped.fornecedorEmpresaId = '${empresaId}'`
      }
    }
    else{
      where = `where ped.fornecedorEmpresaId = '${empresaId}'`
    }

    let query =
        `SELECT 
        p.nome,
        p.preco,
        p.imagemUrl,
        ped.status,
        ped.id AS pedidoId,
        pp.precoTotal ,
        pp.quantidade as quantidadeProdutos ,
        ped.compradorUserId,
        pp.id AS pedidoProdutoId,
        pp.pedidoId AS id,
        pf.nome AS fullname,
        pf.nome,
        pf.cpf,
        pf.celular,
        pf.cep,
        pf.logradouro,
        pf.numero,
        pf.bairro,
        pf.cidade,
        pf.estado,
        ped.createdAt as dataPedido
          FROM
              pedidoProdutos pp
                  INNER JOIN
              produtos p ON pp.produtoId = p.id
                  INNER JOIN
              pedidos ped ON pp.pedidoId = ped.id
                  INNER JOIN
              pessoaFisicas pf ON pp.compradorUserId = pf.userId
        ${where}
          order by ped.createdAt;`;
    
    let record = await seq.query(query, {
      type: QueryTypes.SELECT,
    });

    if (!record) {
      throw new Error404();
    }

    console.log("record")
    console.log(record)

    return record;
  }
  static async listFaturas({ filter, limit = 0, offset = 0, orderBy = '' }
  ) {
  console.log("+++++++++++++++++++++++++++++++++++")
  console.log("filter")
  console.log(filter)
  console.log("+++++++++++++++++++++++++++++++++++")

  let where = '';
  if(filter){
    if(filter.empresaId){
      where = `and p.fornecedorEmpresaId = '${filter.empresaId}' `
      // where = `and p.fornecedorEmpresaId = '${filter.id} `
    }
    else{
      where = ``
    }
  }
  const query = `
  select
  pg.*,
  pp.quantidade,
    pp.precoUnitario,
  pp.precoTotal,
  p.id as pedidoId,
    pp.produtoId,
    p.fornecedorEmpresaId
    
  from pagamentos pg
  inner join pedidos p
  inner join pedidoProdutos pp 
    where 
    pg.pedidoId = p.id 
    and pp.pedidoId = p.id 
    and pg.urlFaturaIugu is not null
        -- Fazer um req.id e passar o id da empresa e fazer o esquema do where
          ${where};`

  
  let record = await seq.query(query, {
    type: QueryTypes.SELECT,
  });
  if (!record) {
    throw new Error404();
  }

  return record
  }
  
}

export default PedidoRepository;
