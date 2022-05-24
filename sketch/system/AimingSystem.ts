class AimingSystem {
  public static directShootModel(
    gun: Gun,
    currentPosition: Vector,
    enemyPosition: Vector
  ): Bullet {
    let direction = enemyPosition.copy().sub(currentPosition).normalize();
    return gun.shoot(currentPosition, direction);
  }
}
