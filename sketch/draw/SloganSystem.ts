class SloganPrinter {
  public position: Vector;
  public slogan: String;
  public remainingFrame: number;
  constructor(slogan: String, position: Vector) {
    this.slogan = slogan;
    this.position = position;
    this.remainingFrame = 60;
  }

  public reduceRemainingFrame() {
    this.remainingFrame--;
  }
}

class SloganSystem {
  private sloganList: Array<SloganPrinter>;
  private static slogans: String[] = [
    "That's HURT!",
    "AAAAAAAA!",
    "I'M GNNA DIE!",
    "STOP SHOOTING ME!",
    "PLEASE STOP~~",
    "GO FxxK YOUSELF",
    "FxxK YOU!",
    "求求你别打了",
    "我的老天鹅呀",
    "你再打一个试试？！",
    "你这个渣渣！",
    "你打我？那我就干你",
    "笑死",
  ];
  constructor() {
    this.sloganList = [];
  }
  public addSlogan(slogan: String, position: Vector) {
    if (slogan == undefined) {
      slogan =
        SloganSystem.slogans[
          Math.floor(Math.random() * SloganSystem.slogans.length)
        ];
    }
    this.sloganList.push(
      new SloganPrinter(slogan, position.add(new Vector(50, 0)))
    );
  }
  public draw() {
    for (let sloganPrinter of this.sloganList) {
      fill(0);
      textSize(20);
      text(
        sloganPrinter.slogan,
        sloganPrinter.position.x,
        sloganPrinter.position.y
      );
      sloganPrinter.reduceRemainingFrame();
      //   console.log(sloganPrinter.remainingFrame);
    }
    this.sloganList = this.sloganList.filter(
      (sloganPrinter) => sloganPrinter.remainingFrame > 0
    );
  }
}
