import SequelizeRepository from '../../database/repositories/sequelizeRepository';
import AuditLogRepository from '../../database/repositories/auditLogRepository';
import lodash from 'lodash';
import SequelizeFilterUtils from '../../database/utils/sequelizeFilterUtils';
import Error404 from '../../errors/Error404';
import Sequelize from 'sequelize'; import UserRepository from './userRepository';
import { IRepositoryOptions } from './IRepositoryOptions';

const Op = Sequelize.Op;

class CarrinhoRepository {

  static async create(options: IRepositoryOptions) {
    const currentUser = SequelizeRepository.getCurrentUser(
      options,
    );

    const tenant = SequelizeRepository.getCurrentTenant(
      options,
    ) || 'c4a740fc-2e98-48b6-a837-6aa0feccfcfb'

    const record = await options.database.carrinho.findOrCreate(
      {
        where:
        {
          userId: currentUser.id,
          tenantId: tenant.id || 'c4a740fc-2e98-48b6-a837-6aa0feccfcfb',
        },
        defaults: {
          userId: currentUser.id || null,
          tenantId: tenant.id || 'c4a740fc-2e98-48b6-a837-6aa0feccfcfb' ,
          createdById: currentUser.id,
          updatedById: currentUser.id,
        }
      }
    );

    return this.findById(record[0].id, options);
  }

  static async update(id, data, options: IRepositoryOptions) {
    const currentUser = SequelizeRepository.getCurrentUser(
      options,
    );

    /* const transaction = SequelizeRepository.getTransaction(
      options,
    ); */


    const currentTenant = SequelizeRepository.getCurrentTenant(
      options,
    );

    const record = await options.database.carrinho.findOrCreate(
      {
        where:
        {
          userId: currentUser.id,
          tenantId: currentTenant.id,
        },
        defaults: {
          userId: currentUser.id || null,
          tenantId: currentTenant.id,
          createdById: currentUser.id,
          updatedById: currentUser.id,
        }
      }
    );

    /* record = await record.update(
      {
        ...lodash.pick(data, [

          'importHash',
        ]),
        userId: data.user || null,
        updatedById: currentUser.id,
      },
      {
        transaction,
      },
    );

    await record.setProduto(data.produto || [], {
      transaction,
    }); */


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

    let record = await options.database.carrinho.findOne(
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
        as: 'user',
      },
    ];

    const currentTenant = SequelizeRepository.getCurrentTenant(
      options,
    );

    const record = await options.database.carrinho.findOne(
      {
        where: {
          id,
          // tenantId: currentTenant.id,
        },
        include,
        transaction,
      },
    );

    if (!record) {
      console.log("bnjcdbnvxcbvxbscvbschbvhcbvahcbvjhcbvhchcvblnkvkdcnndcknbdklnbvnblvckbnlnvk")
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
      tenantId: currentTenant.id || 'c4a740fc-2e98-48b6-a837-6aa0feccfcfb',
    };

    const records = await options.database.carrinho.findAll(
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

    return options.database.carrinho.count(
      {
        where: {
          ...filter,
          tenantId: tenant.id || 'c4a740fc-2e98-48b6-a837-6aa0feccfcfb' ,
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
        as: 'user',
      },
    ];

    // whereAnd.push({
    //   tenantId: tenant.id || 'c4a740fc-2e98-48b6-a837-6aa0feccfcfb',
    // });

    if (filter) {
      if (filter.id) {
        whereAnd.push({
          ['id']: SequelizeFilterUtils.uuid(filter.id),
        });
      }

      if (filter.user) {
        whereAnd.push({
          ['user']: SequelizeFilterUtils.uuid(
            filter.user,
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
    } = await options.database.carrinho.findAndCountAll({
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

        ],
      });
    }

    const where = { [Op.and]: whereAnd };

    const records = await options.database.carrinho.findAll(
      {
        attributes: ['id', 'id'],
        where,
        limit: limit ? Number(limit) : undefined,
        order: [['id', 'ASC']],
      },
    );

    return records.map((record) => ({
      id: record.id,
      label: record.id,
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
        entityName: 'carrinho',
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

    output.user = UserRepository.cleanupForRelationships(output.user);

    output.produto = await record.getProduto({
      transaction,
    });

    return output;
  }
}

export default CarrinhoRepository;
