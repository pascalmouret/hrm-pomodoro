import { Injectable } from '@angular/core';
import { LogService, LogType } from '../log/log.service';

export interface Task {
  name: string;
  description: string;
}

const STORAGE_KEY = 'pomodoro:tasks';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private active: Task | null = null;
  public readonly completed: Task[] = []
  public readonly queued: Task[] = [];

  constructor(
    private readonly log: LogService,
  ) {
    const localState = this.readState();
    if (localState !== null) {
      this.active = localState.active;
      this.completed.push(...localState.completed);
      this.queued.push(...localState.queued);
    }
  }

  public addTask(task: Task): void {
    this.queued.push(task);
    this.log.log(LogType.CREATE_TASK, task);
    this.saveState();
  }

  public async startNextTask(): Promise<void> {
    if (this.active !== null) {
      throw new Error('Cannot start a new task while one is active');
    }

    const next = this.queued.shift();

    if (next === undefined) {
      throw new Error('No tasks to start');
    }

    this.active = next;

    this.log.log(LogType.START_TASK, next);

    this.saveState();
  }

  public updateTask(index: number, task: Partial<Task>): void {
    const current = this.queued[index];

    if (current === undefined) {
      throw new Error('Invalid index');
    }

    this.queued[index] = { ...current, ...task };

    this.log.log(LogType.UPDATE_TASK, { before: current, after: this.queued[index] });

    this.saveState();
  }

  public removeTask(index: number): void {
    const current = this.queued[index];

    if (current === undefined) {
      throw new Error('Invalid index');
    }

    this.queued.splice(index, 1);

    this.log.log(LogType.REMOVE_TASK, current);

    this.saveState();
  }

  public completeTask(index: number): void {
    if (this.active === null) {
      throw new Error('No task active');
    }

    this.completed.unshift(this.active);

    this.log.log(LogType.COMPLETE_TASK, this.active);

    this.active = null;

    this.saveState();
  }

  public moveTask(from: number, to: number): void {
    if (from < 0 || from >= this.queued.length) {
      throw new Error('Invalid from index');
    }

    if (to < 0 || to >= this.queued.length) {
      throw new Error('Invalid to index');
    }

    this.queued[to] = this.queued.splice(from, 1, this.queued[to])[0];

    this.log.log(LogType.MOVE_TASK, { task: this.queued[to], from, to });

    this.saveState();
  }

  private saveState(): void {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        active: this.active,
        completed: this.completed,
        queued: this.queued
      }),
    );
  }

  private readState(): { active: Task | null, completed: Task[], queued: Task[] } | null {
    const state = localStorage.getItem(STORAGE_KEY);

    if (state === null) {
      return null;
    }

    return JSON.parse(state);
  }
}
