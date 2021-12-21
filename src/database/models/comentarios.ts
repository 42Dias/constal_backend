import { DataTypes } from 'sequelize';

export default function (sequelize) {
  const comentarios = sequelize.define(
    'comentarios',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      dataComentario: {
        type: DataTypes.DATE,
      },
      isRespondido: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      }, 
      isDenunciado: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      }, 
      comentario:{
        type: DataTypes.TEXT,
      },
      resposta:{
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

  comentarios.associate = (models) => {
    models.comentarios.belongsTo(models.user, {
      as: 'user',
      constraints: false,
    });

    models.comentarios.belongsTo(models.empresa, {
      as: 'fornecedorEmpresa',
      constraints: false,
    });

    models.comentarios.belongsTo(models.produto, {
        as: 'produto',
        constraints: false,
      });

    models.comentarios.belongsTo(models.tenant, {
      as: 'tenant',
      foreignKey: {
        allowNull: false,
      },
    });

    models.comentarios.belongsTo(models.user, {
      as: 'createdBy',
    });

    models.comentarios.belongsTo(models.user, {
      as: 'updatedBy',
    });
  };

  return comentarios;
}
