import SequelizeRepository from '../../database/repositories/sequelizeRepository';
import AuditLogRepository from '../../database/repositories/auditLogRepository';
import lodash from 'lodash';
import SequelizeFilterUtils from '../../database/utils/sequelizeFilterUtils';
import Error404 from '../../errors/Error404';
import Sequelize from 'sequelize';import UserRepository from './userRepository';
import { IRepositoryOptions } from './IRepositoryOptions';

const Op = Sequelize.Op;

class PedidoRepository {

  static async create(data, options: IRepositoryOptions) {
    const currentUser = SequelizeRepository.getCurrentUser(
      options,
    );

    const tenant = SequelizeRepository.getCurrentTenant(
      options,
    );

    const transaction = SequelizeRepository.getTransaction(
      options,
    );

    const record = await options.database.pedido.create(
      {
        ...lodash.pick(data, [
          'codigo',
          'quantidadeProdutos',
          'formaPagamento',
          'valorTotal',
          'dataPedido',
          'dataProcessamento',
          'dataEnvio',
          'dataEntrega',
          'dataFaturamento',
          'status',
          'valorFrete',          
          'importHash',
        ]),
        compradorUserId: data.compradorUser || null,
        fornecedorEmpresaId: data.fornecedorEmpresa || null,
        tenantId: tenant.id,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      },
      {
        transaction,
      },
    );

    await record.setProduto(data.produto || [], {
      transaction,
    });    
  

  
    await this._createAuditLog(
      AuditLogRepository.CREATE,
      record,
      data,
      options,
    );

    return this.findById(record.id, options);
  }

  static async update(id, data, options: IRepositoryOptions) {
    const currentUser = SequelizeRepository.getCurrentUser(
      options,
    );

    const transaction = SequelizeRepository.getTransaction(
      options,
    );


    const currentTenant = SequelizeRepository.getCurrentTenant(
      options,
    );

    let record = await options.database.pedido.findOne(      
      {
        where: {
          id,
          tenantId: currentTenant.id,
        },
        transaction,
      },
    );

    if (!record) {
      throw new Error404();
    }

    record = await record.update(
      {
        ...lodash.pick(data, [
          'codigo',
          'quantidadeProdutos',
          'formaPagamento',
          'valorTotal',
          'dataPedido',
          'dataProcessamento',
          'dataEnvio',
          'dataEntrega',
          'dataFaturamento',
          'status',
          'valorFrete',          
          'importHash',
        ]),
        compradorUserId: data.compradorUser || null,
        fornecedorEmpresaId: data.fornecedorEmpresa || null,
        updatedById: currentUser.id,
      },
      {
        transaction,
      },
    );

    await record.setProduto(data.produto || [], {
      transaction,
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
    const transaction = SequelizeRepository.getTransaction(
      options,
    );

    const currentTenant = SequelizeRepository.getCurrentTenant(
      options,
    );

    let record = await options.database.pedido.findOne(
      {
        where: {
          id,
          tenantId: currentTenant.id,
        },
        transaction,
      },
    );

    if (!record) {
      throw new Error404();
    }

    await record.destroy({
      transaction,
    });

    await this._createAuditLog(
      AuditLogRepository.DELETE,
      record,
      record,
      options,
    );
  }

  static async findById(id, options: IRepositoryOptions) {
    const transaction = SequelizeRepository.getTransaction(
      options,
    );

    const include = [
      {
        model: options.database.user,
        as: 'compradorUser',
      },
      {
        model: options.database.empresa,
        as: 'fornecedorEmpresa',
      },
    ];

    const currentTenant = SequelizeRepository.getCurrentTenant(
      options,
    );

    const record = await options.database.pedido.findOne(
      {
        where: {
          id,
          tenantId: currentTenant.id,
        },
        include,
        transaction,
      },
    );

    if (!record) {
      throw new Error404();
    }

    return this._fillWithRelationsAndFiles(record, options);
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

    const records = await options.database.pedido.findAll(
      {
        attributes: ['id'],
        where,
      },
    );

    return records.map((record) => record.id);
  }

  static async count(filter, options: IRepositoryOptions) {
    const transaction = SequelizeRepository.getTransaction(
      options,
    );

    const tenant = SequelizeRepository.getCurrentTenant(
      options,
    );

    return options.database.pedido.count(
      {
        where: {
          ...filter,
          tenantId: tenant.id,
        },
        transaction,
      },
    );
  }

  static async findAndCountAll(
    { filter, limit = 0, offset = 0, orderBy = '' },
    options: IRepositoryOptions,
  ) {
    const tenant = SequelizeRepository.getCurrentTenant(
      options,
    );

    let whereAnd: Array<any> = [];
    let include = [
      {
        model: options.database.user,
        as: 'compradorUser',
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

        if (start !== undefined && start !== null && start !== '') {
          whereAnd.push({
            quantidadeProdutos: {
              [Op.gte]: start,
            },
          });
        }

        if (end !== undefined && end !== null && end !== '') {
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

        if (start !== undefined && start !== null && start !== '') {
          whereAnd.push({
            valorTotal: {
              [Op.gte]: start,
            },
          });
        }

        if (end !== undefined && end !== null && end !== '') {
          whereAnd.push({
            valorTotal: {
              [Op.lte]: end,
            },
          });
        }
      }

      if (filter.dataPedidoRange) {
        const [start, end] = filter.dataPedidoRange;

        if (start !== undefined && start !== null && start !== '') {
          whereAnd.push({
            dataPedido: {
              [Op.gte]: start,
            },
          });
        }

        if (end !== undefined && end !== null && end !== '') {
          whereAnd.push({
            dataPedido: {
              [Op.lte]: end,
            },
          });
        }
      }

      if (filter.dataProcessamentoRange) {
        const [start, end] = filter.dataProcessamentoRange;

        if (start !== undefined && start !== null && start !== '') {
          whereAnd.push({
            dataProcessamento: {
              [Op.gte]: start,
            },
          });
        }

        if (end !== undefined && end !== null && end !== '') {
          whereAnd.push({
            dataProcessamento: {
              [Op.lte]: end,
            },
          });
        }
      }

      if (filter.dataEnvioRange) {
        const [start, end] = filter.dataEnvioRange;

        if (start !== undefined && start !== null && start !== '') {
          whereAnd.push({
            dataEnvio: {
              [Op.gte]: start,
            },
          });
        }

        if (end !== undefined && end !== null && end !== '') {
          whereAnd.push({
            dataEnvio: {
              [Op.lte]: end,
            },
          });
        }
      }

      if (filter.dataEntregaRange) {
        const [start, end] = filter.dataEntregaRange;

        if (start !== undefined && start !== null && start !== '') {
          whereAnd.push({
            dataEntrega: {
              [Op.gte]: start,
            },
          });
        }

        if (end !== undefined && end !== null && end !== '') {
          whereAnd.push({
            dataEntrega: {
              [Op.lte]: end,
            },
          });
        }
      }

      if (filter.dataFaturamentoRange) {
        const [start, end] = filter.dataFaturamentoRange;

        if (start !== undefined && start !== null && start !== '') {
          whereAnd.push({
            dataFaturamento: {
              [Op.gte]: start,
            },
          });
        }

        if (end !== undefined && end !== null && end !== '') {
          whereAnd.push({
            dataFaturamento: {
              [Op.lte]: end,
            },
          });
        }
      }

      if (filter.status) {
        whereAnd.push({
          status: filter.status,
        });
      }

      if (filter.valorFreteRange) {
        const [start, end] = filter.valorFreteRange;

        if (start !== undefined && start !== null && start !== '') {
          whereAnd.push({
            valorFrete: {
              [Op.gte]: start,
            },
          });
        }

        if (end !== undefined && end !== null && end !== '') {
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
          ['fornecedorEmpresaId']: SequelizeFilterUtils.uuid(
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

    let {
      rows,
      count,
    } = await options.database.pedido.findAndCountAll({
      where,
      include,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
      order: orderBy
        ? [orderBy.split('_')]
        : [['createdAt', 'DESC']],
      transaction: SequelizeRepository.getTransaction(
        options,
      ),
    });

    rows = await this._fillWithRelationsAndFilesForRows(
      rows,
      options,
    );

    return { rows, count };
  }

  static async findAllAutocomplete(query, limit, options: IRepositoryOptions) {
    const tenant = SequelizeRepository.getCurrentTenant(
      options,
    );

    let whereAnd: Array<any> = [{
      tenantId: tenant.id,
    }];

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

    const records = await options.database.pedido.findAll(
      {
        attributes: ['id', 'codigo'],
        where,
        limit: limit ? Number(limit) : undefined,
        order: [['codigo', 'ASC']],
      },
    );

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

  static async _fillWithRelationsAndFiles(record, options: IRepositoryOptions) {
    if (!record) {
      return record;
    }

    const output = record.get({ plain: true });

    const transaction = SequelizeRepository.getTransaction(
      options,
    );

    output.compradorUser = UserRepository.cleanupForRelationships(output.compradorUser);

    output.produto = await record.getProduto({
      transaction,
    });

    return output;
  }
}

export default PedidoRepository;
