class ResourceContainer {
  resourceContainerMap: Map<ResourceEnum, number>;
  constructor(ammo: number, fuel: number, shield: number) {
    this.resourceContainerMap = new Map();
    this.resourceContainerMap.set(ResourceEnum.AMMO, ammo);
    this.resourceContainerMap.set(ResourceEnum.FUEL, fuel);
    this.resourceContainerMap.set(ResourceEnum.SHIELD, shield);
  }

  public increase(resourceType: ResourceEnum, amount: number): void {
    let val = this.resourceContainerMap.get(resourceType);
    val += amount;
    this.resourceContainerMap.set(resourceType, val);
  }

  public decrease(resourceType: ResourceEnum, amount: number): void {
    this.increase(resourceType, -amount);
  }

  public get(resourceType: ResourceEnum): number {
    return this.resourceContainerMap.get(resourceType);
  }

  public empty(resourceType: ResourceEnum): boolean {
    return this.resourceContainerMap.get(resourceType) < 0;
  }
}
