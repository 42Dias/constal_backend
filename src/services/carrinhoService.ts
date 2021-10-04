import Error400 from '../errors/Error400';
import SequelizeRepository from '../database/repositories/sequelizeRepository';
import { IServiceOptions } from './IServiceOptions';
import CarrinhoRepository from '../database/repositories/carrinhoRepository';
import CarrinhoProdutoRepository from '../database/repositories/carrinhoProdutoRepository';
import ProdutoRepository from '../database/repositories/produtoRepository';
import UserRepository from '../database/repositories/userRepository';

export default class CarrinhoService {
  options: IServiceOptions;

  constructor(options) {
    this.options = options;
  }

  async create(data) {

    try {
      /* data.userId = await UserRepository.filterIdInTenant(data.userId, { ...this.options, transaction });
      data.produto = await ProdutoRepository.filterIdsInTenant(data.produto, { ...this.options, transaction }); */

      const carrinho = await CarrinhoRepository.create(data, {
        ...this.options,
      });

      data.carrinho = carrinho.id;

      const carrinhoProduto = await CarrinhoProdutoRepository.create(data, {
        ...this.options,
      });

      return carrinhoProduto;
    } catch (error) {

      SequelizeRepository.handleUniqueFieldError(
        error,
        this.options.language,
        'carrinho',
      );

      throw error;
    }
  }

  async update(id, data) {
    const transaction = await SequelizeRepository.createTransaction(
      this.options.database,
    );

    try {
      data.userId = await UserRepository.filterIdInTenant(data.userId, { ...this.options, transaction });
      data.produto = await ProdutoRepository.filterIdsInTenant(data.produto, { ...this.options, transaction });

      const record = await CarrinhoRepository.update(
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
        'carrinho',
      );

      throw error;
    }
  }

  async destroyAll(ids) {
    const transaction = await SequelizeRepository.createTransaction(
      this.options.database,
    );

    try {
      for (const id of ids) {
        await CarrinhoRepository.destroy(id, {
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

  async findById(id) {
    return CarrinhoRepository.findById(id, this.options);
  }

  async findAllAutocomplete(search, limit) {
    return CarrinhoRepository.findAllAutocomplete(
      search,
      limit,
      this.options,
    );
  }

  async findAndCountAll(args) {
    return CarrinhoRepository.findAndCountAll(
      args,
      this.options,
    );
  }

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
    const count = await CarrinhoRepository.count(
      {
        importHash,
      },
      this.options,
    );

    return count > 0;
  }
}
