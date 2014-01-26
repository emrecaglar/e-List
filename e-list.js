var List = function (items) {
    var arr = [];

    if (items) {
        if (items instanceof Array) {
            var itemsLen = items.length;

            for (var i = 0; i < itemsLen; i++) {
                arr.push(items[i]);
            }
        }
        else if (items instanceof List) {
            var _tmpArray = list.ToArray();
            var tmpArrayLen = _tmpArray.length;

            for (var i = 0; i < tmpArrayLen; i++) {
                arr.push(_tmpArray[i]);
            }
        }
    }

    var Types = {
        String: typeof "",
        Boolean: typeof false,
        Number: typeof 0,
        Function: typeof function () { },
        Undefined: typeof undefined,
        Object: typeof {},
    }

    var Loop = {
        Continue: true,
        Break: false
    }

    var _lambda2func = function (exp) {
        if (exp == null) return function (x) { return x; };

        if (typeof exp == Types.String) {
            if (exp !== "" && exp.indexOf("=>") !== -1) {
                var expr = exp.match(/^[(\s]*([^()]*?)[)\s]*=>(.*)/);

                return new Function(expr[1], "return " + expr[2]);
            }
        }

        return exp;
    }

    var _createFunc = function (exp) {
        var func = {};

        if (typeof exp == Types.String) {
            func = _lambda2func(exp);
        }
        else if (typeof exp == Types.Function) {
            func = exp;
        }
        else {
            throw Error(exp + " is not expression");
        }

        return func;
    }

    var _propName = function (func) {
        return func.toString().split("{")[1].split("}")[0].split(".")[1].trim();
    }

    var _any = function (predicate) {
        var result = false;

        var execFunc = _createFunc(predicate);

        _foreach(function (s) {
            if (execFunc(s)) {
                result = true;

                return Loop.Break;
            }
        });

        return result;
    }

    var _all = function (predicate) {
        var result = true;

        var execFunc = _createFunc(predicate);

        _foreach(function (s) {
            if (!execFunc(s)) {
                result = false;

                return Loop.Break;
            }
        });

        return result;
    }

    var _first = function (predicate) {
        var execFunc = _createFunc(predicate);

        for (var i = 0; i < arr.length; i++) {
            if (execFunc(arr[i])) {
                return arr[i];
            }
        }

        throw Error('No Contains Element');
    }

    var _firstOrDefault = function (predicate) {
        var result = null;

        var execFunc = _createFunc(predicate);

        _foreach(function (s) {
            if (execFunc(s)) {
                result = s;

                return Loop.Break;
            }
        });

        return result;
    }

    var _where = function (predicate) {
        var result = [];

        var execFunc = _createFunc(predicate);

        _foreach(function (s) {
            if (execFunc(s)) {
                result.push(s);
            }
        });

        return new List(result);
    }

    var _action = function (action) {
        var execFunc = _createFunc(action);

        _foreach(function (s) {
            execFunc(s);
        });
    }

    var _indexof = function (obj) {
        var index = -1;

        _foreach(function (s, idx) {
            if (s.Equals(obj)) {
                index = idx;

                return Loop.Break;
            }
        });

        return index;
    }

    var _contains = function (obj) {
        var result = false;

        _foreach(function (s) {
            if (s.Equals(obj)) {
                result = true;

                return Loop.Break;
            }
        });

        return result;
    }

    var _add = function (obj) {
        arr.push(obj);
    }

    var _addRange = function (arr) {
        var arrLen = arr.length;
        for (var i = 0; i < arrLen; i++) {
            _add(arr[i]);
        }
    }

    var _remove = function (obj) {
        var objIndex = _indexof(obj);

        if(objIndex!=-1){
            _removeAt(objIndex);
        }
    }

    var _removeAll = function () {
        arr.splice(0,arr.length);
    }

    var _removeAt = function (index) {
        arr.splice(index,1);
    }

    var _copyTo = function () {
        return new List(arr);
    }

    var _clone = function () {
        var clonedArray = [];

        _foreach(function (s) {
            clonedArray.push(s.Clone());
        });

        return new List(clonedArray);
    }

    var _foreach = function (callback) {
        for (var i = 0; i < arr.length; i++) {

            if (typeof arr[i] !== Types.Function) {
                var status = callback(arr[i], i);

                if (status !== undefined && !status) {
                    break;
                }
            }
        }
    }

    var _join = function (inner, outerKey, innerKey, resultSelector) {
        var lst = new List();

        var _outerKey = _createFunc(outerKey);
        var _innerKey = _createFunc(innerKey);
        var _resultSelector = _createFunc(resultSelector);

        var _inner = inner.ToArray();

        for (var i = 0; i < arr.length; i++) {
            for (var o = 0; o < _inner.length ; o++) {
                try {
                    if (_outerKey(arr[i]).Equals(_innerKey(_inner[o]))) {
                        lst.Add(_resultSelector(arr[i], _inner[o]));
                    }
                } catch (e) {

                }
            }
        }

        return lst;
    }

    var _distinct = function (predicate) {
        var disVal = [];

        var execFunc = _createFunc(predicate);

        _foreach(function (s) {
            if (disVal.indexOf(execFunc(s)) == -1) {
                disVal.push(execFunc(s));
            }
        });

        return new List(disVal);
    }

    var _groupBy = function (predicate) {
        var grouppedArray = [];

        var execFunc = _createFunc(predicate);

        var distinctElements = _distinct(execFunc).ToArray();
        var colName = _propName(execFunc);

        for (var i = 0; i < distinctElements.length ; i++) {
            var key = distinctElements[i];
            var elements = _where(function (s) { return s[colName] == distinctElements[i]; });

            grouppedArray.push(new Grouping(key, elements));
        }

        return grouppedArray;
    }

    var _sum = function (predicate) {
        var execFunc = _createFunc(predicate);

        var result = execFunc(arr[0]);

        _foreach(function (s) {
            result += execFunc(s);
        });

        return result;
    }

    var _select = function (predicate) {
        var result = [];

        var execFunc = _createFunc(predicate);

        _foreach(function (s) {
            result.push(execFunc(s));
        });

        return new List(result);
    }

    var _count = function (predicate) {
        var _c = 0;

        if (predicate) {
            var execFunc = _createFunc(predicate);

            _foreach(function (s) {
                if (execFunc(s))
                    _c++;
            });
        }
        else {
            _c = arr.length;
        }

        return _c;
    }

    var _toArray = function () {
        return arr;
    }

    var _skip = function (count) {
        var result = arr.slice(count, arr.length);

        return new List(result);
    }

    var _take = function (count) {
        var result = arr.slice(0, count);

        return new List(result);
    }

    var _elementAt = function (index) {
        return arr[index];
    }

    var _sort = function (predicate, direction) {

        if (typeof predicate !== Types.Undefined) {
            var execFunc = _createFunc(predicate);
            var propName = _propName(execFunc.toString());

            if (typeof direction == Types.Undefined) {
                arr.sort(function (a1, a2) {
                    return a1[propName].CompareTo(a2[propName]);
                });
            }
            else {
                if (direction == "asc") {
                    arr.sort(function (a1, a2) {
                        return a1[propName].CompareTo(a2[propName]);
                    });
                }
                else if (direction == "desc") {
                    arr.sort(function (a1, a2) {
                        return a2[propName].CompareTo(a1[propName]);
                    });
                }
            }
        }
        else if (typeof predicate === Types.Undefined) {
            arr.sort(function (a1, a2) {
                return a1.CompareTo(a2);
            });
        }
    }

    var _reverse = function () {
        arr.reverse();
    }

    return {
        Action: _action,
        Add: _add,
        AddRange: _addRange,
        Any: _any,
        All: _all,
        Clone: _clone,
        CopyTo: _copyTo,
        Count: _count,
        Contains: _contains,
        Distinct: _distinct,
        ElementAt: _elementAt,
        First: _first,
        FirstOrDefault: _firstOrDefault,
        ForEach: _foreach,
        GroupBy: _groupBy,
        IndexOf: _indexof,
        Join: _join,
        Remove: _remove,
        RemoveAt: _removeAt,
        RemoveAll: _removeAll,
        Reverse: _reverse,
        Select: _select,
        Skip: _skip,
        Sum: _sum,
        Sort: _sort,
        Take: _take,
        ToArray: _toArray,
        Where: _where
    };
}

var Grouping = function (key, elements) {
    this.Key = key,
    this.Elements = elements
}

Boolean.prototype.Equals = function (value) {
    if (this.valueOf() === value)
        return true
    else
        return false;
}

String.prototype.Equals = function (str) {
    if (this.valueOf() === str)
        return true
    else
        return false;
}

String.Format = function (args) {
    args = String.Format.arguments;
    var index = 1;
    var exp = args[0].replace(/{\d+}/g, function (match, number) {
        var result = typeof args[index] != 'undefined' ? args[index] : match;
        index++
        return result;
    })

    return exp;
}

Number.prototype.Equals = function (number) {
    if (this.valueOf() === number)
        return true;
    else
        return false;
}

Object.prototype.Equals = function (obj) {
    for (var i in this) {
        if (this[i].valueOf() !== obj[i].valueOf()) {
            return false;
        }
    }

    return true;
}

Object.prototype.Clone = function () {
    var clonedObject = {};

    if (typeof this.valueOf() === "object") {
        for (var i in this) {
            clonedObject[i] = this[i].valueOf();
        }
    }
    else {
        clonedObject = this.valueOf();
    }

    return clonedObject;
}

Object.prototype.HasFunc = function (funcName) {
    if (typeof this[funcName] === undefined) {
        return false;
    }
    else {
        return true;
    }
}

String.prototype.CompareTo = function (str) {
    var val1 = this;
    var val2 = str;

    for (var i = 0; i < this.length; i++) {
        val1 += val1[i].charCodeAt();
    }

    for (var i = 0; i < str.length; i++) {
        val2 += str[i].charCodeAt();
    }

    if (val1 > val2)
        return 1;
    else if (val1 < val2)
        return -1;
    else
        return 0;
}

Number.prototype.CompareTo = function (nm) {
    var val1 = this.valueOf();
    var val2 = nm;

    if (val1 > val2)
        return 1;
    else if (val1 < val2)
        return -1;
    else
        return 0;
}

Boolean.prototype.CompareTo = function (bool) {
    var val1 = this.valueOf();
    var val2 = bool;

    if (val1 && !val2)
        return 1;
    else if (!val1 < val2)
        return -1;
    else
        return 0;
}

Object.prototype.CompareTo = function (obj) {
    if (typeof obj.valueOf() === "string" ||
        typeof obj.valueOf() === "number" ||
        typeof obj.valueOf() === "boolean") {

        return this.CompareTo(obj);
    }
    else if (typeof obj.valueOf() === "object") {
        if (this.hasOwnProperty("CompareTo")) {
            return this.CompareTo(obj);
        }
        else {
            return 0;
        }
    }
}

