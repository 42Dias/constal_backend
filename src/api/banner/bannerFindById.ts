//import PermissionChecker from '../../services/user/permissionChecker';
import ApiResponseHandler from '../apiResponseHandler';
//import Permissions from '../../security/permissions';
import BannersService from '../../services/bannersService';

export default async (req, res, next) => {
  try {
    // new PermissionChecker(req).validateHas(
    //   Permissions.values.bannersRead,
    // );

    const payload = await new BannersService(req).findBannersbyId(
      req.params.id,
    );

    await ApiResponseHandler.success(req, res, payload);
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};
