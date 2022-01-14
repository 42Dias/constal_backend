import ApiResponseHandler from '../apiResponseHandler';
import CategoriaService from '../../services/categoriaService';

export default async (req, res, next) => {
  try {
    const payload = await new CategoriaService(
      req,
    ).categoriaListAprovadosIsFixed();

    await ApiResponseHandler.success(req, res, payload);
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};
