import {Injectable} from '@angular/core';
import {Duration} from "./duration";

@Injectable()
export class DurationService {
  public static calculateDuration(start:string, end:string):Duration {
    const startArr:string[] = start.split(":");
    const endArr:string[] = end.split(":");
    let hours = parseInt(endArr[0]) - parseInt(startArr[0]);
    if (hours < 0) {
      hours += 24;
    }
    let minutes = parseInt(endArr[1]) - parseInt(startArr[1]);
    if (minutes < 0) {
      minutes += 60;
      hours--
    }
    return new Duration(hours, minutes)
  }
}
