module.exports = {
  /**
   * Creats a new room and returns selected room name and removes the selected room name from the array
   * @param {socket} socket instance
   * @param {userNames} userName object from game_data json file
   * @param {roomNames} roomNames object from game_data json file
   * @returns {roomName} created roomName to the client  
   */
  createRoom: (socket, userName, roomNames) => {
    socket.userName = userName;
    socket._admin = true;
    var roomName = roomNames[Math.floor(Math.random() * roomNames.length)];
    // var index2Pop = roomNames.findIndex(room => room === roomName); 
    let index2Pop = roomNames.indexOf(roomName)
    socket.join(roomName);
    // remove the name from the roomNames list once joined
    roomNames.splice(index2Pop, 1);
    // roomNames.pop(roomNames.findIndex(room => room === roomName));
    // console.log(socket.userName , " created a room called ", roomName);
    return roomName;
  },
  /**
   * joins a user to specific room
   * @param {socket} socket instance
   * @param {roomToJoin} roomToJoin roomName from client which should be already created
   * @param {userName} userName roomName from client which is set to that socket instance
   * @returns none
   **/
  joinRoom: (socket, roomToJoin, userName) => {
    socket.userName = userName;
    socket._admin = false;
    socket.join(roomToJoin);
  },
  /**
   * gets all users in a room
   * @param {io} socket io instance
   * @param {roomToJoin} roomToJoin roomName from client which is used to get all clients in the room
   * @param {callback} callback function expects connectedUsers array which is sent to the user
   * @returns none
   **/
  getAllUsersInARoom: (io, roomToJoin, callback) => {
    var connectedUsers = [];
    var sockets = io.in(roomToJoin);
    io.of('/').adapter.clients([roomToJoin], (err, clients) => {
      // console.log("IDS ", clients);
      for (i in clients) {
        Object.keys(sockets.sockets).forEach((item) => {
          if (sockets.sockets[item].id == clients[i]) {
            // console.log("User connected in " , room , " room " , sockets.sockets[item].userName, sockets.sockets[item].rooms);
            connectedUsers.push({
              id: sockets.sockets[item].id,
              name: sockets.sockets[item].userName
            });
          }
        })
      }
      callback(connectedUsers);
    });
  }
}