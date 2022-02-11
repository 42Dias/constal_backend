import PermissionChecker from '../../services/user/permissionChecker';
import ApiResponseHandler from '../apiResponseHandler';
import Permissions from '../../security/permissions';
import ProdutoService from '../../services/produtoService';
import EmpresaService from '../../services/empresaService';

export default async (req, res, next) => {
  try {
    new PermissionChecker(req).validateHas(
      Permissions.values.produtoRead,
    );
   console.log('req.currentUser.tenants[0].roles')
   console.log(req.currentUser.tenants[0].roles)

    if (req.currentUser.tenants[0].roles == '["empresa"]') {
      if (!req.query.filter){
        req.query.filter = []
      }
      // req.query.filter.empresa = req.empresa.id //adiciona o filtro de empresa
      //  req.query.filter.empresa = req.empresa.dataValues.id //adiciona o filtro de empresa
      console.log("req.currentUser")
      console.log(req.currentUser.id)
      let userId = req.currentUser.id

      let empresa = await new EmpresaService(
        req,
      ).findByUserId(userId);
      console.log('empresa')
      console.log(empresa)
      req.query.filter.empresa = empresa.id
    }

    const payload = await new ProdutoService(
      req,
    ).findAndCountAll(req.query);

    await ApiResponseHandler.success(req, res, payload);
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};

