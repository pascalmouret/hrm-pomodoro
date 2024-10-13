import { NgIf } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';

import { Task, TaskService } from '../../../services/tasks/task.service';

@Component({
  selector: 'pomodoro-task-edit',
  standalone: true,
  templateUrl: './task-edit.component.html',
  imports: [
    FormsModule,
    InputTextModule,
    Button,
    NgIf
  ]
})
export default class TaskEditComponent implements OnInit {
  constructor(
    public tasks: TaskService,
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
  ) {}

  public name: string = '';
  public description: string = '';

  public ngOnInit() {
    console.log('TASKID', this.config.data.taskId);
    if (this.task !== null) {
      this.name = this.task.name;
      this.description = this.task.description;
    }
  }

  public get task(): Task | null {
    if (this.config.data.taskId === null) {
      return null;
    }
    return this.tasks.queued[this.config.data.taskId] ;
  }

  public save(): void {
    if (this.config.data.taskId === null) {
      this.tasks.addTask({ name: this.name, description: this.description });
    } else {
      this.tasks.updateTask(this.config.data.taskId, { name: this.name, description: this.description });
    }
    this.ref.close();
  }
}
