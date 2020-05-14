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
        "z-index": "9"
    })
}

function disableCanvasDrawing() {
    $(".whiteboard").css({
        "z-index": "-9"
    })
}


function showClearCanvasButton() {
    $(".clearCanvas").css({
        "display": "block"
    });
}

function showExitRoomButton() {
    $(".leaveRoom").css({
        "display": "block"
    });
}

function showColorSelector() {
    $(".colors").css({
        "display": "block"
    });
}

function hideClearCanvasButton() {
    $(".clearCanvas").css({
        "display": "none"
    });
}

function hideExitRoomButton() {
    $(".leaveRoom").css({
        "display": "none"
    });
}

function hideColorSelector() {
    $(".colors").css({
        "display": "none"
    });
}

