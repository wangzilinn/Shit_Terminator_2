class ResourcePrinter {
  public color: Color;
  constructor(resourceType: ResourceEnum) {
    switch (resourceType) {
      case ResourceEnum.AMMO:
        this.color = new Color(255, 0, 0, 0);
        break;
      case ResourceEnum.FUEL:
        this.color = new Color(0, 200, 0, 0);
        break;
      case ResourceEnum.SHIELD:
        this.color = new Color(0, 0, 255, 0);
    }
  }
}
