class MyPromise {
  // 状态 pending || fulfilled || rejected
  #PromiseState;
  // 
  #PromiseResult;

  constructor(fn) {
    // 初始化
    this.#PromiseState = 'pending';
    this.#PromiseResult = undefined;

    try {
      fn((res) => this.resolve(res), (err) => this.reject(err));
    } catch (error) {
      this.reject(error);
    }
  }

  get isPending() {
    return this.#PromiseState === 'pending';
  }
  resolve(res) {
    // 只有pending状态下 能改变状态为fulfilled
    if (!this.isPending) return this;
    this.#PromiseState = 'fulfilled';
    this.#PromiseResult = res;
  }
  reject(err) {
    // 只有pending状态下 能改变状态为rejected
    if (!this.isPending) return this;
    this.#PromiseState = 'rejected';
    this.#PromiseResult = err;
  }
}