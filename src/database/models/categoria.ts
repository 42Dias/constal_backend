import { DataTypes } from 'sequelize';

export default function (sequelize) {
  const categoria = sequelize.define(
    'categoria',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      nome: {
        type: DataTypes.TEXT,
      },
      status: {
        type: DataTypes.TEXT,
      },
      isFixed: {
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

  categoria.associate = (models) => {



    
    models.categoria.belongsTo(models.tenant, {
      as: 'tenant',
      foreignKey: {
        allowNull: false,
      },
    });

    models.categoria.belongsTo(models.user, {
      as: 'createdBy',
    });

    models.categoria.belongsTo(models.user, {
      as: 'updatedBy',
    });
  };

  return categoria;
}
