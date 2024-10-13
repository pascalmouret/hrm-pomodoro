import { NgIf } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';

import { Task, TaskService } from '../../../services/tasks/task.service';

@Component({
  selector: 'pomodoro-task-edit',
  standalone: true,
  templateUrl: './task-edit.component.html',
  imports: [
    FormsModule,
    InputTextModule,
    Button,
    NgIf,
    InputTextareaModule,
    ReactiveFormsModule
  ]
})
export default class TaskEditComponent implements OnInit {
  public taskForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
    description: new FormControl('', Validators.maxLength(1000)),
  });

  constructor(
    public tasks: TaskService,
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
  ) {}

  public ngOnInit() {
    if (this.task !== null) {
      this.taskForm.get('name')?.setValue(this.task.name);
      this.taskForm.get('description')?.setValue(this.task.description);
    }
  }

  public get task(): Task | null {
    if (this.config.data?.taskId === undefined) {
      return null;
    }
    return this.tasks.queued[this.config.data.taskId] ;
  }

  public save(): void {
    if (this.taskForm.valid) {
      if (this.config.data?.taskId === undefined) {
        // we know it is valid
        this.tasks.addTask(this.taskForm.getRawValue() as any);
      } else {
        // we know it is valid
        this.tasks.updateTask(this.config.data.taskId, this.taskForm.getRawValue() as any);
      }

      this.ref.close();
    }
  }
}
