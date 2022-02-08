import { DataTypes } from 'sequelize';

export default function (sequelize) {
  const informacoes = sequelize.define(
    'informacoes',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      }, 
      telefone:{
        type: DataTypes.TEXT,
      },
      seguranca:{
        type: DataTypes.TEXT,
      },
      logradouro:{
        type: DataTypes.TEXT,
      },
      bairro:{
        type: DataTypes.TEXT,
      },
      cnpj:{
        type: DataTypes.TEXT,
      },
      cep:{
        type: DataTypes.TEXT,
      },
      sobre:{
        type: DataTypes.TEXT,
      },
      direitos:{
        type: DataTypes.TEXT,
      },
      cidade:{
        type: DataTypes.TEXT,
      },
      estado:{
        type: DataTypes.TEXT,
      },
      numero:{
        type: DataTypes.TEXT,
      },
      complemento:{
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

  informacoes.associate = (models) => {
    models.informacoes.belongsTo(models.tenant, {
      as: 'tenant',
      foreignKey: {
        allowNull: false,
      },
    });

    models.informacoes.belongsTo(models.user, {
      as: 'createdBy',
    });

    models.informacoes.belongsTo(models.user, {
      as: 'updatedBy',
    });
  };

  return informacoes;
}
