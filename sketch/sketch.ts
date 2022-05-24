// GLOBAL VARS & TYPES
let numberOfShapesControl: p5.Element;
let pressedKeys:Set<any>;
let drawSystem: DrawSystem;
let size: Vector;
let info:Info
let enemyShips: Ship[];
let  playerShip: Ship;
let resourceList:Array<Resource>;
let bulletList : Array<Bullet>;
let state:State;
// P5 WILL AUTOMATICALLY USE GLOBAL MODE IF A DRAW() FUNCTION IS DEFINED
function setup() {
  pressedKeys = new Set()
  state = State.READY;
  size = new Vector(800, 600);
  drawSystem = new DrawSystem(size);
  resourceList = new Array()
  bulletList=new Array()
  info = new Info()
  drawSystem = new DrawSystem(size)
  enemyShips = [new Ship(Role.COMPUTER)]
  playerShip = new Ship(Role.PLAYER)

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
    case State.READY:
      drawSystem.drawReadyScreen();
      break;
    case State.PASS:
      // drawSystem.drawNextLevelScreen(enemyShips);
      break;
    case State.RUNNING:
      // drawGame();
      break;
    case State.WIN:
      // drawSystem.drawWinScreen(enemyShips);
      break;
    case State.OVER:
      // drawSystem.drawLoseScreen(enemyShips);
      break;
  }
}

function drawGame() {
  //检查是否需要显示关卡名字:
  if (drawSystem.checkAndDrawLevelNameScreen(info)) {
      //如果显示了关卡名字,则直接显示下一帧
      return;
  }
  // 生产资源:
  if (frameCount % 5 == 0) {
      let resource = new Resource();
      resourceList.push(resource);
  }

  for (let enemyShip of enemyShips) {
      enemyShip.moveAgainst(playerShip.position);
      enemyShip.updateShootDirection(playerShip.position);
      if (frameCount % 60 == 0) {
          console.log("enemy shoot");
          let bullet = enemyShip.shoot(playerShip);
          if (bullet != null) {
              bulletList.push(bullet);
          }
      }
  }

  if (pressedKeys.has('w') && playerShip.position.y > 0) {
      playerShip.moveDirection(Direction.UP);
  }
  if (pressedKeys.has('s') && playerShip.position.y < height) {
      playerShip.moveDirection(Direction.DOWN);
  }
  if (pressedKeys.has('a') && playerShip.position.x > 0) {
      playerShip.moveDirection(Direction.LEFT);
  }
  if (pressedKeys.has('d') && playerShip.position.x < width) {
      playerShip.moveDirection(Direction.RIGHT);
  }


  //遍历所有油滴,检查鼠标操作的飞船是否可以吸收这个油滴
  let oilIter = resourceList[Symbol.iterator]();
  let end = false
  do  {
      let iter = oilIter.next();
      let resource = iter.value;
      resource.reduceLife();
      if (resource.getRemainLife() <= 0) {
          oilIter.();
      } else if (playerShip.checkIfAbsorb(resource)) {
          System.out.println("player absorb");
          playerShip.absorbFuel(resource);
          oilIter.remove();
      } else {
          for (Ship enemyShip : enemyShips) {
              if (enemyShip.checkIfAbsorb(resource)) {
                  System.out.println("enemy absorb");
                  enemyShip.absorbFuel(resource);
                  oilIter.remove();
              }
          }
      }
      end = iter.done
  }while(!end)
  //遍历所有子弹,检查子弹是否超出画面,是否击中敌方飞船
  for (let bullet of bulletList){
      bullet.move();
      //飞船是否被击中:
      if (bullet.getRole() == Role.PLAYER) {
          for (let enemyShip of enemyShips) {
              if (enemyShip.checkIfBeingHit(bullet)) {
                  enemyShip.beingHit(bullet);
                  bulletList.remove();
              }
          }
      } else if (bullet.getRole() == Role.COMPUTER && playerShip.checkIfBeingHit(bullet)) {
          playerShip.beingHit(bullet);
          BulletIter.remove();
      } else if (bullet.position.x <= 0 || bullet.position.x >= width || bullet.position.y <= 0 || bullet.position.y >= height) {
          // 超出画面范围
          BulletIter.remove();
      }
  }

  // 判断是否游戏状态是否已经改变:
  boolean allEnemyDead = true;
  for (Ship enemyShip : enemyShips) {
      if (!enemyShip.dead) {
          allEnemyDead = false;
          break;
      }
  }
  if (allEnemyDead) {
      System.out.println("enemyShip is dead");
      if (info.isMaxLevel()) {
          state = State.WIN;
          info.resetLevel();
          drawSystem.resetDrawLevelNameScreenCounter();
      } else {
          state = State.PASS;
          info.upgradeLevel();
      }
      playerShip = new Ship(Role.PLAYER);
      //这里硬编码为第二关需要两个坏蛋
      enemyShips = new Ship[]{new Ship(Role.COMPUTER), new Ship(Role.COMPUTER)};
  } else if (playerShip.dead) {
      state = State.OVER;
      info.resetLevel();
      enemyShips = new Ship[]{new Ship(Role.COMPUTER)};
      playerShip = new Ship(Role.PLAYER);
      drawSystem.resetDrawLevelNameScreenCounter();
  }

  //开始绘制画面:
  for (Ship enemyShip : enemyShips) {
      drawSystem.drawShip(enemyShip);
  }
  drawSystem.drawShip(playerShip);
  drawSystem.drawBullets(bulletList);
  drawSystem.drawResources(resourceList);
  drawSystem.drawGameLayout(info, playerShip, enemyShips);
}
