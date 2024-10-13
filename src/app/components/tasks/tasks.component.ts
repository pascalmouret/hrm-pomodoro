import { NgForOf, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { Button } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DragDropModule } from 'primeng/dragdrop';
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
    DragDropModule,
  ],
  providers: [DialogService],
})
export class TasksComponent {
  private currentDragIndex: number | null = null;
  private currentDrop: Element | null = null;

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

  public onDragStart(taskIndex: number): void {
    this.currentDragIndex = taskIndex;
  }

  public onDragEnd(): void {
    this.currentDragIndex = null;

    if (this.currentDrop !== null) {
      this.currentDrop.classList.remove('border-solid', 'border-2', 'border-blue-500', 'border-round-md');
      this.currentDrop = null;
    }
  }

  public onDrop(targetPosition: number): void {
    if (this.currentDragIndex === null) {
      return;
    }

    if (targetPosition === this.currentDragIndex) {
      return;
    }

    if (targetPosition >= this.tasks.queued.length - 1) {
      targetPosition -= 1;
    }

    this.tasks.moveTask(this.currentDragIndex, targetPosition);
  }

  public onDragEnter(event: DragEvent): void {
    this.currentDrop = event.target as Element;
    this.currentDrop.classList.add('border-solid', 'border-2', 'border-blue-500', 'border-round-md');
  }

  public onDragLeave(): void {
    if (this.currentDrop !== null) {
      this.currentDrop.classList.remove('border-solid', 'border-2', 'border-blue-500', 'border-round-md');
      this.currentDrop = null;
    }
  }
}
