import { DatePipe, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { TimelineModule } from 'primeng/timeline';
import { LogEntry, LogService, LogType } from '../../services/log/log.service';

const MARKERS: Record<LogType, string> = {
  [LogType.CREATE_TASK]: '➕',
  [LogType.UPDATE_TASK]: '📋',
  [LogType.REMOVE_TASK]: '❌',
  [LogType.START_TASK]: '💼',
  [LogType.COMPLETE_TASK]: '✔️',
  [LogType.MOVE_TASK]: '🔀',
  [LogType.START_WORK_INTERVAL]: '💼',
  [LogType.FINISH_WORK_INTERVAL]: '💼',
  [LogType.START_BREAK_INTERVAL]: '🌴',
  [LogType.FINISH_BREAK_INTERVAL]: '🌴',
  [LogType.STOP_WORK]: '🛑',
  [LogType.STOP_BREAK]: '🛑',
}

@Component({
  selector: 'pomodoro-log',
  standalone: true,
  templateUrl: './log.component.html',
  imports: [
    DatePipe,
    TimelineModule,
    CardModule,
    NgIf,
  ]
})
export default class LogComponent {
  public readonly MARKERS: Record<any, string> = MARKERS;

  constructor(public readonly log: LogService) {}

  public prettyTitle(entry: LogEntry<any>): string {
    switch (entry.type) {
      case LogType.CREATE_TASK:
        return `Created task: ${entry.payload.name}`;
      case LogType.UPDATE_TASK:
        return `Updated task`;
      case LogType.REMOVE_TASK:
        return `Removed task: ${entry.payload.name}`;
      case LogType.START_TASK:
        return `Started task: ${entry.payload.name}`;
      case LogType.COMPLETE_TASK:
        return `Completed task: ${entry.payload.name}`;
      case LogType.MOVE_TASK:
        return `Moved task: ${entry.payload.task.name}`;
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

  public prettyMessage(entry: LogEntry<any>): string | undefined {
    switch (entry.type) {
      case LogType.CREATE_TASK:
        return entry.payload.description;
      case LogType.UPDATE_TASK:
        let result = [];

        if (entry.payload.after.name !== entry.payload.before.name) {
          result.push(`Name -> ${entry.payload.after.name}`);
        }

        if (entry.payload.after.description !== entry.payload.before.description) {
          result.push(`Description -> ${entry.payload.after.description}`);
        }

        return result.join('\n');
      case LogType.MOVE_TASK:
        return `Moved from position ${entry.payload.from + 1} to ${entry.payload.to + 1}`;
      default:
        return undefined
    }
  }
}
