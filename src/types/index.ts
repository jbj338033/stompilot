export interface Header {
  key: string;
  value: string;
}

export interface Message {
  destination: string;
  content: string;
  timestamp: Date;
}
