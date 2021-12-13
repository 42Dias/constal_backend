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

    const transaction = await SequelizeRepository.createTransaction(
      this.options.database,
    );
    
    try {
      const userData = SequelizeRepository.getCurrentUser(
        this.options,
      );
      data.userId = userData.id;
  
      data.produto = await ProdutoRepository.filterIdsInTenant(data.product, { ...this.options, transaction }); 
      const carrinho = await CarrinhoRepository.create({
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
    
    console.log("================================")
    console.log(id)
    console.log("================================")
    
    console.log("*-*-*-*-**-***-*****-*-*-*-*-**-")
    console.log(data)
    console.log("*-*-*-*-**-***-*****-*-*-*-*-**-")


    try {
      /* data.userId = await UserRepository.filterIdInTenant(data.userId, { ...this.options, transaction });
      data.produto = await ProdutoRepository.filterIdsInTenant(data.produto, { ...this.options, transaction }); */

      const record = await CarrinhoProdutoRepository.update(
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
        'carrinho',
      );

      throw error;
    }
  }

  async destroyAll(ids) {
    try {
      for (const id of ids) {
        await CarrinhoProdutoRepository.destroy(id, {
          ...this.options,
        });
      }

    } catch (error) {

      throw error;
    }
  }

  async findById(id) {
    return CarrinhoProdutoRepository.findById(id, this.options);
  }

  async findAllAutocomplete(search, limit) {
    return CarrinhoRepository.findAllAutocomplete(
      search,
      limit,
      this.options,
    );
  }

  async findAndCountAll(args) {
    const carrinho = await CarrinhoRepository.create({
      ...this.options,
    });

    let carrinhoId = carrinho.id;

    if (!args.filter) {
      args.filter = [];
    }

    args.filter.carrinho = carrinhoId;

    return CarrinhoProdutoRepository.findAndCountAll(
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
