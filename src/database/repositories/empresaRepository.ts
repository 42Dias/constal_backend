import SequelizeRepository from '../../database/repositories/sequelizeRepository';
import AuditLogRepository from '../../database/repositories/auditLogRepository';
import lodash from 'lodash';
import SequelizeFilterUtils from '../../database/utils/sequelizeFilterUtils';
import Error404 from '../../errors/Error404';
import Sequelize, { QueryTypes } from 'sequelize'; import UserRepository from './userRepository';
import FileRepository from './fileRepository';
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
    timezone: getConfig().DATABASE_TIMEZONE,
  },

);

class EmpresaRepository {
  

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

    const record = await options.database.empresa.create(
      {
        ...lodash.pick(data, [
          'marca',
          'razaoSocial',
          'cnpj',
          'telefone',
          'ramal',
          'email',
          'website',
          'cep',
          'logradouro',
          'numero',
          'complemento',
          'pontoReferencia',
          'cidade',
          'estado',
          'bairro',
          'pix',
          'importHash',
          'live_api_token',
          'account_id',
          'cartaoTipo',
          'cartaoNumero',
          'cartaoBanco',
          'teste_api_token',
          'user_token',
          
        ]),
        userId: data.user || null,
        tenantId: tenant.id,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      },
      {
        transaction,
      },
    );



    await FileRepository.replaceRelationFiles(
      {
        belongsTo: options.database.empresa.getTableName(),
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

  static async findByUserId(id, options: IRepositoryOptions) {

    const record = await options.database.empresa.findOne(
      {
        where: {
          userId: id,
        },
      },
    );

    return record
  }
  static async empresaStatusUpdate(id, data) {

    let rows = await seq.query(
      `
      UPDATE tenantUsers tu
      SET tu.status = '${data.status}'
      WHERE tu.id = '${id}';
      `
    );
    let rows2 = await seq.query(
      `SELECT 
      e. *, tu.status, tu.id as tId
      FROM
          empresas e
              LEFT JOIN
          users u ON e.userId = u.id
              LEFT JOIN
          tenantUsers tu ON u.id = tu.userId
      WHERE
          tu.id = '${id}'
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

    let record = await options.database.empresa.findOne(
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
          'marca',
          'razaoSocial',
          'cnpj',
          'telefone',
          'ramal',
          'email',
          'website',
          'cep',
          'logradouro',
          'numero',
          'complemento',
          'pontoReferencia',
          'cidade',
          'estado',
          'bairro',
          'pix',
          'importHash',
          'cartaoTipo',
          'cartaoNumero',
          'cartaoBanco',
          'account_id',
          'live_api_token',
          'teste_api_token',
          'user_token',
          'cartaoTipo',
          'cartaoNumero',
          'cartaoBanco',
          'cartaoAgencia'

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
        belongsTo: options.database.empresa.getTableName(),
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

    let record = await options.database.empresa.findOne(
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

    const record = await options.database.empresa.findOne(
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

    const record = await options.database.empresa.findOne(
      {
        where: {
          userId: currentUser.id,
          tenantId: currentTenant.id,
        },
        include,
      },
    );

    /* if (!record) {
      throw new Error404();
    } */

    return this._fillWithRelationsAndFiles(record, options);
  }

  static async createOrUpdate(data, options: IRepositoryOptions) {
    const currentUser = SequelizeRepository.getCurrentUser(
      options,
    );

    const tenant = SequelizeRepository.getCurrentTenant(
      options,
    );

    const record = await options.database.empresa.findOrCreate(
      {
        where: {
          userId: currentUser.id,
        },
        defaults: {
          ...lodash.pick(data, [
            'nome',
            'marca',
            'razaoSocial',
            'cnpj',
            'telefone',
            'celular',
            'ramal',
            'email',
            'website',
            'cep',
            'logradouro',
            'numero',
            'complemento',
            'pontoReferencia',
            'cidade',
            'estado',
            'bairro',
            'pix',
            'importHash',
            'user_token',
            'account_id',
            'live_api_token',
            'test_api_token',
            'account_id',
            'cartaoTipo',
            'cartaoNumero',
            'cartaoBanco',
            'cartaoAgencia'


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
            'nome',
            'marca',
            'razaoSocial',
            'cnpj',
            'telefone',
            'ramal',
            'email',
            'celular',
            'website',
            'cep',
            'logradouro',
            'numero',
            'complemento',
            'pontoReferencia',
            'cidade',
            'estado',
            'bairro',
            'pix',
            'importHash',
            'user_token',
            'account_id',
            'live_api_token',
            'test_api_token',
            'account_id',
            'cartaoTipo',
            'cartaoNumero',
            'cartaoBanco',
            'cartaoAgencia'


          ]),
          userId: currentUser.id || null,
          updatedById: currentUser.id,
        },
      );
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

    const records = await options.database.empresa.findAll(
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

    return options.database.empresa.count(
      {
        where: {
          ...filter,
          tenantId: tenant.id,
        },
        transaction,
      },
    );
  }
  static async empresaStatus({ filter, limit = 0, offset = 0, orderBy = '' },
  options: IRepositoryOptions,) 
  {
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
    var where = '';
    if(filter.role){
      where = `tu.roles LIKE '%${filter.role}%' `
    }else{
      where = `tu.roles LIKE '%empresa%' `
    }
    if(filter.status == 'Todas'){
      where = where+` AND tu.status != 'pendente' `
    }else{
      where = where+` AND tu.status = '${filter.status}' `
    }
    if(filter.id){
      where = where+`and e.id = '${filter.id}' `
    }
    let rows = await seq.query(
      `SELECT 
      e.id as empresaId, e. *, u. *, tu.status, tu.id as tId
      FROM
          users u
            inner JOIN
          empresas e ON e.userId = u.id
            inner JOIN
          tenantUsers tu ON u.id = tu.userId
      WHERE
          
          ${where}
      `
      ,
      {
        type: QueryTypes.SELECT,
      }
    );

    let count = rows.length;
    console.log(rows)
    
    return { rows, count };
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
      tenantId: tenant.id,
    });

    if (filter) {
      if (filter.id) {
        whereAnd.push({
          ['id']: SequelizeFilterUtils.uuid(filter.id),
        });
      }

      if (filter.marca) {
        whereAnd.push(
          SequelizeFilterUtils.ilikeIncludes(
            'empresa',
            'marca',
            filter.marca,
          ),
        );
      }

      if (filter.razaoSocial) {
        whereAnd.push(
          SequelizeFilterUtils.ilikeIncludes(
            'empresa',
            'razaoSocial',
            filter.razaoSocial,
          ),
        );
      }

      if (filter.cnpj) {
        whereAnd.push(
          SequelizeFilterUtils.ilikeIncludes(
            'empresa',
            'cnpj',
            filter.cnpj,
          ),
        );
      }

      if (filter.telefone) {
        whereAnd.push(
          SequelizeFilterUtils.ilikeIncludes(
            'empresa',
            'telefone',
            filter.telefone,
          ),
        );
      }

      if (filter.ramal) {
        whereAnd.push(
          SequelizeFilterUtils.ilikeIncludes(
            'empresa',
            'ramal',
            filter.ramal,
          ),
        );
      }

      if (filter.email) {
        whereAnd.push(
          SequelizeFilterUtils.ilikeIncludes(
            'empresa',
            'email',
            filter.email,
          ),
        );
      }

      if (filter.website) {
        whereAnd.push(
          SequelizeFilterUtils.ilikeIncludes(
            'empresa',
            'website',
            filter.website,
          ),
        );
      }

      if (filter.cep) {
        whereAnd.push(
          SequelizeFilterUtils.ilikeIncludes(
            'empresa',
            'cep',
            filter.cep,
          ),
        );
      }

      if (filter.logradouro) {
        whereAnd.push(
          SequelizeFilterUtils.ilikeIncludes(
            'empresa',
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
            'empresa',
            'complemento',
            filter.complemento,
          ),
        );
      }

      if (filter.pontoReferencia) {
        whereAnd.push(
          SequelizeFilterUtils.ilikeIncludes(
            'empresa',
            'pontoReferencia',
            filter.pontoReferencia,
          ),
        );
      }

      if (filter.cidade) {
        whereAnd.push(
          SequelizeFilterUtils.ilikeIncludes(
            'empresa',
            'cidade',
            filter.cidade,
          ),
        );
      }

      if (filter.estado) {
        whereAnd.push(
          SequelizeFilterUtils.ilikeIncludes(
            'empresa',
            'estado',
            filter.estado,
          ),
        );
      }

      if (filter.bairro) {
        whereAnd.push(
          SequelizeFilterUtils.ilikeIncludes(
            'empresa',
            'bairro',
            filter.bairro,
          ),
        );
      }

      if (filter.pix) {
        whereAnd.push(
          SequelizeFilterUtils.ilikeIncludes(
            'empresa',
            'pix',
            filter.pix,
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
    } = await options.database.empresa.findAndCountAll({
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
              'empresa',
              'marca',
              query,
            ),
          },
        ],
      });
    }

    const where = { [Op.and]: whereAnd };

    const records = await options.database.empresa.findAll(
      {
        attributes: ['id', 'marca'],
        where,
        limit: limit ? Number(limit) : undefined,
        order: [['marca', 'ASC']],
      },
    );
    console.log(records);

    return records.map((record) => ({
      id: record.id,
      label: record.marca,
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
        entityName: 'empresa',
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

  static async findIdBySQL(id) {
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
      )


    let rows2 = await seq.query(
      `SELECT 
        * from empresas where id = '${id}'
      `
      ,
      {
        type: QueryTypes.SELECT,
      }
    );
    
    return rows2[0] ;
  }
  static async findUserByEmpresaId(id) {

    let req = `
    SELECT 
    * 
    FROM empresas e
      inner join users u
      where e.id = '${id}'
      and u.id = e.userId;
    `

    let rows2 = await seq.query(
      req,
      {
        type: QueryTypes.SELECT,
      }
    );
    
    return rows2[0] ;
    
  }

}

export default EmpresaRepository;
