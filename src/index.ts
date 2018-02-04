/**
 * @public
 */
export default class Promise<T> {
  private state = State.pending
  private onFilfilled!: ((value: T) => void)
  private onRejected!: (reason: any) => void
  private onCatched!: (reason: any) => void
  private value!: T
  private reason!: any

  constructor (executor: (resolve: (value: T | Promise<T>) => void, reject: (reason: any) => void) => void) {
    try {
      executor(value => {
        if (this.state === State.pending) {
          this.state = State.fulfilled
          resolvePromise(value, (newValue, reason) => {
            if (newValue !== undefined) {
              this.value = newValue
              if (this.onFilfilled) {
                this.onFilfilled(this.value)
              }
            } else {
              this.reject(reason)
            }
          })
        }
      }, reason => {
        if (this.state === State.pending) {
          this.reject(reason)
        }
      })
    } catch (reason) {
      if (this.state === State.pending) {
        this.reject(reason)
      }
    }
  }

  public static all<T> (promises: Promise<T>[]): Promise<T[]> {
    return new Promise<T[]>((resolve, reject) => {
      const values: T[] = new Array(promises.length)
      let resolvedPromiseCount = 0
      let rejected = false
      for (let i = 0; i < promises.length; i++) {
        promises[i].then(value => {
          if (!rejected) {
            resolvedPromiseCount++
            values[i] = value
            if (resolvedPromiseCount === promises.length) {
              resolve(values)
            }
          }
        }, reason => {
          if (!rejected) {
            rejected = true
            reject(reason)
          }
        })
      }
    })
  }

  public static race<T> (promises: Promise<T>[]): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      let pending = true
      for (const promise of promises) {
        promise.then(value => {
          if (pending) {
            pending = false
            resolve(value)
          }
        }, reason => {
          if (pending) {
            pending = false
            reject(reason)
          }
        })
      }
    })
  }

  public static reject<T> (reason: any): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      reject(reason)
    })
  }
  public static resolve<T> (value: T | Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      resolve(value)
    })
  }

  public then<TResult1, TResult2> (onFulfilled: (value: T) => never | TResult1 | Promise<TResult1>, onRejected?: (reason: any) => never | TResult2 | Promise<TResult2>): Promise<void | TResult1 | TResult2> {
    const promise = new Promise<void | TResult1 | TResult2>((resolve, reject) => {
      this.onFilfilled = value => {
        try {
          const newResult = onFulfilled(value)
          resolvePromise(newResult, (newValue, newReason) => {
            if (newValue !== undefined) {
              resolve(newValue)
            } else {
              reject(newReason)
            }
          })
        } catch (reason) {
          reject(reason)
        }
      }
      if (this.state === State.fulfilled) {
        this.onFilfilled(this.value)
      }
      if (onRejected) {
        this.onRejected = reason => {
          try {
            const newResult = onRejected(reason)
            resolvePromise(newResult, (newValue, newReason) => {
              if (newValue !== undefined) {
                resolve(newValue)
              } else {
                reject(newReason)
              }
            })
          } catch (newReason) {
            reject(newReason)
          }
        }
        if (this.state === State.rejected) {
          this.onRejected(this.reason)
        }
      } else {
        setTimeout(() => {
          if (promise.onCatched) {
            this.onCatched = promise.onCatched
            if (this.state === State.rejected) {
              this.onCatched(this.reason)
            }
          }
        }, 0)
      }
    })
    return promise
  }

  public catch<TResult> (onRejected: (reason: any) => never | TResult | Promise<TResult>): Promise<void | TResult> {
    return new Promise<void | TResult>((resolve, reject) => {
      this.onCatched = reason => {
        try {
          const newResult = onRejected(reason)
          resolvePromise(newResult, (newValue, newReason) => {
            if (newValue !== undefined) {
              resolve(newValue)
            } else {
              reject(newReason)
            }
          })
        } catch (newReason) {
          reject(newReason)
        }
      }
      if (this.state === State.rejected && this.reason !== undefined) {
        this.onCatched(this.reason)
      }
    })
  }

  private reject (reason: any) {
    if (reason) {
      this.state = State.rejected
      this.reason = reason
      if (this.onRejected) {
        this.onRejected(this.reason)
      } else {
        if (this.onCatched) {
          this.onCatched(this.reason)
        }
      }
    }
  }
}

function resolvePromise<T> (promise: T | Promise<T>, next: (value: T | undefined, reason: any) => void) {
  if (promise instanceof Promise) {
    promise.then(value => {
      resolvePromise(value, next)
    }, reason => {
      next(undefined, reason)
    })
  } else {
    next(promise, undefined)
  }
}

const enum State {
    pending,
    fulfilled,
    rejected
}
