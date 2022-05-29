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
    "NO!!!!",
    "FxxK YOU!",
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
    this.sloganList.push(new SloganPrinter(slogan, position.copy()));
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
