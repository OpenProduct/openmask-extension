export enum ErrorCode {
  unauthorizeOperation = 1001,
  rejectOperation = 1002,
  closePopUp = 1003,
  unexpectedParams = 1004,
}

export class RuntimeError extends Error {
  code: ErrorCode;
  constructor(code: ErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

export class ClosePopUpError extends RuntimeError {
  constructor() {
    super(ErrorCode.closePopUp, "Close PopUp");
  }
}
