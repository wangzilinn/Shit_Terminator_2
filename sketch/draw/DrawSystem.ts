class DrawSystem {
    size: Vector
    centerPosition: Vector

    constructor(size:Vector){
        this.centerPosition = size.div(2)
        this.size = size
    }


    public drawReadyScreen() {
        fill(0);
        textSize(60);
        let str = "Shit Terminator";
        text(str, this.getAlignX(str, 60, this.size.x), this.centerPosition.y);
        str = "press space to start";
        textSize(20);
        text(str, this.getAlignX(str, 20, this.size.x), this.centerPosition.y + 40);
    }

    private getAlignX(str:string, textSize:number,width:number) {
        let len = str.length * textSize / 2;
        return (int) (width / 2 - len / 2);
    }
}