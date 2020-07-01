const io = require("socket.io-client");
const { dummyController } = require("../controllers/roomController");
const User = require("../services/userService");
// jest.mock("../services/userService");
var userError = require("../errors/userError");
var socketC1;

const initSocket = () => {
  return new Promise((resolve, reject) => {
    const socket = io("localhost:3000", {
      "reconnection delay": 0,
      "reopen delay": 0,
      "force new connection": true,
    });

    socket.on("connect", () => {
      resolve(socket);
    });

    setTimeout(() => {
      reject(new Error("Failed to connect wihtin 5 seconds."));
    }, 5000);
  });
};

beforeAll(async () => {
  socketC1 = await initSocket();
});


// https://stackoverflow.com/questions/33216838/how-to-write-tests-socket-io-app-unit-testing
test("Should throw invalidUsername error", async (done) => {
  socketC1.emit("createRoom", { username: "" });
  // UserService.setUsername = jest.fn().mockRejectedValueOnce(new Error('network error'));
  socketC1.on("invalidUsername", (message) => {
    expect(message).toMatchObject({
      message: "Username is invalid, verify and try again",
      name: "Invalid Username",
    });
    done();
  });
});

test("Should Create new room and return Roomname", async (done) => {
  socketC1.emit("createRoom", { username: "sameer" });
  // UserService.setUsername = jest.fn().mockRejectedValueOnce(new Error('network error'));
  socketC1.on("roomNameIs", (message) => {
    // expect(message).to.be.a('string');
    expect(typeof message).toBe('string');

    done();
  });
});

// jest.mock("../services/userService", () => ({
//   dummyUserServiceMethod1: jest.fn(),
// }));
describe("dummyController Test", () => {
  test("should return user object", async () => {
    var mockData = {
      user: {
        userName: "testuser",
        id: "testUserRandomUUID",
      },
    };
    // const mMemberRecord = { id: '1', username: 'KF1' };
    jest.spyOn(User, "dummyUserServiceMethod1").mockResolvedValueOnce(mockData);
    mockData.user["admin"] = true;
    jest.spyOn(User, "dummyUserServiceMethod2").mockResolvedValueOnce(mockData);

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
    jest.spyOn(User, "dummyUserServiceMethod1").mockResolvedValueOnce(mockData);
    jest.spyOn(User, "dummyUserServiceMethod2").mockRejectedValueOnce(new RoomNotInDbError());

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


