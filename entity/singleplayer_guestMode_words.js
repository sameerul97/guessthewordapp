module.exports = (sequelize, type) => {
  return sequelize.define("Singleplayer_GuestMode_Words", {
    // word_id: {
    //   type: type.INTEGER,
    // },
    word: {
      type: type.STRING,
    },
    options: {
      type: type.ARRAY(type.TEXT),
    },
    alreadyGuessed: {
      type: type.BOOLEAN,
      defaultValue: false,
    },
  });
};
