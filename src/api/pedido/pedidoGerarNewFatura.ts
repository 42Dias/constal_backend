import ApiResponseHandler from '../apiResponseHandler';
import PedidoService from '../../services/pedidoService';

export default async (req, res, next) => {
  try {
    const payload = await new PedidoService(req).geraNewFatura(
      req.body.data
    );

    await ApiResponseHandler.success(req, res, payload);
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};
