
import {MapToIterable} from "./map-to-iterable-pipe";
describe('MapToIterable', () => {
  let pipe: MapToIterable;
  beforeEach(() => {
    pipe = new MapToIterable();
  });
  it('transforms map to array', () => {
    let map = new Map<number, string>();
    map.set(1, "a");
    map.set(2, "b");
    expect(pipe.transform(map)).toEqual([{ key: 1, value: "a" }, { key: 2, value: "b" }]);
  });

});
