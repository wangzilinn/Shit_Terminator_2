class Resource {
  public position: Vector;
  /**
   * 这滴油的油量
   */
  public volume: number;
  public resourceType: ResourceEnum;
  /**
   * 这滴油的剩余寿命
   */
  public remainLife: number;
  public printer: ResourcePrinter;

  constructor() {
    // 初始化位置
    this.position = MoveSystem.randomPosition();
    // 初始化资源大小
    this.volume = Resource.getRandomVolume();
    // 初始化资源类型
    this.resourceType = Resource.getRandomKind();
    // 初始化剩余寿命
    this.remainLife = Resource.getRandomLife();
    // 初始化打印器
    this.printer = new ResourcePrinter(this.resourceType);
  }

  private static getRandomKind(): ResourceEnum {
    let rand = Math.random();
    if (rand > 0.6) {
      return ResourceEnum.AMMO;
    } else if (rand > 0.3) {
      return ResourceEnum.SHIELD;
    } else {
      return ResourceEnum.FUEL;
    }
  }

  private static getRandomVolume(): number {
    return Math.random() * 10;
  }

  private static getRandomLife(): number {
    return int(Math.random() * 600);
  }

  public reduceLife(): void {
    if (this.remainLife > 0) {
      this.remainLife -= 1;
    }
  }
}
