'use strict';
var socket = io({ reconnection: false });
// currentRoom hold user connected room (ie room called 'cat' )
var currentRoom = undefined;
var userName = undefined;
var selectedWord = undefined;
var roomInstance = undefined;
var allUsers = undefined;
var userId = undefined;
var currentlyPlaying = false;

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

function showLeaveroomButton() {
  $(".leaveRoom").css({
    // "position": "relative",
    "position": "absolute",
    "display": "block",
    "bottom": "0",
    "left": document.getElementsByClassName("whiteboard")[0].offsetLeft - document.getElementsByClassName("whiteboard")[0].offsetWidth / 2 + "px",
    "z-index": "10"
  })

  $(".clearCanvas").css({
    // "position": "relative",
    "display": "block",
    "right": document.getElementsByClassName("whiteboard")[0].offsetLeft - document.getElementsByClassName("whiteboard")[0].offsetWidth / 2 + "px",
    "z-index": "10"
  })

  $(".colors").css({
    "left": document.getElementsByClassName("whiteboard")[0].offsetLeft - document.getElementsByClassName("whiteboard")[0].offsetWidth / 2 + "px",
    "bottom": "30px ",
    "display": "block",
    "transform": "translate(-0%, 0%)"
  })

  $(".canvas-container").css({
    // "margin-top": $(".leaveRoom").outerHeight() + "px"
  })
}

function showScores() {
  $(".scores").show();
}

function enableCanvasDrawing() {
  // show leaveRoom button on canvas
  $(".whiteboard").css({
    "z-index": "9"
  })
}

function disableCanvasDrawing() {
  $(".whiteboard").css({
    "z-index": "-9"
  })
}
// Checking if the username field is valid
function username() {
  if (!document.getElementById("userName").value.length < 1) {
    userName = document.getElementById("userName").value;
    return true;
  } else {
    document.getElementById('userNameForm').style.border = "2px solid red";
    setTimeout(function () {
      document.getElementById('userNameForm').style.border = "0px solid transparent";
    }, 3000)
  }
  return false;
}

// user requesting to create a new room in the server.
function createRoom(e) {
  e.preventDefault();
  if (username()) {
    // Asking to create a new room
    socket.emit('createRoom', userName);
    // socket replies back with created room name (which should be sent to other user who wants to play together)
    socket.on("roomNameIs", function (roomName) {
      // console.log(roomName);
      document.getElementById('createdRoomName').innerHTML = "Room name : " + roomName;
      $("#createdRoomName").show();
      currentRoom = roomName;
      $(".joinRoom").hide()
      $(".createRoom").hide()
      showStartGameButton();
      currentlyPlaying = true
    })
  }
}


function triggerJoinRoomModal() {
  if (username()) {
    MicroModal.show('joinRoomModal');
  }
}


// User joining a existing room in server
function joinRoom(e) {
  e.preventDefault();
  if (username()) {
    var enteredRoomName = document.getElementById("enteredRoomName").value;
    userName = document.getElementById('userName').value;
    socket.emit('joinRoom', enteredRoomName, userName);
    // check whether room is in server if not show error to user
    // toggle modal if success
    currentRoom = enteredRoomName;
    $(".createRoom").hide()
    $(".joinRoom").hide()
    $(".game").hide();
    showLeaveroomButton();
    showScores();
    hideUsernameForm();
    // enableCanvasDrawing();

  }
}

// exit room 
function leaveRoom() {
  socket.emit("leaveRoom", currentRoom);
  $(".createRoom , .joinRoom").show()
  // $(".joinRoom").hide()
  $(".leaveRoom").hide()
}

// user starting game
function playGame() {
  $(".game").hide();
  // enableCanvasDrawing();
  enableCanvasDrawing();
  showLeaveroomButton();
  hideUsernameForm();
  showScores();

  console.log("Asking server to start game and words");
  if (username()) {
    socket.emit('playGame', currentRoom);
    // socket.on('word',function(word){
    //   console.log(word);

    // })

  }
}

function clearCanvasOnNewWord() {
  var canvas = document.getElementsByClassName('whiteboard')[0];
  var colors = document.getElementsByClassName('color');
  var context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
}

function clearCanvas() {
  if (currentlyPlaying) {
    // var canvas = document.getElementsByClassName('whiteboard')[0];
    // var colors = document.getElementsByClassName('color');
    // var context = canvas.getContext('2d');
    // context.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit("clearCanvas", { gameInstanceIndex: roomInstance });
  }

}


function sayOkay(gameInstanceIndex) {
  console.log("Intiating handshake okay with new client")
  socket.emit('handshakeBoom', gameInstanceIndex);
}


// event delegation for dynamic content
$('.words').on("click", '.options', function () {
  // console.log("TEXT clicked");
  console.log($(this).text());

  socket.emit("selectedAnswer", { gameInstanceIndex: roomInstance, selectedAnswer: $(this).text() })
});

// Init function
(function () {

  // var socket = io();
  var canvas = document.getElementsByClassName('whiteboard')[0];
  var colors = document.getElementsByClassName('color');
  var context = canvas.getContext('2d');


  // create a room (replies back with unique room name)


  // // Test private message
  // socket.emit('private message', "sup", {
  //   msg: "Yooo",
  //   msg: "Yooo2"
  // });

  // // Listen to event
  // socket.on('this',function(data){
  //   console.log(data)
  // })

  var current = {
    color: 'black'
  };
  var drawing = false;

  canvas.addEventListener('mousedown', onMouseDown, false);
  canvas.addEventListener('mouseup', onMouseUp, false);
  canvas.addEventListener('mouseout', onMouseUp, false);
  canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);

  //Touch support for mobile devices
  canvas.addEventListener('touchstart', onMouseDown, false);
  canvas.addEventListener('touchend', onMouseUp, false);
  canvas.addEventListener('touchcancel', onMouseUp, false);
  canvas.addEventListener('touchmove', throttle(onMouseMove, 10), false);

  for (var i = 0; i < colors.length; i++) {
    colors[i].addEventListener('click', onColorUpdate, false);
  }



  // socket.on('drawing', onDrawingEvent(data.data));
  socket.on('drawing', function (data) {
    // console.log("INCOMIN DATA : " , data.data);
    onDrawingEvent(data.data);
  });

  // getting all connected user
  socket.on('aUserJoined', function (data) {

    console.log("Connected user : ", data);
    $(".alluser").show();
    showRoomName();
    allUsers = data;
    $(".connectedUsers").empty();
    for (i in data) {
      $(".connectedUsers").append("<div id=" + data[i].id + ">" + data[i].name + "</div>")
    }
  });

  // user left a room
  socket.on('aUserLeft', function (data) {
    console.log("user left : ", data);
    $(".connectedUsers div").each(function (index) {
      if ($(this).attr('id') == data) {
        $(this).remove();
      }
    });
  });

  // Server sends chosenWord to the client if its user turn to draw the game
  socket.on('gameWords', function (data) {
    // console.log("INCOMING WORD DATA : " , data.data);
    // onDrawingEvent(data.data);
  });

  // Server sends option array object 
  socket.on('options', function (data) {
    // console.log("INCOMING OPTION WORD : " , data);
    $(".wordToGuess_options").empty();
    $(".wordToGuess").empty();
    disableCanvasDrawing();
    clearCanvasOnNewWord();
    currentlyPlaying = false;

    for (i in data) {
      $(".wordToGuess_options").append("<button class='options modal__btn modal__btn-primary '>" + data[i] + "</button>")
    }
    $(".wordToGuess_options").append("<br>")

  });

  // chosenword for user
  socket.on('word', function (word) {
    currentlyPlaying = true;
    // console.log(word);
    $(".wordToGuess").empty();
    $(".wordToGuess_options").empty();
    clearCanvasOnNewWord();
    enableCanvasDrawing();
    $(".wordToGuess").append("<p>" + word + "</p>");
  })



  socket.on('chosenWord', function (data) {
    // console.log("INCOMING CHOSEN WORD : " , data);
    // $(".wordToGuess").empty();
    $(".wordToGuess").append("<p>" + data + "</p>")
    // onDrawingEvent(data.data);
  });



  socket.on('nextPlayerAlert', function (data) {
    console.log("nextPlayerAlert", data);
    var cUsers = $(".connectedUsers").children();
    setTimeout(function () {
      var nextPlayingUser = undefined;
      console.log("Setting border for new user")
      $('.connectedUsers').children('div').each(function (i, el) {
        // console.log(i,el, $(this)) 
        $(this).css({
          border: "none"
        })
      });
      $('.connectedUsers').children('div').each(function (i, el) {
        // console.log(i,el, $(this))
        if ($(this).attr("id") === data.userGoingToPlay) {
          nextPlayingUser = $(this).text();
          $(this).css({
            border: "2px solid black"
          })
        }
      });
      disableCanvasDrawing();
      $(".wordToGuess_options , .wordToGuess").empty();
      $(".wordToGuess").append("<p>"+ nextPlayingUser +  " is drawing now </p>");
    }, data.timerSeconds)

    // console.log("Event emmited");
    roomInstance = data.gameInstanceIndex;
    // $(".wordToGuess_options").empty();
    // $(".wordToGuess").empty();

    // sayOkay(data.gameInstanceIndex);
  });

  socket.on("youArePlayingNext", function (data) {
    if (data.playing) {
      roomInstance = data.gameInstanceIndex;
      sayOkay(data.gameInstanceIndex);
      // currentlyPlaying = true;
      // enableCanvasDrawing();
    }
  })

  socket.on("setGameInstance", function (data) {
    roomInstance = data;
  });


  socket.on("userId", function (data) {
    userId = data;
  })




  socket.on("scoresUpdated", function (data) {
    var scoresData = data.data;
    var tempScores = [];
    console.log("Scores ", scoresData);
    for (var i in scoresData) {
      for (var tempIndex in allUsers) {
        if (scoresData[i].id == allUsers[tempIndex].id) {
          // console.log(allUsers[tempIndex]);
          tempScores.push("<p>" + allUsers[tempIndex].name + " " + scoresData[i].score + "</p>");
          // console.log(tempScores)
        }
      }
    }
    // console.log(tempScores)
    $(".user_scores").empty();
    for (i in tempScores) {
      $(".user_scores").append(tempScores[i]);
    }
  })

  socket.on("clearCanvas", function (data) {
    if (data) {
      clearCanvasOnNewWord();
    }
  })


  socket.on("gameOver", function (data) {
    $(".gameOver").append("<h1>Gameover</h1>")
  });

  // socket.on('handshake',function(data, ack){
  //   console.log("HANDSHAKE ALERT" , data);
  //   console.log("Event emmited");
  //   ack('randomData');
  //   // sayOkay();
  // })

  // socket.on('search', function (searchParamsFromClient, ack) {
  //   // do something with searchParamsFromClient
  //   ack();
  // }


  // setInterval(()=>{
  //   socket.emit('handshakeOkay', 'okay');
  // },5000)

  window.addEventListener('resize', onResize, false);
  onResize();


  function drawLine(x0, y0, x1, y1, color, emit) {
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.strokeStyle = color;
    context.lineWidth = 2;
    context.stroke();
    context.closePath();

    if (!emit) { return; }
    var w = canvas.width;
    var h = canvas.height;

    socket.emit('drawing', {
      currentRoom: currentRoom,
      drawData: {
        x0: x0 / w,
        y0: y0 / h,
        x1: x1 / w,
        y1: y1 / h,
        color: color
      }
    });
  }

  function canvasPositionHelper() {
    // return document.getElementsByClassName("whiteboard")[0].offsetLeft - 250;
    // return document.getElementsByClassName("whiteboard")[0].offsetLeft - document.getElementsByClassName("whiteboard")[0].offsetWidth / 2
    // return document.getElementsByClassName("whiteboard")[0].offsetLeft - 250;
    if (window.innerWidth < 992) {
      return '';
    }
    return document.getElementsByClassName("whiteboard")[0].offsetLeft - 250;
  }
  function canvasPositionYHelper(){
    // return document.getElementsByClassName("whiteboard")[0].offsetTop - document.getElementsByClassName("whiteboard")[0].offsetTop - document.getElementsByClassName("whiteboard")[0].offsetHeight / 2
    return ''
  }
  function onMouseDown(e) {
    drawing = true;
    current.x = e.clientX - canvasPositionHelper() || e.touches[0].clientX - canvasPositionHelper();
    current.y = e.clientY - canvasPositionYHelper()|| e.touches[0].clientY;
  }

  function onMouseUp(e) {
    if (!drawing) { return; }
    drawing = false;
    drawLine(current.x, current.y, e.clientX - canvasPositionHelper() || e.touches[0].clientX - canvasPositionHelper(), e.clientY || e.touches[0].clientY, current.color, true);
  }

  function onMouseMove(e) {
    if (!drawing) { return; }
    drawLine(current.x, current.y, e.clientX - canvasPositionHelper() || e.touches[0].clientX - canvasPositionHelper(), e.clientY || e.touches[0].clientY, current.color, true);
    current.x = e.clientX - canvasPositionHelper() || e.touches[0].clientX - canvasPositionHelper();
    current.y = e.clientY || e.touches[0].clientY;
  }

  function onColorUpdate(e) {
    current.color = e.target.className.split(' ')[1];
  }

  // limit the number of events per second
  function throttle(callback, delay) {
    var previousCall = new Date().getTime();
    return function () {
      var time = new Date().getTime();

      if ((time - previousCall) >= delay) {
        previousCall = time;
        callback.apply(null, arguments);
      }
    };
  }

  // function triggered when other sockets send drawing data and this client needs to draw
  function onDrawingEvent(data) {
    var w = canvas.width;
    var h = canvas.height;
    // var data = data.data;
    drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
  }

  // make the canvas fill its parent
  function onResize() {
    // canvas.width = window.innerWidth;
    if (window.innerWidth < 700) {
      canvas.width = window.outerWidth;
      canvas.height = window.outerHeight;
      console.log(canvas.width)

    } else {
      canvas.height = window.innerHeight;

    }
    $(".canvas-container").css({
      width: canvas.width + "px",
      height: canvas.height + "px",
    })
  }

})();