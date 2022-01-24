import Error400 from '../errors/Error400';
import SequelizeRepository from '../database/repositories/sequelizeRepository';
import { IServiceOptions } from './IServiceOptions';
import EmpresaRepository from '../database/repositories/empresaRepository';
import UserRepository from '../database/repositories/userRepository';
import pagamentoRepository from '../database/repositories/pagamentoRepository';
import highlight from 'cli-highlight';
import { Sequelize, QueryTypes } from 'sequelize/types';
import { getConfig } from '../config';
import axios from 'axios';
import Error404 from '../errors/Error404';

// const API_TOKEN = 'A7C933D7B2F192D4DA24D134FF9640FD4CE73D7049284194CE962E7374A3EA37';   //* TESTE
const API_TOKEN = '9E22B79709D38A9C4CD229E480EBDDB363BC99F9182C8FD1BC49CECC0CAA44F8' //* PRODUÇÃO

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

        



      }
      else{
        console.log('fase0 he he he')
        try{
          // AQUI
          try{
            const options: any = {
      
              method: 'POST',
            
              url: `https://api.iugu.com/v1/marketplace/create_account?api_token=${API_TOKEN}`,
            
              headers: {Accept: 'application/json', 'Content-Type': 'application/json'},
            
              data: {
                name: data.nome
              }
            
            };
            
            
            return axios.request(options).then( (response) => {
            
              if(response.status == 200){
                    try{
                      console.log('fase1 he he he')
        
                      data.user_token = response.data.user_token
                      data.account_id = response.data.account_id
                      data.live_api_token = response.data.live_api_token
                      data.test_api_token = response.data.test_api_token
                      data.account_id = response.data.account_id
                      try{

                        console.log(data)
                      
                        const optionsRequest: any = {
                    
                          method: 'POST',
                        
                          url: `https://api.iugu.com/v1/accounts/${data.account_id}/request_verification?api_token=${data.user_token}`,
                        
                          headers: {Accept: 'application/json', 'Content-Type': 'application/json'},
                        
                          data: {
                        
                            data: {
                        
                              physical_products: false,
                    
                              
                              // price_range: 'Entre R$ 0,00 e R$ 100000,00',
                              price_range: 'Entre R$ 0,00 e R$ 100000,00',
                              
                    
                              business_type: 'Vendas',
                              // business_type: 'Descrição do negócio',
                              
                              // person_type: '\'Pessoa Física\' ou \'Pessoa Jurídica\'',
                              person_type: 'Pessoa Jurídica',
                              
                              // automatic_transfer: true,
                              automatic_transfer: true,
                              
                              company_name: data.nome,
                    
                              // cnpj: 'cnpj só numeros',
                              // cnpj: data.cnpj? data.cnpj: empresaData.cnpj,
                              cnpj: data.cnpj,
                        
                              // address: 'endereço',
                              address: data.logradouro,
                        
                              // cep: 'cep',
                              cep: data.cep,
                        
                              // city: 'cidade',
                              city: data.cidade,
                        
                              // district: 'bairro',
                              district: data.bairro,
                        
                              // state: 'estado',
                              state: data.estado,
                        
                              // telephone: 'telefone',
                              telephone: data.telefone.replace(/\+|\(|\)| |-/g, '') || data.celular.replace(/\+|\(|\)| |-/g, '') ,
                        
                              // bank: '\'Itaú\', \'Bradesco\', \'Caixa Econômica\', \'Banco do Brasil\', \'Santander\', \'Banrisul\', \'Sicredi\', \'Sicoob\', \'Inter\', \'BRB\', \'Via Credi\', \'Neon\', \'Votorantim\', \'Nubank\', \'Pagseguro\', \'Banco Original\', \'Safra\', \'Modal\', \'Banestes\',\'Unicred\',\'Money Plus\',\'Mercantil do Brasil\',\'JP Morgan\',\'Gerencianet Pagamentos do Brasil\', \'Banco C6\', \'BS2\', \'Banco Topazio\', \'Uniprime\', \'Stone\', \'Banco Daycoval\', \'Rendimento\', \'Banco do Nordeste\', \'Citibank\', \'PJBank\', \'Cooperativa Central de Credito Noroeste Brasileiro\', \'Uniprime Norte do Paraná\', \'Global SCM\', \'Next\', \'Cora\', \'Mercado Pago\', \'Banco da Amazonia\', \'BNP Paribas Brasil\', \'Juno\',\'Cresol\',\'BRL Trust DTVM\',\'Banco Banese\',\'Banco BTG Pactual\',\'Banco Omni\',\'Acesso Soluções de Pagamento\',\'CCR de São Miguel do Oeste\',\'Polocred\',\'Ótimo\',',
                              
                              bank:data.cartaoBanco,
                        
                              // bank_ag: 'Agência da Conta',
                              bank_ag: data.cartaoAgencia,
                        
                              // bank_cc: 'Número da Conta'
                              bank_cc: data.cartaoNumero,
                        
                              // account_type: 'Poupança' 'Corrente' , 
                              account_type: data.cartaoTipo,
                        
                            }
                        
                          }
                        }
                            return axios.request(optionsRequest).then(function (response) {
      
                              if(response.status == 200){
                                return response.data;
                              }
                              else{
                                // throw new Error404();
                              }
                            
                            }).catch( (error) => {
                              console.log(error)
                              console.log("--**-*-**-*-*--*-*")
                              console.error(error.response.data);
                              throw (error.response.data)

                              // throw new Error400(
                              //   this.options.language,
                              //   'importer.errors.importHashRequired',
                              // );
                            })
                        

                      }
        
                      catch (error) {
                        console.log("error")
                        console.log(error)

                        throw error;
                      }
                    }
                    catch (error) {
                      console.log("error")
                      console.log("++++++++++++++++++++++++++")
                      console.log(error)

                      throw error;
                    }
                  }
              else{
                // throw new Error404();
              }
            
            }).catch(function (error) {
              console.log("error")
              console.log("------------------")
              // throw new Error400(error);
              // console.log(error)

              // throw error              
              return error              
            });
          }
          catch (error) {
            console.log("error final")
            console.log(error)
            throw error;
          }
      

            // if(responseIugu == undefined){
            //   throw new Error400(
            //     this.options.language,
            //     'Verifique seus dados ou tente novamente 0',
            //   );
            //   // throw 'Verifique seus dados ou tente novamente 0'
            // }
            // else{
            //   return responseIugu;
            // }
        }
        catch (error) {
          SequelizeRepository.handleUniqueFieldError(
            error,
            this.options.language,
            'empresa',
          );
    
          throw error;
        }
        
        
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

  // static async createEmpresaIugu(empresa) {
  //   try{
  //     const options = {

  //       method: 'POST',
      
  //       url: `https://api.iugu.com/v1/marketplace/create_account?api_token=${API_TOKEN}`,
      
  //       headers: {Accept: 'application/json', 'Content-Type': 'application/json'},
      
  //       data: {
  //         name: empresa.nome
  //       }
      
  //     };
      
      
  //     return axios.request(options).then(function (response) {
      
  //       if(response.status == 200){
  //         return response.data;
  //       }
  //       else{
  //         // throw new Error404();
  //       }
      
  //     }).catch(function (error) {
      
  //       return error;
  //       throw 'Verifique seus dados ou tente novamente MEU2 MEUU'
  
  
        
  //     });
  //   }
  //   catch (error) {

  //     throw error;
  //   }

   
  // }
  // static async configureEmpresaIugu(data, subcontaId, userToken){
  //   try{

  //     console.log(data)
    
  //     const optionsRequest = {
  
  //       method: 'POST',
      
  //       url: `https://api.iugu.com/v1/accounts/${subcontaId}/request_verification?api_token=${userToken}`,
      
  //       headers: {Accept: 'application/json', 'Content-Type': 'application/json'},
      
  //       data: {
      
  //         data: {
      
  //           physical_products: false,
  
            
  //           // price_range: 'Entre R$ 0,00 e R$ 100000,00',
  //           price_range: 'Entre R$ 0,00 e R$ 100000,00',
            
  
  //           business_type: 'Vendas',
  //           // business_type: 'Descrição do negócio',
            
  //           // person_type: '\'Pessoa Física\' ou \'Pessoa Jurídica\'',
  //           person_type: 'Pessoa Jurídica',
            
  //           // automatic_transfer: true,
  //           automatic_transfer: true,
            
  //           company_name: data.nome,
  
  //           // cnpj: 'cnpj só numeros',
  //           // cnpj: data.cnpj? data.cnpj: empresaData.cnpj,
  //           cnpj: data.cnpj,
      
  //           // address: 'endereço',
  //           address: data.logradouro,
      
  //           // cep: 'cep',
  //           cep: data.cep,
      
  //           // city: 'cidade',
  //           city: data.cidade,
      
  //           // district: 'bairro',
  //           district: data.bairro,
      
  //           // state: 'estado',
  //           state: data.estado,
      
  //           // telephone: 'telefone',
  //           telephone: data.telefone.replace(/\+|\(|\)| |-/g, '') || data.celular.replace(/\+|\(|\)| |-/g, '') ,
      
  //           // bank: '\'Itaú\', \'Bradesco\', \'Caixa Econômica\', \'Banco do Brasil\', \'Santander\', \'Banrisul\', \'Sicredi\', \'Sicoob\', \'Inter\', \'BRB\', \'Via Credi\', \'Neon\', \'Votorantim\', \'Nubank\', \'Pagseguro\', \'Banco Original\', \'Safra\', \'Modal\', \'Banestes\',\'Unicred\',\'Money Plus\',\'Mercantil do Brasil\',\'JP Morgan\',\'Gerencianet Pagamentos do Brasil\', \'Banco C6\', \'BS2\', \'Banco Topazio\', \'Uniprime\', \'Stone\', \'Banco Daycoval\', \'Rendimento\', \'Banco do Nordeste\', \'Citibank\', \'PJBank\', \'Cooperativa Central de Credito Noroeste Brasileiro\', \'Uniprime Norte do Paraná\', \'Global SCM\', \'Next\', \'Cora\', \'Mercado Pago\', \'Banco da Amazonia\', \'BNP Paribas Brasil\', \'Juno\',\'Cresol\',\'BRL Trust DTVM\',\'Banco Banese\',\'Banco BTG Pactual\',\'Banco Omni\',\'Acesso Soluções de Pagamento\',\'CCR de São Miguel do Oeste\',\'Polocred\',\'Ótimo\',',
            
  //           bank:data.cartaoBanco,
      
  //           // bank_ag: 'Agência da Conta',
  //           bank_ag: data.cartaoAgencia,
      
  //           // bank_cc: 'Número da Conta'
  //           bank_cc: data.cartaoNumero,
      
  //           // account_type: 'Poupança' 'Corrente' , 
  //           account_type: data.cartaoTipo,
      
  //         }
      
  //       }
      
  //     };
      
      
  //     return axios.request(optionsRequest).then(function (response) {
      
  //       console.log("response.data");
  //       console.log(response.data);
  
  //       if(response.status == 200 ){
          
  
  //         return response.data;
  
  
  //       }
  //       else{
  //         // throw new Error404("");
  //         throw 'Verifique seus dados ou tente novamente MEU'
  //       }
      
  //     })
  //     .catch( (error) => {
  
  //       console.log("error.response");
  //       console.log(error.response.data);
  //       // console.error(error);
  //       // throw 'Verifique seus dados ou tente novamente'
  //       return
  //     });;

  //   }
  //   catch (error) {

  //     throw error;
  //   }
  // }
}

