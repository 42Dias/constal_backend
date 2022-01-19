import SequelizeRepository from '../../database/repositories/sequelizeRepository';
import FileRepository from './fileRepository';
import AuditLogRepository from './auditLogRepository';
import crypto from 'crypto';
import SequelizeFilterUtils from '../../database/utils/sequelizeFilterUtils';
import Error404 from '../../errors/Error404';
import Sequelize, { QueryTypes } from 'sequelize';
import { isUserInTenant } from '../utils/userTenantUtils';
import { getConfig } from '../../config';
import { IRepositoryOptions } from './IRepositoryOptions';
import SequelizeArrayUtils from '../utils/sequelizeArrayUtils';
import lodash from 'lodash';
import highlight from 'cli-highlight';
import Error400 from '../../errors/Error400';

const Op = Sequelize.Op;

export default class UserRepository {

  static async userVerificarEmail(id) {
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
      UPDATE users u
      SET u.emailVerified = true
      WHERE u.id = '${id}';
      `
    );
  }
  static async create(data, options: IRepositoryOptions) {
    const currentUser = SequelizeRepository.getCurrentUser(
      options,
    );

    const transaction = SequelizeRepository.getTransaction(
      options,
    );

    const user = await options.database.user.create(
      {
        id: data.id || undefined,
        email: data.email,
        firstName: data.firstName || null,
        fullName: data.fullName || null,
        lastName: data.lastName || null,
        phoneNumber: data.phoneNumber || null,
        importHash: data.importHash || null,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await FileRepository.replaceRelationFiles(
      {
        belongsTo: options.database.user.getTableName(),
        belongsToColumn: 'avatars',
        belongsToId: user.id,
      },
      data.avatars,
      options,
    );

    await AuditLogRepository.log(
      {
        entityName: 'user',
        entityId: user.id,
        action: AuditLogRepository.CREATE,
        values: {
          ...user.get({ plain: true }),
          avatars: data.avatars,
        },
      },
      options,
    );

    return this.findById(user.id, {
      ...options,
      bypassPermissionValidation: true,
    });
  }

  static async createFromAuth(
    data,
    options: IRepositoryOptions,
  ) {
    const transaction = SequelizeRepository.getTransaction(
      options,
    );

    const user = await options.database.user.create(
      {
        fullName: data.fullName,
        email: data.email,
        firstName: data.firstName,
        password: data.password,
      },
      { transaction },
    );

    delete user.password;
    await AuditLogRepository.log(
      {
        entityName: 'user',
        entityId: user.id,
        action: AuditLogRepository.CREATE,
        values: {
          ...user.get({ plain: true }),
          avatars: data.avatars,
        },
      },
      options,
    );

    return this.findById(user.id, {
      ...options,
      bypassPermissionValidation: true,
    });
  }

  static async updateProfile(
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

    const user = await options.database.user.findByPk(id, {
      transaction,
    });

    await user.update(
      {
        firstName: data.firstName || null,
        lastName: data.lastName || null,
        phoneNumber: data.phoneNumber || null,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await FileRepository.replaceRelationFiles(
      {
        belongsTo: options.database.user.getTableName(),
        belongsToColumn: 'avatars',
        belongsToId: user.id,
      },
      data.avatars,
      options,
    );

    await AuditLogRepository.log(
      {
        entityName: 'user',
        entityId: user.id,
        action: AuditLogRepository.UPDATE,
        values: {
          ...user.get({ plain: true }),
          avatars: data.avatars,
        },
      },
      options,
    );

    return this.findById(user.id, options);
  }

  static async updatePassword(
    id,
    password,
    invalidateOldTokens: boolean,
    options: IRepositoryOptions,
  ) {
    const currentUser = SequelizeRepository.getCurrentUser(
      options,
    );

    const transaction = SequelizeRepository.getTransaction(
      options,
    );

    const user = await options.database.user.findByPk(id, {
      transaction,
    });

    const data: any = {
      password,
      updatedById: currentUser.id,
    };

    if (invalidateOldTokens) {
      data.jwtTokenInvalidBefore = new Date();
    }

    await user.update(data, { transaction });

    await AuditLogRepository.log(
      {
        entityName: 'user',
        entityId: user.id,
        action: AuditLogRepository.UPDATE,
        values: {
          id,
        },
      },
      options,
    );

    return this.findById(user.id, {
      ...options,
      bypassPermissionValidation: true,
    });
  }

  static async generateEmailVerificationToken(
    email,
    options: IRepositoryOptions,
  ) {
    const currentUser = SequelizeRepository.getCurrentUser(
      options,
    );

    const transaction = SequelizeRepository.getTransaction(
      options,
    );

    const user = await options.database.user.findOne({
      where: { email },
      transaction,
    });

    const emailVerificationToken = crypto
      .randomBytes(20)
      .toString('hex');
    const emailVerificationTokenExpiresAt =
      Date.now() + 24 * 60 * 60 * 1000;

    await user.update(
      {
        emailVerificationToken,
        emailVerificationTokenExpiresAt,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await AuditLogRepository.log(
      {
        entityName: 'user',
        entityId: user.id,
        action: AuditLogRepository.UPDATE,
        values: {
          id: user.id,
          emailVerificationToken,
          emailVerificationTokenExpiresAt,
        },
      },
      options,
    );

    return emailVerificationToken;
  }

  static async generatePasswordResetToken(
    email,
    options: IRepositoryOptions,
  ) {
    const currentUser = SequelizeRepository.getCurrentUser(
      options,
    );

    const transaction = SequelizeRepository.getTransaction(
      options,
    );

    const user = await options.database.user.findOne({
      where: { email },
      transaction,
    });

    const passwordResetToken = crypto
      .randomBytes(20)
      .toString('hex');
    const passwordResetTokenExpiresAt =
      Date.now() + 24 * 60 * 60 * 1000;

    await user.update(
      {
        passwordResetToken,
        passwordResetTokenExpiresAt,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await AuditLogRepository.log(
      {
        entityName: 'user',
        entityId: user.id,
        action: AuditLogRepository.UPDATE,
        values: {
          id: user.id,
          passwordResetToken,
          passwordResetTokenExpiresAt,
        },
      },
      options,
    );

    return passwordResetToken;
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

    const user = await options.database.user.findByPk(id, {
      transaction,
    });

    await user.update(
      {
        firstName: data.firstName || null,
        lastName: data.lastName || null,
        phoneNumber: data.phoneNumber || null,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await FileRepository.replaceRelationFiles(
      {
        belongsTo: options.database.user.getTableName(),
        belongsToColumn: 'avatars',
        belongsToId: user.id,
      },
      data.avatars,
      options,
    );

    await AuditLogRepository.log(
      {
        entityName: 'user',
        entityId: user.id,
        action: AuditLogRepository.UPDATE,
        values: {
          ...user.get({ plain: true }),
          avatars: data.avatars,
          roles: data.roles,
        },
      },
      options,
    );

    return this.findById(user.id, options);
  }

  static async findByEmail(
    email,
    options: IRepositoryOptions,
  ) {
    const transaction = SequelizeRepository.getTransaction(
      options,
    );

    const record = await options.database.user.findOne({
      where: {
        [Op.and]: SequelizeFilterUtils.ilikeExact(
          'user',
          'email',
          email,
        ),
      },
      transaction,
    });

    return this._fillWithRelationsAndFiles(record, options);
  }

  static async findByEmailWithoutAvatar(
    email,
    options: IRepositoryOptions,
  ) {
    const transaction = SequelizeRepository.getTransaction(
      options,
    );

    const record = await options.database.user.findOne({
      where: {
        [Op.and]: SequelizeFilterUtils.ilikeExact(
          'user',
          'email',
          email,
        ),
      },
      transaction,
    });

    return this._fillWithRelationsAndFiles(record, options);
  }

  static async findAndCountAll(
    { filter, limit = 0, offset = 0, orderBy = '' },
    options: IRepositoryOptions,
  ) {
    const transaction = SequelizeRepository.getTransaction(
      options,
    );

    let whereAnd: Array<any> = [];
    let include: any = [];

    const currentTenant = SequelizeRepository.getCurrentTenant(
      options,
    );

    if (!filter || (!filter.role && !filter.status)) {
      include.push({
        model: options.database.tenantUser,
        as: 'tenants',
        where: {
          ['tenantId']: currentTenant.id || 'c4a740fc-2e98-48b6-a837-6aa0feccfcfb' ,
        },
      });
    }

    if (filter) {
      if (filter.id) {
        whereAnd.push({
          ['id']: filter.id,
        });
      }

      if (filter.fullName) {
        whereAnd.push(
          SequelizeFilterUtils.ilikeIncludes(
            'user',
            'fullName',
            filter.fullName,
          ),
        );
      }

      if (filter.email) {
        whereAnd.push(
          SequelizeFilterUtils.ilikeIncludes(
            'user',
            'email',
            filter.email,
          ),
        );
      }

      if (filter.role) {
        const innerWhereAnd: Array<any> = [];

        innerWhereAnd.push({
          ['tenantId']: currentTenant.id || 'c4a740fc-2e98-48b6-a837-6aa0feccfcfb',
        });

        innerWhereAnd.push(
          SequelizeArrayUtils.filter(
            `tenants`,
            `roles`,
            filter.role,
          ),
        );

        include.push({
          model: options.database.tenantUser,
          as: 'tenants',
          where: { [Op.and]: innerWhereAnd },
        });
      }

      if (filter.status) {
        include.push({
          model: options.database.tenantUser,
          as: 'tenants',
          where: {
            ['tenantId']: currentTenant.id || 'c4a740fc-2e98-48b6-a837-6aa0feccfcfb',
            status: filter.status,
          },
        });
      }
      if(filter.role == "empresa"){
        include.push({
          model: options.database.empresa,
          as: 'empresas'
        });
      }else{
        include.push({
          model: options.database.pessoaFisica,
          as: 'pessoaFisica'
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
    } = await options.database.user.findAndCountAll({
      where,
      include,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
      order: orderBy
        ? [orderBy.split('_')]
        : [['email', 'ASC']],
      transaction,
    });

    rows = await this._fillWithRelationsAndFilesForRows(
      rows,
      options,
    );

    rows = this._mapUserForTenantForRows(
      rows,
      currentTenant,
    );

    return { rows, count };
  }

  static async findAllAutocomplete(
    query,
    limit,
    options: IRepositoryOptions,
  ) {
    const currentTenant = SequelizeRepository.getCurrentTenant(
      options,
    );

    let whereAnd: Array<any> = [];
    let include = [
      {
        model: options.database.tenantUser,
        as: 'tenants',
        where: {
          ['tenantId']: currentTenant.id || 'c4a740fc-2e98-48b6-a837-6aa0feccfcfb',
        },
      },
    ];

    if (query) {
      whereAnd.push({
        [Op.or]: [
          {
            ['id']: SequelizeFilterUtils.uuid(query),
          },
          SequelizeFilterUtils.ilikeIncludes(
            'user',
            'fullName',
            query,
          ),
          SequelizeFilterUtils.ilikeIncludes(
            'user',
            'email',
            query,
          ),
        ],
      });
    }

    const where = { [Op.and]: whereAnd };

    let users = await options.database.user.findAll({
      attributes: ['id', 'fullName', 'email'],
      where,
      include,
      limit: limit ? Number(limit) : undefined,
      order: [['fullName', 'ASC']],
    });

    users = this._mapUserForTenantForRows(
      users,
      currentTenant,
    );

    const buildText = (user) => {
      if (!user.fullName) {
        return user.email;
      }

      return `${user.fullName} <${user.email}>`;
    };

    return users.map((user) => ({
      id: user.id,
      label: buildText(user),
    }));
  }

  static async findById(id, options: IRepositoryOptions) {
    const transaction = SequelizeRepository.getTransaction(
      options,
    );

    /*
    o record está retornando null
    usa as funções do req
    configurado de forma igual ao local?
    banco de dados?
    como verificar?
    estou ficando louco?
    */
   
    let record = await options.database.user.findByPk(id, {
      transaction,
    });
    console.log("record 1")
    console.log(record)

    record = await this._fillWithRelationsAndFiles(
      record,
      options,
    );
    console.log("record 2")
    console.log(record)
    if (!record) {
      console.log("aqui")
      throw new Error404();
    }

    const currentTenant = SequelizeRepository.getCurrentTenant(
      options,
    );

    if (!options || !options.bypassPermissionValidation) {
      if (!isUserInTenant(record, currentTenant)) {
        throw new Error404();
      }

      record = this._mapUserForTenant(
        record,
        currentTenant,
      );

      console.log("record 3")
      console.log(record)
    }

    console.log("record 4")
    console.log(record)

    return record;
  }

  static async findByIdWithoutAvatar(
    id,
    options: IRepositoryOptions,
  ) {
    const transaction = SequelizeRepository.getTransaction(
      options,
    );

    let record = await options.database.user.findByPk(id, {
      transaction,
    });

    const currentTenant = SequelizeRepository.getCurrentTenant(
      options,
    );

    record = await this._fillWithRelationsAndFiles(
      record,
      options,
    );

    if (!options || !options.bypassPermissionValidation) {
      if (!isUserInTenant(record, currentTenant)) {
        throw new Error404();
      }
    }

    return record;
  }

  static async findByPasswordResetToken(
    token,
    options: IRepositoryOptions,
  ) {
    const transaction = SequelizeRepository.getTransaction(
      options,
    );

    const record = await options.database.user.findOne({
      where: {
        id: token,
        // Find only not expired tokens
        /*passwordResetTokenExpiresAt: {
          [options.database.Sequelize.Op.gt]: Date.now(),
        },*/
      },
      transaction,
    });

    return this._fillWithRelationsAndFiles(record, options);
  }

  static async findByEmailVerificationToken(
    token,
    options: IRepositoryOptions,
  ) {
    const transaction = SequelizeRepository.getTransaction(
      options,
    );

    const record = await options.database.user.findOne({
      where: {
        emailVerificationToken: token,
        emailVerificationTokenExpiresAt: {
          [options.database.Sequelize.Op.gt]: Date.now(),
        },
      },
      transaction,
    });

    return this._fillWithRelationsAndFiles(record, options);
  }

  static async markEmailVerified(
    id,
    options: IRepositoryOptions,
  ) {
    const currentUser = SequelizeRepository.getCurrentUser(
      options,
    );

    const transaction = SequelizeRepository.getTransaction(
      options,
    );

    const user = await options.database.user.findByPk(id, {
      transaction,
    });

    await user.update(
      {
        emailVerified: true,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await AuditLogRepository.log(
      {
        entityName: 'user',
        entityId: user.id,
        action: AuditLogRepository.UPDATE,
        values: {
          id,
          emailVerified: true,
        },
      },
      options,
    );

    return true;
  }

  static async count(filter, options: IRepositoryOptions) {
    const transaction = SequelizeRepository.getTransaction(
      options,
    );

    return options.database.user.count({
      where: filter,
      transaction,
    });
  }

  static async findPassword(
    id,
    options: IRepositoryOptions,
  ) {
    const transaction = SequelizeRepository.getTransaction(
      options,
    );

    const record = await options.database.user.findByPk(
      id,
      {
        // raw is responsible
        // for bringing the password
        raw: true,
        transaction,
      },
    );

    if (!record) {
      return null;
    }

    return record.password;
  }

  static async createFromSocial(
    provider,
    providerId,
    email,
    emailVerified,
    firstName,
    lastName,
    options,
  ) {
    let data = {
      email,
      emailVerified,
      providerId,
      provider,
      firstName,
      lastName,
    };

    const transaction = SequelizeRepository.getTransaction(
      options,
    );

    const user = await options.database.user.create(data, {
      transaction,
    });

    delete user.password;
    await AuditLogRepository.log(
      {
        entityName: 'user',
        entityId: user.id,
        action: AuditLogRepository.CREATE,
        values: {
          ...user.get({ plain: true }),
        },
      },
      options,
    );

    return this.findById(user.id, {
      ...options,
      bypassPermissionValidation: true,
    });
  }

  static cleanupForRelationships(userOrUsers) {
    if (!userOrUsers) {
      return userOrUsers;
    }

    if (Array.isArray(userOrUsers)) {
      return userOrUsers.map((user) =>
        lodash.pick(user, [
          'id',
          'firstName',
          'lastName',
          'email',
        ]),
      );
    }

    return lodash.pick(userOrUsers, [
      'id',
      'firstName',
      'lastName',
      'email',
    ]);
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
    };

    let include = [
      {
        model: options.database.tenantUser,
        as: 'tenants',
        where: {
          ['tenantId']: currentTenant.id || 'c4a740fc-2e98-48b6-a837-6aa0feccfcfb',
        },
      },
    ];

    const records = await options.database.user.findAll({
      attributes: ['id'],
      where,
      include,
    });

    return records.map((record) => record.id);
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

    output.avatars = await FileRepository.fillDownloadUrl(
      await record.getAvatars({
        transaction: SequelizeRepository.getTransaction(
          options,
        ),
      }),
    );

    output.tenants = await record.getTenants({
      include: [
        {
          model: options.database.tenant,
          as: 'tenant',
          required: true,
          include: ['settings'],
        },
      ],
      transaction: SequelizeRepository.getTransaction(
        options,
      ),
    });

    return output;
  }

  /**
   * Maps the users data to show only the current tenant related info
   */
  static _mapUserForTenantForRows(rows, tenant) {
    if (!rows) {
      return rows;
    }

    return rows.map((record) =>
      this._mapUserForTenant(record, tenant),
    );
  }

  /**
   * Maps the user data to show only the current tenant related info
   */
  static _mapUserForTenant(user, tenant) {
    if (!user || !user.tenants) {
      return user;
    }

    const tenantUser = user.tenants.find(
      (tenantUser) =>
        tenantUser &&
        tenantUser.tenant &&
        String(tenantUser.tenant.id) === String(tenant.id),
    );

    delete user.tenants;

    const status = tenantUser ? tenantUser.status : null;
    const roles = tenantUser ? tenantUser.roles : [];

    // If the user is only invited,
    // tenant members can only see its email
    const otherData = status === 'active' ? user : {};

    return {
      ...otherData,
      id: user.id,
      email: user.email,
      roles,
      status,
    };
  }

  //Quando criar ou atualizar o perfil
  static async updateHasProfile(
    options: IRepositoryOptions,
  ) {
    const currentUser = SequelizeRepository.getCurrentUser(
      options,
    );

    const user = await options.database.user.findOne({
      where: {
        id: currentUser.id
      }
    });

    await user.update(
      {
        hasProfile: 1
      },
    );

  }
  static async findAdmId(id, options: IRepositoryOptions){
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
    let query =
    'SELECT cp.id, cp.quantidade,' +
    ' p.id AS `produto.id`, p.nome AS `produto.nome`, IFNULL(p.precoOferta, p.preco) AS `produto.preco`,' +
    ' p.descricao AS `produto.descricao`, p.marca AS `produto.marca`, p.modelo AS `produto.modelo`,'+
    ' p.caracteristicas AS `produto.caracteristicas`, p.codigo AS `produto.codigo`, ca.id AS `produto.categoria.id`, ca.nome AS `produto.categoria.nome`,'+
    ' f.privateUrl AS `produto.fotos`' +
    ` FROM carrinhoProdutos cp

        JOIN produtos p
        ON cp.produtoId = p.id
        
        LEFT JOIN files f
        ON p.id = f.belongsToId
        
        LEFT JOIN categoria ca
        ON p.categoriaId = ca.id

      WHERE cp.id = '${id}';`;


  let record = await seq.query(query, {
    nest: true,
    type: QueryTypes.SELECT,
  });

  return record;
  }

  static sendVerificationUpdateToken (
    id,
    token,
    options: IRepositoryOptions,
  ) {
    let record = options.database.user.update(
      {
        token: token,
      },
      {
        where: {
          id: id,
        },
      },
    )
  }

  static async generateRecuperarSenhaToken (
    id,
    token,
    options: IRepositoryOptions,
  ) {
    const hash = SequelizeFilterUtils.uuid(id)

    let record = await options.database.user.update(
      {
        passwordResetToken: hash,
      },
      {
        where: {
          id: id
        },
      },
    )

    if (record == 1) {
      return hash
    } else {
      throw new Error400()
    }
  }
}
