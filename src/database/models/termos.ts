import { DataTypes } from 'sequelize';

export default function (sequelize) {
  const termo = sequelize.define(
    'termo',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      }, 
      url:{
        type: DataTypes.TEXT,
      },
      nome:{
        type: DataTypes.TEXT,
      },
      ativo:{
        type: DataTypes.TEXT,
      },
    },
    {
      indexes: [
        {
          unique: false,
          fields: ['id', 'tenantId'],
          where: {
            deletedAt: null,
          },
        },

      ],
      timestamps: true,
      paranoid: true,
    },
  );

  termo.associate = (models) => {
    models.termo.belongsTo(models.tenant, {
      as: 'tenant',
      foreignKey: {
        allowNull: false,
      },
    });

    models.termo.belongsTo(models.user, {
      as: 'createdBy',
    });

    models.termo.belongsTo(models.user, {
      as: 'updatedBy',
    });
  };

  return termo;
}
