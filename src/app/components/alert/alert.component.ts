import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { Button } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TaskService } from '../../services/tasks/task.service';

export enum AlertType {
  WORK_FINISHED,
  BREAK_FINISHED,
}

@Component({
  selector: 'pomodoro-alert',
  standalone: true,
  templateUrl: './alert.component.html',
  imports: [
    NgIf,
    Button
  ]
})
export default class AlertComponent {
  protected readonly AlertType = AlertType;

  constructor(
    public readonly config: DynamicDialogConfig,
    public readonly ref: DynamicDialogRef,
    public readonly tasks: TaskService,
  ) {
    if (this.config.data.type === AlertType.WORK_FINISHED) {
      this.config.header = 'Work Interval Finished';
    } else {
      this.config.header = 'Break Finished';
    }
  }

  public completeCurrent(): void {
    this.tasks.completeTask();
    this.ref.close();
  }
}
