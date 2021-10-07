import Error400 from '../errors/Error400';
import SequelizeRepository from '../database/repositories/sequelizeRepository';
import { IServiceOptions } from './IServiceOptions';
import PessoaFisicaRepository from '../database/repositories/pessoaFisicaRepository';
import UserRepository from '../database/repositories/userRepository';

export default class PessoaFisicaService {
  options: IServiceOptions;

  constructor(options) {
    this.options = options;
  }

  async create(data) {
    const transaction = await SequelizeRepository.createTransaction(
      this.options.database,
    );

    try {
      data.user = await UserRepository.filterIdInTenant(data.user, { ...this.options, transaction });

      const record = await PessoaFisicaRepository.create(data, {
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
        'pessoaFisica',
      );

      throw error;
    }
  }

  async createOrUpdate(data) {

    try {
      data.user = await UserRepository.filterIdInTenant(data.user, { ...this.options });

      const record = await PessoaFisicaRepository.createOrUpdate(data, {
        ...this.options,

      });

      await UserRepository.updateHasProfile({ ...this.options });

      return record;
    } catch (error) {
      SequelizeRepository.handleUniqueFieldError(
        error,
        this.options.language,
        'pessoaFisica',
      );

      throw error;
    }
  }

  async update(id, data) {
    const transaction = await SequelizeRepository.createTransaction(
      this.options.database,
    );

    try {
      data.user = await UserRepository.filterIdInTenant(data.user, { ...this.options, transaction });

      const record = await PessoaFisicaRepository.update(
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
        'pessoaFisica',
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
        await PessoaFisicaRepository.destroy(id, {
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
    return PessoaFisicaRepository.findById(id, this.options);
  }


  async findByCurrentId() {
    return PessoaFisicaRepository.findByCurrentId(this.options);
  }

  async findAllAutocomplete(search, limit) {
    return PessoaFisicaRepository.findAllAutocomplete(
      search,
      limit,
      this.options,
    );
  }

  async findAndCountAll(args) {
    return PessoaFisicaRepository.findAndCountAll(
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
    const count = await PessoaFisicaRepository.count(
      {
        importHash,
      },
      this.options,
    );

    return count > 0;
  }
}
