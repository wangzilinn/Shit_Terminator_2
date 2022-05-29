// GLOBAL VARS & TYPES
let numberOfShapesControl: p5.Element;
let pressedKeys: Set<any>;
let drawSystem: DrawSystem;
let size: Vector;
let info: Info;
let enemyShips: Ship[];
let playerShip: Ship;
let resourceList: Array<Resource>;
let bulletList: Array<Bullet>;
let state: StateEnum;
let sloganSystem: SloganSystem;
// P5 WILL AUTOMATICALLY USE GLOBAL MODE IF A DRAW() FUNCTION IS DEFINED
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

// p5 WILL AUTO RUN THIS FUNCTION IF THE BROWSER WINDOW SIZE CHANGES
function windowResized() {
  resizeCanvas(size.x, size.y);
}

// p5 WILL HANDLE REQUESTING ANIMATION FRAMES FROM THE BROWSER AND WIL RUN DRAW() EACH ANIMATION FROME
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
  //检查是否需要显示关卡名字:
  if (drawSystem.checkAndDrawLevelNameScreen(info)) {
    //如果显示了关卡名字,则直接显示下一帧
    // 此时鼠标点击无效
    bulletList = [];
    return;
  }
  // 生产资源:
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

  if (
    (pressedKeys.has("w") || pressedKeys.has("ArrowUp")) &&
    playerShip.position.y > 0
  ) {
    playerShip.moveDirection(DirectionEnum.UP);
  }
  if (
    (pressedKeys.has("s") || pressedKeys.has("ArrowDown")) &&
    playerShip.position.y < height
  ) {
    playerShip.moveDirection(DirectionEnum.DOWN);
  }
  if (
    (pressedKeys.has("a") || pressedKeys.has("ArrowLeft")) &&
    playerShip.position.x > 0
  ) {
    playerShip.moveDirection(DirectionEnum.LEFT);
  }
  if (
    (pressedKeys.has("d") || pressedKeys.has("ArrowRight")) &&
    playerShip.position.x < width
  ) {
    playerShip.moveDirection(DirectionEnum.RIGHT);
  }
  resourceList.forEach((resource) => {
    resource.reduceLife();
  });
  //遍历所有油滴,检查飞船是否可以吸收这个油滴
  resourceList = resourceList.filter((resource) => {
    if (resource.remainLife <= 0) {
      return false;
    } else if (playerShip.checkIfAbsorb(resource)) {
      playerShip.absorbResource(resource);
      return false;
    } else {
      for (let enemyShip of enemyShips) {
        if (enemyShip.checkIfAbsorb(resource)) {
          enemyShip.absorbResource(resource);
          return false;
        }
      }
      return true;
    }
  });

  //遍历所有子弹,检查子弹是否超出画面,是否击中敌方飞船
  bulletList.forEach((bullet) => {
    bullet.move();
  });
  bulletList = bulletList.filter((bullet) => {
    //敌方飞船是否被击中:
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
    } else if (bullet.getRole() == RoleEnum.COMPUTER) {
      if (playerShip.checkIfBeingHit(bullet)) {
        playerShip.beingHit(bullet);
        console.log("player being hit");
        sloganSystem.addSlogan(undefined, playerShip.position);
        return false;
      }
      return true;
    } else if (
      bullet.position.x <= 0 ||
      bullet.position.x >= width ||
      bullet.position.y <= 0 ||
      bullet.position.y >= height
    ) {
      // 超出画面范围
      return false;
    } else {
      return true;
    }
  });

  // 判断是否游戏状态是否已经改变:
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
    } else {
      state = StateEnum.PASS;
      info.upgradeLevel();
    }
    playerShip = new Ship(RoleEnum.PLAYER, "You");
    //这里硬编码为第二关需要两个坏蛋
    enemyShips = [
      new Ship(RoleEnum.COMPUTER, "Voldemort"),
      new Ship(RoleEnum.COMPUTER, "Malfoy"),
    ];
  } else if (playerShip.dead) {
    state = StateEnum.OVER;
    info.resetLevel();
    enemyShips = [new Ship(RoleEnum.COMPUTER, "Mufasa")];
    playerShip = new Ship(RoleEnum.PLAYER, "You");
    drawSystem.resetDrawLevelNameScreenCounter();
  }

  //开始绘制画面:
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
  // 按空格,则将状态变为执行游戏逻辑状态
  let pressedKey = key;
  if (pressedKey == " ") {
    if (state == StateEnum.WIN || state == StateEnum.OVER) {
      //当赢了或输了,则点击空格回到准备界面
      state = StateEnum.READY;
    } else if (state == StateEnum.READY || state == StateEnum.PASS) {
      //当在准备界面或者过关了,则开始运行游戏
      state = StateEnum.RUNNING;
    }
  }
  // console.log(pressedKey);
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
      // if shit doesn't have enough oil,then the bullet is null
      bulletList.push(bullet);
    }
  }
}

function mouseMoved() {
  playerShip.updateShootDirection(new Vector(mouseX, mouseY));
}
