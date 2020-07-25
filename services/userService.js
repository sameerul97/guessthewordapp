const { SuccessMessage, ErrorMessage } = require("../config");
const UserError = require("../errors/userError");

module.exports = {
  setUsername: async (socket, username) => {
    return new Promise((resolve, reject) => {
      if (
        username != null &&
        username != undefined &&
        username.match(/^ *$/) === null
      ) {
        socket._username = username;
        resolve(true);
      } else {
        reject(new InvalidUsernameError());
      }
    });
  },
  setAdmin: (socket, admin) =>
    admin ? (socket._admin = true) : (socket._admin = false),
  getUserId: (socket) => socket.id,
  getUsername: (socket) => socket._username,

  dummyUserServiceMethod1: async () => {
    return new Promise((resolve, reject) => {
      let user = {
        userName: "sam",
        id: "someRandomUUID",
      };
      resolve(user);
      // reject(new RoomNotInDbError());
    });
  },

  dummyUserServiceMethod2: async (data) => {
    return new Promise((resolve, reject) => {
      if(data != undefined){
        data["admin"] = true;
        resolve(data);  
      }else{
        reject(new RoomNotInDbError());
      }
    });
  },
};
