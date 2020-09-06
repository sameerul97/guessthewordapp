var io = require("socket.io-client");
var path = require("path");
var {
  createRoom,
  joinRoom,
  dummyController,
} = require("../../controllers/roomController");
const { playGame } = require("../../controllers/gameController");

const UserService = require("../../services/userService");
const RoomService = require("../../services/roomService");
const GameService = require("../../services/gameService");
const TestUtils = require("../utils/utils");
const {
  CreateRoomResponse,
  JoinRoomResponse,
} = require("../../responses/roomResponse");

require("../../errors/gameError");
require("../../errors/userError");
require("../../errors/AppError");

// jest.mock("../services/userService", () => ({
//   dummyUserServiceMethod1: jest.fn(),
// }));

describe("Create Room", () => {
  test("should throw invalid username error", async () => {
    jest.spyOn(UserService, "setUsername").mockReturnValue(false);

    var roomName = await createRoom()("");

    expect(roomName).toMatchObject(new InvalidUsernameError());
  });
  test("should return userId, roomName, userList", async () => {
    var userName = "sameer";
    var socket = { id: "00zz54xcsad2121sda1", username: "sameer" };
    var clientIdsInRoom = ["00zz54xcsad2121sda1"];
    var AllUserNameInRoom = ["sameer"];
    var arr = [{ id: "00zz54xcsad2121sda1", name: "sameer" }];

    jest.spyOn(UserService, "getUserId").mockReturnValue(socket.id);
    jest.spyOn(UserService, "getUsername").mockReturnValue(socket.username);
    jest.spyOn(UserService, "setAdmin").mockReturnValue(true);

    jest.spyOn(UserService, "setUsername").mockResolvedValueOnce(true);
    jest.spyOn(RoomService, "createRoom").mockResolvedValueOnce("room");
    jest.spyOn(RoomService, "joinRoom").mockResolvedValueOnce(true);
    jest.spyOn(RoomService, "setUsernameInRedis").mockResolvedValueOnce(true);
    jest
      .spyOn(RoomService, "getAllClientIdsInRoom")
      .mockResolvedValueOnce(clientIdsInRoom);
    jest
      .spyOn(RoomService, "getAllUsersInRoom")
      .mockResolvedValueOnce(AllUserNameInRoom);
    jest.spyOn(RoomService, "mapUserIdWithUsername").mockResolvedValueOnce(arr);

    var response = await createRoom()({ username: userName });

    expect(response).toBeInstanceOf(CreateRoomResponse);

    expect(typeof response).toBe("object");

    expect(response).toHaveProperty("roomName", "room");
    expect(typeof response.roomName).toBe("string");

    expect(response).toHaveProperty("userId", "00zz54xcsad2121sda1");
    expect(typeof response.userId).toBe("string");

    expect(response).toHaveProperty("userList", arr);
    expect(typeof response.userList).toBe("object");
  });
});

describe("join room", () => {
  test("should return room not valid error on passing empty roomname params", async () => {
    var username = "sameer";
    var roomname = "";

    var response = await joinRoom()({ roomname, username });

    expect(response).toMatchObject(new RoomNotInDbError());
  });

  test("should return username not valid error on passing empty username params", async () => {
    var username = "";
    var roomname = "test";

    var response = await joinRoom()({ roomname, username });

    expect(response).toMatchObject(new InvalidUsernameError());
  });

  test("should return room not exist on sending invalid roomname", async () => {
    var username = "sameer";
    var roomname = "testRoom";

    jest.spyOn(UserService, "setUsername").mockReturnValue(true);
    jest.spyOn(RoomService, "roomExist").mockResolvedValueOnce(false);

    var response = await joinRoom()({ roomname: roomname, username });

    expect(response).toMatchObject(new RoomNotInDbError());
  });

  test("should return game already started error", async () => {
    var username = "sameer";
    var roomname = "leaf";
    var roomKey = "94d1c92c-0d3c-484e-8f77-9cbd169409e7";
    var gameObject = TestUtils.gameObject();

    jest.spyOn(UserService, "setUsername").mockReturnValue(true);
    jest.spyOn(RoomService, "roomExist").mockResolvedValueOnce(true);
    jest.spyOn(RoomService, "getRoomKey").mockResolvedValueOnce(roomKey);
    jest.spyOn(GameService, "getGameObject").mockResolvedValueOnce(gameObject);

    var response = await joinRoom()({ roomname: roomname, username });

    expect(response).toMatchObject(new GameAlreadyStarted());
  });

  test("should return join room sucessful", async () => {
    var username = "sameer";
    var roomname = "leaf";
    var roomKey = "94d1c92c-0d3c-484e-8f77-9cbd169409e7";
    var gameObject = TestUtils.gameObject();
    var socket = { id: "00zz54xcsad2121szas2", username: username };
    var clientIdsInRoom = ["00zz54xcsad2121szas2", "00zz54xcsad2121sda1"];
    var AllUserNameInRoom = ["sameer", "sam"];
    var arr = [
      {
        id: "00zz54xcsad2121szas2",
        name: "sameer",
      },
      {
        id: "00zz54xcsad2121sda1",
        name: "sam",
      },
    ];

    // var joinRoom = new JoinRoom(true, roomname,00zz54xcsad2121szas2, arr);

    jest.spyOn(UserService, "getUserId").mockReturnValue(socket.id);
    jest.spyOn(UserService, "getUsername").mockReturnValue(socket.username);

    jest.spyOn(UserService, "setUsername").mockReturnValue(true);
    jest.spyOn(RoomService, "roomExist").mockResolvedValueOnce(true);
    jest.spyOn(RoomService, "getRoomKey").mockResolvedValueOnce(roomKey);
    jest.spyOn(GameService, "getGameObject").mockResolvedValueOnce(null);
    jest.spyOn(UserService, "setAdmin").mockReturnValue(false);

    jest.spyOn(RoomService, "joinRoom").mockResolvedValueOnce(true);
    jest.spyOn(RoomService, "setUsernameInRedis").mockResolvedValueOnce(true);

    jest
      .spyOn(RoomService, "getAllClientIdsInRoom")
      .mockResolvedValueOnce(clientIdsInRoom);
    jest
      .spyOn(RoomService, "getAllUsersInRoom")
      .mockResolvedValueOnce(AllUserNameInRoom);
    jest.spyOn(RoomService, "mapUserIdWithUsername").mockResolvedValueOnce(arr);

    var response = await joinRoom()({ roomname: roomname, username });

    expect(response).toBeInstanceOf(JoinRoomResponse);

    expect(response).toHaveProperty("success", true);
    expect(typeof response.success).toBe("boolean");

    expect(response).toHaveProperty("userId", "00zz54xcsad2121szas2");
    expect(typeof response.userId).toBe("string");

    expect(response).toHaveProperty("userList", arr);
    expect(typeof response.userList).toBe("object");
  });
});

describe("play game", () => {
  test("should throw only admin can start game when non admin starts game", async () => {
    // jest.spyOn(UserService, "setUsername").mockReturnValue(false);
    var socket = {
      id: "00zz54xcsad2121sda1",
      username: "sameer",
      _admin: false,
    };

    var roomName = await playGame(socket)("test", null);

    expect(roomName).toMatchObject(new OnlyAdminCanStartGameError());
  });

  test("should return room not exist on sending invalid roomname", async () => {
    var username = "sameer";
    var roomname = "testRoom";
    var socket = {
      id: "00zz54xcsad2121sda1",
      username: "sameer",
      _admin: true,
    };

    jest.spyOn(UserService, "setUsername").mockReturnValue(true);
    jest.spyOn(RoomService, "roomExist").mockResolvedValueOnce(false);

    var response = await playGame(socket)("test", null);

    expect(response).toMatchObject(new RoomNotInDbError());
  });

  test("should return game already started error", async () => {
    var username = "sameer";
    var roomname = "leaf";
    var roomKey = "94d1c92c-0d3c-484e-8f77-9cbd169409e7";
    var socket = {
      id: "00zz54xcsad2121sda1",
      username: "sameer",
      _admin: true,
    };
    var gameObject = TestUtils.gameObject();

    jest.spyOn(UserService, "setUsername").mockReturnValue(true);
    jest.spyOn(RoomService, "roomExist").mockResolvedValueOnce(true);
    jest.spyOn(RoomService, "getRoomKey").mockResolvedValueOnce(roomKey);
    jest.spyOn(GameService, "getGameObject").mockResolvedValueOnce(gameObject);

    var response = await playGame(socket)("test", null);

    expect(response).toMatchObject(new GameAlreadyStarted());
  });

  test("should return no of users not met error", async () => {
    var username = "sameer";
    var roomname = "leaf";
    var roomKey = "94d1c92c-0d3c-484e-8f77-9cbd169409e7";
    var socket = {
      id: "00zz54xcsad2121sda1",
      username: "sameer",
      _admin: true,
    };
    var gameObject = TestUtils.gameObjectWithGameNotStarted();
    var clientIdsInRoom = ["00zz54xcsad2121szas2"];

    jest.spyOn(UserService, "setUsername").mockReturnValue(true);
    jest.spyOn(RoomService, "roomExist").mockResolvedValueOnce(true);
    jest.spyOn(RoomService, "getRoomKey").mockResolvedValueOnce(roomKey);
    jest.spyOn(GameService, "getGameObject").mockResolvedValueOnce(null);
    jest
      .spyOn(RoomService, "getAllClientIdsInRoom")
      .mockResolvedValueOnce(clientIdsInRoom);

    var response = await playGame(socket)("test", null);

    expect(response).toMatchObject(new NoOfUserNotMetError());
  });
});
describe("dummyController Test", () => {
  test("should return user object", async () => {
    var mockData = {
      user: {
        userName: "testuser",
        id: "testUserRandomUUID",
      },
    };

    jest
      .spyOn(UserService, "dummyUserServiceMethod1")
      .mockResolvedValueOnce(mockData);

    mockData.user["admin"] = true;

    jest
      .spyOn(UserService, "dummyUserServiceMethod2")
      .mockResolvedValueOnce(mockData);

    var res = await dummyController();

    expect(res).toMatchObject({
      user: {
        userName: "testuser",
        id: "testUserRandomUUID",
        admin: true,
      },
    });
  });

  test("should return error", async () => {
    const mockData = {
      user: {
        userName: "testuser",
        id: "testUserRandomUUID",
      },
    };

    jest
      .spyOn(UserService, "dummyUserServiceMethod1")
      .mockResolvedValueOnce(mockData);
    jest
      .spyOn(UserService, "dummyUserServiceMethod2")
      .mockRejectedValueOnce(new RoomNotInDbError());

    var res = await dummyController();

    expect(res).toMatchObject(new RoomNotInDbError());
  });
});

// Mocking service method while passing in data
// test('drink returns La Croix', () => {
//   const beverage = {name: 'La Croix'};
//   const drink = jest.fn(beverage => beverage.name);

//   drink(beverage);

//   expect(drink).toHaveReturnedWith('La Croix');
// });
