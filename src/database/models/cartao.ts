import { DataTypes } from 'sequelize';

export default function (sequelize) {
  const cartao = sequelize.define(
    'cartao',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      tipo: {
        type: DataTypes.TEXT,
        validate: {
          isIn: [[
            "credito",
            "debito"
          ]],
        }
      },
      nomeTitular: {
        type: DataTypes.TEXT,
      },
      apelido: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      numero: {
        type: DataTypes.TEXT,
      },
      cvv: {
        type: DataTypes.TEXT,
      },
      validade: {
        type: DataTypes.TEXT,
      },
      bandeira: {
        type: DataTypes.TEXT,
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

  cartao.associate = (models) => {
    models.cartao.belongsToMany(models.user, {
      as: 'user',
      constraints: false,
      through: 'cartaoUserUser',
    });


    
    models.cartao.belongsTo(models.tenant, {
      as: 'tenant',
      foreignKey: {
        allowNull: false,
      },
    });

    models.cartao.belongsTo(models.user, {
      as: 'createdBy',
    });

    models.cartao.belongsTo(models.user, {
      as: 'updatedBy',
    });
  };

  return cartao;
}
