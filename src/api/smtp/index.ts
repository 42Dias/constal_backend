export default (app) => {
    app.post(
      `/cliente/:id/:token/verificarEmail`,
      require('./appEnviarVerificacao').default,
    );
    app.post(
      `/cliente/trocarSenha`,
      require('./appEnviarResetarSenha').default,
    );

    app.post(
      `/cliente/enviarEmailEmpresaAprovada`,
      require('./appEnviarEmailEmpresaAprovada').default,
    );

    app.post(
      `/produto/enviarEmailRecusado`,
      require('./sendEmailProduto').default,
    );

    app.post(
      `/tenant/:tenantId/produto/enviarEmailRecusadoImagemProduto`,
      require('./sendEmailImagemroduto').default,
    );
    app.post(
      `/tenant/:tenantId/cliente/comentario-denuncia`,
      require('./sendEmailDenunciaComentario').default,
    );
  }