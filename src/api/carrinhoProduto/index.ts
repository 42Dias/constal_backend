export default (app) => {
  app.post(
    `/tenant/:tenantId/carrinhoProduto`,
    require('./carrinhoProdutoCreate').default,
  );
  app.put(
    `/tenant/:tenantId/carrinhoProduto`,
    require('./carrinhoProdutoUpdate').default,
  );
/*   app.post(
    `/tenant/:tenantId/carrinho/import`,
    require('./carrinhoImport').default,
  ); */
  app.delete(
    `/tenant/:tenantId/carrinhoProduto`,
    require('./carrinhoProdutoDestroy').default,
  );
  app.delete(
    `/tenant/:tenantId/carrinhoProdutoAll`,
    require('./carrinhoProdutoDestroyAll').default,
  );
  app.delete(
    `/tenant/:tenantId/carrinhoProduto/:empresaId`,
    require('./carrinhoProdutoDestroyByEmpresa').default,
  );
/*   app.get(
    `/tenant/:tenantId/carrinho/autocomplete`,
    require('./carrinhoAutocomplete').default,
  ); */
  app.get(
    `/tenant/:tenantId/carrinhoProduto`,
    require('./carrinhoProdutoList').default,
  );
  app.get(
    `/tenant/:tenantId/carrinhoProduto/:busca/:tipoBusca`,
    require('./carrinhoProdutoFindByBusca').default,
  );
  /* app.get(
    `/tenant/:tenantId/carrinhoProduto/:produtoId/quantidade`,
    require('./carrinhoProdutoFindQuantidadeByProdutoId').default,
  ); */
};
