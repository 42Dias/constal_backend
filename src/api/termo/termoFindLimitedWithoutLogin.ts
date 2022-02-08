import PermissionChecker from '../../services/user/permissionChecker';
import ApiResponseHandler from '../apiResponseHandler';
import Permissions from '../../security/permissions';
import termosService from '../../services/termosService';

export default async (req, res, next) => {
  try {
   

    const payload = await new termosService(
      req,
    ).findLimitedWithoutLogin();

    await ApiResponseHandler.success(req, res, payload);
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};
