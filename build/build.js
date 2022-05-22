var ColorHelper = (function () {
    function ColorHelper() {
    }
    ColorHelper.getColorVector = function (c) {
        return createVector(red(c), green(c), blue(c));
    };
    ColorHelper.rainbowColorBase = function () {
        return [
            color('red'),
            color('orange'),
            color('yellow'),
            color('green'),
            color(38, 58, 150),
            color('indigo'),
            color('violet')
        ];
    };
    ColorHelper.getColorsArray = function (total, baseColorArray) {
        var _this = this;
        if (baseColorArray === void 0) { baseColorArray = null; }
        if (baseColorArray == null) {
            baseColorArray = ColorHelper.rainbowColorBase();
        }
        var rainbowColors = baseColorArray.map(function (x) { return _this.getColorVector(x); });
        ;
        var colours = new Array();
        for (var i = 0; i < total; i++) {
            var colorPosition = i / total;
            var scaledColorPosition = colorPosition * (rainbowColors.length - 1);
            var colorIndex = Math.floor(scaledColorPosition);
            var colorPercentage = scaledColorPosition - colorIndex;
            var nameColor = this.getColorByPercentage(rainbowColors[colorIndex], rainbowColors[colorIndex + 1], colorPercentage);
            colours.push(color(nameColor.x, nameColor.y, nameColor.z));
        }
        return colours;
    };
    ColorHelper.getColorByPercentage = function (firstColor, secondColor, percentage) {
        var firstColorCopy = firstColor.copy();
        var secondColorCopy = secondColor.copy();
        var deltaColor = secondColorCopy.sub(firstColorCopy);
        var scaledDeltaColor = deltaColor.mult(percentage);
        return firstColorCopy.add(scaledDeltaColor);
    };
    return ColorHelper;
}());
var PolygonHelper = (function () {
    function PolygonHelper() {
    }
    PolygonHelper.draw = function (numberOfSides, width) {
        push();
        var angle = TWO_PI / numberOfSides;
        var radius = width / 2;
        beginShape();
        for (var a = 0; a < TWO_PI; a += angle) {
            var sx = cos(a) * radius;
            var sy = sin(a) * radius;
            vertex(sx, sy);
        }
        endShape(CLOSE);
        pop();
    };
    return PolygonHelper;
}());
var numberOfShapesControl;
var state;
var drawSystem;
var size;
function setup() {
    state = State.READY;
    size = new Vector(800, 600);
    drawSystem = new DrawSystem(size);
    createCanvas(size.x, size.y);
}
function windowResized() {
    resizeCanvas(size.x, size.y);
}
function draw() {
    background(200);
    switch (state) {
        case State.READY:
            drawSystem.drawReadyScreen();
            break;
        case State.PASS:
            break;
        case State.RUNNING:
            break;
        case State.WIN:
            break;
        case State.OVER:
            break;
    }
}
var DrawSystem = (function () {
    function DrawSystem(size) {
        this.centerPosition = size.div(2);
        this.size = size;
    }
    DrawSystem.prototype.drawReadyScreen = function () {
        fill(0);
        textSize(60);
        var str = "Shit Terminator";
        text(str, this.getAlignX(str, 60, this.size.x), this.centerPosition.y);
        str = "press space to start";
        textSize(20);
        text(str, this.getAlignX(str, 20, this.size.x), this.centerPosition.y + 40);
    };
    DrawSystem.prototype.getAlignX = function (str, textSize, width) {
        var len = str.length * textSize / 2;
        return (int)(width / 2 - len / 2);
    };
    return DrawSystem;
}());
var State;
(function (State) {
    State[State["READY"] = 0] = "READY";
    State[State["RUNNING"] = 1] = "RUNNING";
    State[State["PASS"] = 2] = "PASS";
    State[State["WIN"] = 3] = "WIN";
    State[State["OVER"] = 4] = "OVER";
})(State || (State = {}));
var Vector = (function () {
    function Vector(x, y) {
        this.x = x;
        this.y = y;
    }
    Vector.prototype.div = function (num) {
        var res = new Vector(this.x, this.y);
        res.x /= num;
        res.y /= num;
        return res;
    };
    return Vector;
}());
//# sourceMappingURL=build.js.map