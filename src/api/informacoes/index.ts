export default (app) => {
  
  app.post(
    `/tenant/:tenantId/informacoes`,
    require('./informacoesCreate').default,
  );

  app.post(
    `/tenant/:tenantId/informacoes-create-or-update`,
    require('./informacoesCreateOrUpdate').default,
  );


  app.put(
    `/tenant/:tenantId/informacoes/:id`,
    require('./informacoesUpdate').default,
  );
  app.get(
    `/tenant/:tenantId/informacoes`,
    require('./informacoesList').default,
  );
  app.get(
    `/tenant/:tenantId/find-informacoes/:id`,
    require('./informacoesFind').default,
  );
  
};
