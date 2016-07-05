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
    this.workingShifts.sort(
      (a, b) => {
        return parseInt(a.start.split(":")[0]) - parseInt(b.start.split(":")[0]);
      });
    this.resetDurations();
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


  public toString() {
    this.calculateDailyAmount();
    let minutes = (this.normalFee.minutes + this.eveningFee.minutes) % 60;
    let hours = this.normalFee.hours + this.eveningFee.hours + Math.floor((this.normalFee.minutes + this.eveningFee.minutes) / 60);
    let shifts:string = this.day + " " + hours + ":" + minutes + " normal fee: " + this.normalFee.toString() + " evening fee: " + this.eveningFee.toString() + "\n";
    this.workingShifts.forEach(shift => shifts += "\t" + shift.toString() + "\n");
    return shifts;
  }
}
