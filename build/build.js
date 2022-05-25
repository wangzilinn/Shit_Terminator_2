class ColorHelper {
    static getColorVector(c) {
        return createVector(red(c), green(c), blue(c));
    }
    static rainbowColorBase() {
        return [
            color('red'),
            color('orange'),
            color('yellow'),
            color('green'),
            color(38, 58, 150),
            color('indigo'),
            color('violet')
        ];
    }
    static getColorsArray(total, baseColorArray = null) {
        if (baseColorArray == null) {
            baseColorArray = ColorHelper.rainbowColorBase();
        }
        var rainbowColors = baseColorArray.map(x => this.getColorVector(x));
        ;
        let colours = new Array();
        for (var i = 0; i < total; i++) {
            var colorPosition = i / total;
            var scaledColorPosition = colorPosition * (rainbowColors.length - 1);
            var colorIndex = Math.floor(scaledColorPosition);
            var colorPercentage = scaledColorPosition - colorIndex;
            var nameColor = this.getColorByPercentage(rainbowColors[colorIndex], rainbowColors[colorIndex + 1], colorPercentage);
            colours.push(color(nameColor.x, nameColor.y, nameColor.z));
        }
        return colours;
    }
    static getColorByPercentage(firstColor, secondColor, percentage) {
        var firstColorCopy = firstColor.copy();
        var secondColorCopy = secondColor.copy();
        var deltaColor = secondColorCopy.sub(firstColorCopy);
        var scaledDeltaColor = deltaColor.mult(percentage);
        return firstColorCopy.add(scaledDeltaColor);
    }
}
class PolygonHelper {
    static draw(numberOfSides, width) {
        push();
        const angle = TWO_PI / numberOfSides;
        const radius = width / 2;
        beginShape();
        for (let a = 0; a < TWO_PI; a += angle) {
            let sx = cos(a) * radius;
            let sy = sin(a) * radius;
            vertex(sx, sy);
        }
        endShape(CLOSE);
        pop();
    }
}
let numberOfShapesControl;
let pressedKeys;
let drawSystem;
let size;
let info;
let enemyShips;
let playerShip;
let resourceList;
let bulletList;
let state;
function setup() {
    pressedKeys = new Set();
    state = State.READY;
    size = new Vector(800, 600);
    drawSystem = new DrawSystem(size);
    resourceList = new Array();
    bulletList = new Array();
    info = new Info();
    enemyShips = [new Ship(Role.COMPUTER)];
    playerShip = new Ship(Role.PLAYER);
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
            drawSystem.drawNextLevelScreen(enemyShips);
            break;
        case State.RUNNING:
            drawGame();
            break;
        case State.WIN:
            drawSystem.drawWinScreen(enemyShips);
            break;
        case State.OVER:
            drawSystem.drawLoseScreen(enemyShips);
            break;
    }
}
function drawGame() {
    if (drawSystem.checkAndDrawLevelNameScreen(info)) {
        return;
    }
    if (frameCount % 5 == 0) {
        let resource = new Resource();
        resourceList.push(resource);
    }
    for (let enemyShip of enemyShips) {
        enemyShip.moveAgainst(playerShip.position);
        enemyShip.updateShootDirection(playerShip.position);
        if (frameCount % 60 == 0) {
            console.log("enemy shoot");
        }
    }
    if (pressedKeys.size > 0) {
        console.log("pressedKeys");
        console.log(pressedKeys);
    }
    if (pressedKeys.has("w") && playerShip.position.y > 0) {
        console.log("up");
        playerShip.moveDirection(Direction.UP);
    }
    if (pressedKeys.has("s") && playerShip.position.y < height) {
        playerShip.moveDirection(Direction.DOWN);
    }
    if (pressedKeys.has("a") && playerShip.position.x > 0) {
        playerShip.moveDirection(Direction.LEFT);
    }
    if (pressedKeys.has("d") && playerShip.position.x < width) {
        playerShip.moveDirection(Direction.RIGHT);
    }
    resourceList.filter((resource) => {
        resource.reduceLife();
        if (resource.getRemainLife() <= 0) {
            return false;
        }
        else if (playerShip.checkIfAbsorb(resource)) {
            playerShip.absorbFuel(resource);
            return false;
        }
        else {
            for (let enemyShip of enemyShips) {
                if (enemyShip.checkIfAbsorb(resource)) {
                    enemyShip.absorbFuel(resource);
                    return false;
                }
            }
            return true;
        }
    });
    bulletList.filter((bullet) => {
        bullet.move();
        if (bullet.getRole() == Role.PLAYER) {
            for (let enemyShip of enemyShips) {
                if (enemyShip.checkIfBeingHit(bullet)) {
                    enemyShip.beingHit(bullet);
                    return false;
                }
            }
        }
        else if (bullet.getRole() == Role.COMPUTER &&
            playerShip.checkIfBeingHit(bullet)) {
            playerShip.beingHit(bullet);
            return false;
        }
        else if (bullet.position.x <= 0 ||
            bullet.position.x >= width ||
            bullet.position.y <= 0 ||
            bullet.position.y >= height) {
            return false;
        }
        else {
            return true;
        }
    });
    let allEnemyDead = true;
    for (let enemyShip of enemyShips) {
        if (!enemyShip.dead) {
            allEnemyDead = false;
            break;
        }
    }
    if (allEnemyDead) {
        console.log("enemyShip is dead");
        if (info.isMaxLevel()) {
            state = State.WIN;
            info.resetLevel();
            drawSystem.resetDrawLevelNameScreenCounter();
        }
        else {
            state = State.PASS;
            info.upgradeLevel();
        }
        playerShip = new Ship(Role.PLAYER);
        enemyShips = [new Ship(Role.COMPUTER), new Ship(Role.COMPUTER)];
    }
    else if (playerShip.dead) {
        state = State.OVER;
        info.resetLevel();
        enemyShips = [new Ship(Role.COMPUTER)];
        playerShip = new Ship(Role.PLAYER);
        drawSystem.resetDrawLevelNameScreenCounter();
    }
    for (let enemyShip of enemyShips) {
        drawSystem.drawShip(enemyShip);
    }
    drawSystem.drawShip(playerShip);
    drawSystem.drawBullets(bulletList);
    drawSystem.drawResources(resourceList);
    drawSystem.drawGameLayout(info, playerShip, enemyShips);
}
function keyPressed() {
    let pressedKey = key;
    if (pressedKey == " ") {
        if (state == State.WIN || state == State.OVER) {
            state = State.READY;
        }
        else if (state == State.READY || state == State.PASS) {
            state = State.RUNNING;
        }
    }
    console.log("press " + pressedKey);
    pressedKeys.add(pressedKey);
}
function keyReleased() {
    pressedKeys.delete(key);
}
function mousePressed() {
    let bullet = playerShip.shoot(null);
    if (bullet != null) {
        console.log("player shoot");
        bulletList.push(bullet);
    }
}
function mouseMoved() {
    playerShip.updateShootDirection(new Vector(mouseX, mouseY));
}
class DrawSystem {
    constructor(size) {
        this.centerPosition = size.div(2);
        this.size = size;
    }
    drawReadyScreen() {
        fill(0);
        textSize(60);
        let str = "Shit Terminator";
        text(str, this.getAlignX(str, 60, this.size.x), this.centerPosition.y);
        str = "press space to start";
        textSize(20);
        text(str, this.getAlignX(str, 20, this.size.x), this.centerPosition.y + 40);
    }
    drawWinScreen(enemyShips) {
        let str = "You Win";
        fill(0);
        textSize(60);
        text(str, this.getAlignX(str, 60, size.x), this.centerPosition.y);
        str = "press space to restart";
        textSize(20);
        text(str, this.getAlignX(str, 20, size.x), this.centerPosition.y + 40);
    }
    drawLoseScreen(enemyShips) {
        let str = "You Lose";
        fill(0);
        textSize(60);
        text(str, this.getAlignX(str, 60, size.x), this.centerPosition.y);
        str = "press space to restart";
        textSize(20);
        text(str, this.getAlignX(str, 20, size.x), this.centerPosition.y + 40);
    }
    drawNextLevelScreen(enemyShips) {
        fill(0);
        textSize(60);
        let str = "Next Level";
        text(str, this.getAlignX(str, 60, size.x), this.centerPosition.y);
        str = "press space to start";
        textSize(20);
        text(str, this.getAlignX(str, 20, size.x), this.centerPosition.y + 40);
    }
    checkAndDrawLevelNameScreen(info) {
        if (this.levelNamesCounterMap == null) {
            this.levelNamesCounterMap = new Map();
            for (let i = 0; i <= info.getMaxLevel(); i++) {
                this.levelNamesCounterMap.set(i, 40);
            }
        }
        let currentLevel = info.getCurrentLevel();
        let remainFrame = this.levelNamesCounterMap.get(currentLevel);
        if (remainFrame > 0) {
            let str = "Chapter " + (currentLevel + 1) + ": " + info.getCurrentLevelName();
            fill(0);
            textSize(60);
            text(str, this.getAlignX(str, 60, size.x), this.centerPosition.y);
            this.levelNamesCounterMap.set(currentLevel, --remainFrame);
            return true;
        }
        return false;
    }
    drawShip(ship) {
        let shipPrinter = ship.getPrinter();
        if (ship.dead) {
            return;
        }
        if (shipPrinter.getRingColor() != null) {
            for (let i = 0; i < shipPrinter.getRingColorValue().length; i++) {
                noFill();
                switch (shipPrinter.getRingColor()) {
                    case Color.RED:
                        stroke(shipPrinter.getRingColorValue()[i], 0, 0);
                        break;
                    case Color.GREEN:
                        stroke(0, shipPrinter.getRingColorValue()[i], 0);
                        break;
                    case Color.BLUE:
                        stroke(0, 0, shipPrinter.getRingColorValue()[i]);
                        break;
                }
                let radius = ship.size.x + (i + 1) * (1 + i);
                ellipse(ship.position.x, ship.position.y, radius, radius);
            }
            if (frameCount % 6 == 0) {
                shipPrinter.shiftRingColorValue();
            }
        }
        if (ship.getRole() == Role.PLAYER) {
            fill(0);
            ellipse(ship.position.x, ship.position.y, ship.size.x, ship.size.y);
        }
        else {
            fill(0);
            this.polygon(ship.position.x, ship.position.y, ship.size.x / 2, 6);
        }
        push();
        translate(ship.position.x, ship.position.y);
        rotate(ship.shootDirection.heading() + PI / 2);
        fill(255);
        triangle(0, -ship.size.y / 3, -ship.size.x / 4, ship.size.x / 3, ship.size.x / 4, ship.size.x / 3);
        pop();
    }
    drawBullets(bulletList) {
        for (let bullet of bulletList) {
            fill(0);
            noStroke();
            if (bullet.getRole() == Role.PLAYER) {
                ellipse(bullet.position.x, bullet.position.y, bullet.size.x, bullet.size.y);
            }
            else {
                push();
                translate(bullet.position.x, bullet.position.y);
                rotate(bullet.getDirectionVector().heading());
                this.polygon(0, 0, bullet.size.x / 1.5, 3);
                pop();
            }
        }
    }
    drawResources(resourceList) {
        for (let resource of resourceList) {
            let trans = resource.getRemainLife() * 3;
            switch (resource.getResourceClass()) {
                case ResourceClass.AMMO:
                    fill(255, 0, 0, trans);
                    break;
                case ResourceClass.FUEL:
                    fill(0, 255, 0, trans);
                    break;
                case ResourceClass.SHIELD:
                    fill(0, 0, 255, trans);
            }
            noStroke();
            ellipse(resource.position.x, resource.position.y, resource.getVolume() * 2, resource.getVolume() * 2);
        }
    }
    drawGameLayout(info, playerShip, enemyShips) {
        fill(0);
        textSize(12);
        this.drawResourceContainer(playerShip, new Vector(10, 500));
        for (let i = 0; i < enemyShips.length; i++) {
            this.drawResourceContainer(enemyShips[i], new Vector(300 + i * 300, 500));
        }
    }
    drawResourceContainer(ship, position) {
        text("Remaining ammo:" + ship.resourceContainer.get(ResourceClass.AMMO), position.x, position.y);
        text("Remaining fuel:" + ship.resourceContainer.get(ResourceClass.FUEL), position.x, position.y + 20);
        text("Remaining Shield:" + ship.resourceContainer.get(ResourceClass.SHIELD), position.x, position.y + 40);
    }
    resetDrawLevelNameScreenCounter() {
        for (let key of this.levelNamesCounterMap.keys()) {
            this.levelNamesCounterMap.set(key, 40);
        }
    }
    getAlignX(str, textSize, width) {
        let len = (str.length * textSize) / 2;
        return int(width / 2 - len / 2);
    }
    polygon(x, y, radius, npoints) {
        let angle = TWO_PI / npoints;
        beginShape();
        for (let a = 0; a < TWO_PI; a += angle) {
            let sx = x + cos(a) * radius;
            let sy = y + sin(a) * radius;
            vertex(sx, sy);
        }
        endShape(CLOSE);
    }
}
class ShipPrinter {
    constructor() {
        this.beingHitFrame = 60;
        this.ringColorValue = [240, 150, 100, 150, 240];
        this.showBeingHitEffect = false;
        this.beingHitFrameCnt = 0;
    }
    shiftRingColorValue() {
        let temp = this.ringColorValue[0];
        this.ringColorValue[this.ringColorValue.length - 1] = temp;
    }
    startShowingAbsorbResourceEffect(resourceClass) {
        switch (resourceClass) {
            case ResourceClass.AMMO:
                this.ringColor = Color.RED;
                break;
            case ResourceClass.FUEL:
                this.ringColor = Color.GREEN;
                break;
            case ResourceClass.SHIELD:
                this.ringColor = Color.BLUE;
                break;
        }
    }
    checkIfShowBeingHitEffect() {
        return this.showBeingHitEffect;
    }
    increaseBeingHitFrame() {
        if (this.showBeingHitEffect) {
            this.beingHitFrameCnt++;
        }
        if (this.beingHitFrameCnt >= this.beingHitFrame) {
            this.showBeingHitEffect = false;
            this.beingHitFrameCnt = 0;
        }
    }
    startShowingBeingHitEffect() {
        this.showBeingHitEffect = true;
    }
    getRingColor() {
        return this.ringColor;
    }
    getRingColorValue() {
        return this.ringColorValue;
    }
}
class Bullet {
    constructor(position, directionVector, damage, role) {
        this.directionVector = directionVector.copy();
        this.position = position.copy();
        this.size = new Vector(10, 10);
        this.damage = damage;
        this.role = role;
    }
    move() {
        this.distance++;
        this.position = this.position.add(this.directionVector.mult(5));
    }
    getRole() {
        return this.role;
    }
    getDirectionVector() {
        return this.directionVector;
    }
}
class Engine {
    constructor(resourceContainer, velocity, acceleration, enableAcceleration, enableVelocityLimiter, maxVelocity) {
        this.resourceContainer = resourceContainer;
        this.velocity = velocity;
        this.acceleration = acceleration;
        this.enableAcceleration = enableAcceleration;
        this.enableVelocityLimiter = enableVelocityLimiter;
        this.maxVelocity = maxVelocity;
    }
    setDirection(direction) {
        if (this.enableAcceleration) {
            this.acceleration = new Vector(0, 0);
            switch (direction) {
                case Direction.UP:
                    this.acceleration.y = -1;
                    break;
                case Direction.DOWN:
                    this.acceleration.y = 1;
                    break;
                case Direction.LEFT:
                    this.acceleration.x = -1;
                    break;
                case Direction.RIGHT:
                    this.acceleration.x = 1;
            }
        }
        else {
            this.velocity = new Vector(0, 0);
            switch (direction) {
                case Direction.UP:
                    this.velocity.y = -10;
                    break;
                case Direction.DOWN:
                    this.velocity.y = 10;
                    break;
                case Direction.LEFT:
                    this.velocity.x = -10;
                    break;
                case Direction.RIGHT:
                    this.velocity.x = 10;
            }
        }
    }
    getVelocity() {
        this.accLimiter(0.03);
        this.velocity.add(this.acceleration);
        if (this.enableVelocityLimiter) {
            this.velocityLimiter();
        }
        return this.velocity;
    }
    setAcceleration(acceleration) {
        this.acceleration = acceleration;
    }
    getAcceleration() {
        return this.acceleration;
    }
    accLimiter(limit) {
        if (this.acceleration.x > limit) {
            this.acceleration.x = limit;
        }
        if (this.acceleration.x < -limit) {
            this.acceleration.x = -limit;
        }
        if (this.acceleration.y > limit) {
            this.acceleration.y = limit;
        }
        if (this.acceleration.y < -limit) {
            this.acceleration.y = -limit;
        }
    }
    velocityLimiter() {
        if (this.velocity.mag() > this.maxVelocity) {
            this.velocity = this.velocity.normalize().mult(this.maxVelocity);
        }
    }
}
class Gun {
    constructor(resourceContainer, role) {
        this.resourceContainer = resourceContainer;
        this.role = role;
    }
    shoot(position, shootDirection) {
        if (this.resourceContainer.get(ResourceClass.AMMO) < 10) {
            return null;
        }
        let bullet = new Bullet(position.copy(), shootDirection, 10, this.role);
        this.resourceContainer.decrease(ResourceClass.AMMO, 10);
        return bullet;
    }
}
class Info {
    constructor() {
        this.maxLevel = 1;
        this.levels = ["Hero", "Salvation"];
        this.currentLevel = 0;
    }
    getMaxLevel() {
        return this.maxLevel;
    }
    resetLevel() {
        this.currentLevel = 0;
    }
    upgradeLevel() {
        this.currentLevel++;
    }
    isMaxLevel() {
        return this.currentLevel == this.maxLevel;
    }
    getCurrentLevel() {
        return this.currentLevel;
    }
    getCurrentLevelName() {
        return this.levels[this.currentLevel];
    }
}
class Resource {
    constructor() {
        this.position = MoveSystem.randomPosition();
        this.volume = Resource.getRandomVolume();
        this.resourceClass = Resource.getRandomClass();
        this.remainLife = Resource.getRandomLife();
    }
    getRemainLife() {
        return this.remainLife;
    }
    getResourceClass() {
        return this.resourceClass;
    }
    getVolume() {
        return this.volume;
    }
    static getRandomClass() {
        let rand = Math.random();
        if (rand > 0.6) {
            return ResourceClass.AMMO;
        }
        else if (rand > 0.3) {
            return ResourceClass.SHIELD;
        }
        else {
            return ResourceClass.FUEL;
        }
    }
    static getRandomVolume() {
        return Math.random() * 10;
    }
    static getRandomLife() {
        return int(Math.random() * 600);
    }
    reduceLife() {
        if (this.remainLife > 0) {
            this.remainLife -= 1;
        }
    }
}
class ResourceContainer {
    constructor(ammo, fuel, shield) {
        this.resourceContainerMap = new Map();
        this.resourceContainerMap.set(ResourceClass.AMMO, ammo);
        this.resourceContainerMap.set(ResourceClass.FUEL, fuel);
        this.resourceContainerMap.set(ResourceClass.SHIELD, shield);
    }
    increase(resourceClass, amount) {
        let val = this.resourceContainerMap.get(resourceClass);
        val += amount;
        this.resourceContainerMap.set(resourceClass, val);
    }
    decrease(resourceClass, amount) {
        this.increase(resourceClass, -amount);
    }
    get(resourceClass) {
        return this.resourceContainerMap.get(resourceClass);
    }
    empty(resourceClass) {
        return this.resourceContainerMap.get(resourceClass) < 0;
    }
}
class Ship {
    constructor(role) {
        this.dead = false;
        this.role = role;
        this.deadPosition = new Vector(0, 0);
        this.size = new Vector(70, 70);
        this.shootDirection = new Vector(1, 1);
        this.meta = new Meta();
        this.resourceContainer = new ResourceContainer(100, 100, 100);
        this.gun = new Gun(this.resourceContainer, role);
        switch (this.role) {
            case Role.COMPUTER:
                this.position = MoveSystem.randomPosition();
                this.engine = new Engine(this.resourceContainer, MoveSystem.randomVelocity(), new Vector(0, 0), true, true, 5);
                break;
            case Role.PLAYER:
                this.position = new Vector(this.meta.screenSize.x / 2, this.meta.screenSize.y / 2);
                this.engine = new Engine(this.resourceContainer, new Vector(0, 0), new Vector(0, 0), false, false, 0);
                break;
        }
        this.printer = new ShipPrinter();
    }
    getPrinter() {
        return this.printer;
    }
    getRole() {
        return this.role;
    }
    checkIfAbsorb(resource) {
        if (this.role == Role.COMPUTER) {
            return resource.position.dist(this.position) < resource.volume;
        }
        else {
            return (resource.position.dist(this.position) < resource.volume * 2 + size.x);
        }
    }
    absorbFuel(resource) {
        if (this.dead) {
            return;
        }
        this.printer.startShowingAbsorbResourceEffect(resource.resourceClass);
        this.resourceContainer.increase(resource.resourceClass, resource.volume);
    }
    moveDirection(direction) {
        this.lastPosition = this.position;
        this.engine.setDirection(direction);
        this.position.add(this.engine.getVelocity());
        if (this.resourceContainer.empty(ResourceClass.FUEL) && !this.dead) {
            this.dead = true;
            this.deadPosition = this.position.copy();
        }
    }
    moveAgainst(enemyPosition) {
        MoveSystem.collisionModel(this.engine, this.position);
        this.position.add(this.engine.getVelocity());
        MoveSystem.avoidanceModel(this.engine, this.position, enemyPosition);
        this.position.add(this.engine.getVelocity());
        MoveSystem.frictionModel(this.engine);
        this.position.add(this.engine.getVelocity());
    }
    checkIfBeingHit(bullet) {
        return bullet.position.dist(this.position) < size.mag() / 2;
    }
    beingHit(bullet) {
        this.resourceContainer.decrease(ResourceClass.SHIELD, bullet.damage);
        this.printer.startShowingBeingHitEffect();
        if (this.resourceContainer.empty(ResourceClass.SHIELD)) {
            console.log("no shield");
            this.dead = true;
        }
    }
    shoot(enemyShip) {
        let bullet = null;
        switch (this.role) {
            case Role.PLAYER:
                bullet = this.gun.shoot(this.position.copy(), this.shootDirection.copy());
                break;
            case Role.COMPUTER:
                bullet = AimingSystem.directShootModel(this.gun, this.position, enemyShip.position);
                break;
        }
        return bullet;
    }
    updateShootDirection(mousePosition) {
        this.shootDirection = mousePosition
            .copy()
            .sub(this.position.copy())
            .normalize();
    }
}
var Color;
(function (Color) {
    Color[Color["RED"] = 0] = "RED";
    Color[Color["GREEN"] = 1] = "GREEN";
    Color[Color["BLUE"] = 2] = "BLUE";
})(Color || (Color = {}));
var Direction;
(function (Direction) {
    Direction[Direction["UP"] = 0] = "UP";
    Direction[Direction["DOWN"] = 1] = "DOWN";
    Direction[Direction["LEFT"] = 2] = "LEFT";
    Direction[Direction["RIGHT"] = 3] = "RIGHT";
})(Direction || (Direction = {}));
var ResourceClass;
(function (ResourceClass) {
    ResourceClass[ResourceClass["AMMO"] = 0] = "AMMO";
    ResourceClass[ResourceClass["FUEL"] = 1] = "FUEL";
    ResourceClass[ResourceClass["SHIELD"] = 2] = "SHIELD";
})(ResourceClass || (ResourceClass = {}));
var Role;
(function (Role) {
    Role[Role["PLAYER"] = 0] = "PLAYER";
    Role[Role["COMPUTER"] = 1] = "COMPUTER";
})(Role || (Role = {}));
var State;
(function (State) {
    State[State["READY"] = 0] = "READY";
    State[State["RUNNING"] = 1] = "RUNNING";
    State[State["PASS"] = 2] = "PASS";
    State[State["WIN"] = 3] = "WIN";
    State[State["OVER"] = 4] = "OVER";
})(State || (State = {}));
class AimingSystem {
    static directShootModel(gun, currentPosition, enemyPosition) {
        let direction = enemyPosition.copy().sub(currentPosition).normalize();
        return gun.shoot(currentPosition, direction);
    }
}
class Meta {
    constructor() {
        this.screenSize = new Vector(800, 600);
    }
}
class MoveSystem {
    static randomPosition() {
        let x = new Meta().screenSize.x;
        let y = new Meta().screenSize.y;
        return new Vector(Math.random() * x, Math.random() * y);
    }
    static randomVelocity() {
        return new Vector((Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5);
    }
    static collisionModel(engine, position) {
        if (position.x > new Meta().screenSize.x || position.x < 0) {
            let velocity = engine.getVelocity();
            velocity.x = -velocity.x;
        }
        if (position.y > new Meta().screenSize.y || position.y < 0) {
            let velocity = engine.getVelocity();
            velocity.y = -velocity.y;
        }
    }
    static avoidanceModel(engine, currentPosition, avoidPosition) {
        let dist = currentPosition.dist(avoidPosition);
        let sub = currentPosition.sub(avoidPosition).normalize();
        let direction = sub.normalize();
        let acc = direction.mult((1 / dist) * 10);
        if (dist < 300) {
            engine.setAcceleration(acc);
        }
    }
    static frictionModel(engine) {
        let accDirection = engine.getVelocity().normalize();
        let friction = accDirection.mult(-0.001);
        let acc = engine.getAcceleration().copy();
        if (Math.abs(engine.getVelocity().x) > 3) {
            acc.x += friction.x;
        }
        else {
            acc.x = 0;
        }
        if (Math.abs(engine.getVelocity().y) > 3) {
            acc.y += friction.y;
        }
        else {
            acc.y = 0;
        }
        engine.setAcceleration(acc);
    }
}
class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    div(num) {
        let res = this.copy();
        res.x /= num;
        res.y /= num;
        return res;
    }
    mult(num) {
        let res = this.copy();
        res.x *= num;
        res.y *= num;
        return res;
    }
    add(vec) {
        let res = this.copy();
        res.x += vec.x;
        res.y += vec.y;
        return res;
    }
    sub(vec) {
        let res = this.copy();
        res.x -= vec.x;
        res.y -= vec.y;
        return res;
    }
    copy() {
        return new Vector(this.x, this.y);
    }
    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    normalize() {
        let res = this.copy();
        let m = this.mag();
        return res.div(m);
    }
    dist(vec) {
        let dx = this.x - vec.x;
        let dy = this.y - vec.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    heading() {
        return Math.atan2(this.y, this.x);
    }
}
//# sourceMappingURL=build.js.map