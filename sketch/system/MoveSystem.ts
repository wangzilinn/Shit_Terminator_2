class MoveSystem {
  public static randomPosition(): Vector {
    let x = new Meta().screenSize.x;
    let y = new Meta().screenSize.y;

    return new Vector(Math.random() * x, Math.random() * y);
  }

  public static randomVelocity(): Vector {
    return new Vector((Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5);
  }

  /**
   * 完全碰撞模型
   *
   * @param engine   .
   * @param position 当前entity所在位置
   */
  public static collisionModel(engine: Engine, position: Vector): void {
    if (position.x > new Meta().screenSize.x || position.x < 0) {
      let velocity = engine.getVelocity();
      velocity.x = -velocity.x;
    }
    if (position.y > new Meta().screenSize.y || position.y < 0) {
      let velocity = engine.getVelocity();
      velocity.y = -velocity.y;
    }
  }

  /**
   * 避免碰撞模型
   *
   * @param engine          .
   * @param currentPosition 当前所在位置
   * @param avoidPosition   要躲避的entity所在位置
   */
  public static avoidanceModel(
    engine: Engine,
    currentPosition: Vector,
    avoidPosition: Vector
  ): void {
    let dist = currentPosition.dist(avoidPosition);
    let sub = currentPosition.sub(avoidPosition).normalize();
    let direction = sub.normalize();
    let acc = direction.mult((1 / dist) * 5).copy();
    if (dist < 300) {
      engine.setAcceleration(acc);
    }
  }

  /**
   * 滑动摩擦模型
   *
   * @param engine .
   */
  public static frictionModel(engine: Engine): void {
    let accDirection = engine.getVelocity().normalize();
    let friction = accDirection.mult(-0.005);
    let acc = engine.getAcceleration().copy();
    if (Math.abs(engine.getVelocity().x) > 3) {
      acc.x += friction.x;
    } else {
      acc.x = 0;
    }
    if (Math.abs(engine.getVelocity().y) > 3) {
      acc.y += friction.y;
    } else {
      acc.y = 0;
    }
    engine.setAcceleration(acc);
  }
}
