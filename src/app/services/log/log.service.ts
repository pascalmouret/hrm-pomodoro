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
  PAUSE_TASK,
  START_WORK_INTERVAL,
  FINISH_WORK_INTERVAL,
  START_BREAK_INTERVAL,
  FINISH_BREAK_INTERVAL,
}

type LogPayloads = {
  [LogType.CREATE_TASK]: Task,
  [LogType.UPDATE_TASK]: { before: Task, after: Task },
  [LogType.REMOVE_TASK]: Task,
  [LogType.START_TASK]: Task,
  [LogType.COMPLETE_TASK]: Task,
  [LogType.PAUSE_TASK]: Task,
  [LogType.MOVE_TASK]: { task: Task, from: number, to: number },
  [LogType.START_WORK_INTERVAL]: undefined,
  [LogType.FINISH_WORK_INTERVAL]: undefined,
  [LogType.START_BREAK_INTERVAL]: undefined,
  [LogType.FINISH_BREAK_INTERVAL]: undefined,
}

interface Log<L extends LogType> {
  timestamp: Date;
  type: L,
  payload: LogPayloads[L],
}

// TODO: levels/colors could be cool
@Injectable({
  providedIn: 'root'
})
export class LogService {
  public readonly logs: Log<any>[] = [];

  constructor() {
    const localState = this.readState();
    if (localState !== null) {
      this.logs = localState;
    }
  }

  public log<L extends LogType>(type: L, payload: LogPayloads[L]): void {
    this.logs.push({ timestamp: new Date(), type, payload: cloneDeep(payload) });
    this.saveState();
  }

  private saveState(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.logs));
  }

  private readState(): Log<any>[] | null {
    const item = localStorage.getItem(STORAGE_KEY);

    if (item === null) {
      return null;
    }

    return JSON.parse(item);
  }
}
