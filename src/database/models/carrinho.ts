import { DataTypes } from 'sequelize';

export default function (sequelize) {
  const carrinho = sequelize.define(
    'carrinho',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      importHash: {
        type: DataTypes.STRING(255),
        allowNull: true,    
        validate: {
          len: [0, 255],
        },    
      },
    },
    {
      indexes: [
        {
          unique: true,
          fields: ['importHash', 'tenantId'],
          where: {
            deletedAt: null,
          },
        },

      ],
      timestamps: true,
      paranoid: true,
    },
  );

  carrinho.associate = (models) => {
    models.carrinho.belongsTo(models.user, {
      as: 'user',
      constraints: false,
    });

    /* models.carrinho.belongsToMany(models.produto, {
      as: 'produto',
      constraints: false,
      through: 'carrinhoProdutoProduto',
    }); */


    
    models.carrinho.belongsTo(models.tenant, {
      as: 'tenant',
      foreignKey: {
        allowNull: false,
      },
    });

    models.carrinho.belongsTo(models.user, {
      as: 'createdBy',
    });

    models.carrinho.belongsTo(models.user, {
      as: 'updatedBy',
    });
  };

  return carrinho;
}
