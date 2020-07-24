module.exports = (sequelize, type) => {
  return sequelize.define("Singleplayer_GuestMode_Words", {
    // word_id: {
    //   type: type.INTEGER,
    // },
    round_id: {
      type: type.INTEGER,
      primaryKey: true,
    },
    word: {
      type: type.STRING,
    },
    options: {
      type: type.STRING,
      allowNull: false,
      get() {
        // console.log("Model", this.getDataValue("options").split(";"));
        // return this.getDataValue("options").split(";");
        return JSON.parse(this.getDataValue("options"));
      },
      set(val) {
        // console.log("Model", val.join(";"));
        this.setDataValue("options", JSON.stringify(val));
      },
    },
    alreadyGuessed: {
      type: type.BOOLEAN,
      defaultValue: false,
    },
  });
};
