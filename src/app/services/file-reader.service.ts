import {Injectable} from '@angular/core';
import {Http, Response} from '@angular/http';
import {Person} from '../pages/wage/person';
import {Workday} from '../pages/wage/workday';
import {WorkShift} from '../pages/wage/work-shift';
import {Settings} from '../resources/settings';
import {Observable} from "rxjs/Rx";
import 'rxjs/add/operator/do'
import 'rxjs/Rx';

@Injectable()
export class FileReaderService {
  private persons:Map<number, Person>;

  constructor(private http:Http) {
    this.persons = new Map<number, Person>();
  }

  /**
   * Reads hour list url, and deletes first row
   * @returns {Observable<Response>}
   */
  public read():Observable<Response> {
    return this.http.get(Settings.hourListUrl).do(
      (result) => {
        let array = result.text().split('\n');
        array.reverse().pop();
        array.forEach((line) => this.parseLine(line));
      }
    );
  }

  /**
   *
   * @returns {Map<number, Person>}
   */
  public getPersons():Map<number,Person>{
    return this.persons;
  }

  /**
   * Creates new persons, workdays and work shifts
   * from CSV
   * @param {string} line
     */
  private parseLine(line:string) {
    let lineArr = line.split(',');
    if (lineArr.length < 5) {
      return;
    }

    const personId = parseInt(lineArr[1]);
    if (!this.persons.has(personId)) {
      this.persons.set(personId, new Person(personId, lineArr[0]));
    }
    const workday = new Workday(lineArr[2]);
    const workingShift = new WorkShift(lineArr[3], lineArr[4]);
    workday.addWorkShifts([workingShift]);
    this.persons.get(personId).addWorkday(workday);
  }
}
