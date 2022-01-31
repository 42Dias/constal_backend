import ApiResponseHandler from '../apiResponseHandler';
import SmtpService from '../../services/smtpService';

export default async (req, res, next) => {
  try {

    const payload = await new SmtpService(req).retornoDoProdutoImagemPromocional(
      req.body.empresaId, req.body.product, req.body.emailContent
      );

    await ApiResponseHandler.success(req, res, payload);
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};