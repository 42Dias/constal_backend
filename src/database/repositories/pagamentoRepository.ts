import SequelizeRepository from './sequelizeRepository';
import AuditLogRepository from './auditLogRepository';
import lodash from 'lodash';
import SequelizeFilterUtils from '../utils/sequelizeFilterUtils';
import Error404 from '../../errors/Error404';
import Sequelize from 'sequelize'; import UserRepository from './userRepository';
import { IRepositoryOptions } from './IRepositoryOptions';
import { getConfig } from '../../config';
import highlight from 'cli-highlight';
const fetch = require("node-fetch");

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

//Token Usado na Fatura
const API_TOKEN = 'A7C933D7B2F192D4DA24D134FF9640FD4CE73D7049284194CE962E7374A3EA37';   //* TESTE
// const API_TOKEN = '9E22B79709D38A9C4CD229E480EBDDB363BC99F9182C8FD1BC49CECC0CAA44F8' //* PRODUÇÃO

class PagamentoRepository {

  static async create(data, options: IRepositoryOptions) {
    const currentUser = SequelizeRepository.getCurrentUser(
      options,
    );

    const pessoa = await options.database.pessoaFisica.findOne(
      {
        where: {
          userId: data.compradorUserId
        }
      }
    );

    if (!pessoa) {
      throw new Error404();
    }

    pessoa.cep = pessoa.cep.replace(/\.|-/g, '');
    pessoa.cpf = pessoa.cpf.replace(/\.|-/g, '');
    pessoa.celular = pessoa.celular.replace(/\+|\(|\)| |-/g, '');

    let dataVencimento = new Date();
    dataVencimento.setDate(dataVencimento.getDate() + 3);

    let arrItems: any = data.produtos.map(e => {
      return {
        description: e.nome,
        quantity: e.quantidade,
        price_cents: e.precoUnitario * 100 //API Iugu considera centavos
      }
    });

    let precoPedido = 0;

    arrItems.forEach(e => {
      precoPedido += (e.price_cents * e.quantity);
    });

    let formaPagamento;
    switch (data.formaPagamento) {
      case 'boleto':
        formaPagamento = ['bank_slip'];
        break;

      case 'cartao':
        formaPagamento = precoPedido < 100000 ? ['credit_card'] : ['bank_slip', 'pix'];
        break;

      case 'pix':
        formaPagamento = ['pix'];
        break;

      default:
        formaPagamento = precoPedido < 100000 ? ['all'] : ['bank_slip', 'pix'];
        break;
    }

    const url = `https://api.iugu.com/v1/invoices?api_token=${API_TOKEN}`;
    const opt = {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        //ensure_workday_due_date: true, //Garantir que a data da fatura caia em dia útil
        items: [
          arrItems
        ],
        payable_with: formaPagamento,
        payer: {
          address: {
            zip_code: pessoa.cep,
            street: pessoa.estado,
            number: pessoa.numero,
            district: pessoa.bairro,
            city: pessoa.cidade,
            state: pessoa.estado,
            country: 'brasil'
          },
          name: pessoa.nome,
          phone: pessoa.celular,
          cpf_cnpj: pessoa.cpf,
          email: pessoa.email
        },
        email: pessoa.email,
        due_date: dataVencimento
      })
    };

    await fetch(url, opt)
      .then(res => res.json())
      .then(json => {
        console.log(json)
        data.idIugu = json.id
        data.urlFaturaIugu = json.secure_url
      }
      )
      .catch(err => console.error('error:' + err));

    const record = await options.database.pagamento.create(
      {
        ...lodash.pick(data, [
          'idIugu',
          'urlFaturaIugu',
        ]),
        status: 'pendente',
        pedidoId: data.id,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      },
    );

    return record;
  }

  /* static async update(id, data, options: IRepositoryOptions) {
    const currentUser = SequelizeRepository.getCurrentUser(
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
      },
    );
 
    if (!record) {
      throw new Error404();
    }
 
    record = await record.update(
      {
        dataProcessamento: record.dataProcessamento == null ? data.dataProcessamento : record.dataProcessamento,
        dataEnvio: record.dataEnvio == null ? data.dataEnvio : record.dataEnvio,
        dataEntrega: record.dataEntrega == null ? data.dataEntrega : record.dataEntrega,
        dataFaturamento: record.dataFaturamento == null ? data.dataFaturamento : record.dataFaturamento,
        status: data.status,
        updatedById: currentUser.id,
      },
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
 
    const currentTenant = SequelizeRepository.getCurrentTenant(
      options,
    );
 
    let record = await options.database.pedido.findOne(
      {
        where: {
          id,
          tenantId: currentTenant.id,
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
 
    let queryPedido =
      'SELECT p.id as `id`, p.codigo as `codigo`, p.quantidadeProdutos as `quantidadeProdutos`, p.formaPagamento `formaPagamento`, p.valorTotal as `valorTotal`,' +
      ' p.valorFrete as `valorFrete`, p.dataPedido as `dataPedido`, p.dataProcessamento as `dataProcessamento`, p.dataEnvio as `dataEnvio`,' +
      ' p.dataEntrega as `dataEntrega`, p.dataFaturamento as `dataFaturamento`, p.status as `status`,' +
      ' e.id as `empresa.id`, e.razaoSocial as `empresa.razaoSocial`, e.cnpj as `empresa.cnpj`' +
      `FROM pedidos p
 
    LEFT JOIN empresas e
    ON p.fornecedorEmpresaId = e.id
 
    WHERE p.id = '${id}';`;
 
    let record = await seq.query(queryPedido, {
      nest: true,
      type: QueryTypes.SELECT,
    });
 
    if (record.length == 0) {
      throw new Error404();
    }
 
    record = record[0];
 
    record.produtos = new Array();
 
    let queryProdutos =
      `SELECT id, quantidade, produtoId, precoUnitario, precoTotal
     FROM pedidoProdutos
     WHERE pedidoId = '${record.id}';`;
 
    let produtos = await seq.query(queryProdutos, {
      type: QueryTypes.SELECT,
    });
 
    produtos.forEach(e => {
      record.produtos.push(e);
    })
 
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
 
    const records = await options.database.pedido.findAll(
      {
        attributes: ['id'],
        where,
      },
    );
 
    return records.map((record) => record.id);
  }
 
  static async count(filter, options: IRepositoryOptions) {
 
    const tenant = SequelizeRepository.getCurrentTenant(
      options,
    );
 
    return options.database.pedido.count(
      {
        where: {
          ...filter,
          tenantId: tenant.id,
        },
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
        switch (filter.status) {
          case 'pendente':
            whereAnd.push({
              status: {
                [Op.in]: ['pendente', 'pago', 'enviado', 'recebido', 'transito']
              }
            });
            break;
 
          case 'devolvido':
            whereAnd.push({
              status: 'cancelado'
            })
            break;
 
          case 'confirmado':
            whereAnd.push({
              status: 'entregue'
            })
            break;
        }
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
 
    output.compradorUser = UserRepository.cleanupForRelationships(output.compradorUser);
 
    output.produto = await record.getProduto();
 
    return output;
  } */

}

export default PagamentoRepository;