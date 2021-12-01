export default (app) => {
  app.post(
    `/tenant/:tenantId/produto`,
    require('./produtoCreate').default,
  );
  app.put(
    `/tenant/:tenantId/produto/:id`,
    require('./produtoUpdate').default,
  );
  app.post(
    `/tenant/:tenantId/produto/import`,
    require('./produtoImport').default,
  );
  app.delete(
    `/tenant/:tenantId/produto`,
    require('./produtoDestroy').default,
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
    `/tenant/fa22705e-cf27-41d0-bebf-9a6ab52948c4/produto`,
    require('./produtoList').default,
  );

  app.get(
    `/produtos`,
    require('./produtoListWithoutLogin').default,
  );
  app.get(
    `/limit-produtos`,
    require('./produtoFindLimitedWithoutLogin').default,
  );
  app.get(
    `/tenant/:tenantId/produto/:id`,
    require('./produtoFind').default,
  );
};
