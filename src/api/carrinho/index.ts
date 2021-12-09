export default (app) => {
  app.post(
    `/tenant/:tenantId/carrinho`,        //cria o produto no carrinho!!
    require('./carrinhoCreate').default,
  );
  app.post(
    `/tenant/:tenantId/carrinho/:id`,    //altera
    require('./carrinhoUpdate').default,
  );
  app.post(
    `/tenant/:tenantId/carrinho/import`,
    require('./carrinhoImport').default,
  );
  app.delete(
    `/tenant/:tenantId/carrinho`,
    require('./carrinhoDestroy').default,
  );
  app.get(
    `/tenant/:tenantId/carrinho/autocomplete`,
    require('./carrinhoAutocomplete').default,
  );
  app.get(
    `/tenant/:tenantId/carrinho`,
    require('./carrinhoList').default,
  );
  app.get(
    `/tenant/:tenantId/carrinho/:id`,
    require('./carrinhoFind').default,
  );
};
