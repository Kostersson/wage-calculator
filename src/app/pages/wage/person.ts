import {Workday} from './workday';
export class Person {
  private workdays:Map<string,Workday>;

  constructor(public id:number,
              public name:string) {
    this.workdays = new Map<string,Workday>();
  }

  public getWorkdays():Map<string, Workday> {
    return this.workdays;
  }

  /**
   * Adds new workday to persons workdays map
   * @param {Workday} day
   */
  public addWorkday(day:Workday):void {
    if (!this.workdays.has(day.day)) {
      this.workdays.set(day.day, day);
    }
    else{
      this.workdays.get(day.day).addWorkShifts(day.getWorkingShifts())
    }
  }

  public toString():string{
    let workdays: string = "";
    this.workdays.forEach(workday => workdays+= workday.toString());
    return this.id + ":" + this.name + "\n" + workdays + "\n"
  }
}
