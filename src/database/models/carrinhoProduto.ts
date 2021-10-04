import { DataTypes } from 'sequelize';

/**
 * ProdutoArmazem database model.
 * See https://sequelize.org/v5/manual/models-definition.html to learn how to customize it.
 */
export default function (sequelize) {
  const carrinhoProduto = sequelize.define(
    'carrinhoProduto',
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

  carrinhoProduto.associate = (models) => {

    //Relação n:m em que há campos além dos ids na tabela auxiliar
    models.produto.belongsToMany(models.carrinho, {
      as: 'carrinho',
      constraints: false,
      through: carrinhoProduto,
    });

    models.carrinho.belongsToMany(models.produto, {
      as: 'produto',
      constraints: false,
      through: carrinhoProduto,
    });
    //Fim

  };

  return carrinhoProduto;
}
