import Error400 from '../errors/Error400';
import SequelizeRepository from '../database/repositories/sequelizeRepository';
import { IServiceOptions } from './IServiceOptions';
import PedidoRepository from '../database/repositories/pedidoRepository';
import EmpresaRepository from '../database/repositories/empresaRepository';
import ProdutoRepository from '../database/repositories/produtoRepository';
import UserRepository from '../database/repositories/userRepository';
import PedidoProdutoRepository from '../database/repositories/pedidoProdutoRepository';
import PagamentoRepository from '../database/repositories/pagamentoRepository';
import { databaseInit } from '../database/databaseConnection';
import { ConfigurationServicePlaceholders } from 'aws-sdk/lib/config_service_placeholders';

export default class PedidoService {
  options: IServiceOptions;

  constructor(options) {
    this.options = options;
  }

  async create(data) {
    /*
    fornecedorEmpresa
    Produto
    Produtos
    código
    
    */
    try {
      console.log("----------------")
      console.log("data")
      console.log(data)
      console.log("----------------")
      // // data.compradorUser = await UserRepository.filterIdInTenant(data.compradorUser, { ...this.options });
      // data.fornecedorEmpresa = await EmpresaRepository.filterIdInTenant(data.fornecedorEmpresa, { ...this.options });//espera receber direto o fornecedor na req
      // const currentUser = SequelizeRepository.getCurrentUser(
      //   this.options,
      // );
      // data.compradorUserId = currentUser.id
      // // data.produto = await ProdutoRepository.filterIdsInTenant(data.produto, { ...this.options });  
      // console.log(data.produto)
      // data.codigo = await PedidoRepository.findProximoCodigo();

      // const pedido = await PedidoRepository.create(data, {
      //   ...this.options,
      // });

      // data.produtos.forEach(async e => {

      //   e.precoUnitario = await ProdutoRepository.findPrecoById(e.id);
      //   e.precoTotal = e.precoUnitario * e.quantidade;

      //   await PedidoProdutoRepository.create(pedido.id, e, {
      //     ...this.options,
      //   });
      // });
      
      /*
      PARA CADA PRODUTO UM PEDIDO

      */

      // data.compradorUser = await UserRepository.filterIdInTenant(data.compradorUser, { ...this.options });
      // data.fornecedorEmpresa = await EmpresaRepository.filterIdInTenant(data.fornecedorEmpresa, { ...this.options });//espera receber direto o fornecedor na req
      data.fornecedorEmpresa = data.fornecedorId;//espera receber direto o fornecedor na req
    
      const currentUser = SequelizeRepository.getCurrentUser(
        this.options,
      );
      data.compradorUserId = currentUser.id
      // data.produto = await ProdutoRepository.filterIdsInTenant(data.produto, { ...this.options });  
      console.log("data.produto")
      console.log(data.produtos)
      //cria o código sozinho
      data.codigo = await PedidoRepository.findProximoCodigo();

      const pedido = await PedidoRepository.create(data, {
        ...this.options,
      });

      console.log("*-*-*-*-*-*-**-*-*-*-*-*-*-*-*-*-*-**")
      console.log("pedido")
      console.log(pedido) 
      console.log("*-*-*-*-*-*-**-*-*-*-*-*-*-*-*-*-*-**")

      await data.produtos.forEach(
         async e => {
          console.log(e)
          e.precoUnitario = await ProdutoRepository.findPrecoById(e.produto.id);
          e.precoTotal = e.precoUnitario * e.quantidade;
  
          await PedidoProdutoRepository.create(pedido.id, e, {
            ...this.options,
                  });

      });

      console.log("data.produtos")
      console.log(data.produtos)

      return await pedido;

    } catch (error) {

      SequelizeRepository.handleUniqueFieldError(
        error,
        this.options.language,
        'pedido',
      );

      throw error;
    }
  }

  async geraFatura(id) {

    try {
      const pedido = await PedidoRepository.findById(id, this.options);
      /*
      deveria ter o campo de forma de pagamento
      */

      pedido.pedidoId = id
      
      let fatura = await PagamentoRepository.create(pedido, {
        ... this.options
      });

      return fatura;

    } catch (error) {

      SequelizeRepository.handleUniqueFieldError(
        error,
        this.options.language,
        'pedido',
      );

      throw error;
    }
  }

  async geraNewFatura(data) {

    try { //Pega os ids das empresas cadastradas no nosso bancos de dados e através desses dados é passado o dinheiro a ser pago
      data.fornecedores.produtosNoCarinho.map(
        async (fornecedorObjeto) => {
          console.log(fornecedorObjeto.fornecedorId)
          fornecedorObjeto.empresa = await EmpresaRepository.findIdBySQL(fornecedorObjeto.fornecedorId);
    
          console.log(fornecedorObjeto)
        }
      )
      setTimeout(
        async () => {
          let fatura = await PagamentoRepository.createNewFaturaWithSplits(data, {
            ... this.options
          });
          return fatura;

        }, 5000
      )

        

      
    } catch (error) {

      SequelizeRepository.handleUniqueFieldError(
        error,
        this.options.language,
        'pedido',
      );

      throw error;
    }
    
  }

  async update(id, data) {

    try {
      data.compradorUser = await UserRepository.filterIdInTenant(data.compradorUser, { ...this.options });
      data.fornecedorEmpresa = await EmpresaRepository.filterIdInTenant(data.fornecedorEmpresa, { ...this.options });
      data.produto = await ProdutoRepository.filterIdsInTenant(data.produto, { ...this.options });

      const record = await PedidoRepository.update(
        id,
        data,
        {
          ...this.options,
        },
      );

      return record;
    } catch (error) {

      SequelizeRepository.handleUniqueFieldError(
        error,
        this.options.language,
        'pedido',
      );

      throw error;
    }
  }

  async destroyAll(ids) {

    try {
      for (const id of ids) {
        await PedidoRepository.destroy(id, {
          ...this.options,
        });
      }

    } catch (error) {

      throw error;
    }
  }

  async findById(id) {
    return PedidoRepository.findById(id, this.options);
  }

  async findAllAutocomplete(search, limit) {
    return PedidoRepository.findAllAutocomplete(
      search,
      limit,
      this.options,
    );
  }

  async findAndCountAll(args) {
    return PedidoRepository.findAndCountAll(
      args,
      this.options,
    );
  }

  // async listFaturas(args) {
  //   let fatura = await PagamentoRepository.findAndCountAll(args, {
  //     ... this.options
  //   });
  //   return fatura.rows
  // }

  async import(data, importHash) {
    if (!importHash) {
      throw new Error400(
        this.options.language,
        'importer.errors.importHashRequired',
      );
    }

    if (await this._isImportHashExistent(importHash)) {
      throw new Error400(
        this.options.language,
        'importer.errors.importHashExistent',
      );
    }

    const dataToCreate = {
      ...data,
      importHash,
    };

    return this.create(dataToCreate);
  }

  async _isImportHashExistent(importHash) {
    const count = await PedidoRepository.count(
      {
        importHash,
      },
      this.options,
    );

    return count > 0;
  }

  async findPedidoWithProduct(args) {
    console.log(args)
    return PedidoRepository.findPedidoWithProduct(this.options);
  }


  async findPedidoWithProductToEmpresa(userId, args) {
    
    if(args.filter && args.filter.role){      
      return  PedidoRepository.findPedidoWithProductToEmpresa(args.filter.role, args);
    }
    else{
      console.log("----------------")
      
      const empresa = await EmpresaRepository.findByUserId(userId, this.options);
  
  
      console.log('empresa.id')
      console.log(empresa.id)
      
      return PedidoRepository.findPedidoWithProductToEmpresa(empresa.id, args);
    }
    
  }
  async listFaturas(args){
    if(args.filter){
      console.log("args dentro do if")
      console.log(args.filter.id)
      let empresa = await  await EmpresaRepository.findByUserId(args.filter.id, this.options);
      console.log(empresa)
      args.filter.empresaId = empresa.id


    }


    return PedidoRepository.listFaturas(args)
  }
}


// import Error400 from '../errors/Error400';
// import SequelizeRepository from '../database/repositories/sequelizeRepository';
// import { IServiceOptions } from './IServiceOptions';
// import PedidoRepository from '../database/repositories/pedidoRepository';
// import EmpresaRepository from '../database/repositories/empresaRepository';
// import ProdutoRepository from '../database/repositories/produtoRepository';
// import UserRepository from '../database/repositories/userRepository';
// import PedidoProdutoRepository from '../database/repositories/pedidoProdutoRepository';
// import PagamentoRepository from '../database/repositories/pagamentoRepository';

// export default class PedidoService {
//   options: IServiceOptions;

//   constructor(options) {
//     this.options = options;
//   }

//   async create(data) {
//     console.log("==============")
//     console.log("data")
//     console.log(data)
//     console.log("==============")

//     try {
//       //pegar de forma igual a outros, pelo options e pelo back
//       const currentUser = SequelizeRepository.getCurrentUser(
//         this.options,
//       );
//       console.log(currentUser)
//       data.compradorUserId = currentUser.id

//       const fornecedorEmpresaId = await ProdutoRepository.filterIdsInTenantGettingFornecedor(data.produto.id, { ...this.options }); 
//       //vincular o fornecedorEmpresa pelo productId
       
//       console.log("------------")
//       console.log("data depois do fornecedor e do produto")
//       console.log(data)
//       console.log("------------")

//       //data.produto = await ProdutoRepository.filterIdsInTenant(data.produto.id, { ...this.options });
      
      
//       console.log("==========")
//       console.log("fornecedorEmpresaId")
//       console.log(fornecedorEmpresaId)
//       console.log("==========")

//       //data.fornecedorEmpresa = await EmpresaRepository.filterIdInTenant(data.fornecedorEmpresa, { ...this.options });
//       data.fornecedorEmpresa = await EmpresaRepository.filterIdInTenant(fornecedorEmpresaId, { ...this.options });

//       data.codigo = await PedidoRepository.findProximoCodigo();

//       const pedido = await PedidoRepository.create(data, {
//         ...this.options,
//       });

//       data.produtos.forEach(async e => {

//         e.precoUnitario = await ProdutoRepository.findPrecoById(e.id);
//         e.precoTotal = e.precoUnitario * e.quantidade;

//         //depois de criar o pedido é criado o pedido produto, 
//         // provavlemente necessário o pedidoProduto para a criação da fatura
//         await PedidoProdutoRepository.create(pedido.id, e, {
//           ...this.options,
//         });
//       });

//       return pedido;

//     } catch (error) {

//       SequelizeRepository.handleUniqueFieldError(
//         error,
//         this.options.language,
//         'pedido',
//       );

//       throw error;
//     }
//   }

//   async geraFatura(id) {

//     try {
//       const pedido = await PedidoRepository.findById(id, this.options);
//       let fatura = await PagamentoRepository.create(pedido, {
//         ... this.options
//       });

//       return fatura;

//     } catch (error) {

//       SequelizeRepository.handleUniqueFieldError(
//         error,
//         this.options.language,
//         'pedido',
//       );

//       throw error;
//     }
//   }

//   async update(id, data) {
//     try {
//       data.compradorUser = await UserRepository.filterIdInTenant(data.compradorUser, { ...this.options });
//       data.fornecedorEmpresa = await EmpresaRepository.filterIdInTenant(data.fornecedorEmpresa, { ...this.options });
//       data.produto = await ProdutoRepository.filterIdsInTenant(data.produto, { ...this.options });

//       const record = await PedidoRepository.update(
//         id,
//         data,
//         {
//           ...this.options,
//         },
//       );

//       return record;
//     } catch (error) {

//       SequelizeRepository.handleUniqueFieldError(
//         error,
//         this.options.language,
//         'pedido',
//       );

//       throw error;
//     }
//   }

//   async destroyAll(ids) {

//     try {
//       for (const id of ids) {
//         await PedidoRepository.destroy(id, {
//           ...this.options,
//         });
//       }

//     } catch (error) {

//       throw error;
//     }
//   }

//   async findById(id) {
//     return PedidoRepository.findById(id, this.options);
//   }

//   async findAllAutocomplete(search, limit) {
//     return PedidoRepository.findAllAutocomplete(
//       search,
//       limit,
//       this.options,
//     );
//   }

//   async findAndCountAll(args) {
//     return PedidoRepository.findAndCountAll(
//       args,
//       this.options,
//     );
//   }

//   async import(data, importHash) {
//     if (!importHash) {
//       throw new Error400(
//         this.options.language,
//         'importer.errors.importHashRequired',
//       );
//     }

//     if (await this._isImportHashExistent(importHash)) {
//       throw new Error400(
//         this.options.language,
//         'importer.errors.importHashExistent',
//       );
//     }

//     const dataToCreate = {
//       ...data,
//       importHash,
//     };

//     return this.create(dataToCreate);
//   }

//   async _isImportHashExistent(importHash) {
//     const count = await PedidoRepository.count(
//       {
//         importHash,
//       },
//       this.options,
//     );

//     return count > 0;
//   }

//   async findPedidoWithProduct(args) {
//     console.log(args)
//     return PedidoRepository.findPedidoWithProduct(this.options);
//   }
  
// }
