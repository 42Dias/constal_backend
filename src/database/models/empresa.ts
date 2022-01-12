import { DataTypes } from 'sequelize';

export default function (sequelize) {
  const empresa = sequelize.define(
    'empresa',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      nome: {
        type: DataTypes.TEXT,
      },
      marca: {
        type: DataTypes.TEXT,
      },
      razaoSocial: {
        type: DataTypes.TEXT,
      },
      cnpj: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      telefone: {
        type: DataTypes.TEXT,
      },
      celular: {
        type: DataTypes.TEXT,
      },
      ramal: {
        type: DataTypes.TEXT,
      },
      email: {
        type: DataTypes.TEXT,
      },
      website: {
        type: DataTypes.TEXT,
      },
      cep: {
        type: DataTypes.TEXT,
      },
      logradouro: {
        type: DataTypes.TEXT,
      },
      numero: {
        type: DataTypes.INTEGER,
      },
      complemento: {
        type: DataTypes.TEXT,
      },
      pontoReferencia: {
        type: DataTypes.TEXT,
      },
      cidade: {
        type: DataTypes.TEXT,
      },
      estado: {
        type: DataTypes.TEXT,
      },
      bairro: {
        type: DataTypes.TEXT,
      },
      account_id: {
        type: DataTypes.TEXT,
      },
      live_api_token: {
        type: DataTypes.TEXT,
      },
      test_api_token: {
        type: DataTypes.TEXT,
      },
      user_token: {
        type: DataTypes.TEXT,
      },
      cartaoTipo: {
        type: DataTypes.TEXT,
      },
      cartaoNumero: {
        type: DataTypes.TEXT,
      },
      cartaoBanco: {
        type: DataTypes.TEXT,
      },
      cartaoAgencia: {
        type: DataTypes.TEXT,
      },
      
      
      pix: {
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

  empresa.associate = (models) => {
    models.empresa.belongsTo(models.user, {
      as: 'user',
      constraints: false,
    });

    models.empresa.hasMany(models.file, {
      as: 'foto',
      foreignKey: 'belongsToId',
      constraints: false,
      scope: {
        belongsTo: models.empresa.getTableName(),
        belongsToColumn: 'foto',
      },
    });
    
    models.empresa.belongsTo(models.tenant, {
      as: 'tenant',
      foreignKey: {
        allowNull: false,
      },
    });

    models.empresa.belongsTo(models.user, {
      as: 'createdBy',
    });

    models.empresa.belongsTo(models.user, {
      as: 'updatedBy',
    });
  };

  return empresa;
}
