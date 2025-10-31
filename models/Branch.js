const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Branch = sequelize.define('Branch', {
  tenChiNhanh: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  diaChi: {
    type: DataTypes.STRING
  }
});

module.exports = Branch;