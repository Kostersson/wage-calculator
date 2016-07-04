import {
  beforeEachProviders,
  describe,
  inject,
  it
} from '@angular/core/testing';
import { Component } from '@angular/core';
import { BaseRequestOptions, Http } from '@angular/http';
import { MockBackend } from '@angular/http/testing';

// Load the implementations that should be tested
import { Wage } from './wage.component';
import { Person } from './person';
import { WorkShift } from './work-shift';
import { WorkDay } from './workday';

describe('Wage', () => {
  // provide our implementations or mocks to the dependency injector
  beforeEachProviders(() => [
    BaseRequestOptions,
    MockBackend,
    {
      provide: Http,
      useFactory: function(backend, defaultOptions) {
        return new Http(backend, defaultOptions);
      },
      deps: [MockBackend, BaseRequestOptions]
    },

    Wage,
    Person,
    WorkShift,
    WorkDay
  ]);

  it('Simple two hour shift', () => {
    let shift = new WorkShift("10:00", "12:00");
    expect(shift.duration.hours).toBe(2);
    expect(shift.duration.minutes).toBe(0);
    expect(shift.toString()).toEqual('2:0 (10:00 - 12:00)');
  });

  it('Shift that last over midnight', () => {
    let shift = new WorkShift("22:00", "2:00");
    expect(shift.toString()).toEqual('4:0 (22:00 - 2:00)');
  });

  it('Create person', () => {
    let person = new Person(1, "Jaska Jokunen");
    expect(person.toString()).toEqual('1:Jaska Jokunen\n\n');
  });

  it('Create empty work day', () => {
    let workDay = new WorkDay("04.2.2016");
    expect(workDay.toString()).toEqual('04.2.2016 0:0 normal fee: 0:0 evening fee: 0:0\n');
  });

});
