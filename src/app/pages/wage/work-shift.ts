import {DurationService} from "../../services/duration.service";
import {Duration} from "../../services/duration";
import {Settings} from "../../resources/settings";
import * as moment from 'moment';

export class WorkShift {
  public duration:Duration;
  public normalFee:Duration;
  public nightFee:Duration;

  constructor(public start:string,
              public end:string) {
    this.normalFee = new Duration(0, 0);
    this.nightFee = new Duration(0, 0);
    this.duration = DurationService.calculateDuration(start, end);
    this.calculateShiftHours();
  }

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
        this.normalFee.add(this.duration);
      }
    }
  }

  private calculateShiftStart() {
    let nightFeeEnd:string;
    if (this.timeBetween(this.end, Settings.eveningCompensationStarts, "24:00") ||
      this.timeBetween(this.end, "0:00", Settings.eveningCompensationEnds)
    ) {
      // if this starts in the morning, and ends late in the evening
      if (moment(this.start, "H:mm").isBefore(moment(Settings.eveningCompensationEnds, "H:mm")) &&
        moment(this.end, "H:mm").isAfter(moment(Settings.eveningCompensationEnds, "H:mm"))
      ) {
        this.normalFee.add(DurationService.calculateDuration(Settings.eveningCompensationEnds, Settings.eveningCompensationStarts));
        this.nightFee.add(DurationService.calculateDuration(this.start, Settings.eveningCompensationEnds));
        this.nightFee.add(DurationService.calculateDuration(Settings.eveningCompensationStarts, this.end));
        return;
      }
      nightFeeEnd = this.end;
    }
    else {
      nightFeeEnd = Settings.eveningCompensationEnds;
      this.normalFee.add(DurationService.calculateDuration(Settings.eveningCompensationEnds, this.end));
    }
    this.nightFee.add(DurationService.calculateDuration(this.start, nightFeeEnd));
  }

  private calculateShiftEnd() {
    let nightFeeStart:any;
    let startHour = parseInt(this.start.split(":")[0]);
    let nightFeeStartHour = parseInt(Settings.eveningCompensationStarts.split(":")[0]);
    let nightFeeEndHour = parseInt(Settings.eveningCompensationEnds.split(":")[0]);
    if (startHour < nightFeeStartHour && startHour >= nightFeeEndHour) {
      this.normalFee.add(DurationService.calculateDuration(this.start, Settings.eveningCompensationStarts));
      nightFeeStart = Settings.eveningCompensationStarts;
    }
    else {
      nightFeeStart = this.start;
    }
    this.nightFee.add(DurationService.calculateDuration(nightFeeStart, this.end));
  }

  private calculateOverNightFee():boolean {
    let startHour = parseInt(this.start.split(":")[0]);
    let endHour = parseInt(this.end.split(":")[0]);
    if (startHour > endHour) {
      this.normalFee.add(DurationService.calculateDuration(this.start, Settings.eveningCompensationStarts));
      this.nightFee.add(DurationService.calculateDuration(Settings.eveningCompensationStarts, "24:00"));
      this.nightFee.add(DurationService.calculateDuration("0:00", Settings.eveningCompensationEnds));
      this.normalFee.add(DurationService.calculateDuration(Settings.eveningCompensationEnds, this.end));
      return true;
    }
    return false
  }

  private timeBetween(time:string, start:string, stop:string):boolean {
    return moment(time, "H:mm").isBetween(moment(start, "H:mm"), moment(stop, "H:mm"));
  }

  public toString():string {
    return this.duration.hours + ":" + this.duration.minutes + " (" + this.start + " - " + this.end + ")";
  }
}
