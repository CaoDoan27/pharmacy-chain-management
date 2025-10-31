const sequelize = require('../config/database');
const User = require('./User');
const Branch = require('./Branch');

// Định nghĩa Mối quan hệ [cite: 931, 936]
// Một User "thuộc về" một Branch
User.belongsTo(Branch, { foreignKey: 'branchId' });
// Một Branch "có nhiều" Users
Branch.hasMany(User, { foreignKey: 'branchId' });

// Tạo một đối tượng để export tất cả
const models = {
  User,
  Branch,
};

// Export sequelize và các model
module.exports = { sequelize, ...models };