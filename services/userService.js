const { SuccessMessage, ErrorMessage } = require("../config");
      module.exports                   = {
    setUsername: async (socket, username) => {
        return new Promise((resolve, reject) => {
            if (username != null && username != undefined &&
                username.match(/^ *$/) === null) {
                socket._username = username;
                resolve(true);
            } else {
                reject(new Error(ErrorMessage.usernameNotValid));
            }
        });
    },
    setAdmin   : (socket, admin) => (admin) ? socket._admin = true: socket._admin = false,
    getUserId  : (socket) => socket.id,
    getUsername: (socket) => socket._username,
}