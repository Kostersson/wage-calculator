import {Duration} from "../../services/duration";
export class WorkingHours {
  public normalFee:Duration;
  public nightFee:Duration;

  constructor(){
    this.normalFee = new Duration(0,0);
    this.nightFee = new Duration(0,0);
  }

  public add(workingHours:WorkingHours){
    this.normalFee.add(workingHours.normalFee);
    this.nightFee.add(workingHours.nightFee);
  }
  
  public static createWorkingHours(normal:Duration, night:Duration){
    let workingHours = new WorkingHours();
    workingHours.normalFee = normal;
    workingHours.nightFee = night;
    return workingHours;
  }

}
