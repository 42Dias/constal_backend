import PermissionChecker from '../../services/user/permissionChecker';
import ApiResponseHandler from '../apiResponseHandler';
import Permissions from '../../security/permissions';
import ProdutoService from '../../services/produtoService';
import EmpresaService from '../../services/empresaService';

export default async (req, res, next) => {
  try {
    new PermissionChecker(req).validateHas(
      Permissions.values.produtoCreate,
    );

    if (req.currentUser.tenants[0].roles == '["empresa"]') {
      // let userId = req.currentUser.id

      // let empresa = await new EmpresaService(
      //   req,
      // ).findByUserId(userId);
      // req.query.filter.empresa = empresa.id
    }

    const payload = await new ProdutoService(req).create(
      req.body.data,
    );

    await ApiResponseHandler.success(req, res, payload);
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};
