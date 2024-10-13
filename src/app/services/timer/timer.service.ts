import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LogService, LogType } from '../log/log.service';

export enum TimerState {
  STOPPED,
  RUNNING_BREAK,
  RUNNING_WORK,
}

const DEFAULT_WORK_DURATION = 25 * 60 * 1000;
const DEFAULT_BREAK_DURATION = 5 * 60 * 1000;

const STORAGE_KEY = 'pomodoro:timer';
const STORAGE_KEY_REMAINING = 'pomodoro:timer:remaining';

const TICK_MS = 100;

@Injectable({
  providedIn: 'root'
})
export class TimerService {
  private interval: number | null = null;

  private _workDuration: number = DEFAULT_WORK_DURATION;
  private _breakDuration: number = DEFAULT_BREAK_DURATION;
  private lastStart: number | null = null;

  private stateSubject = new BehaviorSubject<TimerState>(TimerState.STOPPED);
  private remainingMillisSubject = new BehaviorSubject<number>(0);

  public readonly $remainingMillis = this.remainingMillisSubject.asObservable();
  public readonly $state = this.stateSubject.asObservable();

  constructor(private readonly log: LogService) {
    const localState = this.readState();
    if (localState !== null) {
      this._workDuration = localState.workDuration;
      this._breakDuration = localState.breakDuration;

      if (localState.state !== TimerState.STOPPED) {
        const type = localState.state === TimerState.RUNNING_WORK
          ? LogType.STOP_WORK
          : LogType.STOP_BREAK;

        // TODO: this does not seem correct
        this.log.log(type, undefined, new Date(localState.lastStart + (this.readRemaining() || 0)));
      }

      this.remainingMillisSubject.next(this._workDuration);
    }

    this.$remainingMillis.subscribe((remaining) => {
      this.saveRemaining(remaining);
    });

    const localRemaining = this.readRemaining();
    if (localRemaining !== null) {
      this.remainingMillisSubject.next(localRemaining);
    }
  }

  public get state(): TimerState {
    return this.stateSubject.value;
  }

  public get workDuration(): number {
    return this._workDuration;
  }

  public get breakDuration(): number {
    return this._breakDuration;
  }

  public setWorkDuration(millis: number): void {
    if (this.stateSubject.value !== TimerState.STOPPED) {
      throw new Error('Cannot change duration while timer is running');
    }

    this._workDuration = millis;
    this.remainingMillisSubject.next(this._workDuration);

    this.saveState();
  }

  public setBreakDuration(millis: number): void {
    if (this.stateSubject.value !== TimerState.STOPPED) {
      throw new Error('Cannot change duration while timer is running');
    }

    this._breakDuration = millis;
    this.saveState();
  }

  public start(): void {
    if (this.stateSubject.value !== TimerState.STOPPED) {
      throw new Error('Timer is already running');
    }

    this.startInterval('work');
  }

  private startInterval(type: 'break' | 'work'): void {
    const millis = type === 'work' ? this._workDuration : this._breakDuration;

    this.lastStart = Date.now();
    const endDate = this.lastStart + millis;

    if (type === 'work') {
      this.stateSubject.next(TimerState.RUNNING_WORK);
      this.log.log(LogType.START_WORK_INTERVAL, undefined);
    } else {
      this.stateSubject.next(TimerState.RUNNING_BREAK);
      this.log.log(LogType.START_BREAK_INTERVAL, undefined);
    }

    this.interval = setInterval(() => {
      const remaining = endDate - Date.now();
      if (remaining <= 0) {
        clearInterval(this.interval!);
        this.remainingMillisSubject.next(0);
        if (this.stateSubject.value === TimerState.RUNNING_WORK) {
          this.log.log(LogType.FINISH_WORK_INTERVAL, undefined);
          this.startInterval('break');
        } else {
          this.log.log(LogType.FINISH_BREAK_INTERVAL, undefined);
          this.startInterval('work');
        }
      } else {
        this.remainingMillisSubject.next(remaining);
      }
    }, TICK_MS);

    this.saveState();
  }

  public stop(): void {
    if (this.stateSubject.value === TimerState.STOPPED) {
      throw new Error('Timer is already stopped');
    }

    if (this.interval !== null) {
      clearInterval(this.interval);
    }

    if (this.stateSubject.value === TimerState.RUNNING_WORK) {
      this.log.log(LogType.STOP_WORK, undefined);
    } else {
      this.log.log(LogType.STOP_BREAK, undefined);
    }

    this.remainingMillisSubject.next(this._workDuration);
    this.stateSubject.next(TimerState.STOPPED);

    this.saveState();
  }

  private readRemaining(): number | null {
    const state = localStorage.getItem(STORAGE_KEY_REMAINING);

    if (state === null) {
      return null;
    }

    return parseInt(state, 10);
  }

  private saveRemaining(remaining: number): void {
    localStorage.setItem(STORAGE_KEY_REMAINING, remaining.toString(10));
  }

  private readState(): { workDuration: number; breakDuration: number; state: TimerState; lastStart: number } | null {
    const state = localStorage.getItem(STORAGE_KEY);

    if (state === null) {
      return null;
    }

    return JSON.parse(state);
  }

  private saveState(): void {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        workDuration: this._workDuration,
        breakDuration: this._breakDuration,
        state: this.stateSubject.value,
        lastStart: this.lastStart,
      })
    );
  }

  public reset(): void {
    if (this.interval !== null) {
      clearInterval(this.interval);
    }

    localStorage.removeItem(STORAGE_KEY_REMAINING);

    this._workDuration = DEFAULT_WORK_DURATION;
    this._breakDuration = DEFAULT_BREAK_DURATION;

    this.stateSubject.next(TimerState.STOPPED);
    this.remainingMillisSubject.next(this._workDuration);

    this.lastStart = null;

    this.saveState();
  }
}
