import { NgIf } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { Button } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TabViewModule } from 'primeng/tabview';
import { TooltipModule } from 'primeng/tooltip';
import { Subscription, timer } from 'rxjs';
import { TaskService } from '../../services/tasks/task.service';
import { TimerService, TimerState } from '../../services/timer/timer.service';
import { millisAsPretty } from '../../util/duration';

@Component({
  selector: 'pomodoro-timer',
  standalone: true,
  templateUrl: './timer.component.html',
  imports: [
    CardModule,
    TabViewModule,
    Button,
    NgIf,
    TooltipModule
  ],
})
export class TimerComponent implements OnDestroy {
  protected readonly TimerState = TimerState;
  public prettyRemaining: string = '';

  private readonly subscription: Subscription;

  constructor(
    public readonly timer: TimerService,
    public readonly tasks: TaskService,
  ) {
    this.subscription = this.timer.$remainingMillis.subscribe((remaining) => {
      this.prettyRemaining = millisAsPretty(remaining);
    });
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
