import {WorkShift} from "./work-shift";
import {Duration} from "../../services/duration";
import {Settings} from "../../resources/settings";

export class Workday {
  private workShift:WorkShift[];

  private normalHours:Duration;
  private eveningHours:Duration;
  private wage:number;
  public month:number;

  constructor(public day:string) {
    this.workShift = [];
    this.month = parseInt(this.day.split('.')[1]);
    this.resetDurations();
  }

  public getWorkingShifts():WorkShift[] {
    return this.workShift;
  }

  public getNormalHours():Duration {
    return this.normalHours;
  }

  public getEveningHours():Duration {
    return this.eveningHours;
  }

  public getDailyWage():number {
    return this.wage;
  }

  public addWorkShifts(workingShifts:WorkShift[]):void {
    this.workShift = this.workShift.concat(workingShifts);
    this.calculateDailyAmount();
  }

  private resetDurations() {
    this.normalHours = new Duration(0, 0);
    this.eveningHours = new Duration(0, 0);
  }

  /**
   * Calculates work days wage from work shifts
   */
  private calculateDailyAmount() {
    this.workShift.sort(
      (a, b) => {
        return parseInt(a.start.split(":")[0]) - parseInt(b.start.split(":")[0]);
      });
    this.resetDurations();
    this.calculateTotalWorkingHours();

    let minutes = (this.normalHours.minutes + this.eveningHours.minutes) % 60;
    let hours = this.normalHours.hours + this.eveningHours.hours + Math.floor((this.normalHours.minutes + this.eveningHours.minutes) / 60);

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

  /**
   * Calculates evening wage
   * @returns {number}
   */
  private calculateEveningWage():number {
    return this.eveningHours.hours * Settings.eveningCompensation + this.eveningHours.minutes * (Settings.eveningCompensation / 60)
  }

  /**
   * Calculates regular wage
   * @param {number} hours
   * @param {number} minutes
   * @returns {number}
     */
  private calculateRegularWage(hours:number, minutes:number):number {
    return hours * Settings.hourlyWage + minutes * (Settings.hourlyWage / 60);
  }

  /**
   * Calculates over time wage
   * @param {number} hours
   * @param {number} minutes
   * @returns {number}
     */
  private calculateOvertimeWage(hours:number, minutes:number):number {
    if (hours < 2 || (hours == 2 && minutes == 0)) {
      return (hours * Settings.hourlyWage + minutes * (Settings.hourlyWage / 60)) * Settings.overtimeCompensation[0];
    }
    else if (hours < 4 || (hours == 4 && minutes == 0)) {
      return this.calculateOvertimeWage(2, 0) + ((hours - 2) * Settings.hourlyWage + minutes * (Settings.hourlyWage / 60)) * Settings.overtimeCompensation[1];
    }
    return this.calculateOvertimeWage(4, 0) + ((hours - 4) * Settings.hourlyWage + minutes * (Settings.hourlyWage / 60)) * Settings.overtimeCompensation[2];
  }

  /**
   * Calculates total working hours
   */
  private calculateTotalWorkingHours() {
    this.workShift.forEach(shift => {
      this.normalHours.add(shift.normalHours);
      this.eveningHours.add(shift.eveningHours);
    });
  }


  public toString() {
    this.calculateDailyAmount();
    let minutes = (this.normalHours.minutes + this.eveningHours.minutes) % 60;
    let hours = this.normalHours.hours + this.eveningHours.hours + Math.floor((this.normalHours.minutes + this.eveningHours.minutes) / 60);
    let shifts:string = this.day + " " + hours + ":" + minutes + " normal fee: " + this.normalHours.toString() + " evening fee: " + this.eveningHours.toString() + "\n";
    this.workShift.forEach(shift => shifts += "\t" + shift.toString() + "\n");
    return shifts;
  }
}
