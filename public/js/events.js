socket.on("roomVerified", function (data) {
  if (!data.success) {
    // console.log(data);
    $("#modal-2-content").prepend(
      '<p class="errorMessage">' + data.message + "</p>"
    );
    setTimeout(function () {
      $("#modal-2-content p").remove();
    }, 3000);
  } else {
    MicroModal.close("joinRoomModal");
    $(".createRoom").hide();
    $(".joinRoom").hide();
    if (localStorage.getItem(appName + "_GENERATED_ROOM_ID")) {
      // $(".game").hide();
      showStartGameButton();
      currentlyPlaying = true;
    } else {
      $(".game").hide();
    }
    positionButtonsInCanvasResponsively();
    showScores();
    hideUsernameForm();
    showExitRoomButton();
    document.getElementById("createdRoomName").innerHTML =
      "Room name : " + currentRoom;
  }
});

// socket.on('drawing', onDrawingEvent(data.data));
socket.on("drawing", function (data) {
  // console.log("INCOMIN DATA : " , data.data);
  onDrawingEvent(data.data);
});

// getting all connected user
socket.on("aUserJoined", function (data) {
  console.log("Connected user : ", data);
  $(".alluser").show();
  showRoomName();
  allUsers = data;
  // let userId = data.userId, username = data.username;
  $(".connectedUsers").empty();
  for (i in data) {
    if (data[i].id === userId) {
      $(".connectedUsers").append(
        "<div id=" + data[i].id + ">" + data[i].name + " (YOU) </div>"
      );
    } else {
      $(".connectedUsers").append(
        "<div id=" + data[i].id + ">" + data[i].name + "</div>"
      );
    }
  }
  // $(".connectedUsers").append("<div id=" + userId + ">" + username + "</div>")
});

// user left a room
socket.on("aUserLeft", function (data) {
  console.log("user left : ", data);
  $(".connectedUsers div").each(function (index) {
    if ($(this).attr("id") == data) {
      $(this).remove();
    }
  });
});

// Server sends chosenWord to the client if its user turn to draw the game
socket.on("gameWords", function (data) {
  // console.log("INCOMING WORD DATA : " , data.data);
  // onDrawingEvent(data.data);
});

// Server sends option array object
socket.on("options", function (data) {
  // console.log("INCOMING OPTION WORD : " , data);
  $(".wordToGuess_options").empty();
  $(".wordToGuess").empty();
  disableCanvasDrawing();
  clearCanvasOnNewWord();
  currentlyPlaying = false;
  alreadyGuessed = false;

  for (i in data) {
    $(".wordToGuess_options").append(
      "<button class='options modal__btn modal__btn-primary '>" +
        data[i] +
        "</button>"
    );
  }
  $(".wordToGuess_options").append("<br>");
});

// chosenword for user
socket.on("word", function (word) {
  currentlyPlaying = true;
  // console.log(word);
  $(".wordToGuess").empty();
  $(".wordToGuess_options").empty();
  clearCanvasOnNewWord();
  enableCanvasDrawing();
  showClearCanvasButton();
  showColorSelector();
  $(".wordToGuess").append("<p>" + word + "</p>");
});

socket.on("chosenWord", function (data) {
  // console.log("INCOMING CHOSEN WORD : " , data);
  // $(".wordToGuess").empty();
  $(".wordToGuess").append("<p>" + data + "</p>");
  // onDrawingEvent(data.data);
});

socket.on("nextPlayerAlert", function (data) {
  console.log("nextPlayerAlert", data);
  var cUsers = $(".connectedUsers").children();
  setTimeout(function () {
    var nextPlayingUser = undefined;
    console.log("Setting border for new user");
    $(".connectedUsers")
      .children("div")
      .each(function (i, el) {
        // console.log(i,el, $(this))
        $(this).css({
          border: "none",
        });
      });
    $(".connectedUsers")
      .children("div")
      .each(function (i, el) {
        // console.log(i,el, $(this))
        if ($(this).attr("id") === data.userGoingToPlay) {
          nextPlayingUser = $(this).text();
          $(this).css({
            border: "2px solid black",
          });
          showClearCanvasButton();
          showColorSelector();
        }
      });
    disableCanvasDrawing();
    hideClearCanvasButton();
    hideColorSelector();
    $(".wordToGuess_options , .wordToGuess").empty();
    $(".wordToGuess").append("<p>" + nextPlayingUser + " is drawing now </p>");
  }, data.timerSeconds);

  // console.log("Event emmited");
  // roomInstance = data.gameInstanceIndex;
  // $(".wordToGuess_options").empty();
  // $(".wordToGuess").empty();

  // initiateHandshake(data.gameInstanceIndex);
});

socket.on("youArePlayingNext", function (data) {
  if (data.playing) {
    // roomInstance = data.gameInstanceIndex;
    initiateHandshake();
    // currentlyPlaying = true;
    // enableCanvasDrawing();
  }
});

socket.on("setGameInstance", function (data) {
  roomInstance = data;
});

socket.on("userId", function (data) {
  userId = data;
});

socket.on("scoresUpdated", function (data) {
  var scoresData = data.data;
  var tempScores = [];
  console.log("Scores ", scoresData);
  for (var i in scoresData) {
    for (var tempIndex in allUsers) {
      if (scoresData[i].id === allUsers[tempIndex].id) {
        // console.log(allUsers[tempIndex]);
        tempScores.push(
          "<p>" + allUsers[tempIndex].name + " " + scoresData[i].score + "</p>"
        );
        // console.log(tempScores)
      }
    }
  }
  // console.log(tempScores)
  $(".user_scores").empty();
  for (i in tempScores) {
    $(".user_scores").append(tempScores[i]);
  }
});

socket.on("clearCanvas", function (data) {
  if (data) {
    clearCanvasOnNewWord();
  }
});

socket.on("gameOver", function (score, reason) {
  $(".gameOver").append("<h1>Gameover</h1>");

  if (reason != null) {
    $(".gameOver").append("<h1>" + reason + " </h1>");
  }
  // FIXME:Update generated room record with gamefinished
  //   This event should trigger on game3 entity.js once the gameover is triggererd
  if (localStorage.getItem(appName + "_GENERATED_ROOM_ID")) {
    var gameKey = JSON.parse(
      localStorage.getItem(appName + "_GENERATED_ROOM_ID")
    ).gameKey;
    $.ajax({
      url: "/api/game/gameover",
      type: "POST",
      beforeSend: function (xhr) {},
      data: {
        game_id: gameKey,
      },
      success: function (response) {
        console.log(response);
        //   Update local storage with game finshed object
        //  so next time user loads up the link check if game already finshed
      },
      error: function (error) {
        console.error("Got error response", error);
      },
    });
  }
});

socket.on("verifiedAnswer", function (data) {
  if (data.correct) {
    $(".wordToGuess_options")
      .children("button")
      .each(function (i, el) {
        // console.log($(this).text())
        if (data.correctAnswer === $(this).text()) {
          $(this).css({
            "background-color": "green",
          });
        }
      });
  } else {
    $(".wordToGuess_options")
      .children("button")
      .each(function (i, el) {
        console.log($(this).text() === data.correctAnswer);
        if ($(this).text() === selectedWord) {
          $(this).css({
            "background-color": "red",
          });
        }
        if ($(this).text() === data.correctAnswer) {
          $(this).css({
            "background-color": "green",
          });
        }
      });
  }
});
