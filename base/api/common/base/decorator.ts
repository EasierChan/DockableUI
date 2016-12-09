/**
 * chenlei 2016/0909
 */
'use strict';

export var sealed = (constructor:Function):void => {
    Object.seal(constructor);
    Object.seal(constructor.prototype);   
}

