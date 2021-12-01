import { DataTypes } from 'sequelize';

export default function (sequelize) {
  const pedido = sequelize.define(
    'pedido',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      codigo: {
        type: DataTypes.TEXT,
      },
      quantidadeProdutos: {
        type: DataTypes.INTEGER,
      },
      formaPagamento: {
        type: DataTypes.TEXT,
      },
      valorTotal: {
        type: DataTypes.DECIMAL(10,2),
      },
      dataPedido: {
        type: DataTypes.DATE,
      },
      dataProcessamento: {
        type: DataTypes.DATE,
      },
      dataEnvio: {
        type: DataTypes.DATE,
      },
      dataEntrega: {
        type: DataTypes.DATE,
      },
      dataFaturamento: {
        type: DataTypes.DATE,
      },
      status: {
        type: DataTypes.TEXT,
        validate: {
          isIn: [[
            "pendente",
            "pago",       // pendente
            "cancelado",  // devolvido
            "enviado",    // pendente
            "recebido",   // pendente
            "transito",   // pendente
            "entregue"    // confirmado
          ]],
        }
      },
      valorFrete: {
        type: DataTypes.DECIMAL(10,2),
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

  pedido.associate = (models) => {
    models.pedido.belongsTo(models.user, {
      as: 'compradorUser',
      constraints: false,
    });

    models.pedido.belongsTo(models.empresa, {
      as: 'fornecedorEmpresa',
      constraints: false,
    });

    
    models.pedido.belongsTo(models.tenant, {
      as: 'tenant',
      foreignKey: {
        allowNull: false,
      },
    });

    models.pedido.belongsTo(models.user, {
      as: 'createdBy',
    });

    models.pedido.belongsTo(models.user, {
      as: 'updatedBy',
    });
  };

  return pedido;
}
