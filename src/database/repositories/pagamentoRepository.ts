import SequelizeRepository from './sequelizeRepository';
import AuditLogRepository from './auditLogRepository';
import lodash from 'lodash';
import SequelizeFilterUtils from '../utils/sequelizeFilterUtils';
import Error404 from '../../errors/Error404';
import Sequelize from 'sequelize'; import UserRepository from './userRepository';
import { IRepositoryOptions } from './IRepositoryOptions';
import { getConfig } from '../../config';
import highlight from 'cli-highlight';
import EmpresaRepository from './empresaRepository';
import { IServiceOptions } from '../../services/IServiceOptions';
const fetch = require("node-fetch");
const axios = require("axios").default;

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
/*

https://dev.iugu.com/docs/marketplace

*/
const moderadorIdIugu = 'B4CE264C2A374693B3E3E1F8E72D40E6'


const { QueryTypes } = require('sequelize');

//Token Usado na Fatura
// const API_TOKEN = 'A7C933D7B2F192D4DA24D134FF9640FD4CE73D7049284194CE962E7374A3EA37';   //* TESTE
const API_TOKEN = '9E22B79709D38A9C4CD229E480EBDDB363BC99F9182C8FD1BC49CECC0CAA44F8' //* PRODUÇÃO

/*
api_token deve ser o user_token da empresa

O split abaixo ira ser usado também
*/

class PagamentoRepository {

  options: IServiceOptions;

  constructor(options) {
    this.options = options;
  }

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
    console.log("--------------------")
    console.log("data")
    console.log(data)
    console.log("--------------------")



    if(pessoa.cpf){
      pessoa.cpf = pessoa.cpf.replace(/\.|-/g, '');
    }
    if(pessoa.cep){
      pessoa.cep = pessoa.cep.replace(/\.|-/g, '');
    }
    if(pessoa.celular){
      pessoa.celular = pessoa.celular.replace(/\+|\(|\)| |-/g, '');
    }

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
        ensure_workday_due_date: false,

        // splits: [{
        //   percent: 5,
        //   bank_slip_percent: 5,
        //   credit_card_percent: 5,
        //   pix_percent: 5,
        //   permit_aggregated: true,
        //   recipient_account_id: moderadorIdIugu
        // }],

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
        pedidoId: data.pedidoId,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      },
    );

    return record;
  }
  static async createNewFaturaWithSplits(data, options: IRepositoryOptions){
    /*
    "splits": [

          {
               "recipient_account_id": "aaa",
               "cents": 120
          },

          {
               "recipient_account_id": "bbbb",
               "cents": 150
          }
     ]
    */
    let splits:any[] = []
    let arrItems: any[] = []
  

    console.log(data)
     data.precoTotal;
    let precoPedido = 0;
    let precoConstal = 0;

    data.fornecedores.produtosNoCarinho.map( //aqui são normalizados os dados entre nosso banco de dados e o servidor dos dados além de gerar as faturas como descrito no comentário acima
      (dadoDoSplit) => {
        console.log("dadoDoSplit")
        console.log(dadoDoSplit)
        
        let newSplit = {
          "recipient_account_id": dadoDoSplit.empresa.user_token,
          "cents": ( dadoDoSplit.produto.preco * dadoDoSplit.quantidade * 100 ) * 0.95
        }
        precoConstal += (dadoDoSplit.produto.preco * dadoDoSplit.quantidade * 100) * 0.05;
        arrItems.push(dadoDoSplit.produto.nome)

        precoPedido += dadoDoSplit.produto.preco * dadoDoSplit.quantidade * 100

        console.log(newSplit)

        splits.push(newSplit)
      }
    )

    let newSplit1 = {
      "recipient_account_id": 'B95EDB287EE8390FF14FEA4A41491910',
      "cents": precoConstal
    }
    splits.push(newSplit1)
    console.log({"splits": splits})
    /*
     splits: [
    {
      recipient_account_id: '32931CDC346328EE79CCDCD61A004E92EA866FC6E1D2A5F9A4501254977183B8',
      cents: 9000
    }
  ]

    */
    console.log(splits)

    const currentUser = SequelizeRepository.getCurrentUser(
      options,
    );

    console.log("currentUser")
    console.log(currentUser)

    const pessoa = await options.database.pessoaFisica.findOne(
      {
        where: {
          userId: currentUser.id
        }
      }
    );

    if (!pessoa) {
      throw new Error404();
    }
    console.log(data)



    if(pessoa.cpf){
      pessoa.cpf = pessoa.cpf.replace(/\.|-/g, '');
    }
    if(pessoa.cep){
      pessoa.cep = pessoa.cep.replace(/\.|-/g, '');
    }
    if(pessoa.celular){
      pessoa.celular = pessoa.celular.replace(/\+|\(|\)| |-/g, '');
    }

    let dataVencimento = new Date();
    dataVencimento.setDate(dataVencimento.getDate() + 3);


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
//  url: 'https://api.iugu.com/v1/invoices?api_token=9E22B79709D38A9C4CD229E480EBDDB363BC99F9182C8FD1BC49CECC0CAA44F8',
    const url = `https://api.iugu.com/v1/invoices?api_token=${API_TOKEN}`;
    const opt = {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: 
        {
        //ensure_workday_due_date: true, //Garantir que a data da fatura caia em dia útil
        items: [
          ...arrItems
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
        ensure_workday_due_date: false,

        splits: splits,

        email: pessoa.email,
        due_date: dataVencimento
      }
    };
    console.log("Dados enviados")
    console.log(opt)
    /*
    {
      "items":["Sapato Social Infantil"],
      "payable_with":["all"],
      "payer":{
          "address":{
              "zip_code":"18540000",
              "street":"15151651",
              "number":16116511,
              "district":"industria",
              "city":"65156165165",
              "state":"15151651",
              "country":"brasil"
            },
            "name":"aaaaaaaa",
            "phone":"15996827652",
            "cpf_cnpj":"52939198810",
            "email":"ryan@email.com"
          },
          "ensure_workday_due_date":false,
          "splits":[
            {
              "recipient_account_id":"32931CDC346328EE79CCDCD61A004E92EA866FC6E1D2A5F9A4501254977183B8","cents":9000
            }
          ],
          "email":"ryan@email.com","due_date":"2022-01-23T11:09:54.810Z"
        }

    */

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
        pedidoId: data.pedidoId,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      },
    );

    return record;
  }

   static async update(id, data, options: IRepositoryOptions) {
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
 
    // output.produto = await record.getProduto();
 
    return output;
  } 
  static async createEmpresaIugu(empresa) {
    try{
      const options = {

        method: 'POST',
      
        url: `https://api.iugu.com/v1/marketplace/create_account?api_token=${API_TOKEN}`,
      
        headers: {Accept: 'application/json', 'Content-Type': 'application/json'},
      
        data: {
          name: empresa.nome
        }
      
      };
      
      
      return axios.request(options).then(function (response) {
      
        if(response.status == 200){
          return response.data;
        }
        else{
          throw new Error404();
        }
      
      }).catch(function (error) {
      
        return error;
        throw 'Verifique seus dados ou tente novamente MEU2 MEUU'
  
  
        
      });
    }
    catch (error) {

      throw error;
    }

   
  }
  static async configureEmpresaIugu(data, subcontaId, userToken){
    try{

      console.log(data)
    
      const options = {
  
        method: 'POST',
      
        url: `https://api.iugu.com/v1/accounts/${subcontaId}/request_verification?api_token=${userToken}`,
      
        headers: {Accept: 'application/json', 'Content-Type': 'application/json'},
      
        data: {
      
          data: {
      
            physical_products: false,
  
            
            // price_range: 'Entre R$ 0,00 e R$ 100000,00',
            price_range: 'Entre R$ 0,00 e R$ 100000,00',
            
  
            business_type: 'Vendas',
            // business_type: 'Descrição do negócio',
            
            // person_type: '\'Pessoa Física\' ou \'Pessoa Jurídica\'',
            person_type: 'Pessoa Jurídica',
            
            // automatic_transfer: true,
            automatic_transfer: true,
            
            company_name: data.nome,
  
            // cnpj: 'cnpj só numeros',
            // cnpj: data.cnpj? data.cnpj: empresaData.cnpj,
            cnpj: data.cnpj,
      
            // address: 'endereço',
            address: data.logradouro,
      
            // cep: 'cep',
            cep: data.cep,
      
            // city: 'cidade',
            city: data.cidade,
      
            // district: 'bairro',
            district: data.bairro,
      
            // state: 'estado',
            state: data.estado,
      
            // telephone: 'telefone',
            telephone: data.telefone.replace(/\+|\(|\)| |-/g, '') || data.celular.replace(/\+|\(|\)| |-/g, '') ,
      
            // bank: '\'Itaú\', \'Bradesco\', \'Caixa Econômica\', \'Banco do Brasil\', \'Santander\', \'Banrisul\', \'Sicredi\', \'Sicoob\', \'Inter\', \'BRB\', \'Via Credi\', \'Neon\', \'Votorantim\', \'Nubank\', \'Pagseguro\', \'Banco Original\', \'Safra\', \'Modal\', \'Banestes\',\'Unicred\',\'Money Plus\',\'Mercantil do Brasil\',\'JP Morgan\',\'Gerencianet Pagamentos do Brasil\', \'Banco C6\', \'BS2\', \'Banco Topazio\', \'Uniprime\', \'Stone\', \'Banco Daycoval\', \'Rendimento\', \'Banco do Nordeste\', \'Citibank\', \'PJBank\', \'Cooperativa Central de Credito Noroeste Brasileiro\', \'Uniprime Norte do Paraná\', \'Global SCM\', \'Next\', \'Cora\', \'Mercado Pago\', \'Banco da Amazonia\', \'BNP Paribas Brasil\', \'Juno\',\'Cresol\',\'BRL Trust DTVM\',\'Banco Banese\',\'Banco BTG Pactual\',\'Banco Omni\',\'Acesso Soluções de Pagamento\',\'CCR de São Miguel do Oeste\',\'Polocred\',\'Ótimo\',',
            
            bank:data.cartaoBanco,
      
            // bank_ag: 'Agência da Conta',
            bank_ag: data.cartaoAgencia,
      
            // bank_cc: 'Número da Conta'
            bank_cc: data.cartaoNumero,
      
            // account_type: 'Poupança' 'Corrente' , 
            account_type: data.cartaoTipo,
      
          }
      
        }
      
      };
      
      
      return axios.request(options).then(function (response) {
      
        console.log("response.data");
        console.log(response.data);
  
        if(response.status == 200 ){
          
  
          return response.data;
  
  
        }
        else{
          // throw new Error404("");
          throw 'Verifique seus dados ou tente novamente MEU'
        }
      
      })
      .catch( (error) => {
  
        console.log("error.response");
        console.log(error.response.data);
        console.error(error);
        throw 'Verifique seus dados ou tente novamente '
      });;

    }
    catch (error) {

      throw error;
    }
  }
}

export default PagamentoRepository;

/*
Cadastrar
*/
/*
{
  "account_id": "C12C41B504C94F47AC82FB22E3DC5CD4",
  "name": "Account #c12c41b5-04c9-4f47-ac82-fb22e3dc5cd4",
  "live_api_token": "DD4921D64B4E5F578F61F89092E4E8E766C21D10D23F3D8BB07342D2FBC5A0CB",
  "test_api_token": "C1847EAA3098E5E14E7442CBC0FC00E79DCCAFCC191E6A5B7BC1698D27512E32",
  "user_token": "BEF2AD51B58CC1F117E34AF3AFF86C82875E0D643724F9B32453B29ABB2C5EFF",
  "commissions": null
}
*/
/*
errors: {
    company_name: [ 'é obrigatório' ], --
    bank: [ 'não é válido' ],
    bank_ag: [ 'é obrigatório' ],
    account_type: [ 'não é válido' ]

*/

// D346EC6805F7058689D009576F63E11D0E9A9E2EF9C3473511121B2DCEC87AD6

/*
{

     "ensure_workday_due_date": false,

     "items": [

          {

               "description": "nome1",

               "quantity": 1,

               "price_cents": 1500

          },

          {

               "description": "nome2",

               "quantity": 2,

               "price_cents": 3000

          }

     ],

     "payer": {

          "address": {

               "number": "15",

               "zip_code": "18540000",

               "street": "Padre Bento",

               "district": "Bairro",

               "city": "Porto Feliz",

               "state": "SP",

               "country": "Brasil"

          },

          "cpf_cnpj": "52939198810",

          "name": "Ryan",

          "phone_prefix": "015",

          "phone": "996827652",

          "email": "ryan.r.c.339ac@gmail.com"

     },

     "email": "ryan.r.c.339ac@gmail.com",

     "due_date": "2022-02-02",

     "return_url": "http://constalshop.com.br/#/finalizar",

     "ignore_canceled_email": false

}
'
*/