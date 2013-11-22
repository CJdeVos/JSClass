/* Javascript Class model
 * CJ de Vos http://netfeatures.nl
 * MIT Licensed
 */
(function (name, impl) {
    if (typeof define === "function" && define.amd) { define(name, [], function () { return impl; }); }
    else this[name] = impl;
})("Class", function () {

    /* Shamelessly copied from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create */
    if (!Object.create) {
        Object.create = (function () {
            function F() { }

            return function (o) {
                if (arguments.length != 1) {
                    throw new Error('Object.create implementation only accepts one parameter.');
                }
                F.prototype = o;
                return new F()
            }
        })()
    }

    function isUndefined(arg){
        return arg === undefined;
    }

    function getDefaultFuncInfo() {
        return {
            "virtual": false,
            "override": false,
            "name": null,
            "after": false,
            "before": false
        };
    }
    
    function parseFuncInfo(argName) {
        // (virtual||override )f(:after||:before)
        var strVirtual = "virtual ";
        var strOverride = "override ";
        var strAfter = ":after";
        var strBefore = ":before";
        var ret = getDefaultFuncInfo();

        if (argName.indexOf(strVirtual) === 0) {
            ret.virtual = true;
            argName = argName.substring(strVirtual.length);
        }
        else if (argName.indexOf(strOverride) === 0) {
            ret.override = true;
            argName = argName.substring(strOverride.length);
        }

        if (argName.indexOf(":") >= 0) {
            if (argName.indexOf(strAfter) === (argName.length - strAfter.length)) {
                ret.after = true;
                argName = argName.substring(0, argName.length - strAfter.length);
            }
            else if (argName.indexOf(strBefore) === (argName.length - strBefore.length)) {
                ret.before = true;
                argName = argName.substring(0, argName.length - strBefore.length);
            }
        }

        // verify it is a valid method name
        if (argName.indexOf(".") > -1 || argName.indexOf(" ") > -1) throw "Invalid function name '" + argName + "'.";

        ret.name = argName;

        // pre parse
        if ((ret.virtual || ret.override) && (ret.after || ret.before)) throw "Unable to combine virtual or override with :after or :before.";

        return ret;
    }

    function createExceptionMessage(name, msg){
        return "Attempt to define method '"+name+"' failed: "+msg;
    }

    function extend() {
        var base = this;                    
        var F = function () { if (this["init"]) this.init.apply(this, arguments); };
        F.prototype = Object.create(this.prototype);
        F.extend = extend;
        F.mixin = mixin;
        F.prototype.constructor = this;
        return mixin.apply(F, arguments);
    }

    var fnBaseTest = /\bthis.base\b/;

    function mixin() {
        if (arguments.length === 0) return this;

        var toMixin = arguments[0], parsedFuncInfo = null, fnCurrentImpl = null, fnNewImpl = null;
        for (var mixinName in toMixin) {
            // parse mixinName
            parsedFuncInfo = parseFuncInfo(mixinName);
            fnCurrentImpl = this.prototype[parsedFuncInfo.name];
            fnNewImpl = toMixin[mixinName];

            // Condition checks on virtual, override and normal
            if(parsedFuncInfo.override){                           
                // OVERRIDE: 
                delete this.prototype[parsedFuncInfo.name];
                //  1) the method MUST already exist on the base type
                if (isUndefined(this.prototype[parsedFuncInfo.name])) throw createExceptionMessage(mixinName, "method to override does not exist.");
                //  2) the base method MUST be virtual
                if (fnCurrentImpl.virtual !== true && fnCurrentImpl.override !== true) throw createExceptionMessage(mixinName, "base method is not virtual.");

                //  2) the method may NOT exist on this type
                if(this.prototype[parsedFuncInfo.name] !== fnCurrentImpl) throw createExceptionMessage(mixinName, "method is already overridden in this implementation.");
            }
            else if (parsedFuncInfo.after || parsedFuncInfo.before) {
                // AFTER or BEFORE:
                //  1) the method must exist
                if (isUndefined(fnCurrentImpl)) throw createExceptionMessage(mixinName, "method does not exist.");
            }
            else 
            {
                // VIRTUAL and NORMAL: 
                //  1) the method may not YET exist
                if(!isUndefined(fnCurrentImpl)) throw createExceptionMessage(mixinName, "method already exists.");
            }

            // Implement
            var fImplementation = null;
            if (parsedFuncInfo.after) {
                fImplementation = function (normal, after) {
                    return function () {
                        var r = normal.apply(this, arguments);
                        var args = [];
                        for (var i = 0; i < arguments.length; i++) args[i] = arguments[i]; // can't use splice for all arguments (<= IE8)
                        args.unshift(r);
                        after.apply(this, args);
                        return r;
                    }
                } (fnCurrentImpl, fnNewImpl);
            }
            else if (parsedFuncInfo.before) {
                fImplementation = (function (before, normal) {
                    return function () {
                        before.apply(this, arguments);
                        return normal.apply(this, arguments);
                    }
                }(fnNewImpl, fnCurrentImpl));
            }
            else {
                // test that the new method actually calls the base...
                var baseClass = this.prototype.constructor.prototype;
                fImplementation = fnBaseTest.test(fnNewImpl) ? (function (base, argf) {
                    return function impl() {
                        var baseOld = this.base;
                        this.base = baseClass;
                        var r = argf.apply(this, arguments);
                        this.base = baseOld;
                        return r;
                    }
                }(baseClass, fnNewImpl)) : fnNewImpl;
            }

            for (var p in parsedFuncInfo) fImplementation[p] = parsedFuncInfo[p];

            // assign
            this.prototype[parsedFuncInfo.name] = fImplementation;
        }

        return this;
    }

    function Class() { }
    Class.extend = extend;
    Class.mixin = mixin;

    return Class;
} ());