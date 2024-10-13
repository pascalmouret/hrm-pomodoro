import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { PanelModule } from 'primeng/panel';
import { LogService } from '../../services/log/log.service';
import { TaskService } from '../../services/tasks/task.service';
import { TimerService } from '../../services/timer/timer.service';
import { InputNumberModule } from 'primeng/inputnumber';
import { MILLS_IN_MINUTE, MILLS_IN_SECOND } from '../../util/duration';

// TODO: use forms
// TODO: disable while timer is running
@Component({
  selector: 'pomodoro-settings',
  standalone: true,
  templateUrl: './settings.component.html',
  imports: [
    PanelModule,
    NgIf,
    CardModule,
    InputNumberModule,
    FormsModule,
    Button,
  ],
})
export class SettingsComponent {
  public workDurationMinutes!: number;
  public workDurationSeconds!: number;

  public breakDurationMinutes!: number;
  public breakDurationSeconds!: number;

  constructor(
    public readonly timer: TimerService,
    private readonly log: LogService,
    private readonly task: TaskService,
  ) {
    this.initForm();
  }

  private initForm(): void {
    this.workDurationMinutes = Math.floor(this.timer.workDuration / MILLS_IN_MINUTE);
    this.workDurationSeconds = Math.floor((this.timer.workDuration % MILLS_IN_MINUTE) / MILLS_IN_SECOND);

    this.breakDurationMinutes = Math.floor(this.timer.breakDuration / MILLS_IN_MINUTE);
    this.breakDurationSeconds = Math.floor((this.timer.breakDuration % MILLS_IN_MINUTE) / MILLS_IN_SECOND);
  }

  public updateWorkDuration(): void {
    const millis = this.toMillis(this.workDurationMinutes, this.workDurationSeconds);

    if (millis !== 0) {
      this.timer.setWorkDuration(millis);
    }
  }

  public updateBreakDuration(): void {
    const millis = this.toMillis(this.breakDurationMinutes, this.breakDurationSeconds);

    if (millis !== 0) {
      this.timer.setBreakDuration(millis);
    }
  }

  // TODO: show confirmation
  public resetAll(): void {
    this.task.reset();
    this.log.reset();
    this.timer.reset();

    this.initForm();
  }

  private toMillis(minutes: number, seconds: number): number {
    const result =  minutes * MILLS_IN_MINUTE + seconds * MILLS_IN_SECOND;

    if (Number.isNaN(result) || result < 0) {
      throw new Error('Millis is not a valid value');
    }

    return result;
  }
}
