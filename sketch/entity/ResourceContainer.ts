class ResourceContainer {
    resourceContainerMap:Map<ResourceClass, number>
    constructor(ammo:number, fuel:number, shield:number){
        this.resourceContainerMap = new Map()
        this.resourceContainerMap.set(ResourceClass.AMMO, ammo);
        this.resourceContainerMap.set(ResourceClass.FUEL, fuel);
        this.resourceContainerMap.set(ResourceClass.SHIELD, shield);
    }

    public increase(resourceClass: ResourceClass, amount:number):void {
        let val = this.resourceContainerMap.get(resourceClass)
        val += amount
        this.resourceContainerMap.set(resourceClass, val)
    }

    public decrease(resourceClass:ResourceClass, amount:number):void {
        this.increase(resourceClass, -amount);
    }

    public get(resourceClass:ResourceClass): number {
        return this.resourceContainerMap.get(resourceClass);
    }

    public empty(resourceClass: ResourceClass): boolean {
        return this.resourceContainerMap.get(resourceClass) < 0;
    }


}