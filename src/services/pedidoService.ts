import Error400 from '../errors/Error400';
import SequelizeRepository from '../database/repositories/sequelizeRepository';
import { IServiceOptions } from './IServiceOptions';
import PedidoRepository from '../database/repositories/pedidoRepository';
import EmpresaRepository from '../database/repositories/empresaRepository';
import ProdutoRepository from '../database/repositories/produtoRepository';
import UserRepository from '../database/repositories/userRepository';
import PedidoProdutoRepository from '../database/repositories/pedidoProdutoRepository';
import PagamentoRepository from '../database/repositories/pagamentoRepository';

export default class PedidoService {
  options: IServiceOptions;

  constructor(options) {
    this.options = options;
  }

  async create(data) {

    try {
      data.compradorUser = await UserRepository.filterIdInTenant(data.compradorUser, { ...this.options });
      data.fornecedorEmpresa = await EmpresaRepository.filterIdInTenant(data.fornecedorEmpresa, { ...this.options });
      data.produto = await ProdutoRepository.filterIdsInTenant(data.produto, { ...this.options }); 

      data.codigo = await PedidoRepository.findProximoCodigo();

      const pedido = await PedidoRepository.create(data, {
        ...this.options,
      });

      data.produtos.forEach(async e => {

        e.precoUnitario = await ProdutoRepository.findPrecoById(e.id);
        e.precoTotal = e.precoUnitario * e.quantidade;

        await PedidoProdutoRepository.create(pedido.id, e, {
          ...this.options,
        });
      });

      return pedido;

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
  
}
