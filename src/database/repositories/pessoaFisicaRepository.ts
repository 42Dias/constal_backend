import SequelizeRepository from '../../database/repositories/sequelizeRepository';
import AuditLogRepository from '../../database/repositories/auditLogRepository';
import lodash from 'lodash';
import SequelizeFilterUtils from '../../database/utils/sequelizeFilterUtils';
import Error404 from '../../errors/Error404';
import Sequelize from 'sequelize';import UserRepository from './userRepository';
import FileRepository from './fileRepository';
import { IRepositoryOptions } from './IRepositoryOptions';

const Op = Sequelize.Op;

class PessoaFisicaRepository {

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

    const record = await options.database.pessoaFisica.create(
      {
        ...lodash.pick(data, [
          'cpf',
          'nome',
          'email',
          'telefone',
          'celular',
          'cep',
          'logradouro',
          'numero',
          'complemento',
          'pontoReferencia',
          'cidade',
          'estado',
          'bairro',     
          'importHash',
        ]),
        userId: data.user || null,
        tenantId: tenant.id || 'c4a740fc-2e98-48b6-a837-6aa0feccfcfb',
        createdById: currentUser.id,
        updatedById: currentUser.id,
      },
      {
        transaction,
      },
    );

    
  
    await FileRepository.replaceRelationFiles(
      {
        belongsTo: options.database.pessoaFisica.getTableName(),
        belongsToColumn: 'foto',
        belongsToId: record.id,
      },
      data.foto,
      options,
    );
  
    await this._createAuditLog(
      AuditLogRepository.CREATE,
      record,
      data,
      options,
    );

    return this.findById(record.id, options);
  }

  static async createOrUpdate(data, options: IRepositoryOptions) {
    const currentUser = SequelizeRepository.getCurrentUser(
      options,
    );

    const tenant = SequelizeRepository.getCurrentTenant(
      options,
    );

    const record = await options.database.pessoaFisica.findOrCreate(
      {
        where: {
          userId: currentUser.id,
        },
        defaults: {
          ...lodash.pick(data, [
            'cpf',
            'nome',
            'email',
            'telefone',
            'celular',
            'cep',
            'logradouro',
            'numero',
            'complemento',
            'pontoReferencia',
            'cidade',
            'estado',
            'bairro',     
            'importHash',
          ]),
          userId: currentUser.id || null,
          tenantId: tenant.id,
          createdById: currentUser.id,
          updatedById: currentUser.id,
        },
      },
    );
    if (record[1] == false) {
      record[0] = await record[0].update(
        {
          ...lodash.pick(data, [
            'cpf',
            'nome',
            'email',
            'telefone',
            'celular',
            'cep',
            'logradouro',
            'numero',
            'complemento',
            'pontoReferencia',
            'cidade',
            'estado',
            'bairro',
          ]),
          userId: currentUser.id || null,
          updatedById: currentUser.id,
        },
      );
    }
    
      return record;
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

    let record = await options.database.pessoaFisica.findOne(      
      {
        where: {
          id,
          tenantId: currentTenant.id || 'c4a740fc-2e98-48b6-a837-6aa0feccfcfb',
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
          'cpf',
          'nome',
          'email',
          'telefone',
          'celular',
          'cep',
          'logradouro',
          'numero',
          'complemento',
          'pontoReferencia',
          'cidade',
          'estado',
          'bairro',  
          'importHash',
        ]),
        userId: data.user || null,
        updatedById: currentUser.id,
      },
      {
        transaction,
      },
    );



    await FileRepository.replaceRelationFiles(
      {
        belongsTo: options.database.pessoaFisica.getTableName(),
        belongsToColumn: 'foto',
        belongsToId: record.id,
      },
      data.foto,
      options,
    );

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

    let record = await options.database.pessoaFisica.findOne(
      {
        where: {
          id,
          tenantId: currentTenant.id || 'c4a740fc-2e98-48b6-a837-6aa0feccfcfb',
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

    const record = await options.database.pessoaFisica.findOne(
      {
        where: {
          id,
          tenantId: currentTenant.id || 'c4a740fc-2e98-48b6-a837-6aa0feccfcfb',
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

  static async findByCurrentId(options: IRepositoryOptions) {
    const currentUser = SequelizeRepository.getCurrentUser(
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

    const record = await options.database.pessoaFisica.findOne(
      {
        where: {
          userId: currentUser.id,
          tenantId: currentTenant.id || 'c4a740fc-2e98-48b6-a837-6aa0feccfcfb' ,
        },
        include,
      },
    );

    /* if (!record) {
      throw new Error404();
    } */

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

    const records = await options.database.pessoaFisica.findAll(
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

    return options.database.pessoaFisica.count(
      {
        where: {
          ...filter,
          tenantId: tenant.id || 'c4a740fc-2e98-48b6-a837-6aa0feccfcfb',
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

    whereAnd.push({
      tenantId: tenant.id || 'c4a740fc-2e98-48b6-a837-6aa0feccfcfb',
    });

    if (filter) {
      if (filter.id) {
        whereAnd.push({
          ['id']: SequelizeFilterUtils.uuid(filter.id),
        });
      }

      if (filter.cpf) {
        whereAnd.push(
          SequelizeFilterUtils.ilikeIncludes(
            'pessoaFisica',
            'cpf',
            filter.cpf,
          ),
        );
      }

      if (filter.nome) {
        whereAnd.push(
          SequelizeFilterUtils.ilikeIncludes(
            'pessoaFisica',
            'nome',
            filter.nome,
          ),
        );
      }

      if (filter.email) {
        whereAnd.push(
          SequelizeFilterUtils.ilikeIncludes(
            'pessoaFisica',
            'email',
            filter.email,
          ),
        );
      }

      if (filter.telefone) {
        whereAnd.push(
          SequelizeFilterUtils.ilikeIncludes(
            'pessoaFisica',
            'telefone',
            filter.telefone,
          ),
        );
      }

      if (filter.celular) {
        whereAnd.push(
          SequelizeFilterUtils.ilikeIncludes(
            'pessoaFisica',
            'celular',
            filter.celular,
          ),
        );
      }

      if (filter.cep) {
        whereAnd.push(
          SequelizeFilterUtils.ilikeIncludes(
            'pessoaFisica',
            'cep',
            filter.cep,
          ),
        );
      }

      if (filter.logradouro) {
        whereAnd.push(
          SequelizeFilterUtils.ilikeIncludes(
            'pessoaFisica',
            'logradouro',
            filter.logradouro,
          ),
        );
      }

      if (filter.numeroRange) {
        const [start, end] = filter.numeroRange;

        if (start !== undefined && start !== null && start !== '') {
          whereAnd.push({
            numero: {
              [Op.gte]: start,
            },
          });
        }

        if (end !== undefined && end !== null && end !== '') {
          whereAnd.push({
            numero: {
              [Op.lte]: end,
            },
          });
        }
      }

      if (filter.complemento) {
        whereAnd.push(
          SequelizeFilterUtils.ilikeIncludes(
            'pessoaFisica',
            'complemento',
            filter.complemento,
          ),
        );
      }

      if (filter.pontoReferencia) {
        whereAnd.push(
          SequelizeFilterUtils.ilikeIncludes(
            'pessoaFisica',
            'pontoReferencia',
            filter.pontoReferencia,
          ),
        );
      }

      if (filter.cidade) {
        whereAnd.push(
          SequelizeFilterUtils.ilikeIncludes(
            'pessoaFisica',
            'cidade',
            filter.cidade,
          ),
        );
      }

      if (filter.estado) {
        whereAnd.push(
          SequelizeFilterUtils.ilikeIncludes(
            'pessoaFisica',
            'estado',
            filter.estado,
          ),
        );
      }

      if (filter.bairro) {
        whereAnd.push(
          SequelizeFilterUtils.ilikeIncludes(
            'pessoaFisica',
            'bairro',
            filter.bairro,
          ),
        );
      }

      if (filter.user) {
        whereAnd.push({
          ['userId']: SequelizeFilterUtils.uuid(
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
    } = await options.database.pessoaFisica.findAndCountAll({
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
              'pessoaFisica',
              'cpf',
              query,
            ),
          },
        ],
      });
    }

    const where = { [Op.and]: whereAnd };

    const records = await options.database.pessoaFisica.findAll(
      {
        attributes: ['id', 'cpf'],
        where,
        limit: limit ? Number(limit) : undefined,
        order: [['cpf', 'ASC']],
      },
    );

    return records.map((record) => ({
      id: record.id,
      label: record.cpf,
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
        foto: data.foto,
      };
    }

    await AuditLogRepository.log(
      {
        entityName: 'pessoaFisica',
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

    output.foto = await FileRepository.fillDownloadUrl(
      await record.getFoto({
        transaction,
      }),
    );

    output.user = UserRepository.cleanupForRelationships(output.user);

    return output;
  }
}

export default PessoaFisicaRepository;
