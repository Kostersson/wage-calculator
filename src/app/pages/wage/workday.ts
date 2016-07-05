import {WorkShift} from "./work-shift";
import {Duration} from "../../services/duration";
import {DurationService} from "../../services/duration.service";
import * as moment from 'moment';
import {Settings} from "../../resources/settings";

export class Workday {
  private workingShifts:WorkShift[];

  private normalFee:Duration;
  private eveningFee:Duration;
  private wage:number;

  constructor(public day:string) {
    this.workingShifts = [];
    this.resetDurations();
  }

  public getWorkingShifts():WorkShift[] {
    return this.workingShifts;
  }

  public getNormalFee():Duration {
    return this.normalFee;
  }

  public getEveningFee():Duration {
    return this.eveningFee;
  }

  public getDailyWage():number {
    return this.wage;
  }

  public addWorkingShifts(workingShifts:WorkShift[]):void {
    this.workingShifts = this.workingShifts.concat(workingShifts);
    this.calculateDailyAmount();
  }

  private resetDurations(){
    this.normalFee = new Duration(0, 0);
    this.eveningFee = new Duration(0, 0);
  }

  private calculateDailyAmount() {

    this.calculateDailyHours();
    this.calculateTotalWorkingHours();

    let minutes = (this.normalFee.minutes + this.eveningFee.minutes) % 60;
    let hours = this.normalFee.hours + this.eveningFee.hours + Math.floor((this.normalFee.minutes + this.eveningFee.minutes) / 60);

    if (hours < 8) {
      this.wage = this.calculateRegularWage(hours, minutes);
    }
    else if (hours == 8) {
      this.wage = this.calculateRegularWage(hours, 0);
      if (minutes > 0) {
        this.wage += this.calculateOvertimeWage(0, minutes);
      }
    }
    else {
      this.wage = this.calculateRegularWage(8, 0);
      this.wage += this.calculateOvertimeWage((hours - 8), minutes);
    }
    this.wage += this.calculateEveningWage();


  }

  private calculateEveningWage():number {
    return this.eveningFee.hours * Settings.eveningCompensation + this.eveningFee.minutes * (Settings.eveningCompensation / 60)
  }

  private calculateRegularWage(hours:number, minutes:number):number {
    return hours * Settings.hourlyWage + minutes * (Settings.hourlyWage / 60);
  }

  private calculateOvertimeWage(hours:number, minutes:number):number {
    if (hours < 2 || (hours == 2 && minutes == 0)) {
      return (hours * Settings.hourlyWage + minutes * (Settings.hourlyWage / 60)) * Settings.overtimeCompensation[0];
    }
    else if (hours < 4 || (hours==4 && minutes==0)) {
      return this.calculateOvertimeWage(2, 0) + ((hours - 2) * Settings.hourlyWage + minutes * (Settings.hourlyWage / 60)) * Settings.overtimeCompensation[1];
    }
    return this.calculateOvertimeWage(4, 0) + ((hours - 4) * Settings.hourlyWage + minutes * (Settings.hourlyWage / 60)) * Settings.overtimeCompensation[2];
  }


  private calculateTotalWorkingHours() {
    this.workingShifts.forEach(shift => {
      this.normalFee.add(shift.normalFee);
      this.eveningFee.add(shift.nightFee);
    });
  }

  private calculateDailyHours() {
    this.workingShifts.sort(
      (a, b) => {
        return parseInt(a.start.split(":")[0]) - parseInt(b.start.split(":")[0]);
      });

    this.workingShifts.forEach(shift => {
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
        if (!this.calculateOverNightFee(shift)) {
          shift.normalFee.add(shift.duration);
        }
      }
    });
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
        if (moment(shift.start, "H:mm").isBefore(moment(Settings.eveningCompensationEnds, "H:mm")) &&
          moment(shift.end, "H:mm").isAfter(moment(Settings.eveningCompensationEnds, "H:mm"))
        ) {
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
    if (startHour < nightFeeStartHour && startHour >= nightFeeEndHour) {
      shift.normalFee.add(DurationService.calculateDuration(shift.start, Settings.eveningCompensationStarts));
      nightFeeStart = Settings.eveningCompensationStarts;
    }
    else {
      nightFeeStart = shift.start;
    }
    shift.nightFee.add(DurationService.calculateDuration(nightFeeStart, shift.end));
  }

  private calculateOverNightFee(shift:WorkShift):boolean {
    let startHour = parseInt(shift.start.split(":")[0]);
    let endHour = parseInt(shift.end.split(":")[0]);
    if (startHour > endHour) {
      shift.normalFee.add(DurationService.calculateDuration(shift.start, Settings.eveningCompensationStarts));
      shift.nightFee.add(DurationService.calculateDuration(Settings.eveningCompensationStarts, "24:00"));
      shift.nightFee.add(DurationService.calculateDuration("0:00", Settings.eveningCompensationEnds));
      shift.normalFee.add(DurationService.calculateDuration(Settings.eveningCompensationEnds, shift.end));
      return true;
    }
    return false
  }

  private timeBetween(time:string, start:string, stop:string):boolean {
    return moment(time, "H:mm").isBetween(moment(start, "H:mm"), moment(stop, "H:mm"));
  }


  public toString() {
    this.calculateDailyAmount();
    let minutes = (this.normalFee.minutes + this.eveningFee.minutes) % 60;
    let hours = this.normalFee.hours + this.eveningFee.hours + Math.floor((this.normalFee.minutes + this.eveningFee.minutes) / 60);
    let shifts:string = this.day + " " + hours + ":" + minutes + " normal fee: " + this.normalFee.toString() + " evening fee: " + this.eveningFee.toString() + "\n";
    this.workingShifts.forEach(shift => shifts += "\t" + shift.toString() + "\n");
    return shifts;
  }
}
