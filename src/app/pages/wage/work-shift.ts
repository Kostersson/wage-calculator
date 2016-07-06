import {DurationService} from "../../services/duration.service";
import {Duration} from "../../services/duration";
import {Settings} from "../../resources/settings";
import * as moment from 'moment';

export class WorkShift {
  public duration:Duration;
  public normalHours:Duration;
  public eveningHours:Duration;

  constructor(public start:string,
              public end:string) {
    this.normalHours = new Duration(0, 0);
    this.eveningHours = new Duration(0, 0);
    this.duration = DurationService.calculateDuration(start, end);
    this.calculateShiftHours();
  }

  /**
   * Calculates work shifts normal hours and evening hours
   */
  private calculateShiftHours() {
    if (this.timeBetween(this.start, Settings.eveningCompensationStarts, "24:00") ||
      this.timeBetween(this.start, "0:00", Settings.eveningCompensationEnds)
    ) {
      this.calculateShiftStart();
    }
    else if (this.timeBetween(this.end, Settings.eveningCompensationStarts, "24:00") ||
      this.timeBetween(this.end, "0:00", Settings.eveningCompensationEnds)
    ) {
      this.calculateShiftEnd();
    }
    else {
      if (!this.calculateOverNightFee()) {
        this.normalHours.add(this.duration);
      }
    }
  }

  /**
   * Calculates work shifts normal hours and evening hours,
   * when shift starts during evening compensation
   */
  private calculateShiftStart() {
    let eveningHoursEnd:string;
    if (this.timeBetween(this.end, Settings.eveningCompensationStarts, "24:00") ||
      this.timeBetween(this.end, "0:00", Settings.eveningCompensationEnds)
    ) {
      // if this starts in the morning, and ends late in the evening
      if (moment(this.start, "H:mm").isBefore(moment(Settings.eveningCompensationEnds, "H:mm")) &&
        moment(this.end, "H:mm").isAfter(moment(Settings.eveningCompensationEnds, "H:mm"))
      ) {
        this.normalHours.add(DurationService.calculateDuration(Settings.eveningCompensationEnds, Settings.eveningCompensationStarts));
        this.eveningHours.add(DurationService.calculateDuration(this.start, Settings.eveningCompensationEnds));
        this.eveningHours.add(DurationService.calculateDuration(Settings.eveningCompensationStarts, this.end));
        return;
      }
      eveningHoursEnd = this.end;
    }
    else {
      eveningHoursEnd = Settings.eveningCompensationEnds;
      this.normalHours.add(DurationService.calculateDuration(Settings.eveningCompensationEnds, this.end));
    }
    this.eveningHours.add(DurationService.calculateDuration(this.start, eveningHoursEnd));
  }

  /**
   * Calculates work shifts normal hours and evening hours,
   * when shift ends during evening compensation
   */
  private calculateShiftEnd() {
    let eveningHoursStart:any;
    let startHour = parseInt(this.start.split(":")[0]);
    let eveningHoursStartHour = parseInt(Settings.eveningCompensationStarts.split(":")[0]);
    let eveningHoursEndHour = parseInt(Settings.eveningCompensationEnds.split(":")[0]);
    if (startHour < eveningHoursStartHour && startHour >= eveningHoursEndHour) {
      this.normalHours.add(DurationService.calculateDuration(this.start, Settings.eveningCompensationStarts));
      eveningHoursStart = Settings.eveningCompensationStarts;
    }
    else {
      eveningHoursStart = this.start;
    }
    this.eveningHours.add(DurationService.calculateDuration(eveningHoursStart, this.end));
  }

  /**
   * Calculates work shifts normal hours and evening hours,
   * when shift shift lasts over night
   */
  private calculateOverNightFee():boolean {
    let startHour = parseInt(this.start.split(":")[0]);
    let endHour = parseInt(this.end.split(":")[0]);
    if (startHour > endHour) {
      this.normalHours.add(DurationService.calculateDuration(this.start, Settings.eveningCompensationStarts));
      this.eveningHours.add(DurationService.calculateDuration(Settings.eveningCompensationStarts, "24:00"));
      this.eveningHours.add(DurationService.calculateDuration("0:00", Settings.eveningCompensationEnds));
      this.normalHours.add(DurationService.calculateDuration(Settings.eveningCompensationEnds, this.end));
      return true;
    }
    return false
  }

  /**
   * Checks if given time is between two other times
   * @param {string} time - Time to check (H:MM)
   * @param {string} start - Start time (H:MM)
   * @param {string} stop - Stop time (H:MM)
   */
  private timeBetween(time:string, start:string, stop:string):boolean {
    return moment(time, "H:mm").isBetween(moment(start, "H:mm"), moment(stop, "H:mm"));
  }

  public toString():string {
    return this.duration.hours + ":" + this.duration.minutes + " (" + this.start + " - " + this.end + ")";
  }
}
