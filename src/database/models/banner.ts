import { DataTypes } from 'sequelize';

export default function (sequelize) {
  const banners = sequelize.define(
    'banners',
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
      imagemUrl: {
        type: DataTypes.STRING(255),
      },
      status: {
        type: DataTypes.STRING(255),
      },
      nome: {
        type: DataTypes.STRING(255),
      }
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

  banners.associate = (models) => {
    models.banners.hasMany(models.file, {
      as: 'fotos',
      foreignKey: 'belongsToId',
      constraints: false,
      scope: {
        belongsTo: models.banners.getTableName(),
        belongsToColumn: 'fotos',
      },
    });

    models.banners.belongsTo(models.tenant, {
      as: 'tenant',
      foreignKey: {
        allowNull: false,
      },
    });

    models.banners.belongsTo(models.user, {
      as: 'createdBy',
    });

    models.banners.belongsTo(models.user, {
      as: 'updatedBy',
    });
  };

  return banners;
}
