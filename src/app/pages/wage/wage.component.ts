import {Component} from '@angular/core';
import {FileReaderService} from '../../services/file-reader.service';

@Component({
  selector: 'wage',
  pipes: [],
  providers: [FileReaderService],
  directives: [],
  templateUrl: './wage.html'
})
export class WagePage {

  constructor(private readerService:FileReaderService) {
    this.readerService.read();
  }

  ngOnInit() {

  }

}
