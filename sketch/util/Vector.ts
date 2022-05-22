class Vector{
    x:number
    y:number

    constructor(x:number, y:number){
        this.x = x;
        this.y = y;
    }


    public div(num:number){
        let res = new Vector(this.x, this.y)
        res.x /= num
        res.y /= num
        return res 
    }
}