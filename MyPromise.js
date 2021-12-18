class MyPromise {
  // 状态 pending || fulfilled || rejected
  #PromiseState;
  #PromiseResult;

  constructor(fn) {
    // 初始化
    this.#init();
    try {
      fn((res) => this.resolve(res), (err) => this.reject(err));
    } catch (error) {
      this.reject(error);
    }
  }

  #init() {
    this.#PromiseState = 'pending';
    this.#PromiseResult = undefined;
  }
  get isPending() {
    return this.#PromiseState === 'pending';
  }
  resolve(res) {
    if (!this.isPending) return this;
    this.#PromiseState = 'fulfilled';
    this.#PromiseResult = res;
  }
  reject(err) {
    if (!this.isPending) return this;
    this.#PromiseState = 'rejected';
    this.#PromiseResult = err;
    // throw(err);
  }
}