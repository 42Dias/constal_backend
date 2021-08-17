import Error400 from '../errors/Error400';
import SequelizeRepository from '../database/repositories/sequelizeRepository';
import { IServiceOptions } from './IServiceOptions';
import PedidoRepository from '../database/repositories/pedidoRepository';
import EmpresaRepository from '../database/repositories/empresaRepository';
import ProdutoRepository from '../database/repositories/produtoRepository';
import UserRepository from '../database/repositories/userRepository';

export default class PedidoService {
  options: IServiceOptions;

  constructor(options) {
    this.options = options;
  }

  async create(data) {
    const transaction = await SequelizeRepository.createTransaction(
      this.options.database,
    );

    try {
      data.compradorUser = await UserRepository.filterIdInTenant(data.compradorUser, { ...this.options, transaction });
      data.fornecedorEmpresa = await EmpresaRepository.filterIdInTenant(data.fornecedorEmpresa, { ...this.options, transaction });
      data.produto = await ProdutoRepository.filterIdsInTenant(data.produto, { ...this.options, transaction });

      const record = await PedidoRepository.create(data, {
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
        'pedido',
      );

      throw error;
    }
  }

  async update(id, data) {
    const transaction = await SequelizeRepository.createTransaction(
      this.options.database,
    );

    try {
      data.compradorUser = await UserRepository.filterIdInTenant(data.compradorUser, { ...this.options, transaction });
      data.fornecedorEmpresa = await EmpresaRepository.filterIdInTenant(data.fornecedorEmpresa, { ...this.options, transaction });
      data.produto = await ProdutoRepository.filterIdsInTenant(data.produto, { ...this.options, transaction });

      const record = await PedidoRepository.update(
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

  async destroyAll(ids) {
    const transaction = await SequelizeRepository.createTransaction(
      this.options.database,
    );

    try {
      for (const id of ids) {
        await PedidoRepository.destroy(id, {
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
}
