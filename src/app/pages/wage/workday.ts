import {WorkShift} from "./work-shift";
import {Duration} from "../../services/duration";
import {DurationService} from "../../services/duration.service";
import * as moment from 'moment';
import {Settings} from "../../resources/settings";
import {WorkingHours} from "./working-hours";

export class WorkDay {
  private workingShifts:WorkShift[];

  constructor(public day:string) {
    this.workingShifts = [];
  }

  public getWorkingShifts():WorkShift[] {
    return this.workingShifts;
  }

  public addWorkingShifts(workingShifts:WorkShift[]):void {
    this.workingShifts = this.workingShifts.concat(workingShifts);
  }

  public calculateDailyAmount():string {
    this.calculateDailyHours();

    let hours:number = 0;
    let minutes:number = 0;
    let workingHours = new WorkingHours();

    this.workingShifts.forEach(shift => {
      hours += shift.duration.hours;
      minutes += shift.duration.minutes;
      workingHours.add(shift.workingHours);
    });
    hours += Math.floor(minutes / 60);
    minutes = minutes % 60;

    return hours + ":" + minutes + " normal fee: " + workingHours.normalFee.toString() + " evening fee: " + workingHours.nightFee.toString();
  }

  private calculateShiftStart(shift:WorkShift):WorkingHours {
    let workingHours = new WorkingHours();
    let nightFeeEnd:string;
    if (this.timeBetween(shift.end, Settings.eveningCompensationStarts, "24:00") ||
      this.timeBetween(shift.end, "0:00", Settings.eveningCompensationEnds)
    ) {
      if (moment(shift.end, "H:mm").isBefore(moment(Settings.eveningCompensationEnds, "H:mm")) ||
        moment(shift.end, "H:mm").isBefore(moment("24:00", "H:mm"))
      ) {
        // if shift starts in the morning, and ends late in the evening
        if (moment(shift.start, "H:mm").isBefore(moment(Settings.eveningCompensationEnds, "H:mm")) &&
          moment(shift.end, "H:mm").isAfter(moment(Settings.eveningCompensationEnds, "H:mm"))
        ) {
          workingHours.normalFee.add(DurationService.calculateDuration(Settings.eveningCompensationEnds, Settings.eveningCompensationStarts));
          workingHours.nightFee.add(DurationService.calculateDuration(shift.start, Settings.eveningCompensationEnds));
          workingHours.nightFee.add(DurationService.calculateDuration(Settings.eveningCompensationStarts, shift.end));
          return;
        }
        nightFeeEnd = shift.end;
      }
      else {
        nightFeeEnd = Settings.eveningCompensationEnds;
        workingHours.normalFee.add(DurationService.calculateDuration(Settings.eveningCompensationEnds, shift.end));
      }
    }
    else {
      nightFeeEnd = Settings.eveningCompensationEnds;
      workingHours.normalFee.add(DurationService.calculateDuration(Settings.eveningCompensationEnds, shift.end));
    }
    workingHours.nightFee.add(DurationService.calculateDuration(shift.start, nightFeeEnd));
    return workingHours;
  }

  private calculateShiftEnd(shift:WorkShift):WorkingHours {
    let workingHours = new WorkingHours();
    let nightFeeStart:any;
    let startHour = parseInt(shift.start.split(":")[0]);
    let nightFeeStartHour = parseInt(Settings.eveningCompensationStarts.split(":")[0]);
    let nightFeeEndHour = parseInt(Settings.eveningCompensationEnds.split(":")[0]);
    if (startHour < nightFeeStartHour && startHour > nightFeeEndHour) {
      workingHours.normalFee.add(DurationService.calculateDuration(shift.start, Settings.eveningCompensationStarts));
      nightFeeStart = Settings.eveningCompensationStarts;
    }
    else {
      nightFeeStart = shift.start;
    }
    workingHours.nightFee.add(DurationService.calculateDuration(nightFeeStart, shift.end));
    return workingHours;
  }

  private calculateOverNightFee(shift:WorkShift):WorkingHours {
    let workingHours = new WorkingHours();
    workingHours.normalFee.add(DurationService.calculateDuration(shift.start, Settings.eveningCompensationStarts));
    workingHours.nightFee.add(DurationService.calculateDuration(Settings.eveningCompensationStarts, "24:00"));
    workingHours.nightFee.add(DurationService.calculateDuration("0:00", Settings.eveningCompensationEnds));
    workingHours.normalFee.add(DurationService.calculateDuration(Settings.eveningCompensationEnds, shift.end));

    return workingHours;
  }

  public calculateDailyHours() {
    this.workingShifts.sort(
      (a, b) => {
        return parseInt(a.start.split(":")[0]) - parseInt(b.start.split(":")[0]);
      });

    this.workingShifts.forEach(shift => {
        if (this.timeBetween(shift.start, Settings.eveningCompensationStarts, "24:00") ||
          this.timeBetween(shift.start, "0:00", Settings.eveningCompensationEnds)
        ) {
          shift.workingHours.add(this.calculateShiftStart(shift));
        }
        else if (this.timeBetween(shift.end, Settings.eveningCompensationStarts, "24:00") ||
          this.timeBetween(shift.end, "0:00", Settings.eveningCompensationEnds)
        ) {
          shift.workingHours.add(this.calculateShiftEnd(shift));
        }
        else {
          if (parseInt(shift.start.split(":")[0]) > parseInt(shift.end.split(":")[0])) {
            shift.workingHours.add(this.calculateOverNightFee(shift));
          }
          let workingHours =
            shift.workingHours.add(WorkingHours.createWorkingHours(shift.duration, new Duration(0,0)));

        }
      }
    );
  }


  private
  timeBetween(time:string, start:string, stop:string):boolean {
    return moment(time, "H:mm").isBetween(moment(start, "H:mm"), moment(stop, "H:mm"));
  }

  public
  toString() {
    let shifts:string = this.day + " " + this.calculateDailyAmount() + "\n";
    this.workingShifts.forEach(shift => shifts += "\t" + shift.toString() + "\n");
    return shifts;
  }
}
