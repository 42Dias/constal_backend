export default (app) => {
  app.post(
    `/tenant/:tenantId/banner`,
    require('./bannerCreate').default,
  );
  app.put(
    `/tenant/:tenantId/banner/:id`,
    require('./bannerUpdate').default,
  );
  app.post(
    `/tenant/:tenantId/banner/import`,
    require('./bannerImport').default,
  );
  app.delete(
    `/tenant/:tenantId/banner`,
    require('./bannerDestroy').default,
  );
  app.delete(
    `/tenant/:tenantId/bannerDeleteOne/:id`,
    require('./bannerDestroyOne').default,
  );
  app.get(
    `/tenant/:tenantId/banner/autocomplete`,
    require('./bannerAutocomplete').default,
  );
  app.get(
    `/tenant/:tenantId/banner`,
    require('./bannerList').default,
  );


  app.get(
    `/banner`,
    require('./bannerListWithoutLogin').default,
  );

  app.get(
    `/banner-list`,
    require('./bannerListWithoutLoginAndWithoutTenant').default,
  );

  app.get(
    `/bannerTrue`,
    require('./bannerListWithoutLoginTrue').default,
  );
  app.get(
    `/limit-banner`,
    require('./bannerFindLimitedWithoutLogin').default,
  );
  app.get(
    `/tenant/:tenantId/banner/:id`,
    require('./bannerFind').default,
  );
  app.get(
    `/banner/:id`,
    require('./bannerFindById').default,
  );
};
