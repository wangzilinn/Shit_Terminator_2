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

  constructor(role: Role) {
    this.role = role;
    this.deadPosition = new Vector(0, 0);
    this.size = new Vector(70, 70);
    this.shootDirection = new Vector(1, 1);

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
          5
        );
        break;
      case Role.PLAYER:
        this.position = new Vector(
          Meta.screenSize.x / 2,
          Meta.screenSize.y / 2
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
}
