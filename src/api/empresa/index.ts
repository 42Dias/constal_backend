export default (app) => {
  app.get(
    `/tenant/:tenantId/empresa-perfil`,
    require('./empresaFindCurrentUser').default,
  );
  app.post(
    `/tenant/:tenantId/empresa-perfil`,
    require('./empresaCreateOrUpdate').default,
  );
  app.post(
    `/tenant/:tenantId/empresa`,
    require('./empresaCreate').default,
  );
  app.put(
    `/tenant/:tenantId/empresa/:id`,
    require('./empresaUpdate').default,
  );
  app.post(
    `/tenant/:tenantId/empresa/import`,
    require('./empresaImport').default,
  );
  app.delete(
    `/tenant/:tenantId/empresa`,
    require('./empresaDestroy').default,
  );
  app.get(
    `/tenant/:tenantId/empresa/autocomplete`,
    require('./empresaAutocomplete').default,
  );
  app.get(
    `/tenant/:tenantId/empresa`,
    require('./empresaList').default,
  );
  app.get(
    `/tenant/:tenantId/empresa/:id`,
    require('./empresaFind').default,
  );
};
