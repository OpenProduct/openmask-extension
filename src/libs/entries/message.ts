export interface DAppMessage {
  id: number;
  method: string;
  params: any;
  origin: string;
  event: boolean;
}

export type OpenMaskApiMessage = OpenMaskApiResponse | OpenMaskApiEvent;

export interface OpenMaskError {
  message: string;
  code: number;
  description?: string;
}
export interface OpenMaskApiResponse {
  type: "OpenMaskAPI";
  message: {
    jsonrpc: "2.0";
    id: number;
    method: string;
    result: undefined | unknown;
    error?: OpenMaskError;
  };
}

export interface OpenMaskApiEvent {
  type: "OpenMaskAPI";
  message: {
    jsonrpc: "2.0";
    id?: undefined;
    method: "accountsChanged" | "chainChanged";
    result: undefined | unknown;
    error?: OpenMaskError;
  };
}
