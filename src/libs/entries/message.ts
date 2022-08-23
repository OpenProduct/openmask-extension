export interface DAppMessage {
  id: number;
  method: string;
  params: any;
  origin: string;
}
