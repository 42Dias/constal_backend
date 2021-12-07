import Error400 from '../errors/Error400';
import SequelizeRepository from '../database/repositories/sequelizeRepository';
import { IServiceOptions } from './IServiceOptions';
import PedidoProdutoRepository from '../database/repositories/pedidoProdutoRepository';

/**
 * Handles Pedido operations
 */
export default class PedidoProdutoService {

  options: IServiceOptions;

  constructor(options) {
    this.options = options;
  }

  /**
   * Creates a Pedido.
   *
   * @param {*} data
   */
  async create(data) {
    const transaction = await SequelizeRepository.createTransaction(
      this.options.database,
    );

    try {
      const record = await PedidoProdutoRepository.create(data, transaction, {
        ...this.options,
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
        'pedido',
      );

      throw error;
    }
  }

  /**
   * Updates a Pedido.
   *
   * @param {*} id
   * @param {*} data
   */
  async update(id, data) {
    const transaction = await SequelizeRepository.createTransaction(
      this.options.database,
    );

    try {
      const record = await PedidoProdutoRepository.update(
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
        'pedido',
      );

      throw error;
    }
  }

  /**
   * Destroy all Pedidos with those ids.
   *
   * @param {*} ids
   */
  async destroyAll(ids) {
    const transaction = await SequelizeRepository.createTransaction(
      this.options.database,
    );

    try {
      for (const id of ids) {
        await PedidoProdutoRepository.destroy(id, {
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

  /**
   * Finds the Pedido by Id.
   *
   * @param {*} id
   */
  async findById(id) {
    return PedidoProdutoRepository.findById(id, this.options);
  }

  /**
   * Finds Pedidos for Autocomplete.
   *
   * @param {*} search
   * @param {*} limit
   */
  async findAllAutocomplete(search, limit) {
    return PedidoProdutoRepository.findAllAutocomplete(
      search,
      limit,
      this.options,
    );
  }

  /**
   * Finds Pedidos based on the query.
   *
   * @param {*} args
   */
  async findAndCountAll(args) {
    return PedidoProdutoRepository.findAndCountAll(
      args,
      this.options,
    );
  }

}