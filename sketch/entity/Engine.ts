class Engine {
  private resourceContainer: ResourceContainer;
  private velocity: Vector;
  private acceleration: Vector;
  private enableAcceleration: boolean;
  private enableVelocityLimiter: boolean;
  private maxVelocity: number;

  constructor(
    resourceContainer: ResourceContainer,
    velocity: Vector,
    acceleration: Vector,
    enableAcceleration: boolean,
    enableVelocityLimiter: boolean,
    maxVelocity: number
  ) {
    this.resourceContainer = resourceContainer;
    this.velocity = velocity;
    this.acceleration = acceleration;
    this.enableAcceleration = enableAcceleration;
    this.enableVelocityLimiter = enableVelocityLimiter;
    this.maxVelocity = maxVelocity;
  }

  public setDirection(direction: DirectionEnum): void {
    if (this.enableAcceleration) {
      this.acceleration = new Vector(0, 0);
      switch (direction) {
        case DirectionEnum.UP:
          this.acceleration.y = -1;
          break;
        case DirectionEnum.DOWN:
          this.acceleration.y = 1;
          break;
        case DirectionEnum.LEFT:
          this.acceleration.x = -1;
          break;
        case DirectionEnum.RIGHT:
          this.acceleration.x = 1;
      }
    } else {
      this.velocity = new Vector(0, 0);
      switch (direction) {
        case DirectionEnum.UP:
          this.velocity.y = -10;
          break;
        case DirectionEnum.DOWN:
          this.velocity.y = 10;
          break;
        case DirectionEnum.LEFT:
          this.velocity.x = -10;
          break;
        case DirectionEnum.RIGHT:
          this.velocity.x = 10;
      }
    }
  }

  public getVelocity(): Vector {
    this.accLimiter(0.03);
    this.velocity = this.velocity.add(this.acceleration);
    if (this.enableVelocityLimiter) {
      this.velocityLimiter();
    }
    return this.velocity;
  }

  public setAcceleration(acceleration: Vector) {
    this.acceleration = acceleration;
  }

  public getAcceleration() {
    return this.acceleration;
  }

  private accLimiter(limit: number): void {
    if (this.acceleration.x > limit) {
      this.acceleration.x = limit;
    }
    if (this.acceleration.x < -limit) {
      this.acceleration.x = -limit;
    }
    if (this.acceleration.y > limit) {
      this.acceleration.y = limit;
    }
    if (this.acceleration.y < -limit) {
      this.acceleration.y = -limit;
    }
  }

  private velocityLimiter(): void {
    if (this.velocity.mag() > this.maxVelocity) {
      this.velocity = this.velocity.normalize().mult(this.maxVelocity);
    }
  }
}
