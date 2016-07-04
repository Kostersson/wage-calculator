import {Component} from '@angular/core';
import {FileReaderService} from '../../services/file-reader.service';
import {Person} from "./person";
import {MapToIterable} from "../../pipes/map-to-iterable";

@Component({
  selector: 'wage',
  pipes: [MapToIterable],
  providers: [FileReaderService],
  directives: [],
  templateUrl: './wage.html'
})
export class WagePage {

  private persons:Map<number, Person>;

  constructor(private readerService:FileReaderService) {

    this.readerService.read().subscribe(
      () => {
        console.log("foo")
      },
      (err) => {
        console.log("asdasd");
        console.error(err)
      },
      () => {
        console.log("done");
        //this.persons = this.readerService.getPersons();
      }
    );

  }

  public getMonthlyWage(personId:number) {
    let wage = 0;
    this.persons.get(personId).getWorkdays().forEach((value, key) => {
      value.calculateDailyAmount();
      wage += value.getDailyWage();
    })
  }

}
