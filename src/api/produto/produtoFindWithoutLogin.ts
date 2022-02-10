import PermissionChecker from '../../services/user/permissionChecker';
import ApiResponseHandler from '../apiResponseHandler';
import Permissions from '../../security/permissions';
import ProdutoService from '../../services/produtoService';

export default async (req, res, next) => {
  try {

    console.log("bhydsbfvhsdbvhbvxchjvxbcjvbjhvvsdfjvbvbfdjhvbsdvbhscbvjuhxbcjhvbsajcvbjhcbvhcsbvh\dcvkjcsnvoŚDNVOISNDvoinsdvbiujbviubhvisdbvbacjascomAOMCVÓASDIhfvfvwdiuohvidsbvdsbvosdknókxnvccokjasxNHVCC9UAGHFVSUIDVBSJXCVN ZCXJHBVUISCGVISDUBVJCNVKLJXCNVOLSDHNVUIHSDFDJIVNSCFJOCBNVOI")
   
    console.log(req.params)
    console.log(req.params.id)

    const payload = await new ProdutoService(
      req,
    ).findById(req.params.id);

    await ApiResponseHandler.success(req, res, payload);
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};
