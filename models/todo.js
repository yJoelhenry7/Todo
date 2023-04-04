"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Todo.belongsTo(models.User,{
        foreignKey:'userId'
      })
    }
    static addTodo({ title, dueDate }) {
      return this.create({ title: title, dueDate: dueDate, completed: false });
    }
    // Remove a Todo using ID
    static async remove(id) {
      return this.destroy({
        where: {
          id,
        },
      });
    }
    // Get all completed Todos
    static async getCompleted() {
      const complete = await this.findAll({
        where: { completed: true },
      });
      return complete;
    }
    // mark as Complete
    markAsCompleted() {
      return this.update({ completed: true });
    }
    // setCompletion Status
    setCompletionStatus(status){
      return this.update({completed :status});
    }
    // Get All the Todos
    static getTodos() {
      return this.findAll();
    }
  }
  Todo.init(
    {
      title: DataTypes.STRING,
      dueDate: DataTypes.DATEONLY,
      completed: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Todo",
    }
  );
  return Todo;
};
