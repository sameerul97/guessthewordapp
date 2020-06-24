var fs = require("fs")
var obj = JSON.parse(fs.readFileSync('./data/data.json', 'utf8'));
var roomNames = obj.roomNames;
var createRoom = []

var rClient;
var AppErr = require("../errors/AppError")
const { ErrorMessage, SuccessMessage } = require("../config");
var roomName = "Rain";
var count = 0;
module.exports = {
  /**
   * Sets Redis client service for Roomservice module. 
   * @param {Redis} RedisClientInstance - Redis client instance from node index
   */
  setRClient: function (client) { rClient = client },
  getRClient: function () { return rClient },
  /**
   * Creates a new room by setting the roomname as key in Redis DB.
   * Redis set method has additional params to check whether the room doesnt exist already 
   * if exists already it calls the same function (recursion)
   * @async
   * @returns {Promise<string>} roomname - created roomName to the client
   */
  createRoom: async () => {
    return new Promise((resolve, reject) => {
      var found = false
      var roomName = roomNames[Math.floor(Math.random() * roomNames.length)]
      rClient.set(roomName, roomName, 'NX', 'EX', 50, (err, reply) => {
        if (err) console.log('ERR', err)
        if (reply === 'OK') {
          found = true;
          // console.log("Created room ", roomName); 
          // TODO: create custom error if Create room fails
          (roomName != undefined) ? resolve(roomName) : reject(new Error('No more rooms available'));
        }
        if(reply === null) {
          // Recursion needs to be called in resolve method
          // for the promise to be persisted
          resolve(module.exports.createRoom())
        }
      })
    })
  },
  /**
   * joins a user to the rooname which is passed in
   * @async
   * @param {object} socket instance which requests to be added in a room
   * @param {string} roomToJoin roomName from client which should be already created
   * @returns {Promise<Boolean>} true - if socket is joined
   * @throws {ErrorMessage} will through Unknown Id if socketID is false
   **/
  joinRoom: async (socket, roomToJoin) => {
    return new Promise(function (resolve, reject) {
      // (admin) ? socket._admin = true : socket._admin = false;
      io.of('/').adapter.remoteJoin(socket.id, roomToJoin, (err) => {
        // TODO: create custom error if join room fails
        (err) ? reject(new Error(ErrorMessage.unknownId)) : resolve(SuccessMessage.joinRoom);
      })
    })
  },
  /**
   * Save username in Redis with key as thier sockekId
   * Automatically expired after 1 hour
   * Alternative approach to save data as JSON in Redis
   * @async
   * @param {String} socketId instance which requests to be added in a room
   * @param {String} roomName roomName from client which should be already created
   * @returns {Promise<Boolean>} true - if username is set in Redis
   * @throws {ErrorMessage} Unknown to set username in Redis
   **/
  setUsernameInRedis: async (socketId, roomName, userName) => {
    return new Promise((resolve, reject) => {
      // console.log('Going to add ', socketId, 'NAME ', userName);
      rClient.set(socketId, userName, 'NX', 'EX', 60 * 60 * 24,  function(err, reply) {
        // console.log(reply)
        if (err) console.log('ERR', err)
        if (reply === 'OK') {
          // console.log('Added then');
          // TODO: create custom error if set user name fails
          (roomName != undefined) ? resolve(roomName) : reject(new Error('Unable to set in Redis'));
        } else {
        }
      })
    })
  },
  /**
   * Get all socket username from Redis using the socketIds
   * Using Redis mget method to execute multiple key query
   * @async
   * @param {Array<string>} clientIds instance which requests to be added in a room
   * @returns {Promise<Array>} Array - returns a array of usernames
   * @throws {ErrorMessage} Unknown to set username in Redis
   **/
  getAllUsersInRoom: async (clientIds) => {
    return new Promise((resolve, reject) => {
      rClient.mget(clientIds, function (err, reply) {
        if (err) {
          // TODO: create custom error if get all username fails
          // BUG: (Test) if multiple node instances are running check all communicating properly  
          console.log(err)
          reject(err);
        }
        // console.log('ALL USERS FROM ROOM SERVICE', reply)
        resolve(reply)
      })
    })
  },
  /**
   * gets all socket Ids in a room
   * @async
   * @param {String} roomName to get all the sockets in the room.
   * @returns {Promise<Array>} Array - returns a array of socket Ids in a room  
   * @throws {ErrorMessage} Unknown to get all clients in rom 
   **/
  getAllClientIdsInRoom: async (roomName) => {
    return new Promise((resolve, reject) => {
      io.of('/').adapter.clients([roomName], (err, clients) => {
        // console.log(clients, err);
        // TODO: create custom error if get all client IDs fails
        // console.log(err); 
        (err || clients === null) ? reject(new Error(ErrorMessage.getAllClientsInRoom)) : resolve(clients)
      })
    })
  },
  /**
   * Maps userId (socketId) and usernames and return new array
   * @async
   * @param {Array} clientIds - Socket Ids in the room
   * @param {Array} username - Usernames comes from Redis.
   * @returns {Promise<Array>} Array - returns a new array with new object  
   */
  mapUserIdWithUsername: async (clientIds, usernames) => (
    new Promise((resolve, reject) => resolve(clientIds.map((i, ind) => (
      { id: i, name: usernames[ind] }
    ))))
  ),
  /**
   * Checks whether the room is valid.
   * @asyn
   * @param {String} roomName - roomName which does the query
   * @returns {Promise<boolean>} true - returns a new array with new object
   * @throws {ErrorMessage} Unknown to get all clients in room
   */
  roomExist: async (roomName) => {
    return new Promise(function (resolve, reject) {
      rClient.get(roomName, (err, data) => {
        (err || data === null) ? reject(new RoomNotInDbError()) : resolve(SuccessMessage.roomExist);
      })
    })
  }
}

