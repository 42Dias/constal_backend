import Error400 from '../errors/Error400';
import SequelizeRepository from '../database/repositories/sequelizeRepository';
import { IServiceOptions } from './IServiceOptions';
import ComentarioRepository from '../database/repositories/comentarioRepository';
import EmpresaRepository from '../database/repositories/empresaRepository';
import ProdutoRepository from '../database/repositories/produtoRepository';
import UserRepository from '../database/repositories/userRepository';


export default class PedidoService {
  options: IServiceOptions;

  constructor(options) {
    this.options = options;
  }

  async create(data) {
    try {
      const currentUser = SequelizeRepository.getCurrentUser(
        this.options,
      );
      data.compradorUserId = currentUser.id
      
      console.log(data)
      

      const comentario = await ComentarioRepository.create(data, {
        ...this.options,
      });

      return comentario;

    } catch (error) {

      SequelizeRepository.handleUniqueFieldError(
        error,
        this.options.language,
        'comentario',
      );

      throw error;
    }
  }

  async update(id, data) {

    try {
      console.log(data)
      console.log(id)
      const record = await ComentarioRepository.update(
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
        'comentario',
      );

      throw error;
    }
  }

  async findById(id) {
    return ComentarioRepository.findById(id, this.options);
  }

  async findByProduto(id) {
    return ComentarioRepository.findByProduto(id);
  }

  async findByEmpresa(id) {
    return ComentarioRepository.findByEmpresa(id);
  }


  async findAndCountAll(args) {
    return ComentarioRepository.findAndCountAll(
      args,
      this.options,
    );
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
  
}

