import {
  beforeEachProviders,
  describe,
  inject,
  it
} from '@angular/core/testing';
import {BaseRequestOptions, Http} from '@angular/http';
import {MockBackend} from '@angular/http/testing';

// Load the implementations that should be tested
import {WagePage} from './wage.component';
import {Person} from './person';
import {WorkShift} from './work-shift';
import {Workday} from './workday';
import {Duration} from "../../services/duration";
import {Settings} from "../../resources/settings";

describe('Wage', () => {
  // provide our implementations or mocks to the dependency injector
  beforeEachProviders(() => [
    BaseRequestOptions,
    MockBackend,
    {
      provide: Http,
      useFactory: function (backend, defaultOptions) {
        return new Http(backend, defaultOptions);
      },
      deps: [MockBackend, BaseRequestOptions]
    },

    WagePage,
    Person,
    WorkShift,
    Workday
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

  it('Create empty workday', () => {
    let workday = new Workday("04.2.2016");
    expect(workday.toString()).toEqual('04.2.2016 0:0 normal fee: 0:0 evening fee: 0:0\n');
  });

  it('Workday with normal hours (calculate shifts)', () => {
    let workday = new Workday("04.2.2016");
    let workingShifts = [new WorkShift("8:00", "10:00"), new WorkShift("11:00", "12:00"), new WorkShift("13:00", "14:45")];
    workday.addWorkingShifts(workingShifts);
    expect(workday.getWorkingShifts()[0].normalFee.hours).toEqual(2);
    expect(workday.getWorkingShifts()[0].normalFee.minutes).toEqual(0);
    expect(workday.getWorkingShifts()[0].nightFee.hours).toEqual(0);
    expect(workday.getWorkingShifts()[0].nightFee.minutes).toEqual(0);
    expect(workday.getWorkingShifts()[0].duration.hours).toEqual(2);
    expect(workday.getWorkingShifts()[0].duration.minutes).toEqual(0);

    expect(workday.getWorkingShifts()[1].normalFee.hours).toEqual(1);
    expect(workday.getWorkingShifts()[1].normalFee.minutes).toEqual(0);
    expect(workday.getWorkingShifts()[1].nightFee.hours).toEqual(0);
    expect(workday.getWorkingShifts()[1].nightFee.minutes).toEqual(0);
    expect(workday.getWorkingShifts()[1].duration.hours).toEqual(1);
    expect(workday.getWorkingShifts()[1].duration.minutes).toEqual(0);

    expect(workday.getWorkingShifts()[2].normalFee.hours).toEqual(1);
    expect(workday.getWorkingShifts()[2].normalFee.minutes).toEqual(45);
    expect(workday.getWorkingShifts()[2].nightFee.hours).toEqual(0);
    expect(workday.getWorkingShifts()[2].nightFee.minutes).toEqual(0);
    expect(workday.getWorkingShifts()[2].duration.hours).toEqual(1);
    expect(workday.getWorkingShifts()[2].duration.minutes).toEqual(45);
  });

  it('Workday with evening work (calculate shifts)', () => {
    let workday = new Workday("04.2.2016");
    let workingShifts = [new WorkShift("18:00", "20:00")];
    workday.addWorkingShifts(workingShifts);
    expect(workday.getWorkingShifts()[0].normalFee.hours).toEqual(0);
    expect(workday.getWorkingShifts()[0].normalFee.minutes).toEqual(0);
    expect(workday.getWorkingShifts()[0].nightFee.hours).toEqual(2);
    expect(workday.getWorkingShifts()[0].nightFee.minutes).toEqual(0);
    expect(workday.getWorkingShifts()[0].duration.hours).toEqual(2);
    expect(workday.getWorkingShifts()[0].duration.minutes).toEqual(0);

  });

  it('Workday with early morning shift (calculate shifts)', () => {
    let workday = new Workday("04.2.2016");
    let workingShifts = [new WorkShift("4:00", "5:00")];
    workday.addWorkingShifts(workingShifts);
    expect(workday.getWorkingShifts()[0].normalFee.hours).toEqual(0);
    expect(workday.getWorkingShifts()[0].normalFee.minutes).toEqual(0);
    expect(workday.getWorkingShifts()[0].nightFee.hours).toEqual(1);
    expect(workday.getWorkingShifts()[0].nightFee.minutes).toEqual(0);
    expect(workday.getWorkingShifts()[0].duration.hours).toEqual(1);
    expect(workday.getWorkingShifts()[0].duration.minutes).toEqual(0);
  });

  it('Workday with morning shift (calculate shifts)', () => {
    let workday = new Workday("04.2.2016");
    let workingShifts = [new WorkShift("5:00", "10:00")];
    workday.addWorkingShifts(workingShifts);
    expect(workday.getWorkingShifts()[0].normalFee.hours).toEqual(4);
    expect(workday.getWorkingShifts()[0].normalFee.minutes).toEqual(0);
    expect(workday.getWorkingShifts()[0].nightFee.hours).toEqual(1);
    expect(workday.getWorkingShifts()[0].nightFee.minutes).toEqual(0);
    expect(workday.getWorkingShifts()[0].duration.hours).toEqual(5);
    expect(workday.getWorkingShifts()[0].duration.minutes).toEqual(0);
  });

  it('Workday with normal work and evening work (calculate shifts)', () => {
    let workday = new Workday("04.2.2016");
    let workingShifts = [new WorkShift("16:00", "21:00")];
    workday.addWorkingShifts(workingShifts);
    expect(workday.getWorkingShifts()[0].normalFee.hours).toEqual(2);
    expect(workday.getWorkingShifts()[0].normalFee.minutes).toEqual(0);
    expect(workday.getWorkingShifts()[0].nightFee.hours).toEqual(3);
    expect(workday.getWorkingShifts()[0].nightFee.minutes).toEqual(0);
    expect(workday.getWorkingShifts()[0].duration.hours).toEqual(5);
    expect(workday.getWorkingShifts()[0].duration.minutes).toEqual(0);
  });

  it('Workday with normal work, evening work and night work (calculate shifts)', () => {
    let workday = new Workday("04.2.2016");
    let workingShifts = [new WorkShift("16:00", "2:00")];
    workday.addWorkingShifts(workingShifts);
    expect(workday.getWorkingShifts()[0].normalFee.hours).toEqual(2);
    expect(workday.getWorkingShifts()[0].normalFee.minutes).toEqual(0);
    expect(workday.getWorkingShifts()[0].nightFee.hours).toEqual(8);
    expect(workday.getWorkingShifts()[0].nightFee.minutes).toEqual(0);
    expect(workday.getWorkingShifts()[0].duration.hours).toEqual(10);
    expect(workday.getWorkingShifts()[0].duration.minutes).toEqual(0);
  });

  it('Workday with shift that least over night (calculate shifts)', () => {
    let workday = new Workday("04.2.2016");
    let workingShifts = [new WorkShift("15:00", "8:00")];
    workday.addWorkingShifts(workingShifts);
    expect(workday.getWorkingShifts()[0].normalFee.hours).toEqual(5);
    expect(workday.getWorkingShifts()[0].normalFee.minutes).toEqual(0);
    expect(workday.getWorkingShifts()[0].nightFee.hours).toEqual(12);
    expect(workday.getWorkingShifts()[0].nightFee.minutes).toEqual(0);
    expect(workday.getWorkingShifts()[0].duration.hours).toEqual(17);
    expect(workday.getWorkingShifts()[0].duration.minutes).toEqual(0);
  });

  it('Workday hours', () => {
    let workday = new Workday("04.2.2016");
    let workingShifts = [new WorkShift("8:00", "10:00"), new WorkShift("11:00", "12:00"), new WorkShift("13:00", "14:45"), new WorkShift("22:00", "4:45")];
    expect(workingShifts[0].duration).toEqual(new Duration(2, 0));
    expect(workingShifts[1].duration).toEqual(new Duration(1, 0));
    expect(workingShifts[2].duration).toEqual(new Duration(1, 45));
    expect(workingShifts[3].duration).toEqual(new Duration(6, 45));
    workday.addWorkingShifts(workingShifts);

    expect(workday.getNormalFee()).toEqual(new Duration(4, 45));
    expect(workday.getEveningFee()).toEqual(new Duration(6, 45));

  });


  it('Workday wage with one shift (2 hours)', () => {
    let workday = new Workday("04.2.2016");
    let workingShifts = [new WorkShift("8:00", "10:00")];
    workday.addWorkingShifts(workingShifts);
    expect(workday.getDailyWage()).toEqual(2 * Settings.hourlyWage);

  });

  it('Workday wage with overtime compensation (10 hours)', () => {
    let workday = new Workday("04.2.2016");
    let workingShifts = [new WorkShift("6:00", "16:00")];
    workday.addWorkingShifts(workingShifts);
    expect(workday.getNormalFee()).toEqual(new Duration(10, 0));
    expect(workday.getDailyWage()).toEqual(8 * Settings.hourlyWage + (2 * Settings.hourlyWage) * Settings.overtimeCompensation[0]);
  });


  it('Workday wage with overtime compensation (12 hours)', () => {
    let workday = new Workday("04.2.2016");
    let workingShifts = [new WorkShift("6:00", "18:00")];
    workday.addWorkingShifts(workingShifts);
    expect(workday.getNormalFee()).toEqual(new Duration(12, 0));
    expect(workday.getDailyWage()).toEqual(8 * Settings.hourlyWage + (2 * Settings.hourlyWage) * Settings.overtimeCompensation[0] +
      (2 * Settings.hourlyWage) * Settings.overtimeCompensation[1]);
  });

  it('Workday wage with evening compensation (2 hours)', () => {
    let workday = new Workday("04.2.2016");
    let workingShifts = [new WorkShift("18:00", "20:00")];
    workday.addWorkingShifts(workingShifts);
    expect(workday.getDailyWage()).toEqual(2 * Settings.hourlyWage + 2 * Settings.eveningCompensation);
  });

  it('Workday wage with evening compensation and overtime compensation (16 hours)', () => {
    let workday = new Workday("04.2.2016");
    let workingShifts = [new WorkShift("6:00", "22:00")];
    workday.addWorkingShifts(workingShifts);
    expect(workday.getNormalFee()).toEqual(new Duration(12, 0));
    expect(workday.getEveningFee()).toEqual(new Duration(4, 0));
    let dailyWage = 8 * Settings.hourlyWage +
      (2 * Settings.hourlyWage) * Settings.overtimeCompensation[0] +
      (2 * Settings.hourlyWage) * Settings.overtimeCompensation[1] +
      (4 * Settings.hourlyWage) * Settings.overtimeCompensation[2] +
      (4 * Settings.eveningCompensation);
    expect(workday.getDailyWage()).toEqual(dailyWage);
  });

  it('Workday 5:30-18:30 (13 hours)', () => {
    let workday = new Workday("04.2.2016");
    let workingShifts = [new WorkShift("5:30", "18:30")];
    workday.addWorkingShifts(workingShifts);
    expect(workday.getNormalFee()).toEqual(new Duration(12, 0));
    expect(workday.getEveningFee()).toEqual(new Duration(1, 0));
    let dailyWage = 8 * Settings.hourlyWage +
      (2 * Settings.hourlyWage) * Settings.overtimeCompensation[0] +
      (2 * Settings.hourlyWage) * Settings.overtimeCompensation[1] +
      Settings.hourlyWage * Settings.overtimeCompensation[2] +
      Settings.eveningCompensation;
    expect(workday.getDailyWage()).toEqual(dailyWage);
  });

  it('Create person with workday', () => {
    let person = new Person(1, "Jaska Jokunen");
    let workday = new Workday("04.2.2016");
    person.addWorkday(workday);
    expect(person.getWorkdays().get("04.2.2016")).toEqual(workday);
  });

  it('Merge workdays', () => {
    let person = new Person(1, "Jaska Jokunen");
    let workday = new Workday("04.2.2016");
    let workday2 = new Workday("04.2.2016");
    workday.addWorkingShifts([new WorkShift("8:00", "10:00")]);
    workday2.addWorkingShifts([new WorkShift("12:00", "14:00")]);
    person.addWorkday(workday);
    person.addWorkday(workday2);
    expect(person.getWorkdays().get("04.2.2016").getNormalFee()).toEqual(new Duration(4, 0));
  });


});
