class Resource {
  public position: Vector;
  /**
   * 这滴油的油量
   */
  volume: number;
  resourceClass: ResourceClass;
  /**
   * 这滴油的剩余寿命
   */
  remainLife: number;

  constructor() {
    this.position = MoveSystem.randomPosition();
    this.volume = Resource.getRandomVolume();
    this.resourceClass = Resource.getRandomClass();
    this.remainLife = Resource.getRandomLife();
  }

  public getRemainLife(): number {
    return this.remainLife;
  }

  public getResourceClass(): ResourceClass {
    return this.resourceClass;
  }

  public getVolume(): number {
    return this.volume;
  }

  private static getRandomClass(): ResourceClass {
    let rand = Math.random();
    if (rand > 0.6) {
      return ResourceClass.AMMO;
    } else if (rand > 0.3) {
      return ResourceClass.SHIELD;
    } else {
      return ResourceClass.FUEL;
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
