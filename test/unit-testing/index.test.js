var io = require("socket.io-client");
var path = require("path");

var {
  createRoom,
  dummyController,
} = require("../../controllers/roomController");
const UserService = require("../../services/userService");
const RoomService = require("../../services/roomService");
// jest.mock("../services/userService");
var userError = require("../../errors/userError");
var socketC1;

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

    expect(typeof response).toBe("object");

    expect(response).toHaveProperty("roomName", "room");
    expect(typeof response.roomName).toBe("string");

    expect(response).toHaveProperty("userId", "00zz54xcsad2121sda1");
    expect(typeof response.userId).toBe("string");

    expect(response).toHaveProperty("userList", arr);
    expect(typeof response.userList).toBe("object");
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
