import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

enum TimerState {
  STOPPED,
  RUNNING,
  PAUSED,
}

const STORAGE_KEY = 'pomodoro:timer';
const TICK_MS = 100;

@Injectable({
  providedIn: 'root'
})
export class TimerService {
  private _state: TimerState = TimerState.STOPPED;
  private remainingSubject = new BehaviorSubject<number>(0);
  private interval: NodeJS.Timeout | null = null;

  public readonly $remaining = this.remainingSubject.asObservable();

  constructor() {
    const localState = this.readRemaining();
    if (localState !== null && localState > 0) {
      this.remainingSubject.next(localState);
      this._state = TimerState.PAUSED;
    }
    this.$remaining.subscribe((remaining) => {
      this.saveRemaining(remaining);
    });
  }

  public start(millis: number): void {
    if (this._state !== TimerState.STOPPED) {
      throw new Error('Timer is already running');
    }

    const endDate = Date.now() + millis;
    this._state = TimerState.RUNNING;
    this.remainingSubject.next(millis);

    this.interval = setInterval(() => {
      const remaining = endDate - Date.now();
      if (remaining <= 0) {
        this.remainingSubject.next(0);
        this.stop();
      } else {
        this.remainingSubject.next(remaining);
      }
    }, TICK_MS);

  }

  public pause(): void {
    if (this._state !== TimerState.RUNNING) {
      throw new Error('Timer is not running');
    }

    clearInterval(this.interval as NodeJS.Timeout);
    this._state = TimerState.PAUSED;
  }

  public resume(): void {
    if (this._state !== TimerState.PAUSED) {
      throw new Error('Timer is not paused');
    }

    this.start(this.remainingSubject.value);
  }

  public stop(): void {
    if (this._state === TimerState.STOPPED) {
      throw new Error('Timer is already stopped');
    }

    clearInterval(this.interval as NodeJS.Timeout);

    this.remainingSubject.next(0);

    this._state = TimerState.STOPPED;
  }

  public get state(): TimerState {
    return this._state;
  }

  private readRemaining(): number | null {
    const state = localStorage.getItem(STORAGE_KEY);

    if (state === null) {
      return null;
    }

    return parseInt(state, 10);
  }

  private saveRemaining(remaining: number): void {
    localStorage.setItem(STORAGE_KEY, remaining.toString(10));
  }
}
