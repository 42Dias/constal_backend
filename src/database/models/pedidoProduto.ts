import { DataTypes } from 'sequelize';

/**
 * ProdutoArmazem database model.
 * See https://sequelize.org/v5/manual/models-definition.html to learn how to customize it.
 */
export default function (sequelize) {
  const pedidoProduto = sequelize.define(
    'pedidoProduto',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      quantidade: {
        type: DataTypes.INTEGER,
      },
      precoUnitario: {
        type: DataTypes.DECIMAL(10, 2),
      },
      precoTotal: {
        type: DataTypes.DECIMAL(10, 2),
      },
    },
    {
      timestamps: true,
      paranoid: false,
    },
  );

  pedidoProduto.associate = (models) => {

    //Relação n:m em que há campos além dos ids na tabela auxiliar
    models.produto.belongsToMany(models.pedido, {
      as: 'pedido',
      constraints: false,
      through: pedidoProduto,
    });

    models.pedido.belongsToMany(models.produto, {
      as: 'produto',
      constraints: false,
      through: pedidoProduto,
      scope: {
        belongsTo: models.produto.getTableName(),
        belongsToColumn: 'id',
      },
    });
    // Fim

  };

  return pedidoProduto;
}
