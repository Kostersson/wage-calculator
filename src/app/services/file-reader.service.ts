import {Injectable} from '@angular/core';
import {Http} from "@angular/http";
import {Person} from "../pages/wage/person";
import {WorkDay} from "../pages/wage/workday";
import {WorkShift} from "../pages/wage/work-shift";
import {Settings} from "../resources/settings";

@Injectable()
export class FileReaderService {
  private persons:Map<number, Person>;
  constructor(private http:Http){
    this.persons = new Map<number, Person>();
  }

  public read(){
    this.http.get(Settings.hourListUrl).subscribe(
      (result) => {
        let array = result.text().split("\n");
        array.reverse().pop();
        array.forEach((line) => this.parseLine(line));
        this.persons.forEach(person => console.log(person.toString()));
      }
    );
  }

  private parseLine(line:string){
    let lineArr = line.split(",");
    if(lineArr.length < 5){
      return;
    }

    const personId = parseInt(lineArr[1]);
    if(!this.persons.has(personId)){
      this.persons.set(personId, new Person(personId, lineArr[0]));
    }
    const workday = new WorkDay(lineArr[2]);
    const workingShift = new WorkShift(lineArr[3], lineArr[4]);
    workday.addWorkingShifts([workingShift]);
    this.persons.get(personId).addWorkday(workday);
  }
}
