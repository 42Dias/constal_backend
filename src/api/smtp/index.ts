export default (app) => {
    app.post(
      `/cliente/:id/:token/verificarEmail`,
      require('./appEnviarVerificacao').default,
    );
    app.post(
      `/cliente/trocarSenha`,
      require('./appEnviarResetarSenha').default,
    );
  };
  