import {Pipe, PipeTransform} from '@angular/core';

@Pipe({ name: 'mapToIterable' })
export class MapToIterable {
  transform(value) {
    let result = [];

    if(value.entries) {
      for (var [key, value] of value.entries()) {
        result.push({ key, value });
      }
    } else {
      for(let key in value) {
        result.push({ key, value: value[key] });
      }
    }
    return result;
  }
}
