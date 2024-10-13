import { NgForOf, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { Button } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogService } from 'primeng/dynamicdialog';
import { FieldsetModule } from 'primeng/fieldset';
import { PanelModule } from 'primeng/panel';
import { TaskService } from '../../services/tasks/task.service';
import TaskEditComponent from './edit/task-edit.component';

@Component({
  selector: 'pomodoro-tasks',
  standalone: true,
  templateUrl: './tasks.component.html',
  imports: [
    PanelModule,
    NgIf,
    Button,
    CardModule,
    NgForOf,
    FieldsetModule,
  ],
  providers: [DialogService],
  styleUrl: './tasks.component.scss'
})
export class TasksComponent {
  constructor(
    public tasks: TaskService,
    public dialog: DialogService,
  ) {}

  public addExampleTasks(): void {
    this.tasks.addTask({ name: 'Create Pomodoro App', description: 'Probably need to figure out the requirements first.' });
    this.tasks.addTask({ name: '???', description: 'This is always the hard part.' });
    this.tasks.addTask({ name: 'Profit', description: 'If you can figure out step 2, this is easy!' });
  }

  public removeTask(taskId: number): void {
    this.tasks.removeTask(taskId);
  }

  public editTask(taskId: number): void {
    this.dialog.open(
      TaskEditComponent,
      {
        header: 'Edit Task',
        data: { taskId },
      },
    );
  }

  public createTask(): void {
    this.dialog.open(
      TaskEditComponent,
      { header: 'Create Task' },
    );
  }
}
