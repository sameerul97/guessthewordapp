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

describe("Create Room With no username", () => {
  test("should throw invalid username error", async () => {
    jest.spyOn(UserService, "setUsername").mockReturnValue(false);

    var roomName = await createRoom()("");

    expect(roomName).toMatchObject(new InvalidUsernameError());
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
    // const mMemberRecord = { id: '1', username: 'KF1' };
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
    // const mMemberRecord = { id: '1', username: 'KF1' };
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
