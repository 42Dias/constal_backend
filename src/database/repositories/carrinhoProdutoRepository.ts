import SequelizeRepository from './sequelizeRepository';
import AuditLogRepository from './auditLogRepository';
import lodash from 'lodash';
import SequelizeFilterUtils from '../utils/sequelizeFilterUtils';
import Error404 from '../../errors/Error404';
import Sequelize from 'sequelize'; import UserRepository from './userRepository';
import { IRepositoryOptions } from './IRepositoryOptions';
import { getConfig } from '../../config';
import highlight from 'cli-highlight';
import FileRepository from './fileRepository';

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

class CarrinhoProdutoRepository {

  static async create(data, options: IRepositoryOptions) {
    const record = await options.database.carrinhoProduto.findOrCreate(
      {
        where:
        {
          carrinhoId: data.carrinho,
          produtoId: data.product.id,
        },
        defaults: {
          carrinhoId: data.carrinho.id,
          produtoId: data.product.id,
          quantidade: data.quantidade,
        }
      }
    );

    await this._createAuditLog(
      AuditLogRepository.CREATE,
      record[0],
      data,
      options,
    );

    return this.findById(record[0].id, options);
  }

  static async update(id, data, options: IRepositoryOptions) {

    let record = await options.database.carrinhoProduto.findByPk(
      id,
    );
    console.log("data: ");
    console.log(data);
    record = await record.update(
      {
        quantidade: data.quantidade,
      },
    )

    return record;
  }

  static async destroy(id, options: IRepositoryOptions) {

    let record = await options.database.carrinhoProduto.findOne(
      {
        where: {
          id,
        },
      },
    );

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

    record.map(e => {
      e.produto.fotos = `${process.env.BACKEND_URL}/file/download?privateUrl=${e.produto.fotos}`;
    })
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

    const records = await options.database.carrinhoProduto.findAll(
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

    return options.database.carrinhoProduto.count(
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
    /* const tenant = SequelizeRepository.getCurrentTenant(
      options,
    ); */

    let whereAnd: Array<any> = [];
    /* let include = [
      {
        model: options.database.produto,
        as: 'produto',
      },
    ]; */

    /* whereAnd.push({
      tenantId: tenant.id,
    }); */

    if (filter) {
      if (filter.carrinho) {
        whereAnd.push({
          ['carrinhoId']: SequelizeFilterUtils.uuid(filter.carrinho),
        });
      }
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

    let query =
      'SELECT cp.id, cp.quantidade, cp.carrinhoId, p.id AS `produto.id`, p.nome AS `produto.nome`, IFNULL(p.precoOferta, p.preco) AS `produto.preco`, f.privateUrl AS `produto.fotos`, p.empresaId as `fornecedorId`, p.imagemUrl' +
      ` FROM carrinhoProdutos cp
          JOIN produtos p
          ON cp.produtoId = p.id
          LEFT JOIN files f
          ON p.id = f.belongsToId
        WHERE cp.carrinhoId = '${filter.carrinho}';`;


    let rows = await seq.query(query, {
      nest: true,
      type: QueryTypes.SELECT,
    });

    let count = rows.length;

    rows.map(e => {
      e.produto.fotos = `${process.env.BACKEND_URL}/file/download?privateUrl=${e.produto.fotos}`;
    })

    /* rows = await this._fillWithRelationsAndFilesForRows(
      rows,
      options,
    );
 */
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

    const records = await options.database.carrinhoProduto.findAll(
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

    const output = record.produto;

    output.fotos = await FileRepository.fillDownloadUrl(
      await record.getFotos(),
    );

    return output;
  }
}

export default CarrinhoProdutoRepository;
