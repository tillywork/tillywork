export * from './automation';
export * from './step';
export * from './handler';

export enum LocationType {
  SPACE = 'space',
  LIST = 'list',
}

export enum AutomationRunStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export type AutomationRunError = {
  message: string;
  stack?: unknown;
  response?: unknown;
};
