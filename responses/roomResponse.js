class CreateRoomResponse {
  constructor(roomName, userId, userList) {
    this.roomName = roomName;
    this.userId = userId;
    this.userList = userList;
  }
}

class JoinRoomResponse extends CreateRoomResponse {
  constructor(success, roomName, userId, userList) {
    super(roomName, userId, userList);
    this.success = success;
  }
}

module.exports = {
  CreateRoomResponse,
  JoinRoomResponse,
};
