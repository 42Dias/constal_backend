import PermissionChecker from '../../services/user/permissionChecker';
import ApiResponseHandler from '../apiResponseHandler';
import Permissions from '../../security/permissions';
import ProdutoService from '../../services/produtoService';

export default async (req, res, next) => {
  try {
    new PermissionChecker(req).validateHas(
      Permissions.values.produtoEdit,
    );
    
      console.log("req.body")
      console.log(req.body.quantidade)

    const payload = await new ProdutoService(req).produtoAfterBuy(
      req.params.id,
      req.body.quantidade,
    );

    await ApiResponseHandler.success(req, res, payload);
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};
