class Gun {
  private resourceContainer: ResourceContainer;
  private role: RoleEnum;

  constructor(resourceContainer: ResourceContainer, role: RoleEnum) {
    this.resourceContainer = resourceContainer;
    this.role = role;
  }

  /**
   * @param position       枪的当前坐标
   * @param shootDirection 发射方向
   * @return 子弹
   */
  public shoot(position: Vector, shootDirection: Vector): Bullet {
    if (this.resourceContainer.get(ResourceEnum.AMMO) < 10) {
      return null;
    }
    //if we don't have enough oil, then return null directly
    let bullet = new Bullet(position.copy(), shootDirection, 10, this.role);
    this.resourceContainer.decrease(ResourceEnum.AMMO, 10);
    return bullet;
  }
}
