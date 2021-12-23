import PermissionChecker from '../../services/user/permissionChecker';
import ApiResponseHandler from '../apiResponseHandler';
import Permissions from '../../security/permissions';
import PedidoProdutoService from '../../services/pedidoProdutoService';

export default async (req, res, next) => {
  try {
    new PermissionChecker(req).validateHas(
      Permissions.values.pedidoProdutoRead,
    );
        //apenas pedidos da pessoa
    if (req.currentUser.tenants[0].roles[0] == 'pessoa') {
      if (!req.query.filter){
        req.query.filter = []
      }
      req.query.filter.compradorUser = req.currentUser.id
    }

    //apenas pedidos da empresa
    else if (req.currentUser.tenants[0].roles[0] == 'empresa') {
      if (!req.query.filter){
        req.query.filter = []
      }
      req.query.filter.fornecedorEmpresa = req.empresa.dataValues.id

    }


    const payload = await new PedidoProdutoService(
      req,
    ).findAndCountAll(req.query);

    await ApiResponseHandler.success(req, res, payload);
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};
