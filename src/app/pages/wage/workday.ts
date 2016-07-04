import {WorkShift} from "./work-shift";
import {Duration} from "../../services/duration";
import {DurationService} from "../../services/duration.service";
import * as moment from 'moment';
import {Settings} from "../../resources/settings";

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
    let normalFee = new Duration(0, 0);
    let eveningFee = new Duration(0, 0);

    this.workingShifts.forEach(shift => {
      hours += shift.duration.hours;
      minutes += shift.duration.minutes;
      normalFee.add(shift.normalFee);
      eveningFee.add(shift.nightFee);
    });
    hours += Math.floor(minutes / 60);
    minutes = minutes % 60;

    return hours + ":" + minutes + " normal fee: " + normalFee.toString() + " evening fee: " + eveningFee.toString();
  }

  private calculateShiftStart(shift:WorkShift) {
    let nightFeeEnd:string;
    if (this.timeBetween(shift.end, Settings.eveningCompensationStarts, "24:00") ||
      this.timeBetween(shift.end, "0:00", Settings.eveningCompensationEnds)
    ) {
      if (moment(shift.end, "H:mm").isBefore(moment(Settings.eveningCompensationEnds, "H:mm")) ||
        moment(shift.end, "H:mm").isBefore(moment("24:00", "H:mm"))
      ) {
        // if shift starts in the morning, and ends late in the evening
        if(moment(shift.start, "H:mm").isBefore(moment(Settings.eveningCompensationEnds, "H:mm")) &&
            moment(shift.end, "H:mm").isAfter(moment(Settings.eveningCompensationEnds, "H:mm"))
        ){
          shift.normalFee.add(DurationService.calculateDuration(Settings.eveningCompensationEnds, Settings.eveningCompensationStarts));
          shift.nightFee.add(DurationService.calculateDuration(shift.start, Settings.eveningCompensationEnds));
          shift.nightFee.add(DurationService.calculateDuration(Settings.eveningCompensationStarts, shift.end));
          return;
        }
        nightFeeEnd = shift.end;
      }
      else {
        nightFeeEnd = Settings.eveningCompensationEnds;
        shift.normalFee.add(DurationService.calculateDuration(Settings.eveningCompensationEnds, shift.end));
      }
    }
    else {
      nightFeeEnd = Settings.eveningCompensationEnds;
      shift.normalFee.add(DurationService.calculateDuration(Settings.eveningCompensationEnds, shift.end));
    }
    shift.nightFee.add(DurationService.calculateDuration(shift.start, nightFeeEnd));
  }

  private calculateShiftEnd(shift:WorkShift) {
    let nightFeeStart:any;
    let startHour = parseInt(shift.start.split(":")[0]);
    let nightFeeStartHour = parseInt(Settings.eveningCompensationStarts.split(":")[0]);
    let nightFeeEndHour = parseInt(Settings.eveningCompensationEnds.split(":")[0]);
    if (startHour < nightFeeStartHour && startHour > nightFeeEndHour) {
      shift.normalFee.add(DurationService.calculateDuration(shift.start, Settings.eveningCompensationStarts));
      nightFeeStart = Settings.eveningCompensationStarts;
    }
    else {
      nightFeeStart = shift.start;
    }
    shift.nightFee.add(DurationService.calculateDuration(nightFeeStart, shift.end));
  }

  public calculateDailyHours() {
    this.workingShifts.sort(
      (a, b) => {
        return parseInt(a.start.split(":")[0]) - parseInt(b.start.split(":")[0]);
      });

    this.workingShifts.forEach(shift => {
      /* TODO starting before evening compensation, and ends aftes compensation ends */
      if (this.timeBetween(shift.start, Settings.eveningCompensationStarts, "24:00") ||
        this.timeBetween(shift.start, "0:00", Settings.eveningCompensationEnds)
      ) {
        this.calculateShiftStart(shift);
      }
      else if (this.timeBetween(shift.end, Settings.eveningCompensationStarts, "24:00") ||
        this.timeBetween(shift.end, "0:00", Settings.eveningCompensationEnds)
      ) {
        this.calculateShiftEnd(shift);
      }
      else {
        shift.normalFee.add(shift.duration);
      }
    });
  }


  private timeBetween(time:string, start:string, stop:string):boolean {
    return moment(time, "H:mm").isBetween(moment(start, "H:mm"), moment(stop, "H:mm"));
  }

  public toString() {
    let shifts:string = this.day + " " + this.calculateDailyAmount() + "\n";
    this.workingShifts.forEach(shift => shifts += "\t" + shift.toString() + "\n");
    return shifts;
  }
}
