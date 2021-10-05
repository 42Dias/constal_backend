import EmpresaService from '../services/empresaService';

export async function getEmpresaMiddleware(
    req,
    res,
    next,
  ) {
    try {

      const currentUser = req.currentUser;

      let empresa = await new EmpresaService(req).findByUserId(currentUser.id);    

      req.empresa = empresa;
      return next();

    } catch (error) {
      next(error);
    }
  }
