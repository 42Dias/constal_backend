import { DataTypes } from 'sequelize';

export default function (sequelize) {
  const pagamento = sequelize.define(
    'pagamento',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      pedidoId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      url: {
        type: DataTypes.STRING
      },
      status: {
        type: DataTypes.STRING
      }
    },
    {
      timestamps: true,
      paranoid: true,
    },
  );

  pagamento.associate = (models) => {

    models.pagamento.belongsTo(models.pedido, {
      as: 'pedido',
      foreignKey: true,
    });

  };

  return pagamento;
}
