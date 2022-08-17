export class EventEmitter {
  callbacks: { [s: string]: ((...args: any[]) => void)[] } = {};

  on(event: string, cb: (...args: any[]) => void) {
    if (!this.callbacks[event]) this.callbacks[event] = [];
    this.callbacks[event].push(cb);
  }

  off(event: string, cb: (...args: any[]) => void) {
    let cbs = this.callbacks[event];
    if (cbs) {
      this.callbacks[event] = cbs.filter((item) => item !== cb);
    }
  }

  emit(event: string, data: any) {
    let cbs = this.callbacks[event];
    if (cbs) {
      cbs.forEach((cb) => cb(data));
    }
  }
}
