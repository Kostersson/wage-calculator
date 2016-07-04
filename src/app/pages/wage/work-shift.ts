import {DurationService} from "../../services/duration.service";
import {Duration} from "../../services/duration";

export class WorkShift {
  public duration:Duration;
  public normalFee:Duration;
  public nightFee:Duration;

  constructor(public start:string,
              public end:string) {
    this.normalFee = new Duration(0,0);
    this.nightFee = new Duration(0,0);
    this.duration = DurationService.calculateDuration(start, end);
  }

  public toString():string {
    return this.duration.hours + ":" + this.duration.minutes + " (" + this.start + " - " + this.end + ")";
  }
}
