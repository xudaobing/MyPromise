function isThenable(v) {
  return v?.then && typeof v.then === 'function';
}

class MyPromise {
  // 状态 pending || fulfilled || rejected
  #PromiseState;
  // 结果
  #PromiseResult;
  // 已兑现 回调
  #onFulfilledCallBacks;
  // 已拒绝 回调
  #onRejectedCallBacks;

  // 返回一个状态由给定value决定的Promise对象
  static resolve(value) {
    // value 是Promise实例直接返回
    if (value instanceof MyPromise) return value;
    return new MyPromise((resolve, reject) => {
      // thenable对象(即带有"then" 方法),采用它的最终状态
      if (isThenable(value)) return value.then(resolve, reject);
      resolve(value);
    });
  }

  // 返回 已拒绝Promise对象，reason可使任意值
  static reject(reason) {
    return new MyPromise((resolve, reject) => reject(reason));
  }

  constructor(fn) {
    // 初始化
    this.#PromiseState = 'pending';
    this.#PromiseResult = undefined;

    this.#onFulfilledCallBacks = [];
    this.#onRejectedCallBacks = [];

    try {
      fn((res) => this.resolve(res), (err) => this.reject(err));
    } catch (error) {
      this.reject(error);
    }
  }

  resolve(value) {
    // 只有pending状态下 能改变状态为fulfilled
    if (this.#PromiseState !== 'pending') return this;

    // value 是thenable对象
    if (isThenable(value)) {
      value = new MyPromise((resolve, reject) => {
        value.then(resolve, reject);
      })
    }

    if (value instanceof MyPromise) {
      value.then((v) => this.resolve(v), (r) => this.reject(r));
    } else {
      this.#PromiseState = 'fulfilled';
      this.#PromiseResult = value;

      const onFulfilledCallBacks = this.#onFulfilledCallBacks.splice(0);
      setTimeout(() => {
        onFulfilledCallBacks.forEach((c) => c(value));
      }, 0);
    }
  }
  reject(reason) {
    // 只有pending状态下 能改变状态为rejected
    if (this.#PromiseState !== 'pending') return this;
    // 不对 reason 值处理，可任意值
    this.#PromiseState = 'rejected';
    this.#PromiseResult = reason;

    const onRejectedCallBacks = this.#onRejectedCallBacks.splice(0);
    setTimeout(() => {
      onRejectedCallBacks.forEach((c) => c(reason));
    }, 0);
    // throw reason;
  }

  then(onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
      function _onFulfilled(value) {
        try {
          const val = typeof onFulfilled === 'function' ? onFulfilled(value) : value;
          resolve(val);
        } catch (error) {
          reject(error);
        }
      }
      function _onRejected(reason) {
        try {
          const val = typeof onRejected === 'function' ? onRejected(reason) : reason;
          reject(val);
        } catch (error) {
          reject(error);
        }
      }
      // 模拟异步，宏任务处理
      if (this.#PromiseState === 'fulfilled') {
        setTimeout(() => _onFulfilled(this.#PromiseResult), 0);
      } else if (this.#PromiseState === 'rejected') {
        setTimeout(() => _onRejected(this.#PromiseResult), 0);
      } else {
        this.#onFulfilledCallBacks.push(_onFulfilled);
        this.#onRejectedCallBacks.push(_onRejected);
      }
    });
  }
}