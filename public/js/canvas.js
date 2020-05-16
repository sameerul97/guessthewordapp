var canvas = document.getElementsByClassName('whiteboard')[0];
var colors = document.getElementsByClassName('color');
// @ts-ignore
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
    // @ts-ignore
    var w = canvas.width;
    // @ts-ignore
    var h = canvas.height;
    console.log(w, h)
    // sending the multiplier value rather than actual cordinates
    // @ts-ignore
    socket.emit('drawing', {
        // @ts-ignore
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
    // @ts-ignore
    return document.getElementsByClassName("whiteboard")[0].offsetLeft - document.getElementsByClassName("whiteboard")[0].width / 2;
}
function canvasPositionYHelper() {
    // return document.getElementsByClassName("whiteboard")[0].offsetTop - document.getElementsByClassName("whiteboard")[0].offsetTop - document.getElementsByClassName("whiteboard")[0].offsetHeight / 2
    return ''
}
function onMouseDown(e) {
    drawing = true;
    // @ts-ignore
    current.x = e.clientX - canvasPositionHelper() || e.touches[0].clientX - canvasPositionHelper();
    // @ts-ignore
    current.y = e.clientY - canvasPositionYHelper() || e.touches[0].clientY;
}

function onMouseUp(e) {
    if (!drawing) { return; }
    drawing = false;
    // @ts-ignore
    drawLine(current.x, current.y, e.clientX - canvasPositionHelper() || e.touches[0].clientX - canvasPositionHelper(), e.clientY || e.touches[0].clientY, current.color, true);
}

function onMouseMove(e) {
    if (!drawing) { return; }
    // @ts-ignore
    drawLine(current.x, current.y, e.clientX - canvasPositionHelper() || e.touches[0].clientX - canvasPositionHelper(), e.clientY || e.touches[0].clientY, current.color, true);
    // @ts-ignore
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
    // @ts-ignore
    var w = canvas.width;
    // @ts-ignore
    var h = canvas.height;
    // var data = data.data;
    drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
}

// make the canvas fill its parent
function onResize() {
    // canvas.width = window.innerWidth;
    if (window.innerWidth < 500) {
        // @ts-ignore
        canvas.width = window.outerWidth;
        // @ts-ignore
        canvas.height = window.outerHeight;
        // @ts-ignore
        console.log(canvas.width)
        // @ts-ignore
        $(".whiteboard").css({
            height: "100%"
        })
    } else {
        // @ts-ignore
        canvas.height = window.innerHeight;
        // @ts-ignore
        $(".canvas-container").css({
            width: "500px"
        })
        // $(".whiteboard").css({
        //   width: "500px"
        // })
        // @ts-ignore
        $(".whiteboard").attr("width", "500");
    }
    // @ts-ignore
    $(".canvas-container").css({
        // width: canvas.width + "px",
        // @ts-ignore
        height: canvas.height + "px",
    })
    // @ts-ignore
    positionButtonsInCanvasResponsively()
}


