export interface IHunityCmdQueueItem {
  command_id: number;
  unixtimestamp?: number;
  unixtimestampStart?: number;
  experiement_id: string;
  data: string;
  sent: boolean;
}

export interface IHunityCmdQueueResponse {
  commandqueue: IHunityCmdQueueItem[];
}
