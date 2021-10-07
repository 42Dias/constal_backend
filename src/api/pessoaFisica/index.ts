export default (app) => {
  app.get(
    `/tenant/:tenantId/pessoa-fisica-perfil`,
    require('./pessoaFisicaFindCurrentUser').default,
  );

  app.post(
    `/tenant/:tenantId/pessoa-fisica-perfil`,
    require('./pessoaFisicaCreateOrUpdate').default,
  );
  app.post(
    `/tenant/:tenantId/pessoa-fisica`,
    require('./pessoaFisicaCreate').default,
  );
  app.put(
    `/tenant/:tenantId/pessoa-fisica/:id`,
    require('./pessoaFisicaUpdate').default,
  );
  app.post(
    `/tenant/:tenantId/pessoa-fisica/import`,
    require('./pessoaFisicaImport').default,
  );
  app.delete(
    `/tenant/:tenantId/pessoa-fisica`,
    require('./pessoaFisicaDestroy').default,
  );
  app.get(
    `/tenant/:tenantId/pessoa-fisica/autocomplete`,
    require('./pessoaFisicaAutocomplete').default,
  );
  app.get(
    `/tenant/:tenantId/pessoa-fisica`,
    require('./pessoaFisicaList').default,
  );
  app.get(
    `/tenant/:tenantId/pessoa-fisica/:id`,
    require('./pessoaFisicaFind').default,
  );
};
