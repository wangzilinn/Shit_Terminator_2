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
let sloganSystem;
function setup() {
    pressedKeys = new Set();
    state = StateEnum.READY;
    size = new Vector(800, 600);
    drawSystem = new DrawSystem(size);
    sloganSystem = new SloganSystem();
    resourceList = new Array();
    bulletList = new Array();
    info = new Info();
    enemyShips = [new Ship(RoleEnum.COMPUTER, "Mufasa")];
    playerShip = new Ship(RoleEnum.PLAYER, "You");
    createCanvas(size.x, size.y);
}
function windowResized() {
    resizeCanvas(size.x, size.y);
}
function draw() {
    background(200);
    switch (state) {
        case StateEnum.READY:
            drawSystem.drawReadyScreen();
            break;
        case StateEnum.PASS:
            drawSystem.drawNextLevelScreen(enemyShips);
            break;
        case StateEnum.RUNNING:
            drawGame();
            break;
        case StateEnum.WIN:
            drawSystem.drawWinScreen(enemyShips);
            break;
        case StateEnum.OVER:
            drawSystem.drawLoseScreen(enemyShips);
            break;
    }
}
function drawGame() {
    if (drawSystem.checkAndDrawLevelNameScreen(info)) {
        bulletList = [];
        return;
    }
    if (frameCount % 10 == 0) {
        let resource = new Resource();
        resourceList.push(resource);
    }
    for (let enemyShip of enemyShips) {
        enemyShip.moveAgainst(playerShip.position);
        enemyShip.updateShootDirection(playerShip.position);
        if (frameCount % 60 == 0) {
            let bullet = enemyShip.shoot(playerShip);
            if (bullet != null) {
                console.log("enemy shoot");
                bulletList.push(bullet);
            }
        }
    }
    if ((pressedKeys.has("w") || pressedKeys.has("ArrowUp")) &&
        playerShip.position.y > 0) {
        playerShip.moveDirection(DirectionEnum.UP);
    }
    if ((pressedKeys.has("s") || pressedKeys.has("ArrowDown")) &&
        playerShip.position.y < height) {
        playerShip.moveDirection(DirectionEnum.DOWN);
    }
    if ((pressedKeys.has("a") || pressedKeys.has("ArrowLeft")) &&
        playerShip.position.x > 0) {
        playerShip.moveDirection(DirectionEnum.LEFT);
    }
    if ((pressedKeys.has("d") || pressedKeys.has("ArrowRight")) &&
        playerShip.position.x < width) {
        playerShip.moveDirection(DirectionEnum.RIGHT);
    }
    resourceList.forEach((resource) => {
        resource.reduceLife();
    });
    resourceList = resourceList.filter((resource) => {
        if (resource.remainLife <= 0) {
            return false;
        }
        else if (playerShip.checkIfAbsorb(resource)) {
            playerShip.absorbResource(resource);
            return false;
        }
        else {
            for (let enemyShip of enemyShips) {
                if (enemyShip.checkIfAbsorb(resource)) {
                    enemyShip.absorbResource(resource);
                    return false;
                }
            }
            return true;
        }
    });
    bulletList.forEach((bullet) => {
        bullet.move();
    });
    bulletList = bulletList.filter((bullet) => {
        if (bullet.getRole() == RoleEnum.PLAYER) {
            for (let enemyShip of enemyShips) {
                if (enemyShip.checkIfBeingHit(bullet)) {
                    enemyShip.beingHit(bullet);
                    console.log("enemy being hit");
                    sloganSystem.addSlogan(undefined, enemyShip.position);
                    return false;
                }
            }
            return true;
        }
        else if (bullet.getRole() == RoleEnum.COMPUTER) {
            if (playerShip.checkIfBeingHit(bullet)) {
                playerShip.beingHit(bullet);
                console.log("player being hit");
                sloganSystem.addSlogan(undefined, playerShip.position);
                return false;
            }
            return true;
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
        console.log("enemyShips are dead");
        if (info.isMaxLevel()) {
            state = StateEnum.WIN;
            info.resetLevel();
            drawSystem.resetDrawLevelNameScreenCounter();
        }
        else {
            state = StateEnum.PASS;
            info.upgradeLevel();
        }
        playerShip = new Ship(RoleEnum.PLAYER, "You");
        enemyShips = [
            new Ship(RoleEnum.COMPUTER, "Voldemort"),
            new Ship(RoleEnum.COMPUTER, "Malfoy"),
        ];
    }
    else if (playerShip.dead) {
        state = StateEnum.OVER;
        info.resetLevel();
        enemyShips = [new Ship(RoleEnum.COMPUTER, "Mufasa")];
        playerShip = new Ship(RoleEnum.PLAYER, "You");
        drawSystem.resetDrawLevelNameScreenCounter();
    }
    for (let enemyShip of enemyShips) {
        drawSystem.drawShip(enemyShip);
    }
    drawSystem.drawShip(playerShip);
    drawSystem.drawBullets(bulletList);
    drawSystem.drawResources(resourceList);
    drawSystem.drawGameLayout(info, playerShip, enemyShips);
    sloganSystem.draw();
}
function keyPressed() {
    let pressedKey = key;
    if (pressedKey == " ") {
        if (state == StateEnum.WIN || state == StateEnum.OVER) {
            state = StateEnum.READY;
        }
        else if (state == StateEnum.READY || state == StateEnum.PASS) {
            state = StateEnum.RUNNING;
        }
    }
    pressedKeys.add(pressedKey);
}
function keyReleased() {
    pressedKeys.delete(key);
}
function mousePressed() {
    if (state == StateEnum.RUNNING) {
        let bullet = playerShip.shoot(null);
        if (bullet != null) {
            console.log("player shoot");
            bulletList.push(bullet);
        }
    }
}
function mouseMoved() {
    playerShip.updateShootDirection(new Vector(mouseX, mouseY));
}
class Color {
    constructor(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
}
class DrawSystem {
    constructor(size) {
        this.centerPosition = size.div(2);
        this.size = size;
    }
    drawReadyScreen() {
        fill(0);
        textSize(80);
        let str = "Virus War";
        text(str, this.getAlignX(str, 80, this.size.x), this.centerPosition.y - 50);
        textSize(20);
        str = "WASD or Arrow keys to Move, Mouse to Aim, Left click to Shoot";
        text(str, this.getAlignX(str, 20, this.size.x), this.centerPosition.y);
        str = "You can move to collect Ammo (red), Fuel (green) and Shield (blue)";
        text(str, this.getAlignX(str, 20, this.size.x), this.centerPosition.y + 30);
        str = "Shooting consumes Ammo and Being hit consumes Shield";
        text(str, this.getAlignX(str, 20, this.size.x), this.centerPosition.y + 60);
        str = "Now go and Destroy the virus!";
        textSize(30);
        text(str, this.getAlignX(str, 30, this.size.x), this.centerPosition.y + 110);
        str = "Press Space to Start";
        textSize(20);
        text(str, this.getAlignX(str, 20, this.size.x), this.centerPosition.y + 140);
    }
    drawWinScreen(enemyShips) {
        let str = "You Win";
        fill(0);
        textSize(60);
        text(str, this.getAlignX(str, 60, size.x), this.centerPosition.y);
        str = "Press Space to Restart";
        textSize(20);
        text(str, this.getAlignX(str, 20, size.x), this.centerPosition.y + 40);
    }
    drawLoseScreen(enemyShips) {
        let str = "You Lose";
        fill(0);
        textSize(60);
        text(str, this.getAlignX(str, 60, size.x), this.centerPosition.y);
        str = "Press Space to Restart";
        textSize(20);
        text(str, this.getAlignX(str, 20, size.x), this.centerPosition.y + 40);
    }
    drawNextLevelScreen(enemyShips) {
        fill(0);
        textSize(60);
        let str = "Next Level";
        text(str, this.getAlignX(str, 60, size.x), this.centerPosition.y);
        str = "Press Space to Start";
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
        let shipPrinter = ship.printer;
        if (ship.dead) {
            return;
        }
        if (shipPrinter.checkIfShowBeingHitEffect()) {
            shipPrinter.increaseBeingHitFrame();
        }
        if (shipPrinter.getRingColor() != null) {
            for (let i = 0; i < shipPrinter.getRingColorValue().length; i++) {
                noFill();
                let color = shipPrinter.getRingColor();
                stroke(color.r, color.g, color.b, shipPrinter.getRingColorValue()[i]);
                let radius = ship.size.x + (i + 1) * (1 + i);
                ellipse(ship.position.x, ship.position.y, radius, radius);
            }
            if (frameCount % 6 == 0) {
                shipPrinter.shiftRingColorValue();
            }
        }
        if (ship.getRole() == RoleEnum.PLAYER) {
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
            if (bullet.getRole() == RoleEnum.PLAYER) {
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
            let trans = resource.remainLife * 3;
            let color = resource.printer.color;
            fill(color.r, color.g, color.b, trans);
            noStroke();
            ellipse(resource.position.x, resource.position.y, resource.volume * 2, resource.volume * 2);
        }
    }
    drawGameLayout(info, playerShip, enemyShips) {
        fill(0);
        textSize(15);
        text(playerShip.name + ": ", 10, 530);
        textSize(12);
        this.drawResourceData(playerShip, new Vector(10, 550));
        let cnt = 0;
        for (let enemyShip of enemyShips) {
            if (enemyShip.dead) {
                continue;
            }
            fill(0);
            textSize(15);
            text(enemyShip.name + ": ", 300 + cnt * 300, 530);
            textSize(12);
            this.drawResourceData(enemyShip, new Vector(300 + cnt * 300, 550));
            cnt++;
        }
    }
    drawResourceData(ship, position) {
        let cnt = 0;
        for (let resourceType of ship.resourceContainer.resourceContainerMap.keys()) {
            let color = new ResourcePrinter(resourceType).color;
            fill(color.r, color.g, color.b);
            text("Remaining " +
                resourceType +
                ": " +
                ship.resourceContainer.get(resourceType).toFixed(0), position.x, position.y + cnt * 20);
            cnt++;
        }
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
class SloganPrinter {
    constructor(slogan, position) {
        this.slogan = slogan;
        this.position = position;
        this.remainingFrame = 60;
    }
    reduceRemainingFrame() {
        this.remainingFrame--;
    }
}
class SloganSystem {
    constructor() {
        this.sloganList = [];
    }
    addSlogan(slogan, position) {
        if (slogan == undefined) {
            slogan =
                SloganSystem.slogans[Math.floor(Math.random() * SloganSystem.slogans.length)];
        }
        this.sloganList.push(new SloganPrinter(slogan, position.add(new Vector(50, 0))));
    }
    draw() {
        for (let sloganPrinter of this.sloganList) {
            fill(0);
            textSize(20);
            text(sloganPrinter.slogan, sloganPrinter.position.x, sloganPrinter.position.y);
            sloganPrinter.reduceRemainingFrame();
        }
        this.sloganList = this.sloganList.filter((sloganPrinter) => sloganPrinter.remainingFrame > 0);
    }
}
SloganSystem.slogans = [
    "That's HURT!",
    "AAAAAAAA!",
    "I'M GNNA DIE!",
    "STOP SHOOTING ME!",
    "PLEASE STOP~~",
    "GO FxxK YOUSELF",
    "FxxK YOU!",
    "求求你别打了",
    "我的老天鹅呀",
    "你再打一个试试？！",
    "你这个渣渣！",
    "你打我？那我就干你",
    "笑死",
];
class ResourcePrinter {
    constructor(resourceType) {
        switch (resourceType) {
            case ResourceEnum.AMMO:
                this.color = new Color(255, 0, 0, 0);
                break;
            case ResourceEnum.FUEL:
                this.color = new Color(0, 200, 0, 0);
                break;
            case ResourceEnum.SHIELD:
                this.color = new Color(0, 0, 255, 0);
        }
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
    startShowingAbsorbResourceEffect(resource) {
        this.ringColor = resource.printer.color;
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
        this.position = this.position.add(this.directionVector.mult(10));
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
                case DirectionEnum.UP:
                    this.acceleration.y = -1;
                    break;
                case DirectionEnum.DOWN:
                    this.acceleration.y = 1;
                    break;
                case DirectionEnum.LEFT:
                    this.acceleration.x = -1;
                    break;
                case DirectionEnum.RIGHT:
                    this.acceleration.x = 1;
            }
        }
        else {
            this.velocity = new Vector(0, 0);
            switch (direction) {
                case DirectionEnum.UP:
                    this.velocity.y = -10;
                    break;
                case DirectionEnum.DOWN:
                    this.velocity.y = 10;
                    break;
                case DirectionEnum.LEFT:
                    this.velocity.x = -10;
                    break;
                case DirectionEnum.RIGHT:
                    this.velocity.x = 10;
            }
        }
    }
    getVelocity() {
        this.accLimiter(0.03);
        this.velocity = this.velocity.add(this.acceleration);
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
        if (this.resourceContainer.get(ResourceEnum.AMMO) < 10) {
            return null;
        }
        let bullet = new Bullet(position.copy(), shootDirection, 10, this.role);
        this.resourceContainer.decrease(ResourceEnum.AMMO, 10);
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
        this.resourceType = Resource.getRandomKind();
        this.remainLife = Resource.getRandomLife();
        this.printer = new ResourcePrinter(this.resourceType);
    }
    static getRandomKind() {
        let rand = Math.random();
        if (rand > 0.6) {
            return ResourceEnum.AMMO;
        }
        else if (rand > 0.3) {
            return ResourceEnum.SHIELD;
        }
        else {
            return ResourceEnum.FUEL;
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
        this.resourceContainerMap.set(ResourceEnum.AMMO, ammo);
        this.resourceContainerMap.set(ResourceEnum.FUEL, fuel);
        this.resourceContainerMap.set(ResourceEnum.SHIELD, shield);
    }
    increase(resourceType, amount) {
        let val = this.resourceContainerMap.get(resourceType);
        val += amount;
        this.resourceContainerMap.set(resourceType, val);
    }
    decrease(resourceType, amount) {
        this.increase(resourceType, -amount);
    }
    get(resourceType) {
        return this.resourceContainerMap.get(resourceType);
    }
    empty(resourceType) {
        return this.resourceContainerMap.get(resourceType) < 0;
    }
}
class Ship {
    constructor(role, name) {
        this.dead = false;
        this.role = role;
        this.deadPosition = new Vector(0, 0);
        this.size = new Vector(70, 70);
        this.shootDirection = new Vector(1, 1);
        this.meta = new Meta();
        this.name = name;
        this.resourceContainer = new ResourceContainer(100, 100, 100);
        this.gun = new Gun(this.resourceContainer, role);
        switch (this.role) {
            case RoleEnum.COMPUTER:
                this.position = MoveSystem.randomPosition();
                this.engine = new Engine(this.resourceContainer, MoveSystem.randomVelocity(), new Vector(0, 0), true, true, 1);
                break;
            case RoleEnum.PLAYER:
                this.position = new Vector(this.meta.screenSize.x / 2, this.meta.screenSize.y / 2);
                this.engine = new Engine(this.resourceContainer, new Vector(0, 0), new Vector(0, 0), false, false, 0);
                break;
        }
        this.printer = new ShipPrinter();
    }
    getRole() {
        return this.role;
    }
    checkIfAbsorb(resource) {
        if (this.role == RoleEnum.COMPUTER) {
            return (resource.position.dist(this.position) <
                resource.volume * 2 + this.size.x);
        }
        else {
            return (resource.position.dist(this.position) <
                resource.volume * 2 + this.size.x);
        }
    }
    absorbResource(resource) {
        if (this.dead) {
            return;
        }
        this.printer.startShowingAbsorbResourceEffect(resource);
        this.resourceContainer.increase(resource.resourceType, resource.volume);
    }
    moveDirection(direction) {
        this.lastPosition = this.position;
        this.engine.setDirection(direction);
        this.position = this.position.add(this.engine.getVelocity());
        if (this.resourceContainer.empty(ResourceEnum.FUEL) && !this.dead) {
            this.dead = true;
            this.deadPosition = this.position.copy();
        }
    }
    moveAgainst(enemyPosition) {
        MoveSystem.collisionModel(this.engine, this.position);
        this.position = this.position.add(this.engine.getVelocity());
        MoveSystem.avoidanceModel(this.engine, this.position, enemyPosition);
        this.position = this.position.add(this.engine.getVelocity());
        MoveSystem.frictionModel(this.engine);
        this.position = this.position.add(this.engine.getVelocity());
    }
    checkIfBeingHit(bullet) {
        return bullet.position.dist(this.position) < this.size.mag() / 2;
    }
    beingHit(bullet) {
        this.resourceContainer.decrease(ResourceEnum.SHIELD, bullet.damage);
        this.printer.startShowingBeingHitEffect();
        if (this.resourceContainer.empty(ResourceEnum.SHIELD)) {
            console.log("no shield");
            this.dead = true;
        }
    }
    shoot(enemyShip) {
        let bullet = null;
        switch (this.role) {
            case RoleEnum.PLAYER:
                bullet = this.gun.shoot(this.position.copy(), this.shootDirection.copy());
                break;
            case RoleEnum.COMPUTER:
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
var ColorEnum;
(function (ColorEnum) {
    ColorEnum[ColorEnum["RED"] = 0] = "RED";
    ColorEnum[ColorEnum["GREEN"] = 1] = "GREEN";
    ColorEnum[ColorEnum["BLUE"] = 2] = "BLUE";
})(ColorEnum || (ColorEnum = {}));
var DirectionEnum;
(function (DirectionEnum) {
    DirectionEnum[DirectionEnum["UP"] = 0] = "UP";
    DirectionEnum[DirectionEnum["DOWN"] = 1] = "DOWN";
    DirectionEnum[DirectionEnum["LEFT"] = 2] = "LEFT";
    DirectionEnum[DirectionEnum["RIGHT"] = 3] = "RIGHT";
})(DirectionEnum || (DirectionEnum = {}));
var ResourceEnum;
(function (ResourceEnum) {
    ResourceEnum["AMMO"] = "Ammo";
    ResourceEnum["FUEL"] = "Fuel";
    ResourceEnum["SHIELD"] = "Shield";
})(ResourceEnum || (ResourceEnum = {}));
var RoleEnum;
(function (RoleEnum) {
    RoleEnum[RoleEnum["PLAYER"] = 0] = "PLAYER";
    RoleEnum[RoleEnum["COMPUTER"] = 1] = "COMPUTER";
})(RoleEnum || (RoleEnum = {}));
var StateEnum;
(function (StateEnum) {
    StateEnum[StateEnum["READY"] = 0] = "READY";
    StateEnum[StateEnum["RUNNING"] = 1] = "RUNNING";
    StateEnum[StateEnum["PASS"] = 2] = "PASS";
    StateEnum[StateEnum["WIN"] = 3] = "WIN";
    StateEnum[StateEnum["OVER"] = 4] = "OVER";
})(StateEnum || (StateEnum = {}));
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
        let acc = direction.mult((1 / dist) * 5).copy();
        if (dist < 300) {
            engine.setAcceleration(acc);
        }
    }
    static frictionModel(engine) {
        let accDirection = engine.getVelocity().normalize();
        let friction = accDirection.mult(-0.005);
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