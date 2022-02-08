export default (app) => {
  app.post(
    `/tenant/:tenantId/termo`,
    require('./termoCreate').default,
  );
  app.put(
    `/tenant/:tenantId/termo/:id`,
    require('./termoUpdate').default,
  );
  app.delete(
    `/tenant/:tenantId/termo`,
    require('./termoDestroy').default,
  );
  app.delete(
    `/tenant/:tenantId/termoDeleteOne/:id`,
    require('./termoDestroyOne').default,
  );
  app.get(
    `/tenant/:tenantId/termo`,
    require('./termoList').default,
  );


  app.get(
    `/termo`,
    require('./termoListWithoutLogin').default,
  );

  app.get(
    `/termo-list`,
    require('./termoListWithoutLoginAndWithoutTenant').default,
  );

  app.get(
    `/termoTrue`,
    require('./termoListWithoutLoginTrue').default,
  );
  app.get(
    `/ativo-termo`,
    require('./termoFindLimitedWithoutLogin').default, // esse
  );
  app.get(
    `/tenant/:tenantId/termo/:id`,
    require('./termoFind').default,
  );
  app.get(
    `/termo/:id`,
    require('./termoFindById').default,
  );
};
