import Error400 from '../errors/Error400';
import SequelizeRepository from '../database/repositories/sequelizeRepository';
import { IServiceOptions } from './IServiceOptions';
import BannersRepository from '../database/repositories/bannersRepository';
import CategoriaRepository from '../database/repositories/categoriaRepository';
import upload from '../api/file/localhost/upload';

export default class BannersService {
  options: IServiceOptions;

  constructor(options) {
    this.options = options;
  }

  async create(data) {
    const transaction = await SequelizeRepository.createTransaction(
      this.options.database,
    );

    console.log("data")
    console.log(data)

    try {

      const record = await BannersRepository.create(data, {
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
        'banners',
      );

      throw error;
    }
  }

  async update(id, data) {
    const transaction = await SequelizeRepository.createTransaction(
      this.options.database,
    );

    try {
      const record = await BannersRepository.update(
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
        'banners',
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
        await BannersRepository.destroy(id, {
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


  async destroyOne(id) {
    console.log("id")
    console.log(id)

    const transaction = await SequelizeRepository.createTransaction(
      this.options.database,
    );

    try {
      await BannersRepository.destroy(id, {
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

  async findById(id) {
    return BannersRepository.findById(id, this.options);
  }

  async findAllAutocomplete(search, limit) {
    return BannersRepository.findAllAutocomplete(
      search,
      limit,
      this.options,
    );
  }

  async findAndCountAll(args) {
    return BannersRepository.findAndCountAll(
      args,
      this.options,
    );
  }

  async findAllWithoutLogin() {
    return BannersRepository.findAllWithoutLogin();
  }
  async findAllWithoutLoginTrue() {
    return BannersRepository.findAllWithoutLoginTrue();
  }

  async findAllWithoutLoginAndTenant(args) {
    return BannersRepository.findAllWithoutLoginAndTenant(args);
  }
  
  async findLimitedWithoutLogin() {
    return BannersRepository.findLimitedWithoutLogin();
  }
  async findBannersbyId(id) {
    return BannersRepository.findBannersbyId(id);
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
    const count = await BannersRepository.count(
      {
        importHash,
      },
      this.options,
    );

    return count > 0;
  }
}
