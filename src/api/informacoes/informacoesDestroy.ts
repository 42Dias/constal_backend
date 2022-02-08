import PermissionChecker from '../../services/user/permissionChecker';
import ApiResponseHandler from '../apiResponseHandler';
import Permissions from '../../security/permissions';
import informacoesService from '../../services/informacoesService';


export default async (req, res, next) => {
  try {
    new PermissionChecker(req).validateHas(
      Permissions.values.informacoesDestroy,
    );

    await new informacoesService(req).destroyAll(
      req.query.ids,
    );

    const payload = true;

    await ApiResponseHandler.success(req, res, payload);
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};
