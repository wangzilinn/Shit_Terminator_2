class Vector {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public div(num: number): Vector {
    let res = this.copy();
    res.x /= num;
    res.y /= num;
    return res;
  }

  public mult(num: number): Vector {
    let res = this.copy();
    res.x *= num;
    res.y *= num;
    return res;
  }

  public add(vec: Vector): Vector {
    let res = this.copy();
    res.x += vec.x;
    res.y += vec.y;
    return res;
  }

  public sub(vec: Vector): Vector {
    let res = this.copy();
    res.x -= vec.x;
    res.y -= vec.y;
    return res;
  }

  public copy(): Vector {
    return new Vector(this.x, this.y);
  }

  public mag(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  public normalize(): Vector {
    let res = this.copy();
    let m = this.mag();
    return res.div(m);
  }

  public dist(vec: Vector): number {
    let dx = this.x - vec.x;
    let dy = this.y - vec.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  public heading(): number {
    return Math.atan2(this.y, this.x);
  }
}
