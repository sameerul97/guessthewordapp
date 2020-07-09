module.exports = (sequelize, type) => {
  return sequelize.define("GameRoomLink", {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    roomName: type.STRING,
    gameKey: {
      type: type.UUID,
      defaultValue: type.UUIDV4,
    },
  });
};

// const { DataTypes } = require("sequelize");

// var sequelize;

// var User;
// async function pgTest() {
//   //   console.log(sequelize);
//   User = sequelize.define("user", {
//     name: DataTypes.TEXT,
//     favoriteColor: {
//       type: DataTypes.TEXT,
//       defaultValue: "red",
//     },
//     gameKey: {
//       type: DataTypes.UUID,
//       defaultValue: DataTypes.UUIDV4,
//     },
//   });
//   pgTest2();
// }

// async function pgTest2() {
//   await sequelize.sync({ force: false });
//   // await sequelize.sync();
//   const jane = await User.create({
//     name: "Sameer",
//     lastName: "Sameerul",
//     favoriteColor: "Green",
//   });
//   const users = await User.findAll();
//   console.log("All users:", JSON.stringify(users, null, 2));
// }
