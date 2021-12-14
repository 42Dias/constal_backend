import PermissionChecker from '../../services/user/permissionChecker';
import ApiResponseHandler from '../apiResponseHandler';
import Permissions from '../../security/permissions';
import ProdutoService from '../../services/produtoService';

export default async (req, res, next) => {
  try {
    new PermissionChecker(req).validateHas(
      Permissions.values.produtoRead,
    );

    if (req.currentUser.tenants[0].roles[0] == 'empresa') {
      if (!req.query.filter){
        req.query.filter = []
      }
      req.query.filter.empresa = req.currentUser.id //adiciona o filtro de empresa
    }

    const payload = await new ProdutoService(
      req,
    ).findAndCountAll(req.query);

    await ApiResponseHandler.success(req, res, payload);
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};
