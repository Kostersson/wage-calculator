import {WorkDay} from "./workday";
export class Person {
  private workdays:Map<string,WorkDay>;

  constructor(public id:number,
              public name:string) {
    this.workdays = new Map<string,WorkDay>();
  }

  public getWorkdays():Iterator<any> {
    return this.workdays.values();
  }

  public addWorkday(day:WorkDay):void {
    if (!this.workdays.has(day.day)) {
      this.workdays.set(day.day, day);
    }
    else{
      this.workdays.get(day.day).addWorkingShifts(day.getWorkingShifts())
    }
  }

  public toString():string{
    let workdays: string = "";
    this.workdays.forEach(workday => workdays+= workday.toString());
    return this.id + ":" + this.name + "\n" + workdays + "\n"
  }
}
