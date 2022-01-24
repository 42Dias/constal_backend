import Error400 from '../errors/Error400';
import SequelizeRepository from '../database/repositories/sequelizeRepository';
import { IServiceOptions } from './IServiceOptions';
import ProdutoRepository from '../database/repositories/produtoRepository';
import EmpresaRepository from '../database/repositories/empresaRepository';
import CategoriaRepository from '../database/repositories/categoriaRepository';
import upload from '../api/file/localhost/upload';

export default class ProdutoService {
  options: IServiceOptions;

  constructor(options) {
    this.options = options;
  }

  async create(data) {
    const transaction = await SequelizeRepository.createTransaction(
      this.options.database,
    );

    try {
      /*
      Quando for dar o get no produto deve-se ser passada o id da empresa
      onde ele é passado?
      localStorage?
      
      */

      const userData = SequelizeRepository.getCurrentUser(
        this.options,
      );
      data.empresa = await EmpresaRepository.findByUserId(userData.id, { ...this.options, transaction });
      data.categoria = await CategoriaRepository.filterIdInTenant(data.categoria, { ...this.options, transaction });

      const record = await ProdutoRepository.create(data, {
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
        'produto',
      );

      throw error;
    }
  }
  async produtoUpdateStatus(id, data) {
    await ProdutoRepository.produtoUpdateStatus(id, data);
  }
  async update(id, data) {
    const transaction = await SequelizeRepository.createTransaction(
      this.options.database,
    );

    try {
      data.empresa = await EmpresaRepository.filterIdInTenant(data.empresaId, { ...this.options, transaction });
      // const userData = SequelizeRepository.getCurrentUser(
      //   this.options,
      // );
      // data.empresaId = await EmpresaRepository.findByUserId(userData.id, { ...this.options, transaction });

      data.categoria = await CategoriaRepository.filterIdInTenant(data.categoria, { ...this.options, transaction });

      const record = await ProdutoRepository.update(
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
        'produto',
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
        await ProdutoRepository.destroy(id, {
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
      await ProdutoRepository.destroy(id, {
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
    return ProdutoRepository.findById(id, this.options);
  }

  async findAllAutocomplete(search, limit) {
    return ProdutoRepository.findAllAutocomplete(
      search,
      limit,
      this.options,
    );
  }

  async findAndCountAll(args) {
    return ProdutoRepository.findAndCountAll(
      args,
      this.options,
    );
  }

  async findAllWithoutLogin() {
    return ProdutoRepository.findAllWithoutLogin();
  }
  async findAllWithoutLoginTrue() {
    return ProdutoRepository.findAllWithoutLoginTrue();
  }

  async findAllWithoutLoginAndTenant(args) {
    return ProdutoRepository.findAllWithoutLoginAndTenant(args);
  }
  
  async findLimitedWithoutLogin() {
    return ProdutoRepository.findLimitedWithoutLogin();
  }
  async findProdutobyId(id) {
    return ProdutoRepository.findProdutobyId(id);
  }
  async listPromocionalImagem() {
    return ProdutoRepository.listPromocionalImagem();
  }

  async deleteProdutobyId(id) {
    return ProdutoRepository.deletePromocionalImagem(id);
  }

  async produtoAfterBuy(id, quantidade) {
    return ProdutoRepository.produtoAfterBuy(id, quantidade);
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
    const count = await ProdutoRepository.count(
      {
        importHash,
      },
      this.options,
    );

    return count > 0;
  }
  async updateAllDatabaseOfPagementos(){
    return ProdutoRepository.updateAllDatabaseOfPagementos();
  }
  async updateAllIsOferta(){
    return ProdutoRepository.updateAllIsOferta();
  }

}
