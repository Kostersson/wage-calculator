import {Component, NgZone} from '@angular/core';
import {FileReaderService} from '../../services/file-reader.service';
import {Person} from "./person";
import {MapToIterable} from "../../pipes/map-to-iterable-pipe";

@Component({
  selector: 'wage',
  pipes: [MapToIterable],
  providers: [FileReaderService],
  directives: [],
  templateUrl: './wage.html'
})
export class WagePage {

  private persons:Map<number, Person>;

  constructor(private readerService:FileReaderService, private ngZone:NgZone) {
    this.persons = new Map<number,Person>();
    this.readerService.read().subscribe(
      () => {
      },
      (err) => {
        console.error(err)
      },
      () => {
        this.persons = this.readerService.getPersons();
        this.ngZone.run(()=>{console.log(this.persons)});
      }
    );

  }

  public getMonthlyWage(personId:number):string {
    let wage = 0;
    this.persons.get(personId).getWorkdays().forEach((value, key) => {
      wage += value.getDailyWage();
    });
    return wage.toFixed(2);
  }

}
