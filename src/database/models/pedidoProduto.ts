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
      produtoId: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: false,
        primaryKey: false,
      },
      compradorUserId: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: false,
        primaryKey: false,
      },
    },
    {
      indexes: [
        {
          unique: false,
          fields: ['createdAt', 'compradorUserId'],
          where: {
            deletedAt: null,
          },
        },
      ],
      timestamps: true,
      paranoid: true,
    },
  );

  pedidoProduto.associate = (models) => {

    //Relação n:m em que há campos além dos ids na tabela auxiliar
    models.produto.belongsToMany(models.pedido, {
      as: 'pedido',
      constraints: false,
      unique: false,
      through: pedidoProduto,
    });

    // Fim

  };

  return pedidoProduto;
}
