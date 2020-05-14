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
var alreadyGuessed = false;

// positioning exitRoom, clearnCanvas and colour selector element dynamically 
function showLeaveroomButton() {
  $(".leaveRoom").css({
    // "position": "relative",
    "position": "absolute",
    // "display": "block",
    "bottom": "0",
    "left": document.getElementsByClassName("whiteboard")[0].offsetLeft - document.getElementsByClassName("whiteboard")[0].offsetWidth / 2 + "px",
    "z-index": "10"
  })

  $(".clearCanvas").css({
    // "position": "relative",
    // "display": "block",
    "right": document.getElementsByClassName("whiteboard")[0].offsetLeft - document.getElementsByClassName("whiteboard")[0].offsetWidth / 2 + "px",
    "z-index": "10"
  })

  $(".colors").css({
    "left": document.getElementsByClassName("whiteboard")[0].offsetLeft - document.getElementsByClassName("whiteboard")[0].offsetWidth / 2 + "px",
    "bottom": "30px ",
    // "display": "block",
    "transform": "translate(-0%, 0%)"
  })

  $(".canvas-container").css({
    // "margin-top": $(".leaveRoom").outerHeight() + "px"
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
    showExitRoomButton(); 
    // showClearCanvasButton();showColorSelector();

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
  showExitRoomButton(); showClearCanvasButton();showColorSelector();
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


function initiateHandshake(gameInstanceIndex) {
  console.log("Intiating handshake okay with new client")
  socket.emit('handshakeIntialised', gameInstanceIndex);
}


// event delegation for dynamic content
$('.words').on("click", '.options', function () {
  // console.log("TEXT clicked");
  console.log($(this).text());
  selectedWord = $(this).text();
  if(!alreadyGuessed){
    alreadyGuessed = true;
    socket.emit("selectedAnswer", { gameInstanceIndex: roomInstance, selectedAnswer: $(this).text() })
  }
});

// Init function
// (function () {

// var socket = io();





// socket.on('handshake',function(data, ack){
//   console.log("HANDSHAKE ALERT" , data);
//   console.log("Event emmited");
//   ack('randomData');
//   // initiateHandshake();
// })

// socket.on('search', function (searchParamsFromClient, ack) {
//   // do something with searchParamsFromClient
//   ack();
// }


// setInterval(()=>{
//   socket.emit('handshakeOkay', 'okay');
// },5000)

// window.addEventListener('resize', onResize, false);
// onResize();


// function drawLine(x0, y0, x1, y1, color, emit) {
//   context.beginPath();
//   context.moveTo(x0, y0);
//   context.lineTo(x1, y1);
//   context.strokeStyle = color;
//   context.lineWidth = 2;
//   context.stroke();
//   context.closePath();

//   if (!emit) { return; }
//   var w = canvas.width;
//   var h = canvas.height;
//   console.log(w, h)
//   // sending the multiplier value rather than actual cordinates
//   socket.emit('drawing', {
//     currentRoom: currentRoom,
//     drawData: {
//       x0: x0 / w,
//       y0: y0 / h,
//       x1: x1 / w,
//       y1: y1 / h,
//       color: color
//     }
//   });
// }

// function canvasPositionHelper() {
//   // return document.getElementsByClassName("whiteboard")[0].offsetLeft - 250;
//   // return document.getElementsByClassName("whiteboard")[0].offsetLeft - document.getElementsByClassName("whiteboard")[0].offsetWidth / 2
//   // return document.getElementsByClassName("whiteboard")[0].offsetLeft - 250;
//   if (window.innerWidth < 500) {
//     return '';
//   }
//   return document.getElementsByClassName("whiteboard")[0].offsetLeft - document.getElementsByClassName("whiteboard")[0].width / 2;
// }
// function canvasPositionYHelper() {
//   // return document.getElementsByClassName("whiteboard")[0].offsetTop - document.getElementsByClassName("whiteboard")[0].offsetTop - document.getElementsByClassName("whiteboard")[0].offsetHeight / 2
//   return ''
// }
// function onMouseDown(e) {
//   drawing = true;
//   current.x = e.clientX - canvasPositionHelper() || e.touches[0].clientX - canvasPositionHelper();
//   current.y = e.clientY - canvasPositionYHelper() || e.touches[0].clientY;
// }

// function onMouseUp(e) {
//   if (!drawing) { return; }
//   drawing = false;
//   drawLine(current.x, current.y, e.clientX - canvasPositionHelper() || e.touches[0].clientX - canvasPositionHelper(), e.clientY || e.touches[0].clientY, current.color, true);
// }

// function onMouseMove(e) {
//   if (!drawing) { return; }
//   drawLine(current.x, current.y, e.clientX - canvasPositionHelper() || e.touches[0].clientX - canvasPositionHelper(), e.clientY || e.touches[0].clientY, current.color, true);
//   current.x = e.clientX - canvasPositionHelper() || e.touches[0].clientX - canvasPositionHelper();
//   current.y = e.clientY || e.touches[0].clientY;
// }

// function onColorUpdate(e) {
//   current.color = e.target.className.split(' ')[1];
// }

// // limit the number of events per second
// function throttle(callback, delay) {
//   var previousCall = new Date().getTime();
//   return function () {
//     var time = new Date().getTime();

//     if ((time - previousCall) >= delay) {
//       previousCall = time;
//       callback.apply(null, arguments);
//     }
//   };
// }

// // function triggered when other sockets send drawing data and this client needs to draw
// function onDrawingEvent(data) {
//   var w = canvas.width;
//   var h = canvas.height;
//   // var data = data.data;
//   drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
// }

// // make the canvas fill its parent
// function onResize() {
//   // canvas.width = window.innerWidth;
//   if (window.innerWidth < 500) {
//     canvas.width = window.outerWidth;
//     canvas.height = window.outerHeight;
//     console.log(canvas.width)
//     $(".whiteboard").css({
//       height: "100%"
//     })
//   } else {
//     canvas.height = window.innerHeight;
//     $(".canvas-container").css({
//       width: "500px"
//     })
//     // $(".whiteboard").css({
//     //   width: "500px"
//     // })
//     $(".whiteboard").attr("width", "500");
//   }
//   $(".canvas-container").css({
//     // width: canvas.width + "px",
//     height: canvas.height + "px",
//   })
//   showLeaveroomButton()
// }

// })();