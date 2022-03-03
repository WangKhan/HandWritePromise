const PromiseStatus = {
  Pending: "PENDING",
  FulFilled: "FULFILLED",
  Rejected: "REJECTED"
};

class MyPromise {
  constructor(excutor) {
    this.status = PromiseStatus.Pending;
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];
    this.value = undefined;
    this.reason = undefined;

    // 当 promise 成功执行时，所有 onFulfilled 需按照其注册顺序依次回调
    const resolve = (value) => {
      // promise 的状态只能更改一次
      if (this.status === PromiseStatus.Pending) {
        this.status = PromiseStatus.FulFilled;
        this.value = value;
        setTimeout(() => {
          this.onFulfilledCallbacks.forEach((callback) => {
            callback(value);
          });
        });
      }
    };

    // 当 promise 被拒绝执行时，所有的 onRejected 需按照其注册顺序依次回调
    const reject = (reason) => {
      // promise 的状态只能更改一次
      if (this.status === PromiseStatus.Pending) {
        this.status = PromiseStatus.Rejected;
        this.reason = reason;
        setTimeout(() => {
          this.onRejectedCallbacks.forEach((callback) => {
            callback(reason);
          });
        });
      }
    };

    try {
      excutor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  then (onFulfilled, onRejected) {
    onFulfilled =
      typeof onFulfilled === "function" ? onFulfilled : (value) => value;
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (reason) => {
          throw reason;
        };

    let _resolve;
    let _reject;

    const resolvePromise = (promise, x, resolve, reject) => {
      // console.log(x)
      // 禁止循环调用
      if (promise === x) {
        reject(new TypeError("禁止循环调用"));
      }
      // 如果 x 是 Promise 实例
      if (x instanceof MyPromise) {
        // 如果 x 的状态为 Pending，那么直到 x 为 Fulfilled 或 Rejected 才调用 resolve
          x.then(
            (y) => {
              // 进一步 resolvePromise 是因为 y 也有可能是个 Promise 实例 / thenable 对象
              resolvePromise(promise, y, resolve, reject);
            },
            (r) => {
              reject(r);
            }
          );
      } else {
        resolve(x);
      }
    };


    const onFulfilledCallback = (value) => {
      try {
        const x = onFulfilled(value);
        resolvePromise(promise2, x, _resolve, _reject);
      } catch (error) {
        _reject(error);
      }
    };

    const onRejectedCallback = (value) => {
      try {
        const x = onRejected(value);
        resolvePromise(promise2, x, _resolve, _reject);
      } catch (error) {
        _reject(error);
      }
    };

    const promise2 = new MyPromise((resolve, reject) => {
      _resolve = resolve;
      _reject = reject;

      if (this.status === PromiseStatus.Pending) {
        this.onFulfilledCallbacks.push(onFulfilledCallback);
        this.onRejectedCallbacks.push(onRejectedCallback);
      }

      if (this.status === PromiseStatus.FulFilled) {
        setTimeout(() => onFulfilledCallback(this.value));
      }

      if (this.status === PromiseStatus.Rejected) {
        setTimeout(() => onRejectedCallback(this.reason));
      }
    });

    return promise2;
  }
}


const p2 = new Promise((resolve, reject) => {
  resolve(100)
})

p2.then(res => {
  console.log('fulfilled', res);
  return new Promise((resolve, reject) => resolve(new Promise((resolve,reject)=>{reject(200)})))
}).then(res => {
  console.log('fulfilled', res)
},err=>{console.log(err)})


