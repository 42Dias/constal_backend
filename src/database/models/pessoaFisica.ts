import { DataTypes } from 'sequelize';

export default function (sequelize) {
  const pessoaFisica = sequelize.define(
    'pessoaFisica',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      cpf: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      nome: {
        type: DataTypes.TEXT,
      },
      email: {
        type: DataTypes.TEXT,
      },
      telefone: {
        type: DataTypes.TEXT,
      },
      celular: {
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

  pessoaFisica.associate = (models) => {
    models.pessoaFisica.belongsTo(models.user, {
      as: 'user',
      constraints: false,
    });

    models.pessoaFisica.hasMany(models.file, {
      as: 'foto',
      foreignKey: 'belongsToId',
      constraints: false,
      scope: {
        belongsTo: models.pessoaFisica.getTableName(),
        belongsToColumn: 'foto',
      },
    });
    
    models.pessoaFisica.belongsTo(models.tenant, {
      as: 'tenant',
      foreignKey: {
        allowNull: false,
      },
    });

    models.pessoaFisica.belongsTo(models.user, {
      as: 'createdBy',
    });

    models.pessoaFisica.belongsTo(models.user, {
      as: 'updatedBy',
    });
  };

  return pessoaFisica;
}
