export enum AppStatus {
  IDLE = 'IDLE',
  SENDING = 'SENDING',
  SCHEDULED = 'SCHEDULED',
  DONE = 'DONE',
  ERROR = 'ERROR',
}

export interface MessageToSend {
  number: string;
  name: string;
  personalizedMessage: string;
}

export interface Recipient {
  name: string;
  number: string;
}

export interface SentMessage extends MessageToSend {
  sentAt: string; // ISO string
}

export type SavedTemplates = { [templateName: string]: string };
export type SavedContactGroups = { [groupName: string]: Recipient[] };
export type SentMessageHistory = SentMessage[];