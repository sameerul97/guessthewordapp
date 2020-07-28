function hideTitle() {
  $(".gameTite").hide();
}

function showRoomName() {
  $("#createdRoomName").show();
}

function hideStartGameButton() {
  $(".startGame").hide();
}
function showStartGameButton() {
  $(".startGame").show();
}

function hideUsernameForm() {
  $(".roomOptions").hide();
}

function showScores() {
  $(".scores").show();
}

function enableCanvasDrawing() {
  // show leaveRoom button on canvas
  $(".whiteboard").css({
    "z-index": "9",
  });
}

function disableCanvasDrawing() {
  $(".whiteboard").css({
    "z-index": "-9",
  });
}

function showClearCanvasButton() {
  $(".clearCanvas").css({
    display: "block",
  });
}

function showExitRoomButton() {
  $(".leaveRoom").css({
    display: "block",
  });
}

function showColorSelector() {
  $(".colors").css({
    display: "block",
  });
}

function hideClearCanvasButton() {
  $(".clearCanvas").css({
    display: "none",
  });
}

function hideExitRoomButton() {
  $(".leaveRoom").css({
    display: "none",
  });
}

function hideColorSelector() {
  $(".colors").css({
    display: "none",
  });
}

function showLoader() {
  $("#loading").show();
}

function hideLoader() {
  $("#loading").hide();
}

function alreadyPlayed() {
  if (localStorage.getItem(appName)) {
    return localStorage.getItem(appName);
  }
  return null;
}

function shareableRoomLinkAlreadyGenerated() {
  console.log(moment().format());
  if (localStorage.getItem(appName + "_GENERATED_ROOM_ID") != null) {
    if (RoomLinkNotExpired()) {
      return JSON.parse(localStorage.getItem(appName + "_GENERATED_ROOM_ID"))
        .gameKey;
    } else {
      return null;
    }
  }
  return null;
}

function RoomLinkNotExpired() {
  var expiryTime = JSON.parse(
    localStorage.getItem(appName + "_GENERATED_ROOM_ID")
  ).expiryTime;
  return moment().format() < expiryTime ? true : false;
}

function showWarningMessage(gameErrorType) {
  $(".gameOver").append(
    "<h1>" + AppError.gameErrorType[gameErrorType] + "</h1>"
  );
  setTimeout(function () {
    $(".gameOver").empty();
  }, 3000);
}
