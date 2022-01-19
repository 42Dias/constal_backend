import PermissionChecker from '../../services/user/permissionChecker';
import ApiResponseHandler from '../apiResponseHandler';
import Permissions from '../../security/permissions';
import CarrinhoService from '../../services/carrinhoService';

export default async (req, res, next) => {
  try {
    console.log(req.currentTenant)
    console.log(req.language)
    console.log(req.currentUser)
    console.log(req.currentUser.tenants[0].dataValues)
        console.log("re------------------------------*********************q")
	console.log(req)


    new PermissionChecker(req).validateHas(
      Permissions.values.carrinhoCreate,
    );

    const payload = await new CarrinhoService(req).create(
      req.body,
    );

    console.log(payload)

    await ApiResponseHandler.success(req, res, payload);
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};
