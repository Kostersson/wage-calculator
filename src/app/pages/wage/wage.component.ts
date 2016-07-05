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
  private month:number;
  public months = [1,2,3,4,5,6,7,8,9,10,11,12];

  constructor(private readerService:FileReaderService, private ngZone:NgZone) {
    this.persons = new Map<number,Person>();
    this.month = 3;
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
  onChange(month:number) {
    this.month = month;
  }

  public getMonthlyWage(personId:number):string {
    let wage = 0;
    this.persons.get(personId).getWorkdays().forEach((value, key) => {
      if(value.month == this.month){
        wage += value.getDailyWage();
      }
    });
    return wage.toFixed(2);
  }

}
