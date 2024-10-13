import { NgIf } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { Button } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TabViewModule } from 'primeng/tabview';
import { Subscription, timer } from 'rxjs';
import { TimerService, TimerState } from '../../services/timer/timer.service';
import { millisAsPretty } from '../../util/duration';

// TODO: Disable start if there is no tasks
// TODO: show in title
@Component({
  selector: 'pomodoro-timer',
  standalone: true,
  templateUrl: './timer.component.html',
  imports: [
    CardModule,
    TabViewModule,
    Button,
    NgIf
  ],
})
export class TimerComponent implements OnDestroy {
  private readonly subscription: Subscription;

  public prettyRemaining: string = '';

  constructor(public readonly timerService: TimerService) {
    this.subscription = this.timerService.$remainingMillis.subscribe((remaining) => {
      this.prettyRemaining = millisAsPretty(remaining);
    });
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  protected readonly TimerState = TimerState;
  protected readonly timer = timer;
}
