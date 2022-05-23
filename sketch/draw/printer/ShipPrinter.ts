class ShipPrinter {
  //被击中后的效果:
  private beingHitFrame = 60; //60帧
  /**
   * 外面的环的颜色值
   */
  private ringColorValue = [240, 150, 100, 150, 240];
  /**
   * 在Ship中被设为true后开始显示被集中效果，等到帧显示完之后应变为false
   */
  private showBeingHitEffect = false;

  //吸收资源后的效果:
  private beingHitFrameCnt = 0;
  private ringColor: Color;

  /**
   * 平移颜色值
   */
  public shiftRingColorValue(): void {
    let temp = this.ringColorValue[0];
    // System.arraycopy(ringColorValue, 1, ringColorValue, 0, ringColorValue.length - 1);
    this.ringColorValue[this.ringColorValue.length - 1] = temp;
  }

  public startShowingAbsorbResourceEffect(resourceClass: ResourceClass): void {
    switch (resourceClass) {
      case ResourceClass.AMMO:
        this.ringColor = Color.RED;
        break;
      case ResourceClass.FUEL:
        this.ringColor = Color.GREEN;
        break;
      case ResourceClass.SHIELD:
        this.ringColor = Color.BLUE;
        break;
    }
  }

  public checkIfShowBeingHitEffect(): boolean {
    return this.showBeingHitEffect;
  }

  public increaseBeingHitFrame(): void {
    if (this.showBeingHitEffect) {
      this.beingHitFrameCnt++;
    }
    if (this.beingHitFrameCnt >= this.beingHitFrame) {
      this.showBeingHitEffect = false;
      this.beingHitFrameCnt = 0;
    }
  }

  /**
   * 调用该方法则指示开始显示被击中效果
   */
  public startShowingBeingHitEffect(): void {
    this.showBeingHitEffect = true;
  }
}
