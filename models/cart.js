module.exports = function (sequelize, DataTypes) {
  const Cart = sequelize.define('Cart',
    {
      cart_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      product_name: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
          len: [1, 50],
        },
      },
      price: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

    });
  return Cart;
};
