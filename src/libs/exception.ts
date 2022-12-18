export enum ErrorCode {
  unauthorize = 1001,
  reject = 1002,
  closePopUp = 1003,
  unexpectedParams = 1004,
}

export class RuntimeError extends Error {
  code: ErrorCode;
  description?: string;

  constructor(code: ErrorCode, message: string, description?: string) {
    super(message);
    this.code = code;
    this.description = description;
  }
}

export class ClosePopUpError extends RuntimeError {
  constructor() {
    super(ErrorCode.closePopUp, "Close PopUp");
  }
}

export class EventError extends RuntimeError {
  constructor(message?: string) {
    super(
      ErrorCode.unexpectedParams,
      message ??
        `The method have to call with user event, for example when user click to button, calling event by script is restricted.`
    );
  }
}

export class TonConnectError extends Error {
  code?: number;

  constructor(message: string, code?: number) {
    super(message);
    this.code = code;
  }
}
