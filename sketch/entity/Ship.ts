class Ship {
  private gun: Gun;
  private role: Role;
  private printer: ShipPrinter;
  /**
   * 盛放不同资源的容器
   */
  public resourceContainer: ResourceContainer;
  public dead = false;
  /**
   * 死亡时的位置:
   */
  public deadPosition: Vector;
  public size: Vector;
  public position: Vector;
  /**
   * 射击部分:
   */
  public shootDirection: Vector;
  lastPosition: Vector;
  /**
   * 移动部分:
   */
  private engine: Engine;
  private meta: Meta;

  constructor(role: Role) {
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
        this.engine = new Engine(
          this.resourceContainer,
          MoveSystem.randomVelocity(),
          new Vector(0, 0),
          true,
          true,
          1
        );
        break;
      case Role.PLAYER:
        this.position = new Vector(
          this.meta.screenSize.x / 2,
          this.meta.screenSize.y / 2
        );
        this.engine = new Engine(
          this.resourceContainer,
          new Vector(0, 0),
          new Vector(0, 0),
          false,
          false,
          0
        );
        break;
    }

    this.printer = new ShipPrinter();
  }

  public getPrinter(): ShipPrinter {
    return this.printer;
  }

  public getRole(): Role {
    return this.role;
  }

  /**
   * @param resource 要吸收的油滴
   * @return 是否可以吸收
   */
  public checkIfAbsorb(resource: Resource): boolean {
    //注意还要考虑Oil的尺寸
    if (this.role == Role.COMPUTER) {
      // 降低飞船的吸收半径,不然太难了
      return resource.position.dist(this.position) < resource.volume;
    } else {
      if (
        resource.position.dist(this.position) <
        resource.volume * 2 + this.size.x
      ) {
        return true;
      } else {
        return false;
      }
    }
  }

  /**
   * 执行吸收油滴的逻辑
   *
   * @param resource 要吸收的油滴
   */
  public absorbFuel(resource: Resource): void {
    if (this.dead) {
      return;
    }
    this.printer.startShowingAbsorbResourceEffect(resource.resourceClass);
    this.resourceContainer.increase(resource.resourceClass, resource.volume);
  }

  /**
   * 键盘移动
   *
   * @param direction 移动方向
   */
  public moveDirection(direction: Direction): void {
    this.lastPosition = this.position;
    this.engine.setDirection(direction);
    this.position = this.position.add(this.engine.getVelocity());
    // 减少燃料:
    // float d = position.dist(lastPosition);
    // double r = Math.floor(d / 25);
    // resourceContainer.decrease(ResourceClass.FUEL, (float) r);
    // 判断是否没有燃料了 TODO:这里可以不设置为死掉,而是单纯的停止移动,直到被另一个打死
    if (this.resourceContainer.empty(ResourceClass.FUEL) && !this.dead) {
      this.dead = true;
      this.deadPosition = this.position.copy();
    }
  }

  /**
   * 自动移动
   *
   * @param enemyPosition 敌方飞船位置
   */
  public moveAgainst(enemyPosition: Vector): void {
    MoveSystem.collisionModel(this.engine, this.position);
    this.position = this.position.add(this.engine.getVelocity());
    MoveSystem.avoidanceModel(this.engine, this.position, enemyPosition);
    this.position = this.position.add(this.engine.getVelocity());
    MoveSystem.frictionModel(this.engine);
    this.position = this.position.add(this.engine.getVelocity());
    // TODO:减少燃料
  }

  /**
   * @param bullet 子弹
   * @return 该子弹是否会击中自己
   */
  public checkIfBeingHit(bullet: Bullet): boolean {
    return bullet.position.dist(this.position) < this.size.mag() / 2;
  }

  /**
   * 执行被击中的逻辑
   *
   * @param bullet 被击中时的子弹
   */
  public beingHit(bullet: Bullet): void {
    // console.log(this.role + " ship was hit, damage is " + bullet.damage);
    this.resourceContainer.decrease(ResourceClass.SHIELD, bullet.damage);
    // 配置画笔开始显示被击中效果
    this.printer.startShowingBeingHitEffect();
    if (this.resourceContainer.empty(ResourceClass.SHIELD)) {
      console.log("no shield");
      this.dead = true;
    }
  }

  public shoot(enemyShip: Ship): Bullet {
    let bullet = null;
    switch (this.role) {
      case Role.PLAYER:
        bullet = this.gun.shoot(
          this.position.copy(),
          this.shootDirection.copy()
        );
        break;
      case Role.COMPUTER:
        bullet = AimingSystem.directShootModel(
          this.gun,
          this.position,
          enemyShip.position
        );
        break;
    }
    return bullet;
  }

  public updateShootDirection(mousePosition: Vector): void {
    this.shootDirection = mousePosition
      .copy()
      .sub(this.position.copy())
      .normalize();
  }
}
