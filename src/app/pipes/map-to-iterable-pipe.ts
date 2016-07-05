import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'mapToIterable'})
export class MapToIterable {
  transform(value) {
    let result = [];

    for (var [key, value] of value.entries()) {
      result.push({key, value});
    }


    return result;
  }
}
