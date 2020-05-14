var canvas = document.getElementsByClassName('whiteboard')[0];
var colors = document.getElementsByClassName('color');
var context = canvas.getContext('2d');

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
    console.log(w, h)
    // sending the multiplier value rather than actual cordinates
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
    if (window.innerWidth < 500) {
        return '';
    }
    return document.getElementsByClassName("whiteboard")[0].offsetLeft - document.getElementsByClassName("whiteboard")[0].width / 2;
}
function canvasPositionYHelper() {
    // return document.getElementsByClassName("whiteboard")[0].offsetTop - document.getElementsByClassName("whiteboard")[0].offsetTop - document.getElementsByClassName("whiteboard")[0].offsetHeight / 2
    return ''
}
function onMouseDown(e) {
    drawing = true;
    current.x = e.clientX - canvasPositionHelper() || e.touches[0].clientX - canvasPositionHelper();
    current.y = e.clientY - canvasPositionYHelper() || e.touches[0].clientY;
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
    if (window.innerWidth < 500) {
        canvas.width = window.outerWidth;
        canvas.height = window.outerHeight;
        console.log(canvas.width)
        $(".whiteboard").css({
            height: "100%"
        })
    } else {
        canvas.height = window.innerHeight;
        $(".canvas-container").css({
            width: "500px"
        })
        // $(".whiteboard").css({
        //   width: "500px"
        // })
        $(".whiteboard").attr("width", "500");
    }
    $(".canvas-container").css({
        // width: canvas.width + "px",
        height: canvas.height + "px",
    })
    showLeaveroomButton()
}