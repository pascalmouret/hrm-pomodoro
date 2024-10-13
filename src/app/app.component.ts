import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { CardModule } from 'primeng/card';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TabViewModule } from 'primeng/tabview';
import AlertComponent, { AlertType } from './components/alert/alert.component';
import LogComponent from './components/log/log.component';
import { SettingsComponent } from './components/settings/settings.component';
import { TasksComponent } from './components/tasks/tasks.component';
import { TimerComponent } from './components/timer/timer.component';
import { TaskService } from './services/tasks/task.service';
import { TimerService, TimerState } from './services/timer/timer.service';
import { millisAsPretty } from './util/duration';

const DEFAULT_TITLE = '🍅 Pomodoro';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  imports: [
    TimerComponent,
    TabViewModule,
    CardModule,
    TasksComponent,
    LogComponent,
    CommonModule,
    TasksComponent,
    SettingsComponent,
  ],
  providers: [
    DialogService,
  ],
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private alertRef: DynamicDialogRef | null = null;

  private notificationsEnabled = false;

  constructor(
    private readonly title: Title,
    private readonly dialog: DialogService,
    private readonly timer: TimerService,
    private readonly tasks: TaskService,
  ) {
    this.timer.$state.subscribe((state) => this.stateEventHandler(state));
    this.timer.$remainingMillis.subscribe((remaining) => this.remainingEventHandler(remaining));

    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        this.notificationsEnabled = permission === 'granted';
      });
    }
  }

  private stateEventHandler(state: TimerState): void {
    if (state === TimerState.RUNNING_WORK && this.tasks.active === null) {
      this.tasks.startNextTask();
    }
    if (state === TimerState.STOPPED) {
      this.title.setTitle(DEFAULT_TITLE);
    }
  }

  private remainingEventHandler(remaining: number): void {
    if (this.timer.state === TimerState.RUNNING_WORK) {
      this.title.setTitle(`💼 ${millisAsPretty(remaining)} ${this.tasks.active?.name}`);
    } else if (this.timer.state === TimerState.RUNNING_BREAK) {
      this.title.setTitle(`🌴 ${millisAsPretty(remaining)}`);
    }

    if (remaining === 0) {
      if (this.alertRef !== null) {
        this.alertRef.destroy(); // no fancy animation needed
      }

      const alertType = this.timer.state === TimerState.RUNNING_WORK
        ? AlertType.WORK_FINISHED
        : AlertType.BREAK_FINISHED;

      this.alertRef = this.dialog.open(
        AlertComponent,
        {
          data: { type: alertType },
        }
      );

      if (document.hidden && this.notificationsEnabled) {
        new Notification(`Your ${alertType === AlertType.WORK_FINISHED ? 'work' : 'break'} timer just finished!`);
      }
    }
  }
}
