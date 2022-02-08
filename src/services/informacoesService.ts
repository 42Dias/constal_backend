import Error400 from '../errors/Error400';
import SequelizeRepository from '../database/repositories/sequelizeRepository';
import { IServiceOptions } from './IServiceOptions';
import EmpresaRepository from '../database/repositories/empresaRepository';
import informacoesRepository from '../database/repositories/informacoesRepository';
import UserRepository from '../database/repositories/userRepository';


export default class informacoesService {
  options: IServiceOptions;

  constructor(options) {
    this.options = options;
  }

  async create(data) {
    console.log("hgahahahahaha 2")
    try {
      const informacoes = await informacoesRepository.create(data, {
        ...this.options,
      });

      return informacoes;

    } catch (error) {

      SequelizeRepository.handleUniqueFieldError(
        error,
        this.options.language,
        'informacoes',
      );

      throw error;
    }
  }

  async update(id, data) {

    try {
      console.log(data)
      console.log(id)
      const record = await informacoesRepository.update(
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
        'informacoes',
      );

      throw error;
    }
  }

  async findById(id) {
    return informacoesRepository.findById(id, this.options);
  }

  async findByinformacoes(id) {
    return informacoesRepository.findByinformacoes(id);
  }

  async findByEmpresa(id) {
    return informacoesRepository.findByEmpresa(id);
  }


  async findAndCountAll(args) {
    return informacoesRepository.findAndCountAll(
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
        await informacoesRepository.destroy(id, {
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
      await informacoesRepository.destroy(id, {
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
  async createOrUpdate(data) {
    try {

      const hasData = await this.findAndCountAll(this.options)

      console.log(hasData)

      if(hasData.record[0]){
        let id = hasData.record[0].id;

        console.log("id")
        console.log(id)

        const informacoes = await informacoesRepository.update(id, data, {
          ...this.options,
        });
  
        return informacoes;
        
      }
      else{
        console.log("NÃO TEM B SDCBV HXZCHJF KJVF L SYUI")
  
        const informacoes = await informacoesRepository.create(data, {
          ...this.options,
        });
  
        return informacoes;
      }


    } catch (error) {

      SequelizeRepository.handleUniqueFieldError(
        error,
        this.options.language,
        'informacoes',
      );

      throw error;
    }
  }
  
}

