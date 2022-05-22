// GLOBAL VARS & TYPES
let numberOfShapesControl: p5.Element;
let state: any;
let drawSystem: DrawSystem
let size: Vector
// P5 WILL AUTOMATICALLY USE GLOBAL MODE IF A DRAW() FUNCTION IS DEFINED
function setup() {
  state = State.READY
  size = new Vector(800, 600)
  drawSystem = new DrawSystem(size)

  createCanvas(size.x, size.y)
}

// p5 WILL AUTO RUN THIS FUNCTION IF THE BROWSER WINDOW SIZE CHANGES
function windowResized() {
  resizeCanvas(size.x, size.y);
}

// p5 WILL HANDLE REQUESTING ANIMATION FRAMES FROM THE BROWSER AND WIL RUN DRAW() EACH ANIMATION FROME
function draw() {
  
  background(200);
  switch (state){
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