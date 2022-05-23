class Info {
    maxLevel = 1;
    levels = ["Hero", "Salvation"];
    currentLevel = 0;

    /**
     * 用于记录每一个关卡的名字显示的时间
     */


    public getMaxLevel() {
        return this.maxLevel;
    }

    public resetLevel() {
        this.currentLevel = 0;
    }

    public upgradeLevel() {
        this.currentLevel++;
    }

    public isMaxLevel() {
        return this.currentLevel == this.maxLevel;
    }

    public getCurrentLevel() {
        return this.currentLevel;
    }

    public getCurrentLevelName() {
        return this.levels[this.currentLevel];
    }
}