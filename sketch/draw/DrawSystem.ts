class DrawSystem {
  size: Vector;
  centerPosition: Vector;
  //   key:关卡数，value：剩余的显示帧数
  levelNamesCounterMap: Map<number, number>;
  constructor(size: Vector) {
    this.centerPosition = size.div(2);
    this.size = size;
  }

  public drawReadyScreen() {
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
    text(
      str,
      this.getAlignX(str, 30, this.size.x),
      this.centerPosition.y + 110
    );
    str = "Press Space to Start";
    textSize(20);
    text(
      str,
      this.getAlignX(str, 20, this.size.x),
      this.centerPosition.y + 140
    );
  }

  public drawWinScreen(enemyShips: Ship[]): void {
    let str = "You Win";
    fill(0);
    textSize(60);
    text(str, this.getAlignX(str, 60, size.x), this.centerPosition.y);
    str = "Press Space to Restart";
    textSize(20);
    text(str, this.getAlignX(str, 20, size.x), this.centerPosition.y + 40);
    // for (Ship enemyShip : enemyShips) {
    //     deadPositionParticleSystem.addParticle(enemyShip.position);
    //     deadPositionParticleSystem.run();
    // }
  }

  public drawLoseScreen(enemyShips: Ship[]): void {
    let str = "You Lose";
    fill(0);
    textSize(60);
    text(str, this.getAlignX(str, 60, size.x), this.centerPosition.y);
    str = "Press Space to Restart";
    textSize(20);
    text(str, this.getAlignX(str, 20, size.x), this.centerPosition.y + 40);
    // for (Ship enemyShip : enemyShips) {
    //     deadPositionParticleSystem.addParticle(enemyShip.position);
    //     deadPositionParticleSystem.run();
    // }
  }

  public drawNextLevelScreen(enemyShips: Ship[]): void {
    fill(0);
    textSize(60);
    let str = "Next Level";
    text(str, this.getAlignX(str, 60, size.x), this.centerPosition.y);
    str = "Press Space to Start";
    textSize(20);
    text(str, this.getAlignX(str, 20, size.x), this.centerPosition.y + 40);
    // for (Ship enemyShip : enemyShips) {
    //     deadPositionParticleSystem.addParticle(enemyShip.position);
    //     deadPositionParticleSystem.run();
    // }
  }

  /**
   * 检查是否需要显示关卡名字, 如果不需要则不显示
   *
   * @param info 游戏信息
   * @return 是否显示了关卡名字
   */

  public checkAndDrawLevelNameScreen(info: Info): boolean {
    if (this.levelNamesCounterMap == null) {
      this.levelNamesCounterMap = new Map();
      for (let i = 0; i <= info.getMaxLevel(); i++) {
        // 初始设定显示40帧
        this.levelNamesCounterMap.set(i, 40);
      }
    }
    let currentLevel = info.getCurrentLevel();

    let remainFrame = this.levelNamesCounterMap.get(currentLevel);

    if (remainFrame > 0) {
      let str =
        "Chapter " + (currentLevel + 1) + ": " + info.getCurrentLevelName();
      fill(0);
      textSize(60);
      text(str, this.getAlignX(str, 60, size.x), this.centerPosition.y);

      this.levelNamesCounterMap.set(currentLevel, --remainFrame);
      return true;
    }
    return false;
  }

  public drawShip(ship: Ship): void {
    let shipPrinter = ship.printer;
    if (ship.dead) {
      return;
    }

    //如果被击中的话，开始画被击中的效果：
    if (shipPrinter.checkIfShowBeingHitEffect()) {
      shipPrinter.increaseBeingHitFrame();
    }
    //之所以不在上面的if中调用该方法是因为可能帧数已经用完了，但是有粒子还存在lifespan，得消耗完
    // beingHitParticleSystem.run();

    //画外面的圈圈:
    if (shipPrinter.getRingColor() != null) {
      for (let i = 0; i < shipPrinter.getRingColorValue().length; i++) {
        noFill();
        let color = shipPrinter.getRingColor();
        stroke(color.r, color.g, color.b, shipPrinter.getRingColorValue()[i]);

        let radius = ship.size.x + (i + 1) * (1 + i);
        ellipse(ship.position.x, ship.position.y, radius, radius);
      }
      //更新外面圈圈的颜色
      if (frameCount % 6 == 0) {
        shipPrinter.shiftRingColorValue();
      }
    }
    //画飞船本身:
    if (ship.getRole() == RoleEnum.PLAYER) {
      fill(0);
      ellipse(ship.position.x, ship.position.y, ship.size.x, ship.size.y);
    } else {
      fill(0);
      this.polygon(ship.position.x, ship.position.y, ship.size.x / 2, 6);
    }

    //画炮塔:
    push();
    translate(ship.position.x, ship.position.y);
    rotate(ship.shootDirection.heading() + PI / 2);
    fill(255);
    // 使用正三角形会看不出来是哪个角发射的子弹，因此使用锐角三角形
    // polygon(0, 0 , (ship.size.y /3 ),3);
    triangle(
      0,
      -ship.size.y / 3,
      -ship.size.x / 4,
      ship.size.x / 3,
      ship.size.x / 4,
      ship.size.x / 3
    );
    pop();
  }

  public drawBullets(bulletList: Bullet[]): void {
    for (let bullet of bulletList) {
      fill(0);
      noStroke();
      if (bullet.getRole() == RoleEnum.PLAYER) {
        ellipse(
          bullet.position.x,
          bullet.position.y,
          bullet.size.x,
          bullet.size.y
        );
      } else {
        push();
        // 修改射出的正三角形的方向：
        translate(bullet.position.x, bullet.position.y);
        rotate(bullet.getDirectionVector().heading());
        this.polygon(0, 0, bullet.size.x / 1.5, 3);
        pop();
      }
    }
  }

  public drawResources(resourceList: Resource[]): void {
    for (let resource of resourceList) {
      let trans = resource.remainLife * 3;
      let color = resource.printer.color;
      fill(color.r, color.g, color.b, trans);
      noStroke();
      ellipse(
        resource.position.x,
        resource.position.y,
        resource.volume * 2,
        resource.volume * 2
      );
    }
  }

  public drawGameLayout(
    info: Info,
    playerShip: Ship,
    enemyShips: Ship[]
  ): void {
    fill(0);
    textSize(15);
    text(playerShip.name + ": ", 10, 530);
    textSize(12);
    this.drawResourceData(playerShip, new Vector(10, 550));
    let cnt = 0;
    for (let enemyShip of enemyShips) {
      // 死了就不显示了
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

  private drawResourceData(ship: Ship, position: Vector): void {
    let cnt = 0;
    for (let resourceType of ship.resourceContainer.resourceContainerMap.keys()) {
      let color = new ResourcePrinter(resourceType).color;
      fill(color.r, color.g, color.b);
      text(
        "Remaining " +
          resourceType +
          ": " +
          ship.resourceContainer.get(resourceType).toFixed(0),
        position.x,
        position.y + cnt * 20
      );
      cnt++;
    }
  }

  /**
   * 重置每一关的名字显示的帧数的计数器
   */
  public resetDrawLevelNameScreenCounter(): void {
    for (let key of this.levelNamesCounterMap.keys()) {
      this.levelNamesCounterMap.set(key, 40);
    }
  }

  private getAlignX(str: string, textSize: number, width: number) {
    let len = (str.length * textSize) / 2;
    return int(width / 2 - len / 2);
  }

  /**
   * 绘制多边形
   *
   * */
  private polygon(x: number, y: number, radius: number, npoints: number): void {
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
