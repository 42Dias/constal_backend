export default (app) => {
  app.post(
    `/tenant/:tenantId/produto`,
    require('./produtoCreate').default,
  );
  app.put(
    `/tenant/:tenantId/produto/:id`,
    require('./produtoUpdate').default,
  );
  app.put(
    `/tenant/:tenantId/produtoStatusUpdate/:id`,
    require('./produtoStatusUpdate').default,
  );
  app.post(
    `/tenant/:tenantId/produto/import`,
    require('./produtoImport').default,
  );
  app.delete(
    `/tenant/:tenantId/produto`,
    require('./produtoDestroy').default,
  );
  app.delete(
    `/tenant/:tenantId/produtoDeleteOne/:id`,
    require('./produtoDestroyOne').default,
  );
  app.get(
    `/tenant/:tenantId/produto/autocomplete`,
    require('./produtoAutocomplete').default,
  );
  app.get(
    `/tenant/:tenantId/produto`,
    require('./produtoList').default,
  );

  app.get(
    `/find-produto-by-id/:id`,
    require('./produtoFindWithoutLogin').default,
  );

  app.put(
    `/tenant/:tenantId/produtos/:id`,
    require('./produtoAfterBuy').default,
  );
  // app.get(
  //   `/tenant/fa22705e-cf27-41d0-bebf-9a6ab52948c4/produto`,
  //   require('./produtoList').default,
  // );

  app.get(
    `/produtos`,
    require('./produtoListWithoutLogin').default,
  );

  app.get(//this require a filter
    `/produtos-list`,
    require('./produtoListWithoutLoginAndWithoutTenant').default,
  );

  app.get(
    `/produtosTrue`,
    require('./produtoListWithoutLoginTrue').default,
  );
  app.get(
    `/limit-produtos`,
    require('./produtoFindLimitedWithoutLogin').default,
  );
  app.get(
    `/tenant/:tenantId/produto/:id`,
    require('./produtoFind').default,
  );
  app.get(
    `/produto/:id`,
    require('./produtoFindById').default,
  );
  app.get(
    `/produto-imagens-promocionais/`,
    require('./produtoImagemPromocao').default,
  );

  app.delete(
    `/tenant/:tenantId/delete-produto-imagens-promocionais/:id`,
    require('./produtoImagemPromocaoDelete').default,
  );
};
