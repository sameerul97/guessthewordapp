var io = require("socket.io-client");
var path = require("path");

var { dummyController } = require("../controllers/roomController");
var User = require("../services/userService");
// jest.mock("../services/userService");
var userError = require("../errors/userError");
var socketC1;
 
var initSocket = () => {
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