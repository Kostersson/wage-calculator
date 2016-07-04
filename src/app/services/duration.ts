export class Duration {
  constructor(public hours:number,
              public minutes:number) {
  }

  public add(duration:Duration) {
    this.minutes += duration.minutes;
    this.hours += duration.hours + Math.floor(this.minutes / 60);
    this.minutes = this.minutes % 60;
  }

  public toString() {
    return this.hours + ":" + this.minutes;
  }
}
