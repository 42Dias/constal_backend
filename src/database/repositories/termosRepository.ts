import SequelizeRepository from './sequelizeRepository';
import AuditLogRepository from './auditLogRepository';
import lodash from 'lodash';
import SequelizeFilterUtils from '../utils/sequelizeFilterUtils';
import Error404 from '../../errors/Error404';
import Sequelize from 'sequelize'; import FileRepository from './fileRepository';
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
class termosRepository {

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
    try {
      console.log("data do repo")
      console.log( data )


      const record = await options.database.termo.create(
        {
          ...lodash.pick(data, [
            "url",
            "nome",
            "ativo"
          ]), 
          tenantId: tenant.id,
          createdById: currentUser.id,
          updatedById: currentUser.id,
        },
        {
          transaction,
        },
      );
      
      console.log('record')
      console.log(record)

      await FileRepository.replaceRelationFiles(
        {
          belongsTo: options.database.termo.getTableName(),
          belongsToColumn: 'fotos',
          belongsToId: record.id,
        },
        data.fotos,
        options,
      );

      await this._createAuditLog(
        AuditLogRepository.CREATE,
        record,
        data,
        options,
      );

      console.log(record)

      return this.findById(record.id, options);
    }
    catch (e) {
      console.log(e)
    }
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

    let record = await options.database.termo.findOne(
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
          "url",
          "nome",
          "ativo"
        ]),  
        createdById: currentUser.id,
        updatedById: currentUser.id,
      },
      {
        transaction,
      },
    );

    console.log(data.fotos)

    await FileRepository.replaceRelationFiles(
      {
        belongsTo: options.database.termo.getTableName(),
        belongsToColumn: 'fotos',
        belongsToId: record.id,
      },
      data.fotos,
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

    let record = await options.database.termo.findOne(
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
    ];

    const currentTenant = SequelizeRepository.getCurrentTenant(
      options,
    );

    const record = await options.database.termo.findOne(
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

    const records = await options.database.termo.findAll(
      {
        attributes: ['id'],
        where,
      },
    );

    return records.map((record) => record.id);
  }

  static async filterIdsInTenantGettingFornecedor(
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

    const records = await options.database.termo.findAll(
      {
        attributes: ['id'],
        where,
      },
    );

    return records.map((record) => record.empresaId);
  }

  static async count(filter, options: IRepositoryOptions) {
    const transaction = SequelizeRepository.getTransaction(
      options,
    );

    const tenant = SequelizeRepository.getCurrentTenant(
      options,
    );

    return options.database.termo.count(
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


    console.log("--------------")
    console.log("filter")
    console.log(filter)
    console.log("--------------")


    let whereAnd: Array<any> = [];
    let include = [
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

      if (filter.nome) {
        whereAnd.push(
          SequelizeFilterUtils.ilikeIncludes(
            'termo',
            'nome',
            filter.nome,
          ),
        );
      }

      if (filter.status) {
        whereAnd.push(
          SequelizeFilterUtils.ilikeIncludes(
            'termo',
            'status',
            filter.status,
          ),
        );
      }


      if (
        filter.isOferta === true ||
        filter.isOferta === 'true' ||
        filter.isOferta === false ||
        filter.isOferta === 'false'
      ) {
        whereAnd.push({
          isOferta: filter.isOferta
        });
      }
      if (filter.status) {
        whereAnd.push({
          status: filter.status
        });
      }

      if (filter.precoOfertaRange) {
        const [start, end] = filter.precoOfertaRange;

        if (start !== undefined && start !== null && start !== '') {
          whereAnd.push({
            precoOferta: {
              [Op.gte]: start,
            },
          });
        }

        if (end !== undefined && end !== null && end !== '') {
          whereAnd.push({
            precoOferta: {
              [Op.lte]: end,
            },
          });
        }
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
    } = await options.database.termo.findAndCountAll({
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

    count = rows.length
    return { rows, count };
  }

  static async findAllWithoutLogin() {

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
      p.*
      FROM
          termo p
      WHERE
          p.status = 'ativo'
	        and deletedAt is null
          GROUP BY p.id
          ORDER BY p.createdAt DESC;`
      ,
      {
        nest: true,
        type: QueryTypes.SELECT,
      }
    );

    // console.log(record)
    return { record };
  }
  static async findAllWithoutLoginTrue() {

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
    let where = ''

    // console.log(filter)
    // console.log(filter.filter.categoria)

    // if(filter.filter.categoria){
    //   console.log("filter")
    //   where = `and p.categoriaId = '${filter.filter.categoria}' `
    // }
    
    let record = await seq.query(
      `SELECT 
      p.*
      FROM
          termos p
      WHERE
          p.ativo = 'ativo'
          ${where}
      ORDER BY p.createdAt DESC
      ;
      `
      ,
      {
        nest: true,
        type: QueryTypes.SELECT,
      }
    );

    // console.log(record)
    return { record };
  }

  static async findAllWithoutLoginAndTenant(filter) {

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
    let where = ''

    console.log(filter)
    console.log(filter.filter.categoria)

    if(filter.filter.categoria){
      console.log("filter")
      where = `and p.categoriaId = '${filter.filter.categoria}' `
    }
    if(filter.filter.id){
      console.log("id")
      where = `and p.id = '${filter.filter.id}' `
    }
    
    let record = await seq.query(
      `SELECT 
      p.*
      FROM
          termos p
      WHERE
          p.status = 'aprovado'
          ${where}
      GROUP BY p.id
      ORDER BY p.createdAt DESC
      ;
      `
      ,
      {
        nest: true,
        type: QueryTypes.SELECT,
      }
    );

    // console.log(record)
    return { record };
  }

  
  static async findLimitedWithoutLogin() {

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
        p.*, f.publicUrl
        FROM
            termos p
                INNER JOIN
            files f ON f.belongsToId = p.id
        WHERE isOferta = 0
        ORDER BY createdAt DESC
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
              'termo',
              'nome',
              query,
            ),
          },
        ],
      });
    }

    const where = { [Op.and]: whereAnd };

    const records = await options.database.termo.findAll(
      {
        attributes: ['id', 'nome'],
        where,
        limit: limit ? Number(limit) : undefined,
        order: [['nome', 'ASC']],
      },
    );

    return records.map((record) => ({
      id: record.id,
      label: record.nome,
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
        fotos: data.fotos,
      };
    }

    await AuditLogRepository.log(
      {
        entityName: 'termo',
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

    // output.fotos = await FileRepository.fillDownloadUrl(
    //   await record.getFotos({
    //     transaction,
    //   }),
    // );

    return output;
  }

  static async findPrecoById(id) {

    let query =
      'SELECT IFNULL(p.precoOferta, p.preco) AS `preco`' +
      ` FROM termos p

        WHERE p.id = '${id}';`;

    let record = await seq.query(query, {
      type: QueryTypes.SELECT,
    });

    if (!record) {
      throw new Error404();
    }

    return record[0].preco;
  }

  static async findtermobyId(id: number) {

    let query =
      `SELECT 
    p.*, f.publicUrl
    FROM
        termos p
            LEFT JOIN
        files f ON f.belongsToId = p.id
        where p.useId = '${id}';`;

    let record = await seq.query(query, {
      type: QueryTypes.SELECT,
    });

    if (!record) {
      throw new Error404();
    }

    return record;
  }

  static async listPromocionalImagem() {

    let query =
      `select distinct imagemPromocional, promocaoId from termos  where imagemPromocional is not null;`;

    let record = await seq.query(query, {
      type: QueryTypes.SELECT,
    });

    if (!record) {
      throw new Error404();
    }

    return record;
  }
  static async termoUpdateStatus(id, data) {

    let query =
      ` UPDATE termos p
      SET p.status = '${data.status}'
      WHERE p.id = '${id}';`;

    let record = await seq.query(query);

    if (!record) {
      throw new Error404();
    }

    return record;
  }
  static async updateAllDatabaseOfPagementos(){
    
    const sdk = require('api')('@iugu-dev/v1.0#d6ie79kw6g1afm');


    let query =
      `SELECT
      *
      FROM 
      pagamentos`;

      let record = await seq.query(query, {
        type: QueryTypes.SELECT,
      });

    if (!record) {
      throw new Error404();
    }
    
    //Token Usado na Fatura
    const API_TOKEN = 'A7C933D7B2F192D4DA24D134FF9640FD4CE73D7049284194CE962E7374A3EA37';   //* TESTE
    // const API_TOKEN = '9E22B79709D38A9C4CD229E480EBDDB363BC99F9182C8FD1BC49CECC0CAA44F8' //* PRODUÇÃO



    const pagamentos = await record
    
    const axios = require("axios").default;

    pagamentos.map(
      (pagamento => {

        if(pagamento.status == 'pendente'){
          const options = {
          
            method: 'GET',
          
            url: `https://api.iugu.com/v1/invoices/${pagamento.idIugu}?api_token=${API_TOKEN}`,
          
            headers: {Accept: 'application/json'}
          
          };
          
          
          axios.request(options).then(async function (response) {
          
  
  
              if(response.data.status == 'paid'){
  

                let rows = await seq.query(
                  `
                  UPDATE pagamentos p
                  SET p.status = 'pago'
                  WHERE p.idIugu = '${response.data.id}';
                  `
                )

                let query =
                `SELECT
                  p.pedidoId
                  FROM pagamentos p
                    WHERE p.idIugu = '${response.data.id}';
                `;
            
                let record = await seq.query(query, {
                  type: QueryTypes.SELECT,
                }).then(
                  async (record) => {

                    //[ { pedidoId: 'dcbc4724-6bf8-44fa-aad4-c5bff3e3437e' } ]

                    let newquery =
                    `UPDATE pedidos p
                      SET p.status = 'pago'
                        WHERE p.id = '${record[0].pedidoId}';;
                    `;
                
                    let newrecord = await seq.query(newquery, {
                      type: QueryTypes.SELECT,
                    })
    
                    console.log("newrecord")
                    console.log(newrecord)

                  }
                )
                  
                  
                

                console.log(rows)
              }
              else{
                console.log("passa")
              }
          
                  })
                  .catch(function (error) {
                  
                    console.error(error);
                  
                  });
        }
        
        
              }
              )
              )
              return 
    // return record;
  }
  static async updateAllIsOferta(){
    let nowDate = new Date();
    console.log(nowDate)
    let query =
    `SELECT
    *
    FROM 
    termos`;

    let record = await seq.query(query, {
      type: QueryTypes.SELECT,
    });

    record.map(
      async (termos) =>{
        if(termos.isOferta){
          console.log(
            nowDate >= termos.promocaoEncerramento
          )
          if(nowDate >= termos.promocaoEncerramento){
            let rows = await seq.query(
              `
              UPDATE termos p
              SET p.isOferta = 0,
              p.imagemPromocional = null,
              p.promocaoEncerramento = null,
              p.promocaoCriacao = null,
              p.promocaoId = null
              
              WHERE p.id = '${termos.id}';
              `
            );
            console.log(rows)
   
          }
        }
      }
    )
  }

  static async loadImage(filter) {

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
    let where = ''

    console.log(filter)
    console.log(filter.filter.categoria)

    if(filter.filter.categoria){
      console.log("filter")
      where = `and p.categoriaId = '${filter.filter.categoria}' `
    }
    if(filter.filter.id){
      console.log("id")
      where = `and p.id = '${filter.filter.id}' `
    }
    
    let record = await seq.query(
      `SELECT 
      p.*
      FROM
          termos p
      WHERE
          p.status = 'aprovado'
          ${where}
      GROUP BY p.id
      ORDER BY p.createdAt DESC
      ;
      `
      ,
      {
        nest: true,
        type: QueryTypes.SELECT,
      }
    );

    // console.log(record)
    return { record };
  }
}




export default termosRepository;
