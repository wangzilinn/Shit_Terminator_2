class Bullet {
  private role: Role;
  public position: Vector;
  public size: Vector;
  directionVector: Vector;
  distance: number;
  /**
   * 这个子弹可以让坏蛋掉多少血
   */
  damage: number;

  constructor(
    position: Vector,
    directionVector: Vector,
    damage: number,
    role: Role
  ) {
    this.directionVector = directionVector.copy();
    this.position = position.copy();
    this.size = new Vector(10, 10);
    this.damage = damage;
    this.role = role;
  }

  public move(): void {
    this.distance++;
    this.position = this.position.add(this.directionVector.mult(10));
  }

  public getRole(): Role {
    return this.role;
  }

  public getDirectionVector(): Vector {
    return this.directionVector;
  }
}
