import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { TimelineModule } from 'primeng/timeline';
import { LogEntry, LogService, LogType } from '../../services/log/log.service';

// TODO: update text
// TODO: make look nice
@Component({
  selector: 'pomodoro-log',
  standalone: true,
  templateUrl: './log.component.html',
  imports: [
    DatePipe,
    TimelineModule,
  ]
})
export default class LogComponent {
  constructor(public readonly log: LogService) {}

  public prettyMessage(entry: LogEntry<any>): string {
    switch (entry.type) {
      case LogType.CREATE_TASK:
        return `Created task: ${entry.payload.name}`;
      case LogType.UPDATE_TASK:
        let result = `Updated task ${entry.payload.before.name}:`;

        if (entry.payload.after.name !== entry.payload.before.name) {
          return result += `\nName -> ${entry.payload.after.name}`;
        }

        if (entry.payload.after.description !== entry.payload.before.description) {
          return result += `\nDescription -> ${entry.payload.after.description}`;
        }

        return result;
      case LogType.REMOVE_TASK:
        return `Removed task: ${entry.payload.name}`;
      case LogType.START_TASK:
        return `Started task: ${entry.payload.name}`;
      case LogType.COMPLETE_TASK:
        return `Completed task: ${entry.payload.name}`;
      case LogType.MOVE_TASK:
        return `Moved task: ${entry.payload.task.name}: ${entry.payload.from + 1} -> ${entry.payload.to + 1}`;
      case LogType.START_WORK_INTERVAL:
        return 'Started work interval';
      case LogType.FINISH_WORK_INTERVAL:
        return 'Finished work interval';
      case LogType.START_BREAK_INTERVAL:
        return 'Started break interval';
      case LogType.FINISH_BREAK_INTERVAL:
        return 'Finished break interval';
      case LogType.STOP_WORK:
        return 'Stopped work';
      case LogType.STOP_BREAK:
        return 'Stopped break';
      default:
        throw new Error('Unexpected log type');
    }
  }
}
