import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';

import { Task } from '../tasks/task.service';

const STORAGE_KEY = 'pomodoro:logs';

export enum LogType {
  CREATE_TASK,
  UPDATE_TASK,
  REMOVE_TASK,
  MOVE_TASK,
  START_TASK,
  COMPLETE_TASK,
  START_WORK_INTERVAL,
  FINISH_WORK_INTERVAL,
  START_BREAK_INTERVAL,
  FINISH_BREAK_INTERVAL,
  STOP_WORK,
  STOP_BREAK,
  CHANGE_WORK_DURATION,
  CHANGE_BREAK_DURATION,
}

type LogPayloads = {
  [LogType.CREATE_TASK]: Task,
  [LogType.UPDATE_TASK]: { before: Task, after: Task },
  [LogType.REMOVE_TASK]: Task,
  [LogType.START_TASK]: Task,
  [LogType.COMPLETE_TASK]: Task,
  [LogType.MOVE_TASK]: { task: Task, from: number, to: number },
  [LogType.START_WORK_INTERVAL]: undefined,
  [LogType.FINISH_WORK_INTERVAL]: undefined,
  [LogType.START_BREAK_INTERVAL]: undefined,
  [LogType.FINISH_BREAK_INTERVAL]: undefined,
  [LogType.STOP_WORK]: undefined,
  [LogType.STOP_BREAK]: undefined,
  [LogType.CHANGE_WORK_DURATION]: { before: number, after: number },
  [LogType.CHANGE_BREAK_DURATION]: { before: number, after: number },
}

export interface LogEntry<L extends LogType> {
  timestamp: Date;
  type: L,
  payload: LogPayloads[L],
}

@Injectable({
  providedIn: 'root'
})
export class LogService {
  private _logs: LogEntry<any>[] = [];

  constructor() {
    const localState = this.readState();
    if (localState !== null) {
      this.setState(localState);
    }
  }

  public get logs(): LogEntry<any>[] {
    return this._logs;
  }

  private setState(logs: LogEntry<any>[]): void {
    this._logs = logs;
    this.saveState();
  }

  public log<L extends LogType>(type: L, payload: LogPayloads[L], timestamp?: Date): void {
    this.setState([{ timestamp: timestamp || new Date(), type, payload: cloneDeep(payload) }, ...this._logs])
  }

  private saveState(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.logs));
  }

  private readState(): LogEntry<any>[] | null {
    const item = localStorage.getItem(STORAGE_KEY);

    if (item === null) {
      return null;
    }

    return JSON.parse(item);
  }

  public reset(): void {
    this.setState([]);
  }
}
