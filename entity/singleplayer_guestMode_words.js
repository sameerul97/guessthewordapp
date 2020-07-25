module.exports = (sequelize, type) => {
  const Singleplayer_GuestMode_Words_Model = sequelize.define(
    "Singleplayer_GuestMode_Words",
    {
      // word_id: {
      //   type: type.INTEGER,
      // },
      round_id: {
        type: type.INTEGER,
        autoIncrement: true,
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
    }
  );
  Singleplayer_GuestMode_Words_Model.prototype.toJSON = function () {
    var values = Object.assign({}, this.get());
    // console.log(values)
    delete values.createdAt;
    delete values.updatedAt;
    delete values.fk_gameid;
    delete values.alreadyGuessed;
    // delete values.word;
    return values;
  };
  return Singleplayer_GuestMode_Words_Model;
};
