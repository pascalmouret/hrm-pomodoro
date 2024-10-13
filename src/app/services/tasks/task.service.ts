import { Injectable } from '@angular/core';
import { isEqual } from 'lodash';
import { LogService, LogType } from '../log/log.service';

export interface Task {
  name: string;
  description: string;
}

type State = {
  active: Task | null;
  completed: Task[];
  queued: Task[];
};

const DEFAULT_STATE: State = {
  active: null,
  completed: [],
  queued: [],
};

const STORAGE_KEY = 'pomodoro:tasks';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private state: State = DEFAULT_STATE;

  constructor(
    private readonly log: LogService,
  ) {
    const localState = this.readState();
    if (localState !== null) {
      this.setState(localState);
    }
  }

  public get active(): Task | null {
    return this.state.active;
  }

  public get completed(): Task[] {
    return this.state.completed;
  }

  public get queued(): Task[] {
    return this.state.queued;
  }

  public addTask(task: Task): void {
    this.log.log(LogType.CREATE_TASK, task);

    this.setState({
      ...this.state,
      queued: [...this.state.queued, task],
    });
  }

  public updateTask(index: number, task: Partial<Task>): void {
    const current = this.state.queued[index];

    if (current === undefined) {
      throw new Error('Invalid index');
    }

    const next = { ...current, ...task };

    if (isEqual(current, next)) {
      return;
    }

    this.log.log(LogType.UPDATE_TASK, { before: current, after: next });

    this.setState({
      ...this.state,
      queued: this.state.queued.map((t, i) => i === index ? next : t),
    })
  }

  public removeTask(index: number): void {
    const current = this.queued[index];

    if (current === undefined) {
      throw new Error('Invalid index');
    }

    this.log.log(LogType.REMOVE_TASK, current);

    this.setState({
      ...this.state,
      queued: this.state.queued.filter((_, i) => i !== index),
    });
  }

  public completeTask(): void {
    if (this.state.active === null) {
      throw new Error('No task active');
    }

    this.log.log(LogType.COMPLETE_TASK, this.state.active);

    this.setState({
      active: null,
      completed: [this.state.active, ...this.state.completed],
      queued: this.state.queued,
    });

    if (this.state.queued.length > 0) {
      this.startNextTask(); // will save state
    } else {
      this.saveState();
    }
  }

  public moveTask(from: number, to: number): void {
    if (from < 0 || from >= this.state.queued.length) {
      throw new Error('Invalid from index');
    }

    if (to < 0 || to >= this.state.queued.length) {
      throw new Error('Invalid to index');
    }

    const newQueued = [...this.state.queued];
    const element = newQueued[from];
    newQueued.splice(from, 1);
    newQueued.splice(to, 0, element);

    this.log.log(LogType.MOVE_TASK, { task: this.state.queued[from], from, to });

    this.setState({
      ...this.state,
      queued: newQueued,
    });
  }

  public startNextTask(): void {
    if (this.state.active !== null) {
      throw new Error('Cannot start a new task while one is active');
    }

    const next = this.state.queued[0];

    if (next === undefined) {
      throw new Error('No tasks to start');
    }

    this.log.log(LogType.START_TASK, next);

    this.setState({
      ...this.state,
      active: next,
      queued: this.state.queued.slice(1),
    });
  }

  private setState(state: State): void {
    this.state = state;
    this.saveState();
  }

  private saveState(): void {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(this.state),
    );
  }

  private readState(): { active: Task | null, completed: Task[], queued: Task[] } | null {
    const state = localStorage.getItem(STORAGE_KEY);

    if (state === null) {
      return null;
    }

    return JSON.parse(state);
  }

  public reset(): void {
    this.setState(DEFAULT_STATE);
  }
}
