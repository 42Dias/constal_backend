export default (app) => {
  app.post(
    `/tenant/:tenantId/pedido/:id/fatura`,
    require('./pedidoGerarFatura').default,
  );
  app.post(
    `/tenant/:tenantId/pedido-newfatura`,
    require('./pedidoGerarNewFatura').default,
  );
  
  app.post(
    `/tenant/:tenantId/pedido`,
    require('./pedidoCreate').default,
  );
  app.put(
    `/tenant/:tenantId/pedido/:id`,
    require('./pedidoUpdate').default,
  );
  app.post(
    `/tenant/:tenantId/pedido/import`,
    require('./pedidoImport').default,
  );
  /* app.delete(
    `/tenant/:tenantId/pedido`,
    require('./pedidoDestroy').default,
  ); */
  app.get(
    `/tenant/:tenantId/pedido/autocomplete`,
    require('./pedidoAutocomplete').default,
  );
  app.get(
    `/tenant/:tenantId/pedido`,
    require('./pedidoList').default,
  );
  app.get(
    `/tenant/:tenantId/find-pedido/:id`,
    require('./pedidoFind').default,
  );
  app.get(
  `/tenant/:tenantId/pedidoWithProduct`,
  require('./pedidoWithProduct').default,
);

app.post(
  `/tenant/:tenantId/findPedidoWithProductToEmpresa`,
  require('./findPedidoWithProductToEmpresa').default,
);

app.get(
  `/tenant/:tenantId/pedido/fatura`,
  require('./listaFaturas').default,
);
app.get(
  `/tenant/:tenantId/pedido-fatura`,
  require('./listFaturasWithRelations').default,
);
};
