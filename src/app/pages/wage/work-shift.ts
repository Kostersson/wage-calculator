import {DurationService} from "../../services/duration.service";
import {Duration} from "../../services/duration";
import {WorkingHours} from "./working-hours";

export class WorkShift {
  public workingHours:WorkingHours;
  public duration:Duration;

  constructor(public start:string,
              public end:string) {
    this.duration = DurationService.calculateDuration(start, end);
    this.workingHours = new WorkingHours();
  }

  public toString():string {
    return this.duration.hours + ":" + this.duration.minutes + " (" + this.start + " - " + this.end + ")";
  }
}
