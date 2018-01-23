/**
 * chenlei 2017/01/13
 */
"use strict";

/**
 * a generic pool
 */
export class Pool<T>{
    constructor(private _pool: Array<T> = []) {
    }
    /**
     * append new element into pool
     * @param ele new element
     */
    append(ele: T): Pool<T> {
        this._pool.push(ele);
        return this;
    }
    /**
     * prepend new element into pool
     * @param ele new element
     */
    prepend(ele: T): Pool<T> {
        this._pool.unshift(ele);
        return this;
    }
    /**
     * peek elements
     * @param
     */
    peek(n = 1): T[] {
        return this._pool.slice(0, n);
    }
    /**
     * remove elements from _pool and return them.
     * @param n  the number of elements at the first of _pool to be removed.
     */
    remove(n = 1): T[] {
        return this._pool.splice(0, n);
    }

    clear(): void {
        this._pool.length = 0;
    }

    get length(): number{
        return this._pool.length;
    }
}