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
    });
    // Fim

  };

  return pedidoProduto;
}
