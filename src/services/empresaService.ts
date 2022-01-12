import Error400 from '../errors/Error400';
import SequelizeRepository from '../database/repositories/sequelizeRepository';
import { IServiceOptions } from './IServiceOptions';
import EmpresaRepository from '../database/repositories/empresaRepository';
import UserRepository from '../database/repositories/userRepository';
import pagamentoRepository from '../database/repositories/pagamentoRepository';
import highlight from 'cli-highlight';
import { Sequelize, QueryTypes } from 'sequelize/types';
import { getConfig } from '../config';

export default class EmpresaService {
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
      
      

      
      await SequelizeRepository.commitTransaction(
        transaction,
        );
        const record = await EmpresaRepository.create(data, {
        ...this.options,
        transaction,
      });
      return record

    } catch (error) {
      await SequelizeRepository.rollbackTransaction(
        transaction,
      );

      SequelizeRepository.handleUniqueFieldError(
        error,
        this.options.language,
        'empresa',
      );

      throw error;
    }
  }

  async update(id, data) {
    const transaction = await SequelizeRepository.createTransaction(
      this.options.database,
    );

    try {
      const currentUser = SequelizeRepository.getCurrentUser(
        this.options,
      );
      data.user = currentUser.id
      //data.user = await UserRepository.filterIdInTenant(data.user, { ...this.options, transaction });

      const record = await EmpresaRepository.update(
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
        'empresa',
      );

      throw error;
    }
  }
  async empresaStatusUpdate(id, data) {
    await EmpresaRepository.empresaStatusUpdate(
      id,
      data
    );
  }

  async destroyAll(ids) {
    const transaction = await SequelizeRepository.createTransaction(
      this.options.database,
    );

    try {
      for (const id of ids) {
        await EmpresaRepository.destroy(id, {
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
    return EmpresaRepository.findById(id, this.options);
  }

  async findByUserId(id) {
    return EmpresaRepository.findByUserId(id, this.options);
  }

  async findAllAutocomplete(search, limit) {
    return EmpresaRepository.findAllAutocomplete(
      search,
      limit,
      this.options,
    );
  }

  async findAndCountAll(args) {
    return EmpresaRepository.findAndCountAll(
      args,
      this.options,
    );
  }
  async empresaStatus(args) {
    return EmpresaRepository.empresaStatus(
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
    const count = await EmpresaRepository.count(
      {
        importHash,
      },
      this.options,
    );

    return count > 0;
  }

  async createOrUpdate(data) {

    try {
      // data.user = await UserRepository.filterIdInTenant(data.user, { ...this.options });
      
      const currentUser = SequelizeRepository.getCurrentUser(
        this.options,
      );
      
      data.user = currentUser.id

      const hasEmpresaProfile = await this.findByUserId(data.user)
      console.log("hasEmpresaProfile")
      console.log(hasEmpresaProfile)

      if(hasEmpresaProfile){
      console.log("hasEmpresaProfile")
      console.log(hasEmpresaProfile)

        


        pagamentoRepository.configureEmpresaIugu(data, hasEmpresaProfile.account_id, hasEmpresaProfile.user_token).then(
          async () => {
              const record = await EmpresaRepository.createOrUpdate(data, {
                ...this.options,
              });
            return record
          }
        )

      }
      else{
        console.log('fase0 he he he')
        
        const responseIugu = await pagamentoRepository.createEmpresaIugu(data).then(
          async (response) => {
              console.log('fase1 he he he')

              data.user_token = response.user_token
              data.account_id = response.account_id
              data.live_api_token = response.live_api_token
              data.test_api_token = response.test_api_token
              data.account_id = response.account_id


              pagamentoRepository.configureEmpresaIugu(data, response.account_id, response.user_token).then(
                async (response) => {
                  console.log('fase2 he he he')


                    const record = await EmpresaRepository.createOrUpdate(data, {
                      ...this.options,
                    });
                  return record
                }
              )
          }
          )
          return responseIugu;
      }

        
      await UserRepository.updateHasProfile({ ...this.options });


    } catch (error) {
      SequelizeRepository.handleUniqueFieldError(
        error,
        this.options.language,
        'empresa',
      );

      throw error;
    }
  }

  async findByCurrentId() {
    return EmpresaRepository.findByCurrentId(this.options);
  }
}
