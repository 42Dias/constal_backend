import CarrinhoProdutoRepository from '../database/repositories/carrinhoProdutoRepository';
import Error400 from '../errors/Error400';
import SequelizeRepository from '../database/repositories/sequelizeRepository';
import { IServiceOptions } from './IServiceOptions';

/**
 * Handles Carrinho operations
 */
export default class CarrinhoProdutoService {
  options: IServiceOptions;

  constructor(options) {
    this.options = options;
  }

  /**
   * Creates a Carrinho Produto.
   *
   * @param {*} data
   */
  async create(data) {
    const transaction = await SequelizeRepository.createTransaction(
      this.options.database,
    );

    try {
      const record = await CarrinhoProdutoRepository.create(data, {
        ...this.options,
        transaction,
      });

      await SequelizeRepository.commitTransaction(
        transaction,
      );

      return record;
    } catch (error) {
      await SequelizeRepository.rollbackTransaction(
        transaction,
      );

      SequelizeRepository.handleUniqueFieldError(
        error,
        this.options.language,
        'carrinhoProduto',
      );

      throw error;
    }
  }

  /**
   * Updates a Carrinho.
   *
   * @param {*} id
   * @param {*} data
   */
  async update(id, data) {
    console.log("+++++++++++++++++++++++++++++++")
    console.log("id")
    console.log(id)
    console.log("+++++++++++++++++++++++++++++++")

    console.log("==============================")
    console.log("data")
    console.log( data)
    console.log("==============================")




    const transaction = await SequelizeRepository.createTransaction(
      this.options.database,
    );

    try {
      const record = await CarrinhoProdutoRepository.update(
        id,
        data,
        {
          ...this.options,
          transaction,
        },
      );

      await SequelizeRepository.commitTransaction(
        transaction,
      );

      return record;
    } catch (error) {
      await SequelizeRepository.rollbackTransaction(
        transaction,
      );

      SequelizeRepository.handleUniqueFieldError(
        error,
        this.options.language,
        'carrinhoProduto',
      );

      throw error;
    }
  }

  /**
   * Destroy all Carrinhos with those ids.
   *
   * @param {*} ids
   */
  async destroyAll(ids) {

    console.log("===ids===")
    console.log(ids)
    console.log("===ids===")

    const transaction = await SequelizeRepository.createTransaction(
      this.options.database,
    );

    try {
      for (const id of ids) {
        
        console.log("===id===")        
        console.log(id)
        console.log("===id===")
        

        await CarrinhoProdutoRepository.destroy(id, {
          ...this.options,
          transaction,
        });
      }

      await SequelizeRepository.commitTransaction(
        transaction,
      );
    } catch (error) {
      await SequelizeRepository.rollbackTransaction(
        transaction,
      );
      throw error;
    }
  }

  async destroy(id) {
    const transaction = await SequelizeRepository.createTransaction(
      this.options.database,
    );

    try {

      await CarrinhoProdutoRepository.destroy(id, {
        ...this.options,
        transaction,
      });

      await SequelizeRepository.commitTransaction(
        transaction,
      );
    } catch (error) {
      await SequelizeRepository.rollbackTransaction(
        transaction,
      );
      throw error;
    }
  }

  async destroyByEmpresa(id) {
    console.log("await CarrinhoProdutoRepository.destroyByEmpresa")
    /*const transaction = await SequelizeRepository.createTransaction(
      this.options.database,
    );

    try {
      await CarrinhoProdutoRepository.destroyByEmpresa(id, {
       ...this.options,
       transaction,
      });

      await SequelizeRepository.commitTransaction(
        transaction,
      );
    } catch (error) {
      await SequelizeRepository.rollbackTransaction(
        transaction,
      );
      throw error;
    }*/
  }
 
  findByBusca(busca, tipo) {
    console.log("CarrinhoProdutoRepository.findByBusca")
    //return CarrinhoProdutoRepository.findByBusca(busca, tipo, this.options);
  }

  /* async findQuantidadeByProdutoId(produtoId) {
    return CarrinhoProdutoRepository.findQuantidadeByProdutoId(produtoId, this.options);
  } */

  /**
   * Finds Carrinhos for Autocomplete.
   *
   * @param {*} search
   * @param {*} limit
   */
  /* async findAllAutocomplete(search, limit) {
    return CarrinhoRepository.findAllAutocomplete(
      search,
      limit,
      this.options,
    );
  } */

  /**
   * Finds Carrinhos based on the query.
   *
   * @param {*} args
   */
  async findAndCountAll(args) {
    return CarrinhoProdutoRepository.findAndCountAll(
      args,
      this.options,
    );
  }

}