globalThis.process ??= {}; globalThis.process.env ??= {};
import { k as getDefaultExportFromCjs } from '../../chunks/astro/server_BHCDmbTb.mjs';
import { d as distExports } from '../../chunks/index_Dtq64N-W.mjs';
export { renderers } from '../../renderers.mjs';

// src/index.ts
var createNode = (part, inert) => {
  const inertMap = inert?.length ? {} : null;
  if (inertMap)
    for (const child of inert)
      inertMap[child.part.charCodeAt(0)] = child;
  return {
    part,
    store: null,
    inert: inertMap,
    params: null,
    wildcardStore: null
  };
};
var cloneNode = (node, part) => ({
  ...node,
  part
});
var createParamNode = (name) => ({
  name,
  store: null,
  inert: null
});
var Memoirist = class _Memoirist {
  constructor(config = {}) {
    this.config = config;
    if (config.lazy)
      this.find = this.lazyFind;
    if (config.onParam && !Array.isArray(config.onParam))
      this.config.onParam = [
        this.config.onParam
      ];
  }
  root = {};
  history = [];
  deferred = [];
  static regex = {
    static: /:.+?(?=\/|$)/,
    params: /:.+?(?=\/|$)/g,
    optionalParams: /(\/:\w+\?)/g
  };
  lazyFind = (method, url) => {
    if (!this.config.lazy)
      return this.find;
    this.build();
    return this.find(method, url);
  };
  build() {
    if (!this.config.lazy)
      return;
    for (const [method, path, store] of this.deferred)
      this.add(method, path, store, { lazy: false, ignoreHistory: true });
    this.deferred = [];
    this.find = (method, url) => {
      const root = this.root[method];
      if (!root)
        return null;
      return matchRoute(
        url,
        url.length,
        root,
        0,
        this.config.onParam
      );
    };
  }
  add(method, path, store, {
    ignoreError = false,
    ignoreHistory = false,
    lazy = this.config.lazy
  } = {}) {
    if (lazy) {
      this.find = this.lazyFind;
      this.deferred.push([method, path, store]);
      return store;
    }
    if (typeof path !== "string")
      throw new TypeError("Route path must be a string");
    if (path === "")
      path = "/";
    else if (path[0] !== "/")
      path = `/${path}`;
    const isWildcard = path[path.length - 1] === "*";
    const optionalParams = path.match(_Memoirist.regex.optionalParams);
    if (optionalParams) {
      const originalPath = path.replaceAll("?", "");
      this.add(method, originalPath, store, {
        ignoreError,
        ignoreHistory,
        lazy
      });
      for (let i = 0; i < optionalParams.length; i++) {
        let newPath = path.replace(optionalParams[i], "");
        this.add(method, newPath, store, {
          ignoreError: true,
          ignoreHistory,
          lazy
        });
      }
      return store;
    }
    if (optionalParams)
      path = path.replaceAll("?", "");
    if (this.history.find(([m, p, s]) => m === method && p === path))
      return store;
    if (isWildcard || optionalParams && path.charCodeAt(path.length - 1) === 63)
      path = path.slice(0, -1);
    if (!ignoreHistory)
      this.history.push([method, path, store]);
    const inertParts = path.split(_Memoirist.regex.static);
    const paramParts = path.match(_Memoirist.regex.params) || [];
    if (inertParts[inertParts.length - 1] === "")
      inertParts.pop();
    let node;
    if (!this.root[method])
      node = this.root[method] = createNode("/");
    else
      node = this.root[method];
    let paramPartsIndex = 0;
    for (let i = 0; i < inertParts.length; ++i) {
      let part = inertParts[i];
      if (i > 0) {
        const param = paramParts[paramPartsIndex++].slice(1);
        if (node.params === null)
          node.params = createParamNode(param);
        else if (node.params.name !== param) {
          if (ignoreError)
            return store;
          else
            throw new Error(
              `Cannot create route "${path}" with parameter "${param}" because a route already exists with a different parameter name ("${node.params.name}") in the same location`
            );
        }
        const params = node.params;
        if (params.inert === null) {
          node = params.inert = createNode(part);
          continue;
        }
        node = params.inert;
      }
      for (let j = 0; ; ) {
        if (j === part.length) {
          if (j < node.part.length) {
            const childNode = cloneNode(node, node.part.slice(j));
            Object.assign(node, createNode(part, [childNode]));
          }
          break;
        }
        if (j === node.part.length) {
          if (node.inert === null)
            node.inert = {};
          const inert = node.inert[part.charCodeAt(j)];
          if (inert) {
            node = inert;
            part = part.slice(j);
            j = 0;
            continue;
          }
          const childNode = createNode(part.slice(j));
          node.inert[part.charCodeAt(j)] = childNode;
          node = childNode;
          break;
        }
        if (part[j] !== node.part[j]) {
          const existingChild = cloneNode(node, node.part.slice(j));
          const newChild = createNode(part.slice(j));
          Object.assign(
            node,
            createNode(node.part.slice(0, j), [
              existingChild,
              newChild
            ])
          );
          node = newChild;
          break;
        }
        ++j;
      }
    }
    if (paramPartsIndex < paramParts.length) {
      const param = paramParts[paramPartsIndex];
      const name = param.slice(1);
      if (node.params === null)
        node.params = createParamNode(name);
      else if (node.params.name !== name) {
        if (ignoreError)
          return store;
        else
          throw new Error(
            `Cannot create route "${path}" with parameter "${name}" because a route already exists with a different parameter name ("${node.params.name}") in the same location`
          );
      }
      if (node.params.store === null)
        node.params.store = store;
      return node.params.store;
    }
    if (isWildcard) {
      if (node.wildcardStore === null)
        node.wildcardStore = store;
      return node.wildcardStore;
    }
    if (node.store === null)
      node.store = store;
    return node.store;
  }
  find(method, url) {
    const root = this.root[method];
    if (!root)
      return null;
    return matchRoute(
      url,
      url.length,
      root,
      0,
      this.config.onParam
    );
  }
};
var matchRoute = (url, urlLength, node, startIndex, onParam) => {
  const part = node.part;
  const length = part.length;
  const endIndex = startIndex + length;
  if (length > 1) {
    if (endIndex > urlLength)
      return null;
    if (length < 15) {
      for (let i = 1, j = startIndex + 1; i < length; ++i, ++j)
        if (part.charCodeAt(i) !== url.charCodeAt(j))
          return null;
    } else if (url.slice(startIndex, endIndex) !== part)
      return null;
  }
  if (endIndex === urlLength) {
    if (node.store !== null)
      return {
        store: node.store,
        params: {}
      };
    if (node.wildcardStore !== null)
      return {
        store: node.wildcardStore,
        params: { "*": "" }
      };
    return null;
  }
  if (node.inert !== null) {
    const inert = node.inert[url.charCodeAt(endIndex)];
    if (inert !== void 0) {
      const route = matchRoute(url, urlLength, inert, endIndex, onParam);
      if (route !== null)
        return route;
    }
  }
  if (node.params !== null) {
    const { store, name, inert } = node.params;
    const slashIndex = url.indexOf("/", endIndex);
    if (slashIndex !== endIndex) {
      if (slashIndex === -1 || slashIndex >= urlLength) {
        if (store !== null) {
          const params = {};
          params[name] = url.substring(endIndex, urlLength);
          if (onParam)
            for (let i = 0; i < onParam.length; i++) {
              let temp = onParam[i](params[name], name);
              if (temp !== void 0)
                params[name] = temp;
            }
          return {
            store,
            params
          };
        }
      } else if (inert !== null) {
        const route = matchRoute(
          url,
          urlLength,
          inert,
          slashIndex,
          onParam
        );
        if (route !== null) {
          route.params[name] = url.substring(endIndex, slashIndex);
          if (onParam)
            for (let i = 0; i < onParam.length; i++) {
              let temp = onParam[i](route.params[name], name);
              if (temp !== void 0)
                route.params[name] = temp;
            }
          return route;
        }
      }
    }
  }
  if (node.wildcardStore !== null)
    return {
      store: node.wildcardStore,
      params: {
        "*": url.substring(endIndex, urlLength)
      }
    };
  return null;
};

// --------------------------------------------------------------------------
// PropertyKey
// --------------------------------------------------------------------------
/** Returns true if this value has this property key */
// --------------------------------------------------------------------------
// Object Instances
// --------------------------------------------------------------------------
/** Returns true if this value is an async iterator */
function IsAsyncIterator$4(value) {
    return IsObject$4(value) && !IsArray$4(value) && !IsUint8Array$4(value) && Symbol.asyncIterator in value;
}
/** Returns true if this value is an array */
function IsArray$4(value) {
    return Array.isArray(value);
}
/** Returns true if this value is bigint */
function IsBigInt$4(value) {
    return typeof value === 'bigint';
}
/** Returns true if this value is a boolean */
function IsBoolean$4(value) {
    return typeof value === 'boolean';
}
/** Returns true if this value is a Date object */
function IsDate$4(value) {
    return value instanceof globalThis.Date;
}
/** Returns true if this value is a function */
function IsFunction$4(value) {
    return typeof value === 'function';
}
/** Returns true if this value is an iterator */
function IsIterator$4(value) {
    return IsObject$4(value) && !IsArray$4(value) && !IsUint8Array$4(value) && Symbol.iterator in value;
}
/** Returns true if this value is null */
function IsNull$4(value) {
    return value === null;
}
/** Returns true if this value is number */
function IsNumber$4(value) {
    return typeof value === 'number';
}
/** Returns true if this value is an object */
function IsObject$4(value) {
    return typeof value === 'object' && value !== null;
}
/** Returns true if this value is RegExp */
function IsRegExp$3(value) {
    return value instanceof globalThis.RegExp;
}
/** Returns true if this value is string */
function IsString$4(value) {
    return typeof value === 'string';
}
/** Returns true if this value is symbol */
function IsSymbol$4(value) {
    return typeof value === 'symbol';
}
/** Returns true if this value is a Uint8Array */
function IsUint8Array$4(value) {
    return value instanceof globalThis.Uint8Array;
}
/** Returns true if this value is undefined */
function IsUndefined$4(value) {
    return value === undefined;
}

function ArrayType$1(value) {
    return value.map((value) => Visit$b(value));
}
function DateType$1(value) {
    return new Date(value.getTime());
}
function Uint8ArrayType$1(value) {
    return new Uint8Array(value);
}
function RegExpType(value) {
    return new RegExp(value.source, value.flags);
}
function ObjectType$1(value) {
    const result = {};
    for (const key of Object.getOwnPropertyNames(value)) {
        result[key] = Visit$b(value[key]);
    }
    for (const key of Object.getOwnPropertySymbols(value)) {
        result[key] = Visit$b(value[key]);
    }
    return result;
}
// prettier-ignore
function Visit$b(value) {
    return (IsArray$4(value) ? ArrayType$1(value) :
        IsDate$4(value) ? DateType$1(value) :
            IsUint8Array$4(value) ? Uint8ArrayType$1(value) :
                IsRegExp$3(value) ? RegExpType(value) :
                    IsObject$4(value) ? ObjectType$1(value) :
                        value);
}
/** Clones a value */
function Clone$1(value) {
    return Visit$b(value);
}

/** Clones a Type */
function CloneType(schema, options) {
    return options === undefined ? Clone$1(schema) : Clone$1({ ...options, ...schema });
}

// --------------------------------------------------------------------------
// Iterators
// --------------------------------------------------------------------------
/** Returns true if this value is an async iterator */
function IsAsyncIterator$3(value) {
    return IsObject$3(value) && globalThis.Symbol.asyncIterator in value;
}
/** Returns true if this value is an iterator */
function IsIterator$3(value) {
    return IsObject$3(value) && globalThis.Symbol.iterator in value;
}
// --------------------------------------------------------------------------
// JavaScript
// --------------------------------------------------------------------------
/** Returns true if this value is a Promise */
function IsPromise$3(value) {
    return value instanceof globalThis.Promise;
}
/** Returns true if this value is a Date */
function IsDate$3(value) {
    return value instanceof Date && globalThis.Number.isFinite(value.getTime());
}
/** Returns true if this value is an instance of Map<K, T> */
function IsMap(value) {
    return value instanceof globalThis.Map;
}
/** Returns true if this value is an instance of Set<T> */
function IsSet(value) {
    return value instanceof globalThis.Set;
}
/** Returns true if this value is a typed array */
function IsTypedArray(value) {
    return globalThis.ArrayBuffer.isView(value);
}
/** Returns true if the value is a Uint8Array */
function IsUint8Array$3(value) {
    return value instanceof globalThis.Uint8Array;
}
// --------------------------------------------------------------------------
// PropertyKey
// --------------------------------------------------------------------------
/** Returns true if this value has this property key */
function HasPropertyKey$1(value, key) {
    return key in value;
}
// --------------------------------------------------------------------------
// Standard
// --------------------------------------------------------------------------
/** Returns true of this value is an object type */
function IsObject$3(value) {
    return value !== null && typeof value === 'object';
}
/** Returns true if this value is an array, but not a typed array */
function IsArray$3(value) {
    return globalThis.Array.isArray(value) && !globalThis.ArrayBuffer.isView(value);
}
/** Returns true if this value is an undefined */
function IsUndefined$3(value) {
    return value === undefined;
}
/** Returns true if this value is an null */
function IsNull$3(value) {
    return value === null;
}
/** Returns true if this value is an boolean */
function IsBoolean$3(value) {
    return typeof value === 'boolean';
}
/** Returns true if this value is an number */
function IsNumber$3(value) {
    return typeof value === 'number';
}
/** Returns true if this value is an integer */
function IsInteger$3(value) {
    return globalThis.Number.isInteger(value);
}
/** Returns true if this value is bigint */
function IsBigInt$3(value) {
    return typeof value === 'bigint';
}
/** Returns true if this value is string */
function IsString$3(value) {
    return typeof value === 'string';
}
/** Returns true if this value is a function */
function IsFunction$3(value) {
    return typeof value === 'function';
}
/** Returns true if this value is a symbol */
function IsSymbol$3(value) {
    return typeof value === 'symbol';
}
/** Returns true if this value is a value type such as number, string, boolean */
function IsValueType(value) {
    // prettier-ignore
    return (IsBigInt$3(value) ||
        IsBoolean$3(value) ||
        IsNull$3(value) ||
        IsNumber$3(value) ||
        IsString$3(value) ||
        IsSymbol$3(value) ||
        IsUndefined$3(value));
}

var TypeSystemPolicy$1;
(function (TypeSystemPolicy) {
    // ------------------------------------------------------------------
    // TypeSystemPolicy: Instancing
    // ------------------------------------------------------------------
    /**
     * Configures the instantiation behavior of TypeBox types. The `default` option assigns raw JavaScript
     * references for embedded types, which may cause side effects if type properties are explicitly updated
     * outside the TypeBox type builder. The `clone` option creates copies of any shared types upon creation,
     * preventing unintended side effects. The `freeze` option applies `Object.freeze()` to the type, making
     * it fully readonly and immutable. Implementations should use `default` whenever possible, as it is the
     * fastest way to instantiate types. The default setting is `default`.
     */
    TypeSystemPolicy.InstanceMode = 'default';
    // ------------------------------------------------------------------
    // TypeSystemPolicy: Checking
    // ------------------------------------------------------------------
    /** Sets whether TypeBox should assert optional properties using the TypeScript `exactOptionalPropertyTypes` assertion policy. The default is `false` */
    TypeSystemPolicy.ExactOptionalPropertyTypes = false;
    /** Sets whether arrays should be treated as a kind of objects. The default is `false` */
    TypeSystemPolicy.AllowArrayObject = false;
    /** Sets whether `NaN` or `Infinity` should be treated as valid numeric values. The default is `false` */
    TypeSystemPolicy.AllowNaN = false;
    /** Sets whether `null` should validate for void types. The default is `false` */
    TypeSystemPolicy.AllowNullVoid = false;
    /** Checks this value using the ExactOptionalPropertyTypes policy */
    function IsExactOptionalProperty(value, key) {
        return TypeSystemPolicy.ExactOptionalPropertyTypes ? key in value : value[key] !== undefined;
    }
    TypeSystemPolicy.IsExactOptionalProperty = IsExactOptionalProperty;
    /** Checks this value using the AllowArrayObjects policy */
    function IsObjectLike(value) {
        const isObject = IsObject$3(value);
        return TypeSystemPolicy.AllowArrayObject ? isObject : isObject && !IsArray$3(value);
    }
    TypeSystemPolicy.IsObjectLike = IsObjectLike;
    /** Checks this value as a record using the AllowArrayObjects policy */
    function IsRecordLike(value) {
        return IsObjectLike(value) && !(value instanceof Date) && !(value instanceof Uint8Array);
    }
    TypeSystemPolicy.IsRecordLike = IsRecordLike;
    /** Checks this value using the AllowNaN policy */
    function IsNumberLike(value) {
        return TypeSystemPolicy.AllowNaN ? IsNumber$3(value) : Number.isFinite(value);
    }
    TypeSystemPolicy.IsNumberLike = IsNumberLike;
    /** Checks this value using the AllowVoidNull policy */
    function IsVoidLike(value) {
        const isUndefined = IsUndefined$3(value);
        return TypeSystemPolicy.AllowNullVoid ? isUndefined || value === null : isUndefined;
    }
    TypeSystemPolicy.IsVoidLike = IsVoidLike;
})(TypeSystemPolicy$1 || (TypeSystemPolicy$1 = {}));

function ImmutableArray(value) {
    return globalThis.Object.freeze(value).map((value) => Immutable(value));
}
function ImmutableDate(value) {
    return value;
}
function ImmutableUint8Array(value) {
    return value;
}
function ImmutableRegExp(value) {
    return value;
}
function ImmutableObject(value) {
    const result = {};
    for (const key of Object.getOwnPropertyNames(value)) {
        result[key] = Immutable(value[key]);
    }
    for (const key of Object.getOwnPropertySymbols(value)) {
        result[key] = Immutable(value[key]);
    }
    return globalThis.Object.freeze(result);
}
/** Specialized deep immutable value. Applies freeze recursively to the given value */
// prettier-ignore
function Immutable(value) {
    return (IsArray$4(value) ? ImmutableArray(value) :
        IsDate$4(value) ? ImmutableDate(value) :
            IsUint8Array$4(value) ? ImmutableUint8Array(value) :
                IsRegExp$3(value) ? ImmutableRegExp(value) :
                    IsObject$4(value) ? ImmutableObject(value) :
                        value);
}

/** Creates TypeBox schematics using the configured InstanceMode */
function CreateType(schema, options) {
    const result = options !== undefined ? { ...options, ...schema } : schema;
    switch (TypeSystemPolicy$1.InstanceMode) {
        case 'freeze':
            return Immutable(result);
        case 'clone':
            return Clone$1(result);
        default:
            return result;
    }
}

/** The base Error type thrown for all TypeBox exceptions  */
let TypeBoxError$1 = class TypeBoxError extends Error {
    constructor(message) {
        super(message);
    }
};

/** Symbol key applied to transform types */
const TransformKind$1 = Symbol.for('TypeBox.Transform');
/** Symbol key applied to readonly types */
const ReadonlyKind$1 = Symbol.for('TypeBox.Readonly');
/** Symbol key applied to optional types */
const OptionalKind$1 = Symbol.for('TypeBox.Optional');
/** Symbol key applied to types */
const Hint$2 = Symbol.for('TypeBox.Hint');
/** Symbol key applied to types */
const Kind$2 = Symbol.for('TypeBox.Kind');

/** `[Kind-Only]` Returns true if this value has a Readonly symbol */
function IsReadonly$1(value) {
    return IsObject$4(value) && value[ReadonlyKind$1] === 'Readonly';
}
/** `[Kind-Only]` Returns true if this value has a Optional symbol */
function IsOptional$2(value) {
    return IsObject$4(value) && value[OptionalKind$1] === 'Optional';
}
/** `[Kind-Only]` Returns true if the given value is TAny */
function IsAny$2(value) {
    return IsKindOf$2(value, 'Any');
}
/** `[Kind-Only]` Returns true if the given value is TArgument */
function IsArgument$2(value) {
    return IsKindOf$2(value, 'Argument');
}
/** `[Kind-Only]` Returns true if the given value is TArray */
function IsArray$2(value) {
    return IsKindOf$2(value, 'Array');
}
/** `[Kind-Only]` Returns true if the given value is TAsyncIterator */
function IsAsyncIterator$2(value) {
    return IsKindOf$2(value, 'AsyncIterator');
}
/** `[Kind-Only]` Returns true if the given value is TBigInt */
function IsBigInt$2(value) {
    return IsKindOf$2(value, 'BigInt');
}
/** `[Kind-Only]` Returns true if the given value is TBoolean */
function IsBoolean$2(value) {
    return IsKindOf$2(value, 'Boolean');
}
/** `[Kind-Only]` Returns true if the given value is TComputed */
function IsComputed$2(value) {
    return IsKindOf$2(value, 'Computed');
}
/** `[Kind-Only]` Returns true if the given value is TConstructor */
function IsConstructor$2(value) {
    return IsKindOf$2(value, 'Constructor');
}
/** `[Kind-Only]` Returns true if the given value is TDate */
function IsDate$2(value) {
    return IsKindOf$2(value, 'Date');
}
/** `[Kind-Only]` Returns true if the given value is TFunction */
function IsFunction$2(value) {
    return IsKindOf$2(value, 'Function');
}
/** `[Kind-Only]` Returns true if the given value is TInteger */
function IsInteger$2(value) {
    return IsKindOf$2(value, 'Integer');
}
/** `[Kind-Only]` Returns true if the given value is TIntersect */
function IsIntersect$2(value) {
    return IsKindOf$2(value, 'Intersect');
}
/** `[Kind-Only]` Returns true if the given value is TIterator */
function IsIterator$2(value) {
    return IsKindOf$2(value, 'Iterator');
}
/** `[Kind-Only]` Returns true if the given value is a TKind with the given name. */
function IsKindOf$2(value, kind) {
    return IsObject$4(value) && Kind$2 in value && value[Kind$2] === kind;
}
/** `[Kind-Only]` Returns true if the given value is TLiteralValue */
function IsLiteralValue$2(value) {
    return IsBoolean$4(value) || IsNumber$4(value) || IsString$4(value);
}
/** `[Kind-Only]` Returns true if the given value is TLiteral */
function IsLiteral$2(value) {
    return IsKindOf$2(value, 'Literal');
}
/** `[Kind-Only]` Returns true if the given value is a TMappedKey */
function IsMappedKey$2(value) {
    return IsKindOf$2(value, 'MappedKey');
}
/** `[Kind-Only]` Returns true if the given value is TMappedResult */
function IsMappedResult$2(value) {
    return IsKindOf$2(value, 'MappedResult');
}
/** `[Kind-Only]` Returns true if the given value is TNever */
function IsNever$2(value) {
    return IsKindOf$2(value, 'Never');
}
/** `[Kind-Only]` Returns true if the given value is TNot */
function IsNot$2(value) {
    return IsKindOf$2(value, 'Not');
}
/** `[Kind-Only]` Returns true if the given value is TNull */
function IsNull$2(value) {
    return IsKindOf$2(value, 'Null');
}
/** `[Kind-Only]` Returns true if the given value is TNumber */
function IsNumber$2(value) {
    return IsKindOf$2(value, 'Number');
}
/** `[Kind-Only]` Returns true if the given value is TObject */
function IsObject$2(value) {
    return IsKindOf$2(value, 'Object');
}
/** `[Kind-Only]` Returns true if the given value is TPromise */
function IsPromise$2(value) {
    return IsKindOf$2(value, 'Promise');
}
/** `[Kind-Only]` Returns true if the given value is TRecord */
function IsRecord$2(value) {
    return IsKindOf$2(value, 'Record');
}
/** `[Kind-Only]` Returns true if the given value is TRef */
function IsRef$2(value) {
    return IsKindOf$2(value, 'Ref');
}
/** `[Kind-Only]` Returns true if the given value is TRegExp */
function IsRegExp$2(value) {
    return IsKindOf$2(value, 'RegExp');
}
/** `[Kind-Only]` Returns true if the given value is TString */
function IsString$2(value) {
    return IsKindOf$2(value, 'String');
}
/** `[Kind-Only]` Returns true if the given value is TSymbol */
function IsSymbol$2(value) {
    return IsKindOf$2(value, 'Symbol');
}
/** `[Kind-Only]` Returns true if the given value is TTemplateLiteral */
function IsTemplateLiteral$2(value) {
    return IsKindOf$2(value, 'TemplateLiteral');
}
/** `[Kind-Only]` Returns true if the given value is TThis */
function IsThis$2(value) {
    return IsKindOf$2(value, 'This');
}
/** `[Kind-Only]` Returns true of this value is TTransform */
function IsTransform$2(value) {
    return IsObject$4(value) && TransformKind$1 in value;
}
/** `[Kind-Only]` Returns true if the given value is TTuple */
function IsTuple$2(value) {
    return IsKindOf$2(value, 'Tuple');
}
/** `[Kind-Only]` Returns true if the given value is TUndefined */
function IsUndefined$2(value) {
    return IsKindOf$2(value, 'Undefined');
}
/** `[Kind-Only]` Returns true if the given value is TUnion */
function IsUnion$2(value) {
    return IsKindOf$2(value, 'Union');
}
/** `[Kind-Only]` Returns true if the given value is TUint8Array */
function IsUint8Array$2(value) {
    return IsKindOf$2(value, 'Uint8Array');
}
/** `[Kind-Only]` Returns true if the given value is TUnknown */
function IsUnknown$2(value) {
    return IsKindOf$2(value, 'Unknown');
}
/** `[Kind-Only]` Returns true if the given value is a raw TUnsafe */
function IsUnsafe$2(value) {
    return IsKindOf$2(value, 'Unsafe');
}
/** `[Kind-Only]` Returns true if the given value is TVoid */
function IsVoid$2(value) {
    return IsKindOf$2(value, 'Void');
}
/** `[Kind-Only]` Returns true if the given value is TKind */
function IsKind$2(value) {
    return IsObject$4(value) && Kind$2 in value && IsString$4(value[Kind$2]);
}
/** `[Kind-Only]` Returns true if the given value is TSchema */
function IsSchema$2(value) {
    // prettier-ignore
    return (IsAny$2(value) ||
        IsArgument$2(value) ||
        IsArray$2(value) ||
        IsBoolean$2(value) ||
        IsBigInt$2(value) ||
        IsAsyncIterator$2(value) ||
        IsComputed$2(value) ||
        IsConstructor$2(value) ||
        IsDate$2(value) ||
        IsFunction$2(value) ||
        IsInteger$2(value) ||
        IsIntersect$2(value) ||
        IsIterator$2(value) ||
        IsLiteral$2(value) ||
        IsMappedKey$2(value) ||
        IsMappedResult$2(value) ||
        IsNever$2(value) ||
        IsNot$2(value) ||
        IsNull$2(value) ||
        IsNumber$2(value) ||
        IsObject$2(value) ||
        IsPromise$2(value) ||
        IsRecord$2(value) ||
        IsRef$2(value) ||
        IsRegExp$2(value) ||
        IsString$2(value) ||
        IsSymbol$2(value) ||
        IsTemplateLiteral$2(value) ||
        IsThis$2(value) ||
        IsTuple$2(value) ||
        IsUndefined$2(value) ||
        IsUnion$2(value) ||
        IsUint8Array$2(value) ||
        IsUnknown$2(value) ||
        IsUnsafe$2(value) ||
        IsVoid$2(value) ||
        IsKind$2(value));
}

const KnownTypes$1 = [
    'Argument',
    'Any',
    'Array',
    'AsyncIterator',
    'BigInt',
    'Boolean',
    'Computed',
    'Constructor',
    'Date',
    'Enum',
    'Function',
    'Integer',
    'Intersect',
    'Iterator',
    'Literal',
    'MappedKey',
    'MappedResult',
    'Not',
    'Null',
    'Number',
    'Object',
    'Promise',
    'Record',
    'Ref',
    'RegExp',
    'String',
    'Symbol',
    'TemplateLiteral',
    'This',
    'Tuple',
    'Undefined',
    'Union',
    'Uint8Array',
    'Unknown',
    'Void',
];
function IsPattern$1(value) {
    try {
        new RegExp(value);
        return true;
    }
    catch {
        return false;
    }
}
function IsControlCharacterFree$1(value) {
    if (!IsString$4(value))
        return false;
    for (let i = 0; i < value.length; i++) {
        const code = value.charCodeAt(i);
        if ((code >= 7 && code <= 13) || code === 27 || code === 127) {
            return false;
        }
    }
    return true;
}
function IsAdditionalProperties$1(value) {
    return IsOptionalBoolean$1(value) || IsSchema$1(value);
}
function IsOptionalBigInt$1(value) {
    return IsUndefined$4(value) || IsBigInt$4(value);
}
function IsOptionalNumber$1(value) {
    return IsUndefined$4(value) || IsNumber$4(value);
}
function IsOptionalBoolean$1(value) {
    return IsUndefined$4(value) || IsBoolean$4(value);
}
function IsOptionalString$1(value) {
    return IsUndefined$4(value) || IsString$4(value);
}
function IsOptionalPattern$1(value) {
    return IsUndefined$4(value) || (IsString$4(value) && IsControlCharacterFree$1(value) && IsPattern$1(value));
}
function IsOptionalFormat$1(value) {
    return IsUndefined$4(value) || (IsString$4(value) && IsControlCharacterFree$1(value));
}
function IsOptionalSchema$1(value) {
    return IsUndefined$4(value) || IsSchema$1(value);
}
/** Returns true if this value has a Optional symbol */
function IsOptional$1(value) {
    return IsObject$4(value) && value[OptionalKind$1] === 'Optional';
}
// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------
/** Returns true if the given value is TAny */
function IsAny$1(value) {
    // prettier-ignore
    return (IsKindOf$1(value, 'Any') &&
        IsOptionalString$1(value.$id));
}
/** Returns true if the given value is TArgument */
function IsArgument$1(value) {
    // prettier-ignore
    return (IsKindOf$1(value, 'Argument') &&
        IsNumber$4(value.index));
}
/** Returns true if the given value is TArray */
function IsArray$1(value) {
    return (IsKindOf$1(value, 'Array') &&
        value.type === 'array' &&
        IsOptionalString$1(value.$id) &&
        IsSchema$1(value.items) &&
        IsOptionalNumber$1(value.minItems) &&
        IsOptionalNumber$1(value.maxItems) &&
        IsOptionalBoolean$1(value.uniqueItems) &&
        IsOptionalSchema$1(value.contains) &&
        IsOptionalNumber$1(value.minContains) &&
        IsOptionalNumber$1(value.maxContains));
}
/** Returns true if the given value is TAsyncIterator */
function IsAsyncIterator$1(value) {
    // prettier-ignore
    return (IsKindOf$1(value, 'AsyncIterator') &&
        value.type === 'AsyncIterator' &&
        IsOptionalString$1(value.$id) &&
        IsSchema$1(value.items));
}
/** Returns true if the given value is TBigInt */
function IsBigInt$1(value) {
    // prettier-ignore
    return (IsKindOf$1(value, 'BigInt') &&
        value.type === 'bigint' &&
        IsOptionalString$1(value.$id) &&
        IsOptionalBigInt$1(value.exclusiveMaximum) &&
        IsOptionalBigInt$1(value.exclusiveMinimum) &&
        IsOptionalBigInt$1(value.maximum) &&
        IsOptionalBigInt$1(value.minimum) &&
        IsOptionalBigInt$1(value.multipleOf));
}
/** Returns true if the given value is TBoolean */
function IsBoolean$1(value) {
    // prettier-ignore
    return (IsKindOf$1(value, 'Boolean') &&
        value.type === 'boolean' &&
        IsOptionalString$1(value.$id));
}
/** Returns true if the given value is TComputed */
function IsComputed$1(value) {
    // prettier-ignore
    return (IsKindOf$1(value, 'Computed') &&
        IsString$4(value.target) &&
        IsArray$4(value.parameters) &&
        value.parameters.every((schema) => IsSchema$1(schema)));
}
/** Returns true if the given value is TConstructor */
function IsConstructor$1(value) {
    // prettier-ignore
    return (IsKindOf$1(value, 'Constructor') &&
        value.type === 'Constructor' &&
        IsOptionalString$1(value.$id) &&
        IsArray$4(value.parameters) &&
        value.parameters.every(schema => IsSchema$1(schema)) &&
        IsSchema$1(value.returns));
}
/** Returns true if the given value is TDate */
function IsDate$1(value) {
    return (IsKindOf$1(value, 'Date') &&
        value.type === 'Date' &&
        IsOptionalString$1(value.$id) &&
        IsOptionalNumber$1(value.exclusiveMaximumTimestamp) &&
        IsOptionalNumber$1(value.exclusiveMinimumTimestamp) &&
        IsOptionalNumber$1(value.maximumTimestamp) &&
        IsOptionalNumber$1(value.minimumTimestamp) &&
        IsOptionalNumber$1(value.multipleOfTimestamp));
}
/** Returns true if the given value is TFunction */
function IsFunction$1(value) {
    // prettier-ignore
    return (IsKindOf$1(value, 'Function') &&
        value.type === 'Function' &&
        IsOptionalString$1(value.$id) &&
        IsArray$4(value.parameters) &&
        value.parameters.every(schema => IsSchema$1(schema)) &&
        IsSchema$1(value.returns));
}
/** Returns true if the given value is TInteger */
function IsInteger$1(value) {
    return (IsKindOf$1(value, 'Integer') &&
        value.type === 'integer' &&
        IsOptionalString$1(value.$id) &&
        IsOptionalNumber$1(value.exclusiveMaximum) &&
        IsOptionalNumber$1(value.exclusiveMinimum) &&
        IsOptionalNumber$1(value.maximum) &&
        IsOptionalNumber$1(value.minimum) &&
        IsOptionalNumber$1(value.multipleOf));
}
/** Returns true if the given schema is TProperties */
function IsProperties$1(value) {
    // prettier-ignore
    return (IsObject$4(value) &&
        Object.entries(value).every(([key, schema]) => IsControlCharacterFree$1(key) && IsSchema$1(schema)));
}
/** Returns true if the given value is TIntersect */
function IsIntersect$1(value) {
    // prettier-ignore
    return (IsKindOf$1(value, 'Intersect') &&
        (IsString$4(value.type) && value.type !== 'object' ? false : true) &&
        IsArray$4(value.allOf) &&
        value.allOf.every(schema => IsSchema$1(schema) && !IsTransform$1(schema)) &&
        IsOptionalString$1(value.type) &&
        (IsOptionalBoolean$1(value.unevaluatedProperties) || IsOptionalSchema$1(value.unevaluatedProperties)) &&
        IsOptionalString$1(value.$id));
}
/** Returns true if the given value is TIterator */
function IsIterator$1(value) {
    // prettier-ignore
    return (IsKindOf$1(value, 'Iterator') &&
        value.type === 'Iterator' &&
        IsOptionalString$1(value.$id) &&
        IsSchema$1(value.items));
}
/** Returns true if the given value is a TKind with the given name. */
function IsKindOf$1(value, kind) {
    return IsObject$4(value) && Kind$2 in value && value[Kind$2] === kind;
}
/** Returns true if the given value is TLiteral<string> */
function IsLiteralString$1(value) {
    return IsLiteral$1(value) && IsString$4(value.const);
}
/** Returns true if the given value is TLiteral<number> */
function IsLiteralNumber$1(value) {
    return IsLiteral$1(value) && IsNumber$4(value.const);
}
/** Returns true if the given value is TLiteral<boolean> */
function IsLiteralBoolean$1(value) {
    return IsLiteral$1(value) && IsBoolean$4(value.const);
}
/** Returns true if the given value is TLiteral */
function IsLiteral$1(value) {
    // prettier-ignore
    return (IsKindOf$1(value, 'Literal') &&
        IsOptionalString$1(value.$id) && IsLiteralValue$1(value.const));
}
/** Returns true if the given value is a TLiteralValue */
function IsLiteralValue$1(value) {
    return IsBoolean$4(value) || IsNumber$4(value) || IsString$4(value);
}
/** Returns true if the given value is a TMappedKey */
function IsMappedKey$1(value) {
    // prettier-ignore
    return (IsKindOf$1(value, 'MappedKey') &&
        IsArray$4(value.keys) &&
        value.keys.every(key => IsNumber$4(key) || IsString$4(key)));
}
/** Returns true if the given value is TMappedResult */
function IsMappedResult$1(value) {
    // prettier-ignore
    return (IsKindOf$1(value, 'MappedResult') &&
        IsProperties$1(value.properties));
}
/** Returns true if the given value is TNever */
function IsNever$1(value) {
    // prettier-ignore
    return (IsKindOf$1(value, 'Never') &&
        IsObject$4(value.not) &&
        Object.getOwnPropertyNames(value.not).length === 0);
}
/** Returns true if the given value is TNot */
function IsNot$1(value) {
    // prettier-ignore
    return (IsKindOf$1(value, 'Not') &&
        IsSchema$1(value.not));
}
/** Returns true if the given value is TNull */
function IsNull$1(value) {
    // prettier-ignore
    return (IsKindOf$1(value, 'Null') &&
        value.type === 'null' &&
        IsOptionalString$1(value.$id));
}
/** Returns true if the given value is TNumber */
function IsNumber$1(value) {
    return (IsKindOf$1(value, 'Number') &&
        value.type === 'number' &&
        IsOptionalString$1(value.$id) &&
        IsOptionalNumber$1(value.exclusiveMaximum) &&
        IsOptionalNumber$1(value.exclusiveMinimum) &&
        IsOptionalNumber$1(value.maximum) &&
        IsOptionalNumber$1(value.minimum) &&
        IsOptionalNumber$1(value.multipleOf));
}
/** Returns true if the given value is TObject */
function IsObject$1(value) {
    // prettier-ignore
    return (IsKindOf$1(value, 'Object') &&
        value.type === 'object' &&
        IsOptionalString$1(value.$id) &&
        IsProperties$1(value.properties) &&
        IsAdditionalProperties$1(value.additionalProperties) &&
        IsOptionalNumber$1(value.minProperties) &&
        IsOptionalNumber$1(value.maxProperties));
}
/** Returns true if the given value is TPromise */
function IsPromise$1(value) {
    // prettier-ignore
    return (IsKindOf$1(value, 'Promise') &&
        value.type === 'Promise' &&
        IsOptionalString$1(value.$id) &&
        IsSchema$1(value.item));
}
/** Returns true if the given value is TRecord */
function IsRecord$1(value) {
    // prettier-ignore
    return (IsKindOf$1(value, 'Record') &&
        value.type === 'object' &&
        IsOptionalString$1(value.$id) &&
        IsAdditionalProperties$1(value.additionalProperties) &&
        IsObject$4(value.patternProperties) &&
        ((schema) => {
            const keys = Object.getOwnPropertyNames(schema.patternProperties);
            return (keys.length === 1 &&
                IsPattern$1(keys[0]) &&
                IsObject$4(schema.patternProperties) &&
                IsSchema$1(schema.patternProperties[keys[0]]));
        })(value));
}
/** Returns true if the given value is TRef */
function IsRef$1(value) {
    // prettier-ignore
    return (IsKindOf$1(value, 'Ref') &&
        IsOptionalString$1(value.$id) &&
        IsString$4(value.$ref));
}
/** Returns true if the given value is TRegExp */
function IsRegExp$1(value) {
    // prettier-ignore
    return (IsKindOf$1(value, 'RegExp') &&
        IsOptionalString$1(value.$id) &&
        IsString$4(value.source) &&
        IsString$4(value.flags) &&
        IsOptionalNumber$1(value.maxLength) &&
        IsOptionalNumber$1(value.minLength));
}
/** Returns true if the given value is TString */
function IsString$1(value) {
    // prettier-ignore
    return (IsKindOf$1(value, 'String') &&
        value.type === 'string' &&
        IsOptionalString$1(value.$id) &&
        IsOptionalNumber$1(value.minLength) &&
        IsOptionalNumber$1(value.maxLength) &&
        IsOptionalPattern$1(value.pattern) &&
        IsOptionalFormat$1(value.format));
}
/** Returns true if the given value is TSymbol */
function IsSymbol$1(value) {
    // prettier-ignore
    return (IsKindOf$1(value, 'Symbol') &&
        value.type === 'symbol' &&
        IsOptionalString$1(value.$id));
}
/** Returns true if the given value is TTemplateLiteral */
function IsTemplateLiteral$1(value) {
    // prettier-ignore
    return (IsKindOf$1(value, 'TemplateLiteral') &&
        value.type === 'string' &&
        IsString$4(value.pattern) &&
        value.pattern[0] === '^' &&
        value.pattern[value.pattern.length - 1] === '$');
}
/** Returns true if the given value is TThis */
function IsThis$1(value) {
    // prettier-ignore
    return (IsKindOf$1(value, 'This') &&
        IsOptionalString$1(value.$id) &&
        IsString$4(value.$ref));
}
/** Returns true of this value is TTransform */
function IsTransform$1(value) {
    return IsObject$4(value) && TransformKind$1 in value;
}
/** Returns true if the given value is TTuple */
function IsTuple$1(value) {
    // prettier-ignore
    return (IsKindOf$1(value, 'Tuple') &&
        value.type === 'array' &&
        IsOptionalString$1(value.$id) &&
        IsNumber$4(value.minItems) &&
        IsNumber$4(value.maxItems) &&
        value.minItems === value.maxItems &&
        (( // empty
        IsUndefined$4(value.items) &&
            IsUndefined$4(value.additionalItems) &&
            value.minItems === 0) || (IsArray$4(value.items) &&
            value.items.every(schema => IsSchema$1(schema)))));
}
/** Returns true if the given value is TUndefined */
function IsUndefined$1(value) {
    // prettier-ignore
    return (IsKindOf$1(value, 'Undefined') &&
        value.type === 'undefined' &&
        IsOptionalString$1(value.$id));
}
/** Returns true if the given value is TUnion */
function IsUnion$1(value) {
    // prettier-ignore
    return (IsKindOf$1(value, 'Union') &&
        IsOptionalString$1(value.$id) &&
        IsObject$4(value) &&
        IsArray$4(value.anyOf) &&
        value.anyOf.every(schema => IsSchema$1(schema)));
}
/** Returns true if the given value is TUint8Array */
function IsUint8Array$1(value) {
    // prettier-ignore
    return (IsKindOf$1(value, 'Uint8Array') &&
        value.type === 'Uint8Array' &&
        IsOptionalString$1(value.$id) &&
        IsOptionalNumber$1(value.minByteLength) &&
        IsOptionalNumber$1(value.maxByteLength));
}
/** Returns true if the given value is TUnknown */
function IsUnknown$1(value) {
    // prettier-ignore
    return (IsKindOf$1(value, 'Unknown') &&
        IsOptionalString$1(value.$id));
}
/** Returns true if the given value is a raw TUnsafe */
function IsUnsafe$1(value) {
    return IsKindOf$1(value, 'Unsafe');
}
/** Returns true if the given value is TVoid */
function IsVoid$1(value) {
    // prettier-ignore
    return (IsKindOf$1(value, 'Void') &&
        value.type === 'void' &&
        IsOptionalString$1(value.$id));
}
/** Returns true if the given value is TKind */
function IsKind$1(value) {
    return IsObject$4(value) && Kind$2 in value && IsString$4(value[Kind$2]) && !KnownTypes$1.includes(value[Kind$2]);
}
/** Returns true if the given value is TSchema */
function IsSchema$1(value) {
    // prettier-ignore
    return (IsObject$4(value)) && (IsAny$1(value) ||
        IsArgument$1(value) ||
        IsArray$1(value) ||
        IsBoolean$1(value) ||
        IsBigInt$1(value) ||
        IsAsyncIterator$1(value) ||
        IsComputed$1(value) ||
        IsConstructor$1(value) ||
        IsDate$1(value) ||
        IsFunction$1(value) ||
        IsInteger$1(value) ||
        IsIntersect$1(value) ||
        IsIterator$1(value) ||
        IsLiteral$1(value) ||
        IsMappedKey$1(value) ||
        IsMappedResult$1(value) ||
        IsNever$1(value) ||
        IsNot$1(value) ||
        IsNull$1(value) ||
        IsNumber$1(value) ||
        IsObject$1(value) ||
        IsPromise$1(value) ||
        IsRecord$1(value) ||
        IsRef$1(value) ||
        IsRegExp$1(value) ||
        IsString$1(value) ||
        IsSymbol$1(value) ||
        IsTemplateLiteral$1(value) ||
        IsThis$1(value) ||
        IsTuple$1(value) ||
        IsUndefined$1(value) ||
        IsUnion$1(value) ||
        IsUint8Array$1(value) ||
        IsUnknown$1(value) ||
        IsUnsafe$1(value) ||
        IsVoid$1(value) ||
        IsKind$1(value));
}

const PatternBoolean = '(true|false)';
const PatternNumber = '(0|[1-9][0-9]*)';
const PatternString = '(.*)';
const PatternNever = '(?!.*)';
const PatternNumberExact = `^${PatternNumber}$`;
const PatternStringExact = `^${PatternString}$`;
const PatternNeverExact = `^${PatternNever}$`;

/** A registry for user defined string formats */
const map$2 = new Map();
/** Returns true if the user defined string format exists */
function Has$2(format) {
    return map$2.has(format);
}
/** Sets a validation function for a user defined string format */
function Set$2(format, func) {
    map$2.set(format, func);
}
/** Gets a validation function for a user defined string format */
function Get$2(format) {
    return map$2.get(format);
}

/** A registry for user defined types */
const map$1 = new Map();
/** Returns true if this registry contains this kind */
function Has$1(kind) {
    return map$1.has(kind);
}
/** Sets a validation function for a user defined type */
function Set$1(kind, func) {
    map$1.set(kind, func);
}
/** Gets a custom validation function for a user defined type */
function Get$1(kind) {
    return map$1.get(kind);
}

/** Returns true if element right is in the set of left */
// prettier-ignore
function SetIncludes(T, S) {
    return T.includes(S);
}
/** Returns a distinct set of elements */
function SetDistinct(T) {
    return [...new Set(T)];
}
/** Returns the Intersect of the given sets */
function SetIntersect(T, S) {
    return T.filter((L) => S.includes(L));
}
// prettier-ignore
function SetIntersectManyResolve(T, Init) {
    return T.reduce((Acc, L) => {
        return SetIntersect(Acc, L);
    }, Init);
}
// prettier-ignore
function SetIntersectMany(T) {
    return (T.length === 1
        ? T[0]
        // Use left to initialize the accumulator for resolve
        : T.length > 1
            ? SetIntersectManyResolve(T.slice(1), T[0])
            : []);
}
/** Returns the Union of multiple sets */
function SetUnionMany(T) {
    const Acc = [];
    for (const L of T)
        Acc.push(...L);
    return Acc;
}

/** `[Json]` Creates an Any type */
function Any(options) {
    return CreateType({ [Kind$2]: 'Any' }, options);
}

/** `[Json]` Creates an Array type */
function Array$1(items, options) {
    return CreateType({ [Kind$2]: 'Array', type: 'array', items }, options);
}

/** `[JavaScript]` Creates an Argument Type. */
function Argument(index) {
    return CreateType({ [Kind$2]: 'Argument', index });
}

/** `[JavaScript]` Creates a AsyncIterator type */
function AsyncIterator(items, options) {
    return CreateType({ [Kind$2]: 'AsyncIterator', type: 'AsyncIterator', items }, options);
}

/** `[Internal]` Creates a deferred computed type. This type is used exclusively in modules to defer resolution of computable types that contain interior references  */
function Computed(target, parameters, options) {
    return CreateType({ [Kind$2]: 'Computed', target, parameters }, options);
}

function DiscardKey(value, key) {
    const { [key]: _, ...rest } = value;
    return rest;
}
/** Discards property keys from the given value. This function returns a shallow Clone. */
function Discard(value, keys) {
    return keys.reduce((acc, key) => DiscardKey(acc, key), value);
}

/** `[Json]` Creates a Never type */
function Never(options) {
    return CreateType({ [Kind$2]: 'Never', not: {} }, options);
}

// prettier-ignore
function MappedResult(properties) {
    return CreateType({
        [Kind$2]: 'MappedResult',
        properties
    });
}

/** `[JavaScript]` Creates a Constructor type */
function Constructor(parameters, returns, options) {
    return CreateType({ [Kind$2]: 'Constructor', type: 'Constructor', parameters, returns }, options);
}

/** `[JavaScript]` Creates a Function type */
function Function$1(parameters, returns, options) {
    return CreateType({ [Kind$2]: 'Function', type: 'Function', parameters, returns }, options);
}

function UnionCreate(T, options) {
    return CreateType({ [Kind$2]: 'Union', anyOf: T }, options);
}

// prettier-ignore
function IsUnionOptional(types) {
    return types.some(type => IsOptional$2(type));
}
// prettier-ignore
function RemoveOptionalFromRest$1(types) {
    return types.map(left => IsOptional$2(left) ? RemoveOptionalFromType$1(left) : left);
}
// prettier-ignore
function RemoveOptionalFromType$1(T) {
    return (Discard(T, [OptionalKind$1]));
}
// prettier-ignore
function ResolveUnion(types, options) {
    const isOptional = IsUnionOptional(types);
    return (isOptional
        ? Optional(UnionCreate(RemoveOptionalFromRest$1(types), options))
        : UnionCreate(RemoveOptionalFromRest$1(types), options));
}
/** `[Json]` Creates an evaluated Union type */
function UnionEvaluated(T, options) {
    // prettier-ignore
    return (T.length === 1 ? CreateType(T[0], options) :
        T.length === 0 ? Never(options) :
            ResolveUnion(T, options));
}

/** `[Json]` Creates a Union type */
function Union$1(types, options) {
    // prettier-ignore
    return (types.length === 0 ? Never(options) :
        types.length === 1 ? CreateType(types[0], options) :
            UnionCreate(types, options));
}

// ------------------------------------------------------------------
// TemplateLiteralParserError
// ------------------------------------------------------------------
class TemplateLiteralParserError extends TypeBoxError$1 {
}
// -------------------------------------------------------------------
// Unescape
//
// Unescape for these control characters specifically. Note that this
// function is only called on non union group content, and where we
// still want to allow the user to embed control characters in that
// content. For review.
// -------------------------------------------------------------------
// prettier-ignore
function Unescape(pattern) {
    return pattern
        .replace(/\\\$/g, '$')
        .replace(/\\\*/g, '*')
        .replace(/\\\^/g, '^')
        .replace(/\\\|/g, '|')
        .replace(/\\\(/g, '(')
        .replace(/\\\)/g, ')');
}
// -------------------------------------------------------------------
// Control Characters
// -------------------------------------------------------------------
function IsNonEscaped(pattern, index, char) {
    return pattern[index] === char && pattern.charCodeAt(index - 1) !== 92;
}
function IsOpenParen(pattern, index) {
    return IsNonEscaped(pattern, index, '(');
}
function IsCloseParen(pattern, index) {
    return IsNonEscaped(pattern, index, ')');
}
function IsSeparator(pattern, index) {
    return IsNonEscaped(pattern, index, '|');
}
// -------------------------------------------------------------------
// Control Groups
// -------------------------------------------------------------------
function IsGroup(pattern) {
    if (!(IsOpenParen(pattern, 0) && IsCloseParen(pattern, pattern.length - 1)))
        return false;
    let count = 0;
    for (let index = 0; index < pattern.length; index++) {
        if (IsOpenParen(pattern, index))
            count += 1;
        if (IsCloseParen(pattern, index))
            count -= 1;
        if (count === 0 && index !== pattern.length - 1)
            return false;
    }
    return true;
}
// prettier-ignore
function InGroup(pattern) {
    return pattern.slice(1, pattern.length - 1);
}
// prettier-ignore
function IsPrecedenceOr(pattern) {
    let count = 0;
    for (let index = 0; index < pattern.length; index++) {
        if (IsOpenParen(pattern, index))
            count += 1;
        if (IsCloseParen(pattern, index))
            count -= 1;
        if (IsSeparator(pattern, index) && count === 0)
            return true;
    }
    return false;
}
// prettier-ignore
function IsPrecedenceAnd(pattern) {
    for (let index = 0; index < pattern.length; index++) {
        if (IsOpenParen(pattern, index))
            return true;
    }
    return false;
}
// prettier-ignore
function Or(pattern) {
    let [count, start] = [0, 0];
    const expressions = [];
    for (let index = 0; index < pattern.length; index++) {
        if (IsOpenParen(pattern, index))
            count += 1;
        if (IsCloseParen(pattern, index))
            count -= 1;
        if (IsSeparator(pattern, index) && count === 0) {
            const range = pattern.slice(start, index);
            if (range.length > 0)
                expressions.push(TemplateLiteralParse(range));
            start = index + 1;
        }
    }
    const range = pattern.slice(start);
    if (range.length > 0)
        expressions.push(TemplateLiteralParse(range));
    if (expressions.length === 0)
        return { type: 'const', const: '' };
    if (expressions.length === 1)
        return expressions[0];
    return { type: 'or', expr: expressions };
}
// prettier-ignore
function And(pattern) {
    function Group(value, index) {
        if (!IsOpenParen(value, index))
            throw new TemplateLiteralParserError(`TemplateLiteralParser: Index must point to open parens`);
        let count = 0;
        for (let scan = index; scan < value.length; scan++) {
            if (IsOpenParen(value, scan))
                count += 1;
            if (IsCloseParen(value, scan))
                count -= 1;
            if (count === 0)
                return [index, scan];
        }
        throw new TemplateLiteralParserError(`TemplateLiteralParser: Unclosed group parens in expression`);
    }
    function Range(pattern, index) {
        for (let scan = index; scan < pattern.length; scan++) {
            if (IsOpenParen(pattern, scan))
                return [index, scan];
        }
        return [index, pattern.length];
    }
    const expressions = [];
    for (let index = 0; index < pattern.length; index++) {
        if (IsOpenParen(pattern, index)) {
            const [start, end] = Group(pattern, index);
            const range = pattern.slice(start, end + 1);
            expressions.push(TemplateLiteralParse(range));
            index = end;
        }
        else {
            const [start, end] = Range(pattern, index);
            const range = pattern.slice(start, end);
            if (range.length > 0)
                expressions.push(TemplateLiteralParse(range));
            index = end - 1;
        }
    }
    return ((expressions.length === 0) ? { type: 'const', const: '' } :
        (expressions.length === 1) ? expressions[0] :
            { type: 'and', expr: expressions });
}
// ------------------------------------------------------------------
// TemplateLiteralParse
// ------------------------------------------------------------------
/** Parses a pattern and returns an expression tree */
function TemplateLiteralParse(pattern) {
    // prettier-ignore
    return (IsGroup(pattern) ? TemplateLiteralParse(InGroup(pattern)) :
        IsPrecedenceOr(pattern) ? Or(pattern) :
            IsPrecedenceAnd(pattern) ? And(pattern) :
                { type: 'const', const: Unescape(pattern) });
}
// ------------------------------------------------------------------
// TemplateLiteralParseExact
// ------------------------------------------------------------------
/** Parses a pattern and strips forward and trailing ^ and $ */
function TemplateLiteralParseExact(pattern) {
    return TemplateLiteralParse(pattern.slice(1, pattern.length - 1));
}

// ------------------------------------------------------------------
// TemplateLiteralFiniteError
// ------------------------------------------------------------------
class TemplateLiteralFiniteError extends TypeBoxError$1 {
}
// ------------------------------------------------------------------
// IsTemplateLiteralFiniteCheck
// ------------------------------------------------------------------
// prettier-ignore
function IsNumberExpression(expression) {
    return (expression.type === 'or' &&
        expression.expr.length === 2 &&
        expression.expr[0].type === 'const' &&
        expression.expr[0].const === '0' &&
        expression.expr[1].type === 'const' &&
        expression.expr[1].const === '[1-9][0-9]*');
}
// prettier-ignore
function IsBooleanExpression(expression) {
    return (expression.type === 'or' &&
        expression.expr.length === 2 &&
        expression.expr[0].type === 'const' &&
        expression.expr[0].const === 'true' &&
        expression.expr[1].type === 'const' &&
        expression.expr[1].const === 'false');
}
// prettier-ignore
function IsStringExpression(expression) {
    return expression.type === 'const' && expression.const === '.*';
}
// ------------------------------------------------------------------
// IsTemplateLiteralExpressionFinite
// ------------------------------------------------------------------
// prettier-ignore
function IsTemplateLiteralExpressionFinite(expression) {
    return (IsNumberExpression(expression) || IsStringExpression(expression) ? false :
        IsBooleanExpression(expression) ? true :
            (expression.type === 'and') ? expression.expr.every((expr) => IsTemplateLiteralExpressionFinite(expr)) :
                (expression.type === 'or') ? expression.expr.every((expr) => IsTemplateLiteralExpressionFinite(expr)) :
                    (expression.type === 'const') ? true :
                        (() => { throw new TemplateLiteralFiniteError(`Unknown expression type`); })());
}
/** Returns true if this TemplateLiteral resolves to a finite set of values */
function IsTemplateLiteralFinite(schema) {
    const expression = TemplateLiteralParseExact(schema.pattern);
    return IsTemplateLiteralExpressionFinite(expression);
}

// ------------------------------------------------------------------
// TemplateLiteralGenerateError
// ------------------------------------------------------------------
class TemplateLiteralGenerateError extends TypeBoxError$1 {
}
// ------------------------------------------------------------------
// TemplateLiteralExpressionGenerate
// ------------------------------------------------------------------
// prettier-ignore
function* GenerateReduce(buffer) {
    if (buffer.length === 1)
        return yield* buffer[0];
    for (const left of buffer[0]) {
        for (const right of GenerateReduce(buffer.slice(1))) {
            yield `${left}${right}`;
        }
    }
}
// prettier-ignore
function* GenerateAnd(expression) {
    return yield* GenerateReduce(expression.expr.map((expr) => [...TemplateLiteralExpressionGenerate(expr)]));
}
// prettier-ignore
function* GenerateOr(expression) {
    for (const expr of expression.expr)
        yield* TemplateLiteralExpressionGenerate(expr);
}
// prettier-ignore
function* GenerateConst(expression) {
    return yield expression.const;
}
function* TemplateLiteralExpressionGenerate(expression) {
    return expression.type === 'and'
        ? yield* GenerateAnd(expression)
        : expression.type === 'or'
            ? yield* GenerateOr(expression)
            : expression.type === 'const'
                ? yield* GenerateConst(expression)
                : (() => {
                    throw new TemplateLiteralGenerateError('Unknown expression');
                })();
}
/** Generates a tuple of strings from the given TemplateLiteral. Returns an empty tuple if infinite. */
function TemplateLiteralGenerate(schema) {
    const expression = TemplateLiteralParseExact(schema.pattern);
    // prettier-ignore
    return (IsTemplateLiteralExpressionFinite(expression)
        ? [...TemplateLiteralExpressionGenerate(expression)]
        : []);
}

/** `[Json]` Creates a Literal type */
function Literal(value, options) {
    return CreateType({
        [Kind$2]: 'Literal',
        const: value,
        type: typeof value,
    }, options);
}

/** `[Json]` Creates a Boolean type */
function Boolean$1(options) {
    return CreateType({ [Kind$2]: 'Boolean', type: 'boolean' }, options);
}

/** `[JavaScript]` Creates a BigInt type */
function BigInt$1(options) {
    return CreateType({ [Kind$2]: 'BigInt', type: 'bigint' }, options);
}

/** `[Json]` Creates a Number type */
function Number$1(options) {
    return CreateType({ [Kind$2]: 'Number', type: 'number' }, options);
}

/** `[Json]` Creates a String type */
function String$1(options) {
    return CreateType({ [Kind$2]: 'String', type: 'string' }, options);
}

// ------------------------------------------------------------------
// SyntaxParsers
// ------------------------------------------------------------------
// prettier-ignore
function* FromUnion$h(syntax) {
    const trim = syntax.trim().replace(/"|'/g, '');
    return (trim === 'boolean' ? yield Boolean$1() :
        trim === 'number' ? yield Number$1() :
            trim === 'bigint' ? yield BigInt$1() :
                trim === 'string' ? yield String$1() :
                    yield (() => {
                        const literals = trim.split('|').map((literal) => Literal(literal.trim()));
                        return (literals.length === 0 ? Never() :
                            literals.length === 1 ? literals[0] :
                                UnionEvaluated(literals));
                    })());
}
// prettier-ignore
function* FromTerminal(syntax) {
    if (syntax[1] !== '{') {
        const L = Literal('$');
        const R = FromSyntax(syntax.slice(1));
        return yield* [L, ...R];
    }
    for (let i = 2; i < syntax.length; i++) {
        if (syntax[i] === '}') {
            const L = FromUnion$h(syntax.slice(2, i));
            const R = FromSyntax(syntax.slice(i + 1));
            return yield* [...L, ...R];
        }
    }
    yield Literal(syntax);
}
// prettier-ignore
function* FromSyntax(syntax) {
    for (let i = 0; i < syntax.length; i++) {
        if (syntax[i] === '$') {
            const L = Literal(syntax.slice(0, i));
            const R = FromTerminal(syntax.slice(i));
            return yield* [L, ...R];
        }
    }
    yield Literal(syntax);
}
/** Parses TemplateLiteralSyntax and returns a tuple of TemplateLiteralKinds */
function TemplateLiteralSyntax(syntax) {
    return [...FromSyntax(syntax)];
}

// ------------------------------------------------------------------
// TemplateLiteralPatternError
// ------------------------------------------------------------------
class TemplateLiteralPatternError extends TypeBoxError$1 {
}
// ------------------------------------------------------------------
// TemplateLiteralPattern
// ------------------------------------------------------------------
function Escape(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
// prettier-ignore
function Visit$a(schema, acc) {
    return (IsTemplateLiteral$2(schema) ? schema.pattern.slice(1, schema.pattern.length - 1) :
        IsUnion$2(schema) ? `(${schema.anyOf.map((schema) => Visit$a(schema, acc)).join('|')})` :
            IsNumber$2(schema) ? `${acc}${PatternNumber}` :
                IsInteger$2(schema) ? `${acc}${PatternNumber}` :
                    IsBigInt$2(schema) ? `${acc}${PatternNumber}` :
                        IsString$2(schema) ? `${acc}${PatternString}` :
                            IsLiteral$2(schema) ? `${acc}${Escape(schema.const.toString())}` :
                                IsBoolean$2(schema) ? `${acc}${PatternBoolean}` :
                                    (() => { throw new TemplateLiteralPatternError(`Unexpected Kind '${schema[Kind$2]}'`); })());
}
function TemplateLiteralPattern(kinds) {
    return `^${kinds.map((schema) => Visit$a(schema, '')).join('')}\$`;
}

/** Returns a Union from the given TemplateLiteral */
function TemplateLiteralToUnion(schema) {
    const R = TemplateLiteralGenerate(schema);
    const L = R.map((S) => Literal(S));
    return UnionEvaluated(L);
}

/** `[Json]` Creates a TemplateLiteral type */
// prettier-ignore
function TemplateLiteral(unresolved, options) {
    const pattern = IsString$4(unresolved)
        ? TemplateLiteralPattern(TemplateLiteralSyntax(unresolved))
        : TemplateLiteralPattern(unresolved);
    return CreateType({ [Kind$2]: 'TemplateLiteral', type: 'string', pattern }, options);
}

// prettier-ignore
function FromTemplateLiteral$5(templateLiteral) {
    const keys = TemplateLiteralGenerate(templateLiteral);
    return keys.map(key => key.toString());
}
// prettier-ignore
function FromUnion$g(types) {
    const result = [];
    for (const type of types)
        result.push(...IndexPropertyKeys(type));
    return result;
}
// prettier-ignore
function FromLiteral$4(literalValue) {
    return ([literalValue.toString()] // TS 5.4 observes TLiteralValue as not having a toString()
    );
}
/** Returns a tuple of PropertyKeys derived from the given TSchema */
// prettier-ignore
function IndexPropertyKeys(type) {
    return [...new Set((IsTemplateLiteral$2(type) ? FromTemplateLiteral$5(type) :
            IsUnion$2(type) ? FromUnion$g(type.anyOf) :
                IsLiteral$2(type) ? FromLiteral$4(type.const) :
                    IsNumber$2(type) ? ['[number]'] :
                        IsInteger$2(type) ? ['[number]'] :
                            []))];
}

// prettier-ignore
function FromProperties$i(type, properties, options) {
    const result = {};
    for (const K2 of Object.getOwnPropertyNames(properties)) {
        result[K2] = Index(type, IndexPropertyKeys(properties[K2]), options);
    }
    return result;
}
// prettier-ignore
function FromMappedResult$b(type, mappedResult, options) {
    return FromProperties$i(type, mappedResult.properties, options);
}
// prettier-ignore
function IndexFromMappedResult(type, mappedResult, options) {
    const properties = FromMappedResult$b(type, mappedResult, options);
    return MappedResult(properties);
}

// prettier-ignore
function FromRest$6(types, key) {
    return types.map(type => IndexFromPropertyKey(type, key));
}
// prettier-ignore
function FromIntersectRest(types) {
    return types.filter(type => !IsNever$2(type));
}
// prettier-ignore
function FromIntersect$f(types, key) {
    return (IntersectEvaluated(FromIntersectRest(FromRest$6(types, key))));
}
// prettier-ignore
function FromUnionRest(types) {
    return (types.some(L => IsNever$2(L))
        ? []
        : types);
}
// prettier-ignore
function FromUnion$f(types, key) {
    return (UnionEvaluated(FromUnionRest(FromRest$6(types, key))));
}
// prettier-ignore
function FromTuple$c(types, key) {
    return (key in types ? types[key] :
        key === '[number]' ? UnionEvaluated(types) :
            Never());
}
// prettier-ignore
function FromArray$e(type, key) {
    return (key === '[number]'
        ? type
        : Never());
}
// prettier-ignore
function FromProperty$2(properties, propertyKey) {
    return (propertyKey in properties ? properties[propertyKey] : Never());
}
// prettier-ignore
function IndexFromPropertyKey(type, propertyKey) {
    return (IsIntersect$2(type) ? FromIntersect$f(type.allOf, propertyKey) :
        IsUnion$2(type) ? FromUnion$f(type.anyOf, propertyKey) :
            IsTuple$2(type) ? FromTuple$c(type.items ?? [], propertyKey) :
                IsArray$2(type) ? FromArray$e(type.items, propertyKey) :
                    IsObject$2(type) ? FromProperty$2(type.properties, propertyKey) :
                        Never());
}
// prettier-ignore
function IndexFromPropertyKeys(type, propertyKeys) {
    return propertyKeys.map(propertyKey => IndexFromPropertyKey(type, propertyKey));
}
// prettier-ignore
function FromSchema(type, propertyKeys) {
    return (UnionEvaluated(IndexFromPropertyKeys(type, propertyKeys)));
}
/** `[Json]` Returns an Indexed property type for the given keys */
function Index(type, key, options) {
    // computed-type
    if (IsRef$2(type) || IsRef$2(key)) {
        const error = `Index types using Ref parameters require both Type and Key to be of TSchema`;
        if (!IsSchema$2(type) || !IsSchema$2(key))
            throw new TypeBoxError$1(error);
        return Computed('Index', [type, key]);
    }
    // mapped-types
    if (IsMappedResult$2(key))
        return IndexFromMappedResult(type, key, options);
    if (IsMappedKey$2(key))
        return IndexFromMappedKey(type, key, options);
    // prettier-ignore
    return CreateType(IsSchema$2(key)
        ? FromSchema(type, IndexPropertyKeys(key))
        : FromSchema(type, key), options);
}

// prettier-ignore
function MappedIndexPropertyKey(type, key, options) {
    return { [key]: Index(type, [key], Clone$1(options)) };
}
// prettier-ignore
function MappedIndexPropertyKeys(type, propertyKeys, options) {
    return propertyKeys.reduce((result, left) => {
        return { ...result, ...MappedIndexPropertyKey(type, left, options) };
    }, {});
}
// prettier-ignore
function MappedIndexProperties(type, mappedKey, options) {
    return MappedIndexPropertyKeys(type, mappedKey.keys, options);
}
// prettier-ignore
function IndexFromMappedKey(type, mappedKey, options) {
    const properties = MappedIndexProperties(type, mappedKey, options);
    return MappedResult(properties);
}

/** `[JavaScript]` Creates an Iterator type */
function Iterator(items, options) {
    return CreateType({ [Kind$2]: 'Iterator', type: 'Iterator', items }, options);
}

/** Creates a RequiredArray derived from the given TProperties value. */
function RequiredArray(properties) {
    return globalThis.Object.keys(properties).filter((key) => !IsOptional$2(properties[key]));
}
/** `[Json]` Creates an Object type */
function _Object(properties, options) {
    const required = RequiredArray(properties);
    const schema = required.length > 0 ? { [Kind$2]: 'Object', type: 'object', required, properties } : { [Kind$2]: 'Object', type: 'object', properties };
    return CreateType(schema, options);
}
/** `[Json]` Creates an Object type */
var Object$1 = _Object;

/** `[JavaScript]` Creates a Promise type */
function Promise$1(item, options) {
    return CreateType({ [Kind$2]: 'Promise', type: 'Promise', item }, options);
}

function RemoveReadonly(schema) {
    return CreateType(Discard(schema, [ReadonlyKind$1]));
}
function AddReadonly(schema) {
    return CreateType({ ...schema, [ReadonlyKind$1]: 'Readonly' });
}
// prettier-ignore
function ReadonlyWithFlag(schema, F) {
    return (F === false
        ? RemoveReadonly(schema)
        : AddReadonly(schema));
}
/** `[Json]` Creates a Readonly property */
function Readonly(schema, enable) {
    const F = enable ?? true;
    return IsMappedResult$2(schema) ? ReadonlyFromMappedResult(schema, F) : ReadonlyWithFlag(schema, F);
}

// prettier-ignore
function FromProperties$h(K, F) {
    const Acc = {};
    for (const K2 of globalThis.Object.getOwnPropertyNames(K))
        Acc[K2] = Readonly(K[K2], F);
    return Acc;
}
// prettier-ignore
function FromMappedResult$a(R, F) {
    return FromProperties$h(R.properties, F);
}
// prettier-ignore
function ReadonlyFromMappedResult(R, F) {
    const P = FromMappedResult$a(R, F);
    return MappedResult(P);
}

/** `[Json]` Creates a Tuple type */
function Tuple(types, options) {
    // prettier-ignore
    return CreateType(types.length > 0 ?
        { [Kind$2]: 'Tuple', type: 'array', items: types, additionalItems: false, minItems: types.length, maxItems: types.length } :
        { [Kind$2]: 'Tuple', type: 'array', minItems: types.length, maxItems: types.length }, options);
}

// prettier-ignore
function FromMappedResult$9(K, P) {
    return (K in P
        ? FromSchemaType(K, P[K])
        : MappedResult(P));
}
// prettier-ignore
function MappedKeyToKnownMappedResultProperties(K) {
    return { [K]: Literal(K) };
}
// prettier-ignore
function MappedKeyToUnknownMappedResultProperties(P) {
    const Acc = {};
    for (const L of P)
        Acc[L] = Literal(L);
    return Acc;
}
// prettier-ignore
function MappedKeyToMappedResultProperties(K, P) {
    return (SetIncludes(P, K)
        ? MappedKeyToKnownMappedResultProperties(K)
        : MappedKeyToUnknownMappedResultProperties(P));
}
// prettier-ignore
function FromMappedKey$3(K, P) {
    const R = MappedKeyToMappedResultProperties(K, P);
    return FromMappedResult$9(K, R);
}
// prettier-ignore
function FromRest$5(K, T) {
    return T.map(L => FromSchemaType(K, L));
}
// prettier-ignore
function FromProperties$g(K, T) {
    const Acc = {};
    for (const K2 of globalThis.Object.getOwnPropertyNames(T))
        Acc[K2] = FromSchemaType(K, T[K2]);
    return Acc;
}
// prettier-ignore
function FromSchemaType(K, T) {
    // required to retain user defined options for mapped type
    const options = { ...T };
    return (
    // unevaluated modifier types
    IsOptional$2(T) ? Optional(FromSchemaType(K, Discard(T, [OptionalKind$1]))) :
        IsReadonly$1(T) ? Readonly(FromSchemaType(K, Discard(T, [ReadonlyKind$1]))) :
            // unevaluated mapped types
            IsMappedResult$2(T) ? FromMappedResult$9(K, T.properties) :
                IsMappedKey$2(T) ? FromMappedKey$3(K, T.keys) :
                    // unevaluated types
                    IsConstructor$2(T) ? Constructor(FromRest$5(K, T.parameters), FromSchemaType(K, T.returns), options) :
                        IsFunction$2(T) ? Function$1(FromRest$5(K, T.parameters), FromSchemaType(K, T.returns), options) :
                            IsAsyncIterator$2(T) ? AsyncIterator(FromSchemaType(K, T.items), options) :
                                IsIterator$2(T) ? Iterator(FromSchemaType(K, T.items), options) :
                                    IsIntersect$2(T) ? Intersect$1(FromRest$5(K, T.allOf), options) :
                                        IsUnion$2(T) ? Union$1(FromRest$5(K, T.anyOf), options) :
                                            IsTuple$2(T) ? Tuple(FromRest$5(K, T.items ?? []), options) :
                                                IsObject$2(T) ? Object$1(FromProperties$g(K, T.properties), options) :
                                                    IsArray$2(T) ? Array$1(FromSchemaType(K, T.items), options) :
                                                        IsPromise$2(T) ? Promise$1(FromSchemaType(K, T.item), options) :
                                                            T);
}
// prettier-ignore
function MappedFunctionReturnType(K, T) {
    const Acc = {};
    for (const L of K)
        Acc[L] = FromSchemaType(L, T);
    return Acc;
}
/** `[Json]` Creates a Mapped object type */
function Mapped(key, map, options) {
    const K = IsSchema$2(key) ? IndexPropertyKeys(key) : key;
    const RT = map({ [Kind$2]: 'MappedKey', keys: K });
    const R = MappedFunctionReturnType(K, RT);
    return Object$1(R, options);
}

function RemoveOptional(schema) {
    return CreateType(Discard(schema, [OptionalKind$1]));
}
function AddOptional(schema) {
    return CreateType({ ...schema, [OptionalKind$1]: 'Optional' });
}
// prettier-ignore
function OptionalWithFlag(schema, F) {
    return (F === false
        ? RemoveOptional(schema)
        : AddOptional(schema));
}
/** `[Json]` Creates a Optional property */
function Optional(schema, enable) {
    const F = enable ?? true;
    return IsMappedResult$2(schema) ? OptionalFromMappedResult(schema, F) : OptionalWithFlag(schema, F);
}

// prettier-ignore
function FromProperties$f(P, F) {
    const Acc = {};
    for (const K2 of globalThis.Object.getOwnPropertyNames(P))
        Acc[K2] = Optional(P[K2], F);
    return Acc;
}
// prettier-ignore
function FromMappedResult$8(R, F) {
    return FromProperties$f(R.properties, F);
}
// prettier-ignore
function OptionalFromMappedResult(R, F) {
    const P = FromMappedResult$8(R, F);
    return MappedResult(P);
}

// ------------------------------------------------------------------
// IntersectCreate
// ------------------------------------------------------------------
// prettier-ignore
function IntersectCreate(T, options = {}) {
    const allObjects = T.every((schema) => IsObject$2(schema));
    const clonedUnevaluatedProperties = IsSchema$2(options.unevaluatedProperties)
        ? { unevaluatedProperties: options.unevaluatedProperties }
        : {};
    return CreateType((options.unevaluatedProperties === false || IsSchema$2(options.unevaluatedProperties) || allObjects
        ? { ...clonedUnevaluatedProperties, [Kind$2]: 'Intersect', type: 'object', allOf: T }
        : { ...clonedUnevaluatedProperties, [Kind$2]: 'Intersect', allOf: T }), options);
}

// prettier-ignore
function IsIntersectOptional(types) {
    return types.every(left => IsOptional$2(left));
}
// prettier-ignore
function RemoveOptionalFromType(type) {
    return (Discard(type, [OptionalKind$1]));
}
// prettier-ignore
function RemoveOptionalFromRest(types) {
    return types.map(left => IsOptional$2(left) ? RemoveOptionalFromType(left) : left);
}
// prettier-ignore
function ResolveIntersect(types, options) {
    return (IsIntersectOptional(types)
        ? Optional(IntersectCreate(RemoveOptionalFromRest(types), options))
        : IntersectCreate(RemoveOptionalFromRest(types), options));
}
/** `[Json]` Creates an evaluated Intersect type */
function IntersectEvaluated(types, options = {}) {
    if (types.length === 1)
        return CreateType(types[0], options);
    if (types.length === 0)
        return Never(options);
    if (types.some((schema) => IsTransform$2(schema)))
        throw new Error('Cannot intersect transform types');
    return ResolveIntersect(types, options);
}

/** `[Json]` Creates an evaluated Intersect type */
function Intersect$1(types, options) {
    if (types.length === 1)
        return CreateType(types[0], options);
    if (types.length === 0)
        return Never(options);
    if (types.some((schema) => IsTransform$2(schema)))
        throw new Error('Cannot intersect transform types');
    return IntersectCreate(types, options);
}

/** `[Json]` Creates a Ref type. The referenced type must contain a $id */
function Ref(...args) {
    const [$ref, options] = typeof args[0] === 'string' ? [args[0], args[1]] : [args[0].$id, args[1]];
    if (typeof $ref !== 'string')
        throw new TypeBoxError$1('Ref: $ref must be a string');
    return CreateType({ [Kind$2]: 'Ref', $ref }, options);
}

// prettier-ignore
function FromComputed$4(target, parameters) {
    return Computed('Awaited', [Computed(target, parameters)]);
}
// prettier-ignore
function FromRef$b($ref) {
    return Computed('Awaited', [Ref($ref)]);
}
// prettier-ignore
function FromIntersect$e(types) {
    return Intersect$1(FromRest$4(types));
}
// prettier-ignore
function FromUnion$e(types) {
    return Union$1(FromRest$4(types));
}
// prettier-ignore
function FromPromise$6(type) {
    return Awaited(type);
}
// prettier-ignore
function FromRest$4(types) {
    return types.map(type => Awaited(type));
}
/** `[JavaScript]` Constructs a type by recursively unwrapping Promise types */
function Awaited(type, options) {
    return CreateType(IsComputed$2(type) ? FromComputed$4(type.target, type.parameters) : IsIntersect$2(type) ? FromIntersect$e(type.allOf) : IsUnion$2(type) ? FromUnion$e(type.anyOf) : IsPromise$2(type) ? FromPromise$6(type.item) : IsRef$2(type) ? FromRef$b(type.$ref) : type, options);
}

// prettier-ignore
function FromRest$3(types) {
    const result = [];
    for (const L of types)
        result.push(KeyOfPropertyKeys(L));
    return result;
}
// prettier-ignore
function FromIntersect$d(types) {
    const propertyKeysArray = FromRest$3(types);
    const propertyKeys = SetUnionMany(propertyKeysArray);
    return propertyKeys;
}
// prettier-ignore
function FromUnion$d(types) {
    const propertyKeysArray = FromRest$3(types);
    const propertyKeys = SetIntersectMany(propertyKeysArray);
    return propertyKeys;
}
// prettier-ignore
function FromTuple$b(types) {
    return types.map((_, indexer) => indexer.toString());
}
// prettier-ignore
function FromArray$d(_) {
    return (['[number]']);
}
// prettier-ignore
function FromProperties$e(T) {
    return (globalThis.Object.getOwnPropertyNames(T));
}
// ------------------------------------------------------------------
// FromPatternProperties
// ------------------------------------------------------------------
// prettier-ignore
function FromPatternProperties(patternProperties) {
    if (!includePatternProperties)
        return [];
    const patternPropertyKeys = globalThis.Object.getOwnPropertyNames(patternProperties);
    return patternPropertyKeys.map(key => {
        return (key[0] === '^' && key[key.length - 1] === '$')
            ? key.slice(1, key.length - 1)
            : key;
    });
}
/** Returns a tuple of PropertyKeys derived from the given TSchema. */
// prettier-ignore
function KeyOfPropertyKeys(type) {
    return (IsIntersect$2(type) ? FromIntersect$d(type.allOf) :
        IsUnion$2(type) ? FromUnion$d(type.anyOf) :
            IsTuple$2(type) ? FromTuple$b(type.items ?? []) :
                IsArray$2(type) ? FromArray$d(type.items) :
                    IsObject$2(type) ? FromProperties$e(type.properties) :
                        IsRecord$2(type) ? FromPatternProperties(type.patternProperties) :
                            []);
}
// ----------------------------------------------------------------
// KeyOfPattern
// ----------------------------------------------------------------
let includePatternProperties = false;
/** Returns a regular expression pattern derived from the given TSchema */
function KeyOfPattern(schema) {
    includePatternProperties = true;
    const keys = KeyOfPropertyKeys(schema);
    includePatternProperties = false;
    const pattern = keys.map((key) => `(${key})`);
    return `^(${pattern.join('|')})$`;
}

// prettier-ignore
function FromComputed$3(target, parameters) {
    return Computed('KeyOf', [Computed(target, parameters)]);
}
// prettier-ignore
function FromRef$a($ref) {
    return Computed('KeyOf', [Ref($ref)]);
}
// prettier-ignore
function KeyOfFromType(type, options) {
    const propertyKeys = KeyOfPropertyKeys(type);
    const propertyKeyTypes = KeyOfPropertyKeysToRest(propertyKeys);
    const result = UnionEvaluated(propertyKeyTypes);
    return CreateType(result, options);
}
// prettier-ignore
function KeyOfPropertyKeysToRest(propertyKeys) {
    return propertyKeys.map(L => L === '[number]' ? Number$1() : Literal(L));
}
/** `[Json]` Creates a KeyOf type */
function KeyOf(type, options) {
    return (IsComputed$2(type) ? FromComputed$3(type.target, type.parameters) : IsRef$2(type) ? FromRef$a(type.$ref) : IsMappedResult$2(type) ? KeyOfFromMappedResult(type, options) : KeyOfFromType(type, options));
}

// prettier-ignore
function FromProperties$d(properties, options) {
    const result = {};
    for (const K2 of globalThis.Object.getOwnPropertyNames(properties))
        result[K2] = KeyOf(properties[K2], Clone$1(options));
    return result;
}
// prettier-ignore
function FromMappedResult$7(mappedResult, options) {
    return FromProperties$d(mappedResult.properties, options);
}
// prettier-ignore
function KeyOfFromMappedResult(mappedResult, options) {
    const properties = FromMappedResult$7(mappedResult, options);
    return MappedResult(properties);
}

/**
 * `[Utility]` Resolves an array of keys and schemas from the given schema. This method is faster
 * than obtaining the keys and resolving each individually via indexing. This method was written
 * accellerate Intersect and Union encoding.
 */
function KeyOfPropertyEntries(schema) {
    const keys = KeyOfPropertyKeys(schema);
    const schemas = IndexFromPropertyKeys(schema, keys);
    return keys.map((_, index) => [keys[index], schemas[index]]);
}

// prettier-ignore
function CompositeKeys(T) {
    const Acc = [];
    for (const L of T)
        Acc.push(...KeyOfPropertyKeys(L));
    return SetDistinct(Acc);
}
// prettier-ignore
function FilterNever(T) {
    return T.filter(L => !IsNever$2(L));
}
// prettier-ignore
function CompositeProperty(T, K) {
    const Acc = [];
    for (const L of T)
        Acc.push(...IndexFromPropertyKeys(L, [K]));
    return FilterNever(Acc);
}
// prettier-ignore
function CompositeProperties(T, K) {
    const Acc = {};
    for (const L of K) {
        Acc[L] = IntersectEvaluated(CompositeProperty(T, L));
    }
    return Acc;
}
// prettier-ignore
function Composite(T, options) {
    const K = CompositeKeys(T);
    const P = CompositeProperties(T, K);
    const R = Object$1(P, options);
    return R;
}

/** `[JavaScript]` Creates a Date type */
function Date$1(options) {
    return CreateType({ [Kind$2]: 'Date', type: 'Date' }, options);
}

/** `[Json]` Creates a Null type */
function Null(options) {
    return CreateType({ [Kind$2]: 'Null', type: 'null' }, options);
}

/** `[JavaScript]` Creates a Symbol type */
function Symbol$1(options) {
    return CreateType({ [Kind$2]: 'Symbol', type: 'symbol' }, options);
}

/** `[JavaScript]` Creates a Undefined type */
function Undefined(options) {
    return CreateType({ [Kind$2]: 'Undefined', type: 'undefined' }, options);
}

/** `[JavaScript]` Creates a Uint8Array type */
function Uint8Array$1(options) {
    return CreateType({ [Kind$2]: 'Uint8Array', type: 'Uint8Array' }, options);
}

/** `[Json]` Creates an Unknown type */
function Unknown(options) {
    return CreateType({ [Kind$2]: 'Unknown' }, options);
}

// prettier-ignore
function FromArray$c(T) {
    return T.map(L => FromValue$1(L, false));
}
// prettier-ignore
function FromProperties$c(value) {
    const Acc = {};
    for (const K of globalThis.Object.getOwnPropertyNames(value))
        Acc[K] = Readonly(FromValue$1(value[K], false));
    return Acc;
}
function ConditionalReadonly(T, root) {
    return (root === true ? T : Readonly(T));
}
// prettier-ignore
function FromValue$1(value, root) {
    return (IsAsyncIterator$4(value) ? ConditionalReadonly(Any(), root) :
        IsIterator$4(value) ? ConditionalReadonly(Any(), root) :
            IsArray$4(value) ? Readonly(Tuple(FromArray$c(value))) :
                IsUint8Array$4(value) ? Uint8Array$1() :
                    IsDate$4(value) ? Date$1() :
                        IsObject$4(value) ? ConditionalReadonly(Object$1(FromProperties$c(value)), root) :
                            IsFunction$4(value) ? ConditionalReadonly(Function$1([], Unknown()), root) :
                                IsUndefined$4(value) ? Undefined() :
                                    IsNull$4(value) ? Null() :
                                        IsSymbol$4(value) ? Symbol$1() :
                                            IsBigInt$4(value) ? BigInt$1() :
                                                IsNumber$4(value) ? Literal(value) :
                                                    IsBoolean$4(value) ? Literal(value) :
                                                        IsString$4(value) ? Literal(value) :
                                                            Object$1({}));
}
/** `[JavaScript]` Creates a readonly const type from the given value. */
function Const$1(T, options) {
    return CreateType(FromValue$1(T, true), options);
}

/** `[JavaScript]` Extracts the ConstructorParameters from the given Constructor type */
function ConstructorParameters(schema, options) {
    return (IsConstructor$2(schema) ? Tuple(schema.parameters, options) : Never(options));
}

/** `[Json]` Creates a Enum type */
function Enum(item, options) {
    if (IsUndefined$4(item))
        throw new Error('Enum undefined or empty');
    const values1 = globalThis.Object.getOwnPropertyNames(item)
        .filter((key) => isNaN(key))
        .map((key) => item[key]);
    const values2 = [...new Set(values1)];
    const anyOf = values2.map((value) => Literal(value));
    return Union$1(anyOf, { ...options, [Hint$2]: 'Enum' });
}

class ExtendsResolverError extends TypeBoxError$1 {
}
var ExtendsResult$1;
(function (ExtendsResult) {
    ExtendsResult[ExtendsResult["Union"] = 0] = "Union";
    ExtendsResult[ExtendsResult["True"] = 1] = "True";
    ExtendsResult[ExtendsResult["False"] = 2] = "False";
})(ExtendsResult$1 || (ExtendsResult$1 = {}));
// ------------------------------------------------------------------
// IntoBooleanResult
// ------------------------------------------------------------------
// prettier-ignore
function IntoBooleanResult(result) {
    return result === ExtendsResult$1.False ? result : ExtendsResult$1.True;
}
// ------------------------------------------------------------------
// Throw
// ------------------------------------------------------------------
// prettier-ignore
function Throw(message) {
    throw new ExtendsResolverError(message);
}
// ------------------------------------------------------------------
// StructuralRight
// ------------------------------------------------------------------
// prettier-ignore
function IsStructuralRight(right) {
    return (IsNever$1(right) ||
        IsIntersect$1(right) ||
        IsUnion$1(right) ||
        IsUnknown$1(right) ||
        IsAny$1(right));
}
// prettier-ignore
function StructuralRight(left, right) {
    return (IsNever$1(right) ? FromNeverRight() :
        IsIntersect$1(right) ? FromIntersectRight(left, right) :
            IsUnion$1(right) ? FromUnionRight(left, right) :
                IsUnknown$1(right) ? FromUnknownRight() :
                    IsAny$1(right) ? FromAnyRight() :
                        Throw('StructuralRight'));
}
// ------------------------------------------------------------------
// Any
// ------------------------------------------------------------------
// prettier-ignore
function FromAnyRight(left, right) {
    return ExtendsResult$1.True;
}
// prettier-ignore
function FromAny$3(left, right) {
    return (IsIntersect$1(right) ? FromIntersectRight(left, right) :
        (IsUnion$1(right) && right.anyOf.some((schema) => IsAny$1(schema) || IsUnknown$1(schema))) ? ExtendsResult$1.True :
            IsUnion$1(right) ? ExtendsResult$1.Union :
                IsUnknown$1(right) ? ExtendsResult$1.True :
                    IsAny$1(right) ? ExtendsResult$1.True :
                        ExtendsResult$1.Union);
}
// ------------------------------------------------------------------
// Array
// ------------------------------------------------------------------
// prettier-ignore
function FromArrayRight(left, right) {
    return (IsUnknown$1(left) ? ExtendsResult$1.False :
        IsAny$1(left) ? ExtendsResult$1.Union :
            IsNever$1(left) ? ExtendsResult$1.True :
                ExtendsResult$1.False);
}
// prettier-ignore
function FromArray$b(left, right) {
    return (IsObject$1(right) && IsObjectArrayLike(right) ? ExtendsResult$1.True :
        IsStructuralRight(right) ? StructuralRight(left, right) :
            !IsArray$1(right) ? ExtendsResult$1.False :
                IntoBooleanResult(Visit$9(left.items, right.items)));
}
// ------------------------------------------------------------------
// AsyncIterator
// ------------------------------------------------------------------
// prettier-ignore
function FromAsyncIterator$6(left, right) {
    return (IsStructuralRight(right) ? StructuralRight(left, right) :
        !IsAsyncIterator$1(right) ? ExtendsResult$1.False :
            IntoBooleanResult(Visit$9(left.items, right.items)));
}
// ------------------------------------------------------------------
// BigInt
// ------------------------------------------------------------------
// prettier-ignore
function FromBigInt$3(left, right) {
    return (IsStructuralRight(right) ? StructuralRight(left, right) :
        IsObject$1(right) ? FromObjectRight(left, right) :
            IsRecord$1(right) ? FromRecordRight(left, right) :
                IsBigInt$1(right) ? ExtendsResult$1.True :
                    ExtendsResult$1.False);
}
// ------------------------------------------------------------------
// Boolean
// ------------------------------------------------------------------
// prettier-ignore
function FromBooleanRight(left, right) {
    return (IsLiteralBoolean$1(left) ? ExtendsResult$1.True :
        IsBoolean$1(left) ? ExtendsResult$1.True :
            ExtendsResult$1.False);
}
// prettier-ignore
function FromBoolean$3(left, right) {
    return (IsStructuralRight(right) ? StructuralRight(left, right) :
        IsObject$1(right) ? FromObjectRight(left, right) :
            IsRecord$1(right) ? FromRecordRight(left, right) :
                IsBoolean$1(right) ? ExtendsResult$1.True :
                    ExtendsResult$1.False);
}
// ------------------------------------------------------------------
// Constructor
// ------------------------------------------------------------------
// prettier-ignore
function FromConstructor$6(left, right) {
    return (IsStructuralRight(right) ? StructuralRight(left, right) :
        IsObject$1(right) ? FromObjectRight(left, right) :
            !IsConstructor$1(right) ? ExtendsResult$1.False :
                left.parameters.length > right.parameters.length ? ExtendsResult$1.False :
                    (!left.parameters.every((schema, index) => IntoBooleanResult(Visit$9(right.parameters[index], schema)) === ExtendsResult$1.True)) ? ExtendsResult$1.False :
                        IntoBooleanResult(Visit$9(left.returns, right.returns)));
}
// ------------------------------------------------------------------
// Date
// ------------------------------------------------------------------
// prettier-ignore
function FromDate$5(left, right) {
    return (IsStructuralRight(right) ? StructuralRight(left, right) :
        IsObject$1(right) ? FromObjectRight(left, right) :
            IsRecord$1(right) ? FromRecordRight(left, right) :
                IsDate$1(right) ? ExtendsResult$1.True :
                    ExtendsResult$1.False);
}
// ------------------------------------------------------------------
// Function
// ------------------------------------------------------------------
// prettier-ignore
function FromFunction$6(left, right) {
    return (IsStructuralRight(right) ? StructuralRight(left, right) :
        IsObject$1(right) ? FromObjectRight(left, right) :
            !IsFunction$1(right) ? ExtendsResult$1.False :
                left.parameters.length > right.parameters.length ? ExtendsResult$1.False :
                    (!left.parameters.every((schema, index) => IntoBooleanResult(Visit$9(right.parameters[index], schema)) === ExtendsResult$1.True)) ? ExtendsResult$1.False :
                        IntoBooleanResult(Visit$9(left.returns, right.returns)));
}
// ------------------------------------------------------------------
// Integer
// ------------------------------------------------------------------
// prettier-ignore
function FromIntegerRight(left, right) {
    return (IsLiteral$1(left) && IsNumber$4(left.const) ? ExtendsResult$1.True :
        IsNumber$1(left) || IsInteger$1(left) ? ExtendsResult$1.True :
            ExtendsResult$1.False);
}
// prettier-ignore
function FromInteger$3(left, right) {
    return (IsInteger$1(right) || IsNumber$1(right) ? ExtendsResult$1.True :
        IsStructuralRight(right) ? StructuralRight(left, right) :
            IsObject$1(right) ? FromObjectRight(left, right) :
                IsRecord$1(right) ? FromRecordRight(left, right) :
                    ExtendsResult$1.False);
}
// ------------------------------------------------------------------
// Intersect
// ------------------------------------------------------------------
// prettier-ignore
function FromIntersectRight(left, right) {
    return right.allOf.every((schema) => Visit$9(left, schema) === ExtendsResult$1.True)
        ? ExtendsResult$1.True
        : ExtendsResult$1.False;
}
// prettier-ignore
function FromIntersect$c(left, right) {
    return left.allOf.some((schema) => Visit$9(schema, right) === ExtendsResult$1.True)
        ? ExtendsResult$1.True
        : ExtendsResult$1.False;
}
// ------------------------------------------------------------------
// Iterator
// ------------------------------------------------------------------
// prettier-ignore
function FromIterator$6(left, right) {
    return (IsStructuralRight(right) ? StructuralRight(left, right) :
        !IsIterator$1(right) ? ExtendsResult$1.False :
            IntoBooleanResult(Visit$9(left.items, right.items)));
}
// ------------------------------------------------------------------
// Literal
// ------------------------------------------------------------------
// prettier-ignore
function FromLiteral$3(left, right) {
    return (IsLiteral$1(right) && right.const === left.const ? ExtendsResult$1.True :
        IsStructuralRight(right) ? StructuralRight(left, right) :
            IsObject$1(right) ? FromObjectRight(left, right) :
                IsRecord$1(right) ? FromRecordRight(left, right) :
                    IsString$1(right) ? FromStringRight(left) :
                        IsNumber$1(right) ? FromNumberRight(left) :
                            IsInteger$1(right) ? FromIntegerRight(left) :
                                IsBoolean$1(right) ? FromBooleanRight(left) :
                                    ExtendsResult$1.False);
}
// ------------------------------------------------------------------
// Never
// ------------------------------------------------------------------
// prettier-ignore
function FromNeverRight(left, right) {
    return ExtendsResult$1.False;
}
// prettier-ignore
function FromNever$3(left, right) {
    return ExtendsResult$1.True;
}
// ------------------------------------------------------------------
// Not
// ------------------------------------------------------------------
// prettier-ignore
function UnwrapTNot(schema) {
    let [current, depth] = [schema, 0];
    while (true) {
        if (!IsNot$1(current))
            break;
        current = current.not;
        depth += 1;
    }
    return depth % 2 === 0 ? current : Unknown();
}
// prettier-ignore
function FromNot$6(left, right) {
    // TypeScript has no concept of negated types, and attempts to correctly check the negated
    // type at runtime would put TypeBox at odds with TypeScripts ability to statically infer
    // the type. Instead we unwrap to either unknown or T and continue evaluating.
    // prettier-ignore
    return (IsNot$1(left) ? Visit$9(UnwrapTNot(left), right) :
        IsNot$1(right) ? Visit$9(left, UnwrapTNot(right)) :
            Throw('Invalid fallthrough for Not'));
}
// ------------------------------------------------------------------
// Null
// ------------------------------------------------------------------
// prettier-ignore
function FromNull$3(left, right) {
    return (IsStructuralRight(right) ? StructuralRight(left, right) :
        IsObject$1(right) ? FromObjectRight(left, right) :
            IsRecord$1(right) ? FromRecordRight(left, right) :
                IsNull$1(right) ? ExtendsResult$1.True :
                    ExtendsResult$1.False);
}
// ------------------------------------------------------------------
// Number
// ------------------------------------------------------------------
// prettier-ignore
function FromNumberRight(left, right) {
    return (IsLiteralNumber$1(left) ? ExtendsResult$1.True :
        IsNumber$1(left) || IsInteger$1(left) ? ExtendsResult$1.True :
            ExtendsResult$1.False);
}
// prettier-ignore
function FromNumber$3(left, right) {
    return (IsStructuralRight(right) ? StructuralRight(left, right) :
        IsObject$1(right) ? FromObjectRight(left, right) :
            IsRecord$1(right) ? FromRecordRight(left, right) :
                IsInteger$1(right) || IsNumber$1(right) ? ExtendsResult$1.True :
                    ExtendsResult$1.False);
}
// ------------------------------------------------------------------
// Object
// ------------------------------------------------------------------
// prettier-ignore
function IsObjectPropertyCount(schema, count) {
    return Object.getOwnPropertyNames(schema.properties).length === count;
}
// prettier-ignore
function IsObjectStringLike(schema) {
    return IsObjectArrayLike(schema);
}
// prettier-ignore
function IsObjectSymbolLike(schema) {
    return IsObjectPropertyCount(schema, 0) || (IsObjectPropertyCount(schema, 1) && 'description' in schema.properties && IsUnion$1(schema.properties.description) && schema.properties.description.anyOf.length === 2 && ((IsString$1(schema.properties.description.anyOf[0]) &&
        IsUndefined$1(schema.properties.description.anyOf[1])) || (IsString$1(schema.properties.description.anyOf[1]) &&
        IsUndefined$1(schema.properties.description.anyOf[0]))));
}
// prettier-ignore
function IsObjectNumberLike(schema) {
    return IsObjectPropertyCount(schema, 0);
}
// prettier-ignore
function IsObjectBooleanLike(schema) {
    return IsObjectPropertyCount(schema, 0);
}
// prettier-ignore
function IsObjectBigIntLike(schema) {
    return IsObjectPropertyCount(schema, 0);
}
// prettier-ignore
function IsObjectDateLike(schema) {
    return IsObjectPropertyCount(schema, 0);
}
// prettier-ignore
function IsObjectUint8ArrayLike(schema) {
    return IsObjectArrayLike(schema);
}
// prettier-ignore
function IsObjectFunctionLike(schema) {
    const length = Number$1();
    return IsObjectPropertyCount(schema, 0) || (IsObjectPropertyCount(schema, 1) && 'length' in schema.properties && IntoBooleanResult(Visit$9(schema.properties['length'], length)) === ExtendsResult$1.True);
}
// prettier-ignore
function IsObjectConstructorLike(schema) {
    return IsObjectPropertyCount(schema, 0);
}
// prettier-ignore
function IsObjectArrayLike(schema) {
    const length = Number$1();
    return IsObjectPropertyCount(schema, 0) || (IsObjectPropertyCount(schema, 1) && 'length' in schema.properties && IntoBooleanResult(Visit$9(schema.properties['length'], length)) === ExtendsResult$1.True);
}
// prettier-ignore
function IsObjectPromiseLike(schema) {
    const then = Function$1([Any()], Any());
    return IsObjectPropertyCount(schema, 0) || (IsObjectPropertyCount(schema, 1) && 'then' in schema.properties && IntoBooleanResult(Visit$9(schema.properties['then'], then)) === ExtendsResult$1.True);
}
// ------------------------------------------------------------------
// Property
// ------------------------------------------------------------------
// prettier-ignore
function Property(left, right) {
    return (Visit$9(left, right) === ExtendsResult$1.False ? ExtendsResult$1.False :
        IsOptional$1(left) && !IsOptional$1(right) ? ExtendsResult$1.False :
            ExtendsResult$1.True);
}
// prettier-ignore
function FromObjectRight(left, right) {
    return (IsUnknown$1(left) ? ExtendsResult$1.False :
        IsAny$1(left) ? ExtendsResult$1.Union : (IsNever$1(left) ||
            (IsLiteralString$1(left) && IsObjectStringLike(right)) ||
            (IsLiteralNumber$1(left) && IsObjectNumberLike(right)) ||
            (IsLiteralBoolean$1(left) && IsObjectBooleanLike(right)) ||
            (IsSymbol$1(left) && IsObjectSymbolLike(right)) ||
            (IsBigInt$1(left) && IsObjectBigIntLike(right)) ||
            (IsString$1(left) && IsObjectStringLike(right)) ||
            (IsSymbol$1(left) && IsObjectSymbolLike(right)) ||
            (IsNumber$1(left) && IsObjectNumberLike(right)) ||
            (IsInteger$1(left) && IsObjectNumberLike(right)) ||
            (IsBoolean$1(left) && IsObjectBooleanLike(right)) ||
            (IsUint8Array$1(left) && IsObjectUint8ArrayLike(right)) ||
            (IsDate$1(left) && IsObjectDateLike(right)) ||
            (IsConstructor$1(left) && IsObjectConstructorLike(right)) ||
            (IsFunction$1(left) && IsObjectFunctionLike(right))) ? ExtendsResult$1.True :
            (IsRecord$1(left) && IsString$1(RecordKey$1(left))) ? (() => {
                // When expressing a Record with literal key values, the Record is converted into a Object with
                // the Hint assigned as `Record`. This is used to invert the extends logic.
                return right[Hint$2] === 'Record' ? ExtendsResult$1.True : ExtendsResult$1.False;
            })() :
                (IsRecord$1(left) && IsNumber$1(RecordKey$1(left))) ? (() => {
                    return IsObjectPropertyCount(right, 0) ? ExtendsResult$1.True : ExtendsResult$1.False;
                })() :
                    ExtendsResult$1.False);
}
// prettier-ignore
function FromObject$f(left, right) {
    return (IsStructuralRight(right) ? StructuralRight(left, right) :
        IsRecord$1(right) ? FromRecordRight(left, right) :
            !IsObject$1(right) ? ExtendsResult$1.False :
                (() => {
                    for (const key of Object.getOwnPropertyNames(right.properties)) {
                        if (!(key in left.properties) && !IsOptional$1(right.properties[key])) {
                            return ExtendsResult$1.False;
                        }
                        if (IsOptional$1(right.properties[key])) {
                            return ExtendsResult$1.True;
                        }
                        if (Property(left.properties[key], right.properties[key]) === ExtendsResult$1.False) {
                            return ExtendsResult$1.False;
                        }
                    }
                    return ExtendsResult$1.True;
                })());
}
// ------------------------------------------------------------------
// Promise
// ------------------------------------------------------------------
// prettier-ignore
function FromPromise$5(left, right) {
    return (IsStructuralRight(right) ? StructuralRight(left, right) :
        IsObject$1(right) && IsObjectPromiseLike(right) ? ExtendsResult$1.True :
            !IsPromise$1(right) ? ExtendsResult$1.False :
                IntoBooleanResult(Visit$9(left.item, right.item)));
}
// ------------------------------------------------------------------
// Record
// ------------------------------------------------------------------
// prettier-ignore
function RecordKey$1(schema) {
    return (PatternNumberExact in schema.patternProperties ? Number$1() :
        PatternStringExact in schema.patternProperties ? String$1() :
            Throw('Unknown record key pattern'));
}
// prettier-ignore
function RecordValue$1(schema) {
    return (PatternNumberExact in schema.patternProperties ? schema.patternProperties[PatternNumberExact] :
        PatternStringExact in schema.patternProperties ? schema.patternProperties[PatternStringExact] :
            Throw('Unable to get record value schema'));
}
// prettier-ignore
function FromRecordRight(left, right) {
    const [Key, Value] = [RecordKey$1(right), RecordValue$1(right)];
    return ((IsLiteralString$1(left) && IsNumber$1(Key) && IntoBooleanResult(Visit$9(left, Value)) === ExtendsResult$1.True) ? ExtendsResult$1.True :
        IsUint8Array$1(left) && IsNumber$1(Key) ? Visit$9(left, Value) :
            IsString$1(left) && IsNumber$1(Key) ? Visit$9(left, Value) :
                IsArray$1(left) && IsNumber$1(Key) ? Visit$9(left, Value) :
                    IsObject$1(left) ? (() => {
                        for (const key of Object.getOwnPropertyNames(left.properties)) {
                            if (Property(Value, left.properties[key]) === ExtendsResult$1.False) {
                                return ExtendsResult$1.False;
                            }
                        }
                        return ExtendsResult$1.True;
                    })() :
                        ExtendsResult$1.False);
}
// prettier-ignore
function FromRecord$a(left, right) {
    return (IsStructuralRight(right) ? StructuralRight(left, right) :
        IsObject$1(right) ? FromObjectRight(left, right) :
            !IsRecord$1(right) ? ExtendsResult$1.False :
                Visit$9(RecordValue$1(left), RecordValue$1(right)));
}
// ------------------------------------------------------------------
// RegExp
// ------------------------------------------------------------------
// prettier-ignore
function FromRegExp$3(left, right) {
    // Note: RegExp types evaluate as strings, not RegExp objects.
    // Here we remap either into string and continue evaluating.
    const L = IsRegExp$1(left) ? String$1() : left;
    const R = IsRegExp$1(right) ? String$1() : right;
    return Visit$9(L, R);
}
// ------------------------------------------------------------------
// String
// ------------------------------------------------------------------
// prettier-ignore
function FromStringRight(left, right) {
    return (IsLiteral$1(left) && IsString$4(left.const) ? ExtendsResult$1.True :
        IsString$1(left) ? ExtendsResult$1.True :
            ExtendsResult$1.False);
}
// prettier-ignore
function FromString$3(left, right) {
    return (IsStructuralRight(right) ? StructuralRight(left, right) :
        IsObject$1(right) ? FromObjectRight(left, right) :
            IsRecord$1(right) ? FromRecordRight(left, right) :
                IsString$1(right) ? ExtendsResult$1.True :
                    ExtendsResult$1.False);
}
// ------------------------------------------------------------------
// Symbol
// ------------------------------------------------------------------
// prettier-ignore
function FromSymbol$3(left, right) {
    return (IsStructuralRight(right) ? StructuralRight(left, right) :
        IsObject$1(right) ? FromObjectRight(left, right) :
            IsRecord$1(right) ? FromRecordRight(left, right) :
                IsSymbol$1(right) ? ExtendsResult$1.True :
                    ExtendsResult$1.False);
}
// ------------------------------------------------------------------
// TemplateLiteral
// ------------------------------------------------------------------
// prettier-ignore
function FromTemplateLiteral$4(left, right) {
    // TemplateLiteral types are resolved to either unions for finite expressions or string
    // for infinite expressions. Here we call to TemplateLiteralResolver to resolve for
    // either type and continue evaluating.
    return (IsTemplateLiteral$1(left) ? Visit$9(TemplateLiteralToUnion(left), right) :
        IsTemplateLiteral$1(right) ? Visit$9(left, TemplateLiteralToUnion(right)) :
            Throw('Invalid fallthrough for TemplateLiteral'));
}
// ------------------------------------------------------------------
// Tuple
// ------------------------------------------------------------------
// prettier-ignore
function IsArrayOfTuple(left, right) {
    return (IsArray$1(right) &&
        left.items !== undefined &&
        left.items.every((schema) => Visit$9(schema, right.items) === ExtendsResult$1.True));
}
// prettier-ignore
function FromTupleRight(left, right) {
    return (IsNever$1(left) ? ExtendsResult$1.True :
        IsUnknown$1(left) ? ExtendsResult$1.False :
            IsAny$1(left) ? ExtendsResult$1.Union :
                ExtendsResult$1.False);
}
// prettier-ignore
function FromTuple$a(left, right) {
    return (IsStructuralRight(right) ? StructuralRight(left, right) :
        IsObject$1(right) && IsObjectArrayLike(right) ? ExtendsResult$1.True :
            IsArray$1(right) && IsArrayOfTuple(left, right) ? ExtendsResult$1.True :
                !IsTuple$1(right) ? ExtendsResult$1.False :
                    (IsUndefined$4(left.items) && !IsUndefined$4(right.items)) || (!IsUndefined$4(left.items) && IsUndefined$4(right.items)) ? ExtendsResult$1.False :
                        (IsUndefined$4(left.items) && !IsUndefined$4(right.items)) ? ExtendsResult$1.True :
                            left.items.every((schema, index) => Visit$9(schema, right.items[index]) === ExtendsResult$1.True) ? ExtendsResult$1.True :
                                ExtendsResult$1.False);
}
// ------------------------------------------------------------------
// Uint8Array
// ------------------------------------------------------------------
// prettier-ignore
function FromUint8Array$3(left, right) {
    return (IsStructuralRight(right) ? StructuralRight(left, right) :
        IsObject$1(right) ? FromObjectRight(left, right) :
            IsRecord$1(right) ? FromRecordRight(left, right) :
                IsUint8Array$1(right) ? ExtendsResult$1.True :
                    ExtendsResult$1.False);
}
// ------------------------------------------------------------------
// Undefined
// ------------------------------------------------------------------
// prettier-ignore
function FromUndefined$3(left, right) {
    return (IsStructuralRight(right) ? StructuralRight(left, right) :
        IsObject$1(right) ? FromObjectRight(left, right) :
            IsRecord$1(right) ? FromRecordRight(left, right) :
                IsVoid$1(right) ? FromVoidRight(left) :
                    IsUndefined$1(right) ? ExtendsResult$1.True :
                        ExtendsResult$1.False);
}
// ------------------------------------------------------------------
// Union
// ------------------------------------------------------------------
// prettier-ignore
function FromUnionRight(left, right) {
    return right.anyOf.some((schema) => Visit$9(left, schema) === ExtendsResult$1.True)
        ? ExtendsResult$1.True
        : ExtendsResult$1.False;
}
// prettier-ignore
function FromUnion$c(left, right) {
    return left.anyOf.every((schema) => Visit$9(schema, right) === ExtendsResult$1.True)
        ? ExtendsResult$1.True
        : ExtendsResult$1.False;
}
// ------------------------------------------------------------------
// Unknown
// ------------------------------------------------------------------
// prettier-ignore
function FromUnknownRight(left, right) {
    return ExtendsResult$1.True;
}
// prettier-ignore
function FromUnknown$3(left, right) {
    return (IsNever$1(right) ? FromNeverRight() :
        IsIntersect$1(right) ? FromIntersectRight(left, right) :
            IsUnion$1(right) ? FromUnionRight(left, right) :
                IsAny$1(right) ? FromAnyRight() :
                    IsString$1(right) ? FromStringRight(left) :
                        IsNumber$1(right) ? FromNumberRight(left) :
                            IsInteger$1(right) ? FromIntegerRight(left) :
                                IsBoolean$1(right) ? FromBooleanRight(left) :
                                    IsArray$1(right) ? FromArrayRight(left) :
                                        IsTuple$1(right) ? FromTupleRight(left) :
                                            IsObject$1(right) ? FromObjectRight(left, right) :
                                                IsUnknown$1(right) ? ExtendsResult$1.True :
                                                    ExtendsResult$1.False);
}
// ------------------------------------------------------------------
// Void
// ------------------------------------------------------------------
// prettier-ignore
function FromVoidRight(left, right) {
    return (IsUndefined$1(left) ? ExtendsResult$1.True :
        IsUndefined$1(left) ? ExtendsResult$1.True :
            ExtendsResult$1.False);
}
// prettier-ignore
function FromVoid$3(left, right) {
    return (IsIntersect$1(right) ? FromIntersectRight(left, right) :
        IsUnion$1(right) ? FromUnionRight(left, right) :
            IsUnknown$1(right) ? FromUnknownRight() :
                IsAny$1(right) ? FromAnyRight() :
                    IsObject$1(right) ? FromObjectRight(left, right) :
                        IsVoid$1(right) ? ExtendsResult$1.True :
                            ExtendsResult$1.False);
}
// prettier-ignore
function Visit$9(left, right) {
    return (
    // resolvable
    (IsTemplateLiteral$1(left) || IsTemplateLiteral$1(right)) ? FromTemplateLiteral$4(left, right) :
        (IsRegExp$1(left) || IsRegExp$1(right)) ? FromRegExp$3(left, right) :
            (IsNot$1(left) || IsNot$1(right)) ? FromNot$6(left, right) :
                // standard
                IsAny$1(left) ? FromAny$3(left, right) :
                    IsArray$1(left) ? FromArray$b(left, right) :
                        IsBigInt$1(left) ? FromBigInt$3(left, right) :
                            IsBoolean$1(left) ? FromBoolean$3(left, right) :
                                IsAsyncIterator$1(left) ? FromAsyncIterator$6(left, right) :
                                    IsConstructor$1(left) ? FromConstructor$6(left, right) :
                                        IsDate$1(left) ? FromDate$5(left, right) :
                                            IsFunction$1(left) ? FromFunction$6(left, right) :
                                                IsInteger$1(left) ? FromInteger$3(left, right) :
                                                    IsIntersect$1(left) ? FromIntersect$c(left, right) :
                                                        IsIterator$1(left) ? FromIterator$6(left, right) :
                                                            IsLiteral$1(left) ? FromLiteral$3(left, right) :
                                                                IsNever$1(left) ? FromNever$3() :
                                                                    IsNull$1(left) ? FromNull$3(left, right) :
                                                                        IsNumber$1(left) ? FromNumber$3(left, right) :
                                                                            IsObject$1(left) ? FromObject$f(left, right) :
                                                                                IsRecord$1(left) ? FromRecord$a(left, right) :
                                                                                    IsString$1(left) ? FromString$3(left, right) :
                                                                                        IsSymbol$1(left) ? FromSymbol$3(left, right) :
                                                                                            IsTuple$1(left) ? FromTuple$a(left, right) :
                                                                                                IsPromise$1(left) ? FromPromise$5(left, right) :
                                                                                                    IsUint8Array$1(left) ? FromUint8Array$3(left, right) :
                                                                                                        IsUndefined$1(left) ? FromUndefined$3(left, right) :
                                                                                                            IsUnion$1(left) ? FromUnion$c(left, right) :
                                                                                                                IsUnknown$1(left) ? FromUnknown$3(left, right) :
                                                                                                                    IsVoid$1(left) ? FromVoid$3(left, right) :
                                                                                                                        Throw(`Unknown left type operand '${left[Kind$2]}'`));
}
function ExtendsCheck(left, right) {
    return Visit$9(left, right);
}

// prettier-ignore
function FromProperties$b(P, Right, True, False, options) {
    const Acc = {};
    for (const K2 of globalThis.Object.getOwnPropertyNames(P))
        Acc[K2] = Extends(P[K2], Right, True, False, Clone$1(options));
    return Acc;
}
// prettier-ignore
function FromMappedResult$6(Left, Right, True, False, options) {
    return FromProperties$b(Left.properties, Right, True, False, options);
}
// prettier-ignore
function ExtendsFromMappedResult(Left, Right, True, False, options) {
    const P = FromMappedResult$6(Left, Right, True, False, options);
    return MappedResult(P);
}

// prettier-ignore
function ExtendsResolve(left, right, trueType, falseType) {
    const R = ExtendsCheck(left, right);
    return (R === ExtendsResult$1.Union ? Union$1([trueType, falseType]) :
        R === ExtendsResult$1.True ? trueType :
            falseType);
}
/** `[Json]` Creates a Conditional type */
function Extends(L, R, T, F, options) {
    // prettier-ignore
    return (IsMappedResult$2(L) ? ExtendsFromMappedResult(L, R, T, F, options) :
        IsMappedKey$2(L) ? CreateType(ExtendsFromMappedKey(L, R, T, F, options)) :
            CreateType(ExtendsResolve(L, R, T, F), options));
}

// prettier-ignore
function FromPropertyKey$2(K, U, L, R, options) {
    return {
        [K]: Extends(Literal(K), U, L, R, Clone$1(options))
    };
}
// prettier-ignore
function FromPropertyKeys$2(K, U, L, R, options) {
    return K.reduce((Acc, LK) => {
        return { ...Acc, ...FromPropertyKey$2(LK, U, L, R, options) };
    }, {});
}
// prettier-ignore
function FromMappedKey$2(K, U, L, R, options) {
    return FromPropertyKeys$2(K.keys, U, L, R, options);
}
// prettier-ignore
function ExtendsFromMappedKey(T, U, L, R, options) {
    const P = FromMappedKey$2(T, U, L, R, options);
    return MappedResult(P);
}

/** Fast undefined check used for properties of type undefined */
function Intersect(schema) {
    return schema.allOf.every((schema) => ExtendsUndefinedCheck(schema));
}
function Union(schema) {
    return schema.anyOf.some((schema) => ExtendsUndefinedCheck(schema));
}
function Not$1(schema) {
    return !ExtendsUndefinedCheck(schema.not);
}
/** Fast undefined check used for properties of type undefined */
// prettier-ignore
function ExtendsUndefinedCheck(schema) {
    return (schema[Kind$2] === 'Intersect' ? Intersect(schema) :
        schema[Kind$2] === 'Union' ? Union(schema) :
            schema[Kind$2] === 'Not' ? Not$1(schema) :
                schema[Kind$2] === 'Undefined' ? true :
                    false);
}

function ExcludeFromTemplateLiteral(L, R) {
    return Exclude(TemplateLiteralToUnion(L), R);
}

function ExcludeRest(L, R) {
    const excluded = L.filter((inner) => ExtendsCheck(inner, R) === ExtendsResult$1.False);
    return excluded.length === 1 ? excluded[0] : Union$1(excluded);
}
/** `[Json]` Constructs a type by excluding from unionType all union members that are assignable to excludedMembers */
function Exclude(L, R, options = {}) {
    // overloads
    if (IsTemplateLiteral$2(L))
        return CreateType(ExcludeFromTemplateLiteral(L, R), options);
    if (IsMappedResult$2(L))
        return CreateType(ExcludeFromMappedResult(L, R), options);
    // prettier-ignore
    return CreateType(IsUnion$2(L) ? ExcludeRest(L.anyOf, R) :
        ExtendsCheck(L, R) !== ExtendsResult$1.False ? Never() : L, options);
}

// prettier-ignore
function FromProperties$a(P, U) {
    const Acc = {};
    for (const K2 of globalThis.Object.getOwnPropertyNames(P))
        Acc[K2] = Exclude(P[K2], U);
    return Acc;
}
// prettier-ignore
function FromMappedResult$5(R, T) {
    return FromProperties$a(R.properties, T);
}
// prettier-ignore
function ExcludeFromMappedResult(R, T) {
    const P = FromMappedResult$5(R, T);
    return MappedResult(P);
}

function ExtractFromTemplateLiteral(L, R) {
    return Extract(TemplateLiteralToUnion(L), R);
}

function ExtractRest(L, R) {
    const extracted = L.filter((inner) => ExtendsCheck(inner, R) !== ExtendsResult$1.False);
    return extracted.length === 1 ? extracted[0] : Union$1(extracted);
}
/** `[Json]` Constructs a type by extracting from type all union members that are assignable to union */
function Extract(L, R, options) {
    // overloads
    if (IsTemplateLiteral$2(L))
        return CreateType(ExtractFromTemplateLiteral(L, R), options);
    if (IsMappedResult$2(L))
        return CreateType(ExtractFromMappedResult(L, R), options);
    // prettier-ignore
    return CreateType(IsUnion$2(L) ? ExtractRest(L.anyOf, R) :
        ExtendsCheck(L, R) !== ExtendsResult$1.False ? L : Never(), options);
}

// prettier-ignore
function FromProperties$9(P, T) {
    const Acc = {};
    for (const K2 of globalThis.Object.getOwnPropertyNames(P))
        Acc[K2] = Extract(P[K2], T);
    return Acc;
}
// prettier-ignore
function FromMappedResult$4(R, T) {
    return FromProperties$9(R.properties, T);
}
// prettier-ignore
function ExtractFromMappedResult(R, T) {
    const P = FromMappedResult$4(R, T);
    return MappedResult(P);
}

/** `[JavaScript]` Extracts the InstanceType from the given Constructor type */
function InstanceType(schema, options) {
    return (IsConstructor$2(schema) ? CreateType(schema.returns, options) : Never(options));
}

/** `[Json]` Creates a Readonly and Optional property */
function ReadonlyOptional(schema) {
    return Readonly(Optional(schema));
}

// ------------------------------------------------------------------
// RecordCreateFromPattern
// ------------------------------------------------------------------
// prettier-ignore
function RecordCreateFromPattern(pattern, T, options) {
    return CreateType({ [Kind$2]: 'Record', type: 'object', patternProperties: { [pattern]: T } }, options);
}
// ------------------------------------------------------------------
// RecordCreateFromKeys
// ------------------------------------------------------------------
// prettier-ignore
function RecordCreateFromKeys(K, T, options) {
    const result = {};
    for (const K2 of K)
        result[K2] = T;
    return Object$1(result, { ...options, [Hint$2]: 'Record' });
}
// prettier-ignore
function FromTemplateLiteralKey(K, T, options) {
    return (IsTemplateLiteralFinite(K)
        ? RecordCreateFromKeys(IndexPropertyKeys(K), T, options)
        : RecordCreateFromPattern(K.pattern, T, options));
}
// prettier-ignore
function FromUnionKey(key, type, options) {
    return RecordCreateFromKeys(IndexPropertyKeys(Union$1(key)), type, options);
}
// prettier-ignore
function FromLiteralKey(key, type, options) {
    return RecordCreateFromKeys([key.toString()], type, options);
}
// prettier-ignore
function FromRegExpKey(key, type, options) {
    return RecordCreateFromPattern(key.source, type, options);
}
// prettier-ignore
function FromStringKey(key, type, options) {
    const pattern = IsUndefined$4(key.pattern) ? PatternStringExact : key.pattern;
    return RecordCreateFromPattern(pattern, type, options);
}
// prettier-ignore
function FromAnyKey(_, type, options) {
    return RecordCreateFromPattern(PatternStringExact, type, options);
}
// prettier-ignore
function FromNeverKey(_key, type, options) {
    return RecordCreateFromPattern(PatternNeverExact, type, options);
}
// prettier-ignore
function FromBooleanKey(_key, type, options) {
    return Object$1({ true: type, false: type }, options);
}
// prettier-ignore
function FromIntegerKey(_key, type, options) {
    return RecordCreateFromPattern(PatternNumberExact, type, options);
}
// prettier-ignore
function FromNumberKey(_, type, options) {
    return RecordCreateFromPattern(PatternNumberExact, type, options);
}
// ------------------------------------------------------------------
// TRecordOrObject
// ------------------------------------------------------------------
/** `[Json]` Creates a Record type */
function Record(key, type, options = {}) {
    // prettier-ignore
    return (IsUnion$2(key) ? FromUnionKey(key.anyOf, type, options) :
        IsTemplateLiteral$2(key) ? FromTemplateLiteralKey(key, type, options) :
            IsLiteral$2(key) ? FromLiteralKey(key.const, type, options) :
                IsBoolean$2(key) ? FromBooleanKey(key, type, options) :
                    IsInteger$2(key) ? FromIntegerKey(key, type, options) :
                        IsNumber$2(key) ? FromNumberKey(key, type, options) :
                            IsRegExp$2(key) ? FromRegExpKey(key, type, options) :
                                IsString$2(key) ? FromStringKey(key, type, options) :
                                    IsAny$2(key) ? FromAnyKey(key, type, options) :
                                        IsNever$2(key) ? FromNeverKey(key, type, options) :
                                            Never(options));
}
// ------------------------------------------------------------------
// Record Utilities
// ------------------------------------------------------------------
/** Gets the Records Pattern */
function RecordPattern(record) {
    return globalThis.Object.getOwnPropertyNames(record.patternProperties)[0];
}
/** Gets the Records Key Type */
// prettier-ignore
function RecordKey(type) {
    const pattern = RecordPattern(type);
    return (pattern === PatternStringExact ? String$1() :
        pattern === PatternNumberExact ? Number$1() :
            String$1({ pattern }));
}
/** Gets a Record Value Type */
// prettier-ignore
function RecordValue(type) {
    return type.patternProperties[RecordPattern(type)];
}

// prettier-ignore
function FromConstructor$5(args, type) {
    type.parameters = FromTypes$1(args, type.parameters);
    type.returns = FromType$1(args, type.returns);
    return type;
}
// prettier-ignore
function FromFunction$5(args, type) {
    type.parameters = FromTypes$1(args, type.parameters);
    type.returns = FromType$1(args, type.returns);
    return type;
}
// prettier-ignore
function FromIntersect$b(args, type) {
    type.allOf = FromTypes$1(args, type.allOf);
    return type;
}
// prettier-ignore
function FromUnion$b(args, type) {
    type.anyOf = FromTypes$1(args, type.anyOf);
    return type;
}
// prettier-ignore
function FromTuple$9(args, type) {
    if (IsUndefined$4(type.items))
        return type;
    type.items = FromTypes$1(args, type.items);
    return type;
}
// prettier-ignore
function FromArray$a(args, type) {
    type.items = FromType$1(args, type.items);
    return type;
}
// prettier-ignore
function FromAsyncIterator$5(args, type) {
    type.items = FromType$1(args, type.items);
    return type;
}
// prettier-ignore
function FromIterator$5(args, type) {
    type.items = FromType$1(args, type.items);
    return type;
}
// prettier-ignore
function FromPromise$4(args, type) {
    type.item = FromType$1(args, type.item);
    return type;
}
// prettier-ignore
function FromObject$e(args, type) {
    const mappedProperties = FromProperties$8(args, type.properties);
    return { ...type, ...Object$1(mappedProperties) }; // retain options
}
// prettier-ignore
function FromRecord$9(args, type) {
    const mappedKey = FromType$1(args, RecordKey(type));
    const mappedValue = FromType$1(args, RecordValue(type));
    const result = Record(mappedKey, mappedValue);
    return { ...type, ...result }; // retain options
}
// prettier-ignore
function FromArgument$3(args, argument) {
    return argument.index in args ? args[argument.index] : Unknown();
}
// prettier-ignore
function FromProperty$1(args, type) {
    const isReadonly = IsReadonly$1(type);
    const isOptional = IsOptional$2(type);
    const mapped = FromType$1(args, type);
    return (isReadonly && isOptional ? ReadonlyOptional(mapped) :
        isReadonly && !isOptional ? Readonly(mapped) :
            !isReadonly && isOptional ? Optional(mapped) :
                mapped);
}
// prettier-ignore
function FromProperties$8(args, properties) {
    return globalThis.Object.getOwnPropertyNames(properties).reduce((result, key) => {
        return { ...result, [key]: FromProperty$1(args, properties[key]) };
    }, {});
}
// prettier-ignore
function FromTypes$1(args, types) {
    return types.map(type => FromType$1(args, type));
}
// prettier-ignore
function FromType$1(args, type) {
    return (IsConstructor$2(type) ? FromConstructor$5(args, type) :
        IsFunction$2(type) ? FromFunction$5(args, type) :
            IsIntersect$2(type) ? FromIntersect$b(args, type) :
                IsUnion$2(type) ? FromUnion$b(args, type) :
                    IsTuple$2(type) ? FromTuple$9(args, type) :
                        IsArray$2(type) ? FromArray$a(args, type) :
                            IsAsyncIterator$2(type) ? FromAsyncIterator$5(args, type) :
                                IsIterator$2(type) ? FromIterator$5(args, type) :
                                    IsPromise$2(type) ? FromPromise$4(args, type) :
                                        IsObject$2(type) ? FromObject$e(args, type) :
                                            IsRecord$2(type) ? FromRecord$9(args, type) :
                                                IsArgument$2(type) ? FromArgument$3(args, type) :
                                                    type);
}
/** `[JavaScript]` Instantiates a type with the given parameters */
// prettier-ignore
function Instantiate(type, args) {
    return FromType$1(args, CloneType(type));
}

/** `[Json]` Creates an Integer type */
function Integer(options) {
    return CreateType({ [Kind$2]: 'Integer', type: 'integer' }, options);
}

// prettier-ignore
function MappedIntrinsicPropertyKey(K, M, options) {
    return {
        [K]: Intrinsic(Literal(K), M, Clone$1(options))
    };
}
// prettier-ignore
function MappedIntrinsicPropertyKeys(K, M, options) {
    const result = K.reduce((Acc, L) => {
        return { ...Acc, ...MappedIntrinsicPropertyKey(L, M, options) };
    }, {});
    return result;
}
// prettier-ignore
function MappedIntrinsicProperties(T, M, options) {
    return MappedIntrinsicPropertyKeys(T['keys'], M, options);
}
// prettier-ignore
function IntrinsicFromMappedKey(T, M, options) {
    const P = MappedIntrinsicProperties(T, M, options);
    return MappedResult(P);
}

// ------------------------------------------------------------------
// Apply
// ------------------------------------------------------------------
function ApplyUncapitalize(value) {
    const [first, rest] = [value.slice(0, 1), value.slice(1)];
    return [first.toLowerCase(), rest].join('');
}
function ApplyCapitalize(value) {
    const [first, rest] = [value.slice(0, 1), value.slice(1)];
    return [first.toUpperCase(), rest].join('');
}
function ApplyUppercase(value) {
    return value.toUpperCase();
}
function ApplyLowercase(value) {
    return value.toLowerCase();
}
function FromTemplateLiteral$3(schema, mode, options) {
    // note: template literals require special runtime handling as they are encoded in string patterns.
    // This diverges from the mapped type which would otherwise map on the template literal kind.
    const expression = TemplateLiteralParseExact(schema.pattern);
    const finite = IsTemplateLiteralExpressionFinite(expression);
    if (!finite)
        return { ...schema, pattern: FromLiteralValue(schema.pattern, mode) };
    const strings = [...TemplateLiteralExpressionGenerate(expression)];
    const literals = strings.map((value) => Literal(value));
    const mapped = FromRest$2(literals, mode);
    const union = Union$1(mapped);
    return TemplateLiteral([union], options);
}
// prettier-ignore
function FromLiteralValue(value, mode) {
    return (typeof value === 'string' ? (mode === 'Uncapitalize' ? ApplyUncapitalize(value) :
        mode === 'Capitalize' ? ApplyCapitalize(value) :
            mode === 'Uppercase' ? ApplyUppercase(value) :
                mode === 'Lowercase' ? ApplyLowercase(value) :
                    value) : value.toString());
}
// prettier-ignore
function FromRest$2(T, M) {
    return T.map(L => Intrinsic(L, M));
}
/** Applies an intrinsic string manipulation to the given type. */
function Intrinsic(schema, mode, options = {}) {
    // prettier-ignore
    return (
    // Intrinsic-Mapped-Inference
    IsMappedKey$2(schema) ? IntrinsicFromMappedKey(schema, mode, options) :
        // Standard-Inference
        IsTemplateLiteral$2(schema) ? FromTemplateLiteral$3(schema, mode, options) :
            IsUnion$2(schema) ? Union$1(FromRest$2(schema.anyOf, mode), options) :
                IsLiteral$2(schema) ? Literal(FromLiteralValue(schema.const, mode), options) :
                    // Default Type
                    CreateType(schema, options));
}

/** `[Json]` Intrinsic function to Capitalize LiteralString types */
function Capitalize(T, options = {}) {
    return Intrinsic(T, 'Capitalize', options);
}

/** `[Json]` Intrinsic function to Lowercase LiteralString types */
function Lowercase(T, options = {}) {
    return Intrinsic(T, 'Lowercase', options);
}

/** `[Json]` Intrinsic function to Uncapitalize LiteralString types */
function Uncapitalize(T, options = {}) {
    return Intrinsic(T, 'Uncapitalize', options);
}

/** `[Json]` Intrinsic function to Uppercase LiteralString types */
function Uppercase(T, options = {}) {
    return Intrinsic(T, 'Uppercase', options);
}

// prettier-ignore
function FromProperties$7(properties, propertyKeys, options) {
    const result = {};
    for (const K2 of globalThis.Object.getOwnPropertyNames(properties))
        result[K2] = Omit(properties[K2], propertyKeys, Clone$1(options));
    return result;
}
// prettier-ignore
function FromMappedResult$3(mappedResult, propertyKeys, options) {
    return FromProperties$7(mappedResult.properties, propertyKeys, options);
}
// prettier-ignore
function OmitFromMappedResult(mappedResult, propertyKeys, options) {
    const properties = FromMappedResult$3(mappedResult, propertyKeys, options);
    return MappedResult(properties);
}

// prettier-ignore
function FromIntersect$a(types, propertyKeys) {
    return types.map((type) => OmitResolve(type, propertyKeys));
}
// prettier-ignore
function FromUnion$a(types, propertyKeys) {
    return types.map((type) => OmitResolve(type, propertyKeys));
}
// ------------------------------------------------------------------
// FromProperty
// ------------------------------------------------------------------
// prettier-ignore
function FromProperty(properties, key) {
    const { [key]: _, ...R } = properties;
    return R;
}
// prettier-ignore
function FromProperties$6(properties, propertyKeys) {
    return propertyKeys.reduce((T, K2) => FromProperty(T, K2), properties);
}
// prettier-ignore
function FromObject$d(type, propertyKeys, properties) {
    const options = Discard(type, [TransformKind$1, '$id', 'required', 'properties']);
    const mappedProperties = FromProperties$6(properties, propertyKeys);
    return Object$1(mappedProperties, options);
}
// prettier-ignore
function UnionFromPropertyKeys$1(propertyKeys) {
    const result = propertyKeys.reduce((result, key) => IsLiteralValue$2(key) ? [...result, Literal(key)] : result, []);
    return Union$1(result);
}
// prettier-ignore
function OmitResolve(type, propertyKeys) {
    return (IsIntersect$2(type) ? Intersect$1(FromIntersect$a(type.allOf, propertyKeys)) :
        IsUnion$2(type) ? Union$1(FromUnion$a(type.anyOf, propertyKeys)) :
            IsObject$2(type) ? FromObject$d(type, propertyKeys, type.properties) :
                Object$1({}));
}
/** `[Json]` Constructs a type whose keys are picked from the given type */
// prettier-ignore
function Omit(type, key, options) {
    const typeKey = IsArray$4(key) ? UnionFromPropertyKeys$1(key) : key;
    const propertyKeys = IsSchema$2(key) ? IndexPropertyKeys(key) : key;
    const isTypeRef = IsRef$2(type);
    const isKeyRef = IsRef$2(key);
    return (IsMappedResult$2(type) ? OmitFromMappedResult(type, propertyKeys, options) :
        IsMappedKey$2(key) ? OmitFromMappedKey(type, key, options) :
            (isTypeRef && isKeyRef) ? Computed('Omit', [type, typeKey], options) :
                (!isTypeRef && isKeyRef) ? Computed('Omit', [type, typeKey], options) :
                    (isTypeRef && !isKeyRef) ? Computed('Omit', [type, typeKey], options) :
                        CreateType({ ...OmitResolve(type, propertyKeys), ...options }));
}

// prettier-ignore
function FromPropertyKey$1(type, key, options) {
    return { [key]: Omit(type, [key], Clone$1(options)) };
}
// prettier-ignore
function FromPropertyKeys$1(type, propertyKeys, options) {
    return propertyKeys.reduce((Acc, LK) => {
        return { ...Acc, ...FromPropertyKey$1(type, LK, options) };
    }, {});
}
// prettier-ignore
function FromMappedKey$1(type, mappedKey, options) {
    return FromPropertyKeys$1(type, mappedKey.keys, options);
}
// prettier-ignore
function OmitFromMappedKey(type, mappedKey, options) {
    const properties = FromMappedKey$1(type, mappedKey, options);
    return MappedResult(properties);
}

// prettier-ignore
function FromProperties$5(properties, propertyKeys, options) {
    const result = {};
    for (const K2 of globalThis.Object.getOwnPropertyNames(properties))
        result[K2] = Pick(properties[K2], propertyKeys, Clone$1(options));
    return result;
}
// prettier-ignore
function FromMappedResult$2(mappedResult, propertyKeys, options) {
    return FromProperties$5(mappedResult.properties, propertyKeys, options);
}
// prettier-ignore
function PickFromMappedResult(mappedResult, propertyKeys, options) {
    const properties = FromMappedResult$2(mappedResult, propertyKeys, options);
    return MappedResult(properties);
}

function FromIntersect$9(types, propertyKeys) {
    return types.map((type) => PickResolve(type, propertyKeys));
}
// prettier-ignore
function FromUnion$9(types, propertyKeys) {
    return types.map((type) => PickResolve(type, propertyKeys));
}
// prettier-ignore
function FromProperties$4(properties, propertyKeys) {
    const result = {};
    for (const K2 of propertyKeys)
        if (K2 in properties)
            result[K2] = properties[K2];
    return result;
}
// prettier-ignore
function FromObject$c(Type, keys, properties) {
    const options = Discard(Type, [TransformKind$1, '$id', 'required', 'properties']);
    const mappedProperties = FromProperties$4(properties, keys);
    return Object$1(mappedProperties, options);
}
// prettier-ignore
function UnionFromPropertyKeys(propertyKeys) {
    const result = propertyKeys.reduce((result, key) => IsLiteralValue$2(key) ? [...result, Literal(key)] : result, []);
    return Union$1(result);
}
// prettier-ignore
function PickResolve(type, propertyKeys) {
    return (IsIntersect$2(type) ? Intersect$1(FromIntersect$9(type.allOf, propertyKeys)) :
        IsUnion$2(type) ? Union$1(FromUnion$9(type.anyOf, propertyKeys)) :
            IsObject$2(type) ? FromObject$c(type, propertyKeys, type.properties) :
                Object$1({}));
}
/** `[Json]` Constructs a type whose keys are picked from the given type */
// prettier-ignore
function Pick(type, key, options) {
    const typeKey = IsArray$4(key) ? UnionFromPropertyKeys(key) : key;
    const propertyKeys = IsSchema$2(key) ? IndexPropertyKeys(key) : key;
    const isTypeRef = IsRef$2(type);
    const isKeyRef = IsRef$2(key);
    return (IsMappedResult$2(type) ? PickFromMappedResult(type, propertyKeys, options) :
        IsMappedKey$2(key) ? PickFromMappedKey(type, key, options) :
            (isTypeRef && isKeyRef) ? Computed('Pick', [type, typeKey], options) :
                (!isTypeRef && isKeyRef) ? Computed('Pick', [type, typeKey], options) :
                    (isTypeRef && !isKeyRef) ? Computed('Pick', [type, typeKey], options) :
                        CreateType({ ...PickResolve(type, propertyKeys), ...options }));
}

// prettier-ignore
function FromPropertyKey(type, key, options) {
    return {
        [key]: Pick(type, [key], Clone$1(options))
    };
}
// prettier-ignore
function FromPropertyKeys(type, propertyKeys, options) {
    return propertyKeys.reduce((result, leftKey) => {
        return { ...result, ...FromPropertyKey(type, leftKey, options) };
    }, {});
}
// prettier-ignore
function FromMappedKey(type, mappedKey, options) {
    return FromPropertyKeys(type, mappedKey.keys, options);
}
// prettier-ignore
function PickFromMappedKey(type, mappedKey, options) {
    const properties = FromMappedKey(type, mappedKey, options);
    return MappedResult(properties);
}

// prettier-ignore
function FromComputed$2(target, parameters) {
    return Computed('Partial', [Computed(target, parameters)]);
}
// prettier-ignore
function FromRef$9($ref) {
    return Computed('Partial', [Ref($ref)]);
}
// prettier-ignore
function FromProperties$3(properties) {
    const partialProperties = {};
    for (const K of globalThis.Object.getOwnPropertyNames(properties))
        partialProperties[K] = Optional(properties[K]);
    return partialProperties;
}
// prettier-ignore
function FromObject$b(type, properties) {
    const options = Discard(type, [TransformKind$1, '$id', 'required', 'properties']);
    const mappedProperties = FromProperties$3(properties);
    return Object$1(mappedProperties, options);
}
// prettier-ignore
function FromRest$1(types) {
    return types.map(type => PartialResolve(type));
}
// ------------------------------------------------------------------
// PartialResolve
// ------------------------------------------------------------------
// prettier-ignore
function PartialResolve(type) {
    return (
    // Mappable
    IsComputed$2(type) ? FromComputed$2(type.target, type.parameters) :
        IsRef$2(type) ? FromRef$9(type.$ref) :
            IsIntersect$2(type) ? Intersect$1(FromRest$1(type.allOf)) :
                IsUnion$2(type) ? Union$1(FromRest$1(type.anyOf)) :
                    IsObject$2(type) ? FromObject$b(type, type.properties) :
                        // Intrinsic
                        IsBigInt$2(type) ? type :
                            IsBoolean$2(type) ? type :
                                IsInteger$2(type) ? type :
                                    IsLiteral$2(type) ? type :
                                        IsNull$2(type) ? type :
                                            IsNumber$2(type) ? type :
                                                IsString$2(type) ? type :
                                                    IsSymbol$2(type) ? type :
                                                        IsUndefined$2(type) ? type :
                                                            // Passthrough
                                                            Object$1({}));
}
/** `[Json]` Constructs a type where all properties are optional */
function Partial(type, options) {
    if (IsMappedResult$2(type)) {
        return PartialFromMappedResult(type, options);
    }
    else {
        // special: mapping types require overridable options
        return CreateType({ ...PartialResolve(type), ...options });
    }
}

// prettier-ignore
function FromProperties$2(K, options) {
    const Acc = {};
    for (const K2 of globalThis.Object.getOwnPropertyNames(K))
        Acc[K2] = Partial(K[K2], Clone$1(options));
    return Acc;
}
// prettier-ignore
function FromMappedResult$1(R, options) {
    return FromProperties$2(R.properties, options);
}
// prettier-ignore
function PartialFromMappedResult(R, options) {
    const P = FromMappedResult$1(R, options);
    return MappedResult(P);
}

// prettier-ignore
function FromComputed$1(target, parameters) {
    return Computed('Required', [Computed(target, parameters)]);
}
// prettier-ignore
function FromRef$8($ref) {
    return Computed('Required', [Ref($ref)]);
}
// prettier-ignore
function FromProperties$1(properties) {
    const requiredProperties = {};
    for (const K of globalThis.Object.getOwnPropertyNames(properties))
        requiredProperties[K] = Discard(properties[K], [OptionalKind$1]);
    return requiredProperties;
}
// prettier-ignore
function FromObject$a(type, properties) {
    const options = Discard(type, [TransformKind$1, '$id', 'required', 'properties']);
    const mappedProperties = FromProperties$1(properties);
    return Object$1(mappedProperties, options);
}
// prettier-ignore
function FromRest(types) {
    return types.map(type => RequiredResolve(type));
}
// ------------------------------------------------------------------
// RequiredResolve
// ------------------------------------------------------------------
// prettier-ignore
function RequiredResolve(type) {
    return (
    // Mappable
    IsComputed$2(type) ? FromComputed$1(type.target, type.parameters) :
        IsRef$2(type) ? FromRef$8(type.$ref) :
            IsIntersect$2(type) ? Intersect$1(FromRest(type.allOf)) :
                IsUnion$2(type) ? Union$1(FromRest(type.anyOf)) :
                    IsObject$2(type) ? FromObject$a(type, type.properties) :
                        // Intrinsic
                        IsBigInt$2(type) ? type :
                            IsBoolean$2(type) ? type :
                                IsInteger$2(type) ? type :
                                    IsLiteral$2(type) ? type :
                                        IsNull$2(type) ? type :
                                            IsNumber$2(type) ? type :
                                                IsString$2(type) ? type :
                                                    IsSymbol$2(type) ? type :
                                                        IsUndefined$2(type) ? type :
                                                            // Passthrough
                                                            Object$1({}));
}
/** `[Json]` Constructs a type where all properties are required */
function Required(type, options) {
    if (IsMappedResult$2(type)) {
        return RequiredFromMappedResult(type, options);
    }
    else {
        // special: mapping types require overridable options
        return CreateType({ ...RequiredResolve(type), ...options });
    }
}

// prettier-ignore
function FromProperties(P, options) {
    const Acc = {};
    for (const K2 of globalThis.Object.getOwnPropertyNames(P))
        Acc[K2] = Required(P[K2], options);
    return Acc;
}
// prettier-ignore
function FromMappedResult(R, options) {
    return FromProperties(R.properties, options);
}
// prettier-ignore
function RequiredFromMappedResult(R, options) {
    const P = FromMappedResult(R, options);
    return MappedResult(P);
}

// prettier-ignore
function DereferenceParameters(moduleProperties, types) {
    return types.map((type) => {
        return IsRef$2(type)
            ? Dereference(moduleProperties, type.$ref)
            : FromType(moduleProperties, type);
    });
}
// prettier-ignore
function Dereference(moduleProperties, ref) {
    return (ref in moduleProperties
        ? IsRef$2(moduleProperties[ref])
            ? Dereference(moduleProperties, moduleProperties[ref].$ref)
            : FromType(moduleProperties, moduleProperties[ref])
        : Never());
}
// prettier-ignore
function FromAwaited(parameters) {
    return Awaited(parameters[0]);
}
// prettier-ignore
function FromIndex(parameters) {
    return Index(parameters[0], parameters[1]);
}
// prettier-ignore
function FromKeyOf(parameters) {
    return KeyOf(parameters[0]);
}
// prettier-ignore
function FromPartial(parameters) {
    return Partial(parameters[0]);
}
// prettier-ignore
function FromOmit(parameters) {
    return Omit(parameters[0], parameters[1]);
}
// prettier-ignore
function FromPick(parameters) {
    return Pick(parameters[0], parameters[1]);
}
// prettier-ignore
function FromRequired(parameters) {
    return Required(parameters[0]);
}
// prettier-ignore
function FromComputed(moduleProperties, target, parameters) {
    const dereferenced = DereferenceParameters(moduleProperties, parameters);
    return (target === 'Awaited' ? FromAwaited(dereferenced) :
        target === 'Index' ? FromIndex(dereferenced) :
            target === 'KeyOf' ? FromKeyOf(dereferenced) :
                target === 'Partial' ? FromPartial(dereferenced) :
                    target === 'Omit' ? FromOmit(dereferenced) :
                        target === 'Pick' ? FromPick(dereferenced) :
                            target === 'Required' ? FromRequired(dereferenced) :
                                Never());
}
function FromArray$9(moduleProperties, type) {
    return Array$1(FromType(moduleProperties, type));
}
function FromAsyncIterator$4(moduleProperties, type) {
    return AsyncIterator(FromType(moduleProperties, type));
}
// prettier-ignore
function FromConstructor$4(moduleProperties, parameters, instanceType) {
    return Constructor(FromTypes(moduleProperties, parameters), FromType(moduleProperties, instanceType));
}
// prettier-ignore
function FromFunction$4(moduleProperties, parameters, returnType) {
    return Function$1(FromTypes(moduleProperties, parameters), FromType(moduleProperties, returnType));
}
function FromIntersect$8(moduleProperties, types) {
    return Intersect$1(FromTypes(moduleProperties, types));
}
function FromIterator$4(moduleProperties, type) {
    return Iterator(FromType(moduleProperties, type));
}
function FromObject$9(moduleProperties, properties) {
    return Object$1(globalThis.Object.keys(properties).reduce((result, key) => {
        return { ...result, [key]: FromType(moduleProperties, properties[key]) };
    }, {}));
}
// prettier-ignore
function FromRecord$8(moduleProperties, type) {
    const [value, pattern] = [FromType(moduleProperties, RecordValue(type)), RecordPattern(type)];
    const result = CloneType(type);
    result.patternProperties[pattern] = value;
    return result;
}
// prettier-ignore
function FromTransform(moduleProperties, transform) {
    return (IsRef$2(transform))
        ? { ...Dereference(moduleProperties, transform.$ref), [TransformKind$1]: transform[TransformKind$1] }
        : transform;
}
function FromTuple$8(moduleProperties, types) {
    return Tuple(FromTypes(moduleProperties, types));
}
function FromUnion$8(moduleProperties, types) {
    return Union$1(FromTypes(moduleProperties, types));
}
function FromTypes(moduleProperties, types) {
    return types.map((type) => FromType(moduleProperties, type));
}
// prettier-ignore
function FromType(moduleProperties, type) {
    return (
    // Modifiers
    IsOptional$2(type) ? CreateType(FromType(moduleProperties, Discard(type, [OptionalKind$1])), type) :
        IsReadonly$1(type) ? CreateType(FromType(moduleProperties, Discard(type, [ReadonlyKind$1])), type) :
            // Transform
            IsTransform$2(type) ? CreateType(FromTransform(moduleProperties, type), type) :
                // Types
                IsArray$2(type) ? CreateType(FromArray$9(moduleProperties, type.items), type) :
                    IsAsyncIterator$2(type) ? CreateType(FromAsyncIterator$4(moduleProperties, type.items), type) :
                        IsComputed$2(type) ? CreateType(FromComputed(moduleProperties, type.target, type.parameters)) :
                            IsConstructor$2(type) ? CreateType(FromConstructor$4(moduleProperties, type.parameters, type.returns), type) :
                                IsFunction$2(type) ? CreateType(FromFunction$4(moduleProperties, type.parameters, type.returns), type) :
                                    IsIntersect$2(type) ? CreateType(FromIntersect$8(moduleProperties, type.allOf), type) :
                                        IsIterator$2(type) ? CreateType(FromIterator$4(moduleProperties, type.items), type) :
                                            IsObject$2(type) ? CreateType(FromObject$9(moduleProperties, type.properties), type) :
                                                IsRecord$2(type) ? CreateType(FromRecord$8(moduleProperties, type)) :
                                                    IsTuple$2(type) ? CreateType(FromTuple$8(moduleProperties, type.items || []), type) :
                                                        IsUnion$2(type) ? CreateType(FromUnion$8(moduleProperties, type.anyOf), type) :
                                                            type);
}
// prettier-ignore
function ComputeType(moduleProperties, key) {
    return (key in moduleProperties
        ? FromType(moduleProperties, moduleProperties[key])
        : Never());
}
// prettier-ignore
function ComputeModuleProperties(moduleProperties) {
    return globalThis.Object.getOwnPropertyNames(moduleProperties).reduce((result, key) => {
        return { ...result, [key]: ComputeType(moduleProperties, key) };
    }, {});
}

// ------------------------------------------------------------------
// Module
// ------------------------------------------------------------------
// prettier-ignore
class TModule {
    constructor($defs) {
        const computed = ComputeModuleProperties($defs);
        const identified = this.WithIdentifiers(computed);
        this.$defs = identified;
    }
    /** `[Json]` Imports a Type by Key. */
    Import(key, options) {
        const $defs = { ...this.$defs, [key]: CreateType(this.$defs[key], options) };
        return CreateType({ [Kind$2]: 'Import', $defs, $ref: key });
    }
    // prettier-ignore
    WithIdentifiers($defs) {
        return globalThis.Object.getOwnPropertyNames($defs).reduce((result, key) => {
            return { ...result, [key]: { ...$defs[key], $id: key } };
        }, {});
    }
}
/** `[Json]` Creates a Type Definition Module. */
function Module$1(properties) {
    return new TModule(properties);
}

/** `[Json]` Creates a Not type */
function Not(type, options) {
    return CreateType({ [Kind$2]: 'Not', not: type }, options);
}

/** `[JavaScript]` Extracts the Parameters from the given Function type */
function Parameters(schema, options) {
    return (IsFunction$2(schema) ? Tuple(schema.parameters, options) : Never());
}

// Auto Tracked For Recursive Types without ID's
let Ordinal = 0;
/** `[Json]` Creates a Recursive type */
function Recursive(callback, options = {}) {
    if (IsUndefined$4(options.$id))
        options.$id = `T${Ordinal++}`;
    const thisType = CloneType(callback({ [Kind$2]: 'This', $ref: `${options.$id}` }));
    thisType.$id = options.$id;
    // prettier-ignore
    return CreateType({ [Hint$2]: 'Recursive', ...thisType }, options);
}

/** `[JavaScript]` Creates a RegExp type */
function RegExp$1(unresolved, options) {
    const expr = IsString$4(unresolved) ? new globalThis.RegExp(unresolved) : unresolved;
    return CreateType({ [Kind$2]: 'RegExp', type: 'RegExp', source: expr.source, flags: expr.flags }, options);
}

// ------------------------------------------------------------------
// TypeGuard
// ------------------------------------------------------------------
// prettier-ignore
function RestResolve(T) {
    return (IsIntersect$2(T) ? T.allOf :
        IsUnion$2(T) ? T.anyOf :
            IsTuple$2(T) ? T.items ?? [] :
                []);
}
/** `[Json]` Extracts interior Rest elements from Tuple, Intersect and Union types */
function Rest(T) {
    return RestResolve(T);
}

/** `[JavaScript]` Extracts the ReturnType from the given Function type */
function ReturnType(schema, options) {
    return (IsFunction$2(schema) ? CreateType(schema.returns, options) : Never(options));
}

// ------------------------------------------------------------------
// TransformBuilders
// ------------------------------------------------------------------
class TransformDecodeBuilder {
    constructor(schema) {
        this.schema = schema;
    }
    Decode(decode) {
        return new TransformEncodeBuilder(this.schema, decode);
    }
}
// prettier-ignore
class TransformEncodeBuilder {
    constructor(schema, decode) {
        this.schema = schema;
        this.decode = decode;
    }
    EncodeTransform(encode, schema) {
        const Encode = (value) => schema[TransformKind$1].Encode(encode(value));
        const Decode = (value) => this.decode(schema[TransformKind$1].Decode(value));
        const Codec = { Encode: Encode, Decode: Decode };
        return { ...schema, [TransformKind$1]: Codec };
    }
    EncodeSchema(encode, schema) {
        const Codec = { Decode: this.decode, Encode: encode };
        return { ...schema, [TransformKind$1]: Codec };
    }
    Encode(encode) {
        return (IsTransform$2(this.schema) ? this.EncodeTransform(encode, this.schema) : this.EncodeSchema(encode, this.schema));
    }
}
/** `[Json]` Creates a Transform type */
function Transform(schema) {
    return new TransformDecodeBuilder(schema);
}

/** `[Json]` Creates a Unsafe type that will infers as the generic argument T */
function Unsafe(options = {}) {
    return CreateType({ [Kind$2]: options[Kind$2] ?? 'Unsafe' }, options);
}

/** `[JavaScript]` Creates a Void type */
function Void(options) {
    return CreateType({ [Kind$2]: 'Void', type: 'void' }, options);
}

// ------------------------------------------------------------------
// Type: Module
// ------------------------------------------------------------------

const TypeBuilder = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  Any,
  Argument,
  Array: Array$1,
  AsyncIterator,
  Awaited,
  BigInt: BigInt$1,
  Boolean: Boolean$1,
  Capitalize,
  Composite,
  Const: Const$1,
  Constructor,
  ConstructorParameters,
  Date: Date$1,
  Enum,
  Exclude,
  Extends,
  Extract,
  Function: Function$1,
  Index,
  InstanceType,
  Instantiate,
  Integer,
  Intersect: Intersect$1,
  Iterator,
  KeyOf,
  Literal,
  Lowercase,
  Mapped,
  Module: Module$1,
  Never,
  Not,
  Null,
  Number: Number$1,
  Object: Object$1,
  Omit,
  Optional,
  Parameters,
  Partial,
  Pick,
  Promise: Promise$1,
  Readonly,
  ReadonlyOptional,
  Record,
  Recursive,
  Ref,
  RegExp: RegExp$1,
  Required,
  Rest,
  ReturnType,
  String: String$1,
  Symbol: Symbol$1,
  TemplateLiteral,
  Transform,
  Tuple,
  Uint8Array: Uint8Array$1,
  Uncapitalize,
  Undefined,
  Union: Union$1,
  Unknown,
  Unsafe,
  Uppercase,
  Void
}, Symbol.toStringTag, { value: 'Module' }));

// ------------------------------------------------------------------
// JsonTypeBuilder
// ------------------------------------------------------------------
/** JavaScript Type Builder with Static Resolution for TypeScript */
const Type = TypeBuilder;

var fastDecodeUriComponent;
var hasRequiredFastDecodeUriComponent;

function requireFastDecodeUriComponent () {
	if (hasRequiredFastDecodeUriComponent) return fastDecodeUriComponent;
	hasRequiredFastDecodeUriComponent = 1;

	var UTF8_ACCEPT = 12;
	var UTF8_REJECT = 0;
	var UTF8_DATA = [
	  // The first part of the table maps bytes to character to a transition.
	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
	  2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
	  3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
	  3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
	  4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
	  5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
	  6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 8, 7, 7,
	  10, 9, 9, 9, 11, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,

	  // The second part of the table maps a state to a new state when adding a
	  // transition.
	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	  12, 0, 0, 0, 0, 24, 36, 48, 60, 72, 84, 96,
	  0, 12, 12, 12, 0, 0, 0, 0, 0, 0, 0, 0,
	  0, 0, 0, 24, 0, 0, 0, 0, 0, 0, 0, 0,
	  0, 24, 24, 24, 0, 0, 0, 0, 0, 0, 0, 0,
	  0, 24, 24, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	  0, 48, 48, 48, 0, 0, 0, 0, 0, 0, 0, 0,
	  0, 0, 48, 48, 0, 0, 0, 0, 0, 0, 0, 0,
	  0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,

	  // The third part maps the current transition to a mask that needs to apply
	  // to the byte.
	  0x7F, 0x3F, 0x3F, 0x3F, 0x00, 0x1F, 0x0F, 0x0F, 0x0F, 0x07, 0x07, 0x07
	];

	function decodeURIComponent (uri) {
	  var percentPosition = uri.indexOf('%');
	  if (percentPosition === -1) return uri

	  var length = uri.length;
	  var decoded = '';
	  var last = 0;
	  var codepoint = 0;
	  var startOfOctets = percentPosition;
	  var state = UTF8_ACCEPT;

	  while (percentPosition > -1 && percentPosition < length) {
	    var high = hexCodeToInt(uri[percentPosition + 1], 4);
	    var low = hexCodeToInt(uri[percentPosition + 2], 0);
	    var byte = high | low;
	    var type = UTF8_DATA[byte];
	    state = UTF8_DATA[256 + state + type];
	    codepoint = (codepoint << 6) | (byte & UTF8_DATA[364 + type]);

	    if (state === UTF8_ACCEPT) {
	      decoded += uri.slice(last, startOfOctets);

	      decoded += (codepoint <= 0xFFFF)
	        ? String.fromCharCode(codepoint)
	        : String.fromCharCode(
	          (0xD7C0 + (codepoint >> 10)),
	          (0xDC00 + (codepoint & 0x3FF))
	        );

	      codepoint = 0;
	      last = percentPosition + 3;
	      percentPosition = startOfOctets = uri.indexOf('%', last);
	    } else if (state === UTF8_REJECT) {
	      return null
	    } else {
	      percentPosition += 3;
	      if (percentPosition < length && uri.charCodeAt(percentPosition) === 37) continue
	      return null
	    }
	  }

	  return decoded + uri.slice(last)
	}

	var HEX = {
	  '0': 0,
	  '1': 1,
	  '2': 2,
	  '3': 3,
	  '4': 4,
	  '5': 5,
	  '6': 6,
	  '7': 7,
	  '8': 8,
	  '9': 9,
	  'a': 10,
	  'A': 10,
	  'b': 11,
	  'B': 11,
	  'c': 12,
	  'C': 12,
	  'd': 13,
	  'D': 13,
	  'e': 14,
	  'E': 14,
	  'f': 15,
	  'F': 15
	};

	function hexCodeToInt (c, shift) {
	  var i = HEX[c];
	  return i === undefined ? 255 : i << shift
	}

	fastDecodeUriComponent = decodeURIComponent;
	return fastDecodeUriComponent;
}

var fastDecodeUriComponentExports = requireFastDecodeUriComponent();
const fastDecodeURIComponent = /*@__PURE__*/getDefaultExportFromCjs(fastDecodeUriComponentExports);

/** Creates an error message using en-US as the default locale */
function DefaultErrorFunction(error) {
    switch (error.errorType) {
        case ValueErrorType.ArrayContains:
            return 'Expected array to contain at least one matching value';
        case ValueErrorType.ArrayMaxContains:
            return `Expected array to contain no more than ${error.schema.maxContains} matching values`;
        case ValueErrorType.ArrayMinContains:
            return `Expected array to contain at least ${error.schema.minContains} matching values`;
        case ValueErrorType.ArrayMaxItems:
            return `Expected array length to be less or equal to ${error.schema.maxItems}`;
        case ValueErrorType.ArrayMinItems:
            return `Expected array length to be greater or equal to ${error.schema.minItems}`;
        case ValueErrorType.ArrayUniqueItems:
            return 'Expected array elements to be unique';
        case ValueErrorType.Array:
            return 'Expected array';
        case ValueErrorType.AsyncIterator:
            return 'Expected AsyncIterator';
        case ValueErrorType.BigIntExclusiveMaximum:
            return `Expected bigint to be less than ${error.schema.exclusiveMaximum}`;
        case ValueErrorType.BigIntExclusiveMinimum:
            return `Expected bigint to be greater than ${error.schema.exclusiveMinimum}`;
        case ValueErrorType.BigIntMaximum:
            return `Expected bigint to be less or equal to ${error.schema.maximum}`;
        case ValueErrorType.BigIntMinimum:
            return `Expected bigint to be greater or equal to ${error.schema.minimum}`;
        case ValueErrorType.BigIntMultipleOf:
            return `Expected bigint to be a multiple of ${error.schema.multipleOf}`;
        case ValueErrorType.BigInt:
            return 'Expected bigint';
        case ValueErrorType.Boolean:
            return 'Expected boolean';
        case ValueErrorType.DateExclusiveMinimumTimestamp:
            return `Expected Date timestamp to be greater than ${error.schema.exclusiveMinimumTimestamp}`;
        case ValueErrorType.DateExclusiveMaximumTimestamp:
            return `Expected Date timestamp to be less than ${error.schema.exclusiveMaximumTimestamp}`;
        case ValueErrorType.DateMinimumTimestamp:
            return `Expected Date timestamp to be greater or equal to ${error.schema.minimumTimestamp}`;
        case ValueErrorType.DateMaximumTimestamp:
            return `Expected Date timestamp to be less or equal to ${error.schema.maximumTimestamp}`;
        case ValueErrorType.DateMultipleOfTimestamp:
            return `Expected Date timestamp to be a multiple of ${error.schema.multipleOfTimestamp}`;
        case ValueErrorType.Date:
            return 'Expected Date';
        case ValueErrorType.Function:
            return 'Expected function';
        case ValueErrorType.IntegerExclusiveMaximum:
            return `Expected integer to be less than ${error.schema.exclusiveMaximum}`;
        case ValueErrorType.IntegerExclusiveMinimum:
            return `Expected integer to be greater than ${error.schema.exclusiveMinimum}`;
        case ValueErrorType.IntegerMaximum:
            return `Expected integer to be less or equal to ${error.schema.maximum}`;
        case ValueErrorType.IntegerMinimum:
            return `Expected integer to be greater or equal to ${error.schema.minimum}`;
        case ValueErrorType.IntegerMultipleOf:
            return `Expected integer to be a multiple of ${error.schema.multipleOf}`;
        case ValueErrorType.Integer:
            return 'Expected integer';
        case ValueErrorType.IntersectUnevaluatedProperties:
            return 'Unexpected property';
        case ValueErrorType.Intersect:
            return 'Expected all values to match';
        case ValueErrorType.Iterator:
            return 'Expected Iterator';
        case ValueErrorType.Literal:
            return `Expected ${typeof error.schema.const === 'string' ? `'${error.schema.const}'` : error.schema.const}`;
        case ValueErrorType.Never:
            return 'Never';
        case ValueErrorType.Not:
            return 'Value should not match';
        case ValueErrorType.Null:
            return 'Expected null';
        case ValueErrorType.NumberExclusiveMaximum:
            return `Expected number to be less than ${error.schema.exclusiveMaximum}`;
        case ValueErrorType.NumberExclusiveMinimum:
            return `Expected number to be greater than ${error.schema.exclusiveMinimum}`;
        case ValueErrorType.NumberMaximum:
            return `Expected number to be less or equal to ${error.schema.maximum}`;
        case ValueErrorType.NumberMinimum:
            return `Expected number to be greater or equal to ${error.schema.minimum}`;
        case ValueErrorType.NumberMultipleOf:
            return `Expected number to be a multiple of ${error.schema.multipleOf}`;
        case ValueErrorType.Number:
            return 'Expected number';
        case ValueErrorType.Object:
            return 'Expected object';
        case ValueErrorType.ObjectAdditionalProperties:
            return 'Unexpected property';
        case ValueErrorType.ObjectMaxProperties:
            return `Expected object to have no more than ${error.schema.maxProperties} properties`;
        case ValueErrorType.ObjectMinProperties:
            return `Expected object to have at least ${error.schema.minProperties} properties`;
        case ValueErrorType.ObjectRequiredProperty:
            return 'Expected required property';
        case ValueErrorType.Promise:
            return 'Expected Promise';
        case ValueErrorType.RegExp:
            return 'Expected string to match regular expression';
        case ValueErrorType.StringFormatUnknown:
            return `Unknown format '${error.schema.format}'`;
        case ValueErrorType.StringFormat:
            return `Expected string to match '${error.schema.format}' format`;
        case ValueErrorType.StringMaxLength:
            return `Expected string length less or equal to ${error.schema.maxLength}`;
        case ValueErrorType.StringMinLength:
            return `Expected string length greater or equal to ${error.schema.minLength}`;
        case ValueErrorType.StringPattern:
            return `Expected string to match '${error.schema.pattern}'`;
        case ValueErrorType.String:
            return 'Expected string';
        case ValueErrorType.Symbol:
            return 'Expected symbol';
        case ValueErrorType.TupleLength:
            return `Expected tuple to have ${error.schema.maxItems || 0} elements`;
        case ValueErrorType.Tuple:
            return 'Expected tuple';
        case ValueErrorType.Uint8ArrayMaxByteLength:
            return `Expected byte length less or equal to ${error.schema.maxByteLength}`;
        case ValueErrorType.Uint8ArrayMinByteLength:
            return `Expected byte length greater or equal to ${error.schema.minByteLength}`;
        case ValueErrorType.Uint8Array:
            return 'Expected Uint8Array';
        case ValueErrorType.Undefined:
            return 'Expected undefined';
        case ValueErrorType.Union:
            return 'Expected union value';
        case ValueErrorType.Void:
            return 'Expected void';
        case ValueErrorType.Kind:
            return `Expected kind '${error.schema[Kind$2]}'`;
        default:
            return 'Unknown error type';
    }
}
/** Manages error message providers */
let errorFunction = DefaultErrorFunction;
/** Gets the error function used to generate error messages */
function GetErrorFunction() {
    return errorFunction;
}

class TypeDereferenceError extends TypeBoxError$1 {
    constructor(schema) {
        super(`Unable to dereference schema with $id '${schema.$ref}'`);
        this.schema = schema;
    }
}
function Resolve(schema, references) {
    const target = references.find((target) => target.$id === schema.$ref);
    if (target === undefined)
        throw new TypeDereferenceError(schema);
    return Deref(target, references);
}
/** `[Internal]` Pushes a schema onto references if the schema has an $id and does not exist on references */
function Pushref(schema, references) {
    if (!IsString$3(schema.$id) || references.some((target) => target.$id === schema.$id))
        return references;
    references.push(schema);
    return references;
}
/** `[Internal]` Dereferences a schema from the references array or throws if not found */
function Deref(schema, references) {
    // prettier-ignore
    return (schema[Kind$2] === 'This' || schema[Kind$2] === 'Ref')
        ? Resolve(schema, references)
        : schema;
}

// ------------------------------------------------------------------
// Errors
// ------------------------------------------------------------------
class ValueHashError extends TypeBoxError$1 {
    constructor(value) {
        super(`Unable to hash value`);
        this.value = value;
    }
}
// ------------------------------------------------------------------
// ByteMarker
// ------------------------------------------------------------------
var ByteMarker;
(function (ByteMarker) {
    ByteMarker[ByteMarker["Undefined"] = 0] = "Undefined";
    ByteMarker[ByteMarker["Null"] = 1] = "Null";
    ByteMarker[ByteMarker["Boolean"] = 2] = "Boolean";
    ByteMarker[ByteMarker["Number"] = 3] = "Number";
    ByteMarker[ByteMarker["String"] = 4] = "String";
    ByteMarker[ByteMarker["Object"] = 5] = "Object";
    ByteMarker[ByteMarker["Array"] = 6] = "Array";
    ByteMarker[ByteMarker["Date"] = 7] = "Date";
    ByteMarker[ByteMarker["Uint8Array"] = 8] = "Uint8Array";
    ByteMarker[ByteMarker["Symbol"] = 9] = "Symbol";
    ByteMarker[ByteMarker["BigInt"] = 10] = "BigInt";
})(ByteMarker || (ByteMarker = {}));
// ------------------------------------------------------------------
// State
// ------------------------------------------------------------------
let Accumulator = BigInt('14695981039346656037');
const [Prime, Size] = [BigInt('1099511628211'), BigInt('18446744073709551616' /* 2 ^ 64 */)];
const Bytes = Array.from({ length: 256 }).map((_, i) => BigInt(i));
const F64 = new Float64Array(1);
const F64In = new DataView(F64.buffer);
const F64Out = new Uint8Array(F64.buffer);
// ------------------------------------------------------------------
// NumberToBytes
// ------------------------------------------------------------------
function* NumberToBytes(value) {
    const byteCount = value === 0 ? 1 : Math.ceil(Math.floor(Math.log2(value) + 1) / 8);
    for (let i = 0; i < byteCount; i++) {
        yield (value >> (8 * (byteCount - 1 - i))) & 0xff;
    }
}
// ------------------------------------------------------------------
// Hashing Functions
// ------------------------------------------------------------------
function ArrayType(value) {
    FNV1A64(ByteMarker.Array);
    for (const item of value) {
        Visit$8(item);
    }
}
function BooleanType(value) {
    FNV1A64(ByteMarker.Boolean);
    FNV1A64(value ? 1 : 0);
}
function BigIntType(value) {
    FNV1A64(ByteMarker.BigInt);
    F64In.setBigInt64(0, value);
    for (const byte of F64Out) {
        FNV1A64(byte);
    }
}
function DateType(value) {
    FNV1A64(ByteMarker.Date);
    Visit$8(value.getTime());
}
function NullType(value) {
    FNV1A64(ByteMarker.Null);
}
function NumberType(value) {
    FNV1A64(ByteMarker.Number);
    F64In.setFloat64(0, value);
    for (const byte of F64Out) {
        FNV1A64(byte);
    }
}
function ObjectType(value) {
    FNV1A64(ByteMarker.Object);
    for (const key of globalThis.Object.getOwnPropertyNames(value).sort()) {
        Visit$8(key);
        Visit$8(value[key]);
    }
}
function StringType(value) {
    FNV1A64(ByteMarker.String);
    for (let i = 0; i < value.length; i++) {
        for (const byte of NumberToBytes(value.charCodeAt(i))) {
            FNV1A64(byte);
        }
    }
}
function SymbolType(value) {
    FNV1A64(ByteMarker.Symbol);
    Visit$8(value.description);
}
function Uint8ArrayType(value) {
    FNV1A64(ByteMarker.Uint8Array);
    for (let i = 0; i < value.length; i++) {
        FNV1A64(value[i]);
    }
}
function UndefinedType(value) {
    return FNV1A64(ByteMarker.Undefined);
}
function Visit$8(value) {
    if (IsArray$3(value))
        return ArrayType(value);
    if (IsBoolean$3(value))
        return BooleanType(value);
    if (IsBigInt$3(value))
        return BigIntType(value);
    if (IsDate$3(value))
        return DateType(value);
    if (IsNull$3(value))
        return NullType();
    if (IsNumber$3(value))
        return NumberType(value);
    if (IsObject$3(value))
        return ObjectType(value);
    if (IsString$3(value))
        return StringType(value);
    if (IsSymbol$3(value))
        return SymbolType(value);
    if (IsUint8Array$3(value))
        return Uint8ArrayType(value);
    if (IsUndefined$3(value))
        return UndefinedType();
    throw new ValueHashError(value);
}
function FNV1A64(byte) {
    Accumulator = Accumulator ^ Bytes[byte];
    Accumulator = (Accumulator * Prime) % Size;
}
// ------------------------------------------------------------------
// Hash
// ------------------------------------------------------------------
/** Creates a FNV1A-64 non cryptographic hash of the given value */
function Hash(value) {
    Accumulator = BigInt('14695981039346656037');
    Visit$8(value);
    return Accumulator;
}

// ------------------------------------------------------------------
// Errors
// ------------------------------------------------------------------
class ValueCheckUnknownTypeError extends TypeBoxError$1 {
    constructor(schema) {
        super(`Unknown type`);
        this.schema = schema;
    }
}
// ------------------------------------------------------------------
// TypeGuards
// ------------------------------------------------------------------
function IsAnyOrUnknown(schema) {
    return schema[Kind$2] === 'Any' || schema[Kind$2] === 'Unknown';
}
// ------------------------------------------------------------------
// Guards
// ------------------------------------------------------------------
function IsDefined$1(value) {
    return value !== undefined;
}
// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------
function FromAny$2(schema, references, value) {
    return true;
}
function FromArgument$2(schema, references, value) {
    return true;
}
function FromArray$8(schema, references, value) {
    if (!IsArray$3(value))
        return false;
    if (IsDefined$1(schema.minItems) && !(value.length >= schema.minItems)) {
        return false;
    }
    if (IsDefined$1(schema.maxItems) && !(value.length <= schema.maxItems)) {
        return false;
    }
    for (const element of value) {
        if (!Visit$7(schema.items, references, element))
            return false;
    }
    // prettier-ignore
    if (schema.uniqueItems === true && !((function () { const set = new Set(); for (const element of value) {
        const hashed = Hash(element);
        if (set.has(hashed)) {
            return false;
        }
        else {
            set.add(hashed);
        }
    } return true; })())) {
        return false;
    }
    // contains
    if (!(IsDefined$1(schema.contains) || IsNumber$3(schema.minContains) || IsNumber$3(schema.maxContains))) {
        return true; // exit
    }
    const containsSchema = IsDefined$1(schema.contains) ? schema.contains : Never();
    const containsCount = value.reduce((acc, value) => (Visit$7(containsSchema, references, value) ? acc + 1 : acc), 0);
    if (containsCount === 0) {
        return false;
    }
    if (IsNumber$3(schema.minContains) && containsCount < schema.minContains) {
        return false;
    }
    if (IsNumber$3(schema.maxContains) && containsCount > schema.maxContains) {
        return false;
    }
    return true;
}
function FromAsyncIterator$3(schema, references, value) {
    return IsAsyncIterator$3(value);
}
function FromBigInt$2(schema, references, value) {
    if (!IsBigInt$3(value))
        return false;
    if (IsDefined$1(schema.exclusiveMaximum) && !(value < schema.exclusiveMaximum)) {
        return false;
    }
    if (IsDefined$1(schema.exclusiveMinimum) && !(value > schema.exclusiveMinimum)) {
        return false;
    }
    if (IsDefined$1(schema.maximum) && !(value <= schema.maximum)) {
        return false;
    }
    if (IsDefined$1(schema.minimum) && !(value >= schema.minimum)) {
        return false;
    }
    if (IsDefined$1(schema.multipleOf) && !(value % schema.multipleOf === BigInt(0))) {
        return false;
    }
    return true;
}
function FromBoolean$2(schema, references, value) {
    return IsBoolean$3(value);
}
function FromConstructor$3(schema, references, value) {
    return Visit$7(schema.returns, references, value.prototype);
}
function FromDate$4(schema, references, value) {
    if (!IsDate$3(value))
        return false;
    if (IsDefined$1(schema.exclusiveMaximumTimestamp) && !(value.getTime() < schema.exclusiveMaximumTimestamp)) {
        return false;
    }
    if (IsDefined$1(schema.exclusiveMinimumTimestamp) && !(value.getTime() > schema.exclusiveMinimumTimestamp)) {
        return false;
    }
    if (IsDefined$1(schema.maximumTimestamp) && !(value.getTime() <= schema.maximumTimestamp)) {
        return false;
    }
    if (IsDefined$1(schema.minimumTimestamp) && !(value.getTime() >= schema.minimumTimestamp)) {
        return false;
    }
    if (IsDefined$1(schema.multipleOfTimestamp) && !(value.getTime() % schema.multipleOfTimestamp === 0)) {
        return false;
    }
    return true;
}
function FromFunction$3(schema, references, value) {
    return IsFunction$3(value);
}
function FromImport$7(schema, references, value) {
    const definitions = globalThis.Object.values(schema.$defs);
    const target = schema.$defs[schema.$ref];
    return Visit$7(target, [...references, ...definitions], value);
}
function FromInteger$2(schema, references, value) {
    if (!IsInteger$3(value)) {
        return false;
    }
    if (IsDefined$1(schema.exclusiveMaximum) && !(value < schema.exclusiveMaximum)) {
        return false;
    }
    if (IsDefined$1(schema.exclusiveMinimum) && !(value > schema.exclusiveMinimum)) {
        return false;
    }
    if (IsDefined$1(schema.maximum) && !(value <= schema.maximum)) {
        return false;
    }
    if (IsDefined$1(schema.minimum) && !(value >= schema.minimum)) {
        return false;
    }
    if (IsDefined$1(schema.multipleOf) && !(value % schema.multipleOf === 0)) {
        return false;
    }
    return true;
}
function FromIntersect$7(schema, references, value) {
    const check1 = schema.allOf.every((schema) => Visit$7(schema, references, value));
    if (schema.unevaluatedProperties === false) {
        const keyPattern = new RegExp(KeyOfPattern(schema));
        const check2 = Object.getOwnPropertyNames(value).every((key) => keyPattern.test(key));
        return check1 && check2;
    }
    else if (IsSchema$2(schema.unevaluatedProperties)) {
        const keyCheck = new RegExp(KeyOfPattern(schema));
        const check2 = Object.getOwnPropertyNames(value).every((key) => keyCheck.test(key) || Visit$7(schema.unevaluatedProperties, references, value[key]));
        return check1 && check2;
    }
    else {
        return check1;
    }
}
function FromIterator$3(schema, references, value) {
    return IsIterator$3(value);
}
function FromLiteral$2(schema, references, value) {
    return value === schema.const;
}
function FromNever$2(schema, references, value) {
    return false;
}
function FromNot$5(schema, references, value) {
    return !Visit$7(schema.not, references, value);
}
function FromNull$2(schema, references, value) {
    return IsNull$3(value);
}
function FromNumber$2(schema, references, value) {
    if (!TypeSystemPolicy$1.IsNumberLike(value))
        return false;
    if (IsDefined$1(schema.exclusiveMaximum) && !(value < schema.exclusiveMaximum)) {
        return false;
    }
    if (IsDefined$1(schema.exclusiveMinimum) && !(value > schema.exclusiveMinimum)) {
        return false;
    }
    if (IsDefined$1(schema.minimum) && !(value >= schema.minimum)) {
        return false;
    }
    if (IsDefined$1(schema.maximum) && !(value <= schema.maximum)) {
        return false;
    }
    if (IsDefined$1(schema.multipleOf) && !(value % schema.multipleOf === 0)) {
        return false;
    }
    return true;
}
function FromObject$8(schema, references, value) {
    if (!TypeSystemPolicy$1.IsObjectLike(value))
        return false;
    if (IsDefined$1(schema.minProperties) && !(Object.getOwnPropertyNames(value).length >= schema.minProperties)) {
        return false;
    }
    if (IsDefined$1(schema.maxProperties) && !(Object.getOwnPropertyNames(value).length <= schema.maxProperties)) {
        return false;
    }
    const knownKeys = Object.getOwnPropertyNames(schema.properties);
    for (const knownKey of knownKeys) {
        const property = schema.properties[knownKey];
        if (schema.required && schema.required.includes(knownKey)) {
            if (!Visit$7(property, references, value[knownKey])) {
                return false;
            }
            if ((ExtendsUndefinedCheck(property) || IsAnyOrUnknown(property)) && !(knownKey in value)) {
                return false;
            }
        }
        else {
            if (TypeSystemPolicy$1.IsExactOptionalProperty(value, knownKey) && !Visit$7(property, references, value[knownKey])) {
                return false;
            }
        }
    }
    if (schema.additionalProperties === false) {
        const valueKeys = Object.getOwnPropertyNames(value);
        // optimization: value is valid if schemaKey length matches the valueKey length
        if (schema.required && schema.required.length === knownKeys.length && valueKeys.length === knownKeys.length) {
            return true;
        }
        else {
            return valueKeys.every((valueKey) => knownKeys.includes(valueKey));
        }
    }
    else if (typeof schema.additionalProperties === 'object') {
        const valueKeys = Object.getOwnPropertyNames(value);
        return valueKeys.every((key) => knownKeys.includes(key) || Visit$7(schema.additionalProperties, references, value[key]));
    }
    else {
        return true;
    }
}
function FromPromise$3(schema, references, value) {
    return IsPromise$3(value);
}
function FromRecord$7(schema, references, value) {
    if (!TypeSystemPolicy$1.IsRecordLike(value)) {
        return false;
    }
    if (IsDefined$1(schema.minProperties) && !(Object.getOwnPropertyNames(value).length >= schema.minProperties)) {
        return false;
    }
    if (IsDefined$1(schema.maxProperties) && !(Object.getOwnPropertyNames(value).length <= schema.maxProperties)) {
        return false;
    }
    const [patternKey, patternSchema] = Object.entries(schema.patternProperties)[0];
    const regex = new RegExp(patternKey);
    // prettier-ignore
    const check1 = Object.entries(value).every(([key, value]) => {
        return (regex.test(key)) ? Visit$7(patternSchema, references, value) : true;
    });
    // prettier-ignore
    const check2 = typeof schema.additionalProperties === 'object' ? Object.entries(value).every(([key, value]) => {
        return (!regex.test(key)) ? Visit$7(schema.additionalProperties, references, value) : true;
    }) : true;
    const check3 = schema.additionalProperties === false
        ? Object.getOwnPropertyNames(value).every((key) => {
            return regex.test(key);
        })
        : true;
    return check1 && check2 && check3;
}
function FromRef$7(schema, references, value) {
    return Visit$7(Deref(schema, references), references, value);
}
function FromRegExp$2(schema, references, value) {
    const regex = new RegExp(schema.source, schema.flags);
    if (IsDefined$1(schema.minLength)) {
        if (!(value.length >= schema.minLength))
            return false;
    }
    if (IsDefined$1(schema.maxLength)) {
        if (!(value.length <= schema.maxLength))
            return false;
    }
    return regex.test(value);
}
function FromString$2(schema, references, value) {
    if (!IsString$3(value)) {
        return false;
    }
    if (IsDefined$1(schema.minLength)) {
        if (!(value.length >= schema.minLength))
            return false;
    }
    if (IsDefined$1(schema.maxLength)) {
        if (!(value.length <= schema.maxLength))
            return false;
    }
    if (IsDefined$1(schema.pattern)) {
        const regex = new RegExp(schema.pattern);
        if (!regex.test(value))
            return false;
    }
    if (IsDefined$1(schema.format)) {
        if (!Has$2(schema.format))
            return false;
        const func = Get$2(schema.format);
        return func(value);
    }
    return true;
}
function FromSymbol$2(schema, references, value) {
    return IsSymbol$3(value);
}
function FromTemplateLiteral$2(schema, references, value) {
    return IsString$3(value) && new RegExp(schema.pattern).test(value);
}
function FromThis$7(schema, references, value) {
    return Visit$7(Deref(schema, references), references, value);
}
function FromTuple$7(schema, references, value) {
    if (!IsArray$3(value)) {
        return false;
    }
    if (schema.items === undefined && !(value.length === 0)) {
        return false;
    }
    if (!(value.length === schema.maxItems)) {
        return false;
    }
    if (!schema.items) {
        return true;
    }
    for (let i = 0; i < schema.items.length; i++) {
        if (!Visit$7(schema.items[i], references, value[i]))
            return false;
    }
    return true;
}
function FromUndefined$2(schema, references, value) {
    return IsUndefined$3(value);
}
function FromUnion$7(schema, references, value) {
    return schema.anyOf.some((inner) => Visit$7(inner, references, value));
}
function FromUint8Array$2(schema, references, value) {
    if (!IsUint8Array$3(value)) {
        return false;
    }
    if (IsDefined$1(schema.maxByteLength) && !(value.length <= schema.maxByteLength)) {
        return false;
    }
    if (IsDefined$1(schema.minByteLength) && !(value.length >= schema.minByteLength)) {
        return false;
    }
    return true;
}
function FromUnknown$2(schema, references, value) {
    return true;
}
function FromVoid$2(schema, references, value) {
    return TypeSystemPolicy$1.IsVoidLike(value);
}
function FromKind$2(schema, references, value) {
    if (!Has$1(schema[Kind$2]))
        return false;
    const func = Get$1(schema[Kind$2]);
    return func(schema, value);
}
function Visit$7(schema, references, value) {
    const references_ = IsDefined$1(schema.$id) ? Pushref(schema, references) : references;
    const schema_ = schema;
    switch (schema_[Kind$2]) {
        case 'Any':
            return FromAny$2();
        case 'Argument':
            return FromArgument$2();
        case 'Array':
            return FromArray$8(schema_, references_, value);
        case 'AsyncIterator':
            return FromAsyncIterator$3(schema_, references_, value);
        case 'BigInt':
            return FromBigInt$2(schema_, references_, value);
        case 'Boolean':
            return FromBoolean$2(schema_, references_, value);
        case 'Constructor':
            return FromConstructor$3(schema_, references_, value);
        case 'Date':
            return FromDate$4(schema_, references_, value);
        case 'Function':
            return FromFunction$3(schema_, references_, value);
        case 'Import':
            return FromImport$7(schema_, references_, value);
        case 'Integer':
            return FromInteger$2(schema_, references_, value);
        case 'Intersect':
            return FromIntersect$7(schema_, references_, value);
        case 'Iterator':
            return FromIterator$3(schema_, references_, value);
        case 'Literal':
            return FromLiteral$2(schema_, references_, value);
        case 'Never':
            return FromNever$2();
        case 'Not':
            return FromNot$5(schema_, references_, value);
        case 'Null':
            return FromNull$2(schema_, references_, value);
        case 'Number':
            return FromNumber$2(schema_, references_, value);
        case 'Object':
            return FromObject$8(schema_, references_, value);
        case 'Promise':
            return FromPromise$3(schema_, references_, value);
        case 'Record':
            return FromRecord$7(schema_, references_, value);
        case 'Ref':
            return FromRef$7(schema_, references_, value);
        case 'RegExp':
            return FromRegExp$2(schema_, references_, value);
        case 'String':
            return FromString$2(schema_, references_, value);
        case 'Symbol':
            return FromSymbol$2(schema_, references_, value);
        case 'TemplateLiteral':
            return FromTemplateLiteral$2(schema_, references_, value);
        case 'This':
            return FromThis$7(schema_, references_, value);
        case 'Tuple':
            return FromTuple$7(schema_, references_, value);
        case 'Undefined':
            return FromUndefined$2(schema_, references_, value);
        case 'Union':
            return FromUnion$7(schema_, references_, value);
        case 'Uint8Array':
            return FromUint8Array$2(schema_, references_, value);
        case 'Unknown':
            return FromUnknown$2();
        case 'Void':
            return FromVoid$2(schema_, references_, value);
        default:
            if (!Has$1(schema_[Kind$2]))
                throw new ValueCheckUnknownTypeError(schema_);
            return FromKind$2(schema_, references_, value);
    }
}
/** Returns true if the value matches the given type. */
function Check(...args) {
    return args.length === 3 ? Visit$7(args[0], args[1], args[2]) : Visit$7(args[0], [], args[1]);
}

// ------------------------------------------------------------------
// ValueErrorType
// ------------------------------------------------------------------
var ValueErrorType;
(function (ValueErrorType) {
    ValueErrorType[ValueErrorType["ArrayContains"] = 0] = "ArrayContains";
    ValueErrorType[ValueErrorType["ArrayMaxContains"] = 1] = "ArrayMaxContains";
    ValueErrorType[ValueErrorType["ArrayMaxItems"] = 2] = "ArrayMaxItems";
    ValueErrorType[ValueErrorType["ArrayMinContains"] = 3] = "ArrayMinContains";
    ValueErrorType[ValueErrorType["ArrayMinItems"] = 4] = "ArrayMinItems";
    ValueErrorType[ValueErrorType["ArrayUniqueItems"] = 5] = "ArrayUniqueItems";
    ValueErrorType[ValueErrorType["Array"] = 6] = "Array";
    ValueErrorType[ValueErrorType["AsyncIterator"] = 7] = "AsyncIterator";
    ValueErrorType[ValueErrorType["BigIntExclusiveMaximum"] = 8] = "BigIntExclusiveMaximum";
    ValueErrorType[ValueErrorType["BigIntExclusiveMinimum"] = 9] = "BigIntExclusiveMinimum";
    ValueErrorType[ValueErrorType["BigIntMaximum"] = 10] = "BigIntMaximum";
    ValueErrorType[ValueErrorType["BigIntMinimum"] = 11] = "BigIntMinimum";
    ValueErrorType[ValueErrorType["BigIntMultipleOf"] = 12] = "BigIntMultipleOf";
    ValueErrorType[ValueErrorType["BigInt"] = 13] = "BigInt";
    ValueErrorType[ValueErrorType["Boolean"] = 14] = "Boolean";
    ValueErrorType[ValueErrorType["DateExclusiveMaximumTimestamp"] = 15] = "DateExclusiveMaximumTimestamp";
    ValueErrorType[ValueErrorType["DateExclusiveMinimumTimestamp"] = 16] = "DateExclusiveMinimumTimestamp";
    ValueErrorType[ValueErrorType["DateMaximumTimestamp"] = 17] = "DateMaximumTimestamp";
    ValueErrorType[ValueErrorType["DateMinimumTimestamp"] = 18] = "DateMinimumTimestamp";
    ValueErrorType[ValueErrorType["DateMultipleOfTimestamp"] = 19] = "DateMultipleOfTimestamp";
    ValueErrorType[ValueErrorType["Date"] = 20] = "Date";
    ValueErrorType[ValueErrorType["Function"] = 21] = "Function";
    ValueErrorType[ValueErrorType["IntegerExclusiveMaximum"] = 22] = "IntegerExclusiveMaximum";
    ValueErrorType[ValueErrorType["IntegerExclusiveMinimum"] = 23] = "IntegerExclusiveMinimum";
    ValueErrorType[ValueErrorType["IntegerMaximum"] = 24] = "IntegerMaximum";
    ValueErrorType[ValueErrorType["IntegerMinimum"] = 25] = "IntegerMinimum";
    ValueErrorType[ValueErrorType["IntegerMultipleOf"] = 26] = "IntegerMultipleOf";
    ValueErrorType[ValueErrorType["Integer"] = 27] = "Integer";
    ValueErrorType[ValueErrorType["IntersectUnevaluatedProperties"] = 28] = "IntersectUnevaluatedProperties";
    ValueErrorType[ValueErrorType["Intersect"] = 29] = "Intersect";
    ValueErrorType[ValueErrorType["Iterator"] = 30] = "Iterator";
    ValueErrorType[ValueErrorType["Kind"] = 31] = "Kind";
    ValueErrorType[ValueErrorType["Literal"] = 32] = "Literal";
    ValueErrorType[ValueErrorType["Never"] = 33] = "Never";
    ValueErrorType[ValueErrorType["Not"] = 34] = "Not";
    ValueErrorType[ValueErrorType["Null"] = 35] = "Null";
    ValueErrorType[ValueErrorType["NumberExclusiveMaximum"] = 36] = "NumberExclusiveMaximum";
    ValueErrorType[ValueErrorType["NumberExclusiveMinimum"] = 37] = "NumberExclusiveMinimum";
    ValueErrorType[ValueErrorType["NumberMaximum"] = 38] = "NumberMaximum";
    ValueErrorType[ValueErrorType["NumberMinimum"] = 39] = "NumberMinimum";
    ValueErrorType[ValueErrorType["NumberMultipleOf"] = 40] = "NumberMultipleOf";
    ValueErrorType[ValueErrorType["Number"] = 41] = "Number";
    ValueErrorType[ValueErrorType["ObjectAdditionalProperties"] = 42] = "ObjectAdditionalProperties";
    ValueErrorType[ValueErrorType["ObjectMaxProperties"] = 43] = "ObjectMaxProperties";
    ValueErrorType[ValueErrorType["ObjectMinProperties"] = 44] = "ObjectMinProperties";
    ValueErrorType[ValueErrorType["ObjectRequiredProperty"] = 45] = "ObjectRequiredProperty";
    ValueErrorType[ValueErrorType["Object"] = 46] = "Object";
    ValueErrorType[ValueErrorType["Promise"] = 47] = "Promise";
    ValueErrorType[ValueErrorType["RegExp"] = 48] = "RegExp";
    ValueErrorType[ValueErrorType["StringFormatUnknown"] = 49] = "StringFormatUnknown";
    ValueErrorType[ValueErrorType["StringFormat"] = 50] = "StringFormat";
    ValueErrorType[ValueErrorType["StringMaxLength"] = 51] = "StringMaxLength";
    ValueErrorType[ValueErrorType["StringMinLength"] = 52] = "StringMinLength";
    ValueErrorType[ValueErrorType["StringPattern"] = 53] = "StringPattern";
    ValueErrorType[ValueErrorType["String"] = 54] = "String";
    ValueErrorType[ValueErrorType["Symbol"] = 55] = "Symbol";
    ValueErrorType[ValueErrorType["TupleLength"] = 56] = "TupleLength";
    ValueErrorType[ValueErrorType["Tuple"] = 57] = "Tuple";
    ValueErrorType[ValueErrorType["Uint8ArrayMaxByteLength"] = 58] = "Uint8ArrayMaxByteLength";
    ValueErrorType[ValueErrorType["Uint8ArrayMinByteLength"] = 59] = "Uint8ArrayMinByteLength";
    ValueErrorType[ValueErrorType["Uint8Array"] = 60] = "Uint8Array";
    ValueErrorType[ValueErrorType["Undefined"] = 61] = "Undefined";
    ValueErrorType[ValueErrorType["Union"] = 62] = "Union";
    ValueErrorType[ValueErrorType["Void"] = 63] = "Void";
})(ValueErrorType || (ValueErrorType = {}));
// ------------------------------------------------------------------
// ValueErrors
// ------------------------------------------------------------------
class ValueErrorsUnknownTypeError extends TypeBoxError$1 {
    constructor(schema) {
        super('Unknown type');
        this.schema = schema;
    }
}
// ------------------------------------------------------------------
// EscapeKey
// ------------------------------------------------------------------
function EscapeKey(key) {
    return key.replace(/~/g, '~0').replace(/\//g, '~1'); // RFC6901 Path
}
// ------------------------------------------------------------------
// Guards
// ------------------------------------------------------------------
function IsDefined(value) {
    return value !== undefined;
}
// ------------------------------------------------------------------
// ValueErrorIterator
// ------------------------------------------------------------------
class ValueErrorIterator {
    constructor(iterator) {
        this.iterator = iterator;
    }
    [Symbol.iterator]() {
        return this.iterator;
    }
    /** Returns the first value error or undefined if no errors */
    First() {
        const next = this.iterator.next();
        return next.done ? undefined : next.value;
    }
}
// --------------------------------------------------------------------------
// Create
// --------------------------------------------------------------------------
function Create$1(errorType, schema, path, value, errors = []) {
    return {
        type: errorType,
        schema,
        path,
        value,
        message: GetErrorFunction()({ errorType, path, schema, value, errors }),
        errors,
    };
}
// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------
function* FromAny$1(schema, references, path, value) { }
function* FromArgument$1(schema, references, path, value) { }
function* FromArray$7(schema, references, path, value) {
    if (!IsArray$3(value)) {
        return yield Create$1(ValueErrorType.Array, schema, path, value);
    }
    if (IsDefined(schema.minItems) && !(value.length >= schema.minItems)) {
        yield Create$1(ValueErrorType.ArrayMinItems, schema, path, value);
    }
    if (IsDefined(schema.maxItems) && !(value.length <= schema.maxItems)) {
        yield Create$1(ValueErrorType.ArrayMaxItems, schema, path, value);
    }
    for (let i = 0; i < value.length; i++) {
        yield* Visit$6(schema.items, references, `${path}/${i}`, value[i]);
    }
    // prettier-ignore
    if (schema.uniqueItems === true && !((function () { const set = new Set(); for (const element of value) {
        const hashed = Hash(element);
        if (set.has(hashed)) {
            return false;
        }
        else {
            set.add(hashed);
        }
    } return true; })())) {
        yield Create$1(ValueErrorType.ArrayUniqueItems, schema, path, value);
    }
    // contains
    if (!(IsDefined(schema.contains) || IsDefined(schema.minContains) || IsDefined(schema.maxContains))) {
        return;
    }
    const containsSchema = IsDefined(schema.contains) ? schema.contains : Never();
    const containsCount = value.reduce((acc, value, index) => (Visit$6(containsSchema, references, `${path}${index}`, value).next().done === true ? acc + 1 : acc), 0);
    if (containsCount === 0) {
        yield Create$1(ValueErrorType.ArrayContains, schema, path, value);
    }
    if (IsNumber$3(schema.minContains) && containsCount < schema.minContains) {
        yield Create$1(ValueErrorType.ArrayMinContains, schema, path, value);
    }
    if (IsNumber$3(schema.maxContains) && containsCount > schema.maxContains) {
        yield Create$1(ValueErrorType.ArrayMaxContains, schema, path, value);
    }
}
function* FromAsyncIterator$2(schema, references, path, value) {
    if (!IsAsyncIterator$3(value))
        yield Create$1(ValueErrorType.AsyncIterator, schema, path, value);
}
function* FromBigInt$1(schema, references, path, value) {
    if (!IsBigInt$3(value))
        return yield Create$1(ValueErrorType.BigInt, schema, path, value);
    if (IsDefined(schema.exclusiveMaximum) && !(value < schema.exclusiveMaximum)) {
        yield Create$1(ValueErrorType.BigIntExclusiveMaximum, schema, path, value);
    }
    if (IsDefined(schema.exclusiveMinimum) && !(value > schema.exclusiveMinimum)) {
        yield Create$1(ValueErrorType.BigIntExclusiveMinimum, schema, path, value);
    }
    if (IsDefined(schema.maximum) && !(value <= schema.maximum)) {
        yield Create$1(ValueErrorType.BigIntMaximum, schema, path, value);
    }
    if (IsDefined(schema.minimum) && !(value >= schema.minimum)) {
        yield Create$1(ValueErrorType.BigIntMinimum, schema, path, value);
    }
    if (IsDefined(schema.multipleOf) && !(value % schema.multipleOf === BigInt(0))) {
        yield Create$1(ValueErrorType.BigIntMultipleOf, schema, path, value);
    }
}
function* FromBoolean$1(schema, references, path, value) {
    if (!IsBoolean$3(value))
        yield Create$1(ValueErrorType.Boolean, schema, path, value);
}
function* FromConstructor$2(schema, references, path, value) {
    yield* Visit$6(schema.returns, references, path, value.prototype);
}
function* FromDate$3(schema, references, path, value) {
    if (!IsDate$3(value))
        return yield Create$1(ValueErrorType.Date, schema, path, value);
    if (IsDefined(schema.exclusiveMaximumTimestamp) && !(value.getTime() < schema.exclusiveMaximumTimestamp)) {
        yield Create$1(ValueErrorType.DateExclusiveMaximumTimestamp, schema, path, value);
    }
    if (IsDefined(schema.exclusiveMinimumTimestamp) && !(value.getTime() > schema.exclusiveMinimumTimestamp)) {
        yield Create$1(ValueErrorType.DateExclusiveMinimumTimestamp, schema, path, value);
    }
    if (IsDefined(schema.maximumTimestamp) && !(value.getTime() <= schema.maximumTimestamp)) {
        yield Create$1(ValueErrorType.DateMaximumTimestamp, schema, path, value);
    }
    if (IsDefined(schema.minimumTimestamp) && !(value.getTime() >= schema.minimumTimestamp)) {
        yield Create$1(ValueErrorType.DateMinimumTimestamp, schema, path, value);
    }
    if (IsDefined(schema.multipleOfTimestamp) && !(value.getTime() % schema.multipleOfTimestamp === 0)) {
        yield Create$1(ValueErrorType.DateMultipleOfTimestamp, schema, path, value);
    }
}
function* FromFunction$2(schema, references, path, value) {
    if (!IsFunction$3(value))
        yield Create$1(ValueErrorType.Function, schema, path, value);
}
function* FromImport$6(schema, references, path, value) {
    const definitions = globalThis.Object.values(schema.$defs);
    const target = schema.$defs[schema.$ref];
    yield* Visit$6(target, [...references, ...definitions], path, value);
}
function* FromInteger$1(schema, references, path, value) {
    if (!IsInteger$3(value))
        return yield Create$1(ValueErrorType.Integer, schema, path, value);
    if (IsDefined(schema.exclusiveMaximum) && !(value < schema.exclusiveMaximum)) {
        yield Create$1(ValueErrorType.IntegerExclusiveMaximum, schema, path, value);
    }
    if (IsDefined(schema.exclusiveMinimum) && !(value > schema.exclusiveMinimum)) {
        yield Create$1(ValueErrorType.IntegerExclusiveMinimum, schema, path, value);
    }
    if (IsDefined(schema.maximum) && !(value <= schema.maximum)) {
        yield Create$1(ValueErrorType.IntegerMaximum, schema, path, value);
    }
    if (IsDefined(schema.minimum) && !(value >= schema.minimum)) {
        yield Create$1(ValueErrorType.IntegerMinimum, schema, path, value);
    }
    if (IsDefined(schema.multipleOf) && !(value % schema.multipleOf === 0)) {
        yield Create$1(ValueErrorType.IntegerMultipleOf, schema, path, value);
    }
}
function* FromIntersect$6(schema, references, path, value) {
    let hasError = false;
    for (const inner of schema.allOf) {
        for (const error of Visit$6(inner, references, path, value)) {
            hasError = true;
            yield error;
        }
    }
    if (hasError) {
        return yield Create$1(ValueErrorType.Intersect, schema, path, value);
    }
    if (schema.unevaluatedProperties === false) {
        const keyCheck = new RegExp(KeyOfPattern(schema));
        for (const valueKey of Object.getOwnPropertyNames(value)) {
            if (!keyCheck.test(valueKey)) {
                yield Create$1(ValueErrorType.IntersectUnevaluatedProperties, schema, `${path}/${valueKey}`, value);
            }
        }
    }
    if (typeof schema.unevaluatedProperties === 'object') {
        const keyCheck = new RegExp(KeyOfPattern(schema));
        for (const valueKey of Object.getOwnPropertyNames(value)) {
            if (!keyCheck.test(valueKey)) {
                const next = Visit$6(schema.unevaluatedProperties, references, `${path}/${valueKey}`, value[valueKey]).next();
                if (!next.done)
                    yield next.value; // yield interior
            }
        }
    }
}
function* FromIterator$2(schema, references, path, value) {
    if (!IsIterator$3(value))
        yield Create$1(ValueErrorType.Iterator, schema, path, value);
}
function* FromLiteral$1(schema, references, path, value) {
    if (!(value === schema.const))
        yield Create$1(ValueErrorType.Literal, schema, path, value);
}
function* FromNever$1(schema, references, path, value) {
    yield Create$1(ValueErrorType.Never, schema, path, value);
}
function* FromNot$4(schema, references, path, value) {
    if (Visit$6(schema.not, references, path, value).next().done === true)
        yield Create$1(ValueErrorType.Not, schema, path, value);
}
function* FromNull$1(schema, references, path, value) {
    if (!IsNull$3(value))
        yield Create$1(ValueErrorType.Null, schema, path, value);
}
function* FromNumber$1(schema, references, path, value) {
    if (!TypeSystemPolicy$1.IsNumberLike(value))
        return yield Create$1(ValueErrorType.Number, schema, path, value);
    if (IsDefined(schema.exclusiveMaximum) && !(value < schema.exclusiveMaximum)) {
        yield Create$1(ValueErrorType.NumberExclusiveMaximum, schema, path, value);
    }
    if (IsDefined(schema.exclusiveMinimum) && !(value > schema.exclusiveMinimum)) {
        yield Create$1(ValueErrorType.NumberExclusiveMinimum, schema, path, value);
    }
    if (IsDefined(schema.maximum) && !(value <= schema.maximum)) {
        yield Create$1(ValueErrorType.NumberMaximum, schema, path, value);
    }
    if (IsDefined(schema.minimum) && !(value >= schema.minimum)) {
        yield Create$1(ValueErrorType.NumberMinimum, schema, path, value);
    }
    if (IsDefined(schema.multipleOf) && !(value % schema.multipleOf === 0)) {
        yield Create$1(ValueErrorType.NumberMultipleOf, schema, path, value);
    }
}
function* FromObject$7(schema, references, path, value) {
    if (!TypeSystemPolicy$1.IsObjectLike(value))
        return yield Create$1(ValueErrorType.Object, schema, path, value);
    if (IsDefined(schema.minProperties) && !(Object.getOwnPropertyNames(value).length >= schema.minProperties)) {
        yield Create$1(ValueErrorType.ObjectMinProperties, schema, path, value);
    }
    if (IsDefined(schema.maxProperties) && !(Object.getOwnPropertyNames(value).length <= schema.maxProperties)) {
        yield Create$1(ValueErrorType.ObjectMaxProperties, schema, path, value);
    }
    const requiredKeys = Array.isArray(schema.required) ? schema.required : [];
    const knownKeys = Object.getOwnPropertyNames(schema.properties);
    const unknownKeys = Object.getOwnPropertyNames(value);
    for (const requiredKey of requiredKeys) {
        if (unknownKeys.includes(requiredKey))
            continue;
        yield Create$1(ValueErrorType.ObjectRequiredProperty, schema.properties[requiredKey], `${path}/${EscapeKey(requiredKey)}`, undefined);
    }
    if (schema.additionalProperties === false) {
        for (const valueKey of unknownKeys) {
            if (!knownKeys.includes(valueKey)) {
                yield Create$1(ValueErrorType.ObjectAdditionalProperties, schema, `${path}/${EscapeKey(valueKey)}`, value[valueKey]);
            }
        }
    }
    if (typeof schema.additionalProperties === 'object') {
        for (const valueKey of unknownKeys) {
            if (knownKeys.includes(valueKey))
                continue;
            yield* Visit$6(schema.additionalProperties, references, `${path}/${EscapeKey(valueKey)}`, value[valueKey]);
        }
    }
    for (const knownKey of knownKeys) {
        const property = schema.properties[knownKey];
        if (schema.required && schema.required.includes(knownKey)) {
            yield* Visit$6(property, references, `${path}/${EscapeKey(knownKey)}`, value[knownKey]);
            if (ExtendsUndefinedCheck(schema) && !(knownKey in value)) {
                yield Create$1(ValueErrorType.ObjectRequiredProperty, property, `${path}/${EscapeKey(knownKey)}`, undefined);
            }
        }
        else {
            if (TypeSystemPolicy$1.IsExactOptionalProperty(value, knownKey)) {
                yield* Visit$6(property, references, `${path}/${EscapeKey(knownKey)}`, value[knownKey]);
            }
        }
    }
}
function* FromPromise$2(schema, references, path, value) {
    if (!IsPromise$3(value))
        yield Create$1(ValueErrorType.Promise, schema, path, value);
}
function* FromRecord$6(schema, references, path, value) {
    if (!TypeSystemPolicy$1.IsRecordLike(value))
        return yield Create$1(ValueErrorType.Object, schema, path, value);
    if (IsDefined(schema.minProperties) && !(Object.getOwnPropertyNames(value).length >= schema.minProperties)) {
        yield Create$1(ValueErrorType.ObjectMinProperties, schema, path, value);
    }
    if (IsDefined(schema.maxProperties) && !(Object.getOwnPropertyNames(value).length <= schema.maxProperties)) {
        yield Create$1(ValueErrorType.ObjectMaxProperties, schema, path, value);
    }
    const [patternKey, patternSchema] = Object.entries(schema.patternProperties)[0];
    const regex = new RegExp(patternKey);
    for (const [propertyKey, propertyValue] of Object.entries(value)) {
        if (regex.test(propertyKey))
            yield* Visit$6(patternSchema, references, `${path}/${EscapeKey(propertyKey)}`, propertyValue);
    }
    if (typeof schema.additionalProperties === 'object') {
        for (const [propertyKey, propertyValue] of Object.entries(value)) {
            if (!regex.test(propertyKey))
                yield* Visit$6(schema.additionalProperties, references, `${path}/${EscapeKey(propertyKey)}`, propertyValue);
        }
    }
    if (schema.additionalProperties === false) {
        for (const [propertyKey, propertyValue] of Object.entries(value)) {
            if (regex.test(propertyKey))
                continue;
            return yield Create$1(ValueErrorType.ObjectAdditionalProperties, schema, `${path}/${EscapeKey(propertyKey)}`, propertyValue);
        }
    }
}
function* FromRef$6(schema, references, path, value) {
    yield* Visit$6(Deref(schema, references), references, path, value);
}
function* FromRegExp$1(schema, references, path, value) {
    if (!IsString$3(value))
        return yield Create$1(ValueErrorType.String, schema, path, value);
    if (IsDefined(schema.minLength) && !(value.length >= schema.minLength)) {
        yield Create$1(ValueErrorType.StringMinLength, schema, path, value);
    }
    if (IsDefined(schema.maxLength) && !(value.length <= schema.maxLength)) {
        yield Create$1(ValueErrorType.StringMaxLength, schema, path, value);
    }
    const regex = new RegExp(schema.source, schema.flags);
    if (!regex.test(value)) {
        return yield Create$1(ValueErrorType.RegExp, schema, path, value);
    }
}
function* FromString$1(schema, references, path, value) {
    if (!IsString$3(value))
        return yield Create$1(ValueErrorType.String, schema, path, value);
    if (IsDefined(schema.minLength) && !(value.length >= schema.minLength)) {
        yield Create$1(ValueErrorType.StringMinLength, schema, path, value);
    }
    if (IsDefined(schema.maxLength) && !(value.length <= schema.maxLength)) {
        yield Create$1(ValueErrorType.StringMaxLength, schema, path, value);
    }
    if (IsString$3(schema.pattern)) {
        const regex = new RegExp(schema.pattern);
        if (!regex.test(value)) {
            yield Create$1(ValueErrorType.StringPattern, schema, path, value);
        }
    }
    if (IsString$3(schema.format)) {
        if (!Has$2(schema.format)) {
            yield Create$1(ValueErrorType.StringFormatUnknown, schema, path, value);
        }
        else {
            const format = Get$2(schema.format);
            if (!format(value)) {
                yield Create$1(ValueErrorType.StringFormat, schema, path, value);
            }
        }
    }
}
function* FromSymbol$1(schema, references, path, value) {
    if (!IsSymbol$3(value))
        yield Create$1(ValueErrorType.Symbol, schema, path, value);
}
function* FromTemplateLiteral$1(schema, references, path, value) {
    if (!IsString$3(value))
        return yield Create$1(ValueErrorType.String, schema, path, value);
    const regex = new RegExp(schema.pattern);
    if (!regex.test(value)) {
        yield Create$1(ValueErrorType.StringPattern, schema, path, value);
    }
}
function* FromThis$6(schema, references, path, value) {
    yield* Visit$6(Deref(schema, references), references, path, value);
}
function* FromTuple$6(schema, references, path, value) {
    if (!IsArray$3(value))
        return yield Create$1(ValueErrorType.Tuple, schema, path, value);
    if (schema.items === undefined && !(value.length === 0)) {
        return yield Create$1(ValueErrorType.TupleLength, schema, path, value);
    }
    if (!(value.length === schema.maxItems)) {
        return yield Create$1(ValueErrorType.TupleLength, schema, path, value);
    }
    if (!schema.items) {
        return;
    }
    for (let i = 0; i < schema.items.length; i++) {
        yield* Visit$6(schema.items[i], references, `${path}/${i}`, value[i]);
    }
}
function* FromUndefined$1(schema, references, path, value) {
    if (!IsUndefined$3(value))
        yield Create$1(ValueErrorType.Undefined, schema, path, value);
}
function* FromUnion$6(schema, references, path, value) {
    if (Check(schema, references, value))
        return;
    const errors = schema.anyOf.map((variant) => new ValueErrorIterator(Visit$6(variant, references, path, value)));
    yield Create$1(ValueErrorType.Union, schema, path, value, errors);
}
function* FromUint8Array$1(schema, references, path, value) {
    if (!IsUint8Array$3(value))
        return yield Create$1(ValueErrorType.Uint8Array, schema, path, value);
    if (IsDefined(schema.maxByteLength) && !(value.length <= schema.maxByteLength)) {
        yield Create$1(ValueErrorType.Uint8ArrayMaxByteLength, schema, path, value);
    }
    if (IsDefined(schema.minByteLength) && !(value.length >= schema.minByteLength)) {
        yield Create$1(ValueErrorType.Uint8ArrayMinByteLength, schema, path, value);
    }
}
function* FromUnknown$1(schema, references, path, value) { }
function* FromVoid$1(schema, references, path, value) {
    if (!TypeSystemPolicy$1.IsVoidLike(value))
        yield Create$1(ValueErrorType.Void, schema, path, value);
}
function* FromKind$1(schema, references, path, value) {
    const check = Get$1(schema[Kind$2]);
    if (!check(schema, value))
        yield Create$1(ValueErrorType.Kind, schema, path, value);
}
function* Visit$6(schema, references, path, value) {
    const references_ = IsDefined(schema.$id) ? [...references, schema] : references;
    const schema_ = schema;
    switch (schema_[Kind$2]) {
        case 'Any':
            return yield* FromAny$1();
        case 'Argument':
            return yield* FromArgument$1();
        case 'Array':
            return yield* FromArray$7(schema_, references_, path, value);
        case 'AsyncIterator':
            return yield* FromAsyncIterator$2(schema_, references_, path, value);
        case 'BigInt':
            return yield* FromBigInt$1(schema_, references_, path, value);
        case 'Boolean':
            return yield* FromBoolean$1(schema_, references_, path, value);
        case 'Constructor':
            return yield* FromConstructor$2(schema_, references_, path, value);
        case 'Date':
            return yield* FromDate$3(schema_, references_, path, value);
        case 'Function':
            return yield* FromFunction$2(schema_, references_, path, value);
        case 'Import':
            return yield* FromImport$6(schema_, references_, path, value);
        case 'Integer':
            return yield* FromInteger$1(schema_, references_, path, value);
        case 'Intersect':
            return yield* FromIntersect$6(schema_, references_, path, value);
        case 'Iterator':
            return yield* FromIterator$2(schema_, references_, path, value);
        case 'Literal':
            return yield* FromLiteral$1(schema_, references_, path, value);
        case 'Never':
            return yield* FromNever$1(schema_, references_, path, value);
        case 'Not':
            return yield* FromNot$4(schema_, references_, path, value);
        case 'Null':
            return yield* FromNull$1(schema_, references_, path, value);
        case 'Number':
            return yield* FromNumber$1(schema_, references_, path, value);
        case 'Object':
            return yield* FromObject$7(schema_, references_, path, value);
        case 'Promise':
            return yield* FromPromise$2(schema_, references_, path, value);
        case 'Record':
            return yield* FromRecord$6(schema_, references_, path, value);
        case 'Ref':
            return yield* FromRef$6(schema_, references_, path, value);
        case 'RegExp':
            return yield* FromRegExp$1(schema_, references_, path, value);
        case 'String':
            return yield* FromString$1(schema_, references_, path, value);
        case 'Symbol':
            return yield* FromSymbol$1(schema_, references_, path, value);
        case 'TemplateLiteral':
            return yield* FromTemplateLiteral$1(schema_, references_, path, value);
        case 'This':
            return yield* FromThis$6(schema_, references_, path, value);
        case 'Tuple':
            return yield* FromTuple$6(schema_, references_, path, value);
        case 'Undefined':
            return yield* FromUndefined$1(schema_, references_, path, value);
        case 'Union':
            return yield* FromUnion$6(schema_, references_, path, value);
        case 'Uint8Array':
            return yield* FromUint8Array$1(schema_, references_, path, value);
        case 'Unknown':
            return yield* FromUnknown$1();
        case 'Void':
            return yield* FromVoid$1(schema_, references_, path, value);
        default:
            if (!Has$1(schema_[Kind$2]))
                throw new ValueErrorsUnknownTypeError(schema);
            return yield* FromKind$1(schema_, references_, path, value);
    }
}
/** Returns an iterator for each error in this value. */
function Errors(...args) {
    const iterator = args.length === 3 ? Visit$6(args[0], args[1], '', args[2]) : Visit$6(args[0], [], '', args[1]);
    return new ValueErrorIterator(iterator);
}

// ------------------------------------------------------------------
// ValueGuard
// ------------------------------------------------------------------
// ------------------------------------------------------------------
// Clonable
// ------------------------------------------------------------------
function FromObject$6(value) {
    const Acc = {};
    for (const key of Object.getOwnPropertyNames(value)) {
        Acc[key] = Clone(value[key]);
    }
    for (const key of Object.getOwnPropertySymbols(value)) {
        Acc[key] = Clone(value[key]);
    }
    return Acc;
}
function FromArray$6(value) {
    return value.map((element) => Clone(element));
}
function FromTypedArray(value) {
    return value.slice();
}
function FromMap(value) {
    return new Map(Clone([...value.entries()]));
}
function FromSet(value) {
    return new Set(Clone([...value.entries()]));
}
function FromDate$2(value) {
    return new Date(value.toISOString());
}
function FromValue(value) {
    return value;
}
// ------------------------------------------------------------------
// Clone
// ------------------------------------------------------------------
/** Returns a clone of the given value */
function Clone(value) {
    if (IsArray$3(value))
        return FromArray$6(value);
    if (IsDate$3(value))
        return FromDate$2(value);
    if (IsTypedArray(value))
        return FromTypedArray(value);
    if (IsMap(value))
        return FromMap(value);
    if (IsSet(value))
        return FromSet(value);
    if (IsObject$3(value))
        return FromObject$6(value);
    if (IsValueType(value))
        return FromValue(value);
    throw new Error('ValueClone: Unable to clone value');
}

// ------------------------------------------------------------------
// Errors
// ------------------------------------------------------------------
class ValueCreateError extends TypeBoxError$1 {
    constructor(schema, message) {
        super(message);
        this.schema = schema;
    }
}
// ------------------------------------------------------------------
// Default
// ------------------------------------------------------------------
function FromDefault(value) {
    return IsFunction$3(value) ? value() : Clone(value);
}
// ------------------------------------------------------------------
// Create
// ------------------------------------------------------------------
function FromAny(schema, references) {
    if (HasPropertyKey$1(schema, 'default')) {
        return FromDefault(schema.default);
    }
    else {
        return {};
    }
}
function FromArgument(schema, references) {
    return {};
}
function FromArray$5(schema, references) {
    if (schema.uniqueItems === true && !HasPropertyKey$1(schema, 'default')) {
        throw new ValueCreateError(schema, 'Array with the uniqueItems constraint requires a default value');
    }
    else if ('contains' in schema && !HasPropertyKey$1(schema, 'default')) {
        throw new ValueCreateError(schema, 'Array with the contains constraint requires a default value');
    }
    else if ('default' in schema) {
        return FromDefault(schema.default);
    }
    else if (schema.minItems !== undefined) {
        return Array.from({ length: schema.minItems }).map((item) => {
            return Visit$5(schema.items, references);
        });
    }
    else {
        return [];
    }
}
function FromAsyncIterator$1(schema, references) {
    if (HasPropertyKey$1(schema, 'default')) {
        return FromDefault(schema.default);
    }
    else {
        return (async function* () { })();
    }
}
function FromBigInt(schema, references) {
    if (HasPropertyKey$1(schema, 'default')) {
        return FromDefault(schema.default);
    }
    else {
        return BigInt(0);
    }
}
function FromBoolean(schema, references) {
    if (HasPropertyKey$1(schema, 'default')) {
        return FromDefault(schema.default);
    }
    else {
        return false;
    }
}
function FromConstructor$1(schema, references) {
    if (HasPropertyKey$1(schema, 'default')) {
        return FromDefault(schema.default);
    }
    else {
        const value = Visit$5(schema.returns, references);
        if (typeof value === 'object' && !Array.isArray(value)) {
            return class {
                constructor() {
                    for (const [key, val] of Object.entries(value)) {
                        const self = this;
                        self[key] = val;
                    }
                }
            };
        }
        else {
            return class {
            };
        }
    }
}
function FromDate$1(schema, references) {
    if (HasPropertyKey$1(schema, 'default')) {
        return FromDefault(schema.default);
    }
    else if (schema.minimumTimestamp !== undefined) {
        return new Date(schema.minimumTimestamp);
    }
    else {
        return new Date();
    }
}
function FromFunction$1(schema, references) {
    if (HasPropertyKey$1(schema, 'default')) {
        return FromDefault(schema.default);
    }
    else {
        return () => Visit$5(schema.returns, references);
    }
}
function FromImport$5(schema, references) {
    const definitions = globalThis.Object.values(schema.$defs);
    const target = schema.$defs[schema.$ref];
    return Visit$5(target, [...references, ...definitions]);
}
function FromInteger(schema, references) {
    if (HasPropertyKey$1(schema, 'default')) {
        return FromDefault(schema.default);
    }
    else if (schema.minimum !== undefined) {
        return schema.minimum;
    }
    else {
        return 0;
    }
}
function FromIntersect$5(schema, references) {
    if (HasPropertyKey$1(schema, 'default')) {
        return FromDefault(schema.default);
    }
    else {
        // --------------------------------------------------------------
        // Note: The best we can do here is attempt to instance each
        // sub type and apply through object assign. For non-object
        // sub types, we just escape the assignment and just return
        // the value. In the latter case, this is typically going to
        // be a consequence of an illogical intersection.
        // --------------------------------------------------------------
        const value = schema.allOf.reduce((acc, schema) => {
            const next = Visit$5(schema, references);
            return typeof next === 'object' ? { ...acc, ...next } : next;
        }, {});
        if (!Check(schema, references, value))
            throw new ValueCreateError(schema, 'Intersect produced invalid value. Consider using a default value.');
        return value;
    }
}
function FromIterator$1(schema, references) {
    if (HasPropertyKey$1(schema, 'default')) {
        return FromDefault(schema.default);
    }
    else {
        return (function* () { })();
    }
}
function FromLiteral(schema, references) {
    if (HasPropertyKey$1(schema, 'default')) {
        return FromDefault(schema.default);
    }
    else {
        return schema.const;
    }
}
function FromNever(schema, references) {
    if (HasPropertyKey$1(schema, 'default')) {
        return FromDefault(schema.default);
    }
    else {
        throw new ValueCreateError(schema, 'Never types cannot be created. Consider using a default value.');
    }
}
function FromNot$3(schema, references) {
    if (HasPropertyKey$1(schema, 'default')) {
        return FromDefault(schema.default);
    }
    else {
        throw new ValueCreateError(schema, 'Not types must have a default value');
    }
}
function FromNull(schema, references) {
    if (HasPropertyKey$1(schema, 'default')) {
        return FromDefault(schema.default);
    }
    else {
        return null;
    }
}
function FromNumber(schema, references) {
    if (HasPropertyKey$1(schema, 'default')) {
        return FromDefault(schema.default);
    }
    else if (schema.minimum !== undefined) {
        return schema.minimum;
    }
    else {
        return 0;
    }
}
function FromObject$5(schema, references) {
    if (HasPropertyKey$1(schema, 'default')) {
        return FromDefault(schema.default);
    }
    else {
        const required = new Set(schema.required);
        const Acc = {};
        for (const [key, subschema] of Object.entries(schema.properties)) {
            if (!required.has(key))
                continue;
            Acc[key] = Visit$5(subschema, references);
        }
        return Acc;
    }
}
function FromPromise$1(schema, references) {
    if (HasPropertyKey$1(schema, 'default')) {
        return FromDefault(schema.default);
    }
    else {
        return Promise.resolve(Visit$5(schema.item, references));
    }
}
function FromRecord$5(schema, references) {
    if (HasPropertyKey$1(schema, 'default')) {
        return FromDefault(schema.default);
    }
    else {
        return {};
    }
}
function FromRef$5(schema, references) {
    if (HasPropertyKey$1(schema, 'default')) {
        return FromDefault(schema.default);
    }
    else {
        return Visit$5(Deref(schema, references), references);
    }
}
function FromRegExp(schema, references) {
    if (HasPropertyKey$1(schema, 'default')) {
        return FromDefault(schema.default);
    }
    else {
        throw new ValueCreateError(schema, 'RegExp types cannot be created. Consider using a default value.');
    }
}
function FromString(schema, references) {
    if (schema.pattern !== undefined) {
        if (!HasPropertyKey$1(schema, 'default')) {
            throw new ValueCreateError(schema, 'String types with patterns must specify a default value');
        }
        else {
            return FromDefault(schema.default);
        }
    }
    else if (schema.format !== undefined) {
        if (!HasPropertyKey$1(schema, 'default')) {
            throw new ValueCreateError(schema, 'String types with formats must specify a default value');
        }
        else {
            return FromDefault(schema.default);
        }
    }
    else {
        if (HasPropertyKey$1(schema, 'default')) {
            return FromDefault(schema.default);
        }
        else if (schema.minLength !== undefined) {
            // prettier-ignore
            return Array.from({ length: schema.minLength }).map(() => ' ').join('');
        }
        else {
            return '';
        }
    }
}
function FromSymbol(schema, references) {
    if (HasPropertyKey$1(schema, 'default')) {
        return FromDefault(schema.default);
    }
    else if ('value' in schema) {
        return Symbol.for(schema.value);
    }
    else {
        return Symbol();
    }
}
function FromTemplateLiteral(schema, references) {
    if (HasPropertyKey$1(schema, 'default')) {
        return FromDefault(schema.default);
    }
    if (!IsTemplateLiteralFinite(schema))
        throw new ValueCreateError(schema, 'Can only create template literals that produce a finite variants. Consider using a default value.');
    const generated = TemplateLiteralGenerate(schema);
    return generated[0];
}
function FromThis$5(schema, references) {
    if (recursiveDepth++ > recursiveMaxDepth)
        throw new ValueCreateError(schema, 'Cannot create recursive type as it appears possibly infinite. Consider using a default.');
    if (HasPropertyKey$1(schema, 'default')) {
        return FromDefault(schema.default);
    }
    else {
        return Visit$5(Deref(schema, references), references);
    }
}
function FromTuple$5(schema, references) {
    if (HasPropertyKey$1(schema, 'default')) {
        return FromDefault(schema.default);
    }
    if (schema.items === undefined) {
        return [];
    }
    else {
        return Array.from({ length: schema.minItems }).map((_, index) => Visit$5(schema.items[index], references));
    }
}
function FromUndefined(schema, references) {
    if (HasPropertyKey$1(schema, 'default')) {
        return FromDefault(schema.default);
    }
    else {
        return undefined;
    }
}
function FromUnion$5(schema, references) {
    if (HasPropertyKey$1(schema, 'default')) {
        return FromDefault(schema.default);
    }
    else if (schema.anyOf.length === 0) {
        throw new Error('ValueCreate.Union: Cannot create Union with zero variants');
    }
    else {
        return Visit$5(schema.anyOf[0], references);
    }
}
function FromUint8Array(schema, references) {
    if (HasPropertyKey$1(schema, 'default')) {
        return FromDefault(schema.default);
    }
    else if (schema.minByteLength !== undefined) {
        return new Uint8Array(schema.minByteLength);
    }
    else {
        return new Uint8Array(0);
    }
}
function FromUnknown(schema, references) {
    if (HasPropertyKey$1(schema, 'default')) {
        return FromDefault(schema.default);
    }
    else {
        return {};
    }
}
function FromVoid(schema, references) {
    if (HasPropertyKey$1(schema, 'default')) {
        return FromDefault(schema.default);
    }
    else {
        return void 0;
    }
}
function FromKind(schema, references) {
    if (HasPropertyKey$1(schema, 'default')) {
        return FromDefault(schema.default);
    }
    else {
        throw new Error('User defined types must specify a default value');
    }
}
function Visit$5(schema, references) {
    const references_ = Pushref(schema, references);
    const schema_ = schema;
    switch (schema_[Kind$2]) {
        case 'Any':
            return FromAny(schema_);
        case 'Argument':
            return FromArgument();
        case 'Array':
            return FromArray$5(schema_, references_);
        case 'AsyncIterator':
            return FromAsyncIterator$1(schema_);
        case 'BigInt':
            return FromBigInt(schema_);
        case 'Boolean':
            return FromBoolean(schema_);
        case 'Constructor':
            return FromConstructor$1(schema_, references_);
        case 'Date':
            return FromDate$1(schema_);
        case 'Function':
            return FromFunction$1(schema_, references_);
        case 'Import':
            return FromImport$5(schema_, references_);
        case 'Integer':
            return FromInteger(schema_);
        case 'Intersect':
            return FromIntersect$5(schema_, references_);
        case 'Iterator':
            return FromIterator$1(schema_);
        case 'Literal':
            return FromLiteral(schema_);
        case 'Never':
            return FromNever(schema_);
        case 'Not':
            return FromNot$3(schema_);
        case 'Null':
            return FromNull(schema_);
        case 'Number':
            return FromNumber(schema_);
        case 'Object':
            return FromObject$5(schema_, references_);
        case 'Promise':
            return FromPromise$1(schema_, references_);
        case 'Record':
            return FromRecord$5(schema_);
        case 'Ref':
            return FromRef$5(schema_, references_);
        case 'RegExp':
            return FromRegExp(schema_);
        case 'String':
            return FromString(schema_);
        case 'Symbol':
            return FromSymbol(schema_);
        case 'TemplateLiteral':
            return FromTemplateLiteral(schema_);
        case 'This':
            return FromThis$5(schema_, references_);
        case 'Tuple':
            return FromTuple$5(schema_, references_);
        case 'Undefined':
            return FromUndefined(schema_);
        case 'Union':
            return FromUnion$5(schema_, references_);
        case 'Uint8Array':
            return FromUint8Array(schema_);
        case 'Unknown':
            return FromUnknown(schema_);
        case 'Void':
            return FromVoid(schema_);
        default:
            if (!Has$1(schema_[Kind$2]))
                throw new ValueCreateError(schema_, 'Unknown type');
            return FromKind(schema_);
    }
}
// ------------------------------------------------------------------
// State
// ------------------------------------------------------------------
const recursiveMaxDepth = 512;
let recursiveDepth = 0;
/** Creates a value from the given schema */
function Create(...args) {
    recursiveDepth = 0;
    return args.length === 2 ? Visit$5(args[0], args[1]) : Visit$5(args[0], []);
}

// ------------------------------------------------------------------
// IsCheckable
// ------------------------------------------------------------------
function IsCheckable(schema) {
    return IsKind$2(schema) && schema[Kind$2] !== 'Unsafe';
}
// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------
function FromArray$4(schema, references, value) {
    if (!IsArray$3(value))
        return value;
    return value.map((value) => Visit$4(schema.items, references, value));
}
function FromImport$4(schema, references, value) {
    const definitions = globalThis.Object.values(schema.$defs);
    const target = schema.$defs[schema.$ref];
    return Visit$4(target, [...references, ...definitions], value);
}
function FromIntersect$4(schema, references, value) {
    const unevaluatedProperties = schema.unevaluatedProperties;
    const intersections = schema.allOf.map((schema) => Visit$4(schema, references, Clone(value)));
    const composite = intersections.reduce((acc, value) => (IsObject$3(value) ? { ...acc, ...value } : value), {});
    if (!IsObject$3(value) || !IsObject$3(composite) || !IsKind$2(unevaluatedProperties))
        return composite;
    const knownkeys = KeyOfPropertyKeys(schema);
    for (const key of Object.getOwnPropertyNames(value)) {
        if (knownkeys.includes(key))
            continue;
        if (Check(unevaluatedProperties, references, value[key])) {
            composite[key] = Visit$4(unevaluatedProperties, references, value[key]);
        }
    }
    return composite;
}
function FromObject$4(schema, references, value) {
    if (!IsObject$3(value) || IsArray$3(value))
        return value; // Check IsArray for AllowArrayObject configuration
    const additionalProperties = schema.additionalProperties;
    for (const key of Object.getOwnPropertyNames(value)) {
        if (HasPropertyKey$1(schema.properties, key)) {
            value[key] = Visit$4(schema.properties[key], references, value[key]);
            continue;
        }
        if (IsKind$2(additionalProperties) && Check(additionalProperties, references, value[key])) {
            value[key] = Visit$4(additionalProperties, references, value[key]);
            continue;
        }
        delete value[key];
    }
    return value;
}
function FromRecord$4(schema, references, value) {
    if (!IsObject$3(value))
        return value;
    const additionalProperties = schema.additionalProperties;
    const propertyKeys = Object.getOwnPropertyNames(value);
    const [propertyKey, propertySchema] = Object.entries(schema.patternProperties)[0];
    const propertyKeyTest = new RegExp(propertyKey);
    for (const key of propertyKeys) {
        if (propertyKeyTest.test(key)) {
            value[key] = Visit$4(propertySchema, references, value[key]);
            continue;
        }
        if (IsKind$2(additionalProperties) && Check(additionalProperties, references, value[key])) {
            value[key] = Visit$4(additionalProperties, references, value[key]);
            continue;
        }
        delete value[key];
    }
    return value;
}
function FromRef$4(schema, references, value) {
    return Visit$4(Deref(schema, references), references, value);
}
function FromThis$4(schema, references, value) {
    return Visit$4(Deref(schema, references), references, value);
}
function FromTuple$4(schema, references, value) {
    if (!IsArray$3(value))
        return value;
    if (IsUndefined$3(schema.items))
        return [];
    const length = Math.min(value.length, schema.items.length);
    for (let i = 0; i < length; i++) {
        value[i] = Visit$4(schema.items[i], references, value[i]);
    }
    // prettier-ignore
    return value.length > length
        ? value.slice(0, length)
        : value;
}
function FromUnion$4(schema, references, value) {
    for (const inner of schema.anyOf) {
        if (IsCheckable(inner) && Check(inner, references, value)) {
            return Visit$4(inner, references, value);
        }
    }
    return value;
}
function Visit$4(schema, references, value) {
    const references_ = IsString$3(schema.$id) ? Pushref(schema, references) : references;
    const schema_ = schema;
    switch (schema_[Kind$2]) {
        case 'Array':
            return FromArray$4(schema_, references_, value);
        case 'Import':
            return FromImport$4(schema_, references_, value);
        case 'Intersect':
            return FromIntersect$4(schema_, references_, value);
        case 'Object':
            return FromObject$4(schema_, references_, value);
        case 'Record':
            return FromRecord$4(schema_, references_, value);
        case 'Ref':
            return FromRef$4(schema_, references_, value);
        case 'This':
            return FromThis$4(schema_, references_, value);
        case 'Tuple':
            return FromTuple$4(schema_, references_, value);
        case 'Union':
            return FromUnion$4(schema_, references_, value);
        default:
            return value;
    }
}
/** `[Mutable]` Removes excess properties from a value and returns the result. This function does not check the value and returns an unknown type. You should Check the result before use. Clean is a mutable operation. To avoid mutation, Clone the value first. */
function Clean(...args) {
    return args.length === 3 ? Visit$4(args[0], args[1], args[2]) : Visit$4(args[0], [], args[1]);
}

// ------------------------------------------------------------------
// Errors
// ------------------------------------------------------------------
// thrown externally
// prettier-ignore
class TransformDecodeCheckError extends TypeBoxError$1 {
    constructor(schema, value, error) {
        super(`Unable to decode value as it does not match the expected schema`);
        this.schema = schema;
        this.value = value;
        this.error = error;
    }
}
// prettier-ignore
class TransformDecodeError extends TypeBoxError$1 {
    constructor(schema, path, value, error) {
        super(error instanceof Error ? error.message : 'Unknown error');
        this.schema = schema;
        this.path = path;
        this.value = value;
        this.error = error;
    }
}
// ------------------------------------------------------------------
// Decode
// ------------------------------------------------------------------
// prettier-ignore
function Default$2(schema, path, value) {
    try {
        return IsTransform$2(schema) ? schema[TransformKind$1].Decode(value) : value;
    }
    catch (error) {
        throw new TransformDecodeError(schema, path, value, error);
    }
}
// prettier-ignore
function FromArray$3(schema, references, path, value) {
    return (IsArray$3(value))
        ? Default$2(schema, path, value.map((value, index) => Visit$3(schema.items, references, `${path}/${index}`, value)))
        : Default$2(schema, path, value);
}
// prettier-ignore
function FromIntersect$3(schema, references, path, value) {
    if (!IsObject$3(value) || IsValueType(value))
        return Default$2(schema, path, value);
    const knownEntries = KeyOfPropertyEntries(schema);
    const knownKeys = knownEntries.map(entry => entry[0]);
    const knownProperties = { ...value };
    for (const [knownKey, knownSchema] of knownEntries)
        if (knownKey in knownProperties) {
            knownProperties[knownKey] = Visit$3(knownSchema, references, `${path}/${knownKey}`, knownProperties[knownKey]);
        }
    if (!IsTransform$2(schema.unevaluatedProperties)) {
        return Default$2(schema, path, knownProperties);
    }
    const unknownKeys = Object.getOwnPropertyNames(knownProperties);
    const unevaluatedProperties = schema.unevaluatedProperties;
    const unknownProperties = { ...knownProperties };
    for (const key of unknownKeys)
        if (!knownKeys.includes(key)) {
            unknownProperties[key] = Default$2(unevaluatedProperties, `${path}/${key}`, unknownProperties[key]);
        }
    return Default$2(schema, path, unknownProperties);
}
// prettier-ignore
function FromImport$3(schema, references, path, value) {
    const additional = globalThis.Object.values(schema.$defs);
    const target = schema.$defs[schema.$ref];
    const result = Visit$3(target, [...references, ...additional], path, value);
    return Default$2(schema, path, result);
}
function FromNot$2(schema, references, path, value) {
    return Default$2(schema, path, Visit$3(schema.not, references, path, value));
}
// prettier-ignore
function FromObject$3(schema, references, path, value) {
    if (!IsObject$3(value))
        return Default$2(schema, path, value);
    const knownKeys = KeyOfPropertyKeys(schema);
    const knownProperties = { ...value };
    for (const key of knownKeys) {
        if (!HasPropertyKey$1(knownProperties, key))
            continue;
        // if the property value is undefined, but the target is not, nor does it satisfy exact optional 
        // property policy, then we need to continue. This is a special case for optional property handling 
        // where a transforms wrapped in a optional modifiers should not run.
        if (IsUndefined$3(knownProperties[key]) && (!IsUndefined$2(schema.properties[key]) ||
            TypeSystemPolicy$1.IsExactOptionalProperty(knownProperties, key)))
            continue;
        // decode property
        knownProperties[key] = Visit$3(schema.properties[key], references, `${path}/${key}`, knownProperties[key]);
    }
    if (!IsSchema$2(schema.additionalProperties)) {
        return Default$2(schema, path, knownProperties);
    }
    const unknownKeys = Object.getOwnPropertyNames(knownProperties);
    const additionalProperties = schema.additionalProperties;
    const unknownProperties = { ...knownProperties };
    for (const key of unknownKeys)
        if (!knownKeys.includes(key)) {
            unknownProperties[key] = Default$2(additionalProperties, `${path}/${key}`, unknownProperties[key]);
        }
    return Default$2(schema, path, unknownProperties);
}
// prettier-ignore
function FromRecord$3(schema, references, path, value) {
    if (!IsObject$3(value))
        return Default$2(schema, path, value);
    const pattern = Object.getOwnPropertyNames(schema.patternProperties)[0];
    const knownKeys = new RegExp(pattern);
    const knownProperties = { ...value };
    for (const key of Object.getOwnPropertyNames(value))
        if (knownKeys.test(key)) {
            knownProperties[key] = Visit$3(schema.patternProperties[pattern], references, `${path}/${key}`, knownProperties[key]);
        }
    if (!IsSchema$2(schema.additionalProperties)) {
        return Default$2(schema, path, knownProperties);
    }
    const unknownKeys = Object.getOwnPropertyNames(knownProperties);
    const additionalProperties = schema.additionalProperties;
    const unknownProperties = { ...knownProperties };
    for (const key of unknownKeys)
        if (!knownKeys.test(key)) {
            unknownProperties[key] = Default$2(additionalProperties, `${path}/${key}`, unknownProperties[key]);
        }
    return Default$2(schema, path, unknownProperties);
}
// prettier-ignore
function FromRef$3(schema, references, path, value) {
    const target = Deref(schema, references);
    return Default$2(schema, path, Visit$3(target, references, path, value));
}
// prettier-ignore
function FromThis$3(schema, references, path, value) {
    const target = Deref(schema, references);
    return Default$2(schema, path, Visit$3(target, references, path, value));
}
// prettier-ignore
function FromTuple$3(schema, references, path, value) {
    return (IsArray$3(value) && IsArray$3(schema.items))
        ? Default$2(schema, path, schema.items.map((schema, index) => Visit$3(schema, references, `${path}/${index}`, value[index])))
        : Default$2(schema, path, value);
}
// prettier-ignore
function FromUnion$3(schema, references, path, value) {
    for (const subschema of schema.anyOf) {
        if (!Check(subschema, references, value))
            continue;
        // note: ensure interior is decoded first
        const decoded = Visit$3(subschema, references, path, value);
        return Default$2(schema, path, decoded);
    }
    return Default$2(schema, path, value);
}
// prettier-ignore
function Visit$3(schema, references, path, value) {
    const references_ = Pushref(schema, references);
    const schema_ = schema;
    switch (schema[Kind$2]) {
        case 'Array':
            return FromArray$3(schema_, references_, path, value);
        case 'Import':
            return FromImport$3(schema_, references_, path, value);
        case 'Intersect':
            return FromIntersect$3(schema_, references_, path, value);
        case 'Not':
            return FromNot$2(schema_, references_, path, value);
        case 'Object':
            return FromObject$3(schema_, references_, path, value);
        case 'Record':
            return FromRecord$3(schema_, references_, path, value);
        case 'Ref':
            return FromRef$3(schema_, references_, path, value);
        case 'Symbol':
            return Default$2(schema_, path, value);
        case 'This':
            return FromThis$3(schema_, references_, path, value);
        case 'Tuple':
            return FromTuple$3(schema_, references_, path, value);
        case 'Union':
            return FromUnion$3(schema_, references_, path, value);
        default:
            return Default$2(schema_, path, value);
    }
}
/**
 * `[Internal]` Decodes the value and returns the result. This function requires that
 * the caller `Check` the value before use. Passing unchecked values may result in
 * undefined behavior. Refer to the `Value.Decode()` for implementation details.
 */
function TransformDecode(schema, references, value) {
    return Visit$3(schema, references, '', value);
}

// ------------------------------------------------------------------
// Errors
// ------------------------------------------------------------------
// prettier-ignore
class TransformEncodeCheckError extends TypeBoxError$1 {
    constructor(schema, value, error) {
        super(`The encoded value does not match the expected schema`);
        this.schema = schema;
        this.value = value;
        this.error = error;
    }
}
// prettier-ignore
class TransformEncodeError extends TypeBoxError$1 {
    constructor(schema, path, value, error) {
        super(`${error instanceof Error ? error.message : 'Unknown error'}`);
        this.schema = schema;
        this.path = path;
        this.value = value;
        this.error = error;
    }
}
// ------------------------------------------------------------------
// Encode
// ------------------------------------------------------------------
// prettier-ignore
function Default$1(schema, path, value) {
    try {
        return IsTransform$2(schema) ? schema[TransformKind$1].Encode(value) : value;
    }
    catch (error) {
        throw new TransformEncodeError(schema, path, value, error);
    }
}
// prettier-ignore
function FromArray$2(schema, references, path, value) {
    const defaulted = Default$1(schema, path, value);
    return IsArray$3(defaulted)
        ? defaulted.map((value, index) => Visit$2(schema.items, references, `${path}/${index}`, value))
        : defaulted;
}
// prettier-ignore
function FromImport$2(schema, references, path, value) {
    const additional = globalThis.Object.values(schema.$defs);
    const target = schema.$defs[schema.$ref];
    const result = Default$1(schema, path, value);
    return Visit$2(target, [...references, ...additional], path, result);
}
// prettier-ignore
function FromIntersect$2(schema, references, path, value) {
    const defaulted = Default$1(schema, path, value);
    if (!IsObject$3(value) || IsValueType(value))
        return defaulted;
    const knownEntries = KeyOfPropertyEntries(schema);
    const knownKeys = knownEntries.map(entry => entry[0]);
    const knownProperties = { ...defaulted };
    for (const [knownKey, knownSchema] of knownEntries)
        if (knownKey in knownProperties) {
            knownProperties[knownKey] = Visit$2(knownSchema, references, `${path}/${knownKey}`, knownProperties[knownKey]);
        }
    if (!IsTransform$2(schema.unevaluatedProperties)) {
        return knownProperties;
    }
    const unknownKeys = Object.getOwnPropertyNames(knownProperties);
    const unevaluatedProperties = schema.unevaluatedProperties;
    const properties = { ...knownProperties };
    for (const key of unknownKeys)
        if (!knownKeys.includes(key)) {
            properties[key] = Default$1(unevaluatedProperties, `${path}/${key}`, properties[key]);
        }
    return properties;
}
// prettier-ignore
function FromNot$1(schema, references, path, value) {
    return Default$1(schema.not, path, Default$1(schema, path, value));
}
// prettier-ignore
function FromObject$2(schema, references, path, value) {
    const defaulted = Default$1(schema, path, value);
    if (!IsObject$3(defaulted))
        return defaulted;
    const knownKeys = KeyOfPropertyKeys(schema);
    const knownProperties = { ...defaulted };
    for (const key of knownKeys) {
        if (!HasPropertyKey$1(knownProperties, key))
            continue;
        // if the property value is undefined, but the target is not, nor does it satisfy exact optional 
        // property policy, then we need to continue. This is a special case for optional property handling 
        // where a transforms wrapped in a optional modifiers should not run.
        if (IsUndefined$3(knownProperties[key]) && (!IsUndefined$2(schema.properties[key]) ||
            TypeSystemPolicy$1.IsExactOptionalProperty(knownProperties, key)))
            continue;
        // encode property
        knownProperties[key] = Visit$2(schema.properties[key], references, `${path}/${key}`, knownProperties[key]);
    }
    if (!IsSchema$2(schema.additionalProperties)) {
        return knownProperties;
    }
    const unknownKeys = Object.getOwnPropertyNames(knownProperties);
    const additionalProperties = schema.additionalProperties;
    const properties = { ...knownProperties };
    for (const key of unknownKeys)
        if (!knownKeys.includes(key)) {
            properties[key] = Default$1(additionalProperties, `${path}/${key}`, properties[key]);
        }
    return properties;
}
// prettier-ignore
function FromRecord$2(schema, references, path, value) {
    const defaulted = Default$1(schema, path, value);
    if (!IsObject$3(value))
        return defaulted;
    const pattern = Object.getOwnPropertyNames(schema.patternProperties)[0];
    const knownKeys = new RegExp(pattern);
    const knownProperties = { ...defaulted };
    for (const key of Object.getOwnPropertyNames(value))
        if (knownKeys.test(key)) {
            knownProperties[key] = Visit$2(schema.patternProperties[pattern], references, `${path}/${key}`, knownProperties[key]);
        }
    if (!IsSchema$2(schema.additionalProperties)) {
        return knownProperties;
    }
    const unknownKeys = Object.getOwnPropertyNames(knownProperties);
    const additionalProperties = schema.additionalProperties;
    const properties = { ...knownProperties };
    for (const key of unknownKeys)
        if (!knownKeys.test(key)) {
            properties[key] = Default$1(additionalProperties, `${path}/${key}`, properties[key]);
        }
    return properties;
}
// prettier-ignore
function FromRef$2(schema, references, path, value) {
    const target = Deref(schema, references);
    const resolved = Visit$2(target, references, path, value);
    return Default$1(schema, path, resolved);
}
// prettier-ignore
function FromThis$2(schema, references, path, value) {
    const target = Deref(schema, references);
    const resolved = Visit$2(target, references, path, value);
    return Default$1(schema, path, resolved);
}
// prettier-ignore
function FromTuple$2(schema, references, path, value) {
    const value1 = Default$1(schema, path, value);
    return IsArray$3(schema.items) ? schema.items.map((schema, index) => Visit$2(schema, references, `${path}/${index}`, value1[index])) : [];
}
// prettier-ignore
function FromUnion$2(schema, references, path, value) {
    // test value against union variants
    for (const subschema of schema.anyOf) {
        if (!Check(subschema, references, value))
            continue;
        const value1 = Visit$2(subschema, references, path, value);
        return Default$1(schema, path, value1);
    }
    // test transformed value against union variants
    for (const subschema of schema.anyOf) {
        const value1 = Visit$2(subschema, references, path, value);
        if (!Check(schema, references, value1))
            continue;
        return Default$1(schema, path, value1);
    }
    return Default$1(schema, path, value);
}
// prettier-ignore
function Visit$2(schema, references, path, value) {
    const references_ = Pushref(schema, references);
    const schema_ = schema;
    switch (schema[Kind$2]) {
        case 'Array':
            return FromArray$2(schema_, references_, path, value);
        case 'Import':
            return FromImport$2(schema_, references_, path, value);
        case 'Intersect':
            return FromIntersect$2(schema_, references_, path, value);
        case 'Not':
            return FromNot$1(schema_, references_, path, value);
        case 'Object':
            return FromObject$2(schema_, references_, path, value);
        case 'Record':
            return FromRecord$2(schema_, references_, path, value);
        case 'Ref':
            return FromRef$2(schema_, references_, path, value);
        case 'This':
            return FromThis$2(schema_, references_, path, value);
        case 'Tuple':
            return FromTuple$2(schema_, references_, path, value);
        case 'Union':
            return FromUnion$2(schema_, references_, path, value);
        default:
            return Default$1(schema_, path, value);
    }
}
/**
 * `[Internal]` Encodes the value and returns the result. This function expects the
 * caller to pass a statically checked value. This function does not check the encoded
 * result, meaning the result should be passed to `Check` before use. Refer to the
 * `Value.Encode()` function for implementation details.
 */
function TransformEncode(schema, references, value) {
    return Visit$2(schema, references, '', value);
}

// prettier-ignore
function FromArray$1(schema, references) {
    return IsTransform$2(schema) || Visit$1(schema.items, references);
}
// prettier-ignore
function FromAsyncIterator(schema, references) {
    return IsTransform$2(schema) || Visit$1(schema.items, references);
}
// prettier-ignore
function FromConstructor(schema, references) {
    return IsTransform$2(schema) || Visit$1(schema.returns, references) || schema.parameters.some((schema) => Visit$1(schema, references));
}
// prettier-ignore
function FromFunction(schema, references) {
    return IsTransform$2(schema) || Visit$1(schema.returns, references) || schema.parameters.some((schema) => Visit$1(schema, references));
}
// prettier-ignore
function FromIntersect$1(schema, references) {
    return IsTransform$2(schema) || IsTransform$2(schema.unevaluatedProperties) || schema.allOf.some((schema) => Visit$1(schema, references));
}
// prettier-ignore
function FromImport$1(schema, references) {
    const additional = globalThis.Object.getOwnPropertyNames(schema.$defs).reduce((result, key) => [...result, schema.$defs[key]], []);
    const target = schema.$defs[schema.$ref];
    return IsTransform$2(schema) || Visit$1(target, [...additional, ...references]);
}
// prettier-ignore
function FromIterator(schema, references) {
    return IsTransform$2(schema) || Visit$1(schema.items, references);
}
// prettier-ignore
function FromNot(schema, references) {
    return IsTransform$2(schema) || Visit$1(schema.not, references);
}
// prettier-ignore
function FromObject$1(schema, references) {
    return (IsTransform$2(schema) ||
        Object.values(schema.properties).some((schema) => Visit$1(schema, references)) ||
        (IsSchema$2(schema.additionalProperties) && Visit$1(schema.additionalProperties, references)));
}
// prettier-ignore
function FromPromise(schema, references) {
    return IsTransform$2(schema) || Visit$1(schema.item, references);
}
// prettier-ignore
function FromRecord$1(schema, references) {
    const pattern = Object.getOwnPropertyNames(schema.patternProperties)[0];
    const property = schema.patternProperties[pattern];
    return IsTransform$2(schema) || Visit$1(property, references) || (IsSchema$2(schema.additionalProperties) && IsTransform$2(schema.additionalProperties));
}
// prettier-ignore
function FromRef$1(schema, references) {
    if (IsTransform$2(schema))
        return true;
    return Visit$1(Deref(schema, references), references);
}
// prettier-ignore
function FromThis$1(schema, references) {
    if (IsTransform$2(schema))
        return true;
    return Visit$1(Deref(schema, references), references);
}
// prettier-ignore
function FromTuple$1(schema, references) {
    return IsTransform$2(schema) || (!IsUndefined$3(schema.items) && schema.items.some((schema) => Visit$1(schema, references)));
}
// prettier-ignore
function FromUnion$1(schema, references) {
    return IsTransform$2(schema) || schema.anyOf.some((schema) => Visit$1(schema, references));
}
// prettier-ignore
function Visit$1(schema, references) {
    const references_ = Pushref(schema, references);
    const schema_ = schema;
    if (schema.$id && visited.has(schema.$id))
        return false;
    if (schema.$id)
        visited.add(schema.$id);
    switch (schema[Kind$2]) {
        case 'Array':
            return FromArray$1(schema_, references_);
        case 'AsyncIterator':
            return FromAsyncIterator(schema_, references_);
        case 'Constructor':
            return FromConstructor(schema_, references_);
        case 'Function':
            return FromFunction(schema_, references_);
        case 'Import':
            return FromImport$1(schema_, references_);
        case 'Intersect':
            return FromIntersect$1(schema_, references_);
        case 'Iterator':
            return FromIterator(schema_, references_);
        case 'Not':
            return FromNot(schema_, references_);
        case 'Object':
            return FromObject$1(schema_, references_);
        case 'Promise':
            return FromPromise(schema_, references_);
        case 'Record':
            return FromRecord$1(schema_, references_);
        case 'Ref':
            return FromRef$1(schema_, references_);
        case 'This':
            return FromThis$1(schema_, references_);
        case 'Tuple':
            return FromTuple$1(schema_, references_);
        case 'Union':
            return FromUnion$1(schema_, references_);
        default:
            return IsTransform$2(schema);
    }
}
const visited = new Set();
/** Returns true if this schema contains a transform codec */
function HasTransform(schema, references) {
    visited.clear();
    return Visit$1(schema, references);
}

/** Decodes a value or throws if error */
function Decode(...args) {
    const [schema, references, value] = args.length === 3 ? [args[0], args[1], args[2]] : [args[0], [], args[1]];
    if (!Check(schema, references, value))
        throw new TransformDecodeCheckError(schema, value, Errors(schema, references, value).First());
    return HasTransform(schema, references) ? TransformDecode(schema, references, value) : value;
}

// ------------------------------------------------------------------
// ValueOrDefault
// ------------------------------------------------------------------
function ValueOrDefault(schema, value) {
    const defaultValue = HasPropertyKey$1(schema, 'default') ? schema.default : undefined;
    const clone = IsFunction$3(defaultValue) ? defaultValue() : Clone(defaultValue);
    return IsUndefined$3(value) ? clone : IsObject$3(value) && IsObject$3(clone) ? Object.assign(clone, value) : value;
}
// ------------------------------------------------------------------
// HasDefaultProperty
// ------------------------------------------------------------------
function HasDefaultProperty(schema) {
    return IsKind$2(schema) && 'default' in schema;
}
// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------
function FromArray(schema, references, value) {
    // if the value is an array, we attempt to initialize it's elements
    if (IsArray$3(value)) {
        for (let i = 0; i < value.length; i++) {
            value[i] = Visit(schema.items, references, value[i]);
        }
        return value;
    }
    // ... otherwise use default initialization
    const defaulted = ValueOrDefault(schema, value);
    if (!IsArray$3(defaulted))
        return defaulted;
    for (let i = 0; i < defaulted.length; i++) {
        defaulted[i] = Visit(schema.items, references, defaulted[i]);
    }
    return defaulted;
}
function FromDate(schema, references, value) {
    // special case intercept for dates
    return IsDate$3(value) ? value : ValueOrDefault(schema, value);
}
function FromImport(schema, references, value) {
    const definitions = globalThis.Object.values(schema.$defs);
    const target = schema.$defs[schema.$ref];
    return Visit(target, [...references, ...definitions], value);
}
function FromIntersect(schema, references, value) {
    const defaulted = ValueOrDefault(schema, value);
    return schema.allOf.reduce((acc, schema) => {
        const next = Visit(schema, references, defaulted);
        return IsObject$3(next) ? { ...acc, ...next } : next;
    }, {});
}
function FromObject(schema, references, value) {
    const defaulted = ValueOrDefault(schema, value);
    // return defaulted
    if (!IsObject$3(defaulted))
        return defaulted;
    const knownPropertyKeys = Object.getOwnPropertyNames(schema.properties);
    // properties
    for (const key of knownPropertyKeys) {
        // note: we need to traverse into the object and test if the return value
        // yielded a non undefined result. Here we interpret an undefined result as
        // a non assignable property and continue.
        const propertyValue = Visit(schema.properties[key], references, defaulted[key]);
        if (IsUndefined$3(propertyValue))
            continue;
        defaulted[key] = Visit(schema.properties[key], references, defaulted[key]);
    }
    // return if not additional properties
    if (!HasDefaultProperty(schema.additionalProperties))
        return defaulted;
    // additional properties
    for (const key of Object.getOwnPropertyNames(defaulted)) {
        if (knownPropertyKeys.includes(key))
            continue;
        defaulted[key] = Visit(schema.additionalProperties, references, defaulted[key]);
    }
    return defaulted;
}
function FromRecord(schema, references, value) {
    const defaulted = ValueOrDefault(schema, value);
    if (!IsObject$3(defaulted))
        return defaulted;
    const additionalPropertiesSchema = schema.additionalProperties;
    const [propertyKeyPattern, propertySchema] = Object.entries(schema.patternProperties)[0];
    const knownPropertyKey = new RegExp(propertyKeyPattern);
    // properties
    for (const key of Object.getOwnPropertyNames(defaulted)) {
        if (!(knownPropertyKey.test(key) && HasDefaultProperty(propertySchema)))
            continue;
        defaulted[key] = Visit(propertySchema, references, defaulted[key]);
    }
    // return if not additional properties
    if (!HasDefaultProperty(additionalPropertiesSchema))
        return defaulted;
    // additional properties
    for (const key of Object.getOwnPropertyNames(defaulted)) {
        if (knownPropertyKey.test(key))
            continue;
        defaulted[key] = Visit(additionalPropertiesSchema, references, defaulted[key]);
    }
    return defaulted;
}
function FromRef(schema, references, value) {
    return Visit(Deref(schema, references), references, ValueOrDefault(schema, value));
}
function FromThis(schema, references, value) {
    return Visit(Deref(schema, references), references, value);
}
function FromTuple(schema, references, value) {
    const defaulted = ValueOrDefault(schema, value);
    if (!IsArray$3(defaulted) || IsUndefined$3(schema.items))
        return defaulted;
    const [items, max] = [schema.items, Math.max(schema.items.length, defaulted.length)];
    for (let i = 0; i < max; i++) {
        if (i < items.length)
            defaulted[i] = Visit(items[i], references, defaulted[i]);
    }
    return defaulted;
}
function FromUnion(schema, references, value) {
    const defaulted = ValueOrDefault(schema, value);
    for (const inner of schema.anyOf) {
        const result = Visit(inner, references, Clone(defaulted));
        if (Check(inner, references, result)) {
            return result;
        }
    }
    return defaulted;
}
function Visit(schema, references, value) {
    const references_ = Pushref(schema, references);
    const schema_ = schema;
    switch (schema_[Kind$2]) {
        case 'Array':
            return FromArray(schema_, references_, value);
        case 'Date':
            return FromDate(schema_, references_, value);
        case 'Import':
            return FromImport(schema_, references_, value);
        case 'Intersect':
            return FromIntersect(schema_, references_, value);
        case 'Object':
            return FromObject(schema_, references_, value);
        case 'Record':
            return FromRecord(schema_, references_, value);
        case 'Ref':
            return FromRef(schema_, references_, value);
        case 'This':
            return FromThis(schema_, references_, value);
        case 'Tuple':
            return FromTuple(schema_, references_, value);
        case 'Union':
            return FromUnion(schema_, references_, value);
        default:
            return ValueOrDefault(schema_, value);
    }
}
/** `[Mutable]` Generates missing properties on a value using default schema annotations if available. This function does not check the value and returns an unknown type. You should Check the result before use. Default is a mutable operation. To avoid mutation, Clone the value first. */
function Default(...args) {
    return args.length === 3 ? Visit(args[0], args[1], args[2]) : Visit(args[0], [], args[1]);
}

/** Encodes a value or throws if error */
function Encode(...args) {
    const [schema, references, value] = args.length === 3 ? [args[0], args[1], args[2]] : [args[0], [], args[1]];
    const encoded = HasTransform(schema, references) ? TransformEncode(schema, references, value) : value;
    if (!Check(schema, references, encoded))
        throw new TransformEncodeCheckError(schema, encoded, Errors(schema, references, encoded).First());
    return encoded;
}

// ------------------------------------------------------------------
// TypeCheck
// ------------------------------------------------------------------
class TypeCheck {
    constructor(schema, references, checkFunc, code) {
        this.schema = schema;
        this.references = references;
        this.checkFunc = checkFunc;
        this.code = code;
        this.hasTransform = HasTransform(schema, references);
    }
    /** Returns the generated assertion code used to validate this type. */
    Code() {
        return this.code;
    }
    /** Returns the schema type used to validate */
    Schema() {
        return this.schema;
    }
    /** Returns reference types used to validate */
    References() {
        return this.references;
    }
    /** Returns an iterator for each error in this value. */
    Errors(value) {
        return Errors(this.schema, this.references, value);
    }
    /** Returns true if the value matches the compiled type. */
    Check(value) {
        return this.checkFunc(value);
    }
    /** Decodes a value or throws if error */
    Decode(value) {
        if (!this.checkFunc(value))
            throw new TransformDecodeCheckError(this.schema, value, this.Errors(value).First());
        return (this.hasTransform ? TransformDecode(this.schema, this.references, value) : value);
    }
    /** Encodes a value or throws if error */
    Encode(value) {
        const encoded = this.hasTransform ? TransformEncode(this.schema, this.references, value) : value;
        if (!this.checkFunc(encoded))
            throw new TransformEncodeCheckError(this.schema, value, this.Errors(value).First());
        return encoded;
    }
}
// ------------------------------------------------------------------
// Character
// ------------------------------------------------------------------
var Character;
(function (Character) {
    function DollarSign(code) {
        return code === 36;
    }
    Character.DollarSign = DollarSign;
    function IsUnderscore(code) {
        return code === 95;
    }
    Character.IsUnderscore = IsUnderscore;
    function IsAlpha(code) {
        return (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
    }
    Character.IsAlpha = IsAlpha;
    function IsNumeric(code) {
        return code >= 48 && code <= 57;
    }
    Character.IsNumeric = IsNumeric;
})(Character || (Character = {}));
// ------------------------------------------------------------------
// MemberExpression
// ------------------------------------------------------------------
var MemberExpression;
(function (MemberExpression) {
    function IsFirstCharacterNumeric(value) {
        if (value.length === 0)
            return false;
        return Character.IsNumeric(value.charCodeAt(0));
    }
    function IsAccessor(value) {
        if (IsFirstCharacterNumeric(value))
            return false;
        for (let i = 0; i < value.length; i++) {
            const code = value.charCodeAt(i);
            const check = Character.IsAlpha(code) || Character.IsNumeric(code) || Character.DollarSign(code) || Character.IsUnderscore(code);
            if (!check)
                return false;
        }
        return true;
    }
    function EscapeHyphen(key) {
        return key.replace(/'/g, "\\'");
    }
    function Encode(object, key) {
        return IsAccessor(key) ? `${object}.${key}` : `${object}['${EscapeHyphen(key)}']`;
    }
    MemberExpression.Encode = Encode;
})(MemberExpression || (MemberExpression = {}));
// ------------------------------------------------------------------
// Identifier
// ------------------------------------------------------------------
var Identifier;
(function (Identifier) {
    function Encode($id) {
        const buffer = [];
        for (let i = 0; i < $id.length; i++) {
            const code = $id.charCodeAt(i);
            if (Character.IsNumeric(code) || Character.IsAlpha(code)) {
                buffer.push($id.charAt(i));
            }
            else {
                buffer.push(`_${code}_`);
            }
        }
        return buffer.join('').replace(/__/g, '_');
    }
    Identifier.Encode = Encode;
})(Identifier || (Identifier = {}));
// ------------------------------------------------------------------
// LiteralString
// ------------------------------------------------------------------
var LiteralString;
(function (LiteralString) {
    function Escape(content) {
        return content.replace(/'/g, "\\'");
    }
    LiteralString.Escape = Escape;
})(LiteralString || (LiteralString = {}));
// ------------------------------------------------------------------
// Errors
// ------------------------------------------------------------------
class TypeCompilerUnknownTypeError extends TypeBoxError$1 {
    constructor(schema) {
        super('Unknown type');
        this.schema = schema;
    }
}
class TypeCompilerTypeGuardError extends TypeBoxError$1 {
    constructor(schema) {
        super('Preflight validation check failed to guard for the given schema');
        this.schema = schema;
    }
}
// ------------------------------------------------------------------
// Policy
// ------------------------------------------------------------------
var Policy;
(function (Policy) {
    function IsExactOptionalProperty(value, key, expression) {
        return TypeSystemPolicy$1.ExactOptionalPropertyTypes ? `('${key}' in ${value} ? ${expression} : true)` : `(${MemberExpression.Encode(value, key)} !== undefined ? ${expression} : true)`;
    }
    Policy.IsExactOptionalProperty = IsExactOptionalProperty;
    function IsObjectLike(value) {
        return !TypeSystemPolicy$1.AllowArrayObject ? `(typeof ${value} === 'object' && ${value} !== null && !Array.isArray(${value}))` : `(typeof ${value} === 'object' && ${value} !== null)`;
    }
    Policy.IsObjectLike = IsObjectLike;
    function IsRecordLike(value) {
        return !TypeSystemPolicy$1.AllowArrayObject
            ? `(typeof ${value} === 'object' && ${value} !== null && !Array.isArray(${value}) && !(${value} instanceof Date) && !(${value} instanceof Uint8Array))`
            : `(typeof ${value} === 'object' && ${value} !== null && !(${value} instanceof Date) && !(${value} instanceof Uint8Array))`;
    }
    Policy.IsRecordLike = IsRecordLike;
    function IsNumberLike(value) {
        return TypeSystemPolicy$1.AllowNaN ? `typeof ${value} === 'number'` : `Number.isFinite(${value})`;
    }
    Policy.IsNumberLike = IsNumberLike;
    function IsVoidLike(value) {
        return TypeSystemPolicy$1.AllowNullVoid ? `(${value} === undefined || ${value} === null)` : `${value} === undefined`;
    }
    Policy.IsVoidLike = IsVoidLike;
})(Policy || (Policy = {}));
/** Compiles Types for Runtime Type Checking */
var TypeCompiler;
(function (TypeCompiler) {
    // ----------------------------------------------------------------
    // Guards
    // ----------------------------------------------------------------
    function IsAnyOrUnknown(schema) {
        return schema[Kind$2] === 'Any' || schema[Kind$2] === 'Unknown';
    }
    // ----------------------------------------------------------------
    // Types
    // ----------------------------------------------------------------
    function* FromAny(schema, references, value) {
        yield 'true';
    }
    function* FromArgument(schema, references, value) {
        yield 'true';
    }
    function* FromArray(schema, references, value) {
        yield `Array.isArray(${value})`;
        const [parameter, accumulator] = [CreateParameter('value', 'any'), CreateParameter('acc', 'number')];
        if (IsNumber$3(schema.maxItems))
            yield `${value}.length <= ${schema.maxItems}`;
        if (IsNumber$3(schema.minItems))
            yield `${value}.length >= ${schema.minItems}`;
        const elementExpression = CreateExpression(schema.items, references, 'value');
        // yield `${value}.every((${parameter}) => ${elementExpression})` // issue: 1519
        yield `((array) => { for(const ${parameter} of array) if(!(${elementExpression})) { return false }; return true; })(${value})`;
        if (IsSchema$1(schema.contains) || IsNumber$3(schema.minContains) || IsNumber$3(schema.maxContains)) {
            const containsSchema = IsSchema$1(schema.contains) ? schema.contains : Never();
            const checkExpression = CreateExpression(containsSchema, references, 'value');
            const checkMinContains = IsNumber$3(schema.minContains) ? [`(count >= ${schema.minContains})`] : [];
            const checkMaxContains = IsNumber$3(schema.maxContains) ? [`(count <= ${schema.maxContains})`] : [];
            const checkCount = `const count = value.reduce((${accumulator}, ${parameter}) => ${checkExpression} ? acc + 1 : acc, 0)`;
            const check = [`(count > 0)`, ...checkMinContains, ...checkMaxContains].join(' && ');
            yield `((${parameter}) => { ${checkCount}; return ${check}})(${value})`;
        }
        if (schema.uniqueItems === true) {
            const check = `const hashed = hash(element); if(set.has(hashed)) { return false } else { set.add(hashed) } } return true`;
            const block = `const set = new Set(); for(const element of value) { ${check} }`;
            yield `((${parameter}) => { ${block} )(${value})`;
        }
    }
    function* FromAsyncIterator(schema, references, value) {
        yield `(typeof value === 'object' && Symbol.asyncIterator in ${value})`;
    }
    function* FromBigInt(schema, references, value) {
        yield `(typeof ${value} === 'bigint')`;
        if (IsBigInt$3(schema.exclusiveMaximum))
            yield `${value} < BigInt(${schema.exclusiveMaximum})`;
        if (IsBigInt$3(schema.exclusiveMinimum))
            yield `${value} > BigInt(${schema.exclusiveMinimum})`;
        if (IsBigInt$3(schema.maximum))
            yield `${value} <= BigInt(${schema.maximum})`;
        if (IsBigInt$3(schema.minimum))
            yield `${value} >= BigInt(${schema.minimum})`;
        if (IsBigInt$3(schema.multipleOf))
            yield `(${value} % BigInt(${schema.multipleOf})) === 0`;
    }
    function* FromBoolean(schema, references, value) {
        yield `(typeof ${value} === 'boolean')`;
    }
    function* FromConstructor(schema, references, value) {
        yield* Visit(schema.returns, references, `${value}.prototype`);
    }
    function* FromDate(schema, references, value) {
        yield `(${value} instanceof Date) && Number.isFinite(${value}.getTime())`;
        if (IsNumber$3(schema.exclusiveMaximumTimestamp))
            yield `${value}.getTime() < ${schema.exclusiveMaximumTimestamp}`;
        if (IsNumber$3(schema.exclusiveMinimumTimestamp))
            yield `${value}.getTime() > ${schema.exclusiveMinimumTimestamp}`;
        if (IsNumber$3(schema.maximumTimestamp))
            yield `${value}.getTime() <= ${schema.maximumTimestamp}`;
        if (IsNumber$3(schema.minimumTimestamp))
            yield `${value}.getTime() >= ${schema.minimumTimestamp}`;
        if (IsNumber$3(schema.multipleOfTimestamp))
            yield `(${value}.getTime() % ${schema.multipleOfTimestamp}) === 0`;
    }
    function* FromFunction(schema, references, value) {
        yield `(typeof ${value} === 'function')`;
    }
    function* FromImport(schema, references, value) {
        const members = globalThis.Object.getOwnPropertyNames(schema.$defs).reduce((result, key) => {
            return [...result, schema.$defs[key]];
        }, []);
        yield* Visit(Ref(schema.$ref), [...references, ...members], value);
    }
    function* FromInteger(schema, references, value) {
        yield `Number.isInteger(${value})`;
        if (IsNumber$3(schema.exclusiveMaximum))
            yield `${value} < ${schema.exclusiveMaximum}`;
        if (IsNumber$3(schema.exclusiveMinimum))
            yield `${value} > ${schema.exclusiveMinimum}`;
        if (IsNumber$3(schema.maximum))
            yield `${value} <= ${schema.maximum}`;
        if (IsNumber$3(schema.minimum))
            yield `${value} >= ${schema.minimum}`;
        if (IsNumber$3(schema.multipleOf))
            yield `(${value} % ${schema.multipleOf}) === 0`;
    }
    function* FromIntersect(schema, references, value) {
        const check1 = schema.allOf.map((schema) => CreateExpression(schema, references, value)).join(' && ');
        if (schema.unevaluatedProperties === false) {
            const keyCheck = CreateVariable(`${new RegExp(KeyOfPattern(schema))};`);
            const check2 = `Object.getOwnPropertyNames(${value}).every(key => ${keyCheck}.test(key))`;
            yield `(${check1} && ${check2})`;
        }
        else if (IsSchema$1(schema.unevaluatedProperties)) {
            const keyCheck = CreateVariable(`${new RegExp(KeyOfPattern(schema))};`);
            const check2 = `Object.getOwnPropertyNames(${value}).every(key => ${keyCheck}.test(key) || ${CreateExpression(schema.unevaluatedProperties, references, `${value}[key]`)})`;
            yield `(${check1} && ${check2})`;
        }
        else {
            yield `(${check1})`;
        }
    }
    function* FromIterator(schema, references, value) {
        yield `(typeof value === 'object' && Symbol.iterator in ${value})`;
    }
    function* FromLiteral(schema, references, value) {
        if (typeof schema.const === 'number' || typeof schema.const === 'boolean') {
            yield `(${value} === ${schema.const})`;
        }
        else {
            yield `(${value} === '${LiteralString.Escape(schema.const)}')`;
        }
    }
    function* FromNever(schema, references, value) {
        yield `false`;
    }
    function* FromNot(schema, references, value) {
        const expression = CreateExpression(schema.not, references, value);
        yield `(!${expression})`;
    }
    function* FromNull(schema, references, value) {
        yield `(${value} === null)`;
    }
    function* FromNumber(schema, references, value) {
        yield Policy.IsNumberLike(value);
        if (IsNumber$3(schema.exclusiveMaximum))
            yield `${value} < ${schema.exclusiveMaximum}`;
        if (IsNumber$3(schema.exclusiveMinimum))
            yield `${value} > ${schema.exclusiveMinimum}`;
        if (IsNumber$3(schema.maximum))
            yield `${value} <= ${schema.maximum}`;
        if (IsNumber$3(schema.minimum))
            yield `${value} >= ${schema.minimum}`;
        if (IsNumber$3(schema.multipleOf))
            yield `(${value} % ${schema.multipleOf}) === 0`;
    }
    function* FromObject(schema, references, value) {
        yield Policy.IsObjectLike(value);
        if (IsNumber$3(schema.minProperties))
            yield `Object.getOwnPropertyNames(${value}).length >= ${schema.minProperties}`;
        if (IsNumber$3(schema.maxProperties))
            yield `Object.getOwnPropertyNames(${value}).length <= ${schema.maxProperties}`;
        const knownKeys = Object.getOwnPropertyNames(schema.properties);
        for (const knownKey of knownKeys) {
            const memberExpression = MemberExpression.Encode(value, knownKey);
            const property = schema.properties[knownKey];
            if (schema.required && schema.required.includes(knownKey)) {
                yield* Visit(property, references, memberExpression);
                if (ExtendsUndefinedCheck(property) || IsAnyOrUnknown(property))
                    yield `('${knownKey}' in ${value})`;
            }
            else {
                const expression = CreateExpression(property, references, memberExpression);
                yield Policy.IsExactOptionalProperty(value, knownKey, expression);
            }
        }
        if (schema.additionalProperties === false) {
            if (schema.required && schema.required.length === knownKeys.length) {
                yield `Object.getOwnPropertyNames(${value}).length === ${knownKeys.length}`;
            }
            else {
                const keys = `[${knownKeys.map((key) => `'${key}'`).join(', ')}]`;
                yield `Object.getOwnPropertyNames(${value}).every(key => ${keys}.includes(key))`;
            }
        }
        if (typeof schema.additionalProperties === 'object') {
            const expression = CreateExpression(schema.additionalProperties, references, `${value}[key]`);
            const keys = `[${knownKeys.map((key) => `'${key}'`).join(', ')}]`;
            yield `(Object.getOwnPropertyNames(${value}).every(key => ${keys}.includes(key) || ${expression}))`;
        }
    }
    function* FromPromise(schema, references, value) {
        yield `${value} instanceof Promise`;
    }
    function* FromRecord(schema, references, value) {
        yield Policy.IsRecordLike(value);
        if (IsNumber$3(schema.minProperties))
            yield `Object.getOwnPropertyNames(${value}).length >= ${schema.minProperties}`;
        if (IsNumber$3(schema.maxProperties))
            yield `Object.getOwnPropertyNames(${value}).length <= ${schema.maxProperties}`;
        const [patternKey, patternSchema] = Object.entries(schema.patternProperties)[0];
        const variable = CreateVariable(`${new RegExp(patternKey)}`);
        const check1 = CreateExpression(patternSchema, references, 'value');
        const check2 = IsSchema$1(schema.additionalProperties) ? CreateExpression(schema.additionalProperties, references, value) : schema.additionalProperties === false ? 'false' : 'true';
        const expression = `(${variable}.test(key) ? ${check1} : ${check2})`;
        yield `(Object.entries(${value}).every(([key, value]) => ${expression}))`;
    }
    function* FromRef(schema, references, value) {
        const target = Deref(schema, references);
        // Reference: If we have seen this reference before we can just yield and return the function call.
        // If this isn't the case we defer to visit to generate and set the function for subsequent passes.
        if (state.functions.has(schema.$ref))
            return yield `${CreateFunctionName(schema.$ref)}(${value})`;
        yield* Visit(target, references, value);
    }
    function* FromRegExp(schema, references, value) {
        const variable = CreateVariable(`${new RegExp(schema.source, schema.flags)};`);
        yield `(typeof ${value} === 'string')`;
        if (IsNumber$3(schema.maxLength))
            yield `${value}.length <= ${schema.maxLength}`;
        if (IsNumber$3(schema.minLength))
            yield `${value}.length >= ${schema.minLength}`;
        yield `${variable}.test(${value})`;
    }
    function* FromString(schema, references, value) {
        yield `(typeof ${value} === 'string')`;
        if (IsNumber$3(schema.maxLength))
            yield `${value}.length <= ${schema.maxLength}`;
        if (IsNumber$3(schema.minLength))
            yield `${value}.length >= ${schema.minLength}`;
        if (schema.pattern !== undefined) {
            const variable = CreateVariable(`${new RegExp(schema.pattern)};`);
            yield `${variable}.test(${value})`;
        }
        if (schema.format !== undefined) {
            yield `format('${schema.format}', ${value})`;
        }
    }
    function* FromSymbol(schema, references, value) {
        yield `(typeof ${value} === 'symbol')`;
    }
    function* FromTemplateLiteral(schema, references, value) {
        yield `(typeof ${value} === 'string')`;
        const variable = CreateVariable(`${new RegExp(schema.pattern)};`);
        yield `${variable}.test(${value})`;
    }
    function* FromThis(schema, references, value) {
        // Note: This types are assured to be hoisted prior to this call. Just yield the function.
        yield `${CreateFunctionName(schema.$ref)}(${value})`;
    }
    function* FromTuple(schema, references, value) {
        yield `Array.isArray(${value})`;
        if (schema.items === undefined)
            return yield `${value}.length === 0`;
        yield `(${value}.length === ${schema.maxItems})`;
        for (let i = 0; i < schema.items.length; i++) {
            const expression = CreateExpression(schema.items[i], references, `${value}[${i}]`);
            yield `${expression}`;
        }
    }
    function* FromUndefined(schema, references, value) {
        yield `${value} === undefined`;
    }
    function* FromUnion(schema, references, value) {
        const expressions = schema.anyOf.map((schema) => CreateExpression(schema, references, value));
        yield `(${expressions.join(' || ')})`;
    }
    function* FromUint8Array(schema, references, value) {
        yield `${value} instanceof Uint8Array`;
        if (IsNumber$3(schema.maxByteLength))
            yield `(${value}.length <= ${schema.maxByteLength})`;
        if (IsNumber$3(schema.minByteLength))
            yield `(${value}.length >= ${schema.minByteLength})`;
    }
    function* FromUnknown(schema, references, value) {
        yield 'true';
    }
    function* FromVoid(schema, references, value) {
        yield Policy.IsVoidLike(value);
    }
    function* FromKind(schema, references, value) {
        const instance = state.instances.size;
        state.instances.set(instance, schema);
        yield `kind('${schema[Kind$2]}', ${instance}, ${value})`;
    }
    function* Visit(schema, references, value, useHoisting = true) {
        const references_ = IsString$3(schema.$id) ? [...references, schema] : references;
        const schema_ = schema;
        // --------------------------------------------------------------
        // Hoisting
        // --------------------------------------------------------------
        if (useHoisting && IsString$3(schema.$id)) {
            const functionName = CreateFunctionName(schema.$id);
            if (state.functions.has(functionName)) {
                return yield `${functionName}(${value})`;
            }
            else {
                // Note: In the case of cyclic types, we need to create a 'functions' record
                // to prevent infinitely re-visiting the CreateFunction. Subsequent attempts
                // to visit will be caught by the above condition.
                state.functions.set(functionName, '<deferred>');
                const functionCode = CreateFunction(functionName, schema, references, 'value', false);
                state.functions.set(functionName, functionCode);
                return yield `${functionName}(${value})`;
            }
        }
        switch (schema_[Kind$2]) {
            case 'Any':
                return yield* FromAny();
            case 'Argument':
                return yield* FromArgument();
            case 'Array':
                return yield* FromArray(schema_, references_, value);
            case 'AsyncIterator':
                return yield* FromAsyncIterator(schema_, references_, value);
            case 'BigInt':
                return yield* FromBigInt(schema_, references_, value);
            case 'Boolean':
                return yield* FromBoolean(schema_, references_, value);
            case 'Constructor':
                return yield* FromConstructor(schema_, references_, value);
            case 'Date':
                return yield* FromDate(schema_, references_, value);
            case 'Function':
                return yield* FromFunction(schema_, references_, value);
            case 'Import':
                return yield* FromImport(schema_, references_, value);
            case 'Integer':
                return yield* FromInteger(schema_, references_, value);
            case 'Intersect':
                return yield* FromIntersect(schema_, references_, value);
            case 'Iterator':
                return yield* FromIterator(schema_, references_, value);
            case 'Literal':
                return yield* FromLiteral(schema_, references_, value);
            case 'Never':
                return yield* FromNever();
            case 'Not':
                return yield* FromNot(schema_, references_, value);
            case 'Null':
                return yield* FromNull(schema_, references_, value);
            case 'Number':
                return yield* FromNumber(schema_, references_, value);
            case 'Object':
                return yield* FromObject(schema_, references_, value);
            case 'Promise':
                return yield* FromPromise(schema_, references_, value);
            case 'Record':
                return yield* FromRecord(schema_, references_, value);
            case 'Ref':
                return yield* FromRef(schema_, references_, value);
            case 'RegExp':
                return yield* FromRegExp(schema_, references_, value);
            case 'String':
                return yield* FromString(schema_, references_, value);
            case 'Symbol':
                return yield* FromSymbol(schema_, references_, value);
            case 'TemplateLiteral':
                return yield* FromTemplateLiteral(schema_, references_, value);
            case 'This':
                return yield* FromThis(schema_, references_, value);
            case 'Tuple':
                return yield* FromTuple(schema_, references_, value);
            case 'Undefined':
                return yield* FromUndefined(schema_, references_, value);
            case 'Union':
                return yield* FromUnion(schema_, references_, value);
            case 'Uint8Array':
                return yield* FromUint8Array(schema_, references_, value);
            case 'Unknown':
                return yield* FromUnknown();
            case 'Void':
                return yield* FromVoid(schema_, references_, value);
            default:
                if (!Has$1(schema_[Kind$2]))
                    throw new TypeCompilerUnknownTypeError(schema);
                return yield* FromKind(schema_, references_, value);
        }
    }
    // ----------------------------------------------------------------
    // Compiler State
    // ----------------------------------------------------------------
    // prettier-ignore
    const state = {
        language: 'javascript', // target language
        functions: new Map(), // local functions
        variables: new Map(), // local variables
        instances: new Map() // exterior kind instances
    };
    // ----------------------------------------------------------------
    // Compiler Factory
    // ----------------------------------------------------------------
    function CreateExpression(schema, references, value, useHoisting = true) {
        return `(${[...Visit(schema, references, value, useHoisting)].join(' && ')})`;
    }
    function CreateFunctionName($id) {
        return `check_${Identifier.Encode($id)}`;
    }
    function CreateVariable(expression) {
        const variableName = `local_${state.variables.size}`;
        state.variables.set(variableName, `const ${variableName} = ${expression}`);
        return variableName;
    }
    function CreateFunction(name, schema, references, value, useHoisting = true) {
        const [newline, pad] = ['\n', (length) => ''.padStart(length, ' ')];
        const parameter = CreateParameter('value', 'any');
        const returns = CreateReturns('boolean');
        const expression = [...Visit(schema, references, value, useHoisting)].map((expression) => `${pad(4)}${expression}`).join(` &&${newline}`);
        return `function ${name}(${parameter})${returns} {${newline}${pad(2)}return (${newline}${expression}${newline}${pad(2)})\n}`;
    }
    function CreateParameter(name, type) {
        const annotation = state.language === 'typescript' ? `: ${type}` : '';
        return `${name}${annotation}`;
    }
    function CreateReturns(type) {
        return state.language === 'typescript' ? `: ${type}` : '';
    }
    // ----------------------------------------------------------------
    // Compile
    // ----------------------------------------------------------------
    function Build(schema, references, options) {
        const functionCode = CreateFunction('check', schema, references, 'value'); // will populate functions and variables
        const parameter = CreateParameter('value', 'any');
        const returns = CreateReturns('boolean');
        const functions = [...state.functions.values()];
        const variables = [...state.variables.values()];
        // prettier-ignore
        const checkFunction = IsString$3(schema.$id) // ensure top level schemas with $id's are hoisted
            ? `return function check(${parameter})${returns} {\n  return ${CreateFunctionName(schema.$id)}(value)\n}`
            : `return ${functionCode}`;
        return [...variables, ...functions, checkFunction].join('\n');
    }
    /** Generates the code used to assert this type and returns it as a string */
    function Code(...args) {
        const defaults = { language: 'javascript' };
        // prettier-ignore
        const [schema, references, options] = (args.length === 2 && IsArray$3(args[1]) ? [args[0], args[1], defaults] :
            args.length === 2 && !IsArray$3(args[1]) ? [args[0], [], args[1]] :
                args.length === 3 ? [args[0], args[1], args[2]] :
                    args.length === 1 ? [args[0], [], defaults] :
                        [null, [], defaults]);
        // compiler-reset
        state.language = options.language;
        state.variables.clear();
        state.functions.clear();
        state.instances.clear();
        if (!IsSchema$1(schema))
            throw new TypeCompilerTypeGuardError(schema);
        for (const schema of references)
            if (!IsSchema$1(schema))
                throw new TypeCompilerTypeGuardError(schema);
        return Build(schema, references);
    }
    TypeCompiler.Code = Code;
    /** Compiles a TypeBox type for optimal runtime type checking. Types must be valid TypeBox types of TSchema */
    function Compile(schema, references = []) {
        const generatedCode = Code(schema, references, { language: 'javascript' });
        const compiledFunction = globalThis.Function('kind', 'format', 'hash', generatedCode);
        const instances = new Map(state.instances);
        function typeRegistryFunction(kind, instance, value) {
            if (!Has$1(kind) || !instances.has(instance))
                return false;
            const checkFunc = Get$1(kind);
            const schema = instances.get(instance);
            return checkFunc(schema, value);
        }
        function formatRegistryFunction(format, value) {
            if (!Has$2(format))
                return false;
            const checkFunc = Get$2(format);
            return checkFunc(value);
        }
        function hashFunction(value) {
            return Hash(value);
        }
        const checkFunction = compiledFunction(typeRegistryFunction, formatRegistryFunction, hashFunction);
        return new TypeCheck(schema, references, checkFunction, generatedCode);
    }
    TypeCompiler.Compile = Compile;
})(TypeCompiler || (TypeCompiler = {}));

const isBun$1 = typeof Bun < "u";

const mime = {
  aac: "audio/aac",
  abw: "application/x-abiword",
  ai: "application/postscript",
  arc: "application/octet-stream",
  avi: "video/x-msvideo",
  azw: "application/vnd.amazon.ebook",
  bin: "application/octet-stream",
  bz: "application/x-bzip",
  bz2: "application/x-bzip2",
  csh: "application/x-csh",
  css: "text/css",
  csv: "text/csv",
  doc: "application/msword",
  dll: "application/octet-stream",
  eot: "application/vnd.ms-fontobject",
  epub: "application/epub+zip",
  gif: "image/gif",
  htm: "text/html",
  html: "text/html",
  ico: "image/x-icon",
  ics: "text/calendar",
  jar: "application/java-archive",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  js: "application/javascript",
  json: "application/json",
  mid: "audio/midi",
  midi: "audio/midi",
  mp2: "audio/mpeg",
  mp3: "audio/mpeg",
  mp4: "video/mp4",
  mpa: "video/mpeg",
  mpe: "video/mpeg",
  mpeg: "video/mpeg",
  mpkg: "application/vnd.apple.installer+xml",
  odp: "application/vnd.oasis.opendocument.presentation",
  ods: "application/vnd.oasis.opendocument.spreadsheet",
  odt: "application/vnd.oasis.opendocument.text",
  oga: "audio/ogg",
  ogv: "video/ogg",
  ogx: "application/ogg",
  otf: "font/otf",
  png: "image/png",
  pdf: "application/pdf",
  ppt: "application/vnd.ms-powerpoint",
  rar: "application/x-rar-compressed",
  rtf: "application/rtf",
  sh: "application/x-sh",
  svg: "image/svg+xml",
  swf: "application/x-shockwave-flash",
  tar: "application/x-tar",
  tif: "image/tiff",
  tiff: "image/tiff",
  ts: "application/typescript",
  ttf: "font/ttf",
  txt: "text/plain",
  vsd: "application/vnd.visio",
  wav: "audio/x-wav",
  weba: "audio/webm",
  webm: "video/webm",
  webp: "image/webp",
  woff: "font/woff",
  woff2: "font/woff2",
  xhtml: "application/xhtml+xml",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.ms-excel",
  xlsx_OLD: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  xml: "application/xml",
  xul: "application/vnd.mozilla.xul+xml",
  zip: "application/zip",
  "3gp": "video/3gpp",
  "3gp_DOES_NOT_CONTAIN_VIDEO": "audio/3gpp",
  "3gp2": "video/3gpp2",
  "3gp2_DOES_NOT_CONTAIN_VIDEO": "audio/3gpp2",
  "7z": "application/x-7z-compressed"
}, getFileExtension = (path) => {
  const index = path.lastIndexOf(".");
  return index === -1 ? "" : path.slice(index + 1);
};
let createReadStream, stat;
class ElysiaFile {
  constructor(path) {
    this.path = path;
    if (isBun$1) this.value = Bun.file(path);
    else {
      if (!createReadStream || !stat) {
        if (typeof window < "u") {
          console.warn("Browser environment does not support file");
          return;
        }
        const warnMissing = (name) => console.warn(
          new Error(
            `[elysia] \`file\` require \`fs${""}\` ${""}which is not available in this environment`
          )
        );
        if (typeof process > "u" || typeof process.getBuiltinModule != "function") {
          warnMissing();
          return;
        }
        const fs = process.getBuiltinModule("fs");
        if (!fs) {
          warnMissing();
          return;
        }
        if (typeof fs.createReadStream != "function") {
          warnMissing();
          return;
        }
        if (typeof fs.promises?.stat != "function") {
          warnMissing();
          return;
        }
        createReadStream = fs.createReadStream, stat = fs.promises.stat;
      }
      this.value = createReadStream(path), this.stats = stat(path);
    }
  }
  get type() {
    return (
      // @ts-ignore
      mime[getFileExtension(this.path)] || "application/octet-stream"
    );
  }
  get length() {
    return isBun$1 ? this.value.size : this.stats?.then((x) => x.size) ?? 0;
  }
}

const hasHeaderShorthand = "toJSON" in new Headers(), replaceUrlPath = (url, pathname) => {
  const pathStartIndex = url.indexOf("/", 11), queryIndex = url.indexOf("?", pathStartIndex);
  return queryIndex === -1 ? `${url.slice(0, pathStartIndex)}${pathname.charCodeAt(0) === 47 ? "" : "/"}${pathname}` : `${url.slice(0, pathStartIndex)}${pathname.charCodeAt(0) === 47 ? "" : "/"}${pathname}${url.slice(queryIndex)}`;
}, isClass = (v) => typeof v == "function" && /^\s*class\s+/.test(v.toString()) || // Handle Object.create(null)
v.toString && // Handle import * as Sentry from '@sentry/bun'
// This also handle [object Date], [object Array]
// and FFI value like [object Prisma]
v.toString().startsWith("[object ") && v.toString() !== "[object Object]" || // If object prototype is not pure, then probably a class-like object
isNotEmpty(Object.getPrototypeOf(v)), isObject$1 = (item) => item && typeof item == "object" && !Array.isArray(item), mergeDeep = (target, source, options) => {
  const skipKeys = options?.skipKeys, override = options?.override ?? true, mergeArray = options?.mergeArray ?? false, seen = options?.seen ?? /* @__PURE__ */ new WeakSet();
  if (!isObject$1(target) || !isObject$1(source) || seen.has(source)) return target;
  seen.add(source);
  for (const [key, value] of Object.entries(source))
    if (!(skipKeys?.includes(key) || ["__proto__", "constructor", "prototype"].includes(key))) {
      if (mergeArray && Array.isArray(value)) {
        target[key] = Array.isArray(
          target[key]
        ) ? [...target[key], ...value] : target[key] = value;
        continue;
      }
      if (!isObject$1(value) || !(key in target) || isClass(value)) {
        if ((override || !(key in target)) && !Object.isFrozen(target))
          try {
            target[key] = value;
          } catch {
          }
        continue;
      }
      if (!Object.isFrozen(target[key]))
        try {
          target[key] = mergeDeep(
            target[key],
            value,
            { skipKeys, override, mergeArray, seen }
          );
        } catch {
        }
    }
  return seen.delete(source), target;
}, mergeCookie = (a, b) => {
  const v = mergeDeep(Object.assign({}, a), b, {
    skipKeys: ["properties"],
    mergeArray: false
  });
  return v.properties && delete v.properties, v;
}, mergeObjectArray = (a, b) => {
  if (!b) return a;
  const array = [], checksums = [];
  if (a) {
    Array.isArray(a) || (a = [a]);
    for (const item of a)
      array.push(item), item.checksum && checksums.push(item.checksum);
  }
  if (b) {
    Array.isArray(b) || (b = [b]);
    for (const item of b)
      checksums.includes(item.checksum) || array.push(item);
  }
  return array;
}, primitiveHooks = [
  "start",
  "request",
  "parse",
  "transform",
  "resolve",
  "beforeHandle",
  "afterHandle",
  "mapResponse",
  "afterResponse",
  "trace",
  "error",
  "stop",
  "body",
  "headers",
  "params",
  "query",
  "response",
  "type",
  "detail"
]; primitiveHooks.reduce(
  (acc, x) => (acc[x] = true, acc),
  {}
); const isRecordNumber = (x) => typeof x == "object" && Object.keys(x).every((x2) => !isNaN(+x2)), mergeResponse = (a, b) => isRecordNumber(a) && isRecordNumber(b) ? Object.assign({}, a, b) : a && !isRecordNumber(a) && isRecordNumber(b) ? Object.assign({ 200: a }, b) : b ?? a, mergeSchemaValidator = (a, b) => !a && !b ? {
  body: void 0,
  headers: void 0,
  params: void 0,
  query: void 0,
  cookie: void 0,
  response: void 0
} : {
  body: b?.body ?? a?.body,
  headers: b?.headers ?? a?.headers,
  params: b?.params ?? a?.params,
  query: b?.query ?? a?.query,
  cookie: b?.cookie ?? a?.cookie,
  // @ts-ignore ? This order is correct - SaltyAom
  response: mergeResponse(
    // @ts-ignore
    a?.response,
    // @ts-ignore
    b?.response
  )
}, mergeHook = (a, b) => {
  if (!b) return a ?? {};
  if (!a) return b ?? {};
  if (!Object.values(b).find((x) => x != null))
    return { ...a };
  const hook = {
    ...a,
    ...b,
    // Merge local hook first
    // @ts-ignore
    body: b.body ?? a.body,
    // @ts-ignore
    headers: b.headers ?? a.headers,
    // @ts-ignore
    params: b.params ?? a.params,
    // @ts-ignore
    query: b.query ?? a.query,
    // @ts-ignore
    cookie: b.cookie ?? a.cookie,
    // ? This order is correct - SaltyAom
    response: mergeResponse(
      // @ts-ignore
      a.response,
      // @ts-ignore
      b.response
    ),
    type: a.type || b.type,
    detail: mergeDeep(
      // @ts-ignore
      b.detail ?? {},
      // @ts-ignore
      a.detail ?? {}
    ),
    parse: mergeObjectArray(a.parse, b.parse),
    transform: mergeObjectArray(a.transform, b.transform),
    beforeHandle: mergeObjectArray(
      mergeObjectArray(
        // @ts-ignore
        fnToContainer(a.resolve, "resolve"),
        a.beforeHandle
      ),
      mergeObjectArray(
        fnToContainer(b.resolve, "resolve"),
        b.beforeHandle
      )
    ),
    afterHandle: mergeObjectArray(a.afterHandle, b.afterHandle),
    mapResponse: mergeObjectArray(a.mapResponse, b.mapResponse),
    afterResponse: mergeObjectArray(
      a.afterResponse,
      b.afterResponse
    ),
    trace: mergeObjectArray(a.trace, b.trace),
    error: mergeObjectArray(a.error, b.error),
    // @ts-ignore
    standaloneSchema: (
      // @ts-ignore
      a.standaloneSchema || b.standaloneSchema ? (
        // @ts-ignore
        a.standaloneSchema && !b.standaloneSchema ? (
          // @ts-ignore
          a.standaloneSchema
        ) : (
          // @ts-ignore
          b.standaloneSchema && !a.standaloneSchema ? b.standaloneSchema : [
            // @ts-ignore
            ...a.standaloneSchema ?? [],
            ...b.standaloneSchema ?? []
          ]
        )
      ) : void 0
    )
  };
  return hook.resolve && delete hook.resolve, hook;
}, lifeCycleToArray = (a) => {
  a.parse && !Array.isArray(a.parse) && (a.parse = [a.parse]), a.transform && !Array.isArray(a.transform) && (a.transform = [a.transform]), a.afterHandle && !Array.isArray(a.afterHandle) && (a.afterHandle = [a.afterHandle]), a.mapResponse && !Array.isArray(a.mapResponse) && (a.mapResponse = [a.mapResponse]), a.afterResponse && !Array.isArray(a.afterResponse) && (a.afterResponse = [a.afterResponse]), a.trace && !Array.isArray(a.trace) && (a.trace = [a.trace]), a.error && !Array.isArray(a.error) && (a.error = [a.error]);
  let beforeHandle = [];
  return a.resolve && (beforeHandle = fnToContainer(
    // @ts-expect-error
    Array.isArray(a.resolve) ? a.resolve : [a.resolve],
    "resolve"
  ), delete a.resolve), a.beforeHandle && (beforeHandle.length ? beforeHandle = beforeHandle.concat(
    Array.isArray(a.beforeHandle) ? a.beforeHandle : [a.beforeHandle]
  ) : beforeHandle = Array.isArray(a.beforeHandle) ? a.beforeHandle : [a.beforeHandle]), beforeHandle.length && (a.beforeHandle = beforeHandle), a;
}, isBun = typeof Bun < "u"; isBun && typeof Bun.hash == "function"; const hasSetImmediate = typeof setImmediate == "function", checksum = (s) => {
  let h = 9;
  for (let i = 0; i < s.length; ) h = Math.imul(h ^ s.charCodeAt(i++), 9 ** 9);
  return h = h ^ h >>> 9;
}, injectChecksum = (checksum2, x) => {
  if (!x) return;
  if (!Array.isArray(x)) {
    const fn = x;
    return checksum2 && !fn.checksum && (fn.checksum = checksum2), fn.scope === "scoped" && (fn.scope = "local"), fn;
  }
  const fns = [...x];
  for (const fn of fns)
    checksum2 && !fn.checksum && (fn.checksum = checksum2), fn.scope === "scoped" && (fn.scope = "local");
  return fns;
}, mergeLifeCycle = (a, b, checksum2) => ({
  start: mergeObjectArray(
    a.start,
    injectChecksum(checksum2, b?.start)
  ),
  request: mergeObjectArray(
    a.request,
    injectChecksum(checksum2, b?.request)
  ),
  parse: mergeObjectArray(
    a.parse,
    injectChecksum(checksum2, b?.parse)
  ),
  transform: mergeObjectArray(
    a.transform,
    injectChecksum(checksum2, b?.transform)
  ),
  beforeHandle: mergeObjectArray(
    mergeObjectArray(
      // @ts-ignore
      fnToContainer(a.resolve, "resolve"),
      a.beforeHandle
    ),
    injectChecksum(
      checksum2,
      mergeObjectArray(
        fnToContainer(b?.resolve, "resolve"),
        b?.beforeHandle
      )
    )
  ),
  afterHandle: mergeObjectArray(
    a.afterHandle,
    injectChecksum(checksum2, b?.afterHandle)
  ),
  mapResponse: mergeObjectArray(
    a.mapResponse,
    injectChecksum(checksum2, b?.mapResponse)
  ),
  afterResponse: mergeObjectArray(
    a.afterResponse,
    injectChecksum(checksum2, b?.afterResponse)
  ),
  // Already merged on Elysia._use, also logic is more complicated, can't directly merge
  trace: mergeObjectArray(
    a.trace,
    injectChecksum(checksum2, b?.trace)
  ),
  error: mergeObjectArray(
    a.error,
    injectChecksum(checksum2, b?.error)
  ),
  stop: mergeObjectArray(
    a.stop,
    injectChecksum(checksum2, b?.stop)
  )
}), asHookType = (fn, inject, { skipIfHasType = false }) => {
  if (!fn) return fn;
  if (!Array.isArray(fn))
    return skipIfHasType ? fn.scope ??= inject : fn.scope = inject, fn;
  for (const x of fn)
    skipIfHasType ? x.scope ??= inject : x.scope = inject;
  return fn;
}, filterGlobal = (fn) => {
  if (!fn) return fn;
  if (!Array.isArray(fn))
    switch (fn.scope) {
      case "global":
      case "scoped":
        return { ...fn };
      default:
        return { fn };
    }
  const array = [];
  for (const x of fn)
    switch (x.scope) {
      case "global":
      case "scoped":
        array.push({
          ...x
        });
        break;
    }
  return array;
}, filterGlobalHook = (hook) => ({
  // rest is validator
  ...hook,
  type: hook?.type,
  detail: hook?.detail,
  parse: filterGlobal(hook?.parse),
  transform: filterGlobal(hook?.transform),
  beforeHandle: filterGlobal(hook?.beforeHandle),
  afterHandle: filterGlobal(hook?.afterHandle),
  mapResponse: filterGlobal(hook?.mapResponse),
  afterResponse: filterGlobal(hook?.afterResponse),
  error: filterGlobal(hook?.error),
  trace: filterGlobal(hook?.trace)
}), StatusMap = {
  Continue: 100,
  "Switching Protocols": 101,
  Processing: 102,
  "Early Hints": 103,
  OK: 200,
  Created: 201,
  Accepted: 202,
  "Non-Authoritative Information": 203,
  "No Content": 204,
  "Reset Content": 205,
  "Partial Content": 206,
  "Multi-Status": 207,
  "Already Reported": 208,
  "Multiple Choices": 300,
  "Moved Permanently": 301,
  Found: 302,
  "See Other": 303,
  "Not Modified": 304,
  "Temporary Redirect": 307,
  "Permanent Redirect": 308,
  "Bad Request": 400,
  Unauthorized: 401,
  "Payment Required": 402,
  Forbidden: 403,
  "Not Found": 404,
  "Method Not Allowed": 405,
  "Not Acceptable": 406,
  "Proxy Authentication Required": 407,
  "Request Timeout": 408,
  Conflict: 409,
  Gone: 410,
  "Length Required": 411,
  "Precondition Failed": 412,
  "Payload Too Large": 413,
  "URI Too Long": 414,
  "Unsupported Media Type": 415,
  "Range Not Satisfiable": 416,
  "Expectation Failed": 417,
  "I'm a teapot": 418,
  "Enhance Your Calm": 420,
  "Misdirected Request": 421,
  "Unprocessable Content": 422,
  Locked: 423,
  "Failed Dependency": 424,
  "Too Early": 425,
  "Upgrade Required": 426,
  "Precondition Required": 428,
  "Too Many Requests": 429,
  "Request Header Fields Too Large": 431,
  "Unavailable For Legal Reasons": 451,
  "Internal Server Error": 500,
  "Not Implemented": 501,
  "Bad Gateway": 502,
  "Service Unavailable": 503,
  "Gateway Timeout": 504,
  "HTTP Version Not Supported": 505,
  "Variant Also Negotiates": 506,
  "Insufficient Storage": 507,
  "Loop Detected": 508,
  "Not Extended": 510,
  "Network Authentication Required": 511
}, InvertedStatusMap = Object.fromEntries(
  Object.entries(StatusMap).map(([k, v]) => [v, k])
);
function removeTrailingEquals(digest) {
  let trimmedDigest = digest;
  for (; trimmedDigest.endsWith("="); )
    trimmedDigest = trimmedDigest.slice(0, -1);
  return trimmedDigest;
}
const encoder = new TextEncoder(), signCookie = async (val, secret) => {
  if (typeof val == "object" ? val = JSON.stringify(val) : typeof val != "string" && (val = val + ""), secret === null) throw new TypeError("Secret key must be provided.");
  const secretKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  ), hmacBuffer = await crypto.subtle.sign(
    "HMAC",
    secretKey,
    encoder.encode(val)
  );
  return val + "." + removeTrailingEquals(Buffer.from(hmacBuffer).toString("base64"));
}, constantTimeEqual = typeof crypto?.timingSafeEqual == "function" ? (a, b) => {
  const ab = Buffer.from(a, "utf8"), bb = Buffer.from(b, "utf8");
  return ab.length !== bb.length ? false : crypto.timingSafeEqual(ab, bb);
} : (a, b) => a === b, unsignCookie = async (input, secret) => {
  if (typeof input != "string")
    throw new TypeError("Signed cookie string must be provided.");
  if (secret === null) throw new TypeError("Secret key must be provided.");
  const dot = input.lastIndexOf(".");
  if (dot <= 0) return false;
  const tentativeValue = input.slice(0, dot), expectedInput = await signCookie(tentativeValue, secret);
  return constantTimeEqual(expectedInput, input) ? tentativeValue : false;
}, insertStandaloneValidator = (hook, name, value) => {
  if (!hook.standaloneValidator?.length || !Array.isArray(hook.standaloneValidator)) {
    hook.standaloneValidator = [
      {
        [name]: value
      }
    ];
    return;
  }
  const last = hook.standaloneValidator[hook.standaloneValidator.length - 1];
  name in last ? hook.standaloneValidator.push({
    [name]: value
  }) : last[name] = value;
}, parseNumericString = (message) => {
  if (typeof message == "number") return message;
  if (message.length < 16) {
    if (message.trim().length === 0) return null;
    const length = Number(message);
    return Number.isNaN(length) ? null : length;
  }
  if (message.length === 16) {
    if (message.trim().length === 0) return null;
    const number = Number(message);
    return Number.isNaN(number) || number.toString() !== message ? null : number;
  }
  return null;
}, isNumericString = (message) => parseNumericString(message) !== null;
class PromiseGroup {
  constructor(onError = console.error, onFinally = () => {
  }) {
    this.onError = onError;
    this.onFinally = onFinally;
    this.root = null;
    this.promises = [];
  }
  /**
   * The number of promises still being awaited.
   */
  get size() {
    return this.promises.length;
  }
  /**
   * Add a promise to the group.
   * @returns The promise that was added.
   */
  add(promise) {
    return this.promises.push(promise), this.root ||= this.drain(), this.promises.length === 1 && this.then(this.onFinally), promise;
  }
  async drain() {
    for (; this.promises.length > 0; ) {
      try {
        await this.promises[0];
      } catch (error) {
        this.onError(error);
      }
      this.promises.shift();
    }
    this.root = null;
  }
  // Allow the group to be awaited.
  then(onfulfilled, onrejected) {
    return (this.root ?? Promise.resolve()).then(onfulfilled, onrejected);
  }
}
const fnToContainer = (fn, subType) => {
  if (!fn) return fn;
  if (!Array.isArray(fn)) {
    if (typeof fn == "function" || typeof fn == "string")
      return subType ? { fn, subType } : { fn };
    if ("fn" in fn) return fn;
  }
  const fns = [];
  for (const x of fn)
    typeof x == "function" || typeof x == "string" ? fns.push(subType ? { fn: x, subType } : { fn: x }) : "fn" in x && fns.push(x);
  return fns;
}, localHookToLifeCycleStore = (a) => (a.start && (a.start = fnToContainer(a.start)), a.request && (a.request = fnToContainer(a.request)), a.parse && (a.parse = fnToContainer(a.parse)), a.transform && (a.transform = fnToContainer(a.transform)), a.beforeHandle && (a.beforeHandle = fnToContainer(a.beforeHandle)), a.afterHandle && (a.afterHandle = fnToContainer(a.afterHandle)), a.mapResponse && (a.mapResponse = fnToContainer(a.mapResponse)), a.afterResponse && (a.afterResponse = fnToContainer(a.afterResponse)), a.trace && (a.trace = fnToContainer(a.trace)), a.error && (a.error = fnToContainer(a.error)), a.stop && (a.stop = fnToContainer(a.stop)), a), lifeCycleToFn = (a) => {
  const lifecycle = /* @__PURE__ */ Object.create(null);
  return a.start?.map && (lifecycle.start = a.start.map((x) => x.fn)), a.request?.map && (lifecycle.request = a.request.map((x) => x.fn)), a.parse?.map && (lifecycle.parse = a.parse.map((x) => x.fn)), a.transform?.map && (lifecycle.transform = a.transform.map((x) => x.fn)), a.beforeHandle?.map && (lifecycle.beforeHandle = a.beforeHandle.map((x) => x.fn)), a.afterHandle?.map && (lifecycle.afterHandle = a.afterHandle.map((x) => x.fn)), a.mapResponse?.map && (lifecycle.mapResponse = a.mapResponse.map((x) => x.fn)), a.afterResponse?.map && (lifecycle.afterResponse = a.afterResponse.map((x) => x.fn)), a.error?.map && (lifecycle.error = a.error.map((x) => x.fn)), a.stop?.map && (lifecycle.stop = a.stop.map((x) => x.fn)), a.trace?.map ? lifecycle.trace = a.trace.map((x) => x.fn) : lifecycle.trace = [], lifecycle;
}, cloneInference = (inference) => ({
  body: inference.body,
  cookie: inference.cookie,
  headers: inference.headers,
  query: inference.query,
  set: inference.set,
  server: inference.server,
  path: inference.path,
  route: inference.route,
  url: inference.url
}), redirect = (url, status = 302) => Response.redirect(url, status), ELYSIA_FORM_DATA = Symbol("ElysiaFormData"), ELYSIA_REQUEST_ID = Symbol("ElysiaRequestId"), form = (items) => {
  const formData = new FormData();
  if (formData[ELYSIA_FORM_DATA] = {}, items)
    for (const [key, value] of Object.entries(items)) {
      if (Array.isArray(value)) {
        formData[ELYSIA_FORM_DATA][key] = [];
        for (const v of value)
          value instanceof File ? formData.append(key, value, value.name) : value instanceof ElysiaFile ? formData.append(key, value.value, value.value?.name) : formData.append(key, value), formData[ELYSIA_FORM_DATA][key].push(value);
        continue;
      }
      value instanceof File ? formData.append(key, value, value.name) : value instanceof ElysiaFile ? formData.append(key, value.value, value.value?.name) : formData.append(key, value), formData[ELYSIA_FORM_DATA][key] = value;
    }
  return formData;
}, randomId = typeof crypto > "u" ? () => {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", charactersLength = characters.length;
  for (let i = 0; i < 16; i++)
    result += characters.charAt(
      Math.floor(Math.random() * charactersLength)
    );
  return result;
} : () => {
  const uuid = crypto.randomUUID();
  return uuid.slice(0, 8) + uuid.slice(24, 32);
}, deduplicateChecksum = (array) => {
  if (!array.length) return [];
  const hashes = [];
  for (let i = 0; i < array.length; i++) {
    const item = array[i];
    item.checksum && (hashes.includes(item.checksum) && (array.splice(i, 1), i--), hashes.push(item.checksum));
  }
  return array;
}, promoteEvent = (events, as = "scoped") => {
  if (events) {
    if (as === "scoped") {
      for (const event of events)
        "scope" in event && event.scope === "local" && (event.scope = "scoped");
      return;
    }
    for (const event of events) "scope" in event && (event.scope = "global");
  }
}, getLoosePath$1 = (path) => path.charCodeAt(path.length - 1) === 47 ? path.slice(0, path.length - 1) : path + "/", isNotEmpty = (obj) => {
  if (!obj) return false;
  for (const _ in obj) return true;
  return false;
}, encodePath = (path, { dynamic = false } = {}) => {
  let encoded = encodeURIComponent(path).replace(/%2F/g, "/");
  return dynamic && (encoded = encoded.replace(/%3A/g, ":").replace(/%3F/g, "?")), encoded;
}, supportPerMethodInlineHandler = !!(typeof Bun > "u" || Bun.semver?.satisfies?.(Bun.version, ">=1.2.14"));
async function getResponseLength(response) {
  if (response.bodyUsed || !response.body) return 0;
  let length = 0;
  const reader = response.body.getReader();
  for (; ; ) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
  }
  return length;
}
const emptySchema = {
  headers: true,
  cookie: true,
  query: true,
  params: true,
  body: true,
  response: true
};

const env$1 = typeof Bun < "u" ? Bun.env : typeof process < "u" ? process?.env : void 0, ERROR_CODE = Symbol("ElysiaErrorCode"), isProduction = (env$1?.NODE_ENV ?? env$1?.ENV) === "production", emptyHttpStatus = {
  101: void 0,
  204: void 0,
  205: void 0,
  304: void 0,
  307: void 0,
  308: void 0
};
class ElysiaCustomStatusResponse {
  constructor(code, response) {
    const res = response ?? (code in InvertedStatusMap ? (
      // @ts-expect-error Always correct
      InvertedStatusMap[code]
    ) : code);
    this.code = StatusMap[code] ?? code, code in emptyHttpStatus ? this.response = void 0 : this.response = res;
  }
}
const status = (code, response) => new ElysiaCustomStatusResponse(code, response);
class NotFoundError extends Error {
  constructor(message) {
    super(message ?? "NOT_FOUND");
    this.code = "NOT_FOUND";
    this.status = 404;
  }
}
class ParseError extends Error {
  constructor(cause) {
    super("Bad Request", {
      cause
    });
    this.code = "PARSE";
    this.status = 400;
  }
}
class InvalidCookieSignature extends Error {
  constructor(key, message) {
    super(message ?? `"${key}" has invalid cookie signature`);
    this.key = key;
    this.code = "INVALID_COOKIE_SIGNATURE";
    this.status = 400;
  }
}
const mapValueError = (error) => {
  if (!error) return error;
  let { message, path, value, type } = error;
  Array.isArray(path) && (path = path[0]);
  const property = typeof path == "string" ? path.slice(1).replaceAll("/", ".") : "unknown", isRoot = path === "";
  switch (type) {
    case 42:
      return {
        ...error,
        summary: isRoot ? "Value should not be provided" : `Property '${property}' should not be provided`
      };
    case 45:
      return {
        ...error,
        summary: isRoot ? "Value is missing" : `Property '${property}' is missing`
      };
    case 50:
      const quoteIndex = message.indexOf("'"), format = message.slice(
        quoteIndex + 1,
        message.indexOf("'", quoteIndex + 1)
      );
      return {
        ...error,
        summary: isRoot ? "Value should be an email" : `Property '${property}' should be ${format}`
      };
    case 54:
      return {
        ...error,
        summary: `${message.slice(0, 9).trim()} property '${property}' to be ${message.slice(8).trim()} but found: ${value}`
      };
    case 62:
      const union = error.schema.anyOf.map((x) => `'${x?.format ?? x.type}'`).join(", ");
      return {
        ...error,
        summary: isRoot ? `Value should be one of ${union}` : `Property '${property}' should be one of: ${union}`
      };
    default:
      return { summary: message, ...error };
  }
};
class InvalidFileType extends Error {
  constructor(property, expected, message = `"${property}" has invalid file type`) {
    super(message);
    this.property = property;
    this.expected = expected;
    this.message = message;
    this.code = "INVALID_FILE_TYPE";
    this.status = 422;
    Object.setPrototypeOf(this, InvalidFileType.prototype);
  }
  toResponse(headers) {
    return isProduction ? new Response(
      JSON.stringify({
        type: "validation",
        on: "body"
      }),
      {
        status: 422,
        headers: {
          ...headers,
          "content-type": "application/json"
        }
      }
    ) : new Response(
      JSON.stringify({
        type: "validation",
        on: "body",
        summary: "Invalid file type",
        message: this.message,
        property: this.property,
        expected: this.expected
      }),
      {
        status: 422,
        headers: {
          ...headers,
          "content-type": "application/json"
        }
      }
    );
  }
}
class ValidationError extends Error {
  constructor(type, validator, value, allowUnsafeValidationDetails = false, errors) {
    let message = "", error, expected, customError;
    if (
      // @ts-ignore
      validator?.provider === "standard" || "~standard" in validator || // @ts-ignore
      validator.schema && "~standard" in validator.schema
    ) {
      const standard = (
        // @ts-ignore
        ("~standard" in validator ? validator : validator.schema)["~standard"]
      );
      error = (errors ?? standard.validate(value).issues)?.[0], isProduction && !allowUnsafeValidationDetails ? message = JSON.stringify({
        type: "validation",
        on: type,
        found: value
      }) : message = JSON.stringify(
        {
          type: "validation",
          on: type,
          property: error.path?.[0] || "root",
          message: error?.message,
          summary: error?.problem,
          expected,
          found: value,
          errors
        },
        null,
        2
      ), customError = error?.message;
    } else {
      value && typeof value == "object" && value instanceof ElysiaCustomStatusResponse && (value = value.response), error = errors?.First() ?? ("Errors" in validator ? validator.Errors(value).First() : Errors(validator, value).First());
      const accessor = error?.path || "root", schema = validator?.schema ?? validator;
      if (!isProduction && !allowUnsafeValidationDetails)
        try {
          expected = Create(schema);
        } catch (error2) {
          expected = {
            type: "Could not create expected value",
            // @ts-expect-error
            message: error2?.message,
            error: error2
          };
        }
      customError = error?.schema?.message || error?.schema?.error !== void 0 ? typeof error.schema.error == "function" ? error.schema.error(
        isProduction && !allowUnsafeValidationDetails ? {
          type: "validation",
          on: type,
          found: value
        } : {
          type: "validation",
          on: type,
          value,
          property: accessor,
          message: error?.message,
          summary: mapValueError(error).summary,
          found: value,
          expected,
          errors: "Errors" in validator ? [
            ...validator.Errors(
              value
            )
          ].map(mapValueError) : [
            ...Errors(
              validator,
              value
            )
          ].map(mapValueError)
        },
        validator
      ) : error.schema.error : void 0, customError !== void 0 ? message = typeof customError == "object" ? JSON.stringify(customError) : customError + "" : isProduction && !allowUnsafeValidationDetails ? message = JSON.stringify({
        type: "validation",
        on: type,
        found: value
      }) : message = JSON.stringify(
        {
          type: "validation",
          on: type,
          property: accessor,
          message: error?.message,
          summary: mapValueError(error).summary,
          expected,
          found: value,
          errors: "Errors" in validator ? [...validator.Errors(value)].map(
            mapValueError
          ) : [...Errors(validator, value)].map(
            mapValueError
          )
        },
        null,
        2
      );
    }
    super(message);
    this.type = type;
    this.validator = validator;
    this.value = value;
    this.allowUnsafeValidationDetails = allowUnsafeValidationDetails;
    this.code = "VALIDATION";
    this.status = 422;
    this.valueError = error, this.expected = expected, this.customError = customError, Object.setPrototypeOf(this, ValidationError.prototype);
  }
  /**
   * Alias of `valueError`
   */
  get messageValue() {
    return this.valueError;
  }
  get all() {
    return (
      // @ts-ignore
      this.validator?.provider === "standard" || "~standard" in this.validator || // @ts-ignore
      "schema" in this.validator && // @ts-ignore
      this.validator.schema && // @ts-ignore
      "~standard" in this.validator.schema ? /* @ts-ignore */ ("~standard" in this.validator ? this.validator : (
        // @ts-ignore
        this.validator.schema
      ))["~standard"].validate(this.value).issues?.map((issue) => ({
        summary: issue.message,
        path: issue.path?.join(".") || "root",
        message: issue.message,
        value: this.value
      })) || [] : "Errors" in this.validator ? [...this.validator.Errors(this.value)].map(mapValueError) : (
        // @ts-ignore
        [...Errors(this.validator, this.value)].map(mapValueError)
      )
    );
  }
  static simplifyModel(validator) {
    const model = "schema" in validator ? validator.schema : validator;
    try {
      return Create(model);
    } catch {
      return model;
    }
  }
  get model() {
    return "~standard" in this.validator ? this.validator : ValidationError.simplifyModel(this.validator);
  }
  toResponse(headers) {
    return new Response(this.message, {
      status: 400,
      headers: {
        ...headers,
        "content-type": "application/json"
      }
    });
  }
  /**
   * Utility function to inherit add custom error and keep the original Validation error
   *
   * @since 1.3.14
   *
   * @example
   * ```ts
   * new Elysia()
   *		.onError(({ error, code }) => {
   *			if (code === 'VALIDATION') return error.detail(error.message)
   *		})
   *		.post('/', () => 'Hello World!', {
   *			body: t.Object({
   *				x: t.Number({
   *					error: 'x must be a number'
   *				})
   *			})
   *		})
   * ```
   */
  detail(message, allowUnsafeValidatorDetails = this.allowUnsafeValidationDetails) {
    if (!this.customError) return this.message;
    const value = this.value, expected = this.expected, errors = this.all;
    return isProduction && !allowUnsafeValidatorDetails ? {
      type: "validation",
      on: this.type,
      found: value,
      message
    } : {
      type: "validation",
      on: this.type,
      property: this.valueError?.path || "root",
      message,
      summary: this.valueError ? mapValueError(this.valueError).summary : void 0,
      found: value,
      expected,
      errors
    };
  }
}

const tryParse = (v, schema) => {
  try {
    return JSON.parse(v);
  } catch {
    throw new ValidationError("property", schema, v);
  }
};
function createType(kind, func) {
  return Has$1(kind) || Set$1(kind, func), (options = {}) => Unsafe({ ...options, [Kind$2]: kind });
}
const compile = (schema) => {
  try {
    const compiler = TypeCompiler.Compile(schema);
    return compiler.Create = () => Create(schema), compiler.Error = (v) => (
      // @ts-ignore
      new ValidationError("property", schema, v, compiler.Errors(v))
    ), compiler;
  } catch {
    return {
      Check: (v) => Check(schema, v),
      CheckThrow: (v) => {
        if (!Check(schema, v))
          throw new ValidationError(
            "property",
            schema,
            v,
            // @ts-ignore
            Errors(schema, v)
          );
      },
      Decode: (v) => Decode(schema, v),
      Create: () => Create(schema),
      Error: (v) => new ValidationError(
        "property",
        schema,
        v,
        // @ts-ignore
        Errors(schema, v)
      )
    };
  }
}, parseFileUnit = (size) => {
  if (typeof size == "string")
    switch (size.slice(-1)) {
      case "k":
        return +size.slice(0, size.length - 1) * 1024;
      case "m":
        return +size.slice(0, size.length - 1) * 1048576;
      default:
        return +size;
    }
  return size;
}, checkFileExtension = (type, extension) => type.startsWith(extension) ? true : extension.charCodeAt(extension.length - 1) === 42 && extension.charCodeAt(extension.length - 2) === 47 && type.startsWith(extension.slice(0, -1));
let _fileTypeFromBlobWarn = false;
const warnIfFileTypeIsNotInstalled = () => {
  _fileTypeFromBlobWarn || (console.warn(
    "[Elysia] Attempt to validate file type without 'file-type'. This may lead to security risks. We recommend installing 'file-type' to properly validate file extension."
  ), _fileTypeFromBlobWarn = true);
}, loadFileType = async () => import('../../chunks/core_d9mIKPTi.mjs').then((x) => (_fileTypeFromBlob = x.fileTypeFromBlob, _fileTypeFromBlob)).catch(warnIfFileTypeIsNotInstalled);
let _fileTypeFromBlob;
const fileTypeFromBlob = (file) => _fileTypeFromBlob ? _fileTypeFromBlob(file) : loadFileType().then((mod) => {
  if (mod) return mod(file);
}), fileType = async (file, extension, name = file?.name ?? "") => {
  if (Array.isArray(file))
    return await Promise.all(file.map((f) => fileType(f, extension, name))), true;
  if (!file) return false;
  const result = await fileTypeFromBlob(file);
  if (!result) throw new InvalidFileType(name, extension);
  if (typeof extension == "string" && !checkFileExtension(result.mime, extension))
    throw new InvalidFileType(name, extension);
  for (let i = 0; i < extension.length; i++)
    if (checkFileExtension(result.mime, extension[i])) return true;
  throw new InvalidFileType(name, extension);
}, validateFile = (options, value) => {
  if (value instanceof ElysiaFile) return true;
  if (!(value instanceof Blob) || options.minSize && value.size < parseFileUnit(options.minSize) || options.maxSize && value.size > parseFileUnit(options.maxSize))
    return false;
  if (options.extension) {
    if (typeof options.extension == "string")
      return checkFileExtension(value.type, options.extension);
    for (let i = 0; i < options.extension.length; i++)
      if (checkFileExtension(value.type, options.extension[i]))
        return true;
    return false;
  }
  return true;
};

const fullFormats = {
  // date: http://tools.ietf.org/html/rfc3339#section-5.6
  date: date$1,
  // date-time: http://tools.ietf.org/html/rfc3339#section-5.6
  time: getTime(true),
  "date-time": getDateTime(true),
  "iso-time": getTime(false),
  "iso-date-time": getDateTime(false),
  // duration: https://tools.ietf.org/html/rfc3339#appendix-A
  duration: /^P(?!$)((\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+S)?)?|(\d+W)?)$/,
  uri,
  "uri-reference": /^(?:[a-z][a-z0-9+\-.]*:)?(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'"()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?(?:\?(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i,
  // uri-template: https://tools.ietf.org/html/rfc6570
  "uri-template": /^(?:(?:[^\x00-\x20"'<>%\\^`{|}]|%[0-9a-f]{2})|\{[+#./;?&=,!@|]?(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?(?:,(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?)*\})*$/i,
  // For the source: https://gist.github.com/dperini/729294
  // For test cases: https://mathiasbynens.be/demo/url-regex
  url: /^(?:https?|ftp):\/\/(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)(?:\.(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)*(?:\.(?:[a-z\u{00a1}-\u{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/iu,
  email: /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
  hostname: /^(?=.{1,253}\.?$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*\.?$/i,
  // optimized https://www.safaribooksonline.com/library/view/regular-expressions-cookbook/9780596802837/ch07s16.html
  ipv4: /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/,
  ipv6: /^((([0-9a-f]{1,4}:){7}([0-9a-f]{1,4}|:))|(([0-9a-f]{1,4}:){6}(:[0-9a-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){5}(((:[0-9a-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){4}(((:[0-9a-f]{1,4}){1,3})|((:[0-9a-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){3}(((:[0-9a-f]{1,4}){1,4})|((:[0-9a-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){2}(((:[0-9a-f]{1,4}){1,5})|((:[0-9a-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){1}(((:[0-9a-f]{1,4}){1,6})|((:[0-9a-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9a-f]{1,4}){1,7})|((:[0-9a-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))$/i,
  regex,
  // uuid: http://tools.ietf.org/html/rfc4122
  uuid: /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i,
  // JSON-pointer: https://tools.ietf.org/html/rfc6901
  // uri fragment: https://tools.ietf.org/html/rfc3986#appendix-A
  "json-pointer": /^(?:\/(?:[^~/]|~0|~1)*)*$/,
  "json-pointer-uri-fragment": /^#(?:\/(?:[a-z0-9_\-.!$&'()*+,;:=@]|%[0-9a-f]{2}|~0|~1)*)*$/i,
  // relative JSON-pointer: http://tools.ietf.org/html/draft-luff-relative-json-pointer-00
  "relative-json-pointer": /^(?:0|[1-9][0-9]*)(?:#|(?:\/(?:[^~/]|~0|~1)*)*)$/,
  // the following formats are used by the openapi specification: https://spec.openapis.org/oas/v3.0.0#data-types
  // byte: https://github.com/miguelmota/is-base64
  byte,
  // signed 32 bit integer
  int32: { type: "number", validate: validateInt32 },
  // signed 64 bit integer
  int64: { type: "number", validate: validateInt64 },
  // C-type float
  float: { type: "number", validate: validateNumber },
  // C-type double
  double: { type: "number", validate: validateNumber },
  // hint to the UI to hide input strings
  password: true,
  // unchecked string payload
  binary: true
};
function isLeapYear(year) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}
const DATE = /^(\d\d\d\d)-(\d\d)-(\d\d)$/, DAYS = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
function date$1(str) {
  const matches = DATE.exec(str);
  if (!matches) return false;
  const year = +matches[1], month = +matches[2], day = +matches[3];
  return month >= 1 && month <= 12 && day >= 1 && day <= (month === 2 && isLeapYear(year) ? 29 : DAYS[month]);
}
const TIME = /^(\d\d):(\d\d):(\d\d(?:\.\d+)?)(z|([+-])(\d\d)(?::?(\d\d))?)?$/i;
function getTime(strictTimeZone) {
  return function(str) {
    const matches = TIME.exec(str);
    if (!matches) return false;
    const hr = +matches[1], min = +matches[2], sec = +matches[3], tz = matches[4], tzSign = matches[5] === "-" ? -1 : 1, tzH = +(matches[6] || 0), tzM = +(matches[7] || 0);
    if (tzH > 23 || tzM > 59 || strictTimeZone && !tz) return false;
    if (hr <= 23 && min <= 59 && sec < 60) return true;
    const utcMin = min - tzM * tzSign, utcHr = hr - tzH * tzSign - (utcMin < 0 ? 1 : 0);
    return (utcHr === 23 || utcHr === -1) && (utcMin === 59 || utcMin === -1) && sec < 61;
  };
}
const parseDateTimeEmptySpace = (str) => str.charCodeAt(str.length - 6) === 32 ? str.slice(0, -6) + "+" + str.slice(-5) : str, DATE_TIME_SEPARATOR = /t|\s/i;
function getDateTime(strictTimeZone) {
  const time = getTime(strictTimeZone);
  return function(str) {
    const dateTime = str.split(DATE_TIME_SEPARATOR);
    return dateTime.length === 2 && date$1(dateTime[0]) && time(dateTime[1]);
  };
}
const NOT_URI_FRAGMENT = /\/|:/, URI = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
function uri(str) {
  return NOT_URI_FRAGMENT.test(str) && URI.test(str);
}
const BYTE = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/gm;
function byte(str) {
  return BYTE.lastIndex = 0, BYTE.test(str);
}
const MIN_INT32 = -2147483648, MAX_INT32 = 2 ** 31 - 1;
function validateInt32(value) {
  return Number.isInteger(value) && value <= MAX_INT32 && value >= MIN_INT32;
}
function validateInt64(value) {
  return Number.isInteger(value);
}
function validateNumber() {
  return true;
}
const Z_ANCHOR = /[^\\]\\Z/;
function regex(str) {
  if (Z_ANCHOR.test(str)) return false;
  try {
    return new RegExp(str), !0;
  } catch {
    return false;
  }
}
/**
 * @license
 *
 * MIT License
 *
 * Copyright (c) 2020 Evgeny Poberezkin
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
const isISO8601 = /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/, isFormalDate = /(?:Sun|Mon|Tue|Wed|Thu|Fri|Sat)\s(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{2}\s\d{4}\s\d{2}:\d{2}:\d{2}\sGMT(?:\+|-)\d{4}\s\([^)]+\)/, isShortenDate = /^(?:(?:(?:(?:0?[1-9]|[12][0-9]|3[01])[/\s-](?:0?[1-9]|1[0-2])[/\s-](?:19|20)\d{2})|(?:(?:19|20)\d{2}[/\s-](?:0?[1-9]|1[0-2])[/\s-](?:0?[1-9]|[12][0-9]|3[01]))))(?:\s(?:1[012]|0?[1-9]):[0-5][0-9](?::[0-5][0-9])?(?:\s[AP]M)?)?$/, _validateDate = fullFormats.date, _validateDateTime = fullFormats["date-time"];
Has$2("date") || Set$2("date", (value) => {
  const temp = parseDateTimeEmptySpace(value).replace(/"/g, "");
  if (isISO8601.test(temp) || isFormalDate.test(temp) || isShortenDate.test(temp) || _validateDate(temp)) {
    const date2 = new Date(temp);
    if (!Number.isNaN(date2.getTime())) return true;
  }
  return false;
}), Has$2("date-time") || Set$2("date-time", (value) => {
  const temp = value.replace(/"/g, "");
  if (isISO8601.test(temp) || isFormalDate.test(temp) || isShortenDate.test(temp) || _validateDateTime(temp)) {
    const date2 = new Date(temp);
    if (!Number.isNaN(date2.getTime())) return true;
  }
  return false;
}), Object.entries(fullFormats).forEach((formatEntry) => {
  const [formatName, formatValue] = formatEntry;
  Has$2(formatName) || (formatValue instanceof RegExp ? Set$2(formatName, (value) => formatValue.test(value)) : typeof formatValue == "function" && Set$2(formatName, formatValue));
}), Has$2("numeric") || Set$2("numeric", (value) => !!value && !isNaN(+value)), Has$2("integer") || Set$2(
  "integer",
  (value) => !!value && Number.isInteger(+value)
), Has$2("boolean") || Set$2(
  "boolean",
  (value) => value === "true" || value === "false"
), Has$2("ObjectString") || Set$2("ObjectString", (value) => {
  let start = value.charCodeAt(0);
  if ((start === 9 || start === 10 || start === 32) && (start = value.trimStart().charCodeAt(0)), start !== 123 && start !== 91) return false;
  try {
    return JSON.parse(value), !0;
  } catch {
    return false;
  }
}), Has$2("ArrayString") || Set$2("ArrayString", (value) => {
  let start = value.charCodeAt(0);
  if ((start === 9 || start === 10 || start === 32) && (start = value.trimStart().charCodeAt(0)), start !== 123 && start !== 91) return false;
  try {
    return JSON.parse(value), !0;
  } catch {
    return false;
  }
});

const t = Object.assign({}, Type);
createType(
  "UnionEnum",
  (schema, value) => (typeof value == "number" || typeof value == "string" || value === null) && schema.enum.includes(value)
), createType(
  "ArrayBuffer",
  (schema, value) => value instanceof ArrayBuffer
);
const internalFiles = createType(
  "Files",
  (options, value) => {
    if (options.minItems && options.minItems > 1 && !Array.isArray(value))
      return false;
    if (!Array.isArray(value)) return validateFile(options, value);
    if (options.minItems && value.length < options.minItems || options.maxItems && value.length > options.maxItems) return false;
    for (let i = 0; i < value.length; i++)
      if (!validateFile(options, value[i])) return false;
    return true;
  }
), internalFormData = createType(
  "ElysiaForm",
  ({ compiler, ...schema }, value) => {
    if (!(value instanceof FormData)) return false;
    if (compiler) {
      if (!(ELYSIA_FORM_DATA in value))
        throw new ValidationError("property", schema, value);
      if (!compiler.Check(value[ELYSIA_FORM_DATA]))
        throw compiler.Error(value[ELYSIA_FORM_DATA]);
    }
    return true;
  }
), ElysiaType = {
  // @ts-ignore
  String: (property) => Type.String(property),
  Numeric: (property) => {
    const schema = Type.Number(property), compiler = compile(schema);
    return t.Transform(
      t.Union(
        [
          t.String({
            format: "numeric",
            default: 0
          }),
          t.Number(property)
        ],
        property
      )
    ).Decode((value) => {
      const number = +value;
      if (isNaN(number)) return value;
      if (property && !compiler.Check(number))
        throw compiler.Error(number);
      return number;
    }).Encode((value) => value);
  },
  NumericEnum(item, property) {
    const schema = Type.Enum(item, property), compiler = compile(schema);
    return t.Transform(
      t.Union([t.String({ format: "numeric" }), t.Number()], property)
    ).Decode((value) => {
      const number = +value;
      if (isNaN(number) || !compiler.Check(number)) throw compiler.Error(number);
      return number;
    }).Encode((value) => value);
  },
  Integer: (property) => {
    const schema = Type.Integer(property), compiler = compile(schema);
    return t.Transform(
      t.Union(
        [
          t.String({
            format: "integer",
            default: 0
          }),
          Type.Integer(property)
        ],
        property
      )
    ).Decode((value) => {
      const number = +value;
      if (!compiler.Check(number)) throw compiler.Error(number);
      return number;
    }).Encode((value) => value);
  },
  Date: (property) => {
    const schema = Type.Date(property), compiler = compile(schema), _default = property?.default ? new Date(property.default) : void 0;
    return t.Transform(
      t.Union(
        [
          Type.Date(property),
          t.String({
            format: "date-time",
            default: _default?.toISOString()
          }),
          t.String({
            format: "date",
            default: _default?.toISOString()
          }),
          t.Number({ default: _default?.getTime() })
        ],
        property
      )
    ).Decode((value) => {
      if (typeof value == "number") {
        const date2 = new Date(value);
        if (!compiler.Check(date2)) throw compiler.Error(date2);
        return date2;
      }
      if (value instanceof Date) return value;
      const date = new Date(parseDateTimeEmptySpace(value));
      if (!date || isNaN(date.getTime()))
        throw new ValidationError("property", schema, date);
      if (!compiler.Check(date)) throw compiler.Error(date);
      return date;
    }).Encode((value) => {
      if (value instanceof Date) return value.toISOString();
      if (typeof value == "string") {
        const parsed = new Date(parseDateTimeEmptySpace(value));
        if (isNaN(parsed.getTime()))
          throw new ValidationError("property", schema, value);
        return parsed.toISOString();
      }
      if (!compiler.Check(value)) throw compiler.Error(value);
      return value;
    });
  },
  BooleanString: (property) => {
    const schema = Type.Boolean(property), compiler = compile(schema);
    return t.Transform(
      t.Union(
        [
          t.Boolean(property),
          t.String({
            format: "boolean",
            default: false
          })
        ],
        property
      )
    ).Decode((value) => {
      if (typeof value == "string") return value === "true";
      if (value !== void 0 && !compiler.Check(value))
        throw compiler.Error(value);
      return value;
    }).Encode((value) => value);
  },
  ObjectString: (properties, options) => {
    const schema = t.Object(properties, options), compiler = compile(schema);
    return t.Transform(
      t.Union(
        [
          t.String({
            format: "ObjectString",
            default: options?.default
          }),
          schema
        ],
        {
          elysiaMeta: "ObjectString"
        }
      )
    ).Decode((value) => {
      if (typeof value == "string") {
        if (value.charCodeAt(0) !== 123)
          throw new ValidationError("property", schema, value);
        if (!compiler.Check(value = tryParse(value, schema)))
          throw compiler.Error(value);
        return compiler.Decode(value);
      }
      return value;
    }).Encode((value) => {
      let original;
      if (typeof value == "string" && (value = tryParse(original = value, schema)), !compiler.Check(value)) throw compiler.Error(value);
      return original ?? JSON.stringify(value);
    });
  },
  ArrayString: (children = t.String(), options) => {
    const schema = t.Array(children, options), compiler = compile(schema), decode = (value, isProperty = false) => {
      if (value.charCodeAt(0) === 91) {
        if (!compiler.Check(value = tryParse(value, schema)))
          throw compiler.Error(value);
        return compiler.Decode(value);
      }
      if (isProperty) return value;
      throw new ValidationError("property", schema, value);
    };
    return t.Transform(
      t.Union(
        [
          t.String({
            format: "ArrayString",
            default: options?.default
          }),
          schema
        ],
        {
          elysiaMeta: "ArrayString"
        }
      )
    ).Decode((value) => {
      if (Array.isArray(value)) {
        let values = [];
        for (let i = 0; i < value.length; i++) {
          const v = value[i];
          if (typeof v == "string") {
            const t2 = decode(v, true);
            Array.isArray(t2) ? values = values.concat(t2) : values.push(t2);
            continue;
          }
          values.push(v);
        }
        return values;
      }
      return typeof value == "string" ? decode(value) : value;
    }).Encode((value) => {
      let original;
      if (typeof value == "string" && (value = tryParse(original = value, schema)), !compiler.Check(value))
        throw new ValidationError("property", schema, value);
      return original ?? JSON.stringify(value);
    });
  },
  ArrayQuery: (children = t.String(), options) => {
    const schema = t.Array(children, options), compiler = compile(schema), decode = (value) => value.indexOf(",") !== -1 ? compiler.Decode(value.split(",")) : compiler.Decode([value]);
    return t.Transform(
      t.Union(
        [
          t.String({
            default: options?.default
          }),
          schema
        ],
        {
          elysiaMeta: "ArrayQuery"
        }
      )
    ).Decode((value) => {
      if (Array.isArray(value)) {
        let values = [];
        for (let i = 0; i < value.length; i++) {
          const v = value[i];
          if (typeof v == "string") {
            const t2 = decode(v);
            Array.isArray(t2) ? values = values.concat(t2) : values.push(t2);
            continue;
          }
          values.push(v);
        }
        return values;
      }
      return typeof value == "string" ? decode(value) : value;
    }).Encode((value) => {
      let original;
      if (typeof value == "string" && (value = tryParse(original = value, schema)), !compiler.Check(value))
        throw new ValidationError("property", schema, value);
      return original ?? JSON.stringify(value);
    });
  },
  File: createType(
    "File",
    validateFile
  ),
  Files: (options = {}) => t.Transform(internalFiles(options)).Decode((value) => Array.isArray(value) ? value : [value]).Encode((value) => value),
  Nullable: (schema, options) => t.Union([schema, t.Null()], {
    ...options,
    nullable: true
  }),
  /**
   * Allow Optional, Nullable and Undefined
   */
  MaybeEmpty: (schema, options) => t.Union([schema, t.Null(), t.Undefined()], options),
  Cookie: (properties, {
    domain,
    expires,
    httpOnly,
    maxAge,
    path,
    priority,
    sameSite,
    secure,
    secrets,
    sign,
    ...options
  } = {}) => {
    const v = t.Object(properties, options);
    return v.config = {
      domain,
      expires,
      httpOnly,
      maxAge,
      path,
      priority,
      sameSite,
      secure,
      secrets,
      sign
    }, v;
  },
  UnionEnum: (values, options = {}) => {
    const type = values.every((value) => typeof value == "string") ? { type: "string" } : values.every((value) => typeof value == "number") ? { type: "number" } : values.every((value) => value === null) ? { type: "null" } : {};
    if (values.some((x) => typeof x == "object" && x !== null))
      throw new Error("This type does not support objects or arrays");
    return {
      // default is need for generating error message
      default: values[0],
      ...options,
      [Kind$2]: "UnionEnum",
      ...type,
      enum: values
    };
  },
  NoValidate: (v, enabled = true) => (v.noValidate = enabled, v),
  Form: (v, options = {}) => {
    const schema = t.Object(v, {
      default: form({}),
      ...options
    }), compiler = compile(schema);
    return t.Union([
      schema,
      // @ts-expect-error
      internalFormData({
        compiler
      })
    ]);
  },
  ArrayBuffer(options = {}) {
    return {
      // default is need for generating error message
      default: [1, 2, 3],
      ...options,
      [Kind$2]: "ArrayBuffer"
    };
  },
  Uint8Array: (options) => {
    const schema = Type.Uint8Array(options), compiler = compile(schema);
    return t.Transform(t.Union([t.ArrayBuffer(), Type.Uint8Array(options)])).Decode((value) => {
      if (value instanceof ArrayBuffer) {
        if (!compiler.Check(value = new Uint8Array(value)))
          throw compiler.Error(value);
        return value;
      }
      return value;
    }).Encode((value) => value);
  }
};
t.BooleanString = ElysiaType.BooleanString, t.ObjectString = ElysiaType.ObjectString, t.ArrayString = ElysiaType.ArrayString, t.ArrayQuery = ElysiaType.ArrayQuery, t.Numeric = ElysiaType.Numeric, t.NumericEnum = ElysiaType.NumericEnum, t.Integer = ElysiaType.Integer, t.File = (arg) => (arg?.type && loadFileType(), ElysiaType.File({
  default: "File",
  ...arg,
  extension: arg?.type,
  type: "string",
  format: "binary"
})), t.Files = (arg) => (arg?.type && loadFileType(), ElysiaType.Files({
  ...arg,
  elysiaMeta: "Files",
  default: "Files",
  extension: arg?.type,
  type: "array",
  items: {
    ...arg,
    default: "Files",
    type: "string",
    format: "binary"
  }
})), t.Nullable = ElysiaType.Nullable, t.MaybeEmpty = ElysiaType.MaybeEmpty, t.Cookie = ElysiaType.Cookie, t.Date = ElysiaType.Date, t.UnionEnum = ElysiaType.UnionEnum, t.NoValidate = ElysiaType.NoValidate, t.Form = ElysiaType.Form, t.ArrayBuffer = ElysiaType.ArrayBuffer, t.Uint8Array = ElysiaType.Uint8Array;

const hashString = (str) => {
  let hash = 2166136261;
  const len = str.length;
  for (let i = 0; i < len; i++)
    hash ^= str.charCodeAt(i), hash = Math.imul(hash, 16777619);
  return hash >>> 0;
};
class Cookie {
  constructor(name, jar, initial = {}) {
    this.name = name;
    this.jar = jar;
    this.initial = initial;
  }
  get cookie() {
    return this.jar[this.name] ?? this.initial;
  }
  set cookie(jar) {
    this.name in this.jar || (this.jar[this.name] = this.initial), this.jar[this.name] = jar, this.valueHash = void 0;
  }
  get setCookie() {
    return this.name in this.jar || (this.jar[this.name] = this.initial), this.jar[this.name];
  }
  set setCookie(jar) {
    this.cookie = jar;
  }
  get value() {
    return this.cookie.value;
  }
  set value(value) {
    const current = this.cookie.value;
    if (current !== value) {
      if (typeof current == "object" && current !== null && typeof value == "object" && value !== null)
        try {
          const valueStr = JSON.stringify(value), newHash = hashString(valueStr);
          if (this.valueHash !== void 0 && this.valueHash !== newHash)
            this.valueHash = newHash;
          else {
            if (JSON.stringify(current) === valueStr) {
              this.valueHash = newHash;
              return;
            }
            this.valueHash = newHash;
          }
        } catch {
        }
      this.name in this.jar || (this.jar[this.name] = { ...this.initial }), this.jar[this.name].value = value;
    }
  }
  get expires() {
    return this.cookie.expires;
  }
  set expires(expires) {
    this.setCookie.expires = expires;
  }
  get maxAge() {
    return this.cookie.maxAge;
  }
  set maxAge(maxAge) {
    this.setCookie.maxAge = maxAge;
  }
  get domain() {
    return this.cookie.domain;
  }
  set domain(domain) {
    this.setCookie.domain = domain;
  }
  get path() {
    return this.cookie.path;
  }
  set path(path) {
    this.setCookie.path = path;
  }
  get secure() {
    return this.cookie.secure;
  }
  set secure(secure) {
    this.setCookie.secure = secure;
  }
  get httpOnly() {
    return this.cookie.httpOnly;
  }
  set httpOnly(httpOnly) {
    this.setCookie.httpOnly = httpOnly;
  }
  get sameSite() {
    return this.cookie.sameSite;
  }
  set sameSite(sameSite) {
    this.setCookie.sameSite = sameSite;
  }
  get priority() {
    return this.cookie.priority;
  }
  set priority(priority) {
    this.setCookie.priority = priority;
  }
  get partitioned() {
    return this.cookie.partitioned;
  }
  set partitioned(partitioned) {
    this.setCookie.partitioned = partitioned;
  }
  get secrets() {
    return this.cookie.secrets;
  }
  set secrets(secrets) {
    this.setCookie.secrets = secrets;
  }
  update(config) {
    return this.setCookie = Object.assign(
      this.cookie,
      typeof config == "function" ? config(this.cookie) : config
    ), this;
  }
  set(config) {
    return this.setCookie = Object.assign(
      {
        ...this.initial,
        value: this.value
      },
      typeof config == "function" ? config(this.cookie) : config
    ), this;
  }
  remove() {
    if (this.value !== void 0)
      return this.set({
        expires: /* @__PURE__ */ new Date(0),
        maxAge: 0,
        value: ""
      }), this;
  }
  toString() {
    return typeof this.value == "object" ? JSON.stringify(this.value) : this.value?.toString() ?? "";
  }
}
const createCookieJar = (set, store, initial) => (set.cookie || (set.cookie = {}), new Proxy(store, {
  get(_, key) {
    return key in store ? new Cookie(
      key,
      set.cookie,
      Object.assign({}, initial ?? {}, store[key])
    ) : new Cookie(
      key,
      set.cookie,
      Object.assign({}, initial)
    );
  }
})), parseCookie = async (set, cookieString, {
  secrets,
  sign,
  ...initial
} = {}) => {
  if (!cookieString) return createCookieJar(set, {}, initial);
  const isStringKey = typeof secrets == "string";
  sign && sign !== true && !Array.isArray(sign) && (sign = [sign]);
  const jar = {}, cookies = distExports.parse(cookieString);
  for (const [name, v] of Object.entries(cookies)) {
    if (v === void 0) continue;
    let value = fastDecodeURIComponent(v);
    if (value) {
      const starts = value.charCodeAt(0), ends = value.charCodeAt(value.length - 1);
      if (starts === 123 && ends === 125 || starts === 91 && ends === 93)
        try {
          value = JSON.parse(value);
        } catch {
        }
    }
    if (sign === true || sign?.includes(name)) {
      if (!secrets)
        throw new Error("No secret is provided to cookie plugin");
      if (isStringKey) {
        if (typeof value != "string") throw new InvalidCookieSignature(name);
        const temp = await unsignCookie(value, secrets);
        if (temp === false) throw new InvalidCookieSignature(name);
        value = temp;
      } else {
        let decoded = false;
        for (let i = 0; i < secrets.length; i++) {
          if (typeof value != "string") throw new InvalidCookieSignature(name);
          const temp = await unsignCookie(value, secrets[i]);
          if (temp !== false) {
            decoded = true, value = temp;
            break;
          }
        }
        if (!decoded) throw new InvalidCookieSignature(name);
      }
    }
    jar[name] = {
      value
    };
  }
  return createCookieJar(set, jar, initial);
}, serializeCookie = (cookies) => {
  if (!cookies || !isNotEmpty(cookies)) return;
  const set = [];
  for (const [key, property] of Object.entries(cookies)) {
    if (!key || !property) continue;
    const value = property.value;
    value != null && set.push(
      distExports.serialize(
        key,
        typeof value == "object" ? JSON.stringify(value) : value + "",
        property
      )
    );
  }
  if (set.length !== 0)
    return set.length === 1 ? set[0] : set;
};

const env = isBun$1 ? Bun.env : typeof process < "u" && process.env ? process.env : {};

const handleFile = (response, set) => {
  if (!isBun$1 && response instanceof Promise)
    return response.then((res) => handleFile(res, set));
  const size = response.size, immutable = set && (set.status === 206 || set.status === 304 || set.status === 412 || set.status === 416), defaultHeader = immutable ? {} : {
    "accept-ranges": "bytes",
    "content-range": size ? `bytes 0-${size - 1}/${size}` : void 0
  };
  if (!set && !size) return new Response(response);
  if (!set)
    return new Response(response, {
      headers: defaultHeader
    });
  if (set.headers instanceof Headers) {
    for (const key of Object.keys(defaultHeader))
      key in set.headers && set.headers.append(key, defaultHeader[key]);
    return immutable && (set.headers.delete("content-length"), set.headers.delete("accept-ranges")), new Response(response, set);
  }
  return isNotEmpty(set.headers) ? new Response(response, {
    status: set.status,
    headers: Object.assign(defaultHeader, set.headers)
  }) : new Response(response, {
    status: set.status,
    headers: defaultHeader
  });
}, parseSetCookies = (headers, setCookie) => {
  if (!headers) return headers;
  headers.delete("set-cookie");
  for (let i = 0; i < setCookie.length; i++) {
    const index = setCookie[i].indexOf("=");
    headers.append(
      "set-cookie",
      `${setCookie[i].slice(0, index)}=${setCookie[i].slice(index + 1) || ""}`
    );
  }
  return headers;
}, responseToSetHeaders = (response, set) => {
  if (set?.headers) {
    if (response)
      if (hasHeaderShorthand)
        Object.assign(set.headers, response.headers.toJSON());
      else
        for (const [key, value] of response.headers.entries())
          key in set.headers && (set.headers[key] = value);
    return set.status === 200 && (set.status = response.status), set.headers["content-encoding"] && delete set.headers["content-encoding"], set;
  }
  if (!response)
    return {
      headers: {},
      status: set?.status ?? 200
    };
  if (hasHeaderShorthand)
    return set = {
      headers: response.headers.toJSON(),
      status: set?.status ?? 200
    }, set.headers["content-encoding"] && delete set.headers["content-encoding"], set;
  set = {
    headers: {},
    status: set?.status ?? 200
  };
  for (const [key, value] of response.headers.entries())
    key !== "content-encoding" && key in set.headers && (set.headers[key] = value);
  return set;
}, allowRapidStream = env.ELYSIA_RAPID_STREAM === "true", createStreamHandler = ({ mapResponse, mapCompactResponse }) => async (generator, set, request, skipFormat) => {
  let init = generator.next?.();
  if (set && handleSet(set), init instanceof Promise && (init = await init), init?.value instanceof ReadableStream)
    generator = init.value;
  else if (init && (typeof init?.done > "u" || init?.done))
    return set ? mapResponse(init.value, set, request) : mapCompactResponse(init.value, request);
  const isSSE = !skipFormat && // @ts-ignore First SSE result is wrapped with sse()
  (init?.value?.sse ?? // @ts-ignore ReadableStream is wrapped with sse()
  generator?.sse ?? // User explicitly set content-type to SSE
  set?.headers["content-type"]?.startsWith("text/event-stream")), format = isSSE ? (data) => `data: ${data}

` : (data) => data, contentType = isSSE ? "text/event-stream" : init?.value && typeof init?.value == "object" ? "application/json" : "text/plain";
  set?.headers ? (set.headers["transfer-encoding"] || (set.headers["transfer-encoding"] = "chunked"), set.headers["content-type"] || (set.headers["content-type"] = contentType), set.headers["cache-control"] || (set.headers["cache-control"] = "no-cache")) : set = {
    status: 200,
    headers: {
      "content-type": contentType,
      "transfer-encoding": "chunked",
      "cache-control": "no-cache",
      connection: "keep-alive"
    }
  };
  const isBrowser = request?.headers.has("Origin");
  return new Response(
    new ReadableStream({
      async start(controller) {
        let end = false;
        if (request?.signal?.addEventListener("abort", () => {
          end = true;
          try {
            controller.close();
          } catch {
          }
        }), !(!init || init.value instanceof ReadableStream)) {
          if (init.value !== void 0 && init.value !== null)
            if (init.value.toSSE)
              controller.enqueue(init.value.toSSE());
            else if (typeof init.value == "object")
              try {
                controller.enqueue(
                  format(JSON.stringify(init.value))
                );
              } catch {
                controller.enqueue(
                  format(init.value.toString())
                );
              }
            else controller.enqueue(format(init.value.toString()));
        }
        try {
          for await (const chunk of generator) {
            if (end) break;
            if (chunk != null)
              if (chunk.toSSE)
                controller.enqueue(chunk.toSSE());
              else {
                if (typeof chunk == "object")
                  try {
                    controller.enqueue(
                      format(JSON.stringify(chunk))
                    );
                  } catch {
                    controller.enqueue(
                      format(chunk.toString())
                    );
                  }
                else
                  controller.enqueue(format(chunk.toString()));
                !allowRapidStream && isBrowser && !isSSE && await new Promise(
                  (resolve) => setTimeout(() => resolve(), 0)
                );
              }
          }
        } catch (error) {
          console.warn(error);
        }
        try {
          controller.close();
        } catch {
        }
      }
    }),
    set
  );
};
async function* streamResponse(response) {
  const body = response.body;
  if (!body) return;
  const reader = body.getReader(), decoder = new TextDecoder();
  try {
    for (; ; ) {
      const { done, value } = await reader.read();
      if (done) break;
      typeof value == "string" ? yield value : yield decoder.decode(value);
    }
  } finally {
    reader.releaseLock();
  }
}
const handleSet = (set) => {
  if (typeof set.status == "string" && (set.status = StatusMap[set.status]), set.cookie && isNotEmpty(set.cookie)) {
    const cookie = serializeCookie(set.cookie);
    cookie && (set.headers["set-cookie"] = cookie);
  }
  set.headers["set-cookie"] && Array.isArray(set.headers["set-cookie"]) && (set.headers = parseSetCookies(
    new Headers(set.headers),
    set.headers["set-cookie"]
  ));
}, createResponseHandler = (handler) => {
  const handleStream = createStreamHandler(handler);
  return (response, set, request) => {
    let isCookieSet = false;
    if (set.headers instanceof Headers)
      for (const key of set.headers.keys())
        if (key === "set-cookie") {
          if (isCookieSet) continue;
          isCookieSet = true;
          for (const cookie of set.headers.getSetCookie())
            response.headers.append("set-cookie", cookie);
        } else response.headers.has(key) || response.headers.set(key, set.headers?.get(key) ?? "");
    else
      for (const key in set.headers)
        key === "set-cookie" ? response.headers.append(
          key,
          set.headers[key]
        ) : response.headers.has(key) || response.headers.set(
          key,
          set.headers[key]
        );
    const status = set.status ?? 200;
    if (response.status !== status && status !== 200 && (response.status <= 300 || response.status > 400)) {
      const newResponse = new Response(response.body, {
        headers: response.headers,
        status: set.status
      });
      return !newResponse.headers.has("content-length") && newResponse.headers.get("transfer-encoding") === "chunked" ? handleStream(
        streamResponse(newResponse),
        responseToSetHeaders(newResponse, set),
        request,
        true
        // skipFormat: don't auto-format SSE for pre-formatted Response
      ) : newResponse;
    }
    return !response.headers.has("content-length") && response.headers.get("transfer-encoding") === "chunked" ? handleStream(
      streamResponse(response),
      responseToSetHeaders(response, set),
      request,
      true
      // skipFormat: don't auto-format SSE for pre-formatted Response
    ) : response;
  };
};
async function tee(source, branches = 2) {
  const buffer = [];
  let done = false, waiting = [];
  (async () => {
    for await (const value of source)
      buffer.push(value), waiting.forEach((w) => w.resolve()), waiting = [];
    done = true, waiting.forEach((w) => w.resolve());
  })();
  async function* makeIterator() {
    let i = 0;
    for (; ; )
      if (i < buffer.length)
        yield buffer[i++];
      else {
        if (done)
          return;
        await new Promise((resolve) => waiting.push({ resolve }));
      }
  }
  return Array.from({ length: branches }, makeIterator);
}

const handleElysiaFile = (file, set = {
  headers: {}
}) => {
  const path = file.path, contentType = mime[path.slice(path.lastIndexOf(".") + 1)];
  return contentType && (set.headers["content-type"] = contentType), file.stats && set.status !== 206 && set.status !== 304 && set.status !== 412 && set.status !== 416 ? file.stats.then((stat) => {
    const size = stat.size;
    return size !== void 0 && (set.headers["content-range"] = `bytes 0-${size - 1}/${size}`, set.headers["content-length"] = size), handleFile(file.value, set);
  }) : handleFile(file.value, set);
}, mapResponse$1 = (response, set, request) => {
  if (isNotEmpty(set.headers) || set.status !== 200 || set.cookie)
    switch (handleSet(set), response?.constructor?.name) {
      case "String":
        return set.headers["content-type"] = "text/plain", new Response(response, set);
      case "Array":
      case "Object":
        return set.headers["content-type"] = "application/json", new Response(JSON.stringify(response), set);
      case "ElysiaFile":
        return handleElysiaFile(response, set);
      case "File":
        return handleFile(response, set);
      case "Blob":
        return handleFile(response, set);
      case "ElysiaCustomStatusResponse":
        return set.status = response.code, mapResponse$1(
          response.response,
          set,
          request
        );
      case void 0:
        return response ? new Response(JSON.stringify(response), set) : new Response("", set);
      case "Response":
        return handleResponse$1(response, set, request);
      case "Error":
        return errorToResponse$1(response, set);
      case "Promise":
        return response.then(
          (x) => mapResponse$1(x, set, request)
        );
      case "Function":
        return mapResponse$1(response(), set, request);
      case "Number":
      case "Boolean":
        return new Response(
          response.toString(),
          set
        );
      case "Cookie":
        return response instanceof Cookie ? new Response(response.value, set) : new Response(response?.toString(), set);
      case "FormData":
        return new Response(response, set);
      default:
        if (response instanceof Response)
          return handleResponse$1(response, set, request);
        if (response instanceof Promise)
          return response.then((x) => mapResponse$1(x, set));
        if (response instanceof Error)
          return errorToResponse$1(response, set);
        if (response instanceof ElysiaCustomStatusResponse)
          return set.status = response.code, mapResponse$1(
            response.response,
            set,
            request
          );
        if (
          // @ts-expect-error
          typeof response?.next == "function" || response instanceof ReadableStream
        )
          return handleStream$1(response, set, request);
        if (typeof response?.then == "function")
          return response.then(
            (x) => mapResponse$1(x, set)
          );
        if (typeof response?.toResponse == "function")
          return mapResponse$1(response.toResponse(), set);
        if ("charCodeAt" in response) {
          const code = response.charCodeAt(0);
          if (code === 123 || code === 91)
            return set.headers["Content-Type"] || (set.headers["Content-Type"] = "application/json"), new Response(
              JSON.stringify(response),
              set
            );
        }
        return new Response(response, set);
    }
  return (
    // @ts-expect-error
    typeof response?.next == "function" || response instanceof ReadableStream ? handleStream$1(response, set, request) : mapCompactResponse$1(response, request)
  );
}, mapEarlyResponse$1 = (response, set, request) => {
  if (response != null)
    if (isNotEmpty(set.headers) || set.status !== 200 || set.cookie)
      switch (handleSet(set), response?.constructor?.name) {
        case "String":
          return set.headers["content-type"] = "text/plain", new Response(response, set);
        case "Array":
        case "Object":
          return set.headers["content-type"] = "application/json", new Response(JSON.stringify(response), set);
        case "ElysiaFile":
          return handleElysiaFile(response, set);
        case "File":
          return handleFile(response, set);
        case "Blob":
          return handleFile(response, set);
        case "ElysiaCustomStatusResponse":
          return set.status = response.code, mapEarlyResponse$1(
            response.response,
            set,
            request
          );
        case void 0:
          return response ? new Response(JSON.stringify(response), set) : void 0;
        case "Response":
          return handleResponse$1(response, set, request);
        case "Promise":
          return response.then(
            (x) => mapEarlyResponse$1(x, set)
          );
        case "Error":
          return errorToResponse$1(response, set);
        case "Function":
          return mapEarlyResponse$1(response(), set);
        case "Number":
        case "Boolean":
          return new Response(
            response.toString(),
            set
          );
        case "FormData":
          return new Response(response);
        case "Cookie":
          return response instanceof Cookie ? new Response(response.value, set) : new Response(response?.toString(), set);
        default:
          if (response instanceof Response)
            return handleResponse$1(response, set, request);
          if (response instanceof Promise)
            return response.then((x) => mapEarlyResponse$1(x, set));
          if (response instanceof Error)
            return errorToResponse$1(response, set);
          if (response instanceof ElysiaCustomStatusResponse)
            return set.status = response.code, mapEarlyResponse$1(
              response.response,
              set,
              request
            );
          if (
            // @ts-expect-error
            typeof response?.next == "function" || response instanceof ReadableStream
          )
            return handleStream$1(response, set, request);
          if (typeof response?.then == "function")
            return response.then(
              (x) => mapEarlyResponse$1(x, set)
            );
          if (typeof response?.toResponse == "function")
            return mapEarlyResponse$1(response.toResponse(), set);
          if ("charCodeAt" in response) {
            const code = response.charCodeAt(0);
            if (code === 123 || code === 91)
              return set.headers["Content-Type"] || (set.headers["Content-Type"] = "application/json"), new Response(
                JSON.stringify(response),
                set
              );
          }
          return new Response(response, set);
      }
    else
      switch (response?.constructor?.name) {
        case "String":
          return set.headers["content-type"] = "text/plain", new Response(response);
        case "Array":
        case "Object":
          return set.headers["content-type"] = "application/json", new Response(JSON.stringify(response), set);
        case "ElysiaFile":
          return handleElysiaFile(response, set);
        case "File":
          return handleFile(response, set);
        case "Blob":
          return handleFile(response, set);
        case "ElysiaCustomStatusResponse":
          return set.status = response.code, mapEarlyResponse$1(
            response.response,
            set,
            request
          );
        case void 0:
          return response ? new Response(JSON.stringify(response), {
            headers: {
              "content-type": "application/json"
            }
          }) : new Response("");
        case "Response":
          return response;
        case "Promise":
          return response.then((x) => {
            const r = mapEarlyResponse$1(x, set);
            if (r !== void 0) return r;
          });
        case "Error":
          return errorToResponse$1(response, set);
        case "Function":
          return mapCompactResponse$1(response(), request);
        case "Number":
        case "Boolean":
          return new Response(response.toString());
        case "Cookie":
          return response instanceof Cookie ? new Response(response.value, set) : new Response(response?.toString(), set);
        case "FormData":
          return new Response(response);
        default:
          if (response instanceof Response) return response;
          if (response instanceof Promise)
            return response.then((x) => mapEarlyResponse$1(x, set));
          if (response instanceof Error)
            return errorToResponse$1(response, set);
          if (response instanceof ElysiaCustomStatusResponse)
            return set.status = response.code, mapEarlyResponse$1(
              response.response,
              set,
              request
            );
          if (
            // @ts-expect-error
            typeof response?.next == "function" || response instanceof ReadableStream
          )
            return handleStream$1(response, set, request);
          if (typeof response?.then == "function")
            return response.then(
              (x) => mapEarlyResponse$1(x, set)
            );
          if (typeof response?.toResponse == "function")
            return mapEarlyResponse$1(response.toResponse(), set);
          if ("charCodeAt" in response) {
            const code = response.charCodeAt(0);
            if (code === 123 || code === 91)
              return set.headers["Content-Type"] || (set.headers["Content-Type"] = "application/json"), new Response(
                JSON.stringify(response),
                set
              );
          }
          return new Response(response);
      }
}, mapCompactResponse$1 = (response, request) => {
  switch (response?.constructor?.name) {
    case "String":
      return new Response(response, {
        headers: {
          "Content-Type": "text/plain"
        }
      });
    case "Object":
    case "Array":
      return new Response(JSON.stringify(response), {
        headers: {
          "Content-Type": "application/json"
        }
      });
    case "ElysiaFile":
      return handleElysiaFile(response);
    case "File":
      return handleFile(response);
    case "Blob":
      return handleFile(response);
    case "ElysiaCustomStatusResponse":
      return mapResponse$1(
        response.response,
        {
          status: response.code,
          headers: {}
        }
      );
    case void 0:
      return response ? new Response(JSON.stringify(response), {
        headers: {
          "content-type": "application/json"
        }
      }) : new Response("");
    case "Response":
      return response;
    case "Error":
      return errorToResponse$1(response);
    case "Promise":
      return response.then(
        (x) => mapCompactResponse$1(x, request)
      );
    // ? Maybe response or Blob
    case "Function":
      return mapCompactResponse$1(response(), request);
    case "Number":
    case "Boolean":
      return new Response(response.toString());
    case "FormData":
      return new Response(response);
    default:
      if (response instanceof Response) return response;
      if (response instanceof Promise)
        return response.then(
          (x) => mapCompactResponse$1(x, request)
        );
      if (response instanceof Error)
        return errorToResponse$1(response);
      if (response instanceof ElysiaCustomStatusResponse)
        return mapResponse$1(
          response.response,
          {
            status: response.code,
            headers: {}
          }
        );
      if (
        // @ts-expect-error
        typeof response?.next == "function" || response instanceof ReadableStream
      )
        return handleStream$1(response, void 0, request);
      if (typeof response?.then == "function")
        return response.then(
          (x) => mapCompactResponse$1(x, request)
        );
      if (typeof response?.toResponse == "function")
        return mapCompactResponse$1(response.toResponse());
      if ("charCodeAt" in response) {
        const code = response.charCodeAt(0);
        if (code === 123 || code === 91)
          return new Response(JSON.stringify(response), {
            headers: {
              "Content-Type": "application/json"
            }
          });
      }
      return new Response(response);
  }
}, errorToResponse$1 = (error, set) => {
  if (typeof error?.toResponse == "function") {
    const raw = error.toResponse(), targetSet = set ?? { headers: {}, status: 200, redirect: "" }, apply = (resolved) => (resolved instanceof Response && (targetSet.status = resolved.status), mapResponse$1(resolved, targetSet));
    return typeof raw?.then == "function" ? raw.then(apply) : apply(raw);
  }
  return new Response(
    JSON.stringify({
      name: error?.name,
      message: error?.message,
      cause: error?.cause
    }),
    {
      status: set?.status !== 200 ? set?.status ?? 500 : 500,
      headers: set?.headers
    }
  );
}, createStaticHandler$1 = (handle, hooks, setHeaders = {}) => {
  if (typeof handle == "function") return;
  const response = mapResponse$1(handle, {
    headers: setHeaders
  });
  if (!hooks.parse?.length && !hooks.transform?.length && !hooks.beforeHandle?.length && !hooks.afterHandle?.length)
    return () => response.clone();
}, handleResponse$1 = createResponseHandler({
  mapResponse: mapResponse$1,
  mapCompactResponse: mapCompactResponse$1
}), handleStream$1 = createStreamHandler({
  mapResponse: mapResponse$1,
  mapCompactResponse: mapCompactResponse$1
});

const WebStandardAdapter = {
  name: "web-standard",
  isWebStandard: true,
  handler: {
    mapResponse: mapResponse$1,
    mapEarlyResponse: mapEarlyResponse$1,
    mapCompactResponse: mapCompactResponse$1,
    createStaticHandler: createStaticHandler$1
  },
  composeHandler: {
    mapResponseContext: "c.request",
    preferWebstandardHeaders: true,
    // @ts-ignore Bun specific
    headers: `c.headers={}
for(const [k,v] of c.request.headers.entries())c.headers[k]=v
`,
    parser: {
      json(isOptional) {
        return isOptional ? `try{c.body=await c.request.json()}catch{}
` : `c.body=await c.request.json()
`;
      },
      text() {
        return `c.body=await c.request.text()
`;
      },
      urlencoded() {
        return `c.body=parseQuery(await c.request.text())
`;
      },
      arrayBuffer() {
        return `c.body=await c.request.arrayBuffer()
`;
      },
      formData(isOptional) {
        let fnLiteral = `
c.body={}
`;
        return isOptional ? fnLiteral += "let form;try{form=await c.request.formData()}catch{}" : fnLiteral += `const form=await c.request.formData()
`, fnLiteral + `for(const key of form.keys()){if(c.body[key]) continue
const value=form.getAll(key)
if(value.length===1)c.body[key]=value[0]
else c.body[key]=value}`;
      }
    }
  },
  async stop(app, closeActiveConnections) {
    if (!app.server)
      throw new Error(
        "Elysia isn't running. Call `app.listen` to start the server."
      );
    if (app.server && (await app.server.stop(closeActiveConnections), app.server = null, app.event.stop?.length))
      for (let i = 0; i < app.event.stop.length; i++)
        app.event.stop[i].fn(app);
  },
  composeGeneralHandler: {
    parameters: "r",
    createContext(app) {
      let decoratorsLiteral = "", fnLiteral = "";
      const defaultHeaders = app.setHeaders;
      for (const key of Object.keys(app.decorator))
        decoratorsLiteral += `,'${key}':decorator['${key}']`;
      const standardHostname = app.config.handler?.standardHostname ?? true, hasTrace = !!app.event.trace?.length;
      return fnLiteral += `const u=r.url,s=u.indexOf('/',${standardHostname ? 11 : 7}),qi=u.indexOf('?',s+1),p=u.substring(s,qi===-1?undefined:qi)
`, hasTrace && (fnLiteral += `const id=randomId()
`), fnLiteral += "const c={request:r,store,qi,path:p,url:u,redirect,status,set:{headers:", fnLiteral += Object.keys(defaultHeaders ?? {}).length ? "Object.assign({},app.setHeaders)" : "Object.create(null)", fnLiteral += ",status:200}", app.inference.server && (fnLiteral += ",get server(){return app.getServer()}"), hasTrace && (fnLiteral += ",[ELYSIA_REQUEST_ID]:id"), fnLiteral += decoratorsLiteral, fnLiteral += `}
`, fnLiteral;
    },
    error404(hasEventHook, hasErrorHook, afterHandle = "") {
      let findDynamicRoute = "if(route===null){" + afterHandle + (hasErrorHook ? "" : "c.set.status=404") + `
return `;
      return hasErrorHook ? findDynamicRoute += `app.handleError(c,notFound,false,${this.parameters})` : findDynamicRoute += hasEventHook ? "c.response=c.responseValue=new Response(error404Message,{status:c.set.status===200?404:c.set.status,headers:c.set.headers})" : "c.response=c.responseValue=error404.clone()", findDynamicRoute += "}", {
        declare: hasErrorHook ? "" : `const error404Message=notFound.message.toString()
const error404=new Response(error404Message,{status:404})
`,
        code: findDynamicRoute
      };
    }
  },
  composeError: {
    mapResponseContext: "",
    validationError: "set.headers['content-type']='application/json';return mapResponse(error.message,set)",
    unknownError: "set.status=error.status??set.status??500;return mapResponse(error.message,set)"
  },
  listen() {
    return () => {
      throw new Error(
        "WebStandard does not support listen, you might want to export default Elysia.fetch instead"
      );
    };
  }
};

const KEY_HAS_PLUS = 1, KEY_NEEDS_DECODE = 2, VALUE_HAS_PLUS = 4, VALUE_NEEDS_DECODE = 8;
function parseQueryFromURL(input, startIndex = 0, array, object) {
  const result = /* @__PURE__ */ Object.create(null);
  let flags = 0;
  const inputLength = input.length;
  let startingIndex = startIndex - 1, equalityIndex = startingIndex;
  for (let i = 0; i < inputLength; i++)
    switch (input.charCodeAt(i)) {
      // '&'
      case 38:
        processKeyValuePair(input, i), startingIndex = i, equalityIndex = i, flags = 0;
        break;
      // '='
      case 61:
        equalityIndex <= startingIndex ? equalityIndex = i : flags |= VALUE_NEEDS_DECODE;
        break;
      // '+'
      case 43:
        equalityIndex > startingIndex ? flags |= VALUE_HAS_PLUS : flags |= KEY_HAS_PLUS;
        break;
      // '%'
      case 37:
        equalityIndex > startingIndex ? flags |= VALUE_NEEDS_DECODE : flags |= KEY_NEEDS_DECODE;
        break;
    }
  return startingIndex < inputLength && processKeyValuePair(input, inputLength), result;
  function processKeyValuePair(input2, endIndex) {
    const hasBothKeyValuePair = equalityIndex > startingIndex, effectiveEqualityIndex = hasBothKeyValuePair ? equalityIndex : endIndex, keySlice = input2.slice(startingIndex + 1, effectiveEqualityIndex);
    if (!hasBothKeyValuePair && keySlice.length === 0) return;
    let finalKey = keySlice;
    flags & KEY_HAS_PLUS && (finalKey = finalKey.replace(/\+/g, " ")), flags & KEY_NEEDS_DECODE && (finalKey = fastDecodeURIComponent(finalKey) || finalKey);
    let finalValue = "";
    if (hasBothKeyValuePair) {
      let valueSlice = input2.slice(equalityIndex + 1, endIndex);
      flags & VALUE_HAS_PLUS && (valueSlice = valueSlice.replace(/\+/g, " ")), flags & VALUE_NEEDS_DECODE && (valueSlice = fastDecodeURIComponent(valueSlice) || valueSlice), finalValue = valueSlice;
    }
    const currentValue = result[finalKey];
    array && array?.[finalKey] ? finalValue.charCodeAt(0) === 91 ? (object && object?.[finalKey] ? finalValue = JSON.parse(finalValue) : finalValue = finalValue.slice(1, -1).split(","), currentValue === void 0 ? result[finalKey] = finalValue : Array.isArray(currentValue) ? currentValue.push(...finalValue) : (result[finalKey] = finalValue, result[finalKey].unshift(currentValue))) : currentValue === void 0 ? result[finalKey] = finalValue : Array.isArray(currentValue) ? currentValue.push(finalValue) : result[finalKey] = [currentValue, finalValue] : result[finalKey] = finalValue;
  }
}
function parseQueryStandardSchema(input, startIndex = 0) {
  const result = /* @__PURE__ */ Object.create(null);
  let flags = 0;
  const inputLength = input.length;
  let startingIndex = startIndex - 1, equalityIndex = startingIndex;
  for (let i = 0; i < inputLength; i++)
    switch (input.charCodeAt(i)) {
      // '&'
      case 38:
        processKeyValuePair(input, i), startingIndex = i, equalityIndex = i, flags = 0;
        break;
      // '='
      case 61:
        equalityIndex <= startingIndex ? equalityIndex = i : flags |= VALUE_NEEDS_DECODE;
        break;
      // '+'
      case 43:
        equalityIndex > startingIndex ? flags |= VALUE_HAS_PLUS : flags |= KEY_HAS_PLUS;
        break;
      // '%'
      case 37:
        equalityIndex > startingIndex ? flags |= VALUE_NEEDS_DECODE : flags |= KEY_NEEDS_DECODE;
        break;
    }
  return startingIndex < inputLength && processKeyValuePair(input, inputLength), result;
  function processKeyValuePair(input2, endIndex) {
    const hasBothKeyValuePair = equalityIndex > startingIndex, effectiveEqualityIndex = hasBothKeyValuePair ? equalityIndex : endIndex, keySlice = input2.slice(startingIndex + 1, effectiveEqualityIndex);
    if (!hasBothKeyValuePair && keySlice.length === 0) return;
    let finalKey = keySlice;
    flags & KEY_HAS_PLUS && (finalKey = finalKey.replace(/\+/g, " ")), flags & KEY_NEEDS_DECODE && (finalKey = fastDecodeURIComponent(finalKey) || finalKey);
    let finalValue = "";
    if (hasBothKeyValuePair) {
      let valueSlice = input2.slice(equalityIndex + 1, endIndex);
      flags & VALUE_HAS_PLUS && (valueSlice = valueSlice.replace(/\+/g, " ")), flags & VALUE_NEEDS_DECODE && (valueSlice = fastDecodeURIComponent(valueSlice) || valueSlice), finalValue = valueSlice;
    }
    const currentValue = result[finalKey];
    if (finalValue.charCodeAt(0) === 91 && finalValue.charCodeAt(finalValue.length - 1) === 93) {
      try {
        finalValue = JSON.parse(finalValue);
      } catch {
      }
      currentValue === void 0 ? result[finalKey] = finalValue : Array.isArray(currentValue) ? currentValue.push(finalValue) : result[finalKey] = [currentValue, finalValue];
    } else if (finalValue.charCodeAt(0) === 123 && finalValue.charCodeAt(finalValue.length - 1) === 125) {
      try {
        finalValue = JSON.parse(finalValue);
      } catch {
      }
      currentValue === void 0 ? result[finalKey] = finalValue : Array.isArray(currentValue) ? currentValue.push(finalValue) : result[finalKey] = [currentValue, finalValue];
    } else
      finalValue.includes(",") && (finalValue = finalValue.split(",")), currentValue === void 0 ? result[finalKey] = finalValue : Array.isArray(currentValue) ? currentValue.push(finalValue) : result[finalKey] = [currentValue, finalValue];
  }
}
function parseQuery(input) {
  const result = /* @__PURE__ */ Object.create(null);
  let flags = 0;
  const inputLength = input.length;
  let startingIndex = -1, equalityIndex = -1;
  for (let i = 0; i < inputLength; i++)
    switch (input.charCodeAt(i)) {
      // '&'
      case 38:
        processKeyValuePair(input, i), startingIndex = i, equalityIndex = i, flags = 0;
        break;
      // '='
      case 61:
        equalityIndex <= startingIndex ? equalityIndex = i : flags |= VALUE_NEEDS_DECODE;
        break;
      // '+'
      case 43:
        equalityIndex > startingIndex ? flags |= VALUE_HAS_PLUS : flags |= KEY_HAS_PLUS;
        break;
      // '%'
      case 37:
        equalityIndex > startingIndex ? flags |= VALUE_NEEDS_DECODE : flags |= KEY_NEEDS_DECODE;
        break;
    }
  return startingIndex < inputLength && processKeyValuePair(input, inputLength), result;
  function processKeyValuePair(input2, endIndex) {
    const hasBothKeyValuePair = equalityIndex > startingIndex, effectiveEqualityIndex = hasBothKeyValuePair ? equalityIndex : endIndex, keySlice = input2.slice(startingIndex + 1, effectiveEqualityIndex);
    if (!hasBothKeyValuePair && keySlice.length === 0) return;
    let finalKey = keySlice;
    flags & KEY_HAS_PLUS && (finalKey = finalKey.replace(/\+/g, " ")), flags & KEY_NEEDS_DECODE && (finalKey = fastDecodeURIComponent(finalKey) || finalKey);
    let finalValue = "";
    if (hasBothKeyValuePair) {
      let valueSlice = input2.slice(equalityIndex + 1, endIndex);
      flags & VALUE_HAS_PLUS && (valueSlice = valueSlice.replace(/\+/g, " ")), flags & VALUE_NEEDS_DECODE && (valueSlice = fastDecodeURIComponent(valueSlice) || valueSlice), finalValue = valueSlice;
    }
    const currentValue = result[finalKey];
    currentValue === void 0 ? result[finalKey] = finalValue : Array.isArray(currentValue) ? currentValue.push(finalValue) : result[finalKey] = [currentValue, finalValue];
  }
}

const ELYSIA_TRACE = Symbol("ElysiaTrace"), createProcess = () => {
  const { promise, resolve } = Promise.withResolvers(), { promise: end, resolve: resolveEnd } = Promise.withResolvers(), { promise: error, resolve: resolveError } = Promise.withResolvers(), callbacks = [], callbacksEnd = [];
  return [
    (callback) => (callback && callbacks.push(callback), promise),
    (process) => {
      const processes = [], resolvers = [];
      let groupError = null;
      for (let i = 0; i < (process.total ?? 0); i++) {
        const { promise: promise2, resolve: resolve2 } = Promise.withResolvers(), { promise: end2, resolve: resolveEnd2 } = Promise.withResolvers(), { promise: error2, resolve: resolveError2 } = Promise.withResolvers(), callbacks2 = [], callbacksEnd2 = [];
        processes.push((callback) => (callback && callbacks2.push(callback), promise2)), resolvers.push((process2) => {
          const result2 = {
            ...process2,
            end: end2,
            error: error2,
            index: i,
            onStop(callback) {
              return callback && callbacksEnd2.push(callback), end2;
            }
          };
          resolve2(result2);
          for (let i2 = 0; i2 < callbacks2.length; i2++)
            callbacks2[i2](result2);
          return (error3 = null) => {
            const end3 = performance.now();
            error3 && (groupError = error3);
            const detail = {
              end: end3,
              error: error3,
              get elapsed() {
                return end3 - process2.begin;
              }
            };
            for (let i2 = 0; i2 < callbacksEnd2.length; i2++)
              callbacksEnd2[i2](detail);
            resolveEnd2(end3), resolveError2(error3);
          };
        });
      }
      const result = {
        ...process,
        end,
        error,
        onEvent(callback) {
          for (let i = 0; i < processes.length; i++)
            processes[i](callback);
        },
        onStop(callback) {
          return callback && callbacksEnd.push(callback), end;
        }
      };
      resolve(result);
      for (let i = 0; i < callbacks.length; i++) callbacks[i](result);
      return {
        resolveChild: resolvers,
        resolve(error2 = null) {
          const end2 = performance.now();
          !error2 && groupError && (error2 = groupError);
          const detail = {
            end: end2,
            error: error2,
            get elapsed() {
              return end2 - process.begin;
            }
          };
          for (let i = 0; i < callbacksEnd.length; i++)
            callbacksEnd[i](detail);
          resolveEnd(end2), resolveError(error2);
        }
      };
    }
  ];
}, createTracer = (traceListener) => (context) => {
  const [onRequest, resolveRequest] = createProcess(), [onParse, resolveParse] = createProcess(), [onTransform, resolveTransform] = createProcess(), [onBeforeHandle, resolveBeforeHandle] = createProcess(), [onHandle, resolveHandle] = createProcess(), [onAfterHandle, resolveAfterHandle] = createProcess(), [onError, resolveError] = createProcess(), [onMapResponse, resolveMapResponse] = createProcess(), [onAfterResponse, resolveAfterResponse] = createProcess();
  return traceListener({
    // @ts-ignore
    id: context[ELYSIA_REQUEST_ID],
    context,
    set: context.set,
    // @ts-ignore
    onRequest,
    // @ts-ignore
    onParse,
    // @ts-ignore
    onTransform,
    // @ts-ignore
    onBeforeHandle,
    // @ts-ignore
    onHandle,
    // @ts-ignore
    onAfterHandle,
    // @ts-ignore
    onMapResponse,
    // @ts-ignore
    onAfterResponse,
    // @ts-ignore
    onError,
    time: Date.now(),
    store: context.store
  }), {
    request: resolveRequest,
    parse: resolveParse,
    transform: resolveTransform,
    beforeHandle: resolveBeforeHandle,
    handle: resolveHandle,
    afterHandle: resolveAfterHandle,
    error: resolveError,
    mapResponse: resolveMapResponse,
    afterResponse: resolveAfterResponse
  };
};

// src/index.ts
var Kind$1 = Symbol.for("TypeBox.Kind");
var Hint$1 = Symbol.for("TypeBox.Hint");
var isSpecialProperty = (name) => /(\ |-|\t|\n|\.|\[|\]|\{|\})/.test(name) || !isNaN(+name[0]);
var joinProperty = (v1, v2, isOptional = false) => {
  if (typeof v2 === "number") return `${v1}[${v2}]`;
  if (isSpecialProperty(v2)) return `${v1}${isOptional ? "?." : ""}["${v2}"]`;
  return `${v1}${isOptional ? "?" : ""}.${v2}`;
};
var encodeProperty = (v) => isSpecialProperty(v) ? `"${v}"` : v;
var sanitize = (key, sanitize2 = 0, schema) => {
  if (schema.type !== "string" || schema.const || schema.trusted) return key;
  let hof = "";
  for (let i = sanitize2 - 1; i >= 0; i--) hof += `d.h${i}(`;
  return hof + key + ")".repeat(sanitize2);
};
var mergeObjectIntersection = (schema) => {
  if (!schema.allOf || Kind$1 in schema && (schema[Kind$1] !== "Intersect" || schema.type !== "object"))
    return schema;
  const { allOf, ...newSchema } = schema;
  newSchema.properties = {};
  if (Kind$1 in newSchema) newSchema[Kind$1] = "Object";
  for (const type of allOf) {
    if (type.type !== "object") continue;
    const { properties, required, type: _, [Kind$1]: __, ...rest } = type;
    if (required)
      newSchema.required = newSchema.required ? newSchema.required.concat(required) : required;
    Object.assign(newSchema, rest);
    for (const property in type.properties)
      newSchema.properties[property] = mergeObjectIntersection(
        type.properties[property]
      );
  }
  return newSchema;
};
var handleRecord = (schema, property, instruction) => {
  const child = schema.patternProperties["^(.*)$"] ?? schema.patternProperties[Object.keys(schema.patternProperties)[0]];
  if (!child) return property;
  const i = instruction.array;
  instruction.array++;
  let v = `(()=>{const ar${i}s=Object.keys(${property}),ar${i}v={};for(let i=0;i<ar${i}s.length;i++){const ar${i}p=${property}[ar${i}s[i]];ar${i}v[ar${i}s[i]]=${mirror(child, `ar${i}p`, instruction)}`;
  const optionals = instruction.optionalsInArray[i + 1];
  if (optionals) {
    for (let oi = 0; oi < optionals.length; oi++) {
      const target = `ar${i}v[ar${i}s[i]]${optionals[oi]}`;
      v += `;if(${target}===undefined)delete ${target}`;
    }
    instruction.optionalsInArray[i + 1] = [];
  }
  v += `}return ar${i}v})()`;
  return v;
};
var handleTuple = (schema, property, instruction) => {
  const i = instruction.array;
  instruction.array++;
  const isRoot = property === "v" && !instruction.unions.length;
  let v = "";
  if (!isRoot) v = `(()=>{`;
  v += `const ar${i}v=[`;
  for (let i2 = 0; i2 < schema.length; i2++) {
    if (i2 !== 0) v += ",";
    v += mirror(
      schema[i2],
      joinProperty(property, i2, instruction.parentIsOptional),
      instruction
    );
  }
  v += `];`;
  if (!isRoot) v += `return ar${i}v})()`;
  return v;
};
function deepClone(source, weak = /* @__PURE__ */ new WeakMap()) {
  if (source === null || typeof source !== "object" || typeof source === "function")
    return source;
  if (weak.has(source)) return weak.get(source);
  if (Array.isArray(source)) {
    const copy = new Array(source.length);
    weak.set(source, copy);
    for (let i = 0; i < source.length; i++)
      copy[i] = deepClone(source[i], weak);
    return copy;
  }
  if (typeof source === "object") {
    const keys = Object.keys(source).concat(
      Object.getOwnPropertySymbols(source)
    );
    const cloned = {};
    for (const key of keys)
      cloned[key] = deepClone(source[key], weak);
    return cloned;
  }
  return source;
}
var handleUnion = (schemas, property, instruction) => {
  if (instruction.TypeCompiler === void 0) {
    if (!instruction.typeCompilerWanred) {
      console.warn(
        new Error(
          "[exact-mirror] TypeBox's TypeCompiler is required to use Union"
        )
      );
      instruction.typeCompilerWanred = true;
    }
    return property;
  }
  instruction.unionKeys[property] = 1;
  const ui = instruction.unions.length;
  const typeChecks = instruction.unions[ui] = [];
  let v = `(()=>{
`;
  const unwrapRef = (type) => {
    if (!(Kind$1 in type) || !type.$ref) return type;
    if (type[Kind$1] === "This") {
      return deepClone(instruction.definitions[type.$ref]);
    } else if (type[Kind$1] === "Ref") {
      if (!instruction.modules)
        console.warn(
          new Error(
            "[exact-mirror] modules is required when using nested cyclic reference"
          )
        );
      else
        return instruction.modules.Import(
          type.$ref
        );
    }
    return type;
  };
  let cleanThenCheck = "";
  for (let i = 0; i < schemas.length; i++) {
    let type = unwrapRef(schemas[i]);
    if (Array.isArray(type.anyOf))
      for (let i2 = 0; i2 < type.anyOf.length; i2++)
        type.anyOf[i2] = unwrapRef(type.anyOf[i2]);
    else if (type.items) {
      if (Array.isArray(type.items))
        for (let i2 = 0; i2 < type.items.length; i2++)
          type.items[i2] = unwrapRef(type.items[i2]);
      else type.items = unwrapRef(type.items);
    }
    typeChecks.push(TypeCompiler.Compile(type));
    v += `if(d.unions[${ui}][${i}].Check(${property})){return ${mirror(
      type,
      property,
      {
        ...instruction,
        recursion: instruction.recursion + 1,
        parentIsOptional: true
      }
    )}}
`;
    cleanThenCheck += (i ? "" : "let ") + "tmp=" + mirror(type, property, {
      ...instruction,
      recursion: instruction.recursion + 1,
      parentIsOptional: true
    }) + `
if(d.unions[${ui}][${i}].Check(tmp))return tmp
`;
  }
  if (cleanThenCheck) v += cleanThenCheck;
  v += `return ${instruction.removeUnknownUnionType ? "undefined" : property}`;
  return v + `})()`;
};
var mirror = (schema, property, instruction) => {
  if (!schema) return "";
  const isRoot = property === "v" && !instruction.unions.length;
  if (Kind$1 in schema && schema[Kind$1] === "Import" && schema.$ref in schema.$defs)
    return mirror(schema.$defs[schema.$ref], property, {
      ...instruction,
      definitions: Object.assign(instruction.definitions, schema.$defs)
    });
  if (isRoot && schema.type !== "object" && schema.type !== "array" && !schema.anyOf)
    return `return ${sanitize("v", instruction.sanitize?.length, schema)}`;
  if (instruction.recursion >= instruction.recursionLimit) return property;
  let v = "";
  if (schema.$id && Hint$1 in schema)
    instruction.definitions[schema.$id] = schema;
  switch (schema.type) {
    case "object":
      if (schema[Kind$1] === "Record") {
        v = handleRecord(schema, property, instruction);
        break;
      }
      schema = mergeObjectIntersection(schema);
      v += "{";
      if (schema.additionalProperties) v += `...${property},`;
      const keys = Object.keys(schema.properties);
      for (let i2 = 0; i2 < keys.length; i2++) {
        const key = keys[i2];
        let isOptional = (
          // all fields are optional
          !schema.required || // field is explicitly required
          schema.required && !schema.required.includes(key) || Array.isArray(schema.properties[key].anyOf)
        );
        const name = joinProperty(
          property,
          key,
          instruction.parentIsOptional
        );
        if (isOptional) {
          const index = instruction.array;
          if (property.startsWith("ar")) {
            const dotIndex = name.indexOf(".");
            let refName;
            if (dotIndex >= 0) {
              refName = name.slice(dotIndex);
            } else {
              refName = name.slice(property.length);
            }
            if (refName.startsWith("?.")) {
              if (refName.charAt(2) === "[") {
                refName = refName.slice(2);
              } else {
                refName = refName.slice(1);
              }
            }
            const array = instruction.optionalsInArray;
            if (array[index]) {
              array[index].push(refName);
            } else {
              array[index] = [refName];
            }
          } else {
            instruction.optionals.push(name);
          }
        }
        const child = schema.properties[key];
        if (i2 !== 0) v += ",";
        v += `${encodeProperty(key)}:${isOptional ? `${name}===undefined?undefined:` : ""}${mirror(
          child,
          name,
          {
            ...instruction,
            recursion: instruction.recursion + 1,
            parentIsOptional: isOptional
          }
        )}`;
      }
      v += "}";
      break;
    case "array":
      if (schema.items.type !== "object" && schema.items.type !== "array") {
        if (Array.isArray(schema.items)) {
          v = handleTuple(schema.items, property, instruction);
          break;
        } else if (isRoot && !Array.isArray(schema.items.anyOf))
          return "return v";
        else if (Kind$1 in schema.items && schema.items.$ref && (schema.items[Kind$1] === "Ref" || schema.items[Kind$1] === "This"))
          v = mirror(
            deepClone(instruction.definitions[schema.items.$ref]),
            property,
            {
              ...instruction,
              parentIsOptional: true,
              recursion: instruction.recursion + 1
            }
          );
        else if (!Array.isArray(schema.items.anyOf)) {
          v = property;
          break;
        }
      }
      const i = instruction.array;
      instruction.array++;
      let reference = property;
      if (isRoot) v = `const ar${i}v=new Array(${property}.length);`;
      else {
        reference = `ar${i}s`;
        v = `((${reference})=>{const ar${i}v=new Array(${reference}.length);`;
      }
      v += `for(let i=0;i<${reference}.length;i++){const ar${i}p=${reference}[i];ar${i}v[i]=${mirror(schema.items, `ar${i}p`, instruction)}`;
      const optionals = instruction.optionalsInArray[i + 1];
      if (optionals) {
        for (let oi = 0; oi < optionals.length; oi++) {
          const target = `ar${i}v[i]${optionals[oi]}`;
          v += `;if(${target}===undefined)delete ${target}`;
        }
        instruction.optionalsInArray[i + 1] = [];
      }
      v += `}`;
      if (!isRoot) v += `return ar${i}v})(${property})`;
      break;
    default:
      if (schema.$ref && schema.$ref in instruction.definitions)
        return mirror(
          instruction.definitions[schema.$ref],
          property,
          instruction
        );
      if (Array.isArray(schema.anyOf)) {
        v = handleUnion(schema.anyOf, property, instruction);
        break;
      }
      v = sanitize(property, instruction.sanitize?.length, schema);
      break;
  }
  if (!isRoot) return v;
  if (schema.type === "array") {
    v = `${v}const x=ar0v;`;
  } else {
    v = `const x=${v}
`;
  }
  for (let i = 0; i < instruction.optionals.length; i++) {
    const key = instruction.optionals[i];
    const prop = key.slice(1);
    v += `if(${key}===undefined`;
    if (instruction.unionKeys[key]) v += `||x${prop}===undefined`;
    const shouldQuestion = prop.charCodeAt(0) !== 63 && schema.type !== "array";
    v += `)delete x${shouldQuestion ? prop.charCodeAt(0) === 91 ? "?." : "?" : ""}${prop}
`;
  }
  return `${v}return x`;
};
var createMirror = (schema, {
  TypeCompiler: TypeCompiler2,
  modules,
  definitions,
  sanitize: sanitize2,
  recursionLimit = 8,
  removeUnknownUnionType = false
} = {}) => {
  const unions = [];
  if (typeof sanitize2 === "function") sanitize2 = [sanitize2];
  const f = mirror(schema, "v", {
    optionals: [],
    optionalsInArray: [],
    array: 0,
    parentIsOptional: false,
    unions,
    unionKeys: {},
    TypeCompiler: TypeCompiler2,
    modules,
    // @ts-ignore private property
    definitions: definitions ?? modules?.$defs ?? {},
    sanitize: sanitize2,
    recursion: 0,
    recursionLimit,
    removeUnknownUnionType
  });
  if (!unions.length && !sanitize2?.length) return Function("v", f);
  let hof;
  if (sanitize2?.length) {
    hof = {};
    for (let i = 0; i < sanitize2.length; i++) hof[`h${i}`] = sanitize2[i];
  }
  return Function(
    "d",
    `return function mirror(v){${f}}`
  )({
    unions,
    ...hof
  });
};

const replaceSchemaTypeFromManyOptions = (schema, options) => {
  if (Array.isArray(options)) {
    let result = schema;
    for (const option of options)
      result = replaceSchemaTypeFromOption(result, option);
    return result;
  }
  return replaceSchemaTypeFromOption(schema, options);
}, replaceSchemaTypeFromOption = (schema, option) => {
  if (option.rootOnly && option.excludeRoot)
    throw new Error("Can't set both rootOnly and excludeRoot");
  if (option.rootOnly && option.onlyFirst)
    throw new Error("Can't set both rootOnly and onlyFirst");
  if (option.rootOnly && option.untilObjectFound)
    throw new Error("Can't set both rootOnly and untilObjectFound");
  const walk = ({ s, isRoot, treeLvl }) => {
    if (!s) return s;
    const skipRoot = isRoot && option.excludeRoot, fromKind = option.from[Kind$2];
    if (s.elysiaMeta)
      return option.from.elysiaMeta === s.elysiaMeta && !skipRoot ? option.to(s) : s;
    const shouldTransform = fromKind && s[Kind$2] === fromKind;
    if (!skipRoot && option.onlyFirst && s.type === option.onlyFirst || isRoot && option.rootOnly)
      return shouldTransform ? option.to(s) : s;
    if (!isRoot && option.untilObjectFound && s.type === "object")
      return s;
    const newWalkInput = { isRoot: false, treeLvl: treeLvl + 1 }, withTransformedChildren = { ...s };
    if (s.oneOf && (withTransformedChildren.oneOf = s.oneOf.map(
      (x) => walk({ ...newWalkInput, s: x })
    )), s.anyOf && (withTransformedChildren.anyOf = s.anyOf.map(
      (x) => walk({ ...newWalkInput, s: x })
    )), s.allOf && (withTransformedChildren.allOf = s.allOf.map(
      (x) => walk({ ...newWalkInput, s: x })
    )), s.not && (withTransformedChildren.not = walk({ ...newWalkInput, s: s.not })), s.properties) {
      withTransformedChildren.properties = {};
      for (const [k, v] of Object.entries(s.properties))
        withTransformedChildren.properties[k] = walk({
          ...newWalkInput,
          s: v
        });
    }
    if (s.items) {
      const items = s.items;
      withTransformedChildren.items = Array.isArray(items) ? items.map((x) => walk({ ...newWalkInput, s: x })) : walk({ ...newWalkInput, s: items });
    }
    return !skipRoot && fromKind && withTransformedChildren[Kind$2] === fromKind ? option.to(withTransformedChildren) : withTransformedChildren;
  };
  return walk({ s: schema, isRoot: true, treeLvl: 0 });
};
let _stringToStructureCoercions;
const stringToStructureCoercions = () => (_stringToStructureCoercions || (_stringToStructureCoercions = [
  {
    from: t.Object({}),
    to: (schema) => t.ObjectString(schema.properties || {}, schema),
    excludeRoot: true
  },
  {
    from: t.Array(t.Any()),
    to: (schema) => t.ArrayString(schema.items || t.Any(), schema)
  }
]), _stringToStructureCoercions);
let _queryCoercions;
const queryCoercions = () => (_queryCoercions || (_queryCoercions = [
  {
    from: t.Object({}),
    to: (schema) => t.ObjectString(schema.properties ?? {}, schema),
    excludeRoot: true
  },
  {
    from: t.Array(t.Any()),
    to: (schema) => t.ArrayQuery(schema.items ?? t.Any(), schema)
  }
]), _queryCoercions);
let _coercePrimitiveRoot;
const coercePrimitiveRoot = () => (_coercePrimitiveRoot || (_coercePrimitiveRoot = [
  {
    from: t.Number(),
    to: (schema) => t.Numeric(schema),
    rootOnly: true
  },
  {
    from: t.Boolean(),
    to: (schema) => t.BooleanString(schema),
    rootOnly: true
  }
]), _coercePrimitiveRoot);
let _coerceFormData;
const coerceFormData = () => (_coerceFormData || (_coerceFormData = [
  {
    from: t.Object({}),
    to: (schema) => t.ObjectString(schema.properties ?? {}, schema),
    onlyFirst: "object",
    excludeRoot: true
  },
  {
    from: t.Array(t.Any()),
    to: (schema) => t.ArrayString(schema.items ?? t.Any(), schema),
    onlyFirst: "array",
    excludeRoot: true
  }
]), _coerceFormData);

const isOptional = (schema) => schema ? schema?.[Kind$2] === "Import" && schema.References ? schema.References().some(isOptional) : (schema.schema && (schema = schema.schema), !!schema && OptionalKind$1 in schema) : false, hasAdditionalProperties = (_schema) => {
  if (!_schema) return false;
  const schema = _schema?.schema ?? _schema;
  if (schema[Kind$2] === "Import" && _schema.References)
    return _schema.References().some(hasAdditionalProperties);
  if (schema.anyOf) return schema.anyOf.some(hasAdditionalProperties);
  if (schema.someOf) return schema.someOf.some(hasAdditionalProperties);
  if (schema.allOf) return schema.allOf.some(hasAdditionalProperties);
  if (schema.not) return schema.not.some(hasAdditionalProperties);
  if (schema.type === "object") {
    const properties = schema.properties;
    if ("additionalProperties" in schema) return schema.additionalProperties;
    if ("patternProperties" in schema) return false;
    for (const key of Object.keys(properties)) {
      const property = properties[key];
      if (property.type === "object") {
        if (hasAdditionalProperties(property)) return true;
      } else if (property.anyOf) {
        for (let i = 0; i < property.anyOf.length; i++)
          if (hasAdditionalProperties(property.anyOf[i])) return true;
      }
      return property.additionalProperties;
    }
    return false;
  }
  return schema.type === "array" && schema.items && !Array.isArray(schema.items) ? hasAdditionalProperties(schema.items) : false;
}, resolveSchema = (schema, models, modules) => {
  if (schema)
    return typeof schema != "string" ? schema : modules && schema in modules.$defs ? modules.Import(schema) : models?.[schema];
}, hasType = (type, schema) => {
  if (!schema) return false;
  if (Kind$2 in schema && schema[Kind$2] === type) return true;
  if (Kind$2 in schema && schema[Kind$2] === "Import" && schema.$defs && schema.$ref) {
    const ref = schema.$ref.replace("#/$defs/", "");
    if (schema.$defs[ref])
      return hasType(type, schema.$defs[ref]);
  }
  if (schema.anyOf) return schema.anyOf.some((s) => hasType(type, s));
  if (schema.oneOf) return schema.oneOf.some((s) => hasType(type, s));
  if (schema.allOf) return schema.allOf.some((s) => hasType(type, s));
  if (schema.type === "array" && schema.items)
    return type === "Files" && Kind$2 in schema.items && schema.items[Kind$2] === "File" ? true : hasType(type, schema.items);
  if (schema.type === "object") {
    const properties = schema.properties;
    if (!properties) return false;
    for (const key of Object.keys(properties))
      if (hasType(type, properties[key])) return true;
  }
  return false;
}, hasElysiaMeta = (meta, _schema) => {
  if (!_schema) return false;
  const schema = _schema?.schema ?? _schema;
  if (schema.elysiaMeta === meta) return true;
  if (schema[Kind$2] === "Import" && _schema.References)
    return _schema.References().some((schema2) => hasElysiaMeta(meta, schema2));
  if (schema.anyOf)
    return schema.anyOf.some(
      (schema2) => hasElysiaMeta(meta, schema2)
    );
  if (schema.someOf)
    return schema.someOf.some(
      (schema2) => hasElysiaMeta(meta, schema2)
    );
  if (schema.allOf)
    return schema.allOf.some(
      (schema2) => hasElysiaMeta(meta, schema2)
    );
  if (schema.not)
    return schema.not.some((schema2) => hasElysiaMeta(meta, schema2));
  if (schema.type === "object") {
    const properties = schema.properties;
    if (!properties) return false;
    for (const key of Object.keys(properties)) {
      const property = properties[key];
      if (property.type === "object") {
        if (hasElysiaMeta(meta, property)) return true;
      } else if (property.anyOf) {
        for (let i = 0; i < property.anyOf.length; i++)
          if (hasElysiaMeta(meta, property.anyOf[i])) return true;
      }
      return schema.elysiaMeta === meta;
    }
    return false;
  }
  return schema.type === "array" && schema.items && !Array.isArray(schema.items) ? hasElysiaMeta(meta, schema.items) : false;
}, hasProperty = (expectedProperty, _schema) => {
  if (!_schema) return;
  const schema = _schema.schema ?? _schema;
  if (schema[Kind$2] === "Import" && _schema.References)
    return _schema.References().some((schema2) => hasProperty(expectedProperty, schema2));
  if (schema.type === "object") {
    const properties = schema.properties;
    if (!properties) return false;
    for (const key of Object.keys(properties)) {
      const property = properties[key];
      if (expectedProperty in property) return true;
      if (property.type === "object") {
        if (hasProperty(expectedProperty, property)) return true;
      } else if (property.anyOf) {
        for (let i = 0; i < property.anyOf.length; i++)
          if (hasProperty(expectedProperty, property.anyOf[i]))
            return true;
      }
    }
    return false;
  }
  return expectedProperty in schema;
}, hasRef = (schema) => {
  if (!schema) return false;
  if (schema.oneOf) {
    for (let i = 0; i < schema.oneOf.length; i++)
      if (hasRef(schema.oneOf[i])) return true;
  }
  if (schema.anyOf) {
    for (let i = 0; i < schema.anyOf.length; i++)
      if (hasRef(schema.anyOf[i])) return true;
  }
  if (schema.oneOf) {
    for (let i = 0; i < schema.oneOf.length; i++)
      if (hasRef(schema.oneOf[i])) return true;
  }
  if (schema.allOf) {
    for (let i = 0; i < schema.allOf.length; i++)
      if (hasRef(schema.allOf[i])) return true;
  }
  if (schema.not && hasRef(schema.not)) return true;
  if (schema.type === "object" && schema.properties) {
    const properties = schema.properties;
    for (const key of Object.keys(properties)) {
      const property = properties[key];
      if (hasRef(property) || property.type === "array" && property.items && hasRef(property.items))
        return true;
    }
  }
  return schema.type === "array" && schema.items && hasRef(schema.items) ? true : schema[Kind$2] === "Ref" && "$ref" in schema;
}, hasTransform = (schema) => {
  if (!schema) return false;
  if (schema.$ref && schema.$defs && schema.$ref in schema.$defs && hasTransform(schema.$defs[schema.$ref]))
    return true;
  if (schema.oneOf) {
    for (let i = 0; i < schema.oneOf.length; i++)
      if (hasTransform(schema.oneOf[i])) return true;
  }
  if (schema.anyOf) {
    for (let i = 0; i < schema.anyOf.length; i++)
      if (hasTransform(schema.anyOf[i])) return true;
  }
  if (schema.allOf) {
    for (let i = 0; i < schema.allOf.length; i++)
      if (hasTransform(schema.allOf[i])) return true;
  }
  if (schema.not && hasTransform(schema.not)) return true;
  if (schema.type === "object" && schema.properties) {
    const properties = schema.properties;
    for (const key of Object.keys(properties)) {
      const property = properties[key];
      if (hasTransform(property) || property.type === "array" && property.items && hasTransform(property.items))
        return true;
    }
  }
  return schema.type === "array" && schema.items && hasTransform(schema.items) ? true : TransformKind$1 in schema;
}, createCleaner = (schema) => (value) => {
  if (typeof value == "object")
    try {
      return Clean(schema, value);
    } catch {
    }
  return value;
}, getSchemaValidator = (s, {
  models = {},
  dynamic = false,
  modules,
  normalize = false,
  additionalProperties = false,
  forceAdditionalProperties = false,
  coerce = false,
  additionalCoerce = [],
  validators,
  sanitize
} = {}) => {
  if (validators = validators?.filter((x) => x), !s) {
    if (!validators?.length) return;
    s = validators[0], validators = validators.slice(1);
  }
  let doesHaveRef;
  const replaceSchema = (schema2) => coerce ? replaceSchemaTypeFromManyOptions(schema2, [
    {
      from: t.Number(),
      to: (options) => t.Numeric(options),
      untilObjectFound: true
    },
    {
      from: t.Boolean(),
      to: (options) => t.BooleanString(options),
      untilObjectFound: true
    },
    ...Array.isArray(additionalCoerce) ? additionalCoerce : [additionalCoerce]
  ]) : replaceSchemaTypeFromManyOptions(schema2, additionalCoerce), mapSchema = (s2) => {
    if (s2 && typeof s2 != "string" && "~standard" in s2)
      return s2;
    if (!s2) return;
    let schema2;
    if (typeof s2 != "string") schema2 = s2;
    else if (schema2 = // @ts-expect-error private property
    modules && s2 in modules.$defs ? modules.Import(s2) : models[s2], !schema2) return;
    const hasAdditionalCoerce = Array.isArray(additionalCoerce) ? additionalCoerce.length > 0 : !!additionalCoerce;
    if (Kind$2 in schema2)
      if (schema2[Kind$2] === "Import")
        hasRef(schema2.$defs[schema2.$ref]) || (schema2 = schema2.$defs[schema2.$ref] ?? models[schema2.$ref], (coerce || hasAdditionalCoerce) && (schema2 = replaceSchema(schema2), "$id" in schema2 && !schema2.$defs && (schema2.$id = `${schema2.$id}_coerced_${randomId()}`)));
      else if (hasRef(schema2)) {
        const id = randomId();
        schema2 = t.Module({
          // @ts-expect-error private property
          ...modules?.$defs,
          [id]: schema2
        }).Import(id);
      } else (coerce || hasAdditionalCoerce) && (schema2 = replaceSchema(schema2));
    return schema2;
  };
  let schema = mapSchema(s), _validators = validators;
  if ("~standard" in schema || validators?.length && validators.some(
    (x) => x && typeof x != "string" && "~standard" in x
  )) {
    const typeboxSubValidator = (schema2) => {
      let mirror;
      if (normalize === true || normalize === "exactMirror")
        try {
          mirror = createMirror(schema2, {
            TypeCompiler,
            sanitize: sanitize?.(),
            modules
          });
        } catch {
          console.warn(
            "Failed to create exactMirror. Please report the following code to https://github.com/elysiajs/elysia/issues"
          ), console.warn(schema2), mirror = createCleaner(schema2);
        }
      const vali = getSchemaValidator(schema2, {
        models,
        modules,
        dynamic,
        normalize,
        additionalProperties: true,
        forceAdditionalProperties: true,
        coerce,
        additionalCoerce
      });
      return vali.Decode = mirror, (v) => vali.Check(v) ? {
        value: vali.Decode(v)
      } : {
        issues: [...vali.Errors(v)]
      };
    }, mainCheck = schema["~standard"] ? schema["~standard"].validate : typeboxSubValidator(schema);
    let checkers = [];
    if (validators?.length) {
      for (const validator2 of validators)
        if (validator2 && typeof validator2 != "string") {
          if (validator2?.["~standard"]) {
            checkers.push(validator2["~standard"]);
            continue;
          }
          if (Kind$2 in validator2) {
            checkers.push(typeboxSubValidator(validator2));
            continue;
          }
        }
    }
    async function Check(value) {
      let v = mainCheck(value);
      if (v instanceof Promise && (v = await v), v.issues) return v;
      const values = [];
      v && typeof v == "object" && values.push(v.value);
      for (let i = 0; i < checkers.length; i++) {
        if (v = checkers[i].validate(value), v instanceof Promise && (v = await v), v.issues) return v;
        v && typeof v == "object" && values.push(v.value);
      }
      if (!values.length) return { value: v };
      if (values.length === 1) return { value: values[0] };
      if (values.length === 2)
        return { value: mergeDeep(values[0], values[1]) };
      let newValue = mergeDeep(values[0], values[1]);
      for (let i = 2; i < values.length; i++)
        newValue = mergeDeep(newValue, values[i]);
      return { value: newValue };
    }
    const validator = {
      provider: "standard",
      schema,
      references: "",
      checkFunc: () => {
      },
      code: "",
      // @ts-ignore
      Check,
      // @ts-ignore
      Errors: (value) => Check(value)?.then?.((x) => x?.issues),
      Code: () => "",
      // @ts-ignore
      Decode: Check,
      // @ts-ignore
      Encode: (value) => value,
      hasAdditionalProperties: false,
      hasDefault: false,
      isOptional: false,
      hasTransform: false,
      hasRef: false
    };
    return validator.parse = (v) => {
      try {
        return validator.Decode(validator.Clean?.(v) ?? v);
      } catch {
        throw [...validator.Errors(v)].map(mapValueError);
      }
    }, validator.safeParse = (v) => {
      try {
        return {
          success: !0,
          data: validator.Decode(validator.Clean?.(v) ?? v),
          error: null
        };
      } catch {
        const errors = [...compiled.Errors(v)].map(mapValueError);
        return {
          success: false,
          data: null,
          error: errors[0]?.summary,
          errors
        };
      }
    }, validator;
  } else if (validators?.length) {
    let hasAdditional = false;
    const validators2 = _validators, { schema: mergedObjectSchema, notObjects } = mergeObjectSchemas$1([
      schema,
      ...validators2.map(mapSchema)
    ]);
    notObjects && (schema = t.Intersect([
      ...mergedObjectSchema ? [mergedObjectSchema] : [],
      ...notObjects.map((x) => {
        const schema2 = mapSchema(x);
        return schema2.type === "object" && "additionalProperties" in schema2 && (!hasAdditional && schema2.additionalProperties === false && (hasAdditional = true), delete schema2.additionalProperties), schema2;
      })
    ]), schema.type === "object" && hasAdditional && (schema.additionalProperties = false));
  } else
    schema.type === "object" && (!("additionalProperties" in schema) || forceAdditionalProperties) ? schema.additionalProperties = additionalProperties : schema = replaceSchemaTypeFromManyOptions(schema, {
      onlyFirst: "object",
      from: t.Object({}),
      to(schema2) {
        return !schema2.properties || "additionalProperties" in schema2 ? schema2 : t.Object(schema2.properties, {
          ...schema2,
          additionalProperties: false
        });
      }
    });
  if (dynamic)
    if (Kind$2 in schema) {
      const validator = {
        provider: "typebox",
        schema,
        references: "",
        checkFunc: () => {
        },
        code: "",
        // @ts-expect-error
        Check: (value) => Check(schema, value),
        Errors: (value) => Errors(schema, value),
        Code: () => "",
        Clean: createCleaner(schema),
        Decode: (value) => Decode(schema, value),
        Encode: (value) => Encode(schema, value),
        get hasAdditionalProperties() {
          return "~hasAdditionalProperties" in this ? this["~hasAdditionalProperties"] : this["~hasAdditionalProperties"] = hasAdditionalProperties(schema);
        },
        get hasDefault() {
          return "~hasDefault" in this ? this["~hasDefault"] : this["~hasDefault"] = hasProperty(
            "default",
            schema
          );
        },
        get isOptional() {
          return "~isOptional" in this ? this["~isOptional"] : this["~isOptional"] = isOptional(schema);
        },
        get hasTransform() {
          return "~hasTransform" in this ? this["~hasTransform"] : this["~hasTransform"] = hasTransform(schema);
        },
        "~hasRef": doesHaveRef,
        get hasRef() {
          return "~hasRef" in this ? this["~hasRef"] : this["~hasRef"] = hasTransform(schema);
        }
      };
      if (schema.config && (validator.config = schema.config, validator?.schema?.config && delete validator.schema.config), normalize && schema.additionalProperties === false)
        if (normalize === true || normalize === "exactMirror")
          try {
            validator.Clean = createMirror(schema, {
              TypeCompiler,
              sanitize: sanitize?.(),
              modules
            });
          } catch {
            console.warn(
              "Failed to create exactMirror. Please report the following code to https://github.com/elysiajs/elysia/issues"
            ), console.warn(schema), validator.Clean = createCleaner(schema);
          }
        else validator.Clean = createCleaner(schema);
      return validator.parse = (v) => {
        try {
          return validator.Decode(validator.Clean?.(v) ?? v);
        } catch {
          throw [...validator.Errors(v)].map(mapValueError);
        }
      }, validator.safeParse = (v) => {
        try {
          return {
            success: !0,
            data: validator.Decode(validator.Clean?.(v) ?? v),
            error: null
          };
        } catch {
          const errors = [...compiled.Errors(v)].map(mapValueError);
          return {
            success: false,
            data: null,
            error: errors[0]?.summary,
            errors
          };
        }
      }, validator;
    } else {
      const validator = {
        provider: "standard",
        schema,
        references: "",
        checkFunc: () => {
        },
        code: "",
        // @ts-ignore
        Check: (v) => schema["~standard"].validate(v),
        // @ts-ignore
        Errors(value) {
          const response = schema["~standard"].validate(value);
          if (response instanceof Promise)
            throw Error(
              "Async validation is not supported in non-dynamic schema"
            );
          return response.issues;
        },
        Code: () => "",
        // @ts-ignore
        Decode(value) {
          const response = schema["~standard"].validate(value);
          if (response instanceof Promise)
            throw Error(
              "Async validation is not supported in non-dynamic schema"
            );
          return response;
        },
        // @ts-ignore
        Encode: (value) => value,
        hasAdditionalProperties: false,
        hasDefault: false,
        isOptional: false,
        hasTransform: false,
        hasRef: false
      };
      return validator.parse = (v) => {
        try {
          return validator.Decode(validator.Clean?.(v) ?? v);
        } catch {
          throw [...validator.Errors(v)].map(mapValueError);
        }
      }, validator.safeParse = (v) => {
        try {
          return {
            success: !0,
            data: validator.Decode(validator.Clean?.(v) ?? v),
            error: null
          };
        } catch {
          const errors = [...compiled.Errors(v)].map(mapValueError);
          return {
            success: false,
            data: null,
            error: errors[0]?.summary,
            errors
          };
        }
      }, validator;
    }
  let compiled;
  if (Kind$2 in schema)
    if (compiled = TypeCompiler.Compile(
      schema,
      Object.values(models).filter((x) => Kind$2 in x)
    ), compiled.provider = "typebox", schema.config && (compiled.config = schema.config, compiled?.schema?.config && delete compiled.schema.config), normalize === true || normalize === "exactMirror")
      try {
        compiled.Clean = createMirror(schema, {
          TypeCompiler,
          sanitize: sanitize?.(),
          modules
        });
      } catch {
        console.warn(
          "Failed to create exactMirror. Please report the following code to https://github.com/elysiajs/elysia/issues"
        ), console.dir(schema, {
          depth: null
        }), compiled.Clean = createCleaner(schema);
      }
    else normalize === "typebox" && (compiled.Clean = createCleaner(schema));
  else
    compiled = {
      provider: "standard",
      schema,
      references: "",
      checkFunc(value) {
        const response = schema["~standard"].validate(value);
        if (response instanceof Promise)
          throw Error(
            "Async validation is not supported in non-dynamic schema"
          );
        return response;
      },
      code: "",
      // @ts-ignore
      Check: (v) => schema["~standard"].validate(v),
      // @ts-ignore
      Errors(value) {
        const response = schema["~standard"].validate(value);
        if (response instanceof Promise)
          throw Error(
            "Async validation is not supported in non-dynamic schema"
          );
        return response.issues;
      },
      Code: () => "",
      // @ts-ignore
      Decode(value) {
        const response = schema["~standard"].validate(value);
        if (response instanceof Promise)
          throw Error(
            "Async validation is not supported in non-dynamic schema"
          );
        return response;
      },
      // @ts-ignore
      Encode: (value) => value,
      hasAdditionalProperties: false,
      hasDefault: false,
      isOptional: false,
      hasTransform: false,
      hasRef: false
    };
  return compiled.parse = (v) => {
    try {
      return compiled.Decode(compiled.Clean?.(v) ?? v);
    } catch {
      throw [...compiled.Errors(v)].map(mapValueError);
    }
  }, compiled.safeParse = (v) => {
    try {
      return {
        success: !0,
        data: compiled.Decode(compiled.Clean?.(v) ?? v),
        error: null
      };
    } catch {
      const errors = [...compiled.Errors(v)].map(mapValueError);
      return {
        success: false,
        data: null,
        error: errors[0]?.summary,
        errors
      };
    }
  }, Kind$2 in schema && Object.assign(compiled, {
    get hasAdditionalProperties() {
      return "~hasAdditionalProperties" in this ? this["~hasAdditionalProperties"] : this["~hasAdditionalProperties"] = hasAdditionalProperties(compiled);
    },
    get hasDefault() {
      return "~hasDefault" in this ? this["~hasDefault"] : this["~hasDefault"] = hasProperty("default", compiled);
    },
    get isOptional() {
      return "~isOptional" in this ? this["~isOptional"] : this["~isOptional"] = isOptional(compiled);
    },
    get hasTransform() {
      return "~hasTransform" in this ? this["~hasTransform"] : this["~hasTransform"] = hasTransform(schema);
    },
    get hasRef() {
      return "~hasRef" in this ? this["~hasRef"] : this["~hasRef"] = hasRef(schema);
    },
    "~hasRef": doesHaveRef
  }), compiled;
}, isUnion = (schema) => schema[Kind$2] === "Union" || !schema.schema && !!schema.anyOf, mergeObjectSchemas$1 = (schemas) => {
  if (schemas.length === 0)
    return {
      schema: void 0,
      notObjects: []
    };
  if (schemas.length === 1)
    return schemas[0].type === "object" ? {
      schema: schemas[0],
      notObjects: []
    } : {
      schema: void 0,
      notObjects: schemas
    };
  let newSchema;
  const notObjects = [];
  let additionalPropertiesIsTrue = false, additionalPropertiesIsFalse = false;
  for (const schema of schemas) {
    if (schema.type !== "object") {
      notObjects.push(schema);
      continue;
    }
    if ("additionalProperties" in schema && (schema.additionalProperties === true ? additionalPropertiesIsTrue = true : schema.additionalProperties === false && (additionalPropertiesIsFalse = true)), !newSchema) {
      newSchema = schema;
      continue;
    }
    newSchema = {
      ...newSchema,
      ...schema,
      properties: {
        ...newSchema.properties,
        ...schema.properties
      },
      required: [
        ...newSchema?.required ?? [],
        ...schema.required ?? []
      ]
    };
  }
  return newSchema && (newSchema.required && (newSchema.required = [...new Set(newSchema.required)]), additionalPropertiesIsFalse ? newSchema.additionalProperties = false : additionalPropertiesIsTrue && (newSchema.additionalProperties = true)), {
    schema: newSchema,
    notObjects
  };
}, getResponseSchemaValidator = (s, {
  models = {},
  modules,
  dynamic = false,
  normalize = false,
  additionalProperties = false,
  validators = [],
  sanitize
}) => {
  if (validators = validators.filter((x) => x), !s) {
    if (!validators?.length) return;
    s = validators[0], validators = validators.slice(1);
  }
  let maybeSchemaOrRecord;
  if (typeof s != "string") maybeSchemaOrRecord = s;
  else if (maybeSchemaOrRecord = // @ts-expect-error private property
  modules && s in modules.$defs ? modules.Import(s) : models[s], !maybeSchemaOrRecord) return;
  if (!maybeSchemaOrRecord) return;
  if (Kind$2 in maybeSchemaOrRecord || "~standard" in maybeSchemaOrRecord)
    return {
      200: getSchemaValidator(
        maybeSchemaOrRecord,
        {
          modules,
          models,
          additionalProperties,
          dynamic,
          normalize,
          coerce: false,
          additionalCoerce: [],
          validators: validators.map((x) => x[200]),
          sanitize
        }
      )
    };
  const record = {};
  return Object.keys(maybeSchemaOrRecord).forEach((status) => {
    if (isNaN(+status)) return;
    const maybeNameOrSchema = maybeSchemaOrRecord[+status];
    if (typeof maybeNameOrSchema == "string") {
      if (maybeNameOrSchema in models) {
        const schema = models[maybeNameOrSchema];
        if (!schema) return;
        record[+status] = Kind$2 in schema || "~standard" in schema ? getSchemaValidator(schema, {
          modules,
          models,
          additionalProperties,
          dynamic,
          normalize,
          coerce: false,
          additionalCoerce: [],
          validators: validators.map((x) => x[+status]),
          sanitize
        }) : schema;
      }
      return;
    }
    record[+status] = Kind$2 in maybeNameOrSchema || "~standard" in maybeNameOrSchema ? getSchemaValidator(maybeNameOrSchema, {
      modules,
      models,
      additionalProperties,
      dynamic,
      normalize,
      coerce: false,
      additionalCoerce: [],
      validators: validators.map((x) => x[+status]),
      sanitize
    }) : maybeNameOrSchema;
  }), record;
}, getCookieValidator = ({
  validator,
  modules,
  defaultConfig = {},
  config,
  dynamic,
  normalize = false,
  models,
  validators,
  sanitize
}) => {
  let cookieValidator = (
    // @ts-ignore
    validator?.provider ? validator : (
      // @ts-ignore
      getSchemaValidator(validator, {
        modules,
        dynamic,
        models,
        normalize,
        additionalProperties: true,
        coerce: true,
        additionalCoerce: stringToStructureCoercions(),
        validators,
        sanitize
      })
    )
  );
  return cookieValidator ? cookieValidator.config = mergeCookie(cookieValidator.config, config) : (cookieValidator = getSchemaValidator(t.Cookie(t.Any()), {
    modules,
    dynamic,
    models,
    additionalProperties: true,
    validators,
    sanitize
  }), cookieValidator.config = defaultConfig), cookieValidator;
}, unwrapImportSchema = (schema) => schema && schema[Kind$2] === "Import" && schema.$defs[schema.$ref][Kind$2] === "Object" ? schema.$defs[schema.$ref] : schema;

const allocateIf$1 = (value, condition) => condition ? value : "", defaultParsers = [
  "json",
  "text",
  "urlencoded",
  "arrayBuffer",
  "formdata",
  "application/json",
  // eslint-disable-next-line sonarjs/no-duplicate-string
  "text/plain",
  // eslint-disable-next-line sonarjs/no-duplicate-string
  "application/x-www-form-urlencoded",
  // eslint-disable-next-line sonarjs/no-duplicate-string
  "application/octet-stream",
  // eslint-disable-next-line sonarjs/no-duplicate-string
  "multipart/form-data"
], createReport = ({
  context = "c",
  trace = [],
  addFn
}) => {
  if (!trace.length)
    return () => ({
      resolveChild() {
        return () => {
        };
      },
      resolve() {
      }
    });
  for (let i = 0; i < trace.length; i++)
    addFn(
      `let report${i},reportChild${i},reportErr${i},reportErrChild${i};let trace${i}=${context}[ELYSIA_TRACE]?.[${i}]??trace[${i}](${context});
`
    );
  return (event, {
    name,
    total = 0,
    alias
  } = {}) => {
    name || (name = "anonymous");
    const reporter = event === "error" ? "reportErr" : "report";
    for (let i = 0; i < trace.length; i++)
      addFn(
        `${alias ? "const " : ""}${alias ?? reporter}${i}=trace${i}.${event}({id,event:'${event}',name:'${name}',begin:performance.now(),total:${total}})
`
      ), alias && addFn(`${reporter}${i}=${alias}${i}
`);
    return {
      resolve() {
        for (let i = 0; i < trace.length; i++)
          addFn(`${alias ?? reporter}${i}.resolve()
`);
      },
      resolveChild(name2) {
        for (let i = 0; i < trace.length; i++)
          addFn(
            `${reporter}Child${i}=${reporter}${i}.resolveChild?.shift()?.({id,event:'${event}',name:'${name2}',begin:performance.now()})
`
          );
        return (binding) => {
          for (let i = 0; i < trace.length; i++)
            addFn(
              binding ? `if(${binding} instanceof Error){${reporter}Child${i}?.(${binding}) }else{${reporter}Child${i}?.()}` : `${reporter}Child${i}?.()
`
            );
        };
      }
    };
  };
}, composeCleaner = ({
  schema,
  name,
  type,
  typeAlias = type,
  normalize,
  ignoreTryCatch = false
}) => !normalize || !schema.Clean ? "" : normalize === true || normalize === "exactMirror" ? ignoreTryCatch ? `${name}=validator.${typeAlias}.Clean(${name})
` : `try{${name}=validator.${typeAlias}.Clean(${name})
}catch{}` : normalize === "typebox" ? `${name}=validator.${typeAlias}.Clean(${name})
` : "", composeValidationFactory = ({
  injectResponse = "",
  normalize = false,
  validator,
  encodeSchema = false,
  isStaticResponse = false,
  hasSanitize = false,
  allowUnsafeValidationDetails = false
}) => ({
  validate: (type, value = `c.${type}`, error) => `c.set.status=422;throw new ValidationError('${type}',validator.${type},${value},${allowUnsafeValidationDetails}${error ? "," + error : ""})`,
  response: (name = "r") => {
    if (isStaticResponse || !validator.response) return "";
    let code = injectResponse + `
`;
    code += `if(${name} instanceof ElysiaCustomStatusResponse){c.set.status=${name}.code
${name}=${name}.response}if(${name} instanceof Response === false && typeof ${name}?.next !== 'function' && !(${name} instanceof ReadableStream))switch(c.set.status){`;
    for (const [status2, value] of Object.entries(validator.response)) {
      if (code += `
case ${status2}:
`, value.provider === "standard") {
        code += `let vare${status2}=validator.response[${status2}].Check(${name})
if(vare${status2} instanceof Promise)vare${status2}=await vare${status2}
if(vare${status2}.issues)throw new ValidationError('response',validator.response[${status2}],${name},${allowUnsafeValidationDetails},vare${status2}.issues)
${name}=vare${status2}.value
c.set.status=${status2}
break
`;
        continue;
      }
      let noValidate = value.schema?.noValidate === true;
      if (!noValidate && value.schema?.$ref && value.schema?.$defs) {
        const refKey = value.schema.$ref, defKey = typeof refKey == "string" && refKey.includes("/") ? refKey.split("/").pop() : refKey;
        value.schema.$defs[defKey]?.noValidate === true && (noValidate = true);
      }
      const appliedCleaner = noValidate || hasSanitize, clean = ({ ignoreTryCatch = false } = {}) => composeCleaner({
        name,
        schema: value,
        type: "response",
        typeAlias: `response[${status2}]`,
        normalize,
        ignoreTryCatch
      });
      appliedCleaner && (code += clean());
      const applyErrorCleaner = !appliedCleaner && normalize && !noValidate;
      encodeSchema && value.hasTransform && !noValidate ? (code += `try{${name}=validator.response[${status2}].Encode(${name})
`, appliedCleaner || (code += clean({ ignoreTryCatch: true })), code += `c.set.status=${status2}}catch{` + (applyErrorCleaner ? `try{
` + clean({ ignoreTryCatch: true }) + `${name}=validator.response[${status2}].Encode(${name})
}catch{throw new ValidationError('response',validator.response[${status2}],${name},${allowUnsafeValidationDetails})}` : `throw new ValidationError('response',validator.response[${status2}],${name}),${allowUnsafeValidationDetails}`) + "}") : (appliedCleaner || (code += clean()), noValidate || (code += `if(validator.response[${status2}].Check(${name})===false)throw new ValidationError('response',validator.response[${status2}],${name},${allowUnsafeValidationDetails})
c.set.status=${status2}
`)), code += `break
`;
    }
    return code + "}";
  }
}), isAsyncName = (v) => (v?.fn ?? v).constructor.name === "AsyncFunction", matchResponseClone = /=>\s?response\.clone\(/, matchFnReturn = /(?:return|=>)\s?\S+\(|a(?:sync|wait)/, isAsync = (v) => {
  const isObject = typeof v == "object";
  if (isObject && v.isAsync !== void 0) return v.isAsync;
  const fn = isObject ? v.fn : v;
  if (fn.constructor.name === "AsyncFunction") return true;
  const literal = fn.toString();
  if (matchResponseClone.test(literal))
    return isObject && (v.isAsync = false), false;
  const result = matchFnReturn.test(literal);
  return isObject && (v.isAsync = result), result;
}, hasReturn = (v) => {
  const isObject = typeof v == "object";
  if (isObject && v.hasReturn !== void 0) return v.hasReturn;
  const fnLiteral = isObject ? v.fn.toString() : v.toString(), parenthesisEnd = fnLiteral.indexOf(")"), arrowIndex = fnLiteral.indexOf("=>", parenthesisEnd);
  if (arrowIndex !== -1) {
    let afterArrow = arrowIndex + 2, charCode;
    for (; afterArrow < fnLiteral.length && ((charCode = fnLiteral.charCodeAt(afterArrow)) === 32 || // space
    charCode === 9 || // tab
    charCode === 10 || // newline
    charCode === 13); )
      afterArrow++;
    if (afterArrow < fnLiteral.length && fnLiteral.charCodeAt(afterArrow) !== 123)
      return isObject && (v.hasReturn = true), true;
  }
  const result = fnLiteral.includes("return");
  return isObject && (v.hasReturn = result), result;
}, isGenerator = (v) => {
  const fn = v?.fn ?? v;
  return fn.constructor.name === "AsyncGeneratorFunction" || fn.constructor.name === "GeneratorFunction";
}, coerceTransformDecodeError = (fnLiteral, type, allowUnsafeValidationDetails = false, value = `c.${type}`) => `try{${fnLiteral}}catch(error){if(error.constructor.name === 'TransformDecodeError'){c.set.status=422
throw error.error ?? new ValidationError('${type}',validator.${type},${value},${allowUnsafeValidationDetails})}}`, setImmediateFn = hasSetImmediate ? "setImmediate" : "Promise.resolve().then", composeHandler = ({
  app,
  path,
  method,
  hooks,
  validator,
  handler,
  allowMeta = false,
  inference
}) => {
  const adapter = app["~adapter"].composeHandler, adapterHandler = app["~adapter"].handler, isHandleFn = typeof handler == "function";
  if (!isHandleFn) {
    handler = adapterHandler.mapResponse(handler, {
      // @ts-expect-error private property
      headers: app.setHeaders ?? {}
    });
    const isResponse = handler instanceof Response || // @ts-ignore If it's not instanceof Response, it might be a polyfill (only on Node)
    handler?.constructor?.name === "Response" && typeof handler?.clone == "function";
    if (hooks.parse?.length && hooks.transform?.length && hooks.beforeHandle?.length && hooks.afterHandle?.length)
      return isResponse ? Function(
        "a",
        `"use strict";
return function(){return a.clone()}`
      )(handler) : Function(
        "a",
        `"use strict";
return function(){return a}`
      )(handler);
    if (isResponse) {
      const response = handler;
      handler = () => response.clone();
    }
  }
  const handle = isHandleFn ? "handler(c)" : "handler", hasTrace = !!hooks.trace?.length;
  let fnLiteral = "";
  if (inference = sucrose(
    Object.assign({ handler }, hooks),
    inference,
    app.config.sucrose
  ), adapter.declare) {
    const literal = adapter.declare(inference);
    literal && (fnLiteral += literal);
  }
  inference.server && (fnLiteral += `Object.defineProperty(c,'server',{get:function(){return getServer()}})
`), validator.createBody?.(), validator.createQuery?.(), validator.createHeaders?.(), validator.createParams?.(), validator.createCookie?.(), validator.createResponse?.();
  const hasValidation = !!validator.body || !!validator.headers || !!validator.params || !!validator.query || !!validator.cookie || !!validator.response, hasQuery = inference.query || !!validator.query, requestNoBody = hooks.parse?.length === 1 && // @ts-expect-error
  hooks.parse[0].fn === "none", hasBody = method !== "" && method !== "GET" && method !== "HEAD" && (inference.body || !!validator.body || !!hooks.parse?.length) && !requestNoBody, defaultHeaders = app.setHeaders, hasDefaultHeaders = defaultHeaders && !!Object.keys(defaultHeaders).length, hasHeaders = inference.headers || !!validator.headers || adapter.preferWebstandardHeaders !== true && inference.body, hasCookie = inference.cookie || !!validator.cookie, cookieMeta = validator.cookie?.config ? mergeCookie(validator?.cookie?.config, app.config.cookie) : app.config.cookie;
  let _encodeCookie = "";
  const encodeCookie = () => {
    if (_encodeCookie) return _encodeCookie;
    if (cookieMeta?.sign) {
      if (!cookieMeta.secrets)
        throw new Error(
          `t.Cookie required secret which is not set in (${method}) ${path}.`
        );
      const secret = cookieMeta.secrets ? typeof cookieMeta.secrets == "string" ? cookieMeta.secrets : cookieMeta.secrets[0] : void 0;
      if (_encodeCookie += `const _setCookie = c.set.cookie
if(_setCookie){`, cookieMeta.sign === true)
        _encodeCookie += `for(const [key, cookie] of Object.entries(_setCookie)){c.set.cookie[key].value=await signCookie(cookie.value,${secret ? JSON.stringify(secret) : "undefined"})}`;
      else {
        typeof cookieMeta.sign == "string" && (cookieMeta.sign = [cookieMeta.sign]);
        for (const name of cookieMeta.sign)
          _encodeCookie += `if(_setCookie[${JSON.stringify(name)}]?.value)c.set.cookie[${JSON.stringify(name)}].value=await signCookie(_setCookie[${JSON.stringify(name)}].value,${secret ? JSON.stringify(secret) : "undefined"})
`;
      }
      _encodeCookie += `}
`;
    }
    return _encodeCookie;
  }, normalize = app.config.normalize, encodeSchema = app.config.encodeSchema, allowUnsafeValidationDetails = app.config.allowUnsafeValidationDetails, validation = composeValidationFactory({
    normalize,
    validator,
    encodeSchema,
    isStaticResponse: handler instanceof Response,
    hasSanitize: !!app.config.sanitize,
    allowUnsafeValidationDetails
  });
  hasHeaders && (fnLiteral += adapter.headers), hasTrace && (fnLiteral += `const id=c[ELYSIA_REQUEST_ID]
`);
  const report = createReport({
    trace: hooks.trace,
    addFn: (word) => {
      fnLiteral += word;
    }
  });
  if (fnLiteral += "try{", hasCookie) {
    const get = (name, defaultValue) => {
      const value = cookieMeta?.[name] ?? defaultValue;
      return value === void 0 ? "" : value ? typeof value == "string" ? `${name}:${JSON.stringify(value)},` : value instanceof Date ? `${name}: new Date(${value.getTime()}),` : `${name}:${value},` : typeof defaultValue == "string" ? `${name}:"${defaultValue}",` : `${name}:${defaultValue},`;
    }, options = cookieMeta ? `{secrets:${cookieMeta.secrets !== void 0 ? typeof cookieMeta.secrets == "string" ? JSON.stringify(cookieMeta.secrets) : "[" + cookieMeta.secrets.map((x) => JSON.stringify(x)).join(",") + "]" : "undefined"},sign:${cookieMeta.sign === true ? true : cookieMeta.sign !== void 0 ? typeof cookieMeta.sign == "string" ? JSON.stringify(cookieMeta.sign) : "[" + cookieMeta.sign.map((x) => JSON.stringify(x)).join(",") + "]" : "undefined"},` + get("domain") + get("expires") + get("httpOnly") + get("maxAge") + get("path", "/") + get("priority") + get("sameSite") + get("secure") + "}" : "undefined";
    hasHeaders ? fnLiteral += `
c.cookie=await parseCookie(c.set,c.headers.cookie,${options})
` : fnLiteral += `
c.cookie=await parseCookie(c.set,c.request.headers.get('cookie'),${options})
`;
  }
  if (hasQuery) {
    let arrayProperties = {}, objectProperties = {}, hasArrayProperty = false, hasObjectProperty = false;
    if (validator.query?.schema) {
      const schema = unwrapImportSchema(validator.query?.schema);
      if (Kind$2 in schema && schema.properties)
        for (const [key, value] of Object.entries(schema.properties))
          hasElysiaMeta("ArrayQuery", value) && (arrayProperties[key] = true, hasArrayProperty = true), hasElysiaMeta("ObjectString", value) && (objectProperties[key] = true, hasObjectProperty = true);
    }
    fnLiteral += `if(c.qi===-1){c.query=Object.create(null)}else{c.query=parseQueryFromURL(c.url,c.qi+1${//
    hasArrayProperty ? "," + JSON.stringify(arrayProperties) : hasObjectProperty ? ",undefined" : ""}${//
    hasObjectProperty ? "," + JSON.stringify(objectProperties) : ""})}`;
  }
  const isAsyncHandler = typeof handler == "function" && isAsync(handler), saveResponse = hasTrace || hooks.afterResponse?.length ? "c.response=c.responseValue= " : "", responseKeys = Object.keys(validator.response ?? {}), hasMultipleResponses = responseKeys.length > 1, hasSingle200 = responseKeys.length === 0 || responseKeys.length === 1 && responseKeys[0] === "200", maybeAsync = hasCookie || hasBody || isAsyncHandler || !!hooks.parse?.length || !!hooks.afterHandle?.some(isAsync) || !!hooks.beforeHandle?.some(isAsync) || !!hooks.transform?.some(isAsync) || !!hooks.mapResponse?.some(isAsync) || validator.body?.provider === "standard" || validator.headers?.provider === "standard" || validator.query?.provider === "standard" || validator.params?.provider === "standard" || validator.cookie?.provider === "standard" || Object.values(validator.response ?? {}).find(
    (x) => x.provider === "standard"
  ), maybeStream = (typeof handler == "function" ? isGenerator(handler) : false) || !!hooks.beforeHandle?.some(isGenerator) || !!hooks.afterHandle?.some(isGenerator) || !!hooks.transform?.some(isGenerator), hasSet = inference.cookie || inference.set || hasHeaders || hasTrace || hasMultipleResponses || !hasSingle200 || isHandleFn && hasDefaultHeaders || maybeStream;
  let _afterResponse;
  const afterResponse = (hasStream = true) => {
    if (_afterResponse !== void 0) return _afterResponse;
    if (!hooks.afterResponse?.length && !hasTrace) return "";
    let afterResponse2 = "";
    afterResponse2 += `
${setImmediateFn}(async()=>{if(c.responseValue){if(c.responseValue instanceof ElysiaCustomStatusResponse) c.set.status=c.responseValue.code
` + (hasStream ? `if(typeof afterHandlerStreamListener!=='undefined')for await(const v of afterHandlerStreamListener){}
` : "") + `}
`;
    const reporter = createReport({
      trace: hooks.trace,
      addFn: (word) => {
        afterResponse2 += word;
      }
    })("afterResponse", {
      total: hooks.afterResponse?.length
    });
    if (hooks.afterResponse?.length && hooks.afterResponse)
      for (let i = 0; i < hooks.afterResponse.length; i++) {
        const endUnit = reporter.resolveChild(
          hooks.afterResponse[i].fn.name
        ), prefix = isAsync(hooks.afterResponse[i]) ? "await " : "";
        afterResponse2 += `
${prefix}e.afterResponse[${i}](c)
`, endUnit();
      }
    return reporter.resolve(), afterResponse2 += `})
`, _afterResponse = afterResponse2;
  }, mapResponse = (r = "r") => {
    const after = afterResponse(), response = `${hasSet ? "mapResponse" : "mapCompactResponse"}(${saveResponse}${r}${hasSet ? ",c.set" : ""}${mapResponseContext})
`;
    return after ? `const _res=${response}` + after + "return _res" : `return ${response}`;
  }, mapResponseContext = maybeStream && adapter.mapResponseContext ? `,${adapter.mapResponseContext}` : "";
  (hasTrace || inference.route) && (fnLiteral += `c.route=\`${path}\`
`), (hasTrace || hooks.afterResponse?.length) && (fnLiteral += `let afterHandlerStreamListener
`);
  const parseReporter = report("parse", {
    total: hooks.parse?.length
  });
  if (hasBody) {
    const hasBodyInference = !!hooks.parse?.length || inference.body || validator.body;
    adapter.parser.declare && (fnLiteral += adapter.parser.declare), fnLiteral += `
try{`;
    let parser = typeof hooks.parse == "string" ? hooks.parse : Array.isArray(hooks.parse) && hooks.parse.length === 1 ? typeof hooks.parse[0] == "string" ? hooks.parse[0] : typeof hooks.parse[0].fn == "string" ? hooks.parse[0].fn : void 0 : void 0;
    if (!parser && validator.body && !hooks.parse?.length) {
      const schema = validator.body.schema;
      schema && schema.anyOf && schema[Kind$2] === "Union" && schema.anyOf?.length === 2 && schema.anyOf?.find((x) => x[Kind$2] === "ElysiaForm") && (parser = "formdata");
    }
    if (parser && defaultParsers.includes(parser)) {
      const reporter = report("parse", {
        total: hooks.parse?.length
      }), isOptionalBody = !!validator.body?.isOptional;
      switch (parser) {
        case "json":
        case "application/json":
          fnLiteral += adapter.parser.json(isOptionalBody);
          break;
        case "text":
        case "text/plain":
          fnLiteral += adapter.parser.text(isOptionalBody);
          break;
        case "urlencoded":
        case "application/x-www-form-urlencoded":
          fnLiteral += adapter.parser.urlencoded(isOptionalBody);
          break;
        case "arrayBuffer":
        case "application/octet-stream":
          fnLiteral += adapter.parser.arrayBuffer(isOptionalBody);
          break;
        case "formdata":
        case "multipart/form-data":
          fnLiteral += adapter.parser.formData(isOptionalBody);
          break;
        default:
          parser[0] in app["~parser"] && (fnLiteral += hasHeaders ? "let contentType = c.headers['content-type']" : "let contentType = c.request.headers.get('content-type')", fnLiteral += `
if(contentType){const index=contentType.indexOf(';')
if(index!==-1)contentType=contentType.substring(0,index)}
else{contentType=''}c.contentType=contentType
let result=parser['${parser}'](c, contentType)
if(result instanceof Promise)result=await result
if(result instanceof ElysiaCustomStatusResponse)throw result
if(result!==undefined)c.body=result
delete c.contentType
`);
          break;
      }
      reporter.resolve();
    } else if (hasBodyInference) {
      fnLiteral += `
`, fnLiteral += `let contentType
if(c.request.body)`, fnLiteral += hasHeaders ? `contentType=c.headers['content-type']
` : `contentType=c.request.headers.get('content-type')
`;
      let hasDefaultParser = false;
      if (hooks.parse?.length)
        fnLiteral += `if(contentType){
const index=contentType.indexOf(';')

if(index!==-1)contentType=contentType.substring(0,index)}else{contentType=''}let used=false
c.contentType=contentType
`;
      else {
        hasDefaultParser = true;
        const isOptionalBody = !!validator.body?.isOptional;
        fnLiteral += `if(contentType)switch(contentType.charCodeAt(12)){
case 106:` + adapter.parser.json(isOptionalBody) + `break
case 120:` + adapter.parser.urlencoded(isOptionalBody) + `break
case 111:` + adapter.parser.arrayBuffer(isOptionalBody) + `break
case 114:` + adapter.parser.formData(isOptionalBody) + `break
default:if(contentType.charCodeAt(0)===116){` + adapter.parser.text(isOptionalBody) + `}break
}`;
      }
      const reporter = report("parse", {
        total: hooks.parse?.length
      });
      if (hooks.parse)
        for (let i = 0; i < hooks.parse.length; i++) {
          const name = `bo${i}`;
          if (i !== 0 && (fnLiteral += `
if(!used){`), typeof hooks.parse[i].fn == "string") {
            const endUnit = reporter.resolveChild(
              hooks.parse[i].fn
            ), isOptionalBody = !!validator.body?.isOptional;
            switch (hooks.parse[i].fn) {
              case "json":
              case "application/json":
                hasDefaultParser = true, fnLiteral += adapter.parser.json(isOptionalBody);
                break;
              case "text":
              case "text/plain":
                hasDefaultParser = true, fnLiteral += adapter.parser.text(isOptionalBody);
                break;
              case "urlencoded":
              case "application/x-www-form-urlencoded":
                hasDefaultParser = true, fnLiteral += adapter.parser.urlencoded(isOptionalBody);
                break;
              case "arrayBuffer":
              case "application/octet-stream":
                hasDefaultParser = true, fnLiteral += adapter.parser.arrayBuffer(isOptionalBody);
                break;
              case "formdata":
              case "multipart/form-data":
                hasDefaultParser = true, fnLiteral += adapter.parser.formData(isOptionalBody);
                break;
              default:
                fnLiteral += `let ${name}=parser['${hooks.parse[i].fn}'](c,contentType)
if(${name} instanceof Promise)${name}=await ${name}
if(${name}!==undefined){c.body=${name};used=true;}
`;
            }
            endUnit();
          } else {
            const endUnit = reporter.resolveChild(
              hooks.parse[i].fn.name
            );
            fnLiteral += `let ${name}=e.parse[${i}]
${name}=${name}(c,contentType)
if(${name} instanceof Promise)${name}=await ${name}
if(${name}!==undefined){c.body=${name};used=true}`, endUnit();
          }
          if (i !== 0 && (fnLiteral += "}"), hasDefaultParser) break;
        }
      if (reporter.resolve(), !hasDefaultParser) {
        const isOptionalBody = !!validator.body?.isOptional;
        hooks.parse?.length && (fnLiteral += `
if(!used){
`), fnLiteral += `switch(contentType){case 'application/json':
` + adapter.parser.json(isOptionalBody) + `break
case 'text/plain':` + adapter.parser.text(isOptionalBody) + `break
case 'application/x-www-form-urlencoded':` + adapter.parser.urlencoded(isOptionalBody) + `break
case 'application/octet-stream':` + adapter.parser.arrayBuffer(isOptionalBody) + `break
case 'multipart/form-data':` + adapter.parser.formData(isOptionalBody) + `break
`;
        for (const key of Object.keys(app["~parser"]))
          fnLiteral += `case '${key}':let bo${key}=parser['${key}'](c,contentType)
if(bo${key} instanceof Promise)bo${key}=await bo${key}
if(bo${key} instanceof ElysiaCustomStatusResponse){` + mapResponse(`bo${key}`) + `}if(bo${key}!==undefined)c.body=bo${key}
break
`;
        hooks.parse?.length && (fnLiteral += "}"), fnLiteral += "}";
      }
      hooks.parse?.length && (fnLiteral += `
delete c.contentType`);
    }
    fnLiteral += "}catch(error){throw new ParseError(error)}";
  }
  if (parseReporter.resolve(), hooks?.transform || hasTrace) {
    const reporter = report("transform", {
      total: hooks.transform?.length
    });
    if (hooks.transform?.length) {
      fnLiteral += `let transformed
`;
      for (let i = 0; i < hooks.transform.length; i++) {
        const transform = hooks.transform[i], endUnit = reporter.resolveChild(transform.fn.name);
        fnLiteral += isAsync(transform) ? `transformed=await e.transform[${i}](c)
` : `transformed=e.transform[${i}](c)
`, transform.subType === "mapDerive" ? fnLiteral += "if(transformed instanceof ElysiaCustomStatusResponse){" + mapResponse("transformed") + `}else{transformed.request=c.request
transformed.store=c.store
transformed.qi=c.qi
transformed.path=c.path
transformed.url=c.url
transformed.redirect=c.redirect
transformed.set=c.set
transformed.error=c.error
c=transformed}` : fnLiteral += "if(transformed instanceof ElysiaCustomStatusResponse){" + mapResponse("transformed") + `}else Object.assign(c,transformed)
`, endUnit();
      }
    }
    reporter.resolve();
  }
  const fileUnions = [];
  if (validator) {
    if (validator.headers) {
      if (validator.headers.hasDefault)
        for (const [key, value] of Object.entries(
          Default(
            // @ts-ignore
            validator.headers.schema,
            {}
          )
        )) {
          const parsed = typeof value == "object" ? JSON.stringify(value) : typeof value == "string" ? `'${value}'` : value;
          parsed !== void 0 && (fnLiteral += `c.headers['${key}']??=${parsed}
`);
        }
      fnLiteral += composeCleaner({
        name: "c.headers",
        schema: validator.headers,
        type: "headers",
        normalize
      }), validator.headers.isOptional && (fnLiteral += "if(isNotEmpty(c.headers)){"), validator.headers?.provider === "standard" ? fnLiteral += `let vah=validator.headers.Check(c.headers)
if(vah instanceof Promise)vah=await vah
if(vah.issues){` + validation.validate("headers", void 0, "vah.issues") + `}else{c.headers=vah.value}
` : validator.headers?.schema?.noValidate !== true && (fnLiteral += "if(validator.headers.Check(c.headers) === false){" + validation.validate("headers") + "}"), validator.headers.hasTransform && (fnLiteral += coerceTransformDecodeError(
        `c.headers=validator.headers.Decode(c.headers)
`,
        "headers",
        allowUnsafeValidationDetails
      )), validator.headers.isOptional && (fnLiteral += "}");
    }
    if (validator.params) {
      if (validator.params.hasDefault)
        for (const [key, value] of Object.entries(
          Default(
            // @ts-ignore
            validator.params.schema,
            {}
          )
        )) {
          const parsed = typeof value == "object" ? JSON.stringify(value) : typeof value == "string" ? `'${value}'` : value;
          parsed !== void 0 && (fnLiteral += `c.params['${key}']??=${parsed}
`);
        }
      validator.params.provider === "standard" ? fnLiteral += `let vap=validator.params.Check(c.params)
if(vap instanceof Promise)vap=await vap
if(vap.issues){` + validation.validate("params", void 0, "vap.issues") + `}else{c.params=vap.value}
` : validator.params?.schema?.noValidate !== true && (fnLiteral += "if(validator.params.Check(c.params)===false){" + validation.validate("params") + "}"), validator.params.hasTransform && (fnLiteral += coerceTransformDecodeError(
        `c.params=validator.params.Decode(c.params)
`,
        "params",
        allowUnsafeValidationDetails
      ));
    }
    if (validator.query) {
      if (Kind$2 in validator.query?.schema && validator.query.hasDefault)
        for (const [key, value] of Object.entries(
          Default(
            // @ts-ignore
            validator.query.schema,
            {}
          )
        )) {
          const parsed = typeof value == "object" ? JSON.stringify(value) : typeof value == "string" ? `'${value}'` : value;
          parsed !== void 0 && (fnLiteral += `if(c.query['${key}']===undefined)c.query['${key}']=${parsed}
`);
        }
      fnLiteral += composeCleaner({
        name: "c.query",
        schema: validator.query,
        type: "query",
        normalize
      }), validator.query.isOptional && (fnLiteral += "if(isNotEmpty(c.query)){"), validator.query.provider === "standard" ? fnLiteral += `let vaq=validator.query.Check(c.query)
if(vaq instanceof Promise)vaq=await vaq
if(vaq.issues){` + validation.validate("query", void 0, "vaq.issues") + `}else{c.query=vaq.value}
` : validator.query?.schema?.noValidate !== true && (fnLiteral += "if(validator.query.Check(c.query)===false){" + validation.validate("query") + "}"), validator.query.hasTransform && (fnLiteral += coerceTransformDecodeError(
        `c.query=validator.query.Decode(c.query)
`,
        "query",
        allowUnsafeValidationDetails
      ), fnLiteral += coerceTransformDecodeError(
        `c.query=validator.query.Decode(c.query)
`,
        "query",
        allowUnsafeValidationDetails
      )), validator.query.isOptional && (fnLiteral += "}");
    }
    if (hasBody && validator.body) {
      (validator.body.hasTransform || validator.body.isOptional) && (fnLiteral += `const isNotEmptyObject=c.body&&(typeof c.body==="object"&&(isNotEmpty(c.body)||c.body instanceof ArrayBuffer))
`);
      const hasUnion = isUnion(validator.body.schema);
      let hasNonUnionFileWithDefault = false;
      if (validator.body.hasDefault) {
        let value = Default(
          validator.body.schema,
          validator.body.schema.type === "object" || unwrapImportSchema(validator.body.schema)[Kind$2] === "Object" ? {} : void 0
        );
        const schema = unwrapImportSchema(validator.body.schema);
        if (!hasUnion && value && typeof value == "object" && (hasType("File", schema) || hasType("Files", schema))) {
          hasNonUnionFileWithDefault = true;
          for (const [k, v] of Object.entries(value))
            (v === "File" || v === "Files") && delete value[k];
          isNotEmpty(value) || (value = void 0);
        }
        const parsed = typeof value == "object" ? JSON.stringify(value) : typeof value == "string" ? `'${value}'` : value;
        value != null && (Array.isArray(value) ? fnLiteral += `if(!c.body)c.body=${parsed}
` : typeof value == "object" ? fnLiteral += `c.body=Object.assign(${parsed},c.body)
` : fnLiteral += `c.body=${parsed}
`), fnLiteral += composeCleaner({
          name: "c.body",
          schema: validator.body,
          type: "body",
          normalize
        }), validator.body.provider === "standard" ? fnLiteral += `let vab=validator.body.Check(c.body)
if(vab instanceof Promise)vab=await vab
if(vab.issues){` + validation.validate("body", void 0, "vab.issues") + `}else{c.body=vab.value}
` : validator.body?.schema?.noValidate !== true && (validator.body.isOptional ? fnLiteral += "if(isNotEmptyObject&&validator.body.Check(c.body)===false){" + validation.validate("body") + "}" : fnLiteral += "if(validator.body.Check(c.body)===false){" + validation.validate("body") + "}");
      } else
        fnLiteral += composeCleaner({
          name: "c.body",
          schema: validator.body,
          type: "body",
          normalize
        }), validator.body.provider === "standard" ? fnLiteral += `let vab=validator.body.Check(c.body)
if(vab instanceof Promise)vab=await vab
if(vab.issues){` + validation.validate("body", void 0, "vab.issues") + `}else{c.body=vab.value}
` : validator.body?.schema?.noValidate !== true && (validator.body.isOptional ? fnLiteral += "if(isNotEmptyObject&&validator.body.Check(c.body)===false){" + validation.validate("body") + "}" : fnLiteral += "if(validator.body.Check(c.body)===false){" + validation.validate("body") + "}");
      if (validator.body.hasTransform && (fnLiteral += coerceTransformDecodeError(
        `if(isNotEmptyObject)c.body=validator.body.Decode(c.body)
`,
        "body",
        allowUnsafeValidationDetails
      )), hasUnion && validator.body.schema.anyOf?.length) {
        const iterator = Object.values(
          validator.body.schema.anyOf
        );
        for (let i = 0; i < iterator.length; i++) {
          const type = iterator[i];
          if (hasType("File", type) || hasType("Files", type)) {
            const candidate = getSchemaValidator(type, {
              // @ts-expect-error private property
              modules: app.definitions.typebox,
              dynamic: !app.config.aot,
              // @ts-expect-error private property
              models: app.definitions.type,
              normalize: app.config.normalize,
              additionalCoerce: coercePrimitiveRoot(),
              sanitize: () => app.config.sanitize
            });
            if (candidate) {
              const isFirst = fileUnions.length === 0;
              let properties = candidate.schema?.properties ?? type.properties;
              if (!properties && candidate.schema?.anyOf) {
                const objectSchema = candidate.schema.anyOf.find(
                  (s) => s.type === "object" || Kind$2 in s && s[Kind$2] === "Object"
                );
                objectSchema && (properties = objectSchema.properties);
              }
              if (!properties) continue;
              const iterator2 = Object.entries(properties);
              let validator2 = isFirst ? `
` : " else ";
              validator2 += `if(fileUnions[${fileUnions.length}].Check(c.body)){`;
              let validateFile = "", validatorLength = 0;
              for (let i2 = 0; i2 < iterator2.length; i2++) {
                const [k, v] = iterator2[i2];
                !v.extension || v[Kind$2] !== "File" && v[Kind$2] !== "Files" || (validatorLength && (validateFile += ","), validateFile += `fileType(c.body.${k},${JSON.stringify(v.extension)},'body.${k}')`, validatorLength++);
              }
              validateFile && (validatorLength === 1 ? validator2 += `await ${validateFile}
` : validatorLength > 1 && (validator2 += `await Promise.all([${validateFile}])
`), validator2 += "}", fnLiteral += validator2, fileUnions.push(candidate));
            }
          }
        }
      } else if (hasNonUnionFileWithDefault || !hasUnion && (hasType(
        "File",
        unwrapImportSchema(validator.body.schema)
      ) || hasType(
        "Files",
        unwrapImportSchema(validator.body.schema)
      ))) {
        let validateFile = "", i = 0;
        for (const [k, v] of Object.entries(
          unwrapImportSchema(validator.body.schema).properties
        ))
          !v.extension || v[Kind$2] !== "File" && v[Kind$2] !== "Files" || (i && (validateFile += ","), validateFile += `fileType(c.body.${k},${JSON.stringify(v.extension)},'body.${k}')`, i++);
        i && (fnLiteral += `
`), i === 1 ? fnLiteral += `await ${validateFile}
` : i > 1 && (fnLiteral += `await Promise.all([${validateFile}])
`);
      }
    }
    validator.cookie && (validator.cookie.config = mergeCookie(
      validator.cookie.config,
      validator.cookie?.config ?? {}
    ), fnLiteral += `let cookieValue={}
for(const [key,value] of Object.entries(c.cookie))cookieValue[key]=value.value
`, validator.cookie.isOptional && (fnLiteral += "if(isNotEmpty(c.cookie)){"), validator.cookie.provider === "standard" ? (fnLiteral += `let vac=validator.cookie.Check(cookieValue)
if(vac instanceof Promise)vac=await vac
if(vac.issues){` + validation.validate("cookie", void 0, "vac.issues") + `}else{cookieValue=vac.value}
`, fnLiteral += `for(const k of Object.keys(cookieValue))c.cookie[k].value=cookieValue[k]
`) : validator.body?.schema?.noValidate !== true && (fnLiteral += "if(validator.cookie.Check(cookieValue)===false){" + validation.validate("cookie", "cookieValue") + "}", validator.cookie.hasTransform && (fnLiteral += coerceTransformDecodeError(
      "for(const [key,value] of Object.entries(validator.cookie.Decode(cookieValue))){c.cookie[key].cookie.value = value}",
      "cookie",
      allowUnsafeValidationDetails
    ))), validator.cookie.isOptional && (fnLiteral += "}"));
  }
  if (hooks?.beforeHandle || hasTrace) {
    const reporter = report("beforeHandle", {
      total: hooks.beforeHandle?.length
    });
    let hasResolve = false;
    if (hooks.beforeHandle?.length)
      for (let i = 0; i < hooks.beforeHandle.length; i++) {
        const beforeHandle = hooks.beforeHandle[i], endUnit = reporter.resolveChild(beforeHandle.fn.name), returning = hasReturn(beforeHandle);
        if (beforeHandle.subType === "resolve" || beforeHandle.subType === "mapResolve")
          hasResolve || (hasResolve = true, fnLiteral += `
let resolved
`), fnLiteral += isAsync(beforeHandle) ? `resolved=await e.beforeHandle[${i}](c);
` : `resolved=e.beforeHandle[${i}](c);
`, beforeHandle.subType === "mapResolve" ? fnLiteral += "if(resolved instanceof ElysiaCustomStatusResponse){" + mapResponse("resolved") + `}else{resolved.request=c.request
resolved.store=c.store
resolved.qi=c.qi
resolved.path=c.path
resolved.url=c.url
resolved.redirect=c.redirect
resolved.set=c.set
resolved.error=c.error
c=resolved}` : fnLiteral += "if(resolved instanceof ElysiaCustomStatusResponse){" + mapResponse("resolved") + `}else Object.assign(c, resolved)
`, endUnit();
        else if (!returning)
          fnLiteral += isAsync(beforeHandle) ? `await e.beforeHandle[${i}](c)
` : `e.beforeHandle[${i}](c)
`, endUnit();
        else {
          if (fnLiteral += isAsync(beforeHandle) ? `be=await e.beforeHandle[${i}](c)
` : `be=e.beforeHandle[${i}](c)
`, endUnit("be"), fnLiteral += "if(be!==undefined){", reporter.resolve(), hooks.afterHandle?.length || hasTrace) {
            report("handle", {
              name: isHandleFn ? handler.name : void 0
            }).resolve();
            const reporter2 = report("afterHandle", {
              total: hooks.afterHandle?.length
            });
            if (hooks.afterHandle?.length)
              for (let i2 = 0; i2 < hooks.afterHandle.length; i2++) {
                const hook = hooks.afterHandle[i2], returning2 = hasReturn(hook), endUnit2 = reporter2.resolveChild(
                  hook.fn.name
                );
                fnLiteral += `c.response=c.responseValue=be
`, returning2 ? (fnLiteral += isAsync(hook.fn) ? `af=await e.afterHandle[${i2}](c)
` : `af=e.afterHandle[${i2}](c)
`, fnLiteral += `if(af!==undefined) c.response=c.responseValue=be=af
`) : fnLiteral += isAsync(hook.fn) ? `await e.afterHandle[${i2}](c, be)
` : `e.afterHandle[${i2}](c, be)
`, endUnit2("af");
              }
            reporter2.resolve();
          }
          validator.response && (fnLiteral += validation.response("be"));
          const mapResponseReporter = report("mapResponse", {
            total: hooks.mapResponse?.length
          });
          if (hooks.mapResponse?.length) {
            fnLiteral += `c.response=c.responseValue=be
`;
            for (let i2 = 0; i2 < hooks.mapResponse.length; i2++) {
              const mapResponse2 = hooks.mapResponse[i2], endUnit2 = mapResponseReporter.resolveChild(
                mapResponse2.fn.name
              );
              fnLiteral += `if(mr===undefined){mr=${isAsyncName(mapResponse2) ? "await " : ""}e.mapResponse[${i2}](c)
if(mr!==undefined)be=c.response=c.responseValue=mr}`, endUnit2();
            }
          }
          mapResponseReporter.resolve(), fnLiteral += afterResponse(), fnLiteral += encodeCookie(), fnLiteral += `return mapEarlyResponse(${saveResponse}be,c.set${mapResponseContext})}
`;
        }
      }
    reporter.resolve();
  }
  function reportHandler(name) {
    const handleReporter = report("handle", {
      name,
      alias: "reportHandler"
    });
    return () => {
      hasTrace && (fnLiteral += 'if(r&&(r[Symbol.iterator]||r[Symbol.asyncIterator])&&typeof r.next==="function"){' + (maybeAsync ? "" : "(async()=>{") + `const stream=await tee(r,3)
r=stream[0]
const listener=stream[1]
` + (hasTrace || hooks.afterResponse?.length ? `afterHandlerStreamListener=stream[2]
` : "") + `${setImmediateFn}(async ()=>{if(listener)for await(const v of listener){}
`, handleReporter.resolve(), fnLiteral += "})" + (maybeAsync ? "" : "})()") + "}else{", handleReporter.resolve(), fnLiteral += `}
`);
    };
  }
  if (hooks.afterHandle?.length || hasTrace) {
    const resolveHandler = reportHandler(
      isHandleFn ? handler.name : void 0
    );
    hooks.afterHandle?.length ? fnLiteral += isAsyncHandler ? `let r=c.response=c.responseValue=await ${handle}
` : `let r=c.response=c.responseValue=${handle}
` : fnLiteral += isAsyncHandler ? `let r=await ${handle}
` : `let r=${handle}
`, resolveHandler();
    const reporter = report("afterHandle", {
      total: hooks.afterHandle?.length
    });
    if (hooks.afterHandle?.length)
      for (let i = 0; i < hooks.afterHandle.length; i++) {
        const hook = hooks.afterHandle[i], returning = hasReturn(hook), endUnit = reporter.resolveChild(hook.fn.name);
        returning ? (fnLiteral += isAsync(hook.fn) ? `af=await e.afterHandle[${i}](c)
` : `af=e.afterHandle[${i}](c)
`, endUnit("af"), validator.response ? (fnLiteral += "if(af!==undefined){", reporter.resolve(), fnLiteral += validation.response("af"), fnLiteral += "c.response=c.responseValue=af}") : (fnLiteral += "if(af!==undefined){", reporter.resolve(), fnLiteral += "c.response=c.responseValue=af}")) : (fnLiteral += isAsync(hook.fn) ? `await e.afterHandle[${i}](c)
` : `e.afterHandle[${i}](c)
`, endUnit());
      }
    reporter.resolve(), hooks.afterHandle?.length && (fnLiteral += `r=c.response
`), validator.response && (fnLiteral += validation.response()), fnLiteral += encodeCookie();
    const mapResponseReporter = report("mapResponse", {
      total: hooks.mapResponse?.length
    });
    if (hooks.mapResponse?.length)
      for (let i = 0; i < hooks.mapResponse.length; i++) {
        const mapResponse2 = hooks.mapResponse[i], endUnit = mapResponseReporter.resolveChild(
          mapResponse2.fn.name
        );
        fnLiteral += `mr=${isAsyncName(mapResponse2) ? "await " : ""}e.mapResponse[${i}](c)
if(mr!==undefined)r=c.response=c.responseValue=mr
`, endUnit();
      }
    mapResponseReporter.resolve(), fnLiteral += mapResponse();
  } else {
    const resolveHandler = reportHandler(
      isHandleFn ? handler.name : void 0
    );
    if (validator.response || hooks.mapResponse?.length || hasTrace) {
      fnLiteral += isAsyncHandler ? `let r=await ${handle}
` : `let r=${handle}
`, resolveHandler(), validator.response && (fnLiteral += validation.response());
      const mapResponseReporter = report("mapResponse", {
        total: hooks.mapResponse?.length
      });
      if (hooks.mapResponse?.length) {
        fnLiteral += `
c.response=c.responseValue=r
`;
        for (let i = 0; i < hooks.mapResponse.length; i++) {
          const mapResponse2 = hooks.mapResponse[i], endUnit = mapResponseReporter.resolveChild(
            mapResponse2.fn.name
          );
          fnLiteral += `
if(mr===undefined){mr=${isAsyncName(mapResponse2) ? "await " : ""}e.mapResponse[${i}](c)
if(mr!==undefined)r=c.response=c.responseValue=mr}
`, endUnit();
        }
      }
      mapResponseReporter.resolve(), fnLiteral += encodeCookie(), handler instanceof Response ? (fnLiteral += afterResponse(), fnLiteral += inference.set ? `if(isNotEmpty(c.set.headers)||c.set.status!==200||c.set.redirect||c.set.cookie)return mapResponse(${saveResponse}${handle}.clone(),c.set${mapResponseContext})
else return ${handle}.clone()` : `return ${handle}.clone()`, fnLiteral += `
`) : fnLiteral += mapResponse();
    } else if (hasCookie || hasTrace) {
      fnLiteral += isAsyncHandler ? `let r=await ${handle}
` : `let r=${handle}
`, resolveHandler();
      const mapResponseReporter = report("mapResponse", {
        total: hooks.mapResponse?.length
      });
      if (hooks.mapResponse?.length) {
        fnLiteral += `c.response=c.responseValue= r
`;
        for (let i = 0; i < hooks.mapResponse.length; i++) {
          const mapResponse2 = hooks.mapResponse[i], endUnit = mapResponseReporter.resolveChild(
            mapResponse2.fn.name
          );
          fnLiteral += `if(mr===undefined){mr=${isAsyncName(mapResponse2) ? "await " : ""}e.mapResponse[${i}](c)
if(mr!==undefined)r=c.response=c.responseValue=mr}`, endUnit();
        }
      }
      mapResponseReporter.resolve(), fnLiteral += encodeCookie() + mapResponse();
    } else {
      resolveHandler();
      const handled = isAsyncHandler ? `await ${handle}` : handle;
      handler instanceof Response ? (fnLiteral += afterResponse(), fnLiteral += inference.set ? `if(isNotEmpty(c.set.headers)||c.set.status!==200||c.set.redirect||c.set.cookie)return mapResponse(${saveResponse}${handle}.clone(),c.set${mapResponseContext})
else return ${handle}.clone()
` : `return ${handle}.clone()
`) : fnLiteral += mapResponse(handled);
    }
  }
  if (fnLiteral += `
}catch(error){`, !maybeAsync && hooks.error?.length && (fnLiteral += "return(async()=>{"), fnLiteral += `const set=c.set
if(!set.status||set.status<300)set.status=error?.status||500
`, hasCookie && (fnLiteral += encodeCookie()), hasTrace && hooks.trace)
    for (let i = 0; i < hooks.trace.length; i++)
      fnLiteral += `report${i}?.resolve(error);reportChild${i}?.(error)
`;
  const errorReporter = report("error", {
    total: hooks.error?.length
  });
  if (hooks.error?.length) {
    fnLiteral += `c.error=error
`, hasValidation ? fnLiteral += `if(error instanceof TypeBoxError){c.code="VALIDATION"
c.set.status=422}else{c.code=error.code??error[ERROR_CODE]??"UNKNOWN"}` : fnLiteral += `c.code=error.code??error[ERROR_CODE]??"UNKNOWN"
`, fnLiteral += `let er
`, hooks.mapResponse?.length && (fnLiteral += `let mep
`);
    for (let i = 0; i < hooks.error.length; i++) {
      const endUnit = errorReporter.resolveChild(hooks.error[i].fn.name);
      if (isAsync(hooks.error[i]) ? fnLiteral += `er=await e.error[${i}](c)
` : fnLiteral += `er=e.error[${i}](c)
if(er instanceof Promise)er=await er
`, endUnit(), hooks.mapResponse?.length) {
        const mapResponseReporter = report("mapResponse", {
          total: hooks.mapResponse?.length
        });
        for (let i2 = 0; i2 < hooks.mapResponse.length; i2++) {
          const mapResponse2 = hooks.mapResponse[i2], endUnit2 = mapResponseReporter.resolveChild(
            mapResponse2.fn.name
          );
          fnLiteral += `c.response=c.responseValue=er
mep=e.mapResponse[${i2}](c)
if(mep instanceof Promise)er=await er
if(mep!==undefined)er=mep
`, endUnit2();
        }
        mapResponseReporter.resolve();
      }
      if (fnLiteral += `er=mapEarlyResponse(er,set${mapResponseContext})
`, fnLiteral += "if(er){", hasTrace && hooks.trace) {
        for (let i2 = 0; i2 < hooks.trace.length; i2++)
          fnLiteral += `report${i2}.resolve()
`;
        errorReporter.resolve();
      }
      fnLiteral += afterResponse(false), fnLiteral += "return er}";
    }
  }
  errorReporter.resolve(), fnLiteral += "return handleError(c,error,true)", !maybeAsync && hooks.error?.length && (fnLiteral += "})()"), fnLiteral += "}";
  const adapterVariables = adapter.inject ? Object.keys(adapter.inject).join(",") + "," : "";
  let init = "const {handler,handleError,hooks:e, " + allocateIf$1("validator,", hasValidation) + "mapResponse,mapCompactResponse,mapEarlyResponse,isNotEmpty,utils:{" + allocateIf$1("parseQuery,", hasBody) + allocateIf$1("parseQueryFromURL,", hasQuery) + "},error:{" + allocateIf$1("ValidationError,", hasValidation) + allocateIf$1("ParseError", hasBody) + "},fileType,schema,definitions,tee,ERROR_CODE," + allocateIf$1("parseCookie,", hasCookie) + allocateIf$1("signCookie,", hasCookie) + allocateIf$1("decodeURIComponent,", hasQuery) + "ElysiaCustomStatusResponse," + allocateIf$1("ELYSIA_TRACE,", hasTrace) + allocateIf$1("ELYSIA_REQUEST_ID,", hasTrace) + allocateIf$1("parser,", hooks.parse?.length) + allocateIf$1("getServer,", inference.server) + allocateIf$1("fileUnions,", fileUnions.length) + adapterVariables + allocateIf$1("TypeBoxError", hasValidation) + `}=hooks
const trace=e.trace
return ${maybeAsync ? "async " : ""}function handle(c){`;
  hooks.beforeHandle?.length && (init += `let be
`), hooks.afterHandle?.length && (init += `let af
`), hooks.mapResponse?.length && (init += `let mr
`), allowMeta && (init += `c.schema=schema
c.defs=definitions
`), fnLiteral = init + fnLiteral + "}", init = "";
  try {
    return Function(
      "hooks",
      `"use strict";
` + fnLiteral
    )({
      handler,
      hooks: lifeCycleToFn(hooks),
      validator: hasValidation ? validator : void 0,
      // @ts-expect-error
      handleError: app.handleError,
      mapResponse: adapterHandler.mapResponse,
      mapCompactResponse: adapterHandler.mapCompactResponse,
      mapEarlyResponse: adapterHandler.mapEarlyResponse,
      isNotEmpty,
      utils: {
        parseQuery: hasBody ? parseQuery : void 0,
        parseQueryFromURL: hasQuery ? validator.query?.provider === "standard" ? parseQueryStandardSchema : parseQueryFromURL : void 0
      },
      error: {
        ValidationError: hasValidation ? ValidationError : void 0,
        ParseError: hasBody ? ParseError : void 0
      },
      fileType,
      schema: app.router.history,
      // @ts-expect-error
      definitions: app.definitions.type,
      tee,
      ERROR_CODE,
      parseCookie: hasCookie ? parseCookie : void 0,
      signCookie: hasCookie ? signCookie : void 0,
      Cookie: hasCookie ? Cookie : void 0,
      decodeURIComponent: hasQuery ? fastDecodeURIComponent : void 0,
      ElysiaCustomStatusResponse,
      ELYSIA_TRACE: hasTrace ? ELYSIA_TRACE : void 0,
      ELYSIA_REQUEST_ID: hasTrace ? ELYSIA_REQUEST_ID : void 0,
      // @ts-expect-error private property
      getServer: inference.server ? () => app.getServer() : void 0,
      fileUnions: fileUnions.length ? fileUnions : void 0,
      TypeBoxError: hasValidation ? TypeBoxError$1 : void 0,
      parser: app["~parser"],
      ...adapter.inject
    });
  } catch (error) {
    const debugHooks = lifeCycleToFn(hooks);
    return console.log("[Composer] failed to generate optimized handler"), console.log("---"), console.log({
      handler: typeof handler == "function" ? handler.toString() : handler,
      instruction: fnLiteral,
      hooks: {
        ...debugHooks,
        // @ts-ignore
        transform: debugHooks?.transform?.map?.((x) => x.toString()),
        // @ts-ignore
        resolve: debugHooks?.resolve?.map?.((x) => x.toString()),
        // @ts-ignore
        beforeHandle: debugHooks?.beforeHandle?.map?.(
          (x) => x.toString()
        ),
        // @ts-ignore
        afterHandle: debugHooks?.afterHandle?.map?.(
          (x) => x.toString()
        ),
        // @ts-ignore
        mapResponse: debugHooks?.mapResponse?.map?.(
          (x) => x.toString()
        ),
        // @ts-ignore
        parse: debugHooks?.parse?.map?.((x) => x.toString()),
        // @ts-ignore
        error: debugHooks?.error?.map?.((x) => x.toString()),
        // @ts-ignore
        afterResponse: debugHooks?.afterResponse?.map?.(
          (x) => x.toString()
        ),
        // @ts-ignore
        stop: debugHooks?.stop?.map?.((x) => x.toString())
      },
      validator,
      // @ts-expect-error
      definitions: app.definitions.type,
      error
    }), console.log("---"), typeof process?.exit == "function" && process.exit(1), () => new Response("Internal Server Error", { status: 500 });
  }
}, createOnRequestHandler = (app, addFn) => {
  let fnLiteral = "";
  const reporter = createReport({
    trace: app.event.trace,
    addFn: ((word) => {
      fnLiteral += word;
    })
  })("request", {
    total: app.event.request?.length
  });
  if (app.event.request?.length) {
    fnLiteral += "try{";
    for (let i = 0; i < app.event.request.length; i++) {
      const hook = app.event.request[i], withReturn = hasReturn(hook), maybeAsync = isAsync(hook), endUnit = reporter.resolveChild(app.event.request[i].fn.name);
      withReturn ? (fnLiteral += `re=mapEarlyResponse(${maybeAsync ? "await " : ""}onRequest[${i}](c),c.set)
`, endUnit("re"), fnLiteral += `if(re!==undefined)return re
`) : (fnLiteral += `${maybeAsync ? "await " : ""}onRequest[${i}](c)
`, endUnit());
    }
    fnLiteral += "}catch(error){return app.handleError(c,error,false)}";
  }
  return reporter.resolve(), fnLiteral;
}, createHoc = (app, fnName = "map") => {
  const hoc = app.extender.higherOrderFunctions;
  if (!hoc.length) return "return " + fnName;
  const adapter = app["~adapter"].composeGeneralHandler;
  let handler = fnName;
  for (let i = 0; i < hoc.length; i++)
    handler = `hoc[${i}](${handler},${adapter.parameters})`;
  return `return function hocMap(${adapter.parameters}){return ${handler}(${adapter.parameters})}`;
}, composeGeneralHandler = (app) => {
  const adapter = app["~adapter"].composeGeneralHandler;
  app.router.http.build();
  const isWebstandard = app["~adapter"].isWebStandard, hasTrace = app.event.trace?.length;
  let fnLiteral = "";
  const router = app.router;
  let findDynamicRoute = router.http.root.WS ? "const route=router.find(r.method==='GET'&&r.headers.get('upgrade')==='websocket'?'WS':r.method,p)" : "const route=router.find(r.method,p)";
  findDynamicRoute += router.http.root.ALL ? `??router.find('ALL',p)
` : `
`, isWebstandard && (findDynamicRoute += 'if(r.method==="HEAD"){const route=router.find("GET",p);if(route){c.params=route.params;const _res=route.store.handler?route.store.handler(c):route.store.compile()(c);if(_res)return Promise.resolve(_res).then((_res)=>{if(!_res.headers)_res.headers=new Headers();return getResponseLength(_res).then((length)=>{_res.headers.set("content-length", length);return new Response(null,{status:_res.status,statusText:_res.statusText,headers:_res.headers});})});}}');
  let afterResponse = `c.error=notFound
`;
  if (app.event.afterResponse?.length && !app.event.error) {
    afterResponse = `
c.error=notFound
`;
    const prefix = app.event.afterResponse.some(isAsync) ? "async" : "";
    afterResponse += `
${setImmediateFn}(${prefix}()=>{if(c.responseValue instanceof ElysiaCustomStatusResponse) c.set.status=c.responseValue.code
`;
    for (let i = 0; i < app.event.afterResponse.length; i++) {
      const fn2 = app.event.afterResponse[i].fn;
      afterResponse += `
${isAsyncName(fn2) ? "await " : ""}afterResponse[${i}](c)
`;
    }
    afterResponse += `})
`;
  }
  app.inference.query && (afterResponse += `
if(c.qi===-1){c.query={}}else{c.query=parseQueryFromURL(c.url,c.qi+1)}`);
  const error404 = adapter.error404(
    !!app.event.request?.length,
    !!app.event.error?.length,
    afterResponse
  );
  findDynamicRoute += error404.code, findDynamicRoute += `
c.params=route.params
if(route.store.handler)return route.store.handler(c)
return route.store.compile()(c)
`;
  let switchMap = "";
  for (const [path, methods] of Object.entries(router.static)) {
    switchMap += `case'${path}':`, app.config.strictPath !== true && (switchMap += `case'${getLoosePath$1(path)}':`);
    const encoded = encodePath(path);
    path !== encoded && (switchMap += `case'${encoded}':`), switchMap += "switch(r.method){", ("GET" in methods || "WS" in methods) && (switchMap += "case 'GET':", "WS" in methods && (switchMap += `if(r.headers.get('upgrade')==='websocket')return ht[${methods.WS}].composed(c)
`, "GET" in methods || ("ALL" in methods ? switchMap += `return ht[${methods.ALL}].composed(c)
` : switchMap += `break map
`)), "GET" in methods && (switchMap += `return ht[${methods.GET}].composed(c)
`)), isWebstandard && ("GET" in methods || "ALL" in methods) && !("HEAD" in methods) && (switchMap += `case 'HEAD':return Promise.resolve(ht[${methods.GET ?? methods.ALL}].composed(c)).then(_ht=>getResponseLength(_ht).then((length)=>{_ht.headers.set('content-length', length)
return new Response(null,{status:_ht.status,statusText:_ht.statusText,headers:_ht.headers})
}))
`);
    for (const [method, index] of Object.entries(methods))
      method === "ALL" || method === "GET" || method === "WS" || (switchMap += `case '${method}':return ht[${index}].composed(c)
`);
    "ALL" in methods ? switchMap += `default:return ht[${methods.ALL}].composed(c)
` : switchMap += `default:break map
`, switchMap += "}";
  }
  const maybeAsync = !!app.event.request?.some(isAsync), adapterVariables = adapter.inject ? Object.keys(adapter.inject).join(",") + "," : "";
  fnLiteral += `
const {app,mapEarlyResponse,NotFoundError,randomId,handleError,status,redirect,getResponseLength,ElysiaCustomStatusResponse,` + // @ts-ignore
  allocateIf$1("parseQueryFromURL,", app.inference.query) + allocateIf$1("ELYSIA_TRACE,", hasTrace) + allocateIf$1("ELYSIA_REQUEST_ID,", hasTrace) + adapterVariables + `}=data
const store=app.singleton.store
const decorator=app.singleton.decorator
const staticRouter=app.router.static.http
const ht=app.router.history
const router=app.router.http
const trace=app.event.trace?.map(x=>typeof x==='function'?x:x.fn)??[]
const notFound=new NotFoundError()
const hoc=app.extender.higherOrderFunctions.map(x=>x.fn)
`, app.event.request?.length && (fnLiteral += `const onRequest=app.event.request.map(x=>x.fn)
`), app.event.afterResponse?.length && (fnLiteral += `const afterResponse=app.event.afterResponse.map(x=>x.fn)
`), fnLiteral += error404.declare, app.event.trace?.length && (fnLiteral += "const " + app.event.trace.map((_, i) => `tr${i}=app.event.trace[${i}].fn`).join(",") + `
`), fnLiteral += `${maybeAsync ? "async " : ""}function map(${adapter.parameters}){`, app.event.request?.length && (fnLiteral += `let re
`), fnLiteral += adapter.createContext(app), app.event.trace?.length && (fnLiteral += "c[ELYSIA_TRACE]=[" + app.event.trace.map((_, i) => `tr${i}(c)`).join(",") + `]
`), fnLiteral += createOnRequestHandler(app), switchMap && (fnLiteral += `
map: switch(p){
` + switchMap + "}"), fnLiteral += findDynamicRoute + `}
` + createHoc(app);
  const handleError = composeErrorHandler(app);
  app.handleError = handleError;
  const fn = Function(
    "data",
    `"use strict";
` + fnLiteral
  )({
    app,
    mapEarlyResponse: app["~adapter"].handler.mapEarlyResponse,
    NotFoundError,
    randomId,
    handleError,
    status,
    redirect,
    getResponseLength,
    ElysiaCustomStatusResponse,
    // @ts-ignore
    parseQueryFromURL: app.inference.query ? parseQueryFromURL : void 0,
    ELYSIA_TRACE: hasTrace ? ELYSIA_TRACE : void 0,
    ELYSIA_REQUEST_ID: hasTrace ? ELYSIA_REQUEST_ID : void 0,
    ...adapter.inject
  });
  return isBun$1 && Bun.gc(false), fn;
}, composeErrorHandler = (app) => {
  const hooks = app.event;
  let fnLiteral = "";
  const adapter = app["~adapter"].composeError, adapterVariables = adapter.inject ? Object.keys(adapter.inject).join(",") + "," : "", hasTrace = !!app.event.trace?.length;
  fnLiteral += "const {mapResponse,ERROR_CODE,ElysiaCustomStatusResponse,ValidationError,TransformDecodeError," + allocateIf$1("onError,", app.event.error) + allocateIf$1("afterResponse,", app.event.afterResponse) + allocateIf$1("trace,", app.event.trace) + allocateIf$1("onMapResponse,", app.event.mapResponse) + allocateIf$1("ELYSIA_TRACE,", hasTrace) + allocateIf$1("ELYSIA_REQUEST_ID,", hasTrace) + adapterVariables + `}=inject
`, fnLiteral += "return async function(context,error,skipGlobal){", fnLiteral += "", hasTrace && (fnLiteral += `const id=context[ELYSIA_REQUEST_ID]
`);
  const report = createReport({
    context: "context",
    trace: hooks.trace,
    addFn: (word) => {
      fnLiteral += word;
    }
  }), afterResponse = () => {
    if (!hooks.afterResponse?.length && !hasTrace) return "";
    let afterResponse2 = "";
    const prefix = hooks.afterResponse?.some(isAsync) ? "async" : "";
    afterResponse2 += `
${setImmediateFn}(${prefix}()=>{`;
    const reporter = createReport({
      context: "context",
      trace: hooks.trace,
      addFn: (word) => {
        afterResponse2 += word;
      }
    })("afterResponse", {
      total: hooks.afterResponse?.length,
      name: "context"
    });
    if (hooks.afterResponse?.length && hooks.afterResponse)
      for (let i = 0; i < hooks.afterResponse.length; i++) {
        const fn = hooks.afterResponse[i].fn, endUnit = reporter.resolveChild(fn.name);
        afterResponse2 += `
${isAsyncName(fn) ? "await " : ""}afterResponse[${i}](context)
`, endUnit();
      }
    return reporter.resolve(), afterResponse2 += `})
`, afterResponse2;
  };
  fnLiteral += `const set=context.set
let _r
if(!context.code)context.code=error.code??error[ERROR_CODE]
if(!(context.error instanceof Error))context.error=error
if(error instanceof ElysiaCustomStatusResponse){set.status=error.status=error.code
error.message=error.response}`, adapter.declare && (fnLiteral += adapter.declare);
  const saveResponse = hasTrace || hooks.afterResponse?.length ? "context.response = " : "";
  if (fnLiteral += `if(typeof error?.toResponse==='function'&&!(error instanceof ValidationError)&&!(error instanceof TransformDecodeError)){try{let raw=error.toResponse()
if(typeof raw?.then==='function')raw=await raw
if(raw instanceof Response)set.status=raw.status
context.response=context.responseValue=raw
}catch(toResponseError){
}
}
`, app.event.error)
    for (let i = 0; i < app.event.error.length; i++) {
      const handler = app.event.error[i], response = `${isAsync(handler) ? "await " : ""}onError[${i}](context)
`;
      if (fnLiteral += "if(skipGlobal!==true&&!context.response){", hasReturn(handler)) {
        fnLiteral += `_r=${response}
if(_r!==undefined){if(_r instanceof Response){` + afterResponse() + `return mapResponse(_r,set${adapter.mapResponseContext})}if(_r instanceof ElysiaCustomStatusResponse){error.status=error.code
error.message=error.response}if(set.status===200||!set.status)set.status=error.status
`;
        const mapResponseReporter2 = report("mapResponse", {
          total: hooks.mapResponse?.length,
          name: "context"
        });
        if (hooks.mapResponse?.length)
          for (let i2 = 0; i2 < hooks.mapResponse.length; i2++) {
            const mapResponse = hooks.mapResponse[i2], endUnit = mapResponseReporter2.resolveChild(
              mapResponse.fn.name
            );
            fnLiteral += `context.response=context.responseValue=_r
_r=${isAsyncName(mapResponse) ? "await " : ""}onMapResponse[${i2}](context)
`, endUnit();
          }
        mapResponseReporter2.resolve(), fnLiteral += afterResponse() + `return mapResponse(${saveResponse}_r,set${adapter.mapResponseContext})}`;
      } else fnLiteral += response;
      fnLiteral += "}";
    }
  fnLiteral += `if(error instanceof ValidationError||error instanceof TransformDecodeError){
if(error.error)error=error.error
set.status=error.status??422
` + afterResponse() + adapter.validationError + `
}
`, fnLiteral += "if(!context.response&&error instanceof Error){" + afterResponse() + adapter.unknownError + `
}`;
  const mapResponseReporter = report("mapResponse", {
    total: hooks.mapResponse?.length,
    name: "context"
  });
  if (fnLiteral += `
if(!context.response)context.response=context.responseValue=error.message??error
`, hooks.mapResponse?.length) {
    fnLiteral += `let mr
`;
    for (let i = 0; i < hooks.mapResponse.length; i++) {
      const mapResponse = hooks.mapResponse[i], endUnit = mapResponseReporter.resolveChild(
        mapResponse.fn.name
      );
      fnLiteral += `if(mr===undefined){mr=${isAsyncName(mapResponse) ? "await " : ""}onMapResponse[${i}](context)
if(mr!==undefined)error=context.response=context.responseValue=mr}`, endUnit();
    }
  }
  mapResponseReporter.resolve(), fnLiteral += afterResponse() + `
return mapResponse(${saveResponse}error,set${adapter.mapResponseContext})}`;
  const mapFn = (x) => typeof x == "function" ? x : x.fn;
  return Function(
    "inject",
    `"use strict";
` + fnLiteral
  )({
    mapResponse: app["~adapter"].handler.mapResponse,
    ERROR_CODE,
    ElysiaCustomStatusResponse,
    ValidationError,
    TransformDecodeError,
    onError: app.event.error?.map(mapFn),
    afterResponse: app.event.afterResponse?.map(mapFn),
    trace: app.event.trace?.map(mapFn),
    onMapResponse: app.event.mapResponse?.map(mapFn),
    ELYSIA_TRACE: hasTrace ? ELYSIA_TRACE : void 0,
    ELYSIA_REQUEST_ID: hasTrace ? ELYSIA_REQUEST_ID : void 0,
    ...adapter.inject
  });
};

function isCloudflareWorker$1() {
  try {
    if (
      // @ts-ignore
      typeof caches < "u" && // @ts-ignore
      typeof caches.default < "u" || typeof WebSocketPair < "u"
    ) return !0;
  } catch {
    return false;
  }
  return false;
}
const CloudflareAdapter = {
  ...WebStandardAdapter,
  name: "cloudflare-worker",
  composeGeneralHandler: {
    ...WebStandardAdapter.composeGeneralHandler,
    error404(hasEventHook, hasErrorHook, afterHandle) {
      const { code } = WebStandardAdapter.composeGeneralHandler.error404(
        hasEventHook,
        hasErrorHook,
        afterHandle
      );
      return {
        code,
        declare: hasErrorHook ? "" : (
          // This only work because Elysia only clone the Response via .clone()
          `const error404Message=notFound.message.toString()
const error404={clone:()=>new Response(error404Message,{status:404})}
`
        )
      };
    }
  },
  beforeCompile(app) {
    app.handleError = composeErrorHandler(app);
    for (const route of app.routes) route.compile();
  },
  listen() {
    return () => {
      console.warn(
        "Cloudflare Worker does not support listen method. Please export default Elysia instance instead."
      );
    };
  }
};

const separateFunction = (code) => {
  code.startsWith("async") && (code = code.slice(5)), code = code.trimStart();
  let index = -1;
  if (code.charCodeAt(0) === 40 && (index = code.indexOf("=>", code.indexOf(")")), index !== -1)) {
    let bracketEndIndex = index;
    for (; bracketEndIndex > 0 && code.charCodeAt(--bracketEndIndex) !== 41; )
      ;
    let body = code.slice(index + 2);
    return body.charCodeAt(0) === 32 && (body = body.trimStart()), [
      code.slice(1, bracketEndIndex),
      body,
      {
        isArrowReturn: body.charCodeAt(0) !== 123
      }
    ];
  }
  if (/^(\w+)=>/g.test(code) && (index = code.indexOf("=>"), index !== -1)) {
    let body = code.slice(index + 2);
    return body.charCodeAt(0) === 32 && (body = body.trimStart()), [
      code.slice(0, index),
      body,
      {
        isArrowReturn: body.charCodeAt(0) !== 123
      }
    ];
  }
  if (code.startsWith("function")) {
    index = code.indexOf("(");
    const end = code.indexOf(")");
    return [
      code.slice(index + 1, end),
      code.slice(end + 2),
      {
        isArrowReturn: false
      }
    ];
  }
  const start = code.indexOf("(");
  if (start !== -1) {
    const sep = code.indexOf(`
`, 2), parameter = code.slice(0, sep), end = parameter.lastIndexOf(")") + 1, body = code.slice(sep + 1);
    return [
      parameter.slice(start, end),
      "{" + body,
      {
        isArrowReturn: false
      }
    ];
  }
  const x = code.split(`
`, 2);
  return [x[0], x[1], { isArrowReturn: false }];
}, bracketPairRange = (parameter) => {
  const start = parameter.indexOf("{");
  if (start === -1) return [-1, 0];
  let end = start + 1, deep = 1;
  for (; end < parameter.length; end++) {
    const char = parameter.charCodeAt(end);
    if (char === 123 ? deep++ : char === 125 && deep--, deep === 0) break;
  }
  return deep !== 0 ? [0, parameter.length] : [start, end + 1];
}, bracketPairRangeReverse = (parameter) => {
  const end = parameter.lastIndexOf("}");
  if (end === -1) return [-1, 0];
  let start = end - 1, deep = 1;
  for (; start >= 0; start--) {
    const char = parameter.charCodeAt(start);
    if (char === 125 ? deep++ : char === 123 && deep--, deep === 0) break;
  }
  return deep !== 0 ? [-1, 0] : [start, end + 1];
}, removeColonAlias = (parameter) => {
  for (; ; ) {
    const start = parameter.indexOf(":");
    if (start === -1) break;
    let end = parameter.indexOf(",", start);
    end === -1 && (end = parameter.indexOf("}", start) - 1), end === -2 && (end = parameter.length), parameter = parameter.slice(0, start) + parameter.slice(end);
  }
  return parameter;
}, retrieveRootParamters = (parameter) => {
  let hasParenthesis = false;
  parameter.charCodeAt(0) === 40 && (parameter = parameter.slice(1, -1)), parameter.charCodeAt(0) === 123 && (hasParenthesis = true, parameter = parameter.slice(1, -1)), parameter = parameter.replace(/( |\t|\n)/g, "").trim();
  let parameters = [];
  for (; ; ) {
    let [start, end] = bracketPairRange(parameter);
    if (start === -1) break;
    parameters.push(parameter.slice(0, start - 1)), parameter.charCodeAt(end) === 44 && end++, parameter = parameter.slice(end);
  }
  parameter = removeColonAlias(parameter), parameter && (parameters = parameters.concat(parameter.split(",")));
  const parameterMap = /* @__PURE__ */ Object.create(null);
  for (const p of parameters) {
    if (p.indexOf(",") === -1) {
      parameterMap[p] = true;
      continue;
    }
    for (const q of p.split(",")) parameterMap[q.trim()] = true;
  }
  return {
    hasParenthesis,
    parameters: parameterMap
  };
}, findParameterReference = (parameter, inference) => {
  const { parameters, hasParenthesis } = retrieveRootParamters(parameter);
  return parameters.query && (inference.query = true), parameters.headers && (inference.headers = true), parameters.body && (inference.body = true), parameters.cookie && (inference.cookie = true), parameters.set && (inference.set = true), parameters.server && (inference.server = true), parameters.route && (inference.route = true), parameters.url && (inference.url = true), parameters.path && (inference.path = true), hasParenthesis ? `{ ${Object.keys(parameters).join(", ")} }` : Object.keys(parameters).join(", ");
}, findEndIndex = (type, content, index) => {
  const regex = new RegExp(
    `${type.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\n\\t,; ]`
  );
  const match = regex.exec(content);
  return match ? match.index : -1;
}, findAlias = (type, body, depth = 0) => {
  if (depth > 5) return [];
  const aliases = [];
  let content = body;
  for (; ; ) {
    let index = findEndIndex(" = " + type, content);
    if (index === -1 && (index = findEndIndex("=" + type, content)), index === -1) {
      let lastIndex = content.indexOf(" = " + type);
      if (lastIndex === -1 && (lastIndex = content.indexOf("=" + type)), lastIndex + 3 + type.length !== content.length) break;
      index = lastIndex;
    }
    const part = content.slice(0, index), lastPart = part.lastIndexOf(" ");
    let variable = part.slice(lastPart !== -1 ? lastPart + 1 : -1);
    if (variable === "}") {
      const [start, end] = bracketPairRangeReverse(part);
      aliases.push(removeColonAlias(content.slice(start, end))), content = content.slice(index + 3 + type.length);
      continue;
    }
    for (; variable.charCodeAt(0) === 44; ) variable = variable.slice(1);
    for (; variable.charCodeAt(0) === 9; ) variable = variable.slice(1);
    variable.includes("(") || aliases.push(variable), content = content.slice(index + 3 + type.length);
  }
  for (const alias of aliases) {
    if (alias.charCodeAt(0) === 123) continue;
    const deepAlias = findAlias(alias, body);
    deepAlias.length > 0 && aliases.push(...deepAlias);
  }
  return aliases;
}, extractMainParameter = (parameter) => {
  if (!parameter) return;
  if (parameter.charCodeAt(0) !== 123) return parameter;
  if (parameter = parameter.slice(2, -2), !parameter.includes(","))
    return parameter.indexOf("...") !== -1 ? parameter.slice(parameter.indexOf("...") + 3) : void 0;
  const spreadIndex = parameter.indexOf("...");
  if (spreadIndex !== -1)
    return parameter.slice(spreadIndex + 3).trimEnd();
}, inferBodyReference = (code, aliases, inference) => {
  const access = (type, alias) => new RegExp(
    `${alias}\\.(${type})|${alias}\\["${type}"\\]|${alias}\\['${type}'\\]`
  ).test(code);
  for (const alias of aliases)
    if (alias) {
      if (alias.charCodeAt(0) === 123) {
        const parameters = retrieveRootParamters(alias).parameters;
        parameters.query && (inference.query = true), parameters.headers && (inference.headers = true), parameters.body && (inference.body = true), parameters.cookie && (inference.cookie = true), parameters.set && (inference.set = true), parameters.server && (inference.server = true), parameters.url && (inference.url = true), parameters.route && (inference.route = true), parameters.path && (inference.path = true);
        continue;
      }
      if (!inference.query && (access("query", alias) || code.includes("return " + alias) || code.includes("return " + alias + ".query")) && (inference.query = true), !inference.headers && access("headers", alias) && (inference.headers = true), !inference.body && access("body", alias) && (inference.body = true), !inference.cookie && access("cookie", alias) && (inference.cookie = true), !inference.set && access("set", alias) && (inference.set = true), !inference.server && access("server", alias) && (inference.server = true), !inference.route && access("route", alias) && (inference.route = true), !inference.url && access("url", alias) && (inference.url = true), !inference.path && access("path", alias) && (inference.path = true), inference.query && inference.headers && inference.body && inference.cookie && inference.set && inference.server && inference.route && inference.url && inference.path)
        break;
    }
  return aliases;
}, isContextPassToFunction = (context, body, inference) => {
  try {
    const captureFunction = new RegExp(
      `\\w\\((?:.*?)?${context}(?:.*?)?\\)`,
      "gs"
    ), exactParameter = new RegExp(`${context}(,|\\))`, "gs"), length = body.length;
    let fn;
    for (fn = captureFunction.exec(body) + ""; captureFunction.lastIndex !== 0 && captureFunction.lastIndex < length + (fn ? fn.length : 0); ) {
      if (fn && exactParameter.test(fn))
        return inference.query = !0, inference.headers = !0, inference.body = !0, inference.cookie = !0, inference.set = !0, inference.server = !0, inference.url = !0, inference.route = !0, inference.path = !0, !0;
      fn = captureFunction.exec(body) + "";
    }
    const nextChar = body.charCodeAt(captureFunction.lastIndex);
    return nextChar === 41 || nextChar === 44 ? (inference.query = !0, inference.headers = !0, inference.body = !0, inference.cookie = !0, inference.set = !0, inference.server = !0, inference.url = !0, inference.route = !0, inference.path = !0, !0) : !1;
  } catch {
    return console.log(
      "[Sucrose] warning: unexpected isContextPassToFunction error, you may continue development as usual but please report the following to maintainers:"
    ), console.log("--- body ---"), console.log(body), console.log("--- context ---"), console.log(context), true;
  }
};
let pendingGC, caches$1 = {};
const clearSucroseCache = (delay) => {
  delay === null || isCloudflareWorker$1() || (delay === void 0 && (delay = 4 * 60 * 1e3 + 55 * 1e3), pendingGC && clearTimeout(pendingGC), pendingGC = setTimeout(() => {
    caches$1 = {}, pendingGC = void 0, isBun$1 && Bun.gc(false);
  }, delay), pendingGC.unref?.());
}, mergeInference = (a, b) => ({
  body: a.body || b.body,
  cookie: a.cookie || b.cookie,
  headers: a.headers || b.headers,
  query: a.query || b.query,
  set: a.set || b.set,
  server: a.server || b.server,
  url: a.url || b.url,
  route: a.route || b.route,
  path: a.path || b.path
}), sucrose = (lifeCycle, inference = {
  query: false,
  headers: false,
  body: false,
  cookie: false,
  set: false,
  server: false,
  url: false,
  route: false,
  path: false
}, settings = {}) => {
  const events = [];
  lifeCycle.request?.length && events.push(...lifeCycle.request), lifeCycle.beforeHandle?.length && events.push(...lifeCycle.beforeHandle), lifeCycle.parse?.length && events.push(...lifeCycle.parse), lifeCycle.error?.length && events.push(...lifeCycle.error), lifeCycle.transform?.length && events.push(...lifeCycle.transform), lifeCycle.afterHandle?.length && events.push(...lifeCycle.afterHandle), lifeCycle.mapResponse?.length && events.push(...lifeCycle.mapResponse), lifeCycle.afterResponse?.length && events.push(...lifeCycle.afterResponse), lifeCycle.handler && typeof lifeCycle.handler == "function" && events.push(lifeCycle.handler);
  for (let i = 0; i < events.length; i++) {
    const e = events[i];
    if (!e) continue;
    const event = typeof e == "object" ? e.fn : e;
    if (typeof event != "function") continue;
    const content = event.toString(), key = checksum(content), cachedInference = caches$1[key];
    if (cachedInference) {
      inference = mergeInference(inference, cachedInference);
      continue;
    }
    clearSucroseCache(settings.gcTime);
    const fnInference = {
      query: false,
      headers: false,
      body: false,
      cookie: false,
      set: false,
      server: false,
      url: false,
      route: false,
      path: false
    }, [parameter, body] = separateFunction(content), rootParameters = findParameterReference(parameter, fnInference), mainParameter = extractMainParameter(rootParameters);
    if (mainParameter) {
      const aliases = findAlias(mainParameter, body.slice(1, -1));
      aliases.splice(0, -1, mainParameter);
      let code = body;
      code.charCodeAt(0) === 123 && code.charCodeAt(body.length - 1) === 125 && (code = code.slice(1, -1).trim()), isContextPassToFunction(mainParameter, code, fnInference) || inferBodyReference(code, aliases, fnInference), !fnInference.query && code.includes("return " + mainParameter + ".query") && (fnInference.query = true);
    }
    if (caches$1[key] || (caches$1[key] = fnInference), inference = mergeInference(inference, fnInference), inference.query && inference.headers && inference.body && inference.cookie && inference.set && inference.server && inference.url && inference.route && inference.path)
      break;
  }
  return inference;
};

const mapResponse = (response, set, request) => {
  if (isNotEmpty(set.headers) || set.status !== 200 || set.cookie)
    switch (handleSet(set), response?.constructor?.name) {
      case "String":
        return new Response(response, set);
      case "Array":
      case "Object":
        return set.headers["content-type"] = "application/json", new Response(JSON.stringify(response), set);
      case "ElysiaFile":
        return handleFile(response.value, set);
      case "File":
        return handleFile(response, set);
      case "Blob":
        return handleFile(response, set);
      case "ElysiaCustomStatusResponse":
        return set.status = response.code, mapResponse(
          response.response,
          set,
          request
        );
      case void 0:
        return response ? new Response(JSON.stringify(response), set) : new Response("", set);
      case "Response":
        return handleResponse(response, set, request);
      case "Error":
        return errorToResponse(response, set);
      case "Promise":
        return response.then(
          (x) => mapResponse(x, set, request)
        );
      case "Function":
        return mapResponse(response(), set, request);
      case "Number":
      case "Boolean":
        return new Response(
          response.toString(),
          set
        );
      case "Cookie":
        return response instanceof Cookie ? new Response(response.value, set) : new Response(response?.toString(), set);
      case "FormData":
        return new Response(response, set);
      default:
        if (response instanceof Response)
          return handleResponse(response, set, request);
        if (response instanceof Promise)
          return response.then((x) => mapResponse(x, set));
        if (response instanceof Error)
          return errorToResponse(response, set);
        if (response instanceof ElysiaCustomStatusResponse)
          return set.status = response.code, mapResponse(
            response.response,
            set,
            request
          );
        if (
          // @ts-expect-error
          typeof response?.next == "function" || response instanceof ReadableStream
        )
          return handleStream(response, set, request);
        if (typeof response?.then == "function")
          return response.then((x) => mapResponse(x, set));
        if (typeof response?.toResponse == "function")
          return mapResponse(response.toResponse(), set);
        if ("charCodeAt" in response) {
          const code = response.charCodeAt(0);
          if (code === 123 || code === 91)
            return set.headers["Content-Type"] || (set.headers["Content-Type"] = "application/json"), new Response(
              JSON.stringify(response),
              set
            );
        }
        return new Response(response, set);
    }
  return (
    // @ts-expect-error
    typeof response?.next == "function" || response instanceof ReadableStream ? handleStream(response, set, request) : mapCompactResponse(response, request)
  );
}, mapEarlyResponse = (response, set, request) => {
  if (response != null)
    if (isNotEmpty(set.headers) || set.status !== 200 || set.cookie)
      switch (handleSet(set), response?.constructor?.name) {
        case "String":
          return new Response(response, set);
        case "Array":
        case "Object":
          return set.headers["content-type"] = "application/json", new Response(JSON.stringify(response), set);
        case "ElysiaFile":
          return handleFile(response.value, set);
        case "File":
          return handleFile(response, set);
        case "Blob":
          return handleFile(response, set);
        case "ElysiaCustomStatusResponse":
          return set.status = response.code, mapEarlyResponse(
            response.response,
            set,
            request
          );
        case void 0:
          return response ? new Response(JSON.stringify(response), set) : void 0;
        case "Response":
          return handleResponse(response, set, request);
        case "Promise":
          return response.then(
            (x) => mapEarlyResponse(x, set)
          );
        case "Error":
          return errorToResponse(response, set);
        case "Function":
          return mapEarlyResponse(response(), set);
        case "Number":
        case "Boolean":
          return new Response(
            response.toString(),
            set
          );
        case "FormData":
          return new Response(response);
        case "Cookie":
          return response instanceof Cookie ? new Response(response.value, set) : new Response(response?.toString(), set);
        default:
          if (response instanceof Response)
            return handleResponse(response, set, request);
          if (response instanceof Promise)
            return response.then((x) => mapEarlyResponse(x, set));
          if (response instanceof Error)
            return errorToResponse(response, set);
          if (response instanceof ElysiaCustomStatusResponse)
            return set.status = response.code, mapEarlyResponse(
              response.response,
              set,
              request
            );
          if (
            // @ts-expect-error
            typeof response?.next == "function" || response instanceof ReadableStream
          )
            return handleStream(response, set, request);
          if (typeof response?.then == "function")
            return response.then(
              (x) => mapEarlyResponse(x, set)
            );
          if (typeof response?.toResponse == "function")
            return mapEarlyResponse(response.toResponse(), set);
          if ("charCodeAt" in response) {
            const code = response.charCodeAt(0);
            if (code === 123 || code === 91)
              return set.headers["Content-Type"] || (set.headers["Content-Type"] = "application/json"), new Response(
                JSON.stringify(response),
                set
              );
          }
          return new Response(response, set);
      }
    else
      switch (response?.constructor?.name) {
        case "String":
          return new Response(response);
        case "Array":
        case "Object":
          return set.headers["content-type"] = "application/json", new Response(JSON.stringify(response), set);
        case "ElysiaFile":
          return handleFile(response.value, set);
        case "File":
          return handleFile(response, set);
        case "Blob":
          return handleFile(response, set);
        case "ElysiaCustomStatusResponse":
          return set.status = response.code, mapEarlyResponse(
            response.response,
            set,
            request
          );
        case void 0:
          return response ? new Response(JSON.stringify(response), {
            headers: {
              "content-type": "application/json"
            }
          }) : new Response("");
        case "Response":
          return response;
        case "Promise":
          return response.then((x) => {
            const r = mapEarlyResponse(x, set);
            if (r !== void 0) return r;
          });
        case "Error":
          return errorToResponse(response, set);
        case "Function":
          return mapCompactResponse(response(), request);
        case "Number":
        case "Boolean":
          return new Response(response.toString());
        case "Cookie":
          return response instanceof Cookie ? new Response(response.value, set) : new Response(response?.toString(), set);
        case "FormData":
          return new Response(response);
        default:
          if (response instanceof Response) return response;
          if (response instanceof Promise)
            return response.then((x) => mapEarlyResponse(x, set));
          if (response instanceof Error)
            return errorToResponse(response, set);
          if (response instanceof ElysiaCustomStatusResponse)
            return set.status = response.code, mapEarlyResponse(
              response.response,
              set,
              request
            );
          if (
            // @ts-expect-error
            typeof response?.next == "function" || response instanceof ReadableStream
          )
            return handleStream(response, set, request);
          if (typeof response?.then == "function")
            return response.then(
              (x) => mapEarlyResponse(x, set)
            );
          if (typeof response?.toResponse == "function")
            return mapEarlyResponse(response.toResponse(), set);
          if ("charCodeAt" in response) {
            const code = response.charCodeAt(0);
            if (code === 123 || code === 91)
              return set.headers["Content-Type"] || (set.headers["Content-Type"] = "application/json"), new Response(
                JSON.stringify(response),
                set
              );
          }
          return new Response(response);
      }
}, mapCompactResponse = (response, request) => {
  switch (response?.constructor?.name) {
    case "String":
      return new Response(response);
    case "Object":
    case "Array":
      return new Response(JSON.stringify(response), {
        headers: {
          "Content-Type": "application/json"
        }
      });
    case "ElysiaFile":
      return handleFile(response.value);
    case "File":
      return handleFile(response);
    case "Blob":
      return handleFile(response);
    case "ElysiaCustomStatusResponse":
      return mapResponse(
        response.response,
        {
          status: response.code,
          headers: {}
        }
      );
    case void 0:
      return response ? new Response(JSON.stringify(response), {
        headers: {
          "content-type": "application/json"
        }
      }) : new Response("");
    case "Response":
      return response;
    case "Error":
      return errorToResponse(response);
    case "Promise":
      return response.then(
        (x) => mapCompactResponse(x, request)
      );
    // ? Maybe response or Blob
    case "Function":
      return mapCompactResponse(response(), request);
    case "Number":
    case "Boolean":
      return new Response(response.toString());
    case "FormData":
      return new Response(response);
    default:
      if (response instanceof Response) return response;
      if (response instanceof Promise)
        return response.then(
          (x) => mapCompactResponse(x, request)
        );
      if (response instanceof Error)
        return errorToResponse(response);
      if (response instanceof ElysiaCustomStatusResponse)
        return mapResponse(
          response.response,
          {
            status: response.code,
            headers: {}
          }
        );
      if (
        // @ts-expect-error
        typeof response?.next == "function" || response instanceof ReadableStream
      )
        return handleStream(response, void 0, request);
      if (typeof response?.then == "function")
        return response.then(
          (x) => mapCompactResponse(x, request)
        );
      if (typeof response?.toResponse == "function")
        return mapCompactResponse(response.toResponse());
      if ("charCodeAt" in response) {
        const code = response.charCodeAt(0);
        if (code === 123 || code === 91)
          return new Response(JSON.stringify(response), {
            headers: {
              "Content-Type": "application/json"
            }
          });
      }
      return new Response(response);
  }
}, errorToResponse = (error, set) => {
  if (typeof error?.toResponse == "function") {
    const raw = error.toResponse(), targetSet = set ?? { headers: {}, status: 200, redirect: "" }, apply = (resolved) => (resolved instanceof Response && (targetSet.status = resolved.status), mapResponse(resolved, targetSet));
    return typeof raw?.then == "function" ? raw.then(apply) : apply(raw);
  }
  return new Response(
    JSON.stringify({
      name: error?.name,
      message: error?.message,
      cause: error?.cause
    }),
    {
      status: set?.status !== 200 ? set?.status ?? 500 : 500,
      headers: set?.headers
    }
  );
}, createStaticHandler = (handle, hooks, setHeaders = {}) => {
  if (typeof handle == "function") return;
  const response = mapResponse(handle, {
    headers: setHeaders
  });
  if (!hooks.parse?.length && !hooks.transform?.length && !hooks.beforeHandle?.length && !hooks.afterHandle?.length)
    return () => response.clone();
}, handleResponse = createResponseHandler({
  mapResponse,
  mapCompactResponse
}), handleStream = createStreamHandler({
  mapResponse,
  mapCompactResponse
});

const allocateIf = (value, condition) => condition ? value : "", createContext = (app, route, inference, isInline = false) => {
  let fnLiteral = "";
  const defaultHeaders = app.setHeaders, hasTrace = !!app.event.trace?.length;
  hasTrace && (fnLiteral += `const id=randomId()
`);
  const isDynamic = /[:*]/.test(route.path), getQi = `const u=request.url,s=u.indexOf('/',${app.config.handler?.standardHostname ?? true ? 11 : 7}),qi=u.indexOf('?',s+1)
`, needsQuery = inference.query || !!route.hooks.query || !!route.hooks.standaloneValidator?.find(
    (x) => x.query
  ) || app.event.request?.length;
  needsQuery && (fnLiteral += getQi);
  const getPath = inference.path ? isDynamic ? "get path(){" + (needsQuery ? "" : getQi) + `if(qi===-1)return u.substring(s)
return u.substring(s,qi)
},` : `path:'${route.path}',` : "";
  fnLiteral += allocateIf("const c=", !isInline) + "{request,store," + allocateIf("qi,", needsQuery) + allocateIf("params:request.params,", isDynamic) + getPath + allocateIf(
    "url:request.url,",
    hasTrace || inference.url || needsQuery
  ) + "redirect,status,set:{headers:" + (isNotEmpty(defaultHeaders) ? "Object.assign({},app.setHeaders)" : "Object.create(null)") + ",status:200}", inference.server && (fnLiteral += ",get server(){return app.getServer()}"), hasTrace && (fnLiteral += ",[ELYSIA_REQUEST_ID]:id");
  {
    let decoratorsLiteral = "";
    for (const key of Object.keys(app.singleton.decorator))
      decoratorsLiteral += `,'${key}':decorator['${key}']`;
    fnLiteral += decoratorsLiteral;
  }
  return fnLiteral += `}
`, fnLiteral;
}, createBunRouteHandler = (app, route) => {
  const hasTrace = !!app.event.trace?.length, hasHoc = !!app.extender.higherOrderFunctions.length;
  let inference = sucrose(
    route.hooks,
    // @ts-expect-error
    app.inference
  );
  inference = sucrose(
    {
      handler: route.handler
    },
    inference
  );
  let fnLiteral = "const handler=data.handler,app=data.app,store=data.store,decorator=data.decorator,redirect=data.redirect,route=data.route,mapEarlyResponse=data.mapEarlyResponse," + allocateIf("randomId=data.randomId,", hasTrace) + allocateIf("ELYSIA_REQUEST_ID=data.ELYSIA_REQUEST_ID,", hasTrace) + allocateIf("ELYSIA_TRACE=data.ELYSIA_TRACE,", hasTrace) + allocateIf("trace=data.trace,", hasTrace) + allocateIf("hoc=data.hoc,", hasHoc) + `status=data.status
`;
  app.event.request?.length && (fnLiteral += `const onRequest=app.event.request.map(x=>x.fn)
`), fnLiteral += `${app.event.request?.find(isAsync) ? "async" : ""} function map(request){`;
  const needsQuery = inference.query || !!route.hooks.query || !!route.hooks.standaloneValidator?.find(
    (x) => x.query
  );
  return hasTrace || needsQuery || app.event.request?.length ? (fnLiteral += createContext(app, route, inference), fnLiteral += createOnRequestHandler(app), fnLiteral += "return handler(c)}") : fnLiteral += `return handler(${createContext(app, route, inference, true)})}`, fnLiteral += createHoc(app), Function(
    "data",
    fnLiteral
  )({
    app,
    handler: route.compile?.() ?? route.composed,
    redirect,
    status,
    // @ts-expect-error private property
    hoc: app.extender.higherOrderFunctions.map((x) => x.fn),
    store: app.store,
    decorator: app.decorator,
    route: route.path,
    randomId: hasTrace ? randomId : void 0,
    ELYSIA_TRACE: hasTrace ? ELYSIA_TRACE : void 0,
    ELYSIA_REQUEST_ID: hasTrace ? ELYSIA_REQUEST_ID : void 0,
    trace: hasTrace ? app.event.trace?.map((x) => x?.fn ?? x) : void 0,
    mapEarlyResponse
  });
};

const createNativeStaticHandler = (handle, hooks, set) => {
  if (typeof handle == "function" || handle instanceof Blob) return;
  if (isHTMLBundle(handle)) return () => handle;
  const response = mapResponse(
    handle,
    set ?? {
      headers: {}
    }
  );
  if (!hooks.parse?.length && !hooks.transform?.length && !hooks.beforeHandle?.length && !hooks.afterHandle?.length)
    return response instanceof Promise ? response.then((response2) => {
      if (response2)
        return response2.headers.has("content-type") || response2.headers.append("content-type", "text/plain"), response2.clone();
    }) : (response.headers.has("content-type") || response.headers.append("content-type", "text/plain"), () => response.clone());
};

const websocket = {
  open(ws) {
    ws.data.open?.(ws);
  },
  message(ws, message) {
    ws.data.message?.(ws, message);
  },
  drain(ws) {
    ws.data.drain?.(ws);
  },
  close(ws, code, reason) {
    ws.data.close?.(ws, code, reason);
  },
  ping(ws) {
    ws.data.ping?.(ws);
  },
  pong(ws) {
    ws.data.pong?.(ws);
  }
};
class ElysiaWS {
  constructor(raw, data, body = void 0) {
    this.raw = raw;
    this.data = data;
    this.body = body;
    this.validator = raw.data?.validator, this.sendText = raw.sendText.bind(raw), this.sendBinary = raw.sendBinary.bind(raw), this.close = raw.close.bind(raw), this.terminate = raw.terminate.bind(raw), this.publishText = raw.publishText.bind(raw), this.publishBinary = raw.publishBinary.bind(raw), this.subscribe = raw.subscribe.bind(raw), this.unsubscribe = raw.unsubscribe.bind(raw), this.isSubscribed = raw.isSubscribed.bind(raw), this.cork = raw.cork.bind(raw), this.remoteAddress = raw.remoteAddress, this.binaryType = raw.binaryType, this.data = raw.data, this.subscriptions = raw.subscriptions, this.send = this.send.bind(this), this.ping = this.ping.bind(this), this.pong = this.pong.bind(this), this.publish = this.publish.bind(this);
  }
  /**
   * Sends a message to the client.
   *
   * @param data The data to send.
   * @param compress Should the data be compressed? If the client does not support compression, this is ignored.
   * @example
   * ws.send("Hello!");
   * ws.send("Compress this.", true);
   * ws.send(new Uint8Array([1, 2, 3, 4]));
   */
  send(data, compress) {
    return Buffer.isBuffer(data) ? this.raw.send(data, compress) : this.validator?.Check(data) === false ? this.raw.send(
      new ValidationError("message", this.validator, data).message
    ) : (typeof data == "object" && (data = JSON.stringify(data)), this.raw.send(data, compress));
  }
  /**
   * Sends a ping.
   *
   * @param data The data to send
   */
  ping(data) {
    return Buffer.isBuffer(data) ? this.raw.ping(data) : this.validator?.Check(data) === false ? this.raw.send(
      new ValidationError("message", this.validator, data).message
    ) : (typeof data == "object" && (data = JSON.stringify(data)), this.raw.ping(data));
  }
  /**
   * Sends a pong.
   *
   * @param data The data to send
   */
  pong(data) {
    return Buffer.isBuffer(data) ? this.raw.pong(data) : this.validator?.Check(data) === false ? this.raw.send(
      new ValidationError("message", this.validator, data).message
    ) : (typeof data == "object" && (data = JSON.stringify(data)), this.raw.pong(data));
  }
  /**
   * Sends a message to subscribers of the topic.
   *
   * @param topic The topic name.
   * @param data The data to send.
   * @param compress Should the data be compressed? If the client does not support compression, this is ignored.
   * @example
   * ws.publish("chat", "Hello!");
   * ws.publish("chat", "Compress this.", true);
   * ws.publish("chat", new Uint8Array([1, 2, 3, 4]));
   */
  publish(topic, data, compress) {
    return Buffer.isBuffer(data) ? this.raw.publish(
      topic,
      data,
      compress
    ) : this.validator?.Check(data) === false ? this.raw.send(
      new ValidationError("message", this.validator, data).message
    ) : (typeof data == "object" && (data = JSON.stringify(data)), this.raw.publish(topic, data, compress));
  }
  get readyState() {
    return this.raw.readyState;
  }
  get id() {
    return this.data.id;
  }
}
const createWSMessageParser = (parse) => {
  const parsers = typeof parse == "function" ? [parse] : parse;
  return async function(ws, message) {
    if (typeof message == "string") {
      const start = message?.charCodeAt(0);
      if (start === 34 || start === 47 || start === 91 || start === 123)
        try {
          message = JSON.parse(message);
        } catch {
        }
      else isNumericString(message) ? message = +message : message === "true" ? message = true : message === "false" ? message = false : message === "null" && (message = null);
    }
    if (parsers)
      for (let i = 0; i < parsers.length; i++) {
        let temp = parsers[i](ws, message);
        if (temp instanceof Promise && (temp = await temp), temp !== void 0) return temp;
      }
    return message;
  };
}, createHandleWSResponse = (responseValidator) => {
  const handleWSResponse = (ws, data) => {
    if (data instanceof Promise)
      return data.then((data2) => handleWSResponse(ws, data2));
    if (Buffer.isBuffer(data)) return ws.send(data.toString());
    if (data === void 0) return;
    const validateResponse = responseValidator ? (
      // @ts-ignore
      responseValidator.provider === "standard" ? (data2) => (
        // @ts-ignore
        responseValidator.schema["~standard"].validate(data2).issues
      ) : (data2) => responseValidator.Check(data2) === false
    ) : void 0, send = (datum) => {
      if (validateResponse && validateResponse(datum) === false)
        return ws.send(
          new ValidationError("message", responseValidator, datum).message
        );
      if (typeof datum == "object") return ws.send(JSON.stringify(datum));
      ws.send(datum);
    };
    if (typeof data?.next != "function")
      return void send(data);
    const init = data.next();
    if (init instanceof Promise)
      return (async () => {
        const first = await init;
        if (validateResponse && validateResponse(first))
          return ws.send(
            new ValidationError(
              "message",
              responseValidator,
              first
            ).message
          );
        if (send(first.value), !first.done)
          for await (const datum of data) send(datum);
      })();
    if (send(init.value), !init.done) for (const datum of data) send(datum);
  };
  return handleWSResponse;
};

const optionalParam = /:.+?\?(?=\/|$)/, getPossibleParams = (path) => {
  const match = optionalParam.exec(path);
  if (!match) return [path];
  const routes = [], head = path.slice(0, match.index), param = match[0].slice(0, -1), tail = path.slice(match.index + match[0].length);
  routes.push(head.slice(0, -1)), routes.push(head + param);
  for (const fragment of getPossibleParams(tail))
    fragment && (fragment.startsWith("/:") || routes.push(head.slice(0, -1) + fragment), routes.push(head + param + fragment));
  return routes;
}, isHTMLBundle = (handle) => typeof handle == "object" && handle !== null && (handle.toString() === "[object HTMLBundle]" || typeof handle.index == "string"), supportedMethods = {
  GET: true,
  HEAD: true,
  OPTIONS: true,
  DELETE: true,
  PATCH: true,
  POST: true,
  PUT: true
}, mapRoutes = (app) => {
  if (!app.config.aot || app.config.systemRouter === false) return;
  const routes = {}, add = (route, handler) => {
    const path = encodeURI(route.path);
    routes[path] ? routes[path][route.method] || (routes[path][route.method] = handler) : routes[path] = {
      [route.method]: handler
    };
  }, tree = app.routeTree;
  for (const route of app.router.history) {
    if (typeof route.handler != "function") continue;
    const method = route.method;
    if (method === "GET" && `WS_${route.path}` in tree || method === "WS" || route.path.charCodeAt(route.path.length - 1) === 42 || !(method in supportedMethods))
      continue;
    if (method === "ALL") {
      `WS_${route.path}` in tree || (routes[route.path] = route.hooks?.config?.mount ? route.hooks.trace || app.event.trace || // @ts-expect-error private property
      app.extender.higherOrderFunctions ? createBunRouteHandler(app, route) : route.hooks.mount || route.handler : route.handler);
      continue;
    }
    let compiled;
    const handler = app.config.precompile ? createBunRouteHandler(app, route) : (request) => compiled ? compiled(request) : (compiled = createBunRouteHandler(app, route))(
      request
    );
    for (const path of getPossibleParams(route.path))
      add(
        {
          method,
          path
        },
        handler
      );
  }
  return routes;
}, mergeRoutes = (r1, r2) => {
  if (!r2) return r1;
  for (const key of Object.keys(r2))
    if (r1[key] !== r2[key]) {
      if (!r1[key]) {
        r1[key] = r2[key];
        continue;
      }
      if (r1[key] && r2[key]) {
        if (typeof r1[key] == "function" || r1[key] instanceof Response) {
          r1[key] = r2[key];
          continue;
        }
        r1[key] = {
          ...r1[key],
          ...r2[key]
        };
      }
    }
  return r1;
}, BunAdapter = {
  ...WebStandardAdapter,
  name: "bun",
  handler: {
    mapResponse,
    mapEarlyResponse,
    mapCompactResponse,
    createStaticHandler,
    createNativeStaticHandler
  },
  composeHandler: {
    ...WebStandardAdapter.composeHandler,
    headers: hasHeaderShorthand ? `c.headers=c.request.headers.toJSON()
` : `c.headers={}
for(const [k,v] of c.request.headers.entries())c.headers[k]=v
`
  },
  listen(app) {
    return (options, callback) => {
      if (typeof Bun > "u")
        throw new Error(
          ".listen() is designed to run on Bun only. If you are running Elysia in other environment please use a dedicated plugin or export the handler via Elysia.fetch"
        );
      if (app.compile(), typeof options == "string") {
        if (!isNumericString(options))
          throw new Error("Port must be a numeric value");
        options = parseInt(options);
      }
      const createStaticRoute = (iterator, { withAsync = false } = {}) => {
        const staticRoutes = {}, ops = [];
        for (let [path, route] of Object.entries(iterator))
          if (path = encodeURI(path), supportPerMethodInlineHandler) {
            if (!route) continue;
            for (const [method, value] of Object.entries(route))
              if (!(!value || !(method in supportedMethods))) {
                if (value instanceof Promise) {
                  withAsync && (staticRoutes[path] || (staticRoutes[path] = {}), ops.push(
                    value.then((awaited) => {
                      awaited instanceof Response && (staticRoutes[path][method] = awaited), isHTMLBundle(awaited) && (staticRoutes[path][method] = awaited);
                    })
                  ));
                  continue;
                }
                !(value instanceof Response) && !isHTMLBundle(value) || (staticRoutes[path] || (staticRoutes[path] = {}), staticRoutes[path][method] = value);
              }
          } else {
            if (!route) continue;
            if (route instanceof Promise) {
              withAsync && (staticRoutes[path] || (staticRoutes[path] = {}), ops.push(
                route.then((awaited) => {
                  awaited instanceof Response && (staticRoutes[path] = awaited);
                })
              ));
              continue;
            }
            if (!(route instanceof Response)) continue;
            staticRoutes[path] = route;
          }
        return withAsync ? Promise.all(ops).then(() => staticRoutes) : staticRoutes;
      }, serve = typeof options == "object" ? {
        development: !isProduction,
        reusePort: true,
        idleTimeout: 30,
        ...app.config.serve || {},
        ...options || {},
        // @ts-ignore
        routes: mergeRoutes(
          mergeRoutes(
            createStaticRoute(app.router.response),
            mapRoutes(app)
          ),
          // @ts-ignore
          app.config.serve?.routes
        ),
        websocket: {
          ...app.config.websocket || {},
          ...websocket || {},
          ...options.websocket || {}
        },
        fetch: app.fetch
      } : {
        development: !isProduction,
        reusePort: true,
        idleTimeout: 30,
        ...app.config.serve || {},
        // @ts-ignore
        routes: mergeRoutes(
          mergeRoutes(
            createStaticRoute(app.router.response),
            mapRoutes(app)
          ),
          // @ts-ignore
          app.config.serve?.routes
        ),
        websocket: {
          ...app.config.websocket || {},
          ...websocket || {}
        },
        port: options,
        fetch: app.fetch
      };
      if (app.server = Bun.serve(serve), app.event.start)
        for (let i = 0; i < app.event.start.length; i++)
          app.event.start[i].fn(app);
      callback && callback(app.server), process.on("beforeExit", async () => {
        if (app.server && (await app.server.stop?.(), app.server = null, app.event.stop))
          for (let i = 0; i < app.event.stop.length; i++)
            app.event.stop[i].fn(app);
      }), app.promisedModules.then(async () => {
        app.config.aot, app.compile(), app.server?.reload({
          ...serve,
          fetch: app.fetch,
          // @ts-ignore
          routes: mergeRoutes(
            mergeRoutes(
              await createStaticRoute(app.router.response, {
                withAsync: true
              }),
              mapRoutes(app)
            ),
            // @ts-ignore
            app.config.serve?.routes
          )
        }), Bun?.gc(false);
      });
    };
  },
  async stop(app, closeActiveConnections) {
    if (app.server) {
      if (await app.server.stop(closeActiveConnections), app.server = null, app.event.stop?.length)
        for (let i = 0; i < app.event.stop.length; i++)
          app.event.stop[i].fn(app);
    } else
      console.log(
        "Elysia isn't running. Call `app.listen` to start the server.",
        new Error().stack
      );
  },
  ws(app, path, options) {
    const { parse, body, response, ...rest } = options, messageValidator = getSchemaValidator(body, {
      // @ts-expect-error private property
      modules: app.definitions.typebox,
      // @ts-expect-error private property
      models: app.definitions.type,
      normalize: app.config.normalize
    }), validateMessage = messageValidator ? messageValidator.provider === "standard" ? (data) => messageValidator.schema["~standard"].validate(data).issues : (data) => messageValidator.Check(data) === false : void 0, responseValidator = getSchemaValidator(response, {
      // @ts-expect-error private property
      modules: app.definitions.typebox,
      // @ts-expect-error private property
      models: app.definitions.type,
      normalize: app.config.normalize
    });
    app.route(
      "WS",
      path,
      async (context) => {
        const server = context.server ?? app.server, { set, path: path2, qi, headers, query, params } = context;
        if (context.validator = responseValidator, options.upgrade)
          if (typeof options.upgrade == "function") {
            const temp = options.upgrade(context);
            temp instanceof Promise && await temp;
          } else options.upgrade && Object.assign(
            set.headers,
            options.upgrade
          );
        if (set.cookie && isNotEmpty(set.cookie)) {
          const cookie = serializeCookie(set.cookie);
          cookie && (set.headers["set-cookie"] = cookie);
        }
        set.headers["set-cookie"] && Array.isArray(set.headers["set-cookie"]) && (set.headers = parseSetCookies(
          new Headers(set.headers),
          set.headers["set-cookie"]
        ));
        const handleResponse = createHandleWSResponse(responseValidator), parseMessage = createWSMessageParser(parse);
        let _id;
        if (typeof options.beforeHandle == "function") {
          const result = options.beforeHandle(context);
          result instanceof Promise && await result;
        }
        const errorHandlers = [
          ...options.error ? Array.isArray(options.error) ? options.error : [options.error] : [],
          ...(app.event.error ?? []).map(
            (x) => typeof x == "function" ? x : x.fn
          )
        ].filter((x) => x), hasCustomErrorHandlers = errorHandlers.length > 0, handleErrors = hasCustomErrorHandlers ? async (ws, error) => {
          for (const handleError of errorHandlers) {
            let response2 = handleError(
              Object.assign(context, { error })
            );
            if (response2 instanceof Promise && (response2 = await response2), await handleResponse(ws, response2), response2) break;
          }
        } : () => {
        };
        if (!server?.upgrade(context.request, {
          headers: isNotEmpty(set.headers) ? set.headers : void 0,
          data: {
            ...context,
            get id() {
              return _id || (_id = randomId());
            },
            validator: responseValidator,
            ping(ws, data) {
              options.ping?.(ws, data);
            },
            pong(ws, data) {
              options.pong?.(ws, data);
            },
            open: async (ws) => {
              try {
                await handleResponse(
                  ws,
                  options.open?.(
                    new ElysiaWS(ws, context)
                  )
                );
              } catch (error) {
                handleErrors(ws, error);
              }
            },
            message: async (ws, _message) => {
              const message = await parseMessage(ws, _message);
              if (validateMessage && validateMessage(message)) {
                const validationError = new ValidationError(
                  "message",
                  messageValidator,
                  message
                );
                return hasCustomErrorHandlers ? handleErrors(ws, validationError) : void ws.send(
                  validationError.message
                );
              }
              try {
                await handleResponse(
                  ws,
                  options.message?.(
                    new ElysiaWS(
                      ws,
                      context,
                      message
                    ),
                    message
                  )
                );
              } catch (error) {
                handleErrors(ws, error);
              }
            },
            drain: async (ws) => {
              try {
                await handleResponse(
                  ws,
                  options.drain?.(
                    new ElysiaWS(ws, context)
                  )
                );
              } catch (error) {
                handleErrors(ws, error);
              }
            },
            close: async (ws, code, reason) => {
              try {
                await handleResponse(
                  ws,
                  options.close?.(
                    new ElysiaWS(ws, context),
                    code,
                    reason
                  )
                );
              } catch (error) {
                handleErrors(ws, error);
              }
            }
          }
        }))
          return status(400, "Expected a websocket connection");
      },
      {
        ...rest,
        websocket: options
      }
    );
  }
};

const injectDefaultValues = (typeChecker, obj) => {
  let schema = typeChecker.schema;
  if (schema && (schema.$defs?.[schema.$ref] && (schema = schema.$defs[schema.$ref]), !!schema?.properties))
    for (const [key, keySchema] of Object.entries(schema.properties))
      obj[key] ??= keySchema.default;
}, createDynamicHandler = (app) => {
  const { mapResponse, mapEarlyResponse } = app["~adapter"].handler, defaultHeader = app.setHeaders;
  return async (request) => {
    const url = request.url, s = url.indexOf("/", 11), qi = url.indexOf("?", s + 1), path = qi === -1 ? url.substring(s) : url.substring(s, qi), set = {
      cookie: {},
      status: 200,
      headers: defaultHeader ? { ...defaultHeader } : {}
    }, context = Object.assign(
      {},
      // @ts-expect-error
      app.singleton.decorator,
      {
        set,
        // @ts-expect-error
        store: app.singleton.store,
        request,
        path,
        qi,
        error: status,
        status,
        redirect
      }
    );
    let hooks;
    try {
      if (app.event.request)
        for (let i = 0; i < app.event.request.length; i++) {
          const onRequest = app.event.request[i].fn;
          let response2 = onRequest(context);
          if (response2 instanceof Promise && (response2 = await response2), response2 = mapEarlyResponse(response2, set), response2) return context.response = response2;
        }
      const methodKey = request.method === "GET" && request.headers.get("upgrade")?.toLowerCase() === "websocket" ? "WS" : request.method, handler = app.router.dynamic.find(request.method, path) ?? app.router.dynamic.find(methodKey, path) ?? app.router.dynamic.find("ALL", path);
      if (!handler)
        throw context.query = qi === -1 ? {} : parseQuery(url.substring(qi + 1)), new NotFoundError();
      const { handle, validator, content, route } = handler.store;
      if (hooks = handler.store.hooks, hooks.config?.mount)
        return await hooks.config.mount(request);
      let body;
      if (request.method !== "GET" && request.method !== "HEAD")
        if (content)
          switch (content) {
            case "application/json":
              body = await request.json();
              break;
            case "text/plain":
              body = await request.text();
              break;
            case "application/x-www-form-urlencoded":
              body = parseQuery(await request.text());
              break;
            case "application/octet-stream":
              body = await request.arrayBuffer();
              break;
            case "multipart/form-data": {
              body = {};
              const form = await request.formData();
              for (const key of form.keys()) {
                if (body[key]) continue;
                const value = form.getAll(key);
                value.length === 1 ? body[key] = value[0] : body[key] = value;
              }
              break;
            }
          }
        else {
          let contentType;
          if (request.body && (contentType = request.headers.get("content-type")), contentType) {
            const index = contentType.indexOf(";");
            if (index !== -1 && (contentType = contentType.slice(0, index)), context.contentType = contentType, hooks.parse)
              for (let i = 0; i < hooks.parse.length; i++) {
                const hook = hooks.parse[i].fn;
                if (typeof hook == "string")
                  switch (hook) {
                    case "json":
                    case "application/json":
                      body = await request.json();
                      break;
                    case "text":
                    case "text/plain":
                      body = await request.text();
                      break;
                    case "urlencoded":
                    case "application/x-www-form-urlencoded":
                      body = parseQuery(
                        await request.text()
                      );
                      break;
                    case "arrayBuffer":
                    case "application/octet-stream":
                      body = await request.arrayBuffer();
                      break;
                    case "formdata":
                    case "multipart/form-data": {
                      body = {};
                      const form = await request.formData();
                      for (const key of form.keys()) {
                        if (body[key]) continue;
                        const value = form.getAll(key);
                        value.length === 1 ? body[key] = value[0] : body[key] = value;
                      }
                      break;
                    }
                    default: {
                      const parser = app["~parser"][hook];
                      if (parser) {
                        let temp = parser(
                          context,
                          contentType
                        );
                        if (temp instanceof Promise && (temp = await temp), temp) {
                          body = temp;
                          break;
                        }
                      }
                      break;
                    }
                  }
                else {
                  let temp = hook(context, contentType);
                  if (temp instanceof Promise && (temp = await temp), temp) {
                    body = temp;
                    break;
                  }
                }
              }
            if (delete context.contentType, body === void 0)
              switch (contentType) {
                case "application/json":
                  body = await request.json();
                  break;
                case "text/plain":
                  body = await request.text();
                  break;
                case "application/x-www-form-urlencoded":
                  body = parseQuery(await request.text());
                  break;
                case "application/octet-stream":
                  body = await request.arrayBuffer();
                  break;
                case "multipart/form-data": {
                  body = {};
                  const form = await request.formData();
                  for (const key of form.keys()) {
                    if (body[key]) continue;
                    const value = form.getAll(key);
                    value.length === 1 ? body[key] = value[0] : body[key] = value;
                  }
                  break;
                }
              }
          }
        }
      context.route = route, context.body = body, context.params = handler?.params || void 0, context.query = qi === -1 ? {} : parseQuery(url.substring(qi + 1)), context.headers = {};
      for (const [key, value] of request.headers.entries())
        context.headers[key] = value;
      const cookieMeta = {
        domain: app.config.cookie?.domain ?? // @ts-expect-error
        validator?.cookie?.config.domain,
        expires: app.config.cookie?.expires ?? // @ts-expect-error
        validator?.cookie?.config.expires,
        httpOnly: app.config.cookie?.httpOnly ?? // @ts-expect-error
        validator?.cookie?.config.httpOnly,
        maxAge: app.config.cookie?.maxAge ?? // @ts-expect-error
        validator?.cookie?.config.maxAge,
        // @ts-expect-error
        path: app.config.cookie?.path ?? validator?.cookie?.config.path,
        priority: app.config.cookie?.priority ?? // @ts-expect-error
        validator?.cookie?.config.priority,
        partitioned: app.config.cookie?.partitioned ?? // @ts-expect-error
        validator?.cookie?.config.partitioned,
        sameSite: app.config.cookie?.sameSite ?? // @ts-expect-error
        validator?.cookie?.config.sameSite,
        secure: app.config.cookie?.secure ?? // @ts-expect-error
        validator?.cookie?.config.secure,
        secrets: app.config.cookie?.secrets ?? // @ts-expect-error
        validator?.cookie?.config.secrets,
        // @ts-expect-error
        sign: app.config.cookie?.sign ?? validator?.cookie?.config.sign
      }, cookieHeaderValue = request.headers.get("cookie");
      context.cookie = await parseCookie(
        context.set,
        cookieHeaderValue,
        cookieMeta
      );
      const headerValidator = validator?.createHeaders?.();
      headerValidator && injectDefaultValues(headerValidator, context.headers);
      const paramsValidator = validator?.createParams?.();
      paramsValidator && injectDefaultValues(paramsValidator, context.params);
      const queryValidator = validator?.createQuery?.();
      if (queryValidator && injectDefaultValues(queryValidator, context.query), hooks.transform)
        for (let i = 0; i < hooks.transform.length; i++) {
          const hook = hooks.transform[i];
          let response2 = hook.fn(context);
          if (response2 instanceof Promise && (response2 = await response2), response2 instanceof ElysiaCustomStatusResponse) {
            const result = mapEarlyResponse(response2, context.set);
            if (result)
              return context.response = result;
          }
          hook.subType === "derive" && Object.assign(context, response2);
        }
      if (validator) {
        if (headerValidator) {
          const _header = structuredClone(context.headers);
          for (const [key, value] of request.headers)
            _header[key] = value;
          if (validator.headers.Check(_header) === !1)
            throw new ValidationError(
              "header",
              validator.headers,
              _header
            );
        } else validator.headers?.Decode && (context.headers = validator.headers.Decode(context.headers));
        if (paramsValidator?.Check(context.params) === !1)
          throw new ValidationError(
            "params",
            validator.params,
            context.params
          );
        if (validator.params?.Decode && (context.params = validator.params.Decode(context.params)), validator.query?.schema) {
          let schema = validator.query.schema;
          schema.$defs?.[schema.$ref] && (schema = schema.$defs[schema.$ref]);
          const properties = schema.properties;
          for (const property of Object.keys(properties)) {
            const value = properties[property];
            (value.type === "array" || value.items?.type === "string") && typeof context.query[property] == "string" && context.query[property] && (context.query[property] = context.query[property].split(","));
          }
        }
        if (queryValidator?.Check(context.query) === !1)
          throw new ValidationError(
            "query",
            validator.query,
            context.query
          );
        if (validator.query?.Decode && (context.query = validator.query.Decode(context.query)), validator.createCookie?.()) {
          let cookieValue = {};
          for (const [key, value] of Object.entries(context.cookie))
            cookieValue[key] = value.value;
          if (validator.cookie.Check(cookieValue) === !1)
            throw new ValidationError(
              "cookie",
              validator.cookie,
              cookieValue
            );
          validator.cookie?.Decode && (cookieValue = validator.cookie.Decode(
            cookieValue
          ));
        }
        if (validator.createBody?.()?.Check(body) === !1)
          throw new ValidationError("body", validator.body, body);
        validator.body?.Decode && (context.body = validator.body.Decode(body));
      }
      if (hooks.beforeHandle)
        for (let i = 0; i < hooks.beforeHandle.length; i++) {
          const hook = hooks.beforeHandle[i];
          let response2 = hook.fn(context);
          if (response2 instanceof Promise && (response2 = await response2), response2 instanceof ElysiaCustomStatusResponse) {
            const result = mapEarlyResponse(response2, context.set);
            if (result)
              return context.response = result;
          }
          if (hook.subType === "resolve") {
            Object.assign(context, response2);
            continue;
          }
          if (response2 !== void 0) {
            if (context.response = response2, hooks.afterHandle)
              for (let i2 = 0; i2 < hooks.afterHandle.length; i2++) {
                let newResponse = hooks.afterHandle[i2].fn(
                  context
                );
                newResponse instanceof Promise && (newResponse = await newResponse), newResponse && (response2 = newResponse);
              }
            const result = mapEarlyResponse(response2, context.set);
            if (result) return context.response = result;
          }
        }
      let response = typeof handle == "function" ? handle(context) : handle;
      if (response instanceof Promise && (response = await response), hooks.afterHandle?.length) {
        context.response = response;
        for (let i = 0; i < hooks.afterHandle.length; i++) {
          let response2 = hooks.afterHandle[i].fn(
            context
          );
          response2 instanceof Promise && (response2 = await response2);
          const isCustomStatuResponse = response2 instanceof ElysiaCustomStatusResponse, status2 = isCustomStatuResponse ? response2.code : set.status ? typeof set.status == "string" ? StatusMap[set.status] : set.status : 200;
          isCustomStatuResponse && (set.status = status2, response2 = response2.response);
          const responseValidator = validator?.createResponse?.()?.[status2];
          if (responseValidator?.Check(response2) === !1)
            if (responseValidator?.Clean) {
              const temp = responseValidator.Clean(response2);
              if (responseValidator?.Check(temp) === !1)
                throw new ValidationError(
                  "response",
                  responseValidator,
                  response2
                );
              response2 = temp;
            } else
              throw new ValidationError(
                "response",
                responseValidator,
                response2
              );
          responseValidator?.Encode && (context.response = response2 = responseValidator.Encode(response2)), responseValidator?.Clean && (context.response = response2 = responseValidator.Clean(response2));
          const result = mapEarlyResponse(response2, context.set);
          if (result !== void 0) return context.response = result;
        }
      } else {
        const isCustomStatuResponse = response instanceof ElysiaCustomStatusResponse, status2 = isCustomStatuResponse ? response.code : set.status ? typeof set.status == "string" ? StatusMap[set.status] : set.status : 200;
        isCustomStatuResponse && (set.status = status2, response = response.response);
        const responseValidator = validator?.createResponse?.()?.[status2];
        if (responseValidator?.Check(response) === !1)
          if (responseValidator?.Clean) {
            const temp = responseValidator.Clean(response);
            if (responseValidator?.Check(temp) === !1)
              throw new ValidationError(
                "response",
                responseValidator,
                response
              );
            response = temp;
          } else
            throw new ValidationError(
              "response",
              responseValidator,
              response
            );
        responseValidator?.Encode && (response = responseValidator.Encode(response)), responseValidator?.Clean && (response = responseValidator.Clean(response));
      }
      if (context.set.cookie && cookieMeta?.sign) {
        const secret = cookieMeta.secrets ? typeof cookieMeta.secrets == "string" ? cookieMeta.secrets : cookieMeta.secrets[0] : void 0;
        if (cookieMeta.sign === !0) {
          if (secret)
            for (const [key, cookie] of Object.entries(
              context.set.cookie
            ))
              context.set.cookie[key].value = await signCookie(
                cookie.value,
                secret
              );
        } else {
          const properties = validator?.cookie?.schema?.properties;
          if (secret)
            for (const name of cookieMeta.sign)
              name in properties && context.set.cookie[name]?.value && (context.set.cookie[name].value = await signCookie(
                context.set.cookie[name].value,
                secret
              ));
        }
      }
      return mapResponse(context.response = response, context.set);
    } catch (error) {
      const reportedError = error instanceof TransformDecodeError && error.error ? error.error : error;
      return app.handleError(context, reportedError);
    } finally {
      const afterResponses = hooks ? hooks.afterResponse : app.event.afterResponse;
      afterResponses && (hasSetImmediate ? setImmediate(async () => {
        for (const afterResponse of afterResponses)
          await afterResponse.fn(context);
      }) : Promise.resolve().then(async () => {
        for (const afterResponse of afterResponses)
          await afterResponse.fn(context);
      }));
    }
  };
}, createDynamicErrorHandler = (app) => {
  const { mapResponse } = app["~adapter"].handler;
  return async (context, error) => {
    const errorContext = Object.assign(context, { error, code: error.code });
    if (errorContext.set = context.set, // @ts-expect-error
    typeof error?.toResponse == "function" && !(error instanceof ValidationError) && !(error instanceof TransformDecodeError))
      try {
        let raw = error.toResponse();
        typeof raw?.then == "function" && (raw = await raw), raw instanceof Response && (context.set.status = raw.status), context.response = raw;
      } catch {
      }
    if (!context.response && app.event.error)
      for (let i = 0; i < app.event.error.length; i++) {
        let response = app.event.error[i].fn(errorContext);
        if (response instanceof Promise && (response = await response), response != null)
          return context.response = mapResponse(
            response,
            context.set
          );
      }
    if (context.response) {
      if (app.event.mapResponse)
        for (let i = 0; i < app.event.mapResponse.length; i++) {
          let response = app.event.mapResponse[i].fn(errorContext);
          response instanceof Promise && (response = await response), response != null && (context.response = response);
        }
      return mapResponse(context.response, context.set);
    }
    return context.set.status = error.status ?? 500, mapResponse(
      typeof error.cause == "string" ? error.cause : error.message,
      context.set
    );
  };
};

var _a$1;
_a$1 = Symbol.dispose;
const _Elysia = class _Elysia {
  constructor(config = {}) {
    this.server = null;
    this.dependencies = {};
    this["~Prefix"] = "";
    this["~Singleton"] = null;
    this["~Definitions"] = null;
    this["~Metadata"] = null;
    this["~Ephemeral"] = null;
    this["~Volatile"] = null;
    this["~Routes"] = null;
    this.singleton = {
      decorator: {},
      store: {},
      derive: {},
      resolve: {}
    };
    this.definitions = {
      typebox: t.Module({}),
      type: {},
      error: {}
    };
    this.extender = {
      macro: {},
      higherOrderFunctions: []
    };
    this.validator = {
      global: null,
      scoped: null,
      local: null,
      getCandidate() {
        return !this.global && !this.scoped && !this.local ? {
          body: void 0,
          headers: void 0,
          params: void 0,
          query: void 0,
          cookie: void 0,
          response: void 0
        } : mergeSchemaValidator(
          mergeSchemaValidator(this.global, this.scoped),
          this.local
        );
      }
    };
    this.standaloneValidator = {
      global: null,
      scoped: null,
      local: null
    };
    this.event = {};
    this.router = {
      "~http": void 0,
      get http() {
        return this["~http"] || (this["~http"] = new Memoirist({
          lazy: true,
          onParam: fastDecodeURIComponent
        })), this["~http"];
      },
      "~dynamic": void 0,
      // Use in non-AOT mode
      get dynamic() {
        return this["~dynamic"] || (this["~dynamic"] = new Memoirist({
          onParam: fastDecodeURIComponent
        })), this["~dynamic"];
      },
      // Static Router
      static: {},
      // Native Static Response
      response: {},
      history: []
    };
    this.routeTree = {};
    this.inference = {
      body: false,
      cookie: false,
      headers: false,
      query: false,
      set: false,
      server: false,
      path: false,
      route: false,
      url: false
    };
    this["~parser"] = {};
    this.handle = async (request) => this.fetch(request);
    this.handleError = async (context, error) => (this.handleError = this.config.aot ? composeErrorHandler(this) : createDynamicErrorHandler(this))(context, error);
    /**
     * ### listen
     * Assign current instance to port and start serving
     *
     * ---
     * @example
     * ```typescript
     * new Elysia()
     *     .get("/", () => 'hi')
     *     .listen(3000)
     * ```
     */
    this.listen = (options, callback) => (this["~adapter"].listen(this)(options, callback), this);
    /**
     * ### stop
     * Stop server from serving
     *
     * ---
     * @example
     * ```typescript
     * const app = new Elysia()
     *     .get("/", () => 'hi')
     *     .listen(3000)
     *
     * // Sometime later
     * app.stop()
     * ```
     *
     * @example
     * ```typescript
     * const app = new Elysia()
     *     .get("/", () => 'hi')
     *     .listen(3000)
     *
     * app.stop(true) // Abruptly any requests inflight
     * ```
     */
    this.stop = async (closeActiveConnections) => (await this["~adapter"].stop?.(this, closeActiveConnections), this);
    this[_a$1] = () => {
      this.server && this.stop();
    };
    config.tags && (config.detail ? config.detail.tags = config.tags : config.detail = {
      tags: config.tags
    }), this.config = {
      aot: env.ELYSIA_AOT !== "false",
      nativeStaticResponse: true,
      encodeSchema: true,
      normalize: true,
      ...config,
      prefix: config.prefix ? config.prefix.charCodeAt(0) === 47 ? config.prefix : `/${config.prefix}` : void 0,
      cookie: {
        path: "/",
        ...config?.cookie
      },
      experimental: config?.experimental ?? {},
      seed: config?.seed === void 0 ? "" : config?.seed
    }, this["~adapter"] = config.adapter ?? (typeof Bun < "u" ? BunAdapter : WebStandardAdapter), config?.analytic && (config?.name || config?.seed !== void 0) && (this.telemetry = {
      stack: new Error().stack
    });
  }
  get store() {
    return this.singleton.store;
  }
  get decorator() {
    return this.singleton.decorator;
  }
  get routes() {
    return this.router.history;
  }
  getGlobalRoutes() {
    return this.router.history;
  }
  getGlobalDefinitions() {
    return this.definitions;
  }
  getServer() {
    return this.server;
  }
  getParent() {
    return null;
  }
  get promisedModules() {
    return this._promisedModules || (this._promisedModules = new PromiseGroup(console.error, () => {
    })), this._promisedModules;
  }
  env(model, _env = env) {
    if (getSchemaValidator(model, {
      modules: this.definitions.typebox,
      dynamic: true,
      additionalProperties: true,
      coerce: true,
      sanitize: () => this.config.sanitize
    }).Check(_env) === false) {
      const error = new ValidationError("env", model, _env);
      throw new Error(error.all.map((x) => x.summary).join(`
`));
    }
    return this;
  }
  /**
   * @private DO_NOT_USE_OR_YOU_WILL_BE_FIRED
   * @version 1.1.0
   *
   * ! Do not use unless you know exactly what you are doing
   * ? Add Higher order function to Elysia.fetch
   */
  wrap(fn) {
    return this.extender.higherOrderFunctions.push({
      checksum: checksum(
        JSON.stringify({
          name: this.config.name,
          seed: this.config.seed,
          content: fn.toString()
        })
      ),
      fn
    }), this;
  }
  get models() {
    const models = {};
    for (const name of Object.keys(this.definitions.type))
      models[name] = getSchemaValidator(
        this.definitions.typebox.Import(name),
        {
          models: this.definitions.type
        }
      );
    return models.modules = this.definitions.typebox, models;
  }
  add(method, path, handle, localHook, options) {
    const skipPrefix = options?.skipPrefix ?? false, allowMeta = options?.allowMeta ?? false;
    localHook ??= {}, this.applyMacro(localHook);
    let standaloneValidators = [];
    if (localHook.standaloneValidator && (standaloneValidators = standaloneValidators.concat(
      localHook.standaloneValidator
    )), this.standaloneValidator.local && (standaloneValidators = standaloneValidators.concat(
      this.standaloneValidator.local
    )), this.standaloneValidator.scoped && (standaloneValidators = standaloneValidators.concat(
      this.standaloneValidator.scoped
    )), this.standaloneValidator.global && (standaloneValidators = standaloneValidators.concat(
      this.standaloneValidator.global
    )), path !== "" && path.charCodeAt(0) !== 47 && (path = "/" + path), this.config.prefix && !skipPrefix && (path = this.config.prefix + path), localHook?.type)
      switch (localHook.type) {
        case "text":
          localHook.type = "text/plain";
          break;
        case "json":
          localHook.type = "application/json";
          break;
        case "formdata":
          localHook.type = "multipart/form-data";
          break;
        case "urlencoded":
          localHook.type = "application/x-www-form-urlencoded";
          break;
        case "arrayBuffer":
          localHook.type = "application/octet-stream";
          break;
      }
    const instanceValidator = this.validator.getCandidate(), cloned = {
      body: localHook?.body ?? instanceValidator?.body,
      headers: localHook?.headers ?? instanceValidator?.headers,
      params: localHook?.params ?? instanceValidator?.params,
      query: localHook?.query ?? instanceValidator?.query,
      cookie: localHook?.cookie ?? instanceValidator?.cookie,
      response: localHook?.response ?? instanceValidator?.response
    }, shouldPrecompile = this.config.precompile === true || typeof this.config.precompile == "object" && this.config.precompile.compose === true, createValidator = () => {
      const models = this.definitions.type, dynamic = !this.config.aot, normalize = this.config.normalize, modules = this.definitions.typebox, sanitize = () => this.config.sanitize, cookieValidator = () => {
        if (cloned.cookie || standaloneValidators.find((x) => x.cookie))
          return getCookieValidator({
            modules,
            validator: cloned.cookie,
            defaultConfig: this.config.cookie,
            normalize,
            config: cloned.cookie?.config ?? {},
            dynamic,
            models,
            validators: standaloneValidators.map((x) => x.cookie),
            sanitize
          });
      };
      return shouldPrecompile ? {
        body: getSchemaValidator(cloned.body, {
          modules,
          dynamic,
          models,
          normalize,
          additionalCoerce: (() => {
            const resolved = resolveSchema(
              cloned.body,
              models,
              modules
            );
            return resolved && Kind$2 in resolved && (hasType("File", resolved) || hasType("Files", resolved)) ? coerceFormData() : coercePrimitiveRoot();
          })(),
          validators: standaloneValidators.map((x) => x.body),
          sanitize
        }),
        headers: getSchemaValidator(cloned.headers, {
          modules,
          dynamic,
          models,
          additionalProperties: true,
          coerce: true,
          additionalCoerce: stringToStructureCoercions(),
          validators: standaloneValidators.map(
            (x) => x.headers
          ),
          sanitize
        }),
        params: getSchemaValidator(cloned.params, {
          modules,
          dynamic,
          models,
          coerce: true,
          additionalCoerce: stringToStructureCoercions(),
          validators: standaloneValidators.map(
            (x) => x.params
          ),
          sanitize
        }),
        query: getSchemaValidator(cloned.query, {
          modules,
          dynamic,
          models,
          normalize,
          coerce: true,
          additionalCoerce: queryCoercions(),
          validators: standaloneValidators.map(
            (x) => x.query
          ),
          sanitize
        }),
        cookie: cookieValidator(),
        response: getResponseSchemaValidator(cloned.response, {
          modules,
          dynamic,
          models,
          normalize,
          validators: standaloneValidators.map(
            (x) => x.response
          ),
          sanitize
        })
      } : {
        createBody() {
          return this.body ? this.body : this.body = getSchemaValidator(
            cloned.body,
            {
              modules,
              dynamic,
              models,
              normalize,
              additionalCoerce: (() => {
                const resolved = resolveSchema(
                  cloned.body,
                  models,
                  modules
                );
                return resolved && Kind$2 in resolved && (hasType("File", resolved) || hasType("Files", resolved)) ? coerceFormData() : coercePrimitiveRoot();
              })(),
              validators: standaloneValidators.map(
                (x) => x.body
              ),
              sanitize
            }
          );
        },
        createHeaders() {
          return this.headers ? this.headers : this.headers = getSchemaValidator(
            cloned.headers,
            {
              modules,
              dynamic,
              models,
              normalize,
              additionalProperties: !normalize,
              coerce: true,
              additionalCoerce: stringToStructureCoercions(),
              validators: standaloneValidators.map(
                (x) => x.headers
              ),
              sanitize
            }
          );
        },
        createParams() {
          return this.params ? this.params : this.params = getSchemaValidator(
            cloned.params,
            {
              modules,
              dynamic,
              models,
              normalize,
              coerce: true,
              additionalCoerce: stringToStructureCoercions(),
              validators: standaloneValidators.map(
                (x) => x.params
              ),
              sanitize
            }
          );
        },
        createQuery() {
          return this.query ? this.query : this.query = getSchemaValidator(
            cloned.query,
            {
              modules,
              dynamic,
              models,
              normalize,
              coerce: true,
              additionalCoerce: queryCoercions(),
              validators: standaloneValidators.map(
                (x) => x.query
              ),
              sanitize
            }
          );
        },
        createCookie() {
          return this.cookie ? this.cookie : this.cookie = cookieValidator();
        },
        createResponse() {
          return this.response ? this.response : this.response = getResponseSchemaValidator(
            cloned.response,
            {
              modules,
              dynamic,
              models,
              normalize,
              validators: standaloneValidators.map(
                (x) => x.response
              ),
              sanitize
            }
          );
        }
      };
    };
    (instanceValidator.body || instanceValidator.cookie || instanceValidator.headers || instanceValidator.params || instanceValidator.query || instanceValidator.response) && (localHook = mergeHook(localHook, instanceValidator)), localHook.tags && (localHook.detail ? localHook.detail.tags = localHook.tags : localHook.detail = {
      tags: localHook.tags
    }), isNotEmpty(this.config.detail) && (localHook.detail = mergeDeep(
      Object.assign({}, this.config.detail),
      localHook.detail
    ));
    const hooks = isNotEmpty(this.event) ? mergeHook(this.event, localHookToLifeCycleStore(localHook)) : { ...lifeCycleToArray(localHookToLifeCycleStore(localHook)) };
    if (standaloneValidators.length && Object.assign(hooks, {
      standaloneValidator: standaloneValidators
    }), this.config.aot === false) {
      const validator = createValidator();
      this.router.dynamic.add(method, path, {
        validator,
        hooks,
        content: localHook?.type,
        handle,
        route: path
      });
      const encoded = encodePath(path, { dynamic: true });
      if (path !== encoded && this.router.dynamic.add(method, encoded, {
        validator,
        hooks,
        content: localHook?.type,
        handle,
        route: path
      }), !this.config.strictPath) {
        const loosePath = getLoosePath$1(path);
        this.router.dynamic.add(method, loosePath, {
          validator,
          hooks,
          content: localHook?.type,
          handle,
          route: path
        });
        const encoded2 = encodePath(loosePath);
        loosePath !== encoded2 && this.router.dynamic.add(method, loosePath, {
          validator,
          hooks,
          content: localHook?.type,
          handle,
          route: path
        });
      }
      this.router.history.push({
        method,
        path,
        composed: null,
        handler: handle,
        compile: void 0,
        hooks
      });
      return;
    }
    const adapter = this["~adapter"].handler, nativeStaticHandler = typeof handle != "function" ? () => {
      const context = {
        redirect,
        request: this["~adapter"].isWebStandard ? new Request(`http://ely.sia${path}`, {
          method
        }) : void 0,
        server: null,
        set: {
          headers: Object.assign({}, this.setHeaders)
        },
        status,
        store: this.store
      };
      try {
        this.event.request?.map((x) => {
          if (typeof x.fn == "function")
            return x.fn(context);
          if (typeof x == "function") return x(context);
        });
      } catch (error) {
        let res;
        context.error = error, this.event.error?.some((x) => {
          if (typeof x.fn == "function")
            return res = x.fn(context);
          if (typeof x == "function")
            return res = x(context);
        }), res !== void 0 && (handle = res);
      }
      const fn = adapter.createNativeStaticHandler?.(
        handle,
        hooks,
        context.set
      );
      return fn instanceof Promise ? fn.then((fn2) => {
        if (fn2) return fn2;
      }) : fn?.();
    } : void 0, useNativeStaticResponse = this.config.nativeStaticResponse === true, addResponsePath = (path2) => {
      !useNativeStaticResponse || !nativeStaticHandler || (supportPerMethodInlineHandler ? this.router.response[path2] ? this.router.response[path2][method] = nativeStaticHandler() : this.router.response[path2] = {
        [method]: nativeStaticHandler()
      } : this.router.response[path2] = nativeStaticHandler());
    };
    addResponsePath(path);
    let _compiled;
    const compile = () => {
      if (_compiled) return _compiled;
      const compiled = composeHandler({
        app: this,
        path,
        method,
        hooks,
        validator: createValidator(),
        handler: typeof handle != "function" && typeof adapter.createStaticHandler != "function" ? () => handle : handle,
        allowMeta,
        inference: this.inference
      });
      return this.router.history[index] && (_compiled = this.router.history[index].composed = compiled), compiled;
    };
    let oldIndex;
    if (`${method}_${path}` in this.routeTree)
      for (let i = 0; i < this.router.history.length; i++) {
        const route2 = this.router.history[i];
        if (route2.path === path && route2.method === method) {
          oldIndex = i;
          break;
        }
      }
    else this.routeTree[`${method}_${path}`] = this.router.history.length;
    const index = oldIndex ?? this.router.history.length, route = this.router.history, mainHandler = shouldPrecompile ? compile() : (ctx) => _compiled ? _compiled(ctx) : (route[index].composed = compile())(ctx);
    oldIndex !== void 0 ? this.router.history[oldIndex] = Object.assign(
      {
        method,
        path,
        composed: mainHandler,
        compile,
        handler: handle,
        hooks
      },
      standaloneValidators.length ? {
        standaloneValidators
      } : void 0,
      localHook.webSocket ? { websocket: localHook.websocket } : void 0
    ) : this.router.history.push(
      Object.assign(
        {
          method,
          path,
          composed: mainHandler,
          compile,
          handler: handle,
          hooks
        },
        localHook.webSocket ? { websocket: localHook.websocket } : void 0
      )
    );
    const handler = {
      handler: shouldPrecompile ? route[index].composed : void 0,
      compile() {
        return this.handler = compile();
      }
    }, staticRouter = this.router.static, isStaticPath = path.indexOf(":") === -1 && path.indexOf("*") === -1;
    if (method === "WS") {
      if (isStaticPath) {
        path in staticRouter ? staticRouter[path][method] = index : staticRouter[path] = {
          [method]: index
        };
        return;
      }
      this.router.http.add("WS", path, handler), this.config.strictPath || this.router.http.add("WS", getLoosePath$1(path), handler);
      const encoded = encodePath(path, { dynamic: true });
      path !== encoded && this.router.http.add("WS", encoded, handler);
      return;
    }
    if (isStaticPath)
      path in staticRouter ? staticRouter[path][method] = index : staticRouter[path] = {
        [method]: index
      }, this.config.strictPath || addResponsePath(getLoosePath$1(path));
    else {
      if (this.router.http.add(method, path, handler), !this.config.strictPath) {
        const loosePath = getLoosePath$1(path);
        addResponsePath(loosePath), this.router.http.add(method, loosePath, handler);
      }
      const encoded = encodePath(path, { dynamic: true });
      path !== encoded && (this.router.http.add(method, encoded, handler), addResponsePath(encoded));
    }
  }
  headers(header) {
    return header ? (this.setHeaders || (this.setHeaders = {}), this.setHeaders = mergeDeep(this.setHeaders, header), this) : this;
  }
  /**
   * ### start | Life cycle event
   * Called after server is ready for serving
   *
   * ---
   * @example
   * ```typescript
   * new Elysia()
   *     .onStart(({ server }) => {
   *         console.log("Running at ${server?.url}:${server?.port}")
   *     })
   *     .listen(3000)
   * ```
   */
  onStart(handler) {
    return this.on("start", handler), this;
  }
  onRequest(handler) {
    return this.on("request", handler), this;
  }
  onParse(options, handler) {
    return handler ? this.on(
      options,
      "parse",
      handler
    ) : typeof options == "string" ? this.on("parse", this["~parser"][options]) : this.on("parse", options);
  }
  /**
   * ### parse | Life cycle event
   * Callback function to handle body parsing
   *
   * If truthy value is returned, will be assigned to `context.body`
   * Otherwise will skip the callback and look for the next one.
   *
   * Equivalent to Express's body parser
   *
   * ---
   * @example
   * ```typescript
   * new Elysia()
   *     .onParse((request, contentType) => {
   *         if(contentType === "application/json")
   *             return request.json()
   *     })
   * ```
   */
  parser(name, parser) {
    return this["~parser"][name] = parser, this;
  }
  onTransform(options, handler) {
    return handler ? this.on(
      options,
      "transform",
      handler
    ) : this.on("transform", options);
  }
  resolve(optionsOrResolve, resolve) {
    resolve || (resolve = optionsOrResolve, optionsOrResolve = { as: "local" });
    const hook = {
      subType: "resolve",
      fn: resolve
    };
    return this.onBeforeHandle(optionsOrResolve, hook);
  }
  mapResolve(optionsOrResolve, mapper) {
    mapper || (mapper = optionsOrResolve, optionsOrResolve = { as: "local" });
    const hook = {
      subType: "mapResolve",
      fn: mapper
    };
    return this.onBeforeHandle(optionsOrResolve, hook);
  }
  onBeforeHandle(options, handler) {
    return handler ? this.on(
      options,
      "beforeHandle",
      handler
    ) : this.on("beforeHandle", options);
  }
  onAfterHandle(options, handler) {
    return handler ? this.on(
      options,
      "afterHandle",
      handler
    ) : this.on("afterHandle", options);
  }
  mapResponse(options, handler) {
    return handler ? this.on(
      options,
      "mapResponse",
      handler
    ) : this.on("mapResponse", options);
  }
  onAfterResponse(options, handler) {
    return handler ? this.on(
      options,
      "afterResponse",
      handler
    ) : this.on("afterResponse", options);
  }
  /**
   * ### After Handle | Life cycle event
   * Intercept request **after** main handler is called.
   *
   * If truthy value is returned, will be assigned as `Response`
   *
   * ---
   * @example
   * ```typescript
   * new Elysia()
   *     .onAfterHandle((context, response) => {
   *         if(typeof response === "object")
   *             return JSON.stringify(response)
   *     })
   * ```
   */
  trace(options, handler) {
    handler || (handler = options, options = { as: "local" }), Array.isArray(handler) || (handler = [handler]);
    for (const fn of handler)
      this.on(
        options,
        "trace",
        createTracer(fn)
      );
    return this;
  }
  error(name, error) {
    switch (typeof name) {
      case "string":
        return error.prototype[ERROR_CODE] = name, this.definitions.error[name] = error, this;
      case "function":
        return this.definitions.error = name(this.definitions.error), this;
    }
    for (const [code, error2] of Object.entries(name))
      error2.prototype[ERROR_CODE] = code, this.definitions.error[code] = error2;
    return this;
  }
  /**
   * ### Error | Life cycle event
   * Called when error is thrown during processing request
   *
   * ---
   * @example
   * ```typescript
   * new Elysia()
   *     .onError(({ code }) => {
   *         if(code === "NOT_FOUND")
   *             return "Path not found :("
   *     })
   * ```
   */
  onError(options, handler) {
    return handler ? this.on(
      options,
      "error",
      handler
    ) : this.on("error", options);
  }
  /**
   * ### stop | Life cycle event
   * Called after server stop serving request
   *
   * ---
   * @example
   * ```typescript
   * new Elysia()
   *     .onStop((app) => {
   *         cleanup()
   *     })
   * ```
   */
  onStop(handler) {
    return this.on("stop", handler), this;
  }
  on(optionsOrType, typeOrHandlers, handlers) {
    let type;
    switch (typeof optionsOrType) {
      case "string":
        type = optionsOrType, handlers = typeOrHandlers;
        break;
      case "object":
        type = typeOrHandlers, !Array.isArray(typeOrHandlers) && typeof typeOrHandlers == "object" && (handlers = typeOrHandlers);
        break;
    }
    Array.isArray(handlers) ? handlers = fnToContainer(handlers) : typeof handlers == "function" ? handlers = [
      {
        fn: handlers
      }
    ] : handlers = [handlers];
    const handles = handlers;
    for (const handle of handles)
      handle.scope = typeof optionsOrType == "string" ? "local" : optionsOrType?.as ?? "local", (type === "resolve" || type === "derive") && (handle.subType = type);
    type !== "trace" && (this.inference = sucrose(
      {
        [type]: handles.map((x) => x.fn)
      },
      this.inference,
      this.config.sucrose
    ));
    for (const handle of handles) {
      const fn = asHookType(handle, "global", { skipIfHasType: true });
      switch (type) {
        case "start":
          this.event.start ??= [], this.event.start.push(fn);
          break;
        case "request":
          this.event.request ??= [], this.event.request.push(fn);
          break;
        case "parse":
          this.event.parse ??= [], this.event.parse.push(fn);
          break;
        case "transform":
          this.event.transform ??= [], this.event.transform.push(fn);
          break;
        // @ts-expect-error
        case "derive":
          this.event.transform ??= [], this.event.transform.push(
            fnToContainer(fn, "derive")
          );
          break;
        case "beforeHandle":
          this.event.beforeHandle ??= [], this.event.beforeHandle.push(fn);
          break;
        // @ts-expect-error
        // eslint-disable-next-line sonarjs/no-duplicated-branches
        case "resolve":
          this.event.beforeHandle ??= [], this.event.beforeHandle.push(
            fnToContainer(fn, "resolve")
          );
          break;
        case "afterHandle":
          this.event.afterHandle ??= [], this.event.afterHandle.push(fn);
          break;
        case "mapResponse":
          this.event.mapResponse ??= [], this.event.mapResponse.push(fn);
          break;
        case "afterResponse":
          this.event.afterResponse ??= [], this.event.afterResponse.push(fn);
          break;
        case "trace":
          this.event.trace ??= [], this.event.trace.push(fn);
          break;
        case "error":
          this.event.error ??= [], this.event.error.push(fn);
          break;
        case "stop":
          this.event.stop ??= [], this.event.stop.push(fn);
          break;
      }
    }
    return this;
  }
  as(type) {
    return promoteEvent(this.event.parse, type), promoteEvent(this.event.transform, type), promoteEvent(this.event.beforeHandle, type), promoteEvent(this.event.afterHandle, type), promoteEvent(this.event.mapResponse, type), promoteEvent(this.event.afterResponse, type), promoteEvent(this.event.trace, type), promoteEvent(this.event.error, type), type === "scoped" ? (this.validator.scoped = mergeSchemaValidator(
      this.validator.scoped,
      this.validator.local
    ), this.validator.local = null, this.standaloneValidator.local !== null && (this.standaloneValidator.scoped ||= [], this.standaloneValidator.scoped.push(
      ...this.standaloneValidator.local
    ), this.standaloneValidator.local = null)) : type === "global" && (this.validator.global = mergeSchemaValidator(
      this.validator.global,
      mergeSchemaValidator(
        this.validator.scoped,
        this.validator.local
      )
    ), this.validator.scoped = null, this.validator.local = null, this.standaloneValidator.local !== null && (this.standaloneValidator.scoped ||= [], this.standaloneValidator.scoped.push(
      ...this.standaloneValidator.local
    ), this.standaloneValidator.local = null), this.standaloneValidator.scoped !== null && (this.standaloneValidator.global ||= [], this.standaloneValidator.global.push(
      ...this.standaloneValidator.scoped
    ), this.standaloneValidator.scoped = null)), this;
  }
  /**
   * ### group
   * Encapsulate and group path with prefix
   *
   * ---
   * @example
   * ```typescript
   * new Elysia()
   *     .group('/v1', app => app
   *         .get('/', () => 'Hi')
   *         .get('/name', () => 'Elysia')
   *     })
   * ```
   */
  group(prefix, schemaOrRun, run) {
    const instance = new _Elysia({
      ...this.config,
      prefix: ""
    });
    instance.singleton = { ...this.singleton }, instance.definitions = { ...this.definitions }, instance.getServer = () => this.getServer(), instance.inference = cloneInference(this.inference), instance.extender = { ...this.extender }, instance["~parser"] = this["~parser"], instance.standaloneValidator = {
      local: [...this.standaloneValidator.local ?? []],
      scoped: [...this.standaloneValidator.scoped ?? []],
      global: [...this.standaloneValidator.global ?? []]
    };
    const isSchema = typeof schemaOrRun == "object", sandbox = (isSchema ? run : schemaOrRun)(instance);
    return this.singleton = mergeDeep(this.singleton, instance.singleton), this.definitions = mergeDeep(this.definitions, instance.definitions), sandbox.event.request?.length && (this.event.request = [
      ...this.event.request || [],
      ...sandbox.event.request || []
    ]), sandbox.event.mapResponse?.length && (this.event.mapResponse = [
      ...this.event.mapResponse || [],
      ...sandbox.event.mapResponse || []
    ]), this.model(sandbox.definitions.type), Object.values(instance.router.history).forEach(
      ({ method, path, handler, hooks }) => {
        if (path = (isSchema ? "" : this.config.prefix ?? "") + prefix + path, isSchema) {
          const {
            body,
            headers,
            query,
            params,
            cookie,
            response,
            ...hook
          } = schemaOrRun, localHook = hooks;
          this.applyMacro(hook);
          const hasStandaloneSchema = body || headers || query || params || cookie || response;
          this.add(
            method,
            path,
            handler,
            mergeHook(hook, {
              ...localHook || {},
              error: localHook.error ? Array.isArray(localHook.error) ? [
                ...localHook.error ?? [],
                ...sandbox.event.error ?? []
              ] : [
                localHook.error,
                ...sandbox.event.error ?? []
              ] : sandbox.event.error,
              // Merge macro's standaloneValidator with local and group schema
              standaloneValidator: hook.standaloneValidator || localHook.standaloneValidator || hasStandaloneSchema ? [
                ...hook.standaloneValidator ?? [],
                ...localHook.standaloneValidator ?? [],
                ...hasStandaloneSchema ? [
                  {
                    body,
                    headers,
                    query,
                    params,
                    cookie,
                    response
                  }
                ] : []
              ] : void 0
            }),
            void 0
          );
        } else
          this.add(
            method,
            path,
            handler,
            mergeHook(hooks, {
              error: sandbox.event.error
            }),
            {
              skipPrefix: true
            }
          );
      }
    ), this;
  }
  /**
   * ### guard
   * Encapsulate and pass hook into all child handler
   *
   * ---
   * @example
   * ```typescript
   * import { t } from 'elysia'
   *
   * new Elysia()
   *     .guard({
   *          body: t.Object({
   *              username: t.String(),
   *              password: t.String()
   *          })
   *     }, app => app
   *         .get("/", () => 'Hi')
   *         .get("/name", () => 'Elysia')
   *     })
   * ```
   */
  guard(hook, run) {
    if (!run) {
      if (typeof hook == "object") {
        this.applyMacro(hook), hook.detail && (this.config.detail ? this.config.detail = mergeDeep(
          Object.assign({}, this.config.detail),
          hook.detail
        ) : this.config.detail = hook.detail), hook.tags && (this.config.detail ? this.config.detail.tags = hook.tags : this.config.detail = {
          tags: hook.tags
        });
        const type = hook.as ?? "local";
        if (hook.schema === "standalone") {
          this.standaloneValidator[type] || (this.standaloneValidator[type] = []);
          const response = hook?.response ? typeof hook.response == "string" || Kind$2 in hook.response || "~standard" in hook.response ? {
            200: hook.response
          } : hook?.response : void 0;
          this.standaloneValidator[type].push({
            body: hook.body,
            headers: hook.headers,
            params: hook.params,
            query: hook.query,
            response,
            cookie: hook.cookie
          });
        } else
          this.validator[type] = {
            body: hook.body ?? this.validator[type]?.body,
            headers: hook.headers ?? this.validator[type]?.headers,
            params: hook.params ?? this.validator[type]?.params,
            query: hook.query ?? this.validator[type]?.query,
            response: hook.response ?? this.validator[type]?.response,
            cookie: hook.cookie ?? this.validator[type]?.cookie
          };
        return hook.parse && this.on({ as: type }, "parse", hook.parse), hook.transform && this.on({ as: type }, "transform", hook.transform), hook.derive && this.on({ as: type }, "derive", hook.derive), hook.beforeHandle && this.on({ as: type }, "beforeHandle", hook.beforeHandle), hook.resolve && this.on({ as: type }, "resolve", hook.resolve), hook.afterHandle && this.on({ as: type }, "afterHandle", hook.afterHandle), hook.mapResponse && this.on({ as: type }, "mapResponse", hook.mapResponse), hook.afterResponse && this.on({ as: type }, "afterResponse", hook.afterResponse), hook.error && this.on({ as: type }, "error", hook.error), this;
      }
      return this.guard({}, hook);
    }
    const instance = new _Elysia({
      ...this.config,
      prefix: ""
    });
    instance.singleton = { ...this.singleton }, instance.definitions = { ...this.definitions }, instance.inference = cloneInference(this.inference), instance.extender = { ...this.extender }, instance.getServer = () => this.getServer();
    const sandbox = run(instance);
    return this.singleton = mergeDeep(this.singleton, instance.singleton), this.definitions = mergeDeep(this.definitions, instance.definitions), sandbox.getServer = () => this.server, sandbox.event.request?.length && (this.event.request = [
      ...this.event.request || [],
      ...sandbox.event.request || []
    ]), sandbox.event.mapResponse?.length && (this.event.mapResponse = [
      ...this.event.mapResponse || [],
      ...sandbox.event.mapResponse || []
    ]), this.model(sandbox.definitions.type), Object.values(instance.router.history).forEach(
      ({ method, path, handler, hooks: localHook }) => {
        const {
          body,
          headers,
          query,
          params,
          cookie,
          response,
          ...guardHook
        } = hook, hasStandaloneSchema = body || headers || query || params || cookie || response;
        this.add(
          method,
          path,
          handler,
          mergeHook(guardHook, {
            ...localHook || {},
            error: localHook.error ? Array.isArray(localHook.error) ? [
              ...localHook.error ?? [],
              ...sandbox.event.error ?? []
            ] : [
              localHook.error,
              ...sandbox.event.error ?? []
            ] : sandbox.event.error,
            standaloneValidator: hasStandaloneSchema ? [
              ...localHook.standaloneValidator ?? [],
              {
                body,
                headers,
                query,
                params,
                cookie,
                response
              }
            ] : localHook.standaloneValidator
          })
        );
      }
    ), this;
  }
  /**
   * ### use
   * Merge separate logic of Elysia with current
   *
   * ---
   * @example
   * ```typescript
   * const plugin = (app: Elysia) => app
   *     .get('/plugin', () => 'hi')
   *
   * new Elysia()
   *     .use(plugin)
   * ```
   */
  use(plugin) {
    if (!plugin) return this;
    if (Array.isArray(plugin)) {
      let app = this;
      for (const p of plugin) app = app.use(p);
      return app;
    }
    return plugin instanceof Promise ? (this.promisedModules.add(
      plugin.then((plugin2) => {
        if (typeof plugin2 == "function") return plugin2(this);
        if (plugin2 instanceof _Elysia)
          return this._use(plugin2).compile();
        if (plugin2.constructor?.name === "Elysia")
          return this._use(
            plugin2
          ).compile();
        if (typeof plugin2.default == "function")
          return plugin2.default(this);
        if (plugin2.default instanceof _Elysia)
          return this._use(plugin2.default);
        if (plugin2.constructor?.name === "Elysia")
          return this._use(plugin2.default);
        if (plugin2.constructor?.name === "_Elysia")
          return this._use(plugin2.default);
        try {
          return this._use(plugin2.default);
        } catch (error) {
          throw console.error(
            'Invalid plugin type. Expected Elysia instance, function, or module with "default" as Elysia instance or function that returns Elysia instance.'
          ), error;
        }
      }).then((v) => (v && typeof v.compile == "function" && v.compile(), v))
    ), this) : this._use(plugin);
  }
  propagatePromiseModules(plugin) {
    if (plugin.promisedModules.size <= 0) return this;
    for (const promise of plugin.promisedModules.promises)
      this.promisedModules.add(
        promise.then((v) => {
          if (!v) return;
          const t3 = this._use(v);
          return t3 instanceof Promise ? t3.then((v2) => {
            v2 ? v2.compile() : v.compile();
          }) : v.compile();
        })
      );
    return this;
  }
  _use(plugin) {
    if (typeof plugin == "function") {
      const instance = plugin(this);
      return instance instanceof Promise ? (this.promisedModules.add(
        instance.then((plugin2) => {
          if (plugin2 instanceof _Elysia) {
            plugin2.getServer = () => this.getServer(), plugin2.getGlobalRoutes = () => this.getGlobalRoutes(), plugin2.getGlobalDefinitions = () => this.getGlobalDefinitions(), plugin2.model(this.definitions.type), plugin2.error(this.definitions.error);
            for (const {
              method,
              path,
              handler,
              hooks
            } of Object.values(plugin2.router.history))
              this.add(
                method,
                path,
                handler,
                hooks,
                void 0
              );
            return plugin2 === this ? void 0 : (this.propagatePromiseModules(plugin2), plugin2);
          }
          return typeof plugin2 == "function" ? plugin2(
            this
          ) : typeof plugin2.default == "function" ? plugin2.default(
            this
          ) : this._use(plugin2);
        }).then((v) => (v && typeof v.compile == "function" && v.compile(), v))
      ), this) : instance;
    }
    this.propagatePromiseModules(plugin);
    const name = plugin.config.name, seed = plugin.config.seed;
    if (plugin.getParent = () => this, plugin.getServer = () => this.getServer(), plugin.getGlobalRoutes = () => this.getGlobalRoutes(), plugin.getGlobalDefinitions = () => this.getGlobalDefinitions(), plugin.standaloneValidator?.scoped && (this.standaloneValidator.local ? this.standaloneValidator.local = this.standaloneValidator.local.concat(
      plugin.standaloneValidator.scoped
    ) : this.standaloneValidator.local = plugin.standaloneValidator.scoped), plugin.standaloneValidator?.global && (this.standaloneValidator.global ? this.standaloneValidator.global = this.standaloneValidator.global.concat(
      plugin.standaloneValidator.global
    ) : this.standaloneValidator.global = plugin.standaloneValidator.global), isNotEmpty(plugin["~parser"]) && (this["~parser"] = {
      ...plugin["~parser"],
      ...this["~parser"]
    }), plugin.setHeaders && this.headers(plugin.setHeaders), name) {
      name in this.dependencies || (this.dependencies[name] = []);
      const current = seed !== void 0 ? checksum(name + JSON.stringify(seed)) : 0;
      this.dependencies[name].some(
        ({ checksum: checksum3 }) => current === checksum3
      ) || (this.extender.macro = {
        ...this.extender.macro,
        ...plugin.extender.macro
      }, this.extender.higherOrderFunctions = this.extender.higherOrderFunctions.concat(
        plugin.extender.higherOrderFunctions
      ));
    } else
      isNotEmpty(plugin.extender.macro) && (this.extender.macro = {
        ...this.extender.macro,
        ...plugin.extender.macro
      }), plugin.extender.higherOrderFunctions.length && (this.extender.higherOrderFunctions = this.extender.higherOrderFunctions.concat(
        plugin.extender.higherOrderFunctions
      ));
    if (plugin.extender.higherOrderFunctions.length) {
      deduplicateChecksum(this.extender.higherOrderFunctions);
      const hofHashes = [];
      for (let i = 0; i < this.extender.higherOrderFunctions.length; i++) {
        const hof = this.extender.higherOrderFunctions[i];
        hof.checksum && (hofHashes.includes(hof.checksum) && (this.extender.higherOrderFunctions.splice(i, 1), i--), hofHashes.push(hof.checksum));
      }
      hofHashes.length = 0;
    }
    this.inference = mergeInference(this.inference, plugin.inference), isNotEmpty(plugin.singleton.decorator) && this.decorate(plugin.singleton.decorator), isNotEmpty(plugin.singleton.store) && this.state(plugin.singleton.store), isNotEmpty(plugin.definitions.type) && this.model(plugin.definitions.type), isNotEmpty(plugin.definitions.error) && this.error(plugin.definitions.error), isNotEmpty(plugin.extender.macro) && (this.extender.macro = {
      ...this.extender.macro,
      ...plugin.extender.macro
    });
    for (const { method, path, handler, hooks } of Object.values(
      plugin.router.history
    ))
      this.add(method, path, handler, hooks);
    if (name) {
      name in this.dependencies || (this.dependencies[name] = []);
      const current = seed !== void 0 ? checksum(name + JSON.stringify(seed)) : 0;
      if (this.dependencies[name].some(
        ({ checksum: checksum3 }) => current === checksum3
      ))
        return this;
      this.dependencies[name].push(
        this.config?.analytic ? {
          name: plugin.config.name,
          seed: plugin.config.seed,
          checksum: current,
          dependencies: plugin.dependencies,
          stack: plugin.telemetry?.stack,
          routes: plugin.router.history,
          decorators: plugin.singleton,
          store: plugin.singleton.store,
          error: plugin.definitions.error,
          derive: plugin.event.transform?.filter((x) => x?.subType === "derive").map((x) => ({
            fn: x.toString(),
            stack: new Error().stack ?? ""
          })),
          resolve: plugin.event.transform?.filter((x) => x?.subType === "resolve").map((x) => ({
            fn: x.toString(),
            stack: new Error().stack ?? ""
          }))
        } : {
          name: plugin.config.name,
          seed: plugin.config.seed,
          checksum: current,
          dependencies: plugin.dependencies
        }
      ), isNotEmpty(plugin.event) && (this.event = mergeLifeCycle(
        this.event,
        filterGlobalHook(plugin.event),
        current
      ));
    } else
      isNotEmpty(plugin.event) && (this.event = mergeLifeCycle(
        this.event,
        filterGlobalHook(plugin.event)
      ));
    return plugin.validator.global && (this.validator.global = mergeHook(this.validator.global, {
      ...plugin.validator.global
    })), plugin.validator.scoped && (this.validator.local = mergeHook(this.validator.local, {
      ...plugin.validator.scoped
    })), this;
  }
  macro(macroOrName, macro) {
    if (typeof macroOrName == "string" && !macro)
      throw new Error("Macro function is required");
    return typeof macroOrName == "string" ? this.extender.macro[macroOrName] = macro : this.extender.macro = {
      ...this.extender.macro,
      ...macroOrName
    }, this;
  }
  applyMacro(localHook, appliable = localHook, {
    iteration = 0,
    applied = {}
  } = {}) {
    if (iteration >= 16) return;
    const macro = this.extender.macro;
    for (let [key, value] of Object.entries(appliable)) {
      if (!(key in macro)) continue;
      const macroHook = typeof macro[key] == "function" ? macro[key](value) : macro[key];
      if (!macroHook || typeof macro[key] == "object" && value === false)
        return;
      const seed = checksum(key + JSON.stringify(macroHook.seed ?? value));
      if (!(seed in applied)) {
        applied[seed] = true;
        for (let [k, value2] of Object.entries(macroHook))
          if (k !== "seed") {
            if (k in emptySchema) {
              insertStandaloneValidator(
                localHook,
                k,
                value2
              ), delete localHook[key];
              continue;
            }
            if (k === "introspect") {
              value2?.(localHook), delete localHook[key];
              continue;
            }
            if (k === "detail") {
              localHook.detail || (localHook.detail = {}), localHook.detail = mergeDeep(localHook.detail, value2, {
                mergeArray: true
              }), delete localHook[key];
              continue;
            }
            if (k in macro) {
              this.applyMacro(
                localHook,
                { [k]: value2 },
                { applied, iteration: iteration + 1 }
              ), delete localHook[key];
              continue;
            }
            switch ((k === "derive" || k === "resolve") && typeof value2 == "function" && (value2 = {
              fn: value2,
              subType: k
            }), typeof localHook[k]) {
              case "function":
                localHook[k] = [localHook[k], value2];
                break;
              case "object":
                Array.isArray(localHook[k]) ? localHook[k].push(value2) : localHook[k] = [localHook[k], value2];
                break;
              case "undefined":
                localHook[k] = value2;
                break;
            }
            delete localHook[key];
          }
      }
    }
  }
  mount(path, handleOrConfig, config) {
    if (path instanceof _Elysia || typeof path == "function" || path.length === 0 || path === "/") {
      const run = typeof path == "function" ? path : path instanceof _Elysia ? path.compile().fetch : handleOrConfig instanceof _Elysia ? handleOrConfig.compile().fetch : typeof handleOrConfig == "function" ? handleOrConfig : (() => {
        throw new Error("Invalid handler");
      })(), handler2 = ({ request, path: path2 }) => run(
        new Request(replaceUrlPath(request.url, path2), {
          method: request.method,
          headers: request.headers,
          signal: request.signal,
          credentials: request.credentials,
          referrerPolicy: request.referrerPolicy,
          duplex: request.duplex,
          redirect: request.redirect,
          mode: request.mode,
          keepalive: request.keepalive,
          integrity: request.integrity,
          body: request.body
        })
      );
      return this.route("ALL", "/*", handler2, {
        parse: "none",
        ...config,
        detail: {
          ...config?.detail,
          hide: true
        },
        config: {
          mount: run
        }
      }), this;
    }
    const handle = handleOrConfig instanceof _Elysia ? handleOrConfig.compile().fetch : typeof handleOrConfig == "function" ? handleOrConfig : (() => {
      throw new Error("Invalid handler");
    })(), length = (typeof path == "string" && this.config.prefix ? this.config.prefix + path : path).length - (path.endsWith("*") ? 1 : 0), handler = ({ request, path: path2 }) => handle(
      new Request(
        replaceUrlPath(request.url, path2.slice(length) || "/"),
        {
          method: request.method,
          headers: request.headers,
          signal: request.signal,
          credentials: request.credentials,
          referrerPolicy: request.referrerPolicy,
          duplex: request.duplex,
          redirect: request.redirect,
          mode: request.mode,
          keepalive: request.keepalive,
          integrity: request.integrity,
          body: request.body
        }
      )
    );
    return this.route("ALL", path, handler, {
      parse: "none",
      ...config,
      detail: {
        ...config?.detail,
        hide: true
      },
      config: {
        mount: handle
      }
    }), this.route(
      "ALL",
      path + (path.endsWith("/") ? "*" : "/*"),
      handler,
      {
        parse: "none",
        ...config,
        detail: {
          ...config?.detail,
          hide: true
        },
        config: {
          mount: handle
        }
      }
    ), this;
  }
  /**
   * ### get
   * Register handler for path with method [GET]
   *
   * ---
   * @example
   * ```typescript
   * import { Elysia, t } from 'elysia'
   *
   * new Elysia()
   *     .get('/', () => 'hi')
   *     .get('/with-hook', () => 'hi', {
   *         response: t.String()
   *     })
   * ```
   */
  get(path, handler, hook) {
    return this.add("GET", path, handler, hook), this;
  }
  /**
   * ### post
   * Register handler for path with method [POST]
   *
   * ---
   * @example
   * ```typescript
   * import { Elysia, t } from 'elysia'
   *
   * new Elysia()
   *     .post('/', () => 'hi')
   *     .post('/with-hook', () => 'hi', {
   *         response: t.String()
   *     })
   * ```
   */
  post(path, handler, hook) {
    return this.add("POST", path, handler, hook), this;
  }
  /**
   * ### put
   * Register handler for path with method [PUT]
   *
   * ---
   * @example
   * ```typescript
   * import { Elysia, t } from 'elysia'
   *
   * new Elysia()
   *     .put('/', () => 'hi')
   *     .put('/with-hook', () => 'hi', {
   *         response: t.String()
   *     })
   * ```
   */
  put(path, handler, hook) {
    return this.add("PUT", path, handler, hook), this;
  }
  /**
   * ### patch
   * Register handler for path with method [PATCH]
   *
   * ---
   * @example
   * ```typescript
   * import { Elysia, t } from 'elysia'
   *
   * new Elysia()
   *     .patch('/', () => 'hi')
   *     .patch('/with-hook', () => 'hi', {
   *         response: t.String()
   *     })
   * ```
   */
  patch(path, handler, hook) {
    return this.add("PATCH", path, handler, hook), this;
  }
  /**
   * ### delete
   * Register handler for path with method [DELETE]
   *
   * ---
   * @example
   * ```typescript
   * import { Elysia, t } from 'elysia'
   *
   * new Elysia()
   *     .delete('/', () => 'hi')
   *     .delete('/with-hook', () => 'hi', {
   *         response: t.String()
   *     })
   * ```
   */
  delete(path, handler, hook) {
    return this.add("DELETE", path, handler, hook), this;
  }
  /**
   * ### options
   * Register handler for path with method [POST]
   *
   * ---
   * @example
   * ```typescript
   * import { Elysia, t } from 'elysia'
   *
   * new Elysia()
   *     .options('/', () => 'hi')
   *     .options('/with-hook', () => 'hi', {
   *         response: t.String()
   *     })
   * ```
   */
  options(path, handler, hook) {
    return this.add("OPTIONS", path, handler, hook), this;
  }
  /**
   * ### all
   * Register handler for path with method [ALL]
   *
   * ---
   * @example
   * ```typescript
   * import { Elysia, t } from 'elysia'
   *
   * new Elysia()
   *     .all('/', () => 'hi')
   *     .all('/with-hook', () => 'hi', {
   *         response: t.String()
   *     })
   * ```
   */
  all(path, handler, hook) {
    return this.add("ALL", path, handler, hook), this;
  }
  /**
   * ### head
   * Register handler for path with method [HEAD]
   *
   * ---
   * @example
   * ```typescript
   * import { Elysia, t } from 'elysia'
   *
   * new Elysia()
   *     .head('/', () => 'hi')
   *     .head('/with-hook', () => 'hi', {
   *         response: t.String()
   *     })
   * ```
   */
  head(path, handler, hook) {
    return this.add("HEAD", path, handler, hook), this;
  }
  /**
   * ### connect
   * Register handler for path with method [CONNECT]
   *
   * ---
   * @example
   * ```typescript
   * import { Elysia, t } from 'elysia'
   *
   * new Elysia()
   *     .connect('/', () => 'hi')
   *     .connect('/with-hook', () => 'hi', {
   *         response: t.String()
   *     })
   * ```
   */
  connect(path, handler, hook) {
    return this.add("CONNECT", path, handler, hook), this;
  }
  /**
   * ### route
   * Register handler for path with method [ROUTE]
   *
   * ---
   * @example
   * ```typescript
   * import { Elysia, t } from 'elysia'
   *
   * new Elysia()
   *     .route('/', () => 'hi')
   *     .route('/with-hook', () => 'hi', {
   *         response: t.String()
   *     })
   * ```
   */
  route(method, path, handler, hook) {
    return this.add(method.toUpperCase(), path, handler, hook, hook?.config), this;
  }
  /**
   * ### ws
   * Register handler for path with method [ws]
   *
   * ---
   * @example
   * ```typescript
   * import { Elysia, t } from 'elysia'
   *
   * new Elysia()
   *     .ws('/', {
   *         message(ws, message) {
   *             ws.send(message)
   *         }
   *     })
   * ```
   */
  ws(path, options) {
    return this["~adapter"].ws ? this["~adapter"].ws(this, path, options) : console.warn("Current adapter doesn't support WebSocket"), this;
  }
  /**
   * ### state
   * Assign global mutatable state accessible for all handler
   *
   * ---
   * @example
   * ```typescript
   * new Elysia()
   *     .state('counter', 0)
   *     .get('/', (({ counter }) => ++counter)
   * ```
   */
  state(options, name, value) {
    name === void 0 ? (value = options, options = { as: "append" }, name = "") : value === void 0 && (typeof options == "string" ? (value = name, name = options, options = { as: "append" }) : typeof options == "object" && (value = name, name = ""));
    const { as } = options;
    if (typeof name != "string") return this;
    switch (typeof value) {
      case "object":
        return !value || !isNotEmpty(value) ? this : name ? (name in this.singleton.store ? this.singleton.store[name] = mergeDeep(
          this.singleton.store[name],
          value,
          {
            override: as === "override"
          }
        ) : this.singleton.store[name] = value, this) : value === null ? this : (this.singleton.store = mergeDeep(this.singleton.store, value, {
          override: as === "override"
        }), this);
      case "function":
        return name ? (as === "override" || !(name in this.singleton.store)) && (this.singleton.store[name] = value) : this.singleton.store = value(this.singleton.store), this;
      default:
        return (as === "override" || !(name in this.singleton.store)) && (this.singleton.store[name] = value), this;
    }
  }
  /**
   * ### decorate
   * Define custom method to `Context` accessible for all handler
   *
   * ---
   * @example
   * ```typescript
   * new Elysia()
   *     .decorate('getDate', () => Date.now())
   *     .get('/', (({ getDate }) => getDate())
   * ```
   */
  decorate(options, name, value) {
    name === void 0 ? (value = options, options = { as: "append" }, name = "") : value === void 0 && (typeof options == "string" ? (value = name, name = options, options = { as: "append" }) : typeof options == "object" && (value = name, name = ""));
    const { as } = options;
    if (typeof name != "string") return this;
    switch (typeof value) {
      case "object":
        return name ? (name in this.singleton.decorator ? this.singleton.decorator[name] = mergeDeep(
          this.singleton.decorator[name],
          value,
          {
            override: as === "override"
          }
        ) : this.singleton.decorator[name] = value, this) : value === null ? this : (this.singleton.decorator = mergeDeep(
          this.singleton.decorator,
          value,
          {
            override: as === "override"
          }
        ), this);
      case "function":
        return name ? (as === "override" || !(name in this.singleton.decorator)) && (this.singleton.decorator[name] = value) : this.singleton.decorator = value(this.singleton.decorator), this;
      default:
        return (as === "override" || !(name in this.singleton.decorator)) && (this.singleton.decorator[name] = value), this;
    }
  }
  derive(optionsOrTransform, transform) {
    transform || (transform = optionsOrTransform, optionsOrTransform = { as: "local" });
    const hook = {
      subType: "derive",
      fn: transform
    };
    return this.onTransform(optionsOrTransform, hook);
  }
  model(name, model) {
    const onlyTypebox = (a) => {
      const res = {};
      for (const key in a) "~standard" in a[key] || (res[key] = a[key]);
      return res;
    };
    switch (typeof name) {
      case "object":
        const parsedTypebox = {}, kvs = Object.entries(name);
        if (!kvs.length) return this;
        for (const [key, value] of kvs)
          key in this.definitions.type || ("~standard" in value ? this.definitions.type[key] = value : (parsedTypebox[key] = this.definitions.type[key] = value, parsedTypebox[key].$id ??= `#/components/schemas/${key}`));
        return this.definitions.typebox = t.Module({
          ...this.definitions.typebox.$defs,
          ...parsedTypebox
        }), this;
      case "function":
        const result = name(this.definitions.type);
        return this.definitions.type = result, this.definitions.typebox = t.Module(onlyTypebox(result)), this;
      case "string":
        if (!model) break;
        if (this.definitions.type[name] = model, "~standard" in model) return this;
        const newModel = {
          ...model,
          id: model.$id ?? `#/components/schemas/${name}`
        };
        return this.definitions.typebox = t.Module({
          ...this.definitions.typebox.$defs,
          ...newModel
        }), this;
    }
    return model ? (this.definitions.type[name] = model, "~standard" in model ? this : (this.definitions.typebox = t.Module({
      ...this.definitions.typebox.$defs,
      [name]: model
    }), this)) : this;
  }
  Ref(key) {
    return t.Ref(key);
  }
  mapDerive(optionsOrDerive, mapper) {
    mapper || (mapper = optionsOrDerive, optionsOrDerive = { as: "local" });
    const hook = {
      subType: "mapDerive",
      fn: mapper
    };
    return this.onTransform(optionsOrDerive, hook);
  }
  affix(base, type, word) {
    if (word === "") return this;
    const delimieter = ["_", "-", " "], capitalize = (word2) => word2[0].toUpperCase() + word2.slice(1), joinKey = base === "prefix" ? (prefix, word2) => delimieter.includes(prefix.at(-1) ?? "") ? prefix + word2 : prefix + capitalize(word2) : delimieter.includes(word.at(-1) ?? "") ? (suffix, word2) => word2 + suffix : (suffix, word2) => word2 + capitalize(suffix), remap = (type2) => {
      const store = {};
      switch (type2) {
        case "decorator":
          for (const key in this.singleton.decorator)
            store[joinKey(word, key)] = this.singleton.decorator[key];
          this.singleton.decorator = store;
          break;
        case "state":
          for (const key in this.singleton.store)
            store[joinKey(word, key)] = this.singleton.store[key];
          this.singleton.store = store;
          break;
        case "model":
          for (const key in this.definitions.type)
            store[joinKey(word, key)] = this.definitions.type[key];
          this.definitions.type = store;
          break;
        case "error":
          for (const key in this.definitions.error)
            store[joinKey(word, key)] = this.definitions.error[key];
          this.definitions.error = store;
          break;
      }
    }, types = Array.isArray(type) ? type : [type];
    for (const type2 of types.some((x) => x === "all") ? ["decorator", "state", "model", "error"] : types)
      remap(type2);
    return this;
  }
  prefix(type, word) {
    return this.affix("prefix", type, word);
  }
  suffix(type, word) {
    return this.affix("suffix", type, word);
  }
  compile() {
    return this["~adapter"].beforeCompile?.(this), this["~adapter"].isWebStandard ? (this._handle = this.config.aot ? composeGeneralHandler(this) : createDynamicHandler(this), Object.defineProperty(this, "fetch", {
      value: this._handle,
      configurable: true,
      writable: true
    }), typeof this.server?.reload == "function" && this.server.reload({
      ...this.server || {},
      fetch: this.fetch
    }), this) : (typeof this.server?.reload == "function" && this.server.reload(this.server || {}), this._handle = composeGeneralHandler(this), this);
  }
  /**
   * Use handle can be either sync or async to save performance.
   *
   * Beside benchmark purpose, please use 'handle' instead.
   */
  get fetch() {
    const fetch = this.config.aot ? composeGeneralHandler(this) : createDynamicHandler(this);
    return Object.defineProperty(this, "fetch", {
      value: fetch,
      configurable: true,
      writable: true
    }), fetch;
  }
  /**
   * Wait until all lazy loaded modules all load is fully
   */
  get modules() {
    return this.promisedModules;
  }
};
let Elysia = _Elysia;

var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/swagger/index.ts
function isSchemaObject(schema) {
  return "type" in schema || "properties" in schema || "items" in schema;
}
function isDateTimeProperty(key, schema) {
  return (key === "createdAt" || key === "updatedAt") && "anyOf" in schema && Array.isArray(schema.anyOf);
}
function transformDateProperties(schema) {
  if (!isSchemaObject(schema) || typeof schema !== "object" || schema === null)
    return schema;
  const newSchema = { ...schema };
  Object.entries(newSchema).forEach(([key, value]) => {
    if (isSchemaObject(value)) {
      if (isDateTimeProperty(key, value)) {
        const dateTimeFormat = value.anyOf?.find(
          (item) => isSchemaObject(item) && item.format === "date-time"
        );
        if (dateTimeFormat) {
          const dateTimeSchema = {
            type: "string",
            format: "date-time",
            default: dateTimeFormat.default
          };
          newSchema[key] = dateTimeSchema;
        }
      } else {
        newSchema[key] = transformDateProperties(value);
      }
    }
  });
  return newSchema;
}
var SwaggerUIRender = (info, config2) => {
  const {
    version: version2 = "latest",
    theme = `https://unpkg.com/swagger-ui-dist@${version2 ?? "latest"}/swagger-ui.css`,
    cdn = `https://unpkg.com/swagger-ui-dist@${version2}/swagger-ui-bundle.js`,
    autoDarkMode = true,
    ...rest
  } = config2;
  const stringifiedOptions = JSON.stringify(
    {
      dom_id: "#swagger-ui",
      ...rest
    },
    (_, value) => typeof value === "function" ? void 0 : value
  );
  const options = JSON.parse(stringifiedOptions);
  if (options.components && options.components.schemas)
    options.components.schemas = Object.fromEntries(
      Object.entries(options.components.schemas).map(([key, schema]) => [
        key,
        transformDateProperties(schema)
      ])
    );
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${info.title}</title>
    <meta
        name="description"
        content="${info.description}"
    />
    <meta
        name="og:description"
        content="${info.description}"
    />
    ${autoDarkMode && typeof theme === "string" ? `<style>
@media (prefers-color-scheme: dark) {
    body {
        background-color: #222;
        color: #faf9a;
    }
    .swagger-ui {
        filter: invert(92%) hue-rotate(180deg);
    }

    .swagger-ui .microlight {
        filter: invert(100%) hue-rotate(180deg);
    }
}
</style>` : ""}
    ${typeof theme === "string" ? `<link rel="stylesheet" href="${theme}" />` : `<link rel="stylesheet" media="(prefers-color-scheme: light)" href="${theme.light}" />
<link rel="stylesheet" media="(prefers-color-scheme: dark)" href="${theme.dark}" />`}
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="${cdn}" crossorigin></script>
    <script>
        window.onload = () => {
            window.ui = SwaggerUIBundle(${stringifiedOptions});
        };
    </script>
</body>
</html>`;
};

// src/scalar/index.ts
var elysiaCSS = `.light-mode {
  --scalar-color-1: #2a2f45;
  --scalar-color-2: #757575;
  --scalar-color-3: #8e8e8e;
  --scalar-color-accent: #f06292;

  --scalar-background-1: #fff;
  --scalar-background-2: #f6f6f6;
  --scalar-background-3: #e7e7e7;

  --scalar-border-color: rgba(0, 0, 0, 0.1);
}
.dark-mode {
  --scalar-color-1: rgba(255, 255, 255, 0.9);
  --scalar-color-2: rgba(156, 163, 175, 1);
  --scalar-color-3: rgba(255, 255, 255, 0.44);
  --scalar-color-accent: #f06292;

  --scalar-background-1: #111728;
  --scalar-background-2: #1e293b;
  --scalar-background-3: #334155;
  --scalar-background-accent: #f062921f;

  --scalar-border-color: rgba(255, 255, 255, 0.1);
}

/* Document Sidebar */
.light-mode .t-doc__sidebar,
.dark-mode .t-doc__sidebar {
  --scalar-sidebar-background-1: var(--scalar-background-1);
  --scalar-sidebar-color-1: var(--scalar-color-1);
  --scalar-sidebar-color-2: var(--scalar-color-2);
  --scalar-sidebar-border-color: var(--scalar-border-color);

  --scalar-sidebar-item-hover-background: var(--scalar-background-2);
  --scalar-sidebar-item-hover-color: currentColor;

  --scalar-sidebar-item-active-background: #f062921f;
  --scalar-sidebar-color-active: var(--scalar-color-accent);

  --scalar-sidebar-search-background: transparent;
  --scalar-sidebar-search-color: var(--scalar-color-3);
  --scalar-sidebar-search-border-color: var(--scalar-border-color);
}

/* advanced */
.light-mode {
  --scalar-button-1: rgb(49 53 56);
  --scalar-button-1-color: #fff;
  --scalar-button-1-hover: rgb(28 31 33);

  --scalar-color-green: #069061;
  --scalar-color-red: #ef0006;
  --scalar-color-yellow: #edbe20;
  --scalar-color-blue: #0082d0;
  --scalar-color-orange: #fb892c;
  --scalar-color-purple: #5203d1;

  --scalar-scrollbar-color: rgba(0, 0, 0, 0.18);
  --scalar-scrollbar-color-active: rgba(0, 0, 0, 0.36);
}
.dark-mode {
  --scalar-button-1: #f6f6f6;
  --scalar-button-1-color: #000;
  --scalar-button-1-hover: #e7e7e7;

  --scalar-color-green: #a3ffa9;
  --scalar-color-red: #ffa3a3;
  --scalar-color-yellow: #fffca3;
  --scalar-color-blue: #a5d6ff;
  --scalar-color-orange: #e2ae83;
  --scalar-color-purple: #d2a8ff;

  --scalar-scrollbar-color: rgba(255, 255, 255, 0.24);
  --scalar-scrollbar-color-active: rgba(255, 255, 255, 0.48);
}
.section-flare {
  width: 100%;
  height: 400px;
  position: absolute;
}
.section-flare-item:first-of-type:before {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  --stripes: repeating-linear-gradient(100deg, #fff 0%, #fff 0%, transparent 2%, transparent 12%, #fff 17%);
  --stripesDark: repeating-linear-gradient(100deg, #000 0%, #000 0%, transparent 10%, transparent 12%, #000 17%);
  --rainbow: repeating-linear-gradient(100deg, #60a5fa 10%, #e879f9 16%, #5eead4 22%, #60a5fa 30%);
  contain: strict;
  contain-intrinsic-size: 100vw 40vh;
  background-image: var(--stripesDark), var(--rainbow);
  background-size: 300%, 200%;
  background-position: 50% 50%, 50% 50%;
  filter: opacity(20%) saturate(200%);
  -webkit-mask-image: radial-gradient(ellipse at 100% 0%, black 40%, transparent 70%);
  mask-image: radial-gradient(ellipse at 100% 0%, black 40%, transparent 70%);
  pointer-events: none;
}
.section-flare-item:first-of-type:after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-image: var(--stripes), var(--rainbow);
  background-size: 200%, 100%;
  background-attachment: fixed;
  mix-blend-mode: difference;
  background-image: var(--stripesDark), var(--rainbow);
  pointer-events: none;
}
.light-mode .section-flare-item:first-of-type:after,
.light-mode .section-flare-item:first-of-type:before {
  background-image: var(--stripes), var(--rainbow);
  filter: opacity(4%) saturate(200%);
}`;
var ScalarRender = (info, config2, embedSpec) => `<!doctype html>
<html>
  <head>
    <title>${info.title}</title>
    <meta
        name="description"
        content="${info.description}"
    />
    <meta
        name="og:description"
        content="${info.description}"
    />
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1" />
    <style>
      body {
        margin: 0;
      }
    </style>
    <style>
      ${config2.customCss ?? elysiaCSS}
    </style>
  </head>
  <body>
    <script
      id="api-reference"
      data-configuration='${JSON.stringify(
  Object.assign(
    config2,
    {
      content: embedSpec
    }
  )
)}'
    >
    </script>
    <script src="${config2.cdn}" crossorigin></script>
  </body>
</html>`;

// node_modules/@sinclair/typebox/build/esm/type/guard/value.mjs
var value_exports = {};
__export(value_exports, {
  HasPropertyKey: () => HasPropertyKey,
  IsArray: () => IsArray,
  IsAsyncIterator: () => IsAsyncIterator,
  IsBigInt: () => IsBigInt,
  IsBoolean: () => IsBoolean,
  IsDate: () => IsDate,
  IsFunction: () => IsFunction,
  IsIterator: () => IsIterator,
  IsNull: () => IsNull,
  IsNumber: () => IsNumber,
  IsObject: () => IsObject,
  IsRegExp: () => IsRegExp,
  IsString: () => IsString,
  IsSymbol: () => IsSymbol,
  IsUint8Array: () => IsUint8Array,
  IsUndefined: () => IsUndefined
});
function HasPropertyKey(value, key) {
  return key in value;
}
function IsAsyncIterator(value) {
  return IsObject(value) && !IsArray(value) && !IsUint8Array(value) && Symbol.asyncIterator in value;
}
function IsArray(value) {
  return Array.isArray(value);
}
function IsBigInt(value) {
  return typeof value === "bigint";
}
function IsBoolean(value) {
  return typeof value === "boolean";
}
function IsDate(value) {
  return value instanceof globalThis.Date;
}
function IsFunction(value) {
  return typeof value === "function";
}
function IsIterator(value) {
  return IsObject(value) && !IsArray(value) && !IsUint8Array(value) && Symbol.iterator in value;
}
function IsNull(value) {
  return value === null;
}
function IsNumber(value) {
  return typeof value === "number";
}
function IsObject(value) {
  return typeof value === "object" && value !== null;
}
function IsRegExp(value) {
  return value instanceof globalThis.RegExp;
}
function IsString(value) {
  return typeof value === "string";
}
function IsSymbol(value) {
  return typeof value === "symbol";
}
function IsUint8Array(value) {
  return value instanceof globalThis.Uint8Array;
}
function IsUndefined(value) {
  return value === void 0;
}

// node_modules/@sinclair/typebox/build/esm/value/guard/guard.mjs
function IsObject2(value) {
  return value !== null && typeof value === "object";
}
function IsArray2(value) {
  return globalThis.Array.isArray(value) && !globalThis.ArrayBuffer.isView(value);
}
function IsUndefined2(value) {
  return value === void 0;
}
function IsNumber2(value) {
  return typeof value === "number";
}

// node_modules/@sinclair/typebox/build/esm/system/policy.mjs
var TypeSystemPolicy;
(function(TypeSystemPolicy2) {
  TypeSystemPolicy2.InstanceMode = "default";
  TypeSystemPolicy2.ExactOptionalPropertyTypes = false;
  TypeSystemPolicy2.AllowArrayObject = false;
  TypeSystemPolicy2.AllowNaN = false;
  TypeSystemPolicy2.AllowNullVoid = false;
  function IsExactOptionalProperty(value, key) {
    return TypeSystemPolicy2.ExactOptionalPropertyTypes ? key in value : value[key] !== void 0;
  }
  TypeSystemPolicy2.IsExactOptionalProperty = IsExactOptionalProperty;
  function IsObjectLike(value) {
    const isObject2 = IsObject2(value);
    return TypeSystemPolicy2.AllowArrayObject ? isObject2 : isObject2 && !IsArray2(value);
  }
  TypeSystemPolicy2.IsObjectLike = IsObjectLike;
  function IsRecordLike(value) {
    return IsObjectLike(value) && !(value instanceof Date) && !(value instanceof Uint8Array);
  }
  TypeSystemPolicy2.IsRecordLike = IsRecordLike;
  function IsNumberLike(value) {
    return TypeSystemPolicy2.AllowNaN ? IsNumber2(value) : Number.isFinite(value);
  }
  TypeSystemPolicy2.IsNumberLike = IsNumberLike;
  function IsVoidLike(value) {
    const isUndefined = IsUndefined2(value);
    return TypeSystemPolicy2.AllowNullVoid ? isUndefined || value === null : isUndefined;
  }
  TypeSystemPolicy2.IsVoidLike = IsVoidLike;
})(TypeSystemPolicy || (TypeSystemPolicy = {}));

// node_modules/@sinclair/typebox/build/esm/type/error/error.mjs
var TypeBoxError = class extends Error {
  constructor(message) {
    super(message);
  }
};

// node_modules/@sinclair/typebox/build/esm/type/guard/kind.mjs
var kind_exports = {};
__export(kind_exports, {
  IsAny: () => IsAny,
  IsArgument: () => IsArgument,
  IsArray: () => IsArray3,
  IsAsyncIterator: () => IsAsyncIterator2,
  IsBigInt: () => IsBigInt2,
  IsBoolean: () => IsBoolean2,
  IsComputed: () => IsComputed,
  IsConstructor: () => IsConstructor,
  IsDate: () => IsDate2,
  IsFunction: () => IsFunction2,
  IsImport: () => IsImport,
  IsInteger: () => IsInteger,
  IsIntersect: () => IsIntersect,
  IsIterator: () => IsIterator2,
  IsKind: () => IsKind,
  IsKindOf: () => IsKindOf,
  IsLiteral: () => IsLiteral,
  IsLiteralBoolean: () => IsLiteralBoolean,
  IsLiteralNumber: () => IsLiteralNumber,
  IsLiteralString: () => IsLiteralString,
  IsLiteralValue: () => IsLiteralValue,
  IsMappedKey: () => IsMappedKey,
  IsMappedResult: () => IsMappedResult,
  IsNever: () => IsNever,
  IsNot: () => IsNot,
  IsNull: () => IsNull2,
  IsNumber: () => IsNumber3,
  IsObject: () => IsObject3,
  IsOptional: () => IsOptional,
  IsPromise: () => IsPromise,
  IsProperties: () => IsProperties,
  IsReadonly: () => IsReadonly,
  IsRecord: () => IsRecord,
  IsRecursive: () => IsRecursive,
  IsRef: () => IsRef,
  IsRegExp: () => IsRegExp2,
  IsSchema: () => IsSchema,
  IsString: () => IsString2,
  IsSymbol: () => IsSymbol2,
  IsTemplateLiteral: () => IsTemplateLiteral,
  IsThis: () => IsThis,
  IsTransform: () => IsTransform,
  IsTuple: () => IsTuple,
  IsUint8Array: () => IsUint8Array2,
  IsUndefined: () => IsUndefined3,
  IsUnion: () => IsUnion,
  IsUnknown: () => IsUnknown,
  IsUnsafe: () => IsUnsafe,
  IsVoid: () => IsVoid
});

// node_modules/@sinclair/typebox/build/esm/type/symbols/symbols.mjs
var TransformKind = /* @__PURE__ */ Symbol.for("TypeBox.Transform");
var ReadonlyKind = /* @__PURE__ */ Symbol.for("TypeBox.Readonly");
var OptionalKind = /* @__PURE__ */ Symbol.for("TypeBox.Optional");
var Hint = /* @__PURE__ */ Symbol.for("TypeBox.Hint");
var Kind = /* @__PURE__ */ Symbol.for("TypeBox.Kind");

// node_modules/@sinclair/typebox/build/esm/type/guard/kind.mjs
function IsReadonly(value) {
  return IsObject(value) && value[ReadonlyKind] === "Readonly";
}
function IsOptional(value) {
  return IsObject(value) && value[OptionalKind] === "Optional";
}
function IsAny(value) {
  return IsKindOf(value, "Any");
}
function IsArgument(value) {
  return IsKindOf(value, "Argument");
}
function IsArray3(value) {
  return IsKindOf(value, "Array");
}
function IsAsyncIterator2(value) {
  return IsKindOf(value, "AsyncIterator");
}
function IsBigInt2(value) {
  return IsKindOf(value, "BigInt");
}
function IsBoolean2(value) {
  return IsKindOf(value, "Boolean");
}
function IsComputed(value) {
  return IsKindOf(value, "Computed");
}
function IsConstructor(value) {
  return IsKindOf(value, "Constructor");
}
function IsDate2(value) {
  return IsKindOf(value, "Date");
}
function IsFunction2(value) {
  return IsKindOf(value, "Function");
}
function IsImport(value) {
  return IsKindOf(value, "Import");
}
function IsInteger(value) {
  return IsKindOf(value, "Integer");
}
function IsProperties(value) {
  return IsObject(value);
}
function IsIntersect(value) {
  return IsKindOf(value, "Intersect");
}
function IsIterator2(value) {
  return IsKindOf(value, "Iterator");
}
function IsKindOf(value, kind) {
  return IsObject(value) && Kind in value && value[Kind] === kind;
}
function IsLiteralString(value) {
  return IsLiteral(value) && IsString(value.const);
}
function IsLiteralNumber(value) {
  return IsLiteral(value) && IsNumber(value.const);
}
function IsLiteralBoolean(value) {
  return IsLiteral(value) && IsBoolean(value.const);
}
function IsLiteralValue(value) {
  return IsBoolean(value) || IsNumber(value) || IsString(value);
}
function IsLiteral(value) {
  return IsKindOf(value, "Literal");
}
function IsMappedKey(value) {
  return IsKindOf(value, "MappedKey");
}
function IsMappedResult(value) {
  return IsKindOf(value, "MappedResult");
}
function IsNever(value) {
  return IsKindOf(value, "Never");
}
function IsNot(value) {
  return IsKindOf(value, "Not");
}
function IsNull2(value) {
  return IsKindOf(value, "Null");
}
function IsNumber3(value) {
  return IsKindOf(value, "Number");
}
function IsObject3(value) {
  return IsKindOf(value, "Object");
}
function IsPromise(value) {
  return IsKindOf(value, "Promise");
}
function IsRecord(value) {
  return IsKindOf(value, "Record");
}
function IsRecursive(value) {
  return IsObject(value) && Hint in value && value[Hint] === "Recursive";
}
function IsRef(value) {
  return IsKindOf(value, "Ref");
}
function IsRegExp2(value) {
  return IsKindOf(value, "RegExp");
}
function IsString2(value) {
  return IsKindOf(value, "String");
}
function IsSymbol2(value) {
  return IsKindOf(value, "Symbol");
}
function IsTemplateLiteral(value) {
  return IsKindOf(value, "TemplateLiteral");
}
function IsThis(value) {
  return IsKindOf(value, "This");
}
function IsTransform(value) {
  return IsObject(value) && TransformKind in value;
}
function IsTuple(value) {
  return IsKindOf(value, "Tuple");
}
function IsUndefined3(value) {
  return IsKindOf(value, "Undefined");
}
function IsUnion(value) {
  return IsKindOf(value, "Union");
}
function IsUint8Array2(value) {
  return IsKindOf(value, "Uint8Array");
}
function IsUnknown(value) {
  return IsKindOf(value, "Unknown");
}
function IsUnsafe(value) {
  return IsKindOf(value, "Unsafe");
}
function IsVoid(value) {
  return IsKindOf(value, "Void");
}
function IsKind(value) {
  return IsObject(value) && Kind in value && IsString(value[Kind]);
}
function IsSchema(value) {
  return IsAny(value) || IsArgument(value) || IsArray3(value) || IsBoolean2(value) || IsBigInt2(value) || IsAsyncIterator2(value) || IsComputed(value) || IsConstructor(value) || IsDate2(value) || IsFunction2(value) || IsInteger(value) || IsIntersect(value) || IsIterator2(value) || IsLiteral(value) || IsMappedKey(value) || IsMappedResult(value) || IsNever(value) || IsNot(value) || IsNull2(value) || IsNumber3(value) || IsObject3(value) || IsPromise(value) || IsRecord(value) || IsRef(value) || IsRegExp2(value) || IsString2(value) || IsSymbol2(value) || IsTemplateLiteral(value) || IsThis(value) || IsTuple(value) || IsUndefined3(value) || IsUnion(value) || IsUint8Array2(value) || IsUnknown(value) || IsUnsafe(value) || IsVoid(value) || IsKind(value);
}

// node_modules/@sinclair/typebox/build/esm/type/guard/type.mjs
var type_exports = {};
__export(type_exports, {
  IsAny: () => IsAny2,
  IsArgument: () => IsArgument2,
  IsArray: () => IsArray4,
  IsAsyncIterator: () => IsAsyncIterator3,
  IsBigInt: () => IsBigInt3,
  IsBoolean: () => IsBoolean3,
  IsComputed: () => IsComputed2,
  IsConstructor: () => IsConstructor2,
  IsDate: () => IsDate3,
  IsFunction: () => IsFunction3,
  IsImport: () => IsImport2,
  IsInteger: () => IsInteger2,
  IsIntersect: () => IsIntersect2,
  IsIterator: () => IsIterator3,
  IsKind: () => IsKind2,
  IsKindOf: () => IsKindOf2,
  IsLiteral: () => IsLiteral2,
  IsLiteralBoolean: () => IsLiteralBoolean2,
  IsLiteralNumber: () => IsLiteralNumber2,
  IsLiteralString: () => IsLiteralString2,
  IsLiteralValue: () => IsLiteralValue2,
  IsMappedKey: () => IsMappedKey2,
  IsMappedResult: () => IsMappedResult2,
  IsNever: () => IsNever2,
  IsNot: () => IsNot2,
  IsNull: () => IsNull3,
  IsNumber: () => IsNumber4,
  IsObject: () => IsObject4,
  IsOptional: () => IsOptional2,
  IsPromise: () => IsPromise2,
  IsProperties: () => IsProperties2,
  IsReadonly: () => IsReadonly2,
  IsRecord: () => IsRecord2,
  IsRecursive: () => IsRecursive2,
  IsRef: () => IsRef2,
  IsRegExp: () => IsRegExp3,
  IsSchema: () => IsSchema2,
  IsString: () => IsString3,
  IsSymbol: () => IsSymbol3,
  IsTemplateLiteral: () => IsTemplateLiteral2,
  IsThis: () => IsThis2,
  IsTransform: () => IsTransform2,
  IsTuple: () => IsTuple2,
  IsUint8Array: () => IsUint8Array3,
  IsUndefined: () => IsUndefined4,
  IsUnion: () => IsUnion2,
  IsUnionLiteral: () => IsUnionLiteral,
  IsUnknown: () => IsUnknown2,
  IsUnsafe: () => IsUnsafe2,
  IsVoid: () => IsVoid2,
  TypeGuardUnknownTypeError: () => TypeGuardUnknownTypeError
});
var TypeGuardUnknownTypeError = class extends TypeBoxError {
};
var KnownTypes = [
  "Argument",
  "Any",
  "Array",
  "AsyncIterator",
  "BigInt",
  "Boolean",
  "Computed",
  "Constructor",
  "Date",
  "Enum",
  "Function",
  "Integer",
  "Intersect",
  "Iterator",
  "Literal",
  "MappedKey",
  "MappedResult",
  "Not",
  "Null",
  "Number",
  "Object",
  "Promise",
  "Record",
  "Ref",
  "RegExp",
  "String",
  "Symbol",
  "TemplateLiteral",
  "This",
  "Tuple",
  "Undefined",
  "Union",
  "Uint8Array",
  "Unknown",
  "Void"
];
function IsPattern(value) {
  try {
    new RegExp(value);
    return true;
  } catch {
    return false;
  }
}
function IsControlCharacterFree(value) {
  if (!IsString(value))
    return false;
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code >= 7 && code <= 13 || code === 27 || code === 127) {
      return false;
    }
  }
  return true;
}
function IsAdditionalProperties(value) {
  return IsOptionalBoolean(value) || IsSchema2(value);
}
function IsOptionalBigInt(value) {
  return IsUndefined(value) || IsBigInt(value);
}
function IsOptionalNumber(value) {
  return IsUndefined(value) || IsNumber(value);
}
function IsOptionalBoolean(value) {
  return IsUndefined(value) || IsBoolean(value);
}
function IsOptionalString(value) {
  return IsUndefined(value) || IsString(value);
}
function IsOptionalPattern(value) {
  return IsUndefined(value) || IsString(value) && IsControlCharacterFree(value) && IsPattern(value);
}
function IsOptionalFormat(value) {
  return IsUndefined(value) || IsString(value) && IsControlCharacterFree(value);
}
function IsOptionalSchema(value) {
  return IsUndefined(value) || IsSchema2(value);
}
function IsReadonly2(value) {
  return IsObject(value) && value[ReadonlyKind] === "Readonly";
}
function IsOptional2(value) {
  return IsObject(value) && value[OptionalKind] === "Optional";
}
function IsAny2(value) {
  return IsKindOf2(value, "Any") && IsOptionalString(value.$id);
}
function IsArgument2(value) {
  return IsKindOf2(value, "Argument") && IsNumber(value.index);
}
function IsArray4(value) {
  return IsKindOf2(value, "Array") && value.type === "array" && IsOptionalString(value.$id) && IsSchema2(value.items) && IsOptionalNumber(value.minItems) && IsOptionalNumber(value.maxItems) && IsOptionalBoolean(value.uniqueItems) && IsOptionalSchema(value.contains) && IsOptionalNumber(value.minContains) && IsOptionalNumber(value.maxContains);
}
function IsAsyncIterator3(value) {
  return IsKindOf2(value, "AsyncIterator") && value.type === "AsyncIterator" && IsOptionalString(value.$id) && IsSchema2(value.items);
}
function IsBigInt3(value) {
  return IsKindOf2(value, "BigInt") && value.type === "bigint" && IsOptionalString(value.$id) && IsOptionalBigInt(value.exclusiveMaximum) && IsOptionalBigInt(value.exclusiveMinimum) && IsOptionalBigInt(value.maximum) && IsOptionalBigInt(value.minimum) && IsOptionalBigInt(value.multipleOf);
}
function IsBoolean3(value) {
  return IsKindOf2(value, "Boolean") && value.type === "boolean" && IsOptionalString(value.$id);
}
function IsComputed2(value) {
  return IsKindOf2(value, "Computed") && IsString(value.target) && IsArray(value.parameters) && value.parameters.every((schema) => IsSchema2(schema));
}
function IsConstructor2(value) {
  return IsKindOf2(value, "Constructor") && value.type === "Constructor" && IsOptionalString(value.$id) && IsArray(value.parameters) && value.parameters.every((schema) => IsSchema2(schema)) && IsSchema2(value.returns);
}
function IsDate3(value) {
  return IsKindOf2(value, "Date") && value.type === "Date" && IsOptionalString(value.$id) && IsOptionalNumber(value.exclusiveMaximumTimestamp) && IsOptionalNumber(value.exclusiveMinimumTimestamp) && IsOptionalNumber(value.maximumTimestamp) && IsOptionalNumber(value.minimumTimestamp) && IsOptionalNumber(value.multipleOfTimestamp);
}
function IsFunction3(value) {
  return IsKindOf2(value, "Function") && value.type === "Function" && IsOptionalString(value.$id) && IsArray(value.parameters) && value.parameters.every((schema) => IsSchema2(schema)) && IsSchema2(value.returns);
}
function IsImport2(value) {
  return IsKindOf2(value, "Import") && HasPropertyKey(value, "$defs") && IsObject(value.$defs) && IsProperties2(value.$defs) && HasPropertyKey(value, "$ref") && IsString(value.$ref) && value.$ref in value.$defs;
}
function IsInteger2(value) {
  return IsKindOf2(value, "Integer") && value.type === "integer" && IsOptionalString(value.$id) && IsOptionalNumber(value.exclusiveMaximum) && IsOptionalNumber(value.exclusiveMinimum) && IsOptionalNumber(value.maximum) && IsOptionalNumber(value.minimum) && IsOptionalNumber(value.multipleOf);
}
function IsProperties2(value) {
  return IsObject(value) && Object.entries(value).every(([key, schema]) => IsControlCharacterFree(key) && IsSchema2(schema));
}
function IsIntersect2(value) {
  return IsKindOf2(value, "Intersect") && (IsString(value.type) && value.type !== "object" ? false : true) && IsArray(value.allOf) && value.allOf.every((schema) => IsSchema2(schema) && !IsTransform2(schema)) && IsOptionalString(value.type) && (IsOptionalBoolean(value.unevaluatedProperties) || IsOptionalSchema(value.unevaluatedProperties)) && IsOptionalString(value.$id);
}
function IsIterator3(value) {
  return IsKindOf2(value, "Iterator") && value.type === "Iterator" && IsOptionalString(value.$id) && IsSchema2(value.items);
}
function IsKindOf2(value, kind) {
  return IsObject(value) && Kind in value && value[Kind] === kind;
}
function IsLiteralString2(value) {
  return IsLiteral2(value) && IsString(value.const);
}
function IsLiteralNumber2(value) {
  return IsLiteral2(value) && IsNumber(value.const);
}
function IsLiteralBoolean2(value) {
  return IsLiteral2(value) && IsBoolean(value.const);
}
function IsLiteral2(value) {
  return IsKindOf2(value, "Literal") && IsOptionalString(value.$id) && IsLiteralValue2(value.const);
}
function IsLiteralValue2(value) {
  return IsBoolean(value) || IsNumber(value) || IsString(value);
}
function IsMappedKey2(value) {
  return IsKindOf2(value, "MappedKey") && IsArray(value.keys) && value.keys.every((key) => IsNumber(key) || IsString(key));
}
function IsMappedResult2(value) {
  return IsKindOf2(value, "MappedResult") && IsProperties2(value.properties);
}
function IsNever2(value) {
  return IsKindOf2(value, "Never") && IsObject(value.not) && Object.getOwnPropertyNames(value.not).length === 0;
}
function IsNot2(value) {
  return IsKindOf2(value, "Not") && IsSchema2(value.not);
}
function IsNull3(value) {
  return IsKindOf2(value, "Null") && value.type === "null" && IsOptionalString(value.$id);
}
function IsNumber4(value) {
  return IsKindOf2(value, "Number") && value.type === "number" && IsOptionalString(value.$id) && IsOptionalNumber(value.exclusiveMaximum) && IsOptionalNumber(value.exclusiveMinimum) && IsOptionalNumber(value.maximum) && IsOptionalNumber(value.minimum) && IsOptionalNumber(value.multipleOf);
}
function IsObject4(value) {
  return IsKindOf2(value, "Object") && value.type === "object" && IsOptionalString(value.$id) && IsProperties2(value.properties) && IsAdditionalProperties(value.additionalProperties) && IsOptionalNumber(value.minProperties) && IsOptionalNumber(value.maxProperties);
}
function IsPromise2(value) {
  return IsKindOf2(value, "Promise") && value.type === "Promise" && IsOptionalString(value.$id) && IsSchema2(value.item);
}
function IsRecord2(value) {
  return IsKindOf2(value, "Record") && value.type === "object" && IsOptionalString(value.$id) && IsAdditionalProperties(value.additionalProperties) && IsObject(value.patternProperties) && ((schema) => {
    const keys = Object.getOwnPropertyNames(schema.patternProperties);
    return keys.length === 1 && IsPattern(keys[0]) && IsObject(schema.patternProperties) && IsSchema2(schema.patternProperties[keys[0]]);
  })(value);
}
function IsRecursive2(value) {
  return IsObject(value) && Hint in value && value[Hint] === "Recursive";
}
function IsRef2(value) {
  return IsKindOf2(value, "Ref") && IsOptionalString(value.$id) && IsString(value.$ref);
}
function IsRegExp3(value) {
  return IsKindOf2(value, "RegExp") && IsOptionalString(value.$id) && IsString(value.source) && IsString(value.flags) && IsOptionalNumber(value.maxLength) && IsOptionalNumber(value.minLength);
}
function IsString3(value) {
  return IsKindOf2(value, "String") && value.type === "string" && IsOptionalString(value.$id) && IsOptionalNumber(value.minLength) && IsOptionalNumber(value.maxLength) && IsOptionalPattern(value.pattern) && IsOptionalFormat(value.format);
}
function IsSymbol3(value) {
  return IsKindOf2(value, "Symbol") && value.type === "symbol" && IsOptionalString(value.$id);
}
function IsTemplateLiteral2(value) {
  return IsKindOf2(value, "TemplateLiteral") && value.type === "string" && IsString(value.pattern) && value.pattern[0] === "^" && value.pattern[value.pattern.length - 1] === "$";
}
function IsThis2(value) {
  return IsKindOf2(value, "This") && IsOptionalString(value.$id) && IsString(value.$ref);
}
function IsTransform2(value) {
  return IsObject(value) && TransformKind in value;
}
function IsTuple2(value) {
  return IsKindOf2(value, "Tuple") && value.type === "array" && IsOptionalString(value.$id) && IsNumber(value.minItems) && IsNumber(value.maxItems) && value.minItems === value.maxItems && // empty
  (IsUndefined(value.items) && IsUndefined(value.additionalItems) && value.minItems === 0 || IsArray(value.items) && value.items.every((schema) => IsSchema2(schema)));
}
function IsUndefined4(value) {
  return IsKindOf2(value, "Undefined") && value.type === "undefined" && IsOptionalString(value.$id);
}
function IsUnionLiteral(value) {
  return IsUnion2(value) && value.anyOf.every((schema) => IsLiteralString2(schema) || IsLiteralNumber2(schema));
}
function IsUnion2(value) {
  return IsKindOf2(value, "Union") && IsOptionalString(value.$id) && IsObject(value) && IsArray(value.anyOf) && value.anyOf.every((schema) => IsSchema2(schema));
}
function IsUint8Array3(value) {
  return IsKindOf2(value, "Uint8Array") && value.type === "Uint8Array" && IsOptionalString(value.$id) && IsOptionalNumber(value.minByteLength) && IsOptionalNumber(value.maxByteLength);
}
function IsUnknown2(value) {
  return IsKindOf2(value, "Unknown") && IsOptionalString(value.$id);
}
function IsUnsafe2(value) {
  return IsKindOf2(value, "Unsafe");
}
function IsVoid2(value) {
  return IsKindOf2(value, "Void") && value.type === "void" && IsOptionalString(value.$id);
}
function IsKind2(value) {
  return IsObject(value) && Kind in value && IsString(value[Kind]) && !KnownTypes.includes(value[Kind]);
}
function IsSchema2(value) {
  return IsObject(value) && (IsAny2(value) || IsArgument2(value) || IsArray4(value) || IsBoolean3(value) || IsBigInt3(value) || IsAsyncIterator3(value) || IsComputed2(value) || IsConstructor2(value) || IsDate3(value) || IsFunction3(value) || IsInteger2(value) || IsIntersect2(value) || IsIterator3(value) || IsLiteral2(value) || IsMappedKey2(value) || IsMappedResult2(value) || IsNever2(value) || IsNot2(value) || IsNull3(value) || IsNumber4(value) || IsObject4(value) || IsPromise2(value) || IsRecord2(value) || IsRef2(value) || IsRegExp3(value) || IsString3(value) || IsSymbol3(value) || IsTemplateLiteral2(value) || IsThis2(value) || IsTuple2(value) || IsUndefined4(value) || IsUnion2(value) || IsUint8Array3(value) || IsUnknown2(value) || IsUnsafe2(value) || IsVoid2(value) || IsKind2(value));
}

// node_modules/@sinclair/typebox/build/esm/type/registry/format.mjs
var format_exports = {};
__export(format_exports, {
  Clear: () => Clear,
  Delete: () => Delete,
  Entries: () => Entries,
  Get: () => Get,
  Has: () => Has,
  Set: () => Set2
});
var map = /* @__PURE__ */ new Map();
function Entries() {
  return new Map(map);
}
function Clear() {
  return map.clear();
}
function Delete(format) {
  return map.delete(format);
}
function Has(format) {
  return map.has(format);
}
function Set2(format, func) {
  map.set(format, func);
}
function Get(format) {
  return map.get(format);
}

// node_modules/@sinclair/typebox/build/esm/type/registry/type.mjs
var type_exports2 = {};
__export(type_exports2, {
  Clear: () => Clear2,
  Delete: () => Delete2,
  Entries: () => Entries2,
  Get: () => Get2,
  Has: () => Has2,
  Set: () => Set3
});
var map2 = /* @__PURE__ */ new Map();
function Entries2() {
  return new Map(map2);
}
function Clear2() {
  return map2.clear();
}
function Delete2(kind) {
  return map2.delete(kind);
}
function Has2(kind) {
  return map2.has(kind);
}
function Set3(kind, func) {
  map2.set(kind, func);
}
function Get2(kind) {
  return map2.get(kind);
}
var ExtendsResult;
(function(ExtendsResult2) {
  ExtendsResult2[ExtendsResult2["Union"] = 0] = "Union";
  ExtendsResult2[ExtendsResult2["True"] = 1] = "True";
  ExtendsResult2[ExtendsResult2["False"] = 2] = "False";
})(ExtendsResult || (ExtendsResult = {}));

// src/openapi.ts
var capitalize = (word) => word.charAt(0).toUpperCase() + word.slice(1);
var toRef = (name) => t.Ref(
  name.startsWith("#/") ? name : `#/components/schemas/${name}`
);
var toOperationId = (method, paths) => {
  let operationId = method.toLowerCase();
  if (!paths || paths === "/") return operationId + "Index";
  for (const path of paths.split("/"))
    operationId += path.includes(":") ? "By" + capitalize(path.replace(":", "")) : capitalize(path);
  operationId = operationId.replace(/\?/g, "Optional");
  return operationId;
};
var optionalParamsRegex = /(\/:\w+\?)/g;
var getPossiblePath = (path) => {
  const optionalParams = path.match(optionalParamsRegex);
  if (!optionalParams) return [path];
  const originalPath = path.replace(/\?/g, "");
  const paths = [originalPath];
  for (let i = 0; i < optionalParams.length; i++) {
    const newPath = path.replace(optionalParams[i], "");
    paths.push(...getPossiblePath(newPath));
  }
  return paths;
};
var isValidSchema = (schema) => schema && typeof schema === "object" && (Kind in schema && schema[Kind] !== "Unknown" || schema.type || schema.properties || schema.items);
var getLoosePath = (path) => {
  if (path.charCodeAt(path.length - 1) === 47)
    return path.slice(0, path.length - 1);
  return path + "/";
};
var warnings = {
  zod4: `import openapi from '@elysiajs/openapi'
import * as z from 'zod'

openapi({
  mapJsonSchema: {
    zod: z.toJSONSchema
  }
})`,
  zod3: `import openapi from '@elysiajs/openapi'
import { zodToJsonSchema } from 'zod-to-json-schema'

openapi({
  mapJsonSchema: {
    zod: zodToJsonSchema
  }
})`,
  valibot: `import openapi from '@elysiajs/openapi'
import { toJsonSchema } from '@valibot/to-json-schema'

openapi({
  mapJsonSchema: {
    valibot: toJsonSchema
  }
})`,
  effect: `import { JSONSchema } from 'effect'

openapi({
  mapJsonSchema: {
    effect: JSONSchema.make
  }
})`
};
var warned = {};
var mergeObjectSchemas = (schemas) => {
  if (schemas.length === 0)
    return {
      schema: void 0,
      notObjects: []
    };
  if (schemas.length === 1)
    return schemas[0].type === "object" ? {
      schema: schemas[0],
      notObjects: []
    } : {
      schema: void 0,
      notObjects: schemas
    };
  let newSchema;
  const notObjects = [];
  let additionalPropertiesIsTrue = false;
  let additionalPropertiesIsFalse = false;
  for (const schema of schemas) {
    if (!schema) continue;
    if (schema.type !== "object") {
      notObjects.push(schema);
      continue;
    }
    if ("additionalProperties" in schema) {
      if (schema.additionalProperties === true)
        additionalPropertiesIsTrue = true;
      else if (schema.additionalProperties === false)
        additionalPropertiesIsFalse = true;
    }
    if (!newSchema) {
      newSchema = schema;
      continue;
    }
    newSchema = {
      ...newSchema,
      ...schema,
      properties: {
        ...newSchema.properties,
        ...schema.properties
      },
      required: [
        ...newSchema?.required ?? [],
        ...schema.required ?? []
      ]
    };
  }
  if (newSchema) {
    if (newSchema.required)
      newSchema.required = [...new Set(newSchema.required)];
    if (additionalPropertiesIsFalse) newSchema.additionalProperties = false;
    else if (additionalPropertiesIsTrue)
      newSchema.additionalProperties = true;
  }
  return {
    schema: newSchema,
    notObjects
  };
};
var isTSchema = (value) => {
  if (!value || typeof value !== "object") return false;
  if (Kind in value) return true;
  const keys = Object.keys(value);
  if (keys.length > 0 && keys.every((k) => !isNaN(Number(k)))) {
    return false;
  }
  return false;
};
var normalizeSchemaReference = (schema) => {
  if (!schema) return void 0;
  if (typeof schema !== "string") return schema;
  return toRef(schema);
};
var mergeSchemaProperty = (existing, incoming, vendors) => {
  if (!existing) return incoming;
  if (!incoming) return existing;
  let existingSchema = normalizeSchemaReference(existing);
  let incomingSchema = normalizeSchemaReference(incoming);
  if (!existingSchema) return incoming;
  if (!incomingSchema) return existing;
  if (!isTSchema(incomingSchema) && incomingSchema["~standard"])
    incomingSchema = unwrapSchema(incomingSchema, vendors);
  if (!isTSchema(existingSchema) && existingSchema["~standard"])
    existingSchema = unwrapSchema(existingSchema, vendors);
  if (!incomingSchema) return existingSchema;
  if (!existingSchema) return incomingSchema;
  const { schema: mergedSchema, notObjects } = mergeObjectSchemas([
    existingSchema,
    incomingSchema
  ]);
  if (notObjects.length > 0) {
    if (mergedSchema) return t.Intersect([mergedSchema, ...notObjects]);
    return notObjects.length === 1 ? notObjects[0] : t.Intersect(notObjects);
  }
  return mergedSchema;
};
var unwrapResponseSchema = (schema, vendors) => typeof schema === "string" ? normalizeSchemaReference(schema) : !schema ? void 0 : isTSchema(schema) ? schema : (
  // @ts-ignore
  schema["~standard"] ? unwrapSchema(schema, vendors, "output") : Object.fromEntries(
    Object.entries(schema).map(([status, schema2]) => [
      status,
      typeof schema2 === "string" ? normalizeSchemaReference(schema2) : isTSchema(schema2) ? schema2 : unwrapSchema(
        schema2,
        vendors,
        "output"
      )
    ])
  )
);
var mergeResponseSchema = (_existing, _incoming, vendors) => {
  if (!_existing) return _incoming;
  if (!_incoming) return _existing;
  let existing = unwrapResponseSchema(_existing, vendors);
  let incoming = unwrapResponseSchema(_incoming, vendors);
  if (!existing && !incoming) return void 0;
  if (incoming && !existing) return incoming;
  if (existing && !incoming) return existing;
  if (isTSchema(existing) || existing?.["~standard"])
    existing = {
      200: existing
    };
  if (isTSchema(incoming) || incoming?.["~standard"])
    incoming = {
      200: incoming
    };
  const schema = {
    ...incoming
  };
  for (const status of Object.keys(existing ?? {})) {
    const existingSchema = existing[status];
    const incomingSchema = incoming[status];
    if (existingSchema && incomingSchema)
      schema[status] = mergeSchemaProperty(
        existingSchema,
        incomingSchema,
        vendors
      );
    else if (existingSchema) schema[status] = existingSchema;
    else if (incomingSchema) schema[status] = incomingSchema;
  }
  return schema;
};
var mergeStandaloneValidators = (hooks, vendors) => {
  const merged = { ...hooks };
  if (!hooks.standaloneValidator?.length) return merged;
  for (const validator of hooks.standaloneValidator) {
    if (validator.body)
      merged.body = mergeSchemaProperty(
        merged.body,
        validator.body,
        vendors
      );
    if (validator.headers)
      merged.headers = mergeSchemaProperty(
        merged.headers,
        validator.headers,
        vendors
      );
    if (validator.query)
      merged.query = mergeSchemaProperty(
        merged.query,
        validator.query,
        vendors
      );
    if (validator.params)
      merged.params = mergeSchemaProperty(
        merged.params,
        validator.params,
        vendors
      );
    if (validator.cookie)
      merged.cookie = mergeSchemaProperty(
        merged.cookie,
        validator.cookie,
        vendors
      );
    if (validator.response)
      merged.response = mergeResponseSchema(
        merged.response,
        validator.response,
        vendors
      );
  }
  if (typeof merged.body === "string")
    merged.body = normalizeSchemaReference(merged.body);
  if (typeof merged.headers === "string")
    merged.headers = normalizeSchemaReference(merged.headers);
  if (typeof merged.query === "string")
    merged.query = normalizeSchemaReference(merged.query);
  if (typeof merged.params === "string")
    merged.params = normalizeSchemaReference(merged.params);
  if (typeof merged.cookie === "string")
    merged.cookie = normalizeSchemaReference(merged.cookie);
  if (merged.response && typeof merged.response !== "string") {
    const response = merged.response;
    if ("type" in response || "$ref" in response) {
      if (typeof response === "string")
        merged.response = normalizeSchemaReference(response);
    } else {
      for (const [status, schema] of Object.entries(response))
        if (typeof schema === "string")
          response[status] = normalizeSchemaReference(schema);
    }
  }
  return merged;
};
var flattenRoutes = (routes, vendors) => routes.map((route) => {
  if (!route.hooks?.standaloneValidator?.length) return route;
  return {
    ...route,
    hooks: mergeStandaloneValidators(route.hooks, vendors)
  };
});
var unwrapReference = (schema, definitions) => {
  const ref = schema?.$ref;
  if (!ref) return schema;
  const name = ref.slice(ref.lastIndexOf("/") + 1);
  if (ref && definitions[name]) schema = definitions[name];
  return enumToOpenApi(schema);
};
var unwrapSchema = (schema, mapJsonSchema, io = "input") => {
  if (!schema) return;
  if (typeof schema === "string") schema = toRef(schema);
  if (Kind in schema) return enumToOpenApi(schema);
  if (!schema?.["~standard"] && // @ts-ignore
  (schema.$schema || schema.type || schema.properties || schema.items))
    return schema;
  if (!schema?.["~standard"]) return;
  const vendor = schema["~standard"].vendor;
  try {
    if (mapJsonSchema?.[vendor] && typeof mapJsonSchema[vendor] === "function")
      return enumToOpenApi(mapJsonSchema[vendor](schema));
    if (schema["~standard"]?.jsonSchema?.[io])
      return enumToOpenApi(schema["~standard"].jsonSchema[io]({
        target: "draft-2020-12"
      }));
    switch (vendor) {
      case "zod":
        if (warned.zod4 || warned.zod3) break;
        console.warn(
          "[@elysiajs/openapi] Zod doesn't provide JSON Schema method on the schema"
        );
        if ("_zod" in schema) {
          warned.zod4 = true;
          console.warn(
            "For Zod v4, please provide z.toJSONSchema as follows:\n"
          );
          console.warn(warnings.zod4);
        } else {
          warned.zod3 = true;
          console.warn(
            "For Zod v3, please install zod-to-json-schema package and use it like this:\n"
          );
          console.warn(warnings.zod3);
        }
        break;
      case "valibot":
        if (warned.valibot) break;
        warned.valibot = true;
        console.warn(
          "[@elysiajs/openapi] Valibot require a separate package for JSON Schema conversion"
        );
        console.warn(
          "Please install @valibot/to-json-schema package and use it like this:\n"
        );
        console.warn(warnings.valibot);
        break;
      case "effect":
        if (warned.effect) break;
        warned.effect = true;
        console.warn(
          "[@elysiajs/openapi] Effect Schema doesn't provide JSON Schema method on the schema"
        );
        console.warn(
          "please provide JSONSchema from 'effect' package as follows:\n"
        );
        console.warn(warnings.effect);
        break;
    }
    if (vendor === "arktype")
      return enumToOpenApi(schema?.toJsonSchema?.());
    return enumToOpenApi(
      // @ts-ignore
      schema.toJSONSchema?.() ?? schema?.toJsonSchema?.()
    );
  } catch (error) {
    console.warn(error);
  }
};
var enumToOpenApi = (_schema) => {
  if (!_schema || typeof _schema !== "object") return _schema;
  if (Kind in _schema) {
    const schema2 = _schema;
    if (schema2[Kind] === "Union" && schema2.anyOf && Array.isArray(schema2.anyOf) && schema2.anyOf.length > 0 && schema2.anyOf.every(
      (item) => item && typeof item === "object" && item.const !== void 0
    ))
      return {
        type: "string",
        enum: schema2.anyOf.map((item) => item.const)
      };
  }
  const schema = _schema;
  if (schema.type === "object" && schema.properties) {
    const properties = {};
    for (const [key, value] of Object.entries(schema.properties))
      properties[key] = enumToOpenApi(value);
    return {
      ...schema,
      properties
    };
  }
  if (schema.type === "array" && schema.items)
    return {
      ...schema,
      items: enumToOpenApi(schema.items)
    };
  return schema;
};
function toOpenAPISchema(app, exclude, references, vendors) {
  let {
    methods: excludeMethods = ["options"],
    staticFile: excludeStaticFile = true,
    tags: excludeTags
  } = exclude ?? {};
  excludeMethods = excludeMethods.map((method) => method.toLowerCase());
  const excludePaths = Array.isArray(exclude?.paths) ? exclude.paths : typeof exclude?.paths !== "undefined" ? [exclude.paths] : [];
  const paths = /* @__PURE__ */ Object.create(null);
  const definitions = app.getGlobalDefinitions?.().type;
  if (references) {
    if (!Array.isArray(references)) references = [references];
    for (let i = 0; i < references.length; i++) {
      const reference = references[i];
      if (typeof reference === "function") references[i] = reference();
    }
  }
  const routes = flattenRoutes(app.getGlobalRoutes(), vendors);
  for (const route of routes) {
    if (route.hooks?.detail?.hide) continue;
    const method = route.method.toLowerCase();
    if (excludeStaticFile && route.path.includes(".") || excludePaths.includes(route.path) || excludeMethods.includes(method))
      continue;
    const hooks = route.hooks ?? {};
    if (references?.length)
      for (const reference of references) {
        if (!reference) continue;
        const refer = reference[route.path]?.[method] ?? reference[getLoosePath(route.path)]?.[method];
        if (!refer) continue;
        if (!hooks.body && isValidSchema(refer.body))
          hooks.body = refer.body;
        if (!hooks.query && isValidSchema(refer.query))
          hooks.query = refer.query;
        if (!hooks.params && isValidSchema(refer.params))
          hooks.params = refer.params;
        if (!hooks.headers && isValidSchema(refer.headers))
          hooks.headers = refer.headers;
        if (refer.response) {
          for (const [status, schema] of Object.entries(
            refer.response
          ))
            if (isValidSchema(schema)) {
              if (!hooks.response) hooks.response = {};
              else if (typeof hooks.response !== "object" || hooks.response.type || hooks.response.$ref || hooks.response["~standard"])
                hooks.response = {
                  200: hooks.response
                };
              if (!hooks.response[status])
                try {
                  hooks.response[status] = schema;
                } catch (error) {
                  console.log(
                    "[@elysiajs/openapi/gen] Failed to assigned response schema"
                  );
                  console.log(error);
                }
            }
        }
      }
    if (excludeTags && hooks.detail.tags?.some((tag) => excludeTags?.includes(tag)))
      continue;
    const operation = {
      ...hooks.detail
    };
    const parameters = [];
    if (hooks.params) {
      const params = unwrapReference(
        unwrapSchema(hooks.params, vendors),
        definitions
      );
      if (params && params.type === "object" && params.properties)
        for (const [name, schema] of Object.entries(params.properties))
          parameters.push({
            name,
            in: "path",
            required: true,
            // Path parameters are always required
            schema
          });
    } else {
      for (const match of route.path.matchAll(/:([^/]+)/g)) {
        const name = match[1].replace("?", "");
        parameters.push({
          name,
          in: "path",
          required: true,
          schema: { type: "string" }
        });
      }
    }
    if (hooks.query) {
      const query = unwrapReference(
        unwrapSchema(hooks.query, vendors),
        definitions
      );
      if (query && query.type === "object" && query.properties) {
        const required2 = query.required || [];
        for (const [name, schema] of Object.entries(query.properties))
          parameters.push({
            name,
            in: "query",
            required: required2.includes(name),
            schema
          });
      }
    }
    if (hooks.headers) {
      const headers = unwrapReference(
        unwrapSchema(hooks.headers, vendors),
        definitions
      );
      if (headers && headers.type === "object" && headers.properties) {
        const required2 = headers.required || [];
        for (const [name, schema] of Object.entries(headers.properties))
          parameters.push({
            name,
            in: "header",
            required: required2.includes(name),
            schema
          });
      }
    }
    if (hooks.cookie) {
      const cookie = unwrapReference(
        unwrapSchema(hooks.cookie, vendors),
        definitions
      );
      if (cookie && cookie.type === "object" && cookie.properties) {
        const required2 = cookie.required || [];
        for (const [name, schema] of Object.entries(cookie.properties))
          parameters.push({
            name,
            in: "cookie",
            required: required2.includes(name),
            schema
          });
      }
    }
    if (parameters.length > 0) operation.parameters = parameters;
    if (hooks.body && method !== "get" && method !== "head") {
      const body = unwrapSchema(hooks.body, vendors);
      if (body) {
        const { type, description, $ref, ...options } = unwrapReference(
          body,
          definitions
        );
        if (hooks.parse) {
          const content = {};
          const parsers = hooks.parse;
          for (const parser of parsers) {
            if (typeof parser.fn === "function") continue;
            switch (parser.fn) {
              case "text":
              case "text/plain":
                content["text/plain"] = { schema: body };
                continue;
              case "urlencoded":
              case "application/x-www-form-urlencoded":
                content["application/x-www-form-urlencoded"] = {
                  schema: body
                };
                continue;
              case "json":
              case "application/json":
                content["application/json"] = { schema: body };
                continue;
              case "formdata":
              case "multipart/form-data":
                content["multipart/form-data"] = {
                  schema: body
                };
                continue;
            }
          }
          operation.requestBody = {
            description,
            content,
            required: true
          };
        } else {
          operation.requestBody = {
            description,
            required: true,
            content: type === "string" || type === "number" || type === "integer" || type === "boolean" ? {
              "text/plain": {
                schema: body
              }
            } : {
              "application/json": {
                schema: body
              },
              "application/x-www-form-urlencoded": {
                schema: body
              },
              "multipart/form-data": {
                schema: body
              }
            }
          };
        }
      }
    }
    if (hooks.response) {
      operation.responses = {};
      if (typeof hooks.response === "object" && // TypeBox
      !hooks.response.type && !hooks.response.$ref && !hooks.response["~standard"]) {
        for (let [status, schema] of Object.entries(hooks.response)) {
          const response = unwrapSchema(schema, vendors, "output");
          if (!response) continue;
          const { type, description, $ref, ..._options } = unwrapReference(response, definitions);
          operation.responses[status] = {
            description: description ?? `Response for status ${status}`,
            content: type === "void" || type === "null" || type === "undefined" ? { type, description } : type === "string" || type === "number" || type === "integer" || type === "boolean" ? {
              "text/plain": {
                schema: response
              }
            } : {
              "application/json": {
                schema: response
              }
            }
          };
        }
      } else {
        const response = unwrapSchema(
          hooks.response,
          vendors,
          "output"
        );
        if (response) {
          const {
            type: _type,
            description,
            ...options
          } = unwrapReference(response, definitions);
          const type = _type;
          operation.responses["200"] = {
            description: description ?? `Response for status 200`,
            content: type === "void" || type === "null" || type === "undefined" ? { type, description } : type === "string" || type === "number" || type === "integer" || type === "boolean" ? {
              "text/plain": {
                schema: response
              }
            } : {
              "application/json": {
                schema: response
              }
            }
          };
        }
      }
    }
    for (let path of getPossiblePath(route.path)) {
      const operationId = hooks.detail?.operationId ?? toOperationId(route.method, path);
      path = path.replace(/:([^/]+)/g, "{$1}");
      if (!paths[path]) paths[path] = {};
      const current = paths[path];
      if (method !== "all") {
        current[method] = {
          ...operation,
          operationId
        };
        continue;
      }
      for (const method2 of [
        "get",
        "post",
        "put",
        "delete",
        "patch",
        "head",
        "options",
        "trace"
      ])
        current[method2] = {
          ...operation,
          operationId
        };
    }
  }
  const schemas = /* @__PURE__ */ Object.create(null);
  if (definitions)
    for (const [name, schema] of Object.entries(definitions)) {
      const jsonSchema = unwrapSchema(schema, vendors);
      if (jsonSchema) schemas[name] = jsonSchema;
    }
  return {
    components: {
      schemas
    },
    paths
  };
}

// node_modules/@sinclair/typebox/build/esm/parser/runtime/index.mjs
var runtime_exports = {};
__export(runtime_exports, {
  Array: () => Array3,
  As: () => As,
  Const: () => Const2,
  Context: () => Context,
  Guard: () => guard_exports,
  Ident: () => Ident2,
  Identity: () => Identity,
  Module: () => Module,
  Number: () => Number4,
  Optional: () => Optional2,
  Parse: () => Parse,
  Ref: () => Ref2,
  String: () => String4,
  Token: () => token_exports,
  Tuple: () => Tuple2,
  Union: () => Union2
});

// node_modules/@sinclair/typebox/build/esm/parser/runtime/guard.mjs
var guard_exports = {};
__export(guard_exports, {
  IsArray: () => IsArray5,
  IsConst: () => IsConst,
  IsContext: () => IsContext,
  IsIdent: () => IsIdent,
  IsNumber: () => IsNumber5,
  IsOptional: () => IsOptional3,
  IsParser: () => IsParser,
  IsRef: () => IsRef3,
  IsString: () => IsString4,
  IsTuple: () => IsTuple3,
  IsUnion: () => IsUnion3
});
function HasPropertyKey2(value, key) {
  return key in value;
}
function IsObjectValue(value) {
  return typeof value === "object" && value !== null;
}
function IsArrayValue(value) {
  return globalThis.Array.isArray(value);
}
function IsArray5(value) {
  return IsObjectValue(value) && HasPropertyKey2(value, "type") && value.type === "Array" && HasPropertyKey2(value, "parser") && IsObjectValue(value.parser);
}
function IsConst(value) {
  return IsObjectValue(value) && HasPropertyKey2(value, "type") && value.type === "Const" && HasPropertyKey2(value, "value") && typeof value.value === "string";
}
function IsContext(value) {
  return IsObjectValue(value) && HasPropertyKey2(value, "type") && value.type === "Context" && HasPropertyKey2(value, "left") && IsParser(value.left) && HasPropertyKey2(value, "right") && IsParser(value.right);
}
function IsIdent(value) {
  return IsObjectValue(value) && HasPropertyKey2(value, "type") && value.type === "Ident";
}
function IsNumber5(value) {
  return IsObjectValue(value) && HasPropertyKey2(value, "type") && value.type === "Number";
}
function IsOptional3(value) {
  return IsObjectValue(value) && HasPropertyKey2(value, "type") && value.type === "Optional" && HasPropertyKey2(value, "parser") && IsObjectValue(value.parser);
}
function IsRef3(value) {
  return IsObjectValue(value) && HasPropertyKey2(value, "type") && value.type === "Ref" && HasPropertyKey2(value, "ref") && typeof value.ref === "string";
}
function IsString4(value) {
  return IsObjectValue(value) && HasPropertyKey2(value, "type") && value.type === "String" && HasPropertyKey2(value, "options") && IsArrayValue(value.options);
}
function IsTuple3(value) {
  return IsObjectValue(value) && HasPropertyKey2(value, "type") && value.type === "Tuple" && HasPropertyKey2(value, "parsers") && IsArrayValue(value.parsers);
}
function IsUnion3(value) {
  return IsObjectValue(value) && HasPropertyKey2(value, "type") && value.type === "Union" && HasPropertyKey2(value, "parsers") && IsArrayValue(value.parsers);
}
function IsParser(value) {
  return IsArray5(value) || IsConst(value) || IsContext(value) || IsIdent(value) || IsNumber5(value) || IsOptional3(value) || IsRef3(value) || IsString4(value) || IsTuple3(value) || IsUnion3(value);
}

// node_modules/@sinclair/typebox/build/esm/parser/runtime/token.mjs
var token_exports = {};
__export(token_exports, {
  Const: () => Const,
  Ident: () => Ident,
  Number: () => Number3,
  String: () => String3
});
var Chars;
(function(Chars2) {
  function IsWhitespace(value) {
    return value === 32;
  }
  Chars2.IsWhitespace = IsWhitespace;
  function IsNewline(value) {
    return value === 10;
  }
  Chars2.IsNewline = IsNewline;
  function IsAlpha(value) {
    return value >= 65 && value <= 90 || // A-Z 
    value >= 97 && value <= 122;
  }
  Chars2.IsAlpha = IsAlpha;
  function IsZero(value) {
    return value === 48;
  }
  Chars2.IsZero = IsZero;
  function IsNonZero(value) {
    return value >= 49 && value <= 57;
  }
  Chars2.IsNonZero = IsNonZero;
  function IsDigit(value) {
    return IsNonZero(value) || IsZero(value);
  }
  Chars2.IsDigit = IsDigit;
  function IsDot(value) {
    return value === 46;
  }
  Chars2.IsDot = IsDot;
  function IsUnderscore(value) {
    return value === 95;
  }
  Chars2.IsUnderscore = IsUnderscore;
  function IsDollarSign(value) {
    return value === 36;
  }
  Chars2.IsDollarSign = IsDollarSign;
})(Chars || (Chars = {}));
var Trim;
(function(Trim2) {
  function TrimWhitespaceOnly(code) {
    for (let i = 0; i < code.length; i++) {
      if (Chars.IsWhitespace(code.charCodeAt(i)))
        continue;
      return code.slice(i);
    }
    return code;
  }
  Trim2.TrimWhitespaceOnly = TrimWhitespaceOnly;
  function TrimAll(code) {
    return code.trimStart();
  }
  Trim2.TrimAll = TrimAll;
})(Trim || (Trim = {}));
function NextTokenCheck(value, code) {
  if (value.length > code.length)
    return false;
  for (let i = 0; i < value.length; i++) {
    if (value.charCodeAt(i) !== code.charCodeAt(i))
      return false;
  }
  return true;
}
function NextConst(value, code) {
  return NextTokenCheck(value, code) ? [code.slice(0, value.length), code.slice(value.length)] : [];
}
function Const(value, code) {
  if (value.length === 0)
    return ["", code];
  const char_0 = value.charCodeAt(0);
  return Chars.IsNewline(char_0) ? NextConst(value, Trim.TrimWhitespaceOnly(code)) : Chars.IsWhitespace(char_0) ? NextConst(value, code) : NextConst(value, Trim.TrimAll(code));
}
function IdentIsFirst(char) {
  return Chars.IsAlpha(char) || Chars.IsDollarSign(char) || Chars.IsUnderscore(char);
}
function IdentIsRest(char) {
  return Chars.IsAlpha(char) || Chars.IsDigit(char) || Chars.IsDollarSign(char) || Chars.IsUnderscore(char);
}
function NextIdent(code) {
  if (!IdentIsFirst(code.charCodeAt(0)))
    return [];
  for (let i = 1; i < code.length; i++) {
    const char = code.charCodeAt(i);
    if (IdentIsRest(char))
      continue;
    const slice = code.slice(0, i);
    const rest = code.slice(i);
    return [slice, rest];
  }
  return [code, ""];
}
function Ident(code) {
  return NextIdent(Trim.TrimAll(code));
}
function NumberLeadingZeroCheck(code, index) {
  const char_0 = code.charCodeAt(index + 0);
  const char_1 = code.charCodeAt(index + 1);
  return (
    // 1-9
    Chars.IsNonZero(char_0) || // 0
    Chars.IsZero(char_0) && !Chars.IsDigit(char_1) || // 0.
    Chars.IsZero(char_0) && Chars.IsDot(char_1) || // .0
    Chars.IsDot(char_0) && Chars.IsDigit(char_1)
  );
}
function NextNumber(code) {
  const negated = code.charAt(0) === "-";
  const index = negated ? 1 : 0;
  if (!NumberLeadingZeroCheck(code, index)) {
    return [];
  }
  const dash = negated ? "-" : "";
  let hasDot = false;
  for (let i = index; i < code.length; i++) {
    const char_i = code.charCodeAt(i);
    if (Chars.IsDigit(char_i)) {
      continue;
    }
    if (Chars.IsDot(char_i)) {
      if (hasDot) {
        const slice2 = code.slice(index, i);
        const rest2 = code.slice(i);
        return [`${dash}${slice2}`, rest2];
      }
      hasDot = true;
      continue;
    }
    const slice = code.slice(index, i);
    const rest = code.slice(i);
    return [`${dash}${slice}`, rest];
  }
  return [code, ""];
}
function Number3(code) {
  return NextNumber(Trim.TrimAll(code));
}
function NextString(options, code) {
  const first = code.charAt(0);
  if (!options.includes(first))
    return [];
  const quote = first;
  for (let i = 1; i < code.length; i++) {
    const char = code.charAt(i);
    if (char === quote) {
      const slice = code.slice(1, i);
      const rest = code.slice(i + 1);
      return [slice, rest];
    }
  }
  return [];
}
function String3(options, code) {
  return NextString(options, Trim.TrimAll(code));
}

// node_modules/@sinclair/typebox/build/esm/parser/runtime/types.mjs
var Identity = (value) => value;
var As = (mapping) => (_) => mapping;
function Context(...args) {
  const [left, right, mapping] = args.length === 3 ? [args[0], args[1], args[2]] : [args[0], args[1], Identity];
  return { type: "Context", left, right, mapping };
}
function Array3(...args) {
  const [parser, mapping] = args.length === 2 ? [args[0], args[1]] : [args[0], Identity];
  return { type: "Array", parser, mapping };
}
function Const2(...args) {
  const [value, mapping] = args.length === 2 ? [args[0], args[1]] : [args[0], Identity];
  return { type: "Const", value, mapping };
}
function Ref2(...args) {
  const [ref, mapping] = args.length === 2 ? [args[0], args[1]] : [args[0], Identity];
  return { type: "Ref", ref, mapping };
}
function String4(...params) {
  const [options, mapping] = params.length === 2 ? [params[0], params[1]] : [params[0], Identity];
  return { type: "String", options, mapping };
}
function Ident2(...params) {
  const mapping = params.length === 1 ? params[0] : Identity;
  return { type: "Ident", mapping };
}
function Number4(...params) {
  const mapping = params.length === 1 ? params[0] : Identity;
  return { type: "Number", mapping };
}
function Optional2(...args) {
  const [parser, mapping] = args.length === 2 ? [args[0], args[1]] : [args[0], Identity];
  return { type: "Optional", parser, mapping };
}
function Tuple2(...args) {
  const [parsers, mapping] = args.length === 2 ? [args[0], args[1]] : [args[0], Identity];
  return { type: "Tuple", parsers, mapping };
}
function Union2(...args) {
  const [parsers, mapping] = args.length === 2 ? [args[0], args[1]] : [args[0], Identity];
  return { type: "Union", parsers, mapping };
}

// node_modules/@sinclair/typebox/build/esm/parser/runtime/parse.mjs
function ParseContext(moduleProperties, left, right, code, context) {
  const result = ParseParser(moduleProperties, left, code, context);
  return result.length === 2 ? ParseParser(moduleProperties, right, result[1], result[0]) : [];
}
function ParseArray(moduleProperties, parser, code, context) {
  const buffer = [];
  let rest = code;
  while (rest.length > 0) {
    const result = ParseParser(moduleProperties, parser, rest, context);
    if (result.length === 0)
      return [buffer, rest];
    buffer.push(result[0]);
    rest = result[1];
  }
  return [buffer, rest];
}
function ParseConst(value, code, context) {
  return Const(value, code);
}
function ParseIdent(code, _context) {
  return Ident(code);
}
function ParseNumber(code, _context) {
  return Number3(code);
}
function ParseOptional(moduleProperties, parser, code, context) {
  const result = ParseParser(moduleProperties, parser, code, context);
  return result.length === 2 ? [[result[0]], result[1]] : [[], code];
}
function ParseRef(moduleProperties, ref, code, context) {
  const parser = moduleProperties[ref];
  if (!IsParser(parser))
    throw Error(`Cannot dereference Parser '${ref}'`);
  return ParseParser(moduleProperties, parser, code, context);
}
function ParseString(options, code, _context) {
  return String3(options, code);
}
function ParseTuple(moduleProperties, parsers, code, context) {
  const buffer = [];
  let rest = code;
  for (const parser of parsers) {
    const result = ParseParser(moduleProperties, parser, rest, context);
    if (result.length === 0)
      return [];
    buffer.push(result[0]);
    rest = result[1];
  }
  return [buffer, rest];
}
function ParseUnion(moduleProperties, parsers, code, context) {
  for (const parser of parsers) {
    const result = ParseParser(moduleProperties, parser, code, context);
    if (result.length === 0)
      continue;
    return result;
  }
  return [];
}
function ParseParser(moduleProperties, parser, code, context) {
  const result = IsContext(parser) ? ParseContext(moduleProperties, parser.left, parser.right, code, context) : IsArray5(parser) ? ParseArray(moduleProperties, parser.parser, code, context) : IsConst(parser) ? ParseConst(parser.value, code) : IsIdent(parser) ? ParseIdent(code) : IsNumber5(parser) ? ParseNumber(code) : IsOptional3(parser) ? ParseOptional(moduleProperties, parser.parser, code, context) : IsRef3(parser) ? ParseRef(moduleProperties, parser.ref, code, context) : IsString4(parser) ? ParseString(parser.options, code) : IsTuple3(parser) ? ParseTuple(moduleProperties, parser.parsers, code, context) : IsUnion3(parser) ? ParseUnion(moduleProperties, parser.parsers, code, context) : [];
  return result.length === 2 ? [parser.mapping(result[0], context), result[1]] : result;
}
function Parse(...args) {
  const withModuleProperties = typeof args[1] === "string" ? false : true;
  const [moduleProperties, parser, content, context] = withModuleProperties ? [args[0], args[1], args[2], args[3]] : [{}, args[0], args[1], args[2]];
  return ParseParser(moduleProperties, parser, content, context);
}

// node_modules/@sinclair/typebox/build/esm/parser/runtime/module.mjs
var Module = class {
  constructor(properties) {
    this.properties = properties;
  }
  /** Parses using one of the parsers defined on this instance */
  Parse(...args) {
    const [key, content, context] = args.length === 3 ? [args[0], args[1], args[2]] : args.length === 2 ? [args[0], args[1], void 0] : (() => {
      throw Error("Invalid parse arguments");
    })();
    return Parse(this.properties, this.properties[key], content, context);
  }
};

// node_modules/valibot/dist/index.mjs
var store$4;
// @__NO_SIDE_EFFECTS__
function getGlobalConfig(config$1) {
  return {
    lang: config$1?.lang ?? store$4?.lang,
    message: config$1?.message,
    abortEarly: config$1?.abortEarly ?? store$4?.abortEarly,
    abortPipeEarly: config$1?.abortPipeEarly ?? store$4?.abortPipeEarly
  };
}
var store$3;
// @__NO_SIDE_EFFECTS__
function getGlobalMessage(lang) {
  return store$3?.get(lang);
}
var store$2;
// @__NO_SIDE_EFFECTS__
function getSchemaMessage(lang) {
  return store$2?.get(lang);
}
var store$1;
// @__NO_SIDE_EFFECTS__
function getSpecificMessage(reference, lang) {
  return store$1?.get(reference)?.get(lang);
}
// @__NO_SIDE_EFFECTS__
function _stringify(input) {
  const type = typeof input;
  if (type === "string") return `"${input}"`;
  if (type === "number" || type === "bigint" || type === "boolean") return `${input}`;
  if (type === "object" || type === "function") return (input && Object.getPrototypeOf(input)?.constructor?.name) ?? "null";
  return type;
}
function _addIssue(context, label, dataset, config$1, other) {
  const input = dataset.value;
  const expected = context.expects ?? null;
  const received = /* @__PURE__ */ _stringify(input);
  const issue2 = {
    kind: context.kind,
    type: context.type,
    input,
    expected,
    received,
    message: `Invalid ${label}: ${expected ? `Expected ${expected} but r` : "R"}eceived ${received}`,
    requirement: context.requirement,
    path: other?.path,
    issues: other?.issues,
    lang: config$1.lang,
    abortEarly: config$1.abortEarly,
    abortPipeEarly: config$1.abortPipeEarly
  };
  const isSchema = context.kind === "schema";
  const message$1 = context.message ?? /* @__PURE__ */ getSpecificMessage(context.reference, issue2.lang) ?? (isSchema ? /* @__PURE__ */ getSchemaMessage(issue2.lang) : null) ?? config$1.message ?? /* @__PURE__ */ getGlobalMessage(issue2.lang);
  if (message$1 !== void 0) issue2.message = typeof message$1 === "function" ? message$1(issue2) : message$1;
  if (isSchema) dataset.typed = false;
  if (dataset.issues) dataset.issues.push(issue2);
  else dataset.issues = [issue2];
}
// @__NO_SIDE_EFFECTS__
function _getStandardProps(context) {
  return {
    version: 1,
    vendor: "valibot",
    validate(value$1) {
      return context["~run"]({ value: value$1 }, /* @__PURE__ */ getGlobalConfig());
    }
  };
}
var NON_DIGIT_REGEX = /\D/gu;
// @__NO_SIDE_EFFECTS__
function _isLuhnAlgo(input) {
  const number$1 = input.replace(NON_DIGIT_REGEX, "");
  let length$1 = number$1.length;
  let bit = 1;
  let sum = 0;
  while (length$1) {
    const value$1 = +number$1[--length$1];
    bit ^= 1;
    sum += bit ? [
      0,
      2,
      4,
      6,
      8,
      1,
      3,
      5,
      7,
      9
    ][value$1] : value$1;
  }
  return sum % 10 === 0;
}
var BASE64_REGEX = /^(?:[\da-z+/]{4})*(?:[\da-z+/]{2}==|[\da-z+/]{3}=)?$/iu;
var BIC_REGEX = /^[A-Z]{6}(?!00)[\dA-Z]{2}(?:[\dA-Z]{3})?$/u;
var CUID2_REGEX = /^[a-z][\da-z]*$/u;
var DECIMAL_REGEX = /^[+-]?(?:\d*\.)?\d+$/u;
var DIGITS_REGEX = /^\d+$/u;
var EMAIL_REGEX = /^[\w+-]+(?:\.[\w+-]+)*@[\da-z]+(?:[.-][\da-z]+)*\.[a-z]{2,}$/iu;
var EMOJI_REGEX = new RegExp("^(?:[\\u{1F1E6}-\\u{1F1FF}]{2}|\\u{1F3F4}[\\u{E0061}-\\u{E007A}]{2}[\\u{E0030}-\\u{E0039}\\u{E0061}-\\u{E007A}]{1,3}\\u{E007F}|(?:\\p{Emoji}\\uFE0F\\u20E3?|\\p{Emoji_Modifier_Base}\\p{Emoji_Modifier}?|(?![\\p{Emoji_Modifier_Base}\\u{1F1E6}-\\u{1F1FF}])\\p{Emoji_Presentation})(?:\\u200D(?:\\p{Emoji}\\uFE0F\\u20E3?|\\p{Emoji_Modifier_Base}\\p{Emoji_Modifier}?|(?![\\p{Emoji_Modifier_Base}\\u{1F1E6}-\\u{1F1FF}])\\p{Emoji_Presentation}))*)+$", "u");
var IPV4_REGEX = /^(?:(?:[1-9]|1\d|2[0-4])?\d|25[0-5])(?:\.(?:(?:[1-9]|1\d|2[0-4])?\d|25[0-5])){3}$/u;
var IPV6_REGEX = /^(?:(?:[\da-f]{1,4}:){7}[\da-f]{1,4}|(?:[\da-f]{1,4}:){1,7}:|(?:[\da-f]{1,4}:){1,6}:[\da-f]{1,4}|(?:[\da-f]{1,4}:){1,5}(?::[\da-f]{1,4}){1,2}|(?:[\da-f]{1,4}:){1,4}(?::[\da-f]{1,4}){1,3}|(?:[\da-f]{1,4}:){1,3}(?::[\da-f]{1,4}){1,4}|(?:[\da-f]{1,4}:){1,2}(?::[\da-f]{1,4}){1,5}|[\da-f]{1,4}:(?::[\da-f]{1,4}){1,6}|:(?:(?::[\da-f]{1,4}){1,7}|:)|fe80:(?::[\da-f]{0,4}){0,4}%[\da-z]+|::(?:f{4}(?::0{1,4})?:)?(?:(?:25[0-5]|(?:2[0-4]|1?\d)?\d)\.){3}(?:25[0-5]|(?:2[0-4]|1?\d)?\d)|(?:[\da-f]{1,4}:){1,4}:(?:(?:25[0-5]|(?:2[0-4]|1?\d)?\d)\.){3}(?:25[0-5]|(?:2[0-4]|1?\d)?\d))$/iu;
var IP_REGEX = /^(?:(?:[1-9]|1\d|2[0-4])?\d|25[0-5])(?:\.(?:(?:[1-9]|1\d|2[0-4])?\d|25[0-5])){3}$|^(?:(?:[\da-f]{1,4}:){7}[\da-f]{1,4}|(?:[\da-f]{1,4}:){1,7}:|(?:[\da-f]{1,4}:){1,6}:[\da-f]{1,4}|(?:[\da-f]{1,4}:){1,5}(?::[\da-f]{1,4}){1,2}|(?:[\da-f]{1,4}:){1,4}(?::[\da-f]{1,4}){1,3}|(?:[\da-f]{1,4}:){1,3}(?::[\da-f]{1,4}){1,4}|(?:[\da-f]{1,4}:){1,2}(?::[\da-f]{1,4}){1,5}|[\da-f]{1,4}:(?::[\da-f]{1,4}){1,6}|:(?:(?::[\da-f]{1,4}){1,7}|:)|fe80:(?::[\da-f]{0,4}){0,4}%[\da-z]+|::(?:f{4}(?::0{1,4})?:)?(?:(?:25[0-5]|(?:2[0-4]|1?\d)?\d)\.){3}(?:25[0-5]|(?:2[0-4]|1?\d)?\d)|(?:[\da-f]{1,4}:){1,4}:(?:(?:25[0-5]|(?:2[0-4]|1?\d)?\d)\.){3}(?:25[0-5]|(?:2[0-4]|1?\d)?\d))$/iu;
var ISO_DATE_REGEX = /^\d{4}-(?:0[1-9]|1[0-2])-(?:[12]\d|0[1-9]|3[01])$/u;
var ISO_DATE_TIME_REGEX = /^\d{4}-(?:0[1-9]|1[0-2])-(?:[12]\d|0[1-9]|3[01])[T ](?:0\d|1\d|2[0-3]):[0-5]\d$/u;
var ISO_TIME_REGEX = /^(?:0\d|1\d|2[0-3]):[0-5]\d$/u;
var ISO_TIME_SECOND_REGEX = /^(?:0\d|1\d|2[0-3])(?::[0-5]\d){2}$/u;
var ISO_TIMESTAMP_REGEX = /^\d{4}-(?:0[1-9]|1[0-2])-(?:[12]\d|0[1-9]|3[01])[T ](?:0\d|1\d|2[0-3])(?::[0-5]\d){2}(?:\.\d{1,9})?(?:Z|[+-](?:0\d|1\d|2[0-3])(?::?[0-5]\d)?)$/u;
var ISO_WEEK_REGEX = /^\d{4}-W(?:0[1-9]|[1-4]\d|5[0-3])$/u;
var MAC48_REGEX = /^(?:[\da-f]{2}:){5}[\da-f]{2}$|^(?:[\da-f]{2}-){5}[\da-f]{2}$|^(?:[\da-f]{4}\.){2}[\da-f]{4}$/iu;
var MAC64_REGEX = /^(?:[\da-f]{2}:){7}[\da-f]{2}$|^(?:[\da-f]{2}-){7}[\da-f]{2}$|^(?:[\da-f]{4}\.){3}[\da-f]{4}$|^(?:[\da-f]{4}:){3}[\da-f]{4}$/iu;
var MAC_REGEX = /^(?:[\da-f]{2}:){5}[\da-f]{2}$|^(?:[\da-f]{2}-){5}[\da-f]{2}$|^(?:[\da-f]{4}\.){2}[\da-f]{4}$|^(?:[\da-f]{2}:){7}[\da-f]{2}$|^(?:[\da-f]{2}-){7}[\da-f]{2}$|^(?:[\da-f]{4}\.){3}[\da-f]{4}$|^(?:[\da-f]{4}:){3}[\da-f]{4}$/iu;
var NANO_ID_REGEX = /^[\w-]+$/u;
var OCTAL_REGEX = /^(?:0o)?[0-7]+$/u;
var ULID_REGEX = /^[\da-hjkmnp-tv-zA-HJKMNP-TV-Z]{26}$/u;
var UUID_REGEX = /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/iu;
// @__NO_SIDE_EFFECTS__
function base64(message$1) {
  return {
    kind: "validation",
    type: "base64",
    reference: base64,
    async: false,
    expects: null,
    requirement: BASE64_REGEX,
    message: message$1,
    "~run"(dataset, config$1) {
      if (dataset.typed && !this.requirement.test(dataset.value)) _addIssue(this, "Base64", dataset, config$1);
      return dataset;
    }
  };
}
// @__NO_SIDE_EFFECTS__
function bic(message$1) {
  return {
    kind: "validation",
    type: "bic",
    reference: bic,
    async: false,
    expects: null,
    requirement: BIC_REGEX,
    message: message$1,
    "~run"(dataset, config$1) {
      if (dataset.typed && !this.requirement.test(dataset.value)) _addIssue(this, "BIC", dataset, config$1);
      return dataset;
    }
  };
}
var CREDIT_CARD_REGEX = /^(?:\d{14,19}|\d{4}(?: \d{3,6}){2,4}|\d{4}(?:-\d{3,6}){2,4})$/u;
var SANITIZE_REGEX = /[- ]/gu;
var PROVIDER_REGEX_LIST = [
  /^3[47]\d{13}$/u,
  /^3(?:0[0-5]|[68]\d)\d{11,13}$/u,
  /^6(?:011|5\d{2})\d{12,15}$/u,
  /^(?:2131|1800|35\d{3})\d{11}$/u,
  /^5[1-5]\d{2}|(?:222\d|22[3-9]\d|2[3-6]\d{2}|27[01]\d|2720)\d{12}$/u,
  /^(?:6[27]\d{14,17}|81\d{14,17})$/u,
  /^4\d{12}(?:\d{3,6})?$/u
];
// @__NO_SIDE_EFFECTS__
function creditCard(message$1) {
  return {
    kind: "validation",
    type: "credit_card",
    reference: creditCard,
    async: false,
    expects: null,
    requirement(input) {
      let sanitized;
      return CREDIT_CARD_REGEX.test(input) && (sanitized = input.replace(SANITIZE_REGEX, "")) && PROVIDER_REGEX_LIST.some((regex$1) => regex$1.test(sanitized)) && /* @__PURE__ */ _isLuhnAlgo(sanitized);
    },
    message: message$1,
    "~run"(dataset, config$1) {
      if (dataset.typed && !this.requirement(dataset.value)) _addIssue(this, "credit card", dataset, config$1);
      return dataset;
    }
  };
}
// @__NO_SIDE_EFFECTS__
function cuid2(message$1) {
  return {
    kind: "validation",
    type: "cuid2",
    reference: cuid2,
    async: false,
    expects: null,
    requirement: CUID2_REGEX,
    message: message$1,
    "~run"(dataset, config$1) {
      if (dataset.typed && !this.requirement.test(dataset.value)) _addIssue(this, "Cuid2", dataset, config$1);
      return dataset;
    }
  };
}
// @__NO_SIDE_EFFECTS__
function decimal(message$1) {
  return {
    kind: "validation",
    type: "decimal",
    reference: decimal,
    async: false,
    expects: null,
    requirement: DECIMAL_REGEX,
    message: message$1,
    "~run"(dataset, config$1) {
      if (dataset.typed && !this.requirement.test(dataset.value)) _addIssue(this, "decimal", dataset, config$1);
      return dataset;
    }
  };
}
// @__NO_SIDE_EFFECTS__
function digits(message$1) {
  return {
    kind: "validation",
    type: "digits",
    reference: digits,
    async: false,
    expects: null,
    requirement: DIGITS_REGEX,
    message: message$1,
    "~run"(dataset, config$1) {
      if (dataset.typed && !this.requirement.test(dataset.value)) _addIssue(this, "digits", dataset, config$1);
      return dataset;
    }
  };
}
// @__NO_SIDE_EFFECTS__
function email(message$1) {
  return {
    kind: "validation",
    type: "email",
    reference: email,
    expects: null,
    async: false,
    requirement: EMAIL_REGEX,
    message: message$1,
    "~run"(dataset, config$1) {
      if (dataset.typed && !this.requirement.test(dataset.value)) _addIssue(this, "email", dataset, config$1);
      return dataset;
    }
  };
}
// @__NO_SIDE_EFFECTS__
function emoji(message$1) {
  return {
    kind: "validation",
    type: "emoji",
    reference: emoji,
    async: false,
    expects: null,
    requirement: EMOJI_REGEX,
    message: message$1,
    "~run"(dataset, config$1) {
      if (dataset.typed && !this.requirement.test(dataset.value)) _addIssue(this, "emoji", dataset, config$1);
      return dataset;
    }
  };
}
// @__NO_SIDE_EFFECTS__
function ip(message$1) {
  return {
    kind: "validation",
    type: "ip",
    reference: ip,
    async: false,
    expects: null,
    requirement: IP_REGEX,
    message: message$1,
    "~run"(dataset, config$1) {
      if (dataset.typed && !this.requirement.test(dataset.value)) _addIssue(this, "IP", dataset, config$1);
      return dataset;
    }
  };
}
// @__NO_SIDE_EFFECTS__
function ipv4(message$1) {
  return {
    kind: "validation",
    type: "ipv4",
    reference: ipv4,
    async: false,
    expects: null,
    requirement: IPV4_REGEX,
    message: message$1,
    "~run"(dataset, config$1) {
      if (dataset.typed && !this.requirement.test(dataset.value)) _addIssue(this, "IPv4", dataset, config$1);
      return dataset;
    }
  };
}
// @__NO_SIDE_EFFECTS__
function ipv6(message$1) {
  return {
    kind: "validation",
    type: "ipv6",
    reference: ipv6,
    async: false,
    expects: null,
    requirement: IPV6_REGEX,
    message: message$1,
    "~run"(dataset, config$1) {
      if (dataset.typed && !this.requirement.test(dataset.value)) _addIssue(this, "IPv6", dataset, config$1);
      return dataset;
    }
  };
}
// @__NO_SIDE_EFFECTS__
function isoDate(message$1) {
  return {
    kind: "validation",
    type: "iso_date",
    reference: isoDate,
    async: false,
    expects: null,
    requirement: ISO_DATE_REGEX,
    message: message$1,
    "~run"(dataset, config$1) {
      if (dataset.typed && !this.requirement.test(dataset.value)) _addIssue(this, "date", dataset, config$1);
      return dataset;
    }
  };
}
// @__NO_SIDE_EFFECTS__
function isoDateTime(message$1) {
  return {
    kind: "validation",
    type: "iso_date_time",
    reference: isoDateTime,
    async: false,
    expects: null,
    requirement: ISO_DATE_TIME_REGEX,
    message: message$1,
    "~run"(dataset, config$1) {
      if (dataset.typed && !this.requirement.test(dataset.value)) _addIssue(this, "date-time", dataset, config$1);
      return dataset;
    }
  };
}
// @__NO_SIDE_EFFECTS__
function isoTime(message$1) {
  return {
    kind: "validation",
    type: "iso_time",
    reference: isoTime,
    async: false,
    expects: null,
    requirement: ISO_TIME_REGEX,
    message: message$1,
    "~run"(dataset, config$1) {
      if (dataset.typed && !this.requirement.test(dataset.value)) _addIssue(this, "time", dataset, config$1);
      return dataset;
    }
  };
}
// @__NO_SIDE_EFFECTS__
function isoTimeSecond(message$1) {
  return {
    kind: "validation",
    type: "iso_time_second",
    reference: isoTimeSecond,
    async: false,
    expects: null,
    requirement: ISO_TIME_SECOND_REGEX,
    message: message$1,
    "~run"(dataset, config$1) {
      if (dataset.typed && !this.requirement.test(dataset.value)) _addIssue(this, "time-second", dataset, config$1);
      return dataset;
    }
  };
}
// @__NO_SIDE_EFFECTS__
function isoTimestamp(message$1) {
  return {
    kind: "validation",
    type: "iso_timestamp",
    reference: isoTimestamp,
    async: false,
    expects: null,
    requirement: ISO_TIMESTAMP_REGEX,
    message: message$1,
    "~run"(dataset, config$1) {
      if (dataset.typed && !this.requirement.test(dataset.value)) _addIssue(this, "timestamp", dataset, config$1);
      return dataset;
    }
  };
}
// @__NO_SIDE_EFFECTS__
function isoWeek(message$1) {
  return {
    kind: "validation",
    type: "iso_week",
    reference: isoWeek,
    async: false,
    expects: null,
    requirement: ISO_WEEK_REGEX,
    message: message$1,
    "~run"(dataset, config$1) {
      if (dataset.typed && !this.requirement.test(dataset.value)) _addIssue(this, "week", dataset, config$1);
      return dataset;
    }
  };
}
// @__NO_SIDE_EFFECTS__
function mac(message$1) {
  return {
    kind: "validation",
    type: "mac",
    reference: mac,
    async: false,
    expects: null,
    requirement: MAC_REGEX,
    message: message$1,
    "~run"(dataset, config$1) {
      if (dataset.typed && !this.requirement.test(dataset.value)) _addIssue(this, "MAC", dataset, config$1);
      return dataset;
    }
  };
}
// @__NO_SIDE_EFFECTS__
function mac48(message$1) {
  return {
    kind: "validation",
    type: "mac48",
    reference: mac48,
    async: false,
    expects: null,
    requirement: MAC48_REGEX,
    message: message$1,
    "~run"(dataset, config$1) {
      if (dataset.typed && !this.requirement.test(dataset.value)) _addIssue(this, "48-bit MAC", dataset, config$1);
      return dataset;
    }
  };
}
// @__NO_SIDE_EFFECTS__
function mac64(message$1) {
  return {
    kind: "validation",
    type: "mac64",
    reference: mac64,
    async: false,
    expects: null,
    requirement: MAC64_REGEX,
    message: message$1,
    "~run"(dataset, config$1) {
      if (dataset.typed && !this.requirement.test(dataset.value)) _addIssue(this, "64-bit MAC", dataset, config$1);
      return dataset;
    }
  };
}
// @__NO_SIDE_EFFECTS__
function nanoid(message$1) {
  return {
    kind: "validation",
    type: "nanoid",
    reference: nanoid,
    async: false,
    expects: null,
    requirement: NANO_ID_REGEX,
    message: message$1,
    "~run"(dataset, config$1) {
      if (dataset.typed && !this.requirement.test(dataset.value)) _addIssue(this, "Nano ID", dataset, config$1);
      return dataset;
    }
  };
}
// @__NO_SIDE_EFFECTS__
function octal(message$1) {
  return {
    kind: "validation",
    type: "octal",
    reference: octal,
    async: false,
    expects: null,
    requirement: OCTAL_REGEX,
    message: message$1,
    "~run"(dataset, config$1) {
      if (dataset.typed && !this.requirement.test(dataset.value)) _addIssue(this, "octal", dataset, config$1);
      return dataset;
    }
  };
}
// @__NO_SIDE_EFFECTS__
function ulid(message$1) {
  return {
    kind: "validation",
    type: "ulid",
    reference: ulid,
    async: false,
    expects: null,
    requirement: ULID_REGEX,
    message: message$1,
    "~run"(dataset, config$1) {
      if (dataset.typed && !this.requirement.test(dataset.value)) _addIssue(this, "ULID", dataset, config$1);
      return dataset;
    }
  };
}
// @__NO_SIDE_EFFECTS__
function url(message$1) {
  return {
    kind: "validation",
    type: "url",
    reference: url,
    async: false,
    expects: null,
    requirement(input) {
      try {
        new URL(input);
        return true;
      } catch {
        return false;
      }
    },
    message: message$1,
    "~run"(dataset, config$1) {
      if (dataset.typed && !this.requirement(dataset.value)) _addIssue(this, "URL", dataset, config$1);
      return dataset;
    }
  };
}
// @__NO_SIDE_EFFECTS__
function uuid(message$1) {
  return {
    kind: "validation",
    type: "uuid",
    reference: uuid,
    async: false,
    expects: null,
    requirement: UUID_REGEX,
    message: message$1,
    "~run"(dataset, config$1) {
      if (dataset.typed && !this.requirement.test(dataset.value)) _addIssue(this, "UUID", dataset, config$1);
      return dataset;
    }
  };
}
// @__NO_SIDE_EFFECTS__
function string(message$1) {
  return {
    kind: "schema",
    type: "string",
    reference: string,
    expects: "string",
    async: false,
    message: message$1,
    get "~standard"() {
      return /* @__PURE__ */ _getStandardProps(this);
    },
    "~run"(dataset, config$1) {
      if (typeof dataset.value === "string") dataset.typed = true;
      else _addIssue(this, "type", dataset, config$1);
      return dataset;
    }
  };
}
// @__NO_SIDE_EFFECTS__
function pipe(...pipe$1) {
  return {
    ...pipe$1[0],
    pipe: pipe$1,
    get "~standard"() {
      return /* @__PURE__ */ _getStandardProps(this);
    },
    "~run"(dataset, config$1) {
      for (const item of pipe$1) if (item.kind !== "metadata") {
        if (dataset.issues && (item.kind === "schema" || item.kind === "transformation")) {
          dataset.typed = false;
          break;
        }
        if (!dataset.issues || !config$1.abortEarly && !config$1.abortPipeEarly) dataset = item["~run"](dataset, config$1);
      }
      return dataset;
    }
  };
}
// @__NO_SIDE_EFFECTS__
function safeParse(schema, input, config$1) {
  const dataset = schema["~run"]({ value: input }, /* @__PURE__ */ getGlobalConfig(config$1));
  return {
    typed: dataset.typed,
    success: !dataset.issues,
    output: dataset.value,
    issues: dataset.issues
  };
}
format_exports.Set("base64", (value) => safeParse(pipe(string(), base64()), value).success);
format_exports.Set("bic", (value) => safeParse(pipe(string(), bic()), value).success);
format_exports.Set("credit_card", (value) => safeParse(pipe(string(), creditCard()), value).success);
format_exports.Set("cuid2", (value) => safeParse(pipe(string(), cuid2()), value).success);
format_exports.Set("decimal", (value) => safeParse(pipe(string(), decimal()), value).success);
format_exports.Set("digits", (value) => safeParse(pipe(string(), digits()), value).success);
format_exports.Set("email", (value) => safeParse(pipe(string(), email()), value).success);
format_exports.Set("emoji", (value) => safeParse(pipe(string(), emoji()), value).success);
format_exports.Set("ip", (value) => safeParse(pipe(string(), ip()), value).success);
format_exports.Set("ipv4", (value) => safeParse(pipe(string(), ipv4()), value).success);
format_exports.Set("ipv6", (value) => safeParse(pipe(string(), ipv6()), value).success);
format_exports.Set("iso_date", (value) => safeParse(pipe(string(), isoDate()), value).success);
format_exports.Set("iso_date_time", (value) => safeParse(pipe(string(), isoDateTime()), value).success);
format_exports.Set("iso_time", (value) => safeParse(pipe(string(), isoTime()), value).success);
format_exports.Set("iso_time_second", (value) => safeParse(pipe(string(), isoTimeSecond()), value).success);
format_exports.Set("iso_timestamp", (value) => safeParse(pipe(string(), isoTimestamp()), value).success);
format_exports.Set("iso_week", (value) => safeParse(pipe(string(), isoWeek()), value).success);
format_exports.Set("mac", (value) => safeParse(pipe(string(), mac()), value).success);
format_exports.Set("mac48", (value) => safeParse(pipe(string(), mac48()), value).success);
format_exports.Set("mac64", (value) => safeParse(pipe(string(), mac64()), value).success);
format_exports.Set("nanoid", (value) => safeParse(pipe(string(), nanoid()), value).success);
format_exports.Set("octal", (value) => safeParse(pipe(string(), octal()), value).success);
format_exports.Set("ulid", (value) => safeParse(pipe(string(), ulid()), value).success);
format_exports.Set("url", (value) => safeParse(pipe(string(), url()), value).success);
format_exports.Set("uuid", (value) => safeParse(pipe(string(), uuid()), value).success);
type_exports2.Set("ValibotBlob", (schema, value) => {
  return safeParse(schema.schema, value).success;
});
type_exports2.Set("ValibotCustom", (schema, value) => safeParse(schema.schema, value).success);
type_exports2.Set("ValibotEnum", (schema, value) => {
  return safeParse(schema.type, value).success;
});
type_exports2.Set("ValibotFile", (schema, value) => {
  return safeParse(schema.schema, value).success;
});
type_exports2.Set("ValibotFunction", (schema, value) => {
  return safeParse(schema.schema, value).success;
});
type_exports2.Set("ValibotInstance", (schema, value) => {
  return safeParse(schema.schema, value).success;
});
type_exports2.Set("ValibotLooseTuple", (schema, value) => {
  return safeParse(schema.schema, value).success;
});
type_exports2.Set("ValibotMap", (schema, value) => {
  return safeParse(schema.schema, value).success;
});
type_exports2.Set("ValibotNaN", (schema, value) => {
  return safeParse(schema.schema, value).success;
});
type_exports2.Set("ValibotPromise", (schema, value) => {
  return safeParse(schema.schema, value).success;
});
type_exports2.Set("ValibotSet", (schema, value) => {
  return safeParse(schema.schema, value).success;
});
type_exports2.Set("ValibotTupleWithRest", (schema, value) => {
  return safeParse(schema.schema, value).success;
});
type_exports2.Set("ValibotVariant", (schema, value) => {
  return safeParse(schema.schema, value).success;
});
// @__NO_SIDE_EFFECTS__
function $constructor(name, initializer3, params) {
  function init(inst, def) {
    if (!inst._zod) {
      Object.defineProperty(inst, "_zod", {
        value: {
          def,
          constr: _,
          traits: /* @__PURE__ */ new Set()
        },
        enumerable: false
      });
    }
    if (inst._zod.traits.has(name)) {
      return;
    }
    inst._zod.traits.add(name);
    initializer3(inst, def);
    const proto = _.prototype;
    const keys = Object.keys(proto);
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (!(k in inst)) {
        inst[k] = proto[k].bind(inst);
      }
    }
  }
  const Parent = params?.Parent ?? Object;
  class Definition extends Parent {
  }
  Object.defineProperty(Definition, "name", { value: name });
  function _(def) {
    var _a2;
    const inst = params?.Parent ? new Definition() : this;
    init(inst, def);
    (_a2 = inst._zod).deferred ?? (_a2.deferred = []);
    for (const fn of inst._zod.deferred) {
      fn();
    }
    return inst;
  }
  Object.defineProperty(_, "init", { value: init });
  Object.defineProperty(_, Symbol.hasInstance, {
    value: (inst) => {
      if (params?.Parent && inst instanceof params.Parent)
        return true;
      return inst?._zod?.traits?.has(name);
    }
  });
  Object.defineProperty(_, "name", { value: name });
  return _;
}
var $ZodAsyncError = class extends Error {
  constructor() {
    super(`Encountered Promise during synchronous parse. Use .parseAsync() instead.`);
  }
};
var $ZodEncodeError = class extends Error {
  constructor(name) {
    super(`Encountered unidirectional transform during encode: ${name}`);
    this.name = "ZodEncodeError";
  }
};
var globalConfig = {};
function config(newConfig) {
  return globalConfig;
}

// node_modules/zod/v4/core/util.js
var util_exports = {};
__export(util_exports, {
  BIGINT_FORMAT_RANGES: () => BIGINT_FORMAT_RANGES,
  Class: () => Class,
  NUMBER_FORMAT_RANGES: () => NUMBER_FORMAT_RANGES,
  aborted: () => aborted,
  allowsEval: () => allowsEval,
  assert: () => assert,
  assertEqual: () => assertEqual,
  assertIs: () => assertIs,
  assertNever: () => assertNever,
  assertNotEqual: () => assertNotEqual,
  assignProp: () => assignProp,
  base64ToUint8Array: () => base64ToUint8Array,
  base64urlToUint8Array: () => base64urlToUint8Array,
  cached: () => cached,
  captureStackTrace: () => captureStackTrace,
  cleanEnum: () => cleanEnum,
  cleanRegex: () => cleanRegex,
  clone: () => clone,
  cloneDef: () => cloneDef,
  createTransparentProxy: () => createTransparentProxy,
  defineLazy: () => defineLazy,
  esc: () => esc,
  escapeRegex: () => escapeRegex,
  extend: () => extend,
  finalizeIssue: () => finalizeIssue,
  floatSafeRemainder: () => floatSafeRemainder,
  getElementAtPath: () => getElementAtPath,
  getEnumValues: () => getEnumValues,
  getLengthableOrigin: () => getLengthableOrigin,
  getParsedType: () => getParsedType,
  getSizableOrigin: () => getSizableOrigin,
  hexToUint8Array: () => hexToUint8Array,
  isObject: () => isObject,
  isPlainObject: () => isPlainObject,
  issue: () => issue,
  joinValues: () => joinValues,
  jsonStringifyReplacer: () => jsonStringifyReplacer,
  merge: () => merge,
  mergeDefs: () => mergeDefs,
  normalizeParams: () => normalizeParams,
  nullish: () => nullish,
  numKeys: () => numKeys,
  objectClone: () => objectClone,
  omit: () => omit,
  optionalKeys: () => optionalKeys,
  partial: () => partial,
  pick: () => pick,
  prefixIssues: () => prefixIssues,
  primitiveTypes: () => primitiveTypes,
  promiseAllObject: () => promiseAllObject,
  propertyKeyTypes: () => propertyKeyTypes,
  randomString: () => randomString,
  required: () => required,
  safeExtend: () => safeExtend,
  shallowClone: () => shallowClone,
  slugify: () => slugify,
  stringifyPrimitive: () => stringifyPrimitive,
  uint8ArrayToBase64: () => uint8ArrayToBase64,
  uint8ArrayToBase64url: () => uint8ArrayToBase64url,
  uint8ArrayToHex: () => uint8ArrayToHex,
  unwrapMessage: () => unwrapMessage
});
function assertEqual(val) {
  return val;
}
function assertNotEqual(val) {
  return val;
}
function assertIs(_arg) {
}
function assertNever(_x) {
  throw new Error("Unexpected value in exhaustive check");
}
function assert(_) {
}
function getEnumValues(entries) {
  const numericValues = Object.values(entries).filter((v) => typeof v === "number");
  const values = Object.entries(entries).filter(([k, _]) => numericValues.indexOf(+k) === -1).map(([_, v]) => v);
  return values;
}
function joinValues(array2, separator = "|") {
  return array2.map((val) => stringifyPrimitive(val)).join(separator);
}
function jsonStringifyReplacer(_, value) {
  if (typeof value === "bigint")
    return value.toString();
  return value;
}
function cached(getter) {
  return {
    get value() {
      {
        const value = getter();
        Object.defineProperty(this, "value", { value });
        return value;
      }
    }
  };
}
function nullish(input) {
  return input === null || input === void 0;
}
function cleanRegex(source) {
  const start = source.startsWith("^") ? 1 : 0;
  const end = source.endsWith("$") ? source.length - 1 : source.length;
  return source.slice(start, end);
}
function floatSafeRemainder(val, step) {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepString = step.toString();
  let stepDecCount = (stepString.split(".")[1] || "").length;
  if (stepDecCount === 0 && /\d?e-\d?/.test(stepString)) {
    const match = stepString.match(/\d?e-(\d?)/);
    if (match?.[1]) {
      stepDecCount = Number.parseInt(match[1]);
    }
  }
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
  return valInt % stepInt / 10 ** decCount;
}
var EVALUATING = /* @__PURE__ */ Symbol("evaluating");
function defineLazy(object, key, getter) {
  let value = void 0;
  Object.defineProperty(object, key, {
    get() {
      if (value === EVALUATING) {
        return void 0;
      }
      if (value === void 0) {
        value = EVALUATING;
        value = getter();
      }
      return value;
    },
    set(v) {
      Object.defineProperty(object, key, {
        value: v
        // configurable: true,
      });
    },
    configurable: true
  });
}
function objectClone(obj) {
  return Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj));
}
function assignProp(target, prop, value) {
  Object.defineProperty(target, prop, {
    value,
    writable: true,
    enumerable: true,
    configurable: true
  });
}
function mergeDefs(...defs) {
  const mergedDescriptors = {};
  for (const def of defs) {
    const descriptors = Object.getOwnPropertyDescriptors(def);
    Object.assign(mergedDescriptors, descriptors);
  }
  return Object.defineProperties({}, mergedDescriptors);
}
function cloneDef(schema) {
  return mergeDefs(schema._zod.def);
}
function getElementAtPath(obj, path) {
  if (!path)
    return obj;
  return path.reduce((acc, key) => acc?.[key], obj);
}
function promiseAllObject(promisesObj) {
  const keys = Object.keys(promisesObj);
  const promises = keys.map((key) => promisesObj[key]);
  return Promise.all(promises).then((results) => {
    const resolvedObj = {};
    for (let i = 0; i < keys.length; i++) {
      resolvedObj[keys[i]] = results[i];
    }
    return resolvedObj;
  });
}
function randomString(length = 10) {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  let str = "";
  for (let i = 0; i < length; i++) {
    str += chars[Math.floor(Math.random() * chars.length)];
  }
  return str;
}
function esc(str) {
  return JSON.stringify(str);
}
function slugify(input) {
  return input.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
var captureStackTrace = "captureStackTrace" in Error ? Error.captureStackTrace : (..._args) => {
};
function isObject(data) {
  return typeof data === "object" && data !== null && !Array.isArray(data);
}
var allowsEval = cached(() => {
  if (typeof navigator !== "undefined" && navigator?.userAgent?.includes("Cloudflare")) {
    return false;
  }
  try {
    const F = Function;
    new F("");
    return true;
  } catch (_) {
    return false;
  }
});
function isPlainObject(o) {
  if (isObject(o) === false)
    return false;
  const ctor = o.constructor;
  if (ctor === void 0)
    return true;
  if (typeof ctor !== "function")
    return true;
  const prot = ctor.prototype;
  if (isObject(prot) === false)
    return false;
  if (Object.prototype.hasOwnProperty.call(prot, "isPrototypeOf") === false) {
    return false;
  }
  return true;
}
function shallowClone(o) {
  if (isPlainObject(o))
    return { ...o };
  if (Array.isArray(o))
    return [...o];
  return o;
}
function numKeys(data) {
  let keyCount = 0;
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      keyCount++;
    }
  }
  return keyCount;
}
var getParsedType = (data) => {
  const t2 = typeof data;
  switch (t2) {
    case "undefined":
      return "undefined";
    case "string":
      return "string";
    case "number":
      return Number.isNaN(data) ? "nan" : "number";
    case "boolean":
      return "boolean";
    case "function":
      return "function";
    case "bigint":
      return "bigint";
    case "symbol":
      return "symbol";
    case "object":
      if (Array.isArray(data)) {
        return "array";
      }
      if (data === null) {
        return "null";
      }
      if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
        return "promise";
      }
      if (typeof Map !== "undefined" && data instanceof Map) {
        return "map";
      }
      if (typeof Set !== "undefined" && data instanceof Set) {
        return "set";
      }
      if (typeof Date !== "undefined" && data instanceof Date) {
        return "date";
      }
      if (typeof File !== "undefined" && data instanceof File) {
        return "file";
      }
      return "object";
    default:
      throw new Error(`Unknown data type: ${t2}`);
  }
};
var propertyKeyTypes = /* @__PURE__ */ new Set(["string", "number", "symbol"]);
var primitiveTypes = /* @__PURE__ */ new Set(["string", "number", "bigint", "boolean", "symbol", "undefined"]);
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function clone(inst, def, params) {
  const cl = new inst._zod.constr(def ?? inst._zod.def);
  if (!def || params?.parent)
    cl._zod.parent = inst;
  return cl;
}
function normalizeParams(_params) {
  const params = _params;
  if (!params)
    return {};
  if (typeof params === "string")
    return { error: () => params };
  if (params?.message !== void 0) {
    if (params?.error !== void 0)
      throw new Error("Cannot specify both `message` and `error` params");
    params.error = params.message;
  }
  delete params.message;
  if (typeof params.error === "string")
    return { ...params, error: () => params.error };
  return params;
}
function createTransparentProxy(getter) {
  let target;
  return new Proxy({}, {
    get(_, prop, receiver) {
      target ?? (target = getter());
      return Reflect.get(target, prop, receiver);
    },
    set(_, prop, value, receiver) {
      target ?? (target = getter());
      return Reflect.set(target, prop, value, receiver);
    },
    has(_, prop) {
      target ?? (target = getter());
      return Reflect.has(target, prop);
    },
    deleteProperty(_, prop) {
      target ?? (target = getter());
      return Reflect.deleteProperty(target, prop);
    },
    ownKeys(_) {
      target ?? (target = getter());
      return Reflect.ownKeys(target);
    },
    getOwnPropertyDescriptor(_, prop) {
      target ?? (target = getter());
      return Reflect.getOwnPropertyDescriptor(target, prop);
    },
    defineProperty(_, prop, descriptor) {
      target ?? (target = getter());
      return Reflect.defineProperty(target, prop, descriptor);
    }
  });
}
function stringifyPrimitive(value) {
  if (typeof value === "bigint")
    return value.toString() + "n";
  if (typeof value === "string")
    return `"${value}"`;
  return `${value}`;
}
function optionalKeys(shape) {
  return Object.keys(shape).filter((k) => {
    return shape[k]._zod.optin === "optional" && shape[k]._zod.optout === "optional";
  });
}
var NUMBER_FORMAT_RANGES = {
  safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
  int32: [-2147483648, 2147483647],
  uint32: [0, 4294967295],
  float32: [-34028234663852886e22, 34028234663852886e22],
  float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
};
var BIGINT_FORMAT_RANGES = {
  int64: [/* @__PURE__ */ BigInt("-9223372036854775808"), /* @__PURE__ */ BigInt("9223372036854775807")],
  uint64: [/* @__PURE__ */ BigInt(0), /* @__PURE__ */ BigInt("18446744073709551615")]
};
function pick(schema, mask) {
  const currDef = schema._zod.def;
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const newShape = {};
      for (const key in mask) {
        if (!(key in currDef.shape)) {
          throw new Error(`Unrecognized key: "${key}"`);
        }
        if (!mask[key])
          continue;
        newShape[key] = currDef.shape[key];
      }
      assignProp(this, "shape", newShape);
      return newShape;
    },
    checks: []
  });
  return clone(schema, def);
}
function omit(schema, mask) {
  const currDef = schema._zod.def;
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const newShape = { ...schema._zod.def.shape };
      for (const key in mask) {
        if (!(key in currDef.shape)) {
          throw new Error(`Unrecognized key: "${key}"`);
        }
        if (!mask[key])
          continue;
        delete newShape[key];
      }
      assignProp(this, "shape", newShape);
      return newShape;
    },
    checks: []
  });
  return clone(schema, def);
}
function extend(schema, shape) {
  if (!isPlainObject(shape)) {
    throw new Error("Invalid input to extend: expected a plain object");
  }
  const checks = schema._zod.def.checks;
  const hasChecks = checks && checks.length > 0;
  if (hasChecks) {
    throw new Error("Object schemas containing refinements cannot be extended. Use `.safeExtend()` instead.");
  }
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const _shape = { ...schema._zod.def.shape, ...shape };
      assignProp(this, "shape", _shape);
      return _shape;
    },
    checks: []
  });
  return clone(schema, def);
}
function safeExtend(schema, shape) {
  if (!isPlainObject(shape)) {
    throw new Error("Invalid input to safeExtend: expected a plain object");
  }
  const def = {
    ...schema._zod.def,
    get shape() {
      const _shape = { ...schema._zod.def.shape, ...shape };
      assignProp(this, "shape", _shape);
      return _shape;
    },
    checks: schema._zod.def.checks
  };
  return clone(schema, def);
}
function merge(a, b) {
  const def = mergeDefs(a._zod.def, {
    get shape() {
      const _shape = { ...a._zod.def.shape, ...b._zod.def.shape };
      assignProp(this, "shape", _shape);
      return _shape;
    },
    get catchall() {
      return b._zod.def.catchall;
    },
    checks: []
    // delete existing checks
  });
  return clone(a, def);
}
function partial(Class2, schema, mask) {
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const oldShape = schema._zod.def.shape;
      const shape = { ...oldShape };
      if (mask) {
        for (const key in mask) {
          if (!(key in oldShape)) {
            throw new Error(`Unrecognized key: "${key}"`);
          }
          if (!mask[key])
            continue;
          shape[key] = Class2 ? new Class2({
            type: "optional",
            innerType: oldShape[key]
          }) : oldShape[key];
        }
      } else {
        for (const key in oldShape) {
          shape[key] = Class2 ? new Class2({
            type: "optional",
            innerType: oldShape[key]
          }) : oldShape[key];
        }
      }
      assignProp(this, "shape", shape);
      return shape;
    },
    checks: []
  });
  return clone(schema, def);
}
function required(Class2, schema, mask) {
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const oldShape = schema._zod.def.shape;
      const shape = { ...oldShape };
      if (mask) {
        for (const key in mask) {
          if (!(key in shape)) {
            throw new Error(`Unrecognized key: "${key}"`);
          }
          if (!mask[key])
            continue;
          shape[key] = new Class2({
            type: "nonoptional",
            innerType: oldShape[key]
          });
        }
      } else {
        for (const key in oldShape) {
          shape[key] = new Class2({
            type: "nonoptional",
            innerType: oldShape[key]
          });
        }
      }
      assignProp(this, "shape", shape);
      return shape;
    },
    checks: []
  });
  return clone(schema, def);
}
function aborted(x, startIndex = 0) {
  if (x.aborted === true)
    return true;
  for (let i = startIndex; i < x.issues.length; i++) {
    if (x.issues[i]?.continue !== true) {
      return true;
    }
  }
  return false;
}
function prefixIssues(path, issues) {
  return issues.map((iss) => {
    var _a2;
    (_a2 = iss).path ?? (_a2.path = []);
    iss.path.unshift(path);
    return iss;
  });
}
function unwrapMessage(message) {
  return typeof message === "string" ? message : message?.message;
}
function finalizeIssue(iss, ctx, config2) {
  const full = { ...iss, path: iss.path ?? [] };
  if (!iss.message) {
    const message = unwrapMessage(iss.inst?._zod.def?.error?.(iss)) ?? unwrapMessage(ctx?.error?.(iss)) ?? unwrapMessage(config2.customError?.(iss)) ?? unwrapMessage(config2.localeError?.(iss)) ?? "Invalid input";
    full.message = message;
  }
  delete full.inst;
  delete full.continue;
  if (!ctx?.reportInput) {
    delete full.input;
  }
  return full;
}
function getSizableOrigin(input) {
  if (input instanceof Set)
    return "set";
  if (input instanceof Map)
    return "map";
  if (input instanceof File)
    return "file";
  return "unknown";
}
function getLengthableOrigin(input) {
  if (Array.isArray(input))
    return "array";
  if (typeof input === "string")
    return "string";
  return "unknown";
}
function issue(...args) {
  const [iss, input, inst] = args;
  if (typeof iss === "string") {
    return {
      message: iss,
      code: "custom",
      input,
      inst
    };
  }
  return { ...iss };
}
function cleanEnum(obj) {
  return Object.entries(obj).filter(([k, _]) => {
    return Number.isNaN(Number.parseInt(k, 10));
  }).map((el) => el[1]);
}
function base64ToUint8Array(base643) {
  const binaryString = atob(base643);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
function uint8ArrayToBase64(bytes) {
  let binaryString = "";
  for (let i = 0; i < bytes.length; i++) {
    binaryString += String.fromCharCode(bytes[i]);
  }
  return btoa(binaryString);
}
function base64urlToUint8Array(base64url2) {
  const base643 = base64url2.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - base643.length % 4) % 4);
  return base64ToUint8Array(base643 + padding);
}
function uint8ArrayToBase64url(bytes) {
  return uint8ArrayToBase64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
function hexToUint8Array(hex) {
  const cleanHex = hex.replace(/^0x/, "");
  if (cleanHex.length % 2 !== 0) {
    throw new Error("Invalid hex string length");
  }
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = Number.parseInt(cleanHex.slice(i, i + 2), 16);
  }
  return bytes;
}
function uint8ArrayToHex(bytes) {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}
var Class = class {
  constructor(..._args) {
  }
};

// node_modules/zod/v4/core/errors.js
var initializer = (inst, def) => {
  inst.name = "$ZodError";
  Object.defineProperty(inst, "_zod", {
    value: inst._zod,
    enumerable: false
  });
  Object.defineProperty(inst, "issues", {
    value: def,
    enumerable: false
  });
  inst.message = JSON.stringify(def, jsonStringifyReplacer, 2);
  Object.defineProperty(inst, "toString", {
    value: () => inst.message,
    enumerable: false
  });
};
var $ZodError = $constructor("$ZodError", initializer);
var $ZodRealError = $constructor("$ZodError", initializer, { Parent: Error });
function flattenError(error, mapper = (issue2) => issue2.message) {
  const fieldErrors = {};
  const formErrors = [];
  for (const sub of error.issues) {
    if (sub.path.length > 0) {
      fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
      fieldErrors[sub.path[0]].push(mapper(sub));
    } else {
      formErrors.push(mapper(sub));
    }
  }
  return { formErrors, fieldErrors };
}
function formatError(error, mapper = (issue2) => issue2.message) {
  const fieldErrors = { _errors: [] };
  const processError = (error2) => {
    for (const issue2 of error2.issues) {
      if (issue2.code === "invalid_union" && issue2.errors.length) {
        issue2.errors.map((issues) => processError({ issues }));
      } else if (issue2.code === "invalid_key") {
        processError({ issues: issue2.issues });
      } else if (issue2.code === "invalid_element") {
        processError({ issues: issue2.issues });
      } else if (issue2.path.length === 0) {
        fieldErrors._errors.push(mapper(issue2));
      } else {
        let curr = fieldErrors;
        let i = 0;
        while (i < issue2.path.length) {
          const el = issue2.path[i];
          const terminal = i === issue2.path.length - 1;
          if (!terminal) {
            curr[el] = curr[el] || { _errors: [] };
          } else {
            curr[el] = curr[el] || { _errors: [] };
            curr[el]._errors.push(mapper(issue2));
          }
          curr = curr[el];
          i++;
        }
      }
    }
  };
  processError(error);
  return fieldErrors;
}

// node_modules/zod/v4/core/parse.js
var _parse = (_Err) => (schema, value, _ctx, _params) => {
  const ctx = _ctx ? Object.assign(_ctx, { async: false }) : { async: false };
  const result = schema._zod.run({ value, issues: [] }, ctx);
  if (result instanceof Promise) {
    throw new $ZodAsyncError();
  }
  if (result.issues.length) {
    const e = new (_params?.Err ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
    captureStackTrace(e, _params?.callee);
    throw e;
  }
  return result.value;
};
var _parseAsync = (_Err) => async (schema, value, _ctx, params) => {
  const ctx = _ctx ? Object.assign(_ctx, { async: true }) : { async: true };
  let result = schema._zod.run({ value, issues: [] }, ctx);
  if (result instanceof Promise)
    result = await result;
  if (result.issues.length) {
    const e = new (params?.Err ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
    captureStackTrace(e, params?.callee);
    throw e;
  }
  return result.value;
};
var _safeParse = (_Err) => (schema, value, _ctx) => {
  const ctx = _ctx ? { ..._ctx, async: false } : { async: false };
  const result = schema._zod.run({ value, issues: [] }, ctx);
  if (result instanceof Promise) {
    throw new $ZodAsyncError();
  }
  return result.issues.length ? {
    success: false,
    error: new (_Err ?? $ZodError)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
  } : { success: true, data: result.value };
};
var safeParse2 = /* @__PURE__ */ _safeParse($ZodRealError);
var _safeParseAsync = (_Err) => async (schema, value, _ctx) => {
  const ctx = _ctx ? Object.assign(_ctx, { async: true }) : { async: true };
  let result = schema._zod.run({ value, issues: [] }, ctx);
  if (result instanceof Promise)
    result = await result;
  return result.issues.length ? {
    success: false,
    error: new _Err(result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
  } : { success: true, data: result.value };
};
var safeParseAsync = /* @__PURE__ */ _safeParseAsync($ZodRealError);
var _encode = (_Err) => (schema, value, _ctx) => {
  const ctx = _ctx ? Object.assign(_ctx, { direction: "backward" }) : { direction: "backward" };
  return _parse(_Err)(schema, value, ctx);
};
var _decode = (_Err) => (schema, value, _ctx) => {
  return _parse(_Err)(schema, value, _ctx);
};
var _encodeAsync = (_Err) => async (schema, value, _ctx) => {
  const ctx = _ctx ? Object.assign(_ctx, { direction: "backward" }) : { direction: "backward" };
  return _parseAsync(_Err)(schema, value, ctx);
};
var _decodeAsync = (_Err) => async (schema, value, _ctx) => {
  return _parseAsync(_Err)(schema, value, _ctx);
};
var _safeEncode = (_Err) => (schema, value, _ctx) => {
  const ctx = _ctx ? Object.assign(_ctx, { direction: "backward" }) : { direction: "backward" };
  return _safeParse(_Err)(schema, value, ctx);
};
var _safeDecode = (_Err) => (schema, value, _ctx) => {
  return _safeParse(_Err)(schema, value, _ctx);
};
var _safeEncodeAsync = (_Err) => async (schema, value, _ctx) => {
  const ctx = _ctx ? Object.assign(_ctx, { direction: "backward" }) : { direction: "backward" };
  return _safeParseAsync(_Err)(schema, value, ctx);
};
var _safeDecodeAsync = (_Err) => async (schema, value, _ctx) => {
  return _safeParseAsync(_Err)(schema, value, _ctx);
};

// node_modules/zod/v4/core/regexes.js
var cuid = /^[cC][^\s-]{8,}$/;
var cuid22 = /^[0-9a-z]+$/;
var ulid2 = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/;
var xid = /^[0-9a-vA-V]{20}$/;
var ksuid = /^[A-Za-z0-9]{27}$/;
var nanoid2 = /^[a-zA-Z0-9_-]{21}$/;
var duration = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/;
var guid = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;
var uuid2 = (version2) => {
  if (!version2)
    return /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/;
  return new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${version2}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`);
};
var email2 = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;
var _emoji = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
function emoji2() {
  return new RegExp(_emoji, "u");
}
var ipv42 = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
var ipv62 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;
var cidrv4 = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/;
var cidrv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
var base642 = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/;
var base64url = /^[A-Za-z0-9_-]*$/;
var e164 = /^\+(?:[0-9]){6,14}[0-9]$/;
var dateSource = `(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))`;
var date = /* @__PURE__ */ new RegExp(`^${dateSource}$`);
function timeSource(args) {
  const hhmm = `(?:[01]\\d|2[0-3]):[0-5]\\d`;
  const regex = typeof args.precision === "number" ? args.precision === -1 ? `${hhmm}` : args.precision === 0 ? `${hhmm}:[0-5]\\d` : `${hhmm}:[0-5]\\d\\.\\d{${args.precision}}` : `${hhmm}(?::[0-5]\\d(?:\\.\\d+)?)?`;
  return regex;
}
function time(args) {
  return new RegExp(`^${timeSource(args)}$`);
}
function datetime(args) {
  const time3 = timeSource({ precision: args.precision });
  const opts = ["Z"];
  if (args.local)
    opts.push("");
  if (args.offset)
    opts.push(`([+-](?:[01]\\d|2[0-3]):[0-5]\\d)`);
  const timeRegex = `${time3}(?:${opts.join("|")})`;
  return new RegExp(`^${dateSource}T(?:${timeRegex})$`);
}
var string2 = (params) => {
  const regex = params ? `[\\s\\S]{${params?.minimum ?? 0},${params?.maximum ?? ""}}` : `[\\s\\S]*`;
  return new RegExp(`^${regex}$`);
};
var lowercase = /^[^A-Z]*$/;
var uppercase = /^[^a-z]*$/;

// node_modules/zod/v4/core/checks.js
var $ZodCheck = /* @__PURE__ */ $constructor("$ZodCheck", (inst, def) => {
  var _a2;
  inst._zod ?? (inst._zod = {});
  inst._zod.def = def;
  (_a2 = inst._zod).onattach ?? (_a2.onattach = []);
});
var $ZodCheckMaxLength = /* @__PURE__ */ $constructor("$ZodCheckMaxLength", (inst, def) => {
  var _a2;
  $ZodCheck.init(inst, def);
  (_a2 = inst._zod.def).when ?? (_a2.when = (payload) => {
    const val = payload.value;
    return !nullish(val) && val.length !== void 0;
  });
  inst._zod.onattach.push((inst2) => {
    const curr = inst2._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
    if (def.maximum < curr)
      inst2._zod.bag.maximum = def.maximum;
  });
  inst._zod.check = (payload) => {
    const input = payload.value;
    const length = input.length;
    if (length <= def.maximum)
      return;
    const origin = getLengthableOrigin(input);
    payload.issues.push({
      origin,
      code: "too_big",
      maximum: def.maximum,
      inclusive: true,
      input,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckMinLength = /* @__PURE__ */ $constructor("$ZodCheckMinLength", (inst, def) => {
  var _a2;
  $ZodCheck.init(inst, def);
  (_a2 = inst._zod.def).when ?? (_a2.when = (payload) => {
    const val = payload.value;
    return !nullish(val) && val.length !== void 0;
  });
  inst._zod.onattach.push((inst2) => {
    const curr = inst2._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
    if (def.minimum > curr)
      inst2._zod.bag.minimum = def.minimum;
  });
  inst._zod.check = (payload) => {
    const input = payload.value;
    const length = input.length;
    if (length >= def.minimum)
      return;
    const origin = getLengthableOrigin(input);
    payload.issues.push({
      origin,
      code: "too_small",
      minimum: def.minimum,
      inclusive: true,
      input,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckLengthEquals = /* @__PURE__ */ $constructor("$ZodCheckLengthEquals", (inst, def) => {
  var _a2;
  $ZodCheck.init(inst, def);
  (_a2 = inst._zod.def).when ?? (_a2.when = (payload) => {
    const val = payload.value;
    return !nullish(val) && val.length !== void 0;
  });
  inst._zod.onattach.push((inst2) => {
    const bag = inst2._zod.bag;
    bag.minimum = def.length;
    bag.maximum = def.length;
    bag.length = def.length;
  });
  inst._zod.check = (payload) => {
    const input = payload.value;
    const length = input.length;
    if (length === def.length)
      return;
    const origin = getLengthableOrigin(input);
    const tooBig = length > def.length;
    payload.issues.push({
      origin,
      ...tooBig ? { code: "too_big", maximum: def.length } : { code: "too_small", minimum: def.length },
      inclusive: true,
      exact: true,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckStringFormat = /* @__PURE__ */ $constructor("$ZodCheckStringFormat", (inst, def) => {
  var _a2, _b;
  $ZodCheck.init(inst, def);
  inst._zod.onattach.push((inst2) => {
    const bag = inst2._zod.bag;
    bag.format = def.format;
    if (def.pattern) {
      bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
      bag.patterns.add(def.pattern);
    }
  });
  if (def.pattern)
    (_a2 = inst._zod).check ?? (_a2.check = (payload) => {
      def.pattern.lastIndex = 0;
      if (def.pattern.test(payload.value))
        return;
      payload.issues.push({
        origin: "string",
        code: "invalid_format",
        format: def.format,
        input: payload.value,
        ...def.pattern ? { pattern: def.pattern.toString() } : {},
        inst,
        continue: !def.abort
      });
    });
  else
    (_b = inst._zod).check ?? (_b.check = () => {
    });
});
var $ZodCheckRegex = /* @__PURE__ */ $constructor("$ZodCheckRegex", (inst, def) => {
  $ZodCheckStringFormat.init(inst, def);
  inst._zod.check = (payload) => {
    def.pattern.lastIndex = 0;
    if (def.pattern.test(payload.value))
      return;
    payload.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "regex",
      input: payload.value,
      pattern: def.pattern.toString(),
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckLowerCase = /* @__PURE__ */ $constructor("$ZodCheckLowerCase", (inst, def) => {
  def.pattern ?? (def.pattern = lowercase);
  $ZodCheckStringFormat.init(inst, def);
});
var $ZodCheckUpperCase = /* @__PURE__ */ $constructor("$ZodCheckUpperCase", (inst, def) => {
  def.pattern ?? (def.pattern = uppercase);
  $ZodCheckStringFormat.init(inst, def);
});
var $ZodCheckIncludes = /* @__PURE__ */ $constructor("$ZodCheckIncludes", (inst, def) => {
  $ZodCheck.init(inst, def);
  const escapedRegex = escapeRegex(def.includes);
  const pattern = new RegExp(typeof def.position === "number" ? `^.{${def.position}}${escapedRegex}` : escapedRegex);
  def.pattern = pattern;
  inst._zod.onattach.push((inst2) => {
    const bag = inst2._zod.bag;
    bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
    bag.patterns.add(pattern);
  });
  inst._zod.check = (payload) => {
    if (payload.value.includes(def.includes, def.position))
      return;
    payload.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "includes",
      includes: def.includes,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckStartsWith = /* @__PURE__ */ $constructor("$ZodCheckStartsWith", (inst, def) => {
  $ZodCheck.init(inst, def);
  const pattern = new RegExp(`^${escapeRegex(def.prefix)}.*`);
  def.pattern ?? (def.pattern = pattern);
  inst._zod.onattach.push((inst2) => {
    const bag = inst2._zod.bag;
    bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
    bag.patterns.add(pattern);
  });
  inst._zod.check = (payload) => {
    if (payload.value.startsWith(def.prefix))
      return;
    payload.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "starts_with",
      prefix: def.prefix,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckEndsWith = /* @__PURE__ */ $constructor("$ZodCheckEndsWith", (inst, def) => {
  $ZodCheck.init(inst, def);
  const pattern = new RegExp(`.*${escapeRegex(def.suffix)}$`);
  def.pattern ?? (def.pattern = pattern);
  inst._zod.onattach.push((inst2) => {
    const bag = inst2._zod.bag;
    bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
    bag.patterns.add(pattern);
  });
  inst._zod.check = (payload) => {
    if (payload.value.endsWith(def.suffix))
      return;
    payload.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "ends_with",
      suffix: def.suffix,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckOverwrite = /* @__PURE__ */ $constructor("$ZodCheckOverwrite", (inst, def) => {
  $ZodCheck.init(inst, def);
  inst._zod.check = (payload) => {
    payload.value = def.tx(payload.value);
  };
});

// node_modules/zod/v4/core/versions.js
var version = {
  major: 4,
  minor: 2,
  patch: 1
};

// node_modules/zod/v4/core/schemas.js
var $ZodType = /* @__PURE__ */ $constructor("$ZodType", (inst, def) => {
  var _a2;
  inst ?? (inst = {});
  inst._zod.def = def;
  inst._zod.bag = inst._zod.bag || {};
  inst._zod.version = version;
  const checks = [...inst._zod.def.checks ?? []];
  if (inst._zod.traits.has("$ZodCheck")) {
    checks.unshift(inst);
  }
  for (const ch of checks) {
    for (const fn of ch._zod.onattach) {
      fn(inst);
    }
  }
  if (checks.length === 0) {
    (_a2 = inst._zod).deferred ?? (_a2.deferred = []);
    inst._zod.deferred?.push(() => {
      inst._zod.run = inst._zod.parse;
    });
  } else {
    const runChecks = (payload, checks2, ctx) => {
      let isAborted = aborted(payload);
      let asyncResult;
      for (const ch of checks2) {
        if (ch._zod.def.when) {
          const shouldRun = ch._zod.def.when(payload);
          if (!shouldRun)
            continue;
        } else if (isAborted) {
          continue;
        }
        const currLen = payload.issues.length;
        const _ = ch._zod.check(payload);
        if (_ instanceof Promise && ctx?.async === false) {
          throw new $ZodAsyncError();
        }
        if (asyncResult || _ instanceof Promise) {
          asyncResult = (asyncResult ?? Promise.resolve()).then(async () => {
            await _;
            const nextLen = payload.issues.length;
            if (nextLen === currLen)
              return;
            if (!isAborted)
              isAborted = aborted(payload, currLen);
          });
        } else {
          const nextLen = payload.issues.length;
          if (nextLen === currLen)
            continue;
          if (!isAborted)
            isAborted = aborted(payload, currLen);
        }
      }
      if (asyncResult) {
        return asyncResult.then(() => {
          return payload;
        });
      }
      return payload;
    };
    const handleCanaryResult = (canary, payload, ctx) => {
      if (aborted(canary)) {
        canary.aborted = true;
        return canary;
      }
      const checkResult = runChecks(payload, checks, ctx);
      if (checkResult instanceof Promise) {
        if (ctx.async === false)
          throw new $ZodAsyncError();
        return checkResult.then((checkResult2) => inst._zod.parse(checkResult2, ctx));
      }
      return inst._zod.parse(checkResult, ctx);
    };
    inst._zod.run = (payload, ctx) => {
      if (ctx.skipChecks) {
        return inst._zod.parse(payload, ctx);
      }
      if (ctx.direction === "backward") {
        const canary = inst._zod.parse({ value: payload.value, issues: [] }, { ...ctx, skipChecks: true });
        if (canary instanceof Promise) {
          return canary.then((canary2) => {
            return handleCanaryResult(canary2, payload, ctx);
          });
        }
        return handleCanaryResult(canary, payload, ctx);
      }
      const result = inst._zod.parse(payload, ctx);
      if (result instanceof Promise) {
        if (ctx.async === false)
          throw new $ZodAsyncError();
        return result.then((result2) => runChecks(result2, checks, ctx));
      }
      return runChecks(result, checks, ctx);
    };
  }
  inst["~standard"] = {
    validate: (value) => {
      try {
        const r = safeParse2(inst, value);
        return r.success ? { value: r.data } : { issues: r.error?.issues };
      } catch (_) {
        return safeParseAsync(inst, value).then((r) => r.success ? { value: r.data } : { issues: r.error?.issues });
      }
    },
    vendor: "zod",
    version: 1
  };
});
var $ZodString = /* @__PURE__ */ $constructor("$ZodString", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.pattern = [...inst?._zod.bag?.patterns ?? []].pop() ?? string2(inst._zod.bag);
  inst._zod.parse = (payload, _) => {
    if (def.coerce)
      try {
        payload.value = String(payload.value);
      } catch (_2) {
      }
    if (typeof payload.value === "string")
      return payload;
    payload.issues.push({
      expected: "string",
      code: "invalid_type",
      input: payload.value,
      inst
    });
    return payload;
  };
});
var $ZodStringFormat = /* @__PURE__ */ $constructor("$ZodStringFormat", (inst, def) => {
  $ZodCheckStringFormat.init(inst, def);
  $ZodString.init(inst, def);
});
var $ZodGUID = /* @__PURE__ */ $constructor("$ZodGUID", (inst, def) => {
  def.pattern ?? (def.pattern = guid);
  $ZodStringFormat.init(inst, def);
});
var $ZodUUID = /* @__PURE__ */ $constructor("$ZodUUID", (inst, def) => {
  if (def.version) {
    const versionMap = {
      v1: 1,
      v2: 2,
      v3: 3,
      v4: 4,
      v5: 5,
      v6: 6,
      v7: 7,
      v8: 8
    };
    const v = versionMap[def.version];
    if (v === void 0)
      throw new Error(`Invalid UUID version: "${def.version}"`);
    def.pattern ?? (def.pattern = uuid2(v));
  } else
    def.pattern ?? (def.pattern = uuid2());
  $ZodStringFormat.init(inst, def);
});
var $ZodEmail = /* @__PURE__ */ $constructor("$ZodEmail", (inst, def) => {
  def.pattern ?? (def.pattern = email2);
  $ZodStringFormat.init(inst, def);
});
var $ZodURL = /* @__PURE__ */ $constructor("$ZodURL", (inst, def) => {
  $ZodStringFormat.init(inst, def);
  inst._zod.check = (payload) => {
    try {
      const trimmed = payload.value.trim();
      const url2 = new URL(trimmed);
      if (def.hostname) {
        def.hostname.lastIndex = 0;
        if (!def.hostname.test(url2.hostname)) {
          payload.issues.push({
            code: "invalid_format",
            format: "url",
            note: "Invalid hostname",
            pattern: def.hostname.source,
            input: payload.value,
            inst,
            continue: !def.abort
          });
        }
      }
      if (def.protocol) {
        def.protocol.lastIndex = 0;
        if (!def.protocol.test(url2.protocol.endsWith(":") ? url2.protocol.slice(0, -1) : url2.protocol)) {
          payload.issues.push({
            code: "invalid_format",
            format: "url",
            note: "Invalid protocol",
            pattern: def.protocol.source,
            input: payload.value,
            inst,
            continue: !def.abort
          });
        }
      }
      if (def.normalize) {
        payload.value = url2.href;
      } else {
        payload.value = trimmed;
      }
      return;
    } catch (_) {
      payload.issues.push({
        code: "invalid_format",
        format: "url",
        input: payload.value,
        inst,
        continue: !def.abort
      });
    }
  };
});
var $ZodEmoji = /* @__PURE__ */ $constructor("$ZodEmoji", (inst, def) => {
  def.pattern ?? (def.pattern = emoji2());
  $ZodStringFormat.init(inst, def);
});
var $ZodNanoID = /* @__PURE__ */ $constructor("$ZodNanoID", (inst, def) => {
  def.pattern ?? (def.pattern = nanoid2);
  $ZodStringFormat.init(inst, def);
});
var $ZodCUID = /* @__PURE__ */ $constructor("$ZodCUID", (inst, def) => {
  def.pattern ?? (def.pattern = cuid);
  $ZodStringFormat.init(inst, def);
});
var $ZodCUID2 = /* @__PURE__ */ $constructor("$ZodCUID2", (inst, def) => {
  def.pattern ?? (def.pattern = cuid22);
  $ZodStringFormat.init(inst, def);
});
var $ZodULID = /* @__PURE__ */ $constructor("$ZodULID", (inst, def) => {
  def.pattern ?? (def.pattern = ulid2);
  $ZodStringFormat.init(inst, def);
});
var $ZodXID = /* @__PURE__ */ $constructor("$ZodXID", (inst, def) => {
  def.pattern ?? (def.pattern = xid);
  $ZodStringFormat.init(inst, def);
});
var $ZodKSUID = /* @__PURE__ */ $constructor("$ZodKSUID", (inst, def) => {
  def.pattern ?? (def.pattern = ksuid);
  $ZodStringFormat.init(inst, def);
});
var $ZodISODateTime = /* @__PURE__ */ $constructor("$ZodISODateTime", (inst, def) => {
  def.pattern ?? (def.pattern = datetime(def));
  $ZodStringFormat.init(inst, def);
});
var $ZodISODate = /* @__PURE__ */ $constructor("$ZodISODate", (inst, def) => {
  def.pattern ?? (def.pattern = date);
  $ZodStringFormat.init(inst, def);
});
var $ZodISOTime = /* @__PURE__ */ $constructor("$ZodISOTime", (inst, def) => {
  def.pattern ?? (def.pattern = time(def));
  $ZodStringFormat.init(inst, def);
});
var $ZodISODuration = /* @__PURE__ */ $constructor("$ZodISODuration", (inst, def) => {
  def.pattern ?? (def.pattern = duration);
  $ZodStringFormat.init(inst, def);
});
var $ZodIPv4 = /* @__PURE__ */ $constructor("$ZodIPv4", (inst, def) => {
  def.pattern ?? (def.pattern = ipv42);
  $ZodStringFormat.init(inst, def);
  inst._zod.bag.format = `ipv4`;
});
var $ZodIPv6 = /* @__PURE__ */ $constructor("$ZodIPv6", (inst, def) => {
  def.pattern ?? (def.pattern = ipv62);
  $ZodStringFormat.init(inst, def);
  inst._zod.bag.format = `ipv6`;
  inst._zod.check = (payload) => {
    try {
      new URL(`http://[${payload.value}]`);
    } catch {
      payload.issues.push({
        code: "invalid_format",
        format: "ipv6",
        input: payload.value,
        inst,
        continue: !def.abort
      });
    }
  };
});
var $ZodCIDRv4 = /* @__PURE__ */ $constructor("$ZodCIDRv4", (inst, def) => {
  def.pattern ?? (def.pattern = cidrv4);
  $ZodStringFormat.init(inst, def);
});
var $ZodCIDRv6 = /* @__PURE__ */ $constructor("$ZodCIDRv6", (inst, def) => {
  def.pattern ?? (def.pattern = cidrv6);
  $ZodStringFormat.init(inst, def);
  inst._zod.check = (payload) => {
    const parts = payload.value.split("/");
    try {
      if (parts.length !== 2)
        throw new Error();
      const [address, prefix] = parts;
      if (!prefix)
        throw new Error();
      const prefixNum = Number(prefix);
      if (`${prefixNum}` !== prefix)
        throw new Error();
      if (prefixNum < 0 || prefixNum > 128)
        throw new Error();
      new URL(`http://[${address}]`);
    } catch {
      payload.issues.push({
        code: "invalid_format",
        format: "cidrv6",
        input: payload.value,
        inst,
        continue: !def.abort
      });
    }
  };
});
function isValidBase64(data) {
  if (data === "")
    return true;
  if (data.length % 4 !== 0)
    return false;
  try {
    atob(data);
    return true;
  } catch {
    return false;
  }
}
var $ZodBase64 = /* @__PURE__ */ $constructor("$ZodBase64", (inst, def) => {
  def.pattern ?? (def.pattern = base642);
  $ZodStringFormat.init(inst, def);
  inst._zod.bag.contentEncoding = "base64";
  inst._zod.check = (payload) => {
    if (isValidBase64(payload.value))
      return;
    payload.issues.push({
      code: "invalid_format",
      format: "base64",
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
function isValidBase64URL(data) {
  if (!base64url.test(data))
    return false;
  const base643 = data.replace(/[-_]/g, (c) => c === "-" ? "+" : "/");
  const padded = base643.padEnd(Math.ceil(base643.length / 4) * 4, "=");
  return isValidBase64(padded);
}
var $ZodBase64URL = /* @__PURE__ */ $constructor("$ZodBase64URL", (inst, def) => {
  def.pattern ?? (def.pattern = base64url);
  $ZodStringFormat.init(inst, def);
  inst._zod.bag.contentEncoding = "base64url";
  inst._zod.check = (payload) => {
    if (isValidBase64URL(payload.value))
      return;
    payload.issues.push({
      code: "invalid_format",
      format: "base64url",
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodE164 = /* @__PURE__ */ $constructor("$ZodE164", (inst, def) => {
  def.pattern ?? (def.pattern = e164);
  $ZodStringFormat.init(inst, def);
});
function isValidJWT(token, algorithm = null) {
  try {
    const tokensParts = token.split(".");
    if (tokensParts.length !== 3)
      return false;
    const [header] = tokensParts;
    if (!header)
      return false;
    const parsedHeader = JSON.parse(atob(header));
    if ("typ" in parsedHeader && parsedHeader?.typ !== "JWT")
      return false;
    if (!parsedHeader.alg)
      return false;
    if (algorithm && (!("alg" in parsedHeader) || parsedHeader.alg !== algorithm))
      return false;
    return true;
  } catch {
    return false;
  }
}
var $ZodJWT = /* @__PURE__ */ $constructor("$ZodJWT", (inst, def) => {
  $ZodStringFormat.init(inst, def);
  inst._zod.check = (payload) => {
    if (isValidJWT(payload.value, def.alg))
      return;
    payload.issues.push({
      code: "invalid_format",
      format: "jwt",
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
function handleArrayResult(result, final, index) {
  if (result.issues.length) {
    final.issues.push(...prefixIssues(index, result.issues));
  }
  final.value[index] = result.value;
}
var $ZodArray = /* @__PURE__ */ $constructor("$ZodArray", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, ctx) => {
    const input = payload.value;
    if (!Array.isArray(input)) {
      payload.issues.push({
        expected: "array",
        code: "invalid_type",
        input,
        inst
      });
      return payload;
    }
    payload.value = Array(input.length);
    const proms = [];
    for (let i = 0; i < input.length; i++) {
      const item = input[i];
      const result = def.element._zod.run({
        value: item,
        issues: []
      }, ctx);
      if (result instanceof Promise) {
        proms.push(result.then((result2) => handleArrayResult(result2, payload, i)));
      } else {
        handleArrayResult(result, payload, i);
      }
    }
    if (proms.length) {
      return Promise.all(proms).then(() => payload);
    }
    return payload;
  };
});
function handleUnionResults(results, final, inst, ctx) {
  for (const result of results) {
    if (result.issues.length === 0) {
      final.value = result.value;
      return final;
    }
  }
  const nonaborted = results.filter((r) => !aborted(r));
  if (nonaborted.length === 1) {
    final.value = nonaborted[0].value;
    return nonaborted[0];
  }
  final.issues.push({
    code: "invalid_union",
    input: final.value,
    inst,
    errors: results.map((result) => result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
  });
  return final;
}
var $ZodUnion = /* @__PURE__ */ $constructor("$ZodUnion", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazy(inst._zod, "optin", () => def.options.some((o) => o._zod.optin === "optional") ? "optional" : void 0);
  defineLazy(inst._zod, "optout", () => def.options.some((o) => o._zod.optout === "optional") ? "optional" : void 0);
  defineLazy(inst._zod, "values", () => {
    if (def.options.every((o) => o._zod.values)) {
      return new Set(def.options.flatMap((option) => Array.from(option._zod.values)));
    }
    return void 0;
  });
  defineLazy(inst._zod, "pattern", () => {
    if (def.options.every((o) => o._zod.pattern)) {
      const patterns = def.options.map((o) => o._zod.pattern);
      return new RegExp(`^(${patterns.map((p) => cleanRegex(p.source)).join("|")})$`);
    }
    return void 0;
  });
  const single = def.options.length === 1;
  const first = def.options[0]._zod.run;
  inst._zod.parse = (payload, ctx) => {
    if (single) {
      return first(payload, ctx);
    }
    let async = false;
    const results = [];
    for (const option of def.options) {
      const result = option._zod.run({
        value: payload.value,
        issues: []
      }, ctx);
      if (result instanceof Promise) {
        results.push(result);
        async = true;
      } else {
        if (result.issues.length === 0)
          return result;
        results.push(result);
      }
    }
    if (!async)
      return handleUnionResults(results, payload, inst, ctx);
    return Promise.all(results).then((results2) => {
      return handleUnionResults(results2, payload, inst, ctx);
    });
  };
});
var $ZodIntersection = /* @__PURE__ */ $constructor("$ZodIntersection", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, ctx) => {
    const input = payload.value;
    const left = def.left._zod.run({ value: input, issues: [] }, ctx);
    const right = def.right._zod.run({ value: input, issues: [] }, ctx);
    const async = left instanceof Promise || right instanceof Promise;
    if (async) {
      return Promise.all([left, right]).then(([left2, right2]) => {
        return handleIntersectionResults(payload, left2, right2);
      });
    }
    return handleIntersectionResults(payload, left, right);
  };
});
function mergeValues(a, b) {
  if (a === b) {
    return { valid: true, data: a };
  }
  if (a instanceof Date && b instanceof Date && +a === +b) {
    return { valid: true, data: a };
  }
  if (isPlainObject(a) && isPlainObject(b)) {
    const bKeys = Object.keys(b);
    const sharedKeys = Object.keys(a).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a, ...b };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return {
          valid: false,
          mergeErrorPath: [key, ...sharedValue.mergeErrorPath]
        };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return { valid: false, mergeErrorPath: [] };
    }
    const newArray = [];
    for (let index = 0; index < a.length; index++) {
      const itemA = a[index];
      const itemB = b[index];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return {
          valid: false,
          mergeErrorPath: [index, ...sharedValue.mergeErrorPath]
        };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  }
  return { valid: false, mergeErrorPath: [] };
}
function handleIntersectionResults(result, left, right) {
  if (left.issues.length) {
    result.issues.push(...left.issues);
  }
  if (right.issues.length) {
    result.issues.push(...right.issues);
  }
  if (aborted(result))
    return result;
  const merged = mergeValues(left.value, right.value);
  if (!merged.valid) {
    throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(merged.mergeErrorPath)}`);
  }
  result.value = merged.data;
  return result;
}
var $ZodTransform = /* @__PURE__ */ $constructor("$ZodTransform", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      throw new $ZodEncodeError(inst.constructor.name);
    }
    const _out = def.transform(payload.value, payload);
    if (ctx.async) {
      const output = _out instanceof Promise ? _out : Promise.resolve(_out);
      return output.then((output2) => {
        payload.value = output2;
        return payload;
      });
    }
    if (_out instanceof Promise) {
      throw new $ZodAsyncError();
    }
    payload.value = _out;
    return payload;
  };
});
function handleOptionalResult(result, input) {
  if (result.issues.length && input === void 0) {
    return { issues: [], value: void 0 };
  }
  return result;
}
var $ZodOptional = /* @__PURE__ */ $constructor("$ZodOptional", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.optin = "optional";
  inst._zod.optout = "optional";
  defineLazy(inst._zod, "values", () => {
    return def.innerType._zod.values ? /* @__PURE__ */ new Set([...def.innerType._zod.values, void 0]) : void 0;
  });
  defineLazy(inst._zod, "pattern", () => {
    const pattern = def.innerType._zod.pattern;
    return pattern ? new RegExp(`^(${cleanRegex(pattern.source)})?$`) : void 0;
  });
  inst._zod.parse = (payload, ctx) => {
    if (def.innerType._zod.optin === "optional") {
      const result = def.innerType._zod.run(payload, ctx);
      if (result instanceof Promise)
        return result.then((r) => handleOptionalResult(r, payload.value));
      return handleOptionalResult(result, payload.value);
    }
    if (payload.value === void 0) {
      return payload;
    }
    return def.innerType._zod.run(payload, ctx);
  };
});
var $ZodNullable = /* @__PURE__ */ $constructor("$ZodNullable", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazy(inst._zod, "optin", () => def.innerType._zod.optin);
  defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
  defineLazy(inst._zod, "pattern", () => {
    const pattern = def.innerType._zod.pattern;
    return pattern ? new RegExp(`^(${cleanRegex(pattern.source)}|null)$`) : void 0;
  });
  defineLazy(inst._zod, "values", () => {
    return def.innerType._zod.values ? /* @__PURE__ */ new Set([...def.innerType._zod.values, null]) : void 0;
  });
  inst._zod.parse = (payload, ctx) => {
    if (payload.value === null)
      return payload;
    return def.innerType._zod.run(payload, ctx);
  };
});
var $ZodDefault = /* @__PURE__ */ $constructor("$ZodDefault", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.optin = "optional";
  defineLazy(inst._zod, "values", () => def.innerType._zod.values);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      return def.innerType._zod.run(payload, ctx);
    }
    if (payload.value === void 0) {
      payload.value = def.defaultValue;
      return payload;
    }
    const result = def.innerType._zod.run(payload, ctx);
    if (result instanceof Promise) {
      return result.then((result2) => handleDefaultResult(result2, def));
    }
    return handleDefaultResult(result, def);
  };
});
function handleDefaultResult(payload, def) {
  if (payload.value === void 0) {
    payload.value = def.defaultValue;
  }
  return payload;
}
var $ZodPrefault = /* @__PURE__ */ $constructor("$ZodPrefault", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.optin = "optional";
  defineLazy(inst._zod, "values", () => def.innerType._zod.values);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      return def.innerType._zod.run(payload, ctx);
    }
    if (payload.value === void 0) {
      payload.value = def.defaultValue;
    }
    return def.innerType._zod.run(payload, ctx);
  };
});
var $ZodNonOptional = /* @__PURE__ */ $constructor("$ZodNonOptional", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazy(inst._zod, "values", () => {
    const v = def.innerType._zod.values;
    return v ? new Set([...v].filter((x) => x !== void 0)) : void 0;
  });
  inst._zod.parse = (payload, ctx) => {
    const result = def.innerType._zod.run(payload, ctx);
    if (result instanceof Promise) {
      return result.then((result2) => handleNonOptionalResult(result2, inst));
    }
    return handleNonOptionalResult(result, inst);
  };
});
function handleNonOptionalResult(payload, inst) {
  if (!payload.issues.length && payload.value === void 0) {
    payload.issues.push({
      code: "invalid_type",
      expected: "nonoptional",
      input: payload.value,
      inst
    });
  }
  return payload;
}
var $ZodCatch = /* @__PURE__ */ $constructor("$ZodCatch", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazy(inst._zod, "optin", () => def.innerType._zod.optin);
  defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
  defineLazy(inst._zod, "values", () => def.innerType._zod.values);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      return def.innerType._zod.run(payload, ctx);
    }
    const result = def.innerType._zod.run(payload, ctx);
    if (result instanceof Promise) {
      return result.then((result2) => {
        payload.value = result2.value;
        if (result2.issues.length) {
          payload.value = def.catchValue({
            ...payload,
            error: {
              issues: result2.issues.map((iss) => finalizeIssue(iss, ctx, config()))
            },
            input: payload.value
          });
          payload.issues = [];
        }
        return payload;
      });
    }
    payload.value = result.value;
    if (result.issues.length) {
      payload.value = def.catchValue({
        ...payload,
        error: {
          issues: result.issues.map((iss) => finalizeIssue(iss, ctx, config()))
        },
        input: payload.value
      });
      payload.issues = [];
    }
    return payload;
  };
});
var $ZodPipe = /* @__PURE__ */ $constructor("$ZodPipe", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazy(inst._zod, "values", () => def.in._zod.values);
  defineLazy(inst._zod, "optin", () => def.in._zod.optin);
  defineLazy(inst._zod, "optout", () => def.out._zod.optout);
  defineLazy(inst._zod, "propValues", () => def.in._zod.propValues);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      const right = def.out._zod.run(payload, ctx);
      if (right instanceof Promise) {
        return right.then((right2) => handlePipeResult(right2, def.in, ctx));
      }
      return handlePipeResult(right, def.in, ctx);
    }
    const left = def.in._zod.run(payload, ctx);
    if (left instanceof Promise) {
      return left.then((left2) => handlePipeResult(left2, def.out, ctx));
    }
    return handlePipeResult(left, def.out, ctx);
  };
});
function handlePipeResult(left, next, ctx) {
  if (left.issues.length) {
    left.aborted = true;
    return left;
  }
  return next._zod.run({ value: left.value, issues: left.issues }, ctx);
}
var $ZodReadonly = /* @__PURE__ */ $constructor("$ZodReadonly", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazy(inst._zod, "propValues", () => def.innerType._zod.propValues);
  defineLazy(inst._zod, "values", () => def.innerType._zod.values);
  defineLazy(inst._zod, "optin", () => def.innerType?._zod?.optin);
  defineLazy(inst._zod, "optout", () => def.innerType?._zod?.optout);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      return def.innerType._zod.run(payload, ctx);
    }
    const result = def.innerType._zod.run(payload, ctx);
    if (result instanceof Promise) {
      return result.then(handleReadonlyResult);
    }
    return handleReadonlyResult(result);
  };
});
function handleReadonlyResult(payload) {
  payload.value = Object.freeze(payload.value);
  return payload;
}
var $ZodCustom = /* @__PURE__ */ $constructor("$ZodCustom", (inst, def) => {
  $ZodCheck.init(inst, def);
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, _) => {
    return payload;
  };
  inst._zod.check = (payload) => {
    const input = payload.value;
    const r = def.fn(input);
    if (r instanceof Promise) {
      return r.then((r2) => handleRefineResult(r2, payload, input, inst));
    }
    handleRefineResult(r, payload, input, inst);
    return;
  };
});
function handleRefineResult(result, payload, input, inst) {
  if (!result) {
    const _iss = {
      code: "custom",
      input,
      inst,
      // incorporates params.error into issue reporting
      path: [...inst._zod.def.path ?? []],
      // incorporates params.error into issue reporting
      continue: !inst._zod.def.abort
      // params: inst._zod.def.params,
    };
    if (inst._zod.def.params)
      _iss.params = inst._zod.def.params;
    payload.issues.push(issue(_iss));
  }
}

// node_modules/zod/v4/core/registries.js
var _a;
var $ZodRegistry = class {
  constructor() {
    this._map = /* @__PURE__ */ new WeakMap();
    this._idmap = /* @__PURE__ */ new Map();
  }
  add(schema, ..._meta) {
    const meta2 = _meta[0];
    this._map.set(schema, meta2);
    if (meta2 && typeof meta2 === "object" && "id" in meta2) {
      if (this._idmap.has(meta2.id)) {
        throw new Error(`ID ${meta2.id} already exists in the registry`);
      }
      this._idmap.set(meta2.id, schema);
    }
    return this;
  }
  clear() {
    this._map = /* @__PURE__ */ new WeakMap();
    this._idmap = /* @__PURE__ */ new Map();
    return this;
  }
  remove(schema) {
    const meta2 = this._map.get(schema);
    if (meta2 && typeof meta2 === "object" && "id" in meta2) {
      this._idmap.delete(meta2.id);
    }
    this._map.delete(schema);
    return this;
  }
  get(schema) {
    const p = schema._zod.parent;
    if (p) {
      const pm = { ...this.get(p) ?? {} };
      delete pm.id;
      const f = { ...pm, ...this._map.get(schema) };
      return Object.keys(f).length ? f : void 0;
    }
    return this._map.get(schema);
  }
  has(schema) {
    return this._map.has(schema);
  }
};
function registry() {
  return new $ZodRegistry();
}
(_a = globalThis).__zod_globalRegistry ?? (_a.__zod_globalRegistry = registry());
var globalRegistry = globalThis.__zod_globalRegistry;

// node_modules/zod/v4/core/api.js
function _string(Class2, params) {
  return new Class2({
    type: "string",
    ...normalizeParams(params)
  });
}
function _email(Class2, params) {
  return new Class2({
    type: "string",
    format: "email",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _guid(Class2, params) {
  return new Class2({
    type: "string",
    format: "guid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _uuid(Class2, params) {
  return new Class2({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _uuidv4(Class2, params) {
  return new Class2({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    version: "v4",
    ...normalizeParams(params)
  });
}
function _uuidv6(Class2, params) {
  return new Class2({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    version: "v6",
    ...normalizeParams(params)
  });
}
function _uuidv7(Class2, params) {
  return new Class2({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    version: "v7",
    ...normalizeParams(params)
  });
}
function _url(Class2, params) {
  return new Class2({
    type: "string",
    format: "url",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _emoji2(Class2, params) {
  return new Class2({
    type: "string",
    format: "emoji",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _nanoid(Class2, params) {
  return new Class2({
    type: "string",
    format: "nanoid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _cuid(Class2, params) {
  return new Class2({
    type: "string",
    format: "cuid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _cuid2(Class2, params) {
  return new Class2({
    type: "string",
    format: "cuid2",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _ulid(Class2, params) {
  return new Class2({
    type: "string",
    format: "ulid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _xid(Class2, params) {
  return new Class2({
    type: "string",
    format: "xid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _ksuid(Class2, params) {
  return new Class2({
    type: "string",
    format: "ksuid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _ipv4(Class2, params) {
  return new Class2({
    type: "string",
    format: "ipv4",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _ipv6(Class2, params) {
  return new Class2({
    type: "string",
    format: "ipv6",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _cidrv4(Class2, params) {
  return new Class2({
    type: "string",
    format: "cidrv4",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _cidrv6(Class2, params) {
  return new Class2({
    type: "string",
    format: "cidrv6",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _base64(Class2, params) {
  return new Class2({
    type: "string",
    format: "base64",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _base64url(Class2, params) {
  return new Class2({
    type: "string",
    format: "base64url",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _e164(Class2, params) {
  return new Class2({
    type: "string",
    format: "e164",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _jwt(Class2, params) {
  return new Class2({
    type: "string",
    format: "jwt",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _isoDateTime(Class2, params) {
  return new Class2({
    type: "string",
    format: "datetime",
    check: "string_format",
    offset: false,
    local: false,
    precision: null,
    ...normalizeParams(params)
  });
}
function _isoDate(Class2, params) {
  return new Class2({
    type: "string",
    format: "date",
    check: "string_format",
    ...normalizeParams(params)
  });
}
function _isoTime(Class2, params) {
  return new Class2({
    type: "string",
    format: "time",
    check: "string_format",
    precision: null,
    ...normalizeParams(params)
  });
}
function _isoDuration(Class2, params) {
  return new Class2({
    type: "string",
    format: "duration",
    check: "string_format",
    ...normalizeParams(params)
  });
}
function _maxLength(maximum, params) {
  const ch = new $ZodCheckMaxLength({
    check: "max_length",
    ...normalizeParams(params),
    maximum
  });
  return ch;
}
function _minLength(minimum, params) {
  return new $ZodCheckMinLength({
    check: "min_length",
    ...normalizeParams(params),
    minimum
  });
}
function _length(length, params) {
  return new $ZodCheckLengthEquals({
    check: "length_equals",
    ...normalizeParams(params),
    length
  });
}
function _regex(pattern, params) {
  return new $ZodCheckRegex({
    check: "string_format",
    format: "regex",
    ...normalizeParams(params),
    pattern
  });
}
function _lowercase(params) {
  return new $ZodCheckLowerCase({
    check: "string_format",
    format: "lowercase",
    ...normalizeParams(params)
  });
}
function _uppercase(params) {
  return new $ZodCheckUpperCase({
    check: "string_format",
    format: "uppercase",
    ...normalizeParams(params)
  });
}
function _includes(includes, params) {
  return new $ZodCheckIncludes({
    check: "string_format",
    format: "includes",
    ...normalizeParams(params),
    includes
  });
}
function _startsWith(prefix, params) {
  return new $ZodCheckStartsWith({
    check: "string_format",
    format: "starts_with",
    ...normalizeParams(params),
    prefix
  });
}
function _endsWith(suffix, params) {
  return new $ZodCheckEndsWith({
    check: "string_format",
    format: "ends_with",
    ...normalizeParams(params),
    suffix
  });
}
function _overwrite(tx) {
  return new $ZodCheckOverwrite({
    check: "overwrite",
    tx
  });
}
function _normalize(form) {
  return _overwrite((input) => input.normalize(form));
}
function _trim() {
  return _overwrite((input) => input.trim());
}
function _toLowerCase() {
  return _overwrite((input) => input.toLowerCase());
}
function _toUpperCase() {
  return _overwrite((input) => input.toUpperCase());
}
function _slugify() {
  return _overwrite((input) => slugify(input));
}
function _array(Class2, element, params) {
  return new Class2({
    type: "array",
    element,
    // get element() {
    //   return element;
    // },
    ...normalizeParams(params)
  });
}
function _refine(Class2, fn, _params) {
  const schema = new Class2({
    type: "custom",
    check: "custom",
    fn,
    ...normalizeParams(_params)
  });
  return schema;
}
function _superRefine(fn) {
  const ch = _check((payload) => {
    payload.addIssue = (issue2) => {
      if (typeof issue2 === "string") {
        payload.issues.push(issue(issue2, payload.value, ch._zod.def));
      } else {
        const _issue = issue2;
        if (_issue.fatal)
          _issue.continue = false;
        _issue.code ?? (_issue.code = "custom");
        _issue.input ?? (_issue.input = payload.value);
        _issue.inst ?? (_issue.inst = ch);
        _issue.continue ?? (_issue.continue = !ch._zod.def.abort);
        payload.issues.push(issue(_issue));
      }
    };
    return fn(payload.value, payload);
  });
  return ch;
}
function _check(fn, params) {
  const ch = new $ZodCheck({
    check: "custom",
    ...normalizeParams(params)
  });
  ch._zod.check = fn;
  return ch;
}

// node_modules/zod/v4/core/to-json-schema.js
function initializeContext(params) {
  let target = params?.target ?? "draft-2020-12";
  if (target === "draft-4")
    target = "draft-04";
  if (target === "draft-7")
    target = "draft-07";
  return {
    processors: params.processors ?? {},
    metadataRegistry: params?.metadata ?? globalRegistry,
    target,
    unrepresentable: params?.unrepresentable ?? "throw",
    override: params?.override ?? (() => {
    }),
    io: params?.io ?? "output",
    counter: 0,
    seen: /* @__PURE__ */ new Map(),
    cycles: params?.cycles ?? "ref",
    reused: params?.reused ?? "inline",
    external: params?.external ?? void 0
  };
}
function process2(schema, ctx, _params = { path: [], schemaPath: [] }) {
  var _a2;
  const def = schema._zod.def;
  const seen = ctx.seen.get(schema);
  if (seen) {
    seen.count++;
    const isCycle = _params.schemaPath.includes(schema);
    if (isCycle) {
      seen.cycle = _params.path;
    }
    return seen.schema;
  }
  const result = { schema: {}, count: 1, cycle: void 0, path: _params.path };
  ctx.seen.set(schema, result);
  const overrideSchema = schema._zod.toJSONSchema?.();
  if (overrideSchema) {
    result.schema = overrideSchema;
  } else {
    const params = {
      ..._params,
      schemaPath: [..._params.schemaPath, schema],
      path: _params.path
    };
    const parent = schema._zod.parent;
    if (parent) {
      result.ref = parent;
      process2(parent, ctx, params);
      ctx.seen.get(parent).isParent = true;
    } else if (schema._zod.processJSONSchema) {
      schema._zod.processJSONSchema(ctx, result.schema, params);
    } else {
      const _json = result.schema;
      const processor = ctx.processors[def.type];
      if (!processor) {
        throw new Error(`[toJSONSchema]: Non-representable type encountered: ${def.type}`);
      }
      processor(schema, ctx, _json, params);
    }
  }
  const meta2 = ctx.metadataRegistry.get(schema);
  if (meta2)
    Object.assign(result.schema, meta2);
  if (ctx.io === "input" && isTransforming(schema)) {
    delete result.schema.examples;
    delete result.schema.default;
  }
  if (ctx.io === "input" && result.schema._prefault)
    (_a2 = result.schema).default ?? (_a2.default = result.schema._prefault);
  delete result.schema._prefault;
  const _result = ctx.seen.get(schema);
  return _result.schema;
}
function extractDefs(ctx, schema) {
  const root = ctx.seen.get(schema);
  if (!root)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  const makeURI = (entry) => {
    const defsSegment = ctx.target === "draft-2020-12" ? "$defs" : "definitions";
    if (ctx.external) {
      const externalId = ctx.external.registry.get(entry[0])?.id;
      const uriGenerator = ctx.external.uri ?? ((id2) => id2);
      if (externalId) {
        return { ref: uriGenerator(externalId) };
      }
      const id = entry[1].defId ?? entry[1].schema.id ?? `schema${ctx.counter++}`;
      entry[1].defId = id;
      return { defId: id, ref: `${uriGenerator("__shared")}#/${defsSegment}/${id}` };
    }
    if (entry[1] === root) {
      return { ref: "#" };
    }
    const uriPrefix = `#`;
    const defUriPrefix = `${uriPrefix}/${defsSegment}/`;
    const defId = entry[1].schema.id ?? `__schema${ctx.counter++}`;
    return { defId, ref: defUriPrefix + defId };
  };
  const extractToDef = (entry) => {
    if (entry[1].schema.$ref) {
      return;
    }
    const seen = entry[1];
    const { ref, defId } = makeURI(entry);
    seen.def = { ...seen.schema };
    if (defId)
      seen.defId = defId;
    const schema2 = seen.schema;
    for (const key in schema2) {
      delete schema2[key];
    }
    schema2.$ref = ref;
  };
  if (ctx.cycles === "throw") {
    for (const entry of ctx.seen.entries()) {
      const seen = entry[1];
      if (seen.cycle) {
        throw new Error(`Cycle detected: #/${seen.cycle?.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
      }
    }
  }
  for (const entry of ctx.seen.entries()) {
    const seen = entry[1];
    if (schema === entry[0]) {
      extractToDef(entry);
      continue;
    }
    if (ctx.external) {
      const ext = ctx.external.registry.get(entry[0])?.id;
      if (schema !== entry[0] && ext) {
        extractToDef(entry);
        continue;
      }
    }
    const id = ctx.metadataRegistry.get(entry[0])?.id;
    if (id) {
      extractToDef(entry);
      continue;
    }
    if (seen.cycle) {
      extractToDef(entry);
      continue;
    }
    if (seen.count > 1) {
      if (ctx.reused === "ref") {
        extractToDef(entry);
        continue;
      }
    }
  }
}
function finalize(ctx, schema) {
  const root = ctx.seen.get(schema);
  if (!root)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  const flattenRef = (zodSchema) => {
    const seen = ctx.seen.get(zodSchema);
    const schema2 = seen.def ?? seen.schema;
    const _cached = { ...schema2 };
    if (seen.ref === null) {
      return;
    }
    const ref = seen.ref;
    seen.ref = null;
    if (ref) {
      flattenRef(ref);
      const refSchema = ctx.seen.get(ref).schema;
      if (refSchema.$ref && (ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0")) {
        schema2.allOf = schema2.allOf ?? [];
        schema2.allOf.push(refSchema);
      } else {
        Object.assign(schema2, refSchema);
        Object.assign(schema2, _cached);
      }
    }
    if (!seen.isParent)
      ctx.override({
        zodSchema,
        jsonSchema: schema2,
        path: seen.path ?? []
      });
  };
  for (const entry of [...ctx.seen.entries()].reverse()) {
    flattenRef(entry[0]);
  }
  const result = {};
  if (ctx.target === "draft-2020-12") {
    result.$schema = "https://json-schema.org/draft/2020-12/schema";
  } else if (ctx.target === "draft-07") {
    result.$schema = "http://json-schema.org/draft-07/schema#";
  } else if (ctx.target === "draft-04") {
    result.$schema = "http://json-schema.org/draft-04/schema#";
  } else if (ctx.target === "openapi-3.0") ; else ;
  if (ctx.external?.uri) {
    const id = ctx.external.registry.get(schema)?.id;
    if (!id)
      throw new Error("Schema is missing an `id` property");
    result.$id = ctx.external.uri(id);
  }
  Object.assign(result, root.def ?? root.schema);
  const defs = ctx.external?.defs ?? {};
  for (const entry of ctx.seen.entries()) {
    const seen = entry[1];
    if (seen.def && seen.defId) {
      defs[seen.defId] = seen.def;
    }
  }
  if (ctx.external) ; else {
    if (Object.keys(defs).length > 0) {
      if (ctx.target === "draft-2020-12") {
        result.$defs = defs;
      } else {
        result.definitions = defs;
      }
    }
  }
  try {
    const finalized = JSON.parse(JSON.stringify(result));
    Object.defineProperty(finalized, "~standard", {
      value: {
        ...schema["~standard"],
        jsonSchema: {
          input: createStandardJSONSchemaMethod(schema, "input"),
          output: createStandardJSONSchemaMethod(schema, "output")
        }
      },
      enumerable: false,
      writable: false
    });
    return finalized;
  } catch (_err) {
    throw new Error("Error converting schema to JSON.");
  }
}
function isTransforming(_schema, _ctx) {
  const ctx = _ctx ?? { seen: /* @__PURE__ */ new Set() };
  if (ctx.seen.has(_schema))
    return false;
  ctx.seen.add(_schema);
  const def = _schema._zod.def;
  if (def.type === "transform")
    return true;
  if (def.type === "array")
    return isTransforming(def.element, ctx);
  if (def.type === "set")
    return isTransforming(def.valueType, ctx);
  if (def.type === "lazy")
    return isTransforming(def.getter(), ctx);
  if (def.type === "promise" || def.type === "optional" || def.type === "nonoptional" || def.type === "nullable" || def.type === "readonly" || def.type === "default" || def.type === "prefault") {
    return isTransforming(def.innerType, ctx);
  }
  if (def.type === "intersection") {
    return isTransforming(def.left, ctx) || isTransforming(def.right, ctx);
  }
  if (def.type === "record" || def.type === "map") {
    return isTransforming(def.keyType, ctx) || isTransforming(def.valueType, ctx);
  }
  if (def.type === "pipe") {
    return isTransforming(def.in, ctx) || isTransforming(def.out, ctx);
  }
  if (def.type === "object") {
    for (const key in def.shape) {
      if (isTransforming(def.shape[key], ctx))
        return true;
    }
    return false;
  }
  if (def.type === "union") {
    for (const option of def.options) {
      if (isTransforming(option, ctx))
        return true;
    }
    return false;
  }
  if (def.type === "tuple") {
    for (const item of def.items) {
      if (isTransforming(item, ctx))
        return true;
    }
    if (def.rest && isTransforming(def.rest, ctx))
      return true;
    return false;
  }
  return false;
}
var createToJSONSchemaMethod = (schema, processors = {}) => (params) => {
  const ctx = initializeContext({ ...params, processors });
  process2(schema, ctx);
  extractDefs(ctx, schema);
  return finalize(ctx, schema);
};
var createStandardJSONSchemaMethod = (schema, io) => (params) => {
  const { libraryOptions, target } = params ?? {};
  const ctx = initializeContext({ ...libraryOptions ?? {}, target, io, processors: {} });
  process2(schema, ctx);
  extractDefs(ctx, schema);
  return finalize(ctx, schema);
};

// node_modules/zod/v4/core/json-schema-processors.js
var formatMap = {
  guid: "uuid",
  url: "uri",
  datetime: "date-time",
  json_string: "json-string",
  regex: ""
  // do not set
};
var stringProcessor = (schema, ctx, _json, _params) => {
  const json = _json;
  json.type = "string";
  const { minimum, maximum, format, patterns, contentEncoding } = schema._zod.bag;
  if (typeof minimum === "number")
    json.minLength = minimum;
  if (typeof maximum === "number")
    json.maxLength = maximum;
  if (format) {
    json.format = formatMap[format] ?? format;
    if (json.format === "")
      delete json.format;
  }
  if (contentEncoding)
    json.contentEncoding = contentEncoding;
  if (patterns && patterns.size > 0) {
    const regexes = [...patterns];
    if (regexes.length === 1)
      json.pattern = regexes[0].source;
    else if (regexes.length > 1) {
      json.allOf = [
        ...regexes.map((regex) => ({
          ...ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0" ? { type: "string" } : {},
          pattern: regex.source
        }))
      ];
    }
  }
};
var customProcessor = (_schema, ctx, _json, _params) => {
  if (ctx.unrepresentable === "throw") {
    throw new Error("Custom types cannot be represented in JSON Schema");
  }
};
var transformProcessor = (_schema, ctx, _json, _params) => {
  if (ctx.unrepresentable === "throw") {
    throw new Error("Transforms cannot be represented in JSON Schema");
  }
};
var arrayProcessor = (schema, ctx, _json, params) => {
  const json = _json;
  const def = schema._zod.def;
  const { minimum, maximum } = schema._zod.bag;
  if (typeof minimum === "number")
    json.minItems = minimum;
  if (typeof maximum === "number")
    json.maxItems = maximum;
  json.type = "array";
  json.items = process2(def.element, ctx, { ...params, path: [...params.path, "items"] });
};
var unionProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  const isExclusive = def.inclusive === false;
  const options = def.options.map((x, i) => process2(x, ctx, {
    ...params,
    path: [...params.path, isExclusive ? "oneOf" : "anyOf", i]
  }));
  if (isExclusive) {
    json.oneOf = options;
  } else {
    json.anyOf = options;
  }
};
var intersectionProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  const a = process2(def.left, ctx, {
    ...params,
    path: [...params.path, "allOf", 0]
  });
  const b = process2(def.right, ctx, {
    ...params,
    path: [...params.path, "allOf", 1]
  });
  const isSimpleIntersection = (val) => "allOf" in val && Object.keys(val).length === 1;
  const allOf = [
    ...isSimpleIntersection(a) ? a.allOf : [a],
    ...isSimpleIntersection(b) ? b.allOf : [b]
  ];
  json.allOf = allOf;
};
var nullableProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  const inner = process2(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  if (ctx.target === "openapi-3.0") {
    seen.ref = def.innerType;
    json.nullable = true;
  } else {
    json.anyOf = [inner, { type: "null" }];
  }
};
var nonoptionalProcessor = (schema, ctx, _json, params) => {
  const def = schema._zod.def;
  process2(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
};
var defaultProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  process2(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
  json.default = JSON.parse(JSON.stringify(def.defaultValue));
};
var prefaultProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  process2(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
  if (ctx.io === "input")
    json._prefault = JSON.parse(JSON.stringify(def.defaultValue));
};
var catchProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  process2(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
  let catchValue;
  try {
    catchValue = def.catchValue(void 0);
  } catch {
    throw new Error("Dynamic catch values are not supported in JSON Schema");
  }
  json.default = catchValue;
};
var pipeProcessor = (schema, ctx, _json, params) => {
  const def = schema._zod.def;
  const innerType = ctx.io === "input" ? def.in._zod.def.type === "transform" ? def.out : def.in : def.out;
  process2(innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = innerType;
};
var readonlyProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  process2(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
  json.readOnly = true;
};
var optionalProcessor = (schema, ctx, _json, params) => {
  const def = schema._zod.def;
  process2(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
};

// node_modules/zod/v4/classic/iso.js
var ZodISODateTime = /* @__PURE__ */ $constructor("ZodISODateTime", (inst, def) => {
  $ZodISODateTime.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function datetime2(params) {
  return _isoDateTime(ZodISODateTime, params);
}
var ZodISODate = /* @__PURE__ */ $constructor("ZodISODate", (inst, def) => {
  $ZodISODate.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function date2(params) {
  return _isoDate(ZodISODate, params);
}
var ZodISOTime = /* @__PURE__ */ $constructor("ZodISOTime", (inst, def) => {
  $ZodISOTime.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function time2(params) {
  return _isoTime(ZodISOTime, params);
}
var ZodISODuration = /* @__PURE__ */ $constructor("ZodISODuration", (inst, def) => {
  $ZodISODuration.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function duration2(params) {
  return _isoDuration(ZodISODuration, params);
}

// node_modules/zod/v4/classic/errors.js
var initializer2 = (inst, issues) => {
  $ZodError.init(inst, issues);
  inst.name = "ZodError";
  Object.defineProperties(inst, {
    format: {
      value: (mapper) => formatError(inst, mapper)
      // enumerable: false,
    },
    flatten: {
      value: (mapper) => flattenError(inst, mapper)
      // enumerable: false,
    },
    addIssue: {
      value: (issue2) => {
        inst.issues.push(issue2);
        inst.message = JSON.stringify(inst.issues, jsonStringifyReplacer, 2);
      }
      // enumerable: false,
    },
    addIssues: {
      value: (issues2) => {
        inst.issues.push(...issues2);
        inst.message = JSON.stringify(inst.issues, jsonStringifyReplacer, 2);
      }
      // enumerable: false,
    },
    isEmpty: {
      get() {
        return inst.issues.length === 0;
      }
      // enumerable: false,
    }
  });
};
var ZodRealError = $constructor("ZodError", initializer2, {
  Parent: Error
});

// node_modules/zod/v4/classic/parse.js
var parse2 = /* @__PURE__ */ _parse(ZodRealError);
var parseAsync2 = /* @__PURE__ */ _parseAsync(ZodRealError);
var safeParse3 = /* @__PURE__ */ _safeParse(ZodRealError);
var safeParseAsync2 = /* @__PURE__ */ _safeParseAsync(ZodRealError);
var encode = /* @__PURE__ */ _encode(ZodRealError);
var decode = /* @__PURE__ */ _decode(ZodRealError);
var encodeAsync = /* @__PURE__ */ _encodeAsync(ZodRealError);
var decodeAsync = /* @__PURE__ */ _decodeAsync(ZodRealError);
var safeEncode = /* @__PURE__ */ _safeEncode(ZodRealError);
var safeDecode = /* @__PURE__ */ _safeDecode(ZodRealError);
var safeEncodeAsync = /* @__PURE__ */ _safeEncodeAsync(ZodRealError);
var safeDecodeAsync = /* @__PURE__ */ _safeDecodeAsync(ZodRealError);

// node_modules/zod/v4/classic/schemas.js
var ZodType = /* @__PURE__ */ $constructor("ZodType", (inst, def) => {
  $ZodType.init(inst, def);
  Object.assign(inst["~standard"], {
    jsonSchema: {
      input: createStandardJSONSchemaMethod(inst, "input"),
      output: createStandardJSONSchemaMethod(inst, "output")
    }
  });
  inst.toJSONSchema = createToJSONSchemaMethod(inst, {});
  inst.def = def;
  inst.type = def.type;
  Object.defineProperty(inst, "_def", { value: def });
  inst.check = (...checks) => {
    return inst.clone(util_exports.mergeDefs(def, {
      checks: [
        ...def.checks ?? [],
        ...checks.map((ch) => typeof ch === "function" ? { _zod: { check: ch, def: { check: "custom" }, onattach: [] } } : ch)
      ]
    }));
  };
  inst.clone = (def2, params) => clone(inst, def2, params);
  inst.brand = () => inst;
  inst.register = ((reg, meta2) => {
    reg.add(inst, meta2);
    return inst;
  });
  inst.parse = (data, params) => parse2(inst, data, params, { callee: inst.parse });
  inst.safeParse = (data, params) => safeParse3(inst, data, params);
  inst.parseAsync = async (data, params) => parseAsync2(inst, data, params, { callee: inst.parseAsync });
  inst.safeParseAsync = async (data, params) => safeParseAsync2(inst, data, params);
  inst.spa = inst.safeParseAsync;
  inst.encode = (data, params) => encode(inst, data, params);
  inst.decode = (data, params) => decode(inst, data, params);
  inst.encodeAsync = async (data, params) => encodeAsync(inst, data, params);
  inst.decodeAsync = async (data, params) => decodeAsync(inst, data, params);
  inst.safeEncode = (data, params) => safeEncode(inst, data, params);
  inst.safeDecode = (data, params) => safeDecode(inst, data, params);
  inst.safeEncodeAsync = async (data, params) => safeEncodeAsync(inst, data, params);
  inst.safeDecodeAsync = async (data, params) => safeDecodeAsync(inst, data, params);
  inst.refine = (check2, params) => inst.check(refine(check2, params));
  inst.superRefine = (refinement) => inst.check(superRefine(refinement));
  inst.overwrite = (fn) => inst.check(_overwrite(fn));
  inst.optional = () => optional(inst);
  inst.nullable = () => nullable(inst);
  inst.nullish = () => optional(nullable(inst));
  inst.nonoptional = (params) => nonoptional(inst, params);
  inst.array = () => array(inst);
  inst.or = (arg) => union([inst, arg]);
  inst.and = (arg) => intersection(inst, arg);
  inst.transform = (tx) => pipe2(inst, transform(tx));
  inst.default = (def2) => _default(inst, def2);
  inst.prefault = (def2) => prefault(inst, def2);
  inst.catch = (params) => _catch(inst, params);
  inst.pipe = (target) => pipe2(inst, target);
  inst.readonly = () => readonly(inst);
  inst.describe = (description) => {
    const cl = inst.clone();
    globalRegistry.add(cl, { description });
    return cl;
  };
  Object.defineProperty(inst, "description", {
    get() {
      return globalRegistry.get(inst)?.description;
    },
    configurable: true
  });
  inst.meta = (...args) => {
    if (args.length === 0) {
      return globalRegistry.get(inst);
    }
    const cl = inst.clone();
    globalRegistry.add(cl, args[0]);
    return cl;
  };
  inst.isOptional = () => inst.safeParse(void 0).success;
  inst.isNullable = () => inst.safeParse(null).success;
  return inst;
});
var _ZodString = /* @__PURE__ */ $constructor("_ZodString", (inst, def) => {
  $ZodString.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => stringProcessor(inst, ctx, json);
  const bag = inst._zod.bag;
  inst.format = bag.format ?? null;
  inst.minLength = bag.minimum ?? null;
  inst.maxLength = bag.maximum ?? null;
  inst.regex = (...args) => inst.check(_regex(...args));
  inst.includes = (...args) => inst.check(_includes(...args));
  inst.startsWith = (...args) => inst.check(_startsWith(...args));
  inst.endsWith = (...args) => inst.check(_endsWith(...args));
  inst.min = (...args) => inst.check(_minLength(...args));
  inst.max = (...args) => inst.check(_maxLength(...args));
  inst.length = (...args) => inst.check(_length(...args));
  inst.nonempty = (...args) => inst.check(_minLength(1, ...args));
  inst.lowercase = (params) => inst.check(_lowercase(params));
  inst.uppercase = (params) => inst.check(_uppercase(params));
  inst.trim = () => inst.check(_trim());
  inst.normalize = (...args) => inst.check(_normalize(...args));
  inst.toLowerCase = () => inst.check(_toLowerCase());
  inst.toUpperCase = () => inst.check(_toUpperCase());
  inst.slugify = () => inst.check(_slugify());
});
var ZodString = /* @__PURE__ */ $constructor("ZodString", (inst, def) => {
  $ZodString.init(inst, def);
  _ZodString.init(inst, def);
  inst.email = (params) => inst.check(_email(ZodEmail, params));
  inst.url = (params) => inst.check(_url(ZodURL, params));
  inst.jwt = (params) => inst.check(_jwt(ZodJWT, params));
  inst.emoji = (params) => inst.check(_emoji2(ZodEmoji, params));
  inst.guid = (params) => inst.check(_guid(ZodGUID, params));
  inst.uuid = (params) => inst.check(_uuid(ZodUUID, params));
  inst.uuidv4 = (params) => inst.check(_uuidv4(ZodUUID, params));
  inst.uuidv6 = (params) => inst.check(_uuidv6(ZodUUID, params));
  inst.uuidv7 = (params) => inst.check(_uuidv7(ZodUUID, params));
  inst.nanoid = (params) => inst.check(_nanoid(ZodNanoID, params));
  inst.guid = (params) => inst.check(_guid(ZodGUID, params));
  inst.cuid = (params) => inst.check(_cuid(ZodCUID, params));
  inst.cuid2 = (params) => inst.check(_cuid2(ZodCUID2, params));
  inst.ulid = (params) => inst.check(_ulid(ZodULID, params));
  inst.base64 = (params) => inst.check(_base64(ZodBase64, params));
  inst.base64url = (params) => inst.check(_base64url(ZodBase64URL, params));
  inst.xid = (params) => inst.check(_xid(ZodXID, params));
  inst.ksuid = (params) => inst.check(_ksuid(ZodKSUID, params));
  inst.ipv4 = (params) => inst.check(_ipv4(ZodIPv4, params));
  inst.ipv6 = (params) => inst.check(_ipv6(ZodIPv6, params));
  inst.cidrv4 = (params) => inst.check(_cidrv4(ZodCIDRv4, params));
  inst.cidrv6 = (params) => inst.check(_cidrv6(ZodCIDRv6, params));
  inst.e164 = (params) => inst.check(_e164(ZodE164, params));
  inst.datetime = (params) => inst.check(datetime2(params));
  inst.date = (params) => inst.check(date2(params));
  inst.time = (params) => inst.check(time2(params));
  inst.duration = (params) => inst.check(duration2(params));
});
function string3(params) {
  return _string(ZodString, params);
}
var ZodStringFormat = /* @__PURE__ */ $constructor("ZodStringFormat", (inst, def) => {
  $ZodStringFormat.init(inst, def);
  _ZodString.init(inst, def);
});
var ZodEmail = /* @__PURE__ */ $constructor("ZodEmail", (inst, def) => {
  $ZodEmail.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodGUID = /* @__PURE__ */ $constructor("ZodGUID", (inst, def) => {
  $ZodGUID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodUUID = /* @__PURE__ */ $constructor("ZodUUID", (inst, def) => {
  $ZodUUID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodURL = /* @__PURE__ */ $constructor("ZodURL", (inst, def) => {
  $ZodURL.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodEmoji = /* @__PURE__ */ $constructor("ZodEmoji", (inst, def) => {
  $ZodEmoji.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodNanoID = /* @__PURE__ */ $constructor("ZodNanoID", (inst, def) => {
  $ZodNanoID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodCUID = /* @__PURE__ */ $constructor("ZodCUID", (inst, def) => {
  $ZodCUID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodCUID2 = /* @__PURE__ */ $constructor("ZodCUID2", (inst, def) => {
  $ZodCUID2.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodULID = /* @__PURE__ */ $constructor("ZodULID", (inst, def) => {
  $ZodULID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodXID = /* @__PURE__ */ $constructor("ZodXID", (inst, def) => {
  $ZodXID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodKSUID = /* @__PURE__ */ $constructor("ZodKSUID", (inst, def) => {
  $ZodKSUID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodIPv4 = /* @__PURE__ */ $constructor("ZodIPv4", (inst, def) => {
  $ZodIPv4.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodIPv6 = /* @__PURE__ */ $constructor("ZodIPv6", (inst, def) => {
  $ZodIPv6.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodCIDRv4 = /* @__PURE__ */ $constructor("ZodCIDRv4", (inst, def) => {
  $ZodCIDRv4.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodCIDRv6 = /* @__PURE__ */ $constructor("ZodCIDRv6", (inst, def) => {
  $ZodCIDRv6.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodBase64 = /* @__PURE__ */ $constructor("ZodBase64", (inst, def) => {
  $ZodBase64.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodBase64URL = /* @__PURE__ */ $constructor("ZodBase64URL", (inst, def) => {
  $ZodBase64URL.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodE164 = /* @__PURE__ */ $constructor("ZodE164", (inst, def) => {
  $ZodE164.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodJWT = /* @__PURE__ */ $constructor("ZodJWT", (inst, def) => {
  $ZodJWT.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodArray = /* @__PURE__ */ $constructor("ZodArray", (inst, def) => {
  $ZodArray.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => arrayProcessor(inst, ctx, json, params);
  inst.element = def.element;
  inst.min = (minLength, params) => inst.check(_minLength(minLength, params));
  inst.nonempty = (params) => inst.check(_minLength(1, params));
  inst.max = (maxLength, params) => inst.check(_maxLength(maxLength, params));
  inst.length = (len, params) => inst.check(_length(len, params));
  inst.unwrap = () => inst.element;
});
function array(element, params) {
  return _array(ZodArray, element, params);
}
var ZodUnion = /* @__PURE__ */ $constructor("ZodUnion", (inst, def) => {
  $ZodUnion.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => unionProcessor(inst, ctx, json, params);
  inst.options = def.options;
});
function union(options, params) {
  return new ZodUnion({
    type: "union",
    options,
    ...util_exports.normalizeParams(params)
  });
}
var ZodIntersection = /* @__PURE__ */ $constructor("ZodIntersection", (inst, def) => {
  $ZodIntersection.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => intersectionProcessor(inst, ctx, json, params);
});
function intersection(left, right) {
  return new ZodIntersection({
    type: "intersection",
    left,
    right
  });
}
var ZodTransform = /* @__PURE__ */ $constructor("ZodTransform", (inst, def) => {
  $ZodTransform.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => transformProcessor(inst, ctx);
  inst._zod.parse = (payload, _ctx) => {
    if (_ctx.direction === "backward") {
      throw new $ZodEncodeError(inst.constructor.name);
    }
    payload.addIssue = (issue2) => {
      if (typeof issue2 === "string") {
        payload.issues.push(util_exports.issue(issue2, payload.value, def));
      } else {
        const _issue = issue2;
        if (_issue.fatal)
          _issue.continue = false;
        _issue.code ?? (_issue.code = "custom");
        _issue.input ?? (_issue.input = payload.value);
        _issue.inst ?? (_issue.inst = inst);
        payload.issues.push(util_exports.issue(_issue));
      }
    };
    const output = def.transform(payload.value, payload);
    if (output instanceof Promise) {
      return output.then((output2) => {
        payload.value = output2;
        return payload;
      });
    }
    payload.value = output;
    return payload;
  };
});
function transform(fn) {
  return new ZodTransform({
    type: "transform",
    transform: fn
  });
}
var ZodOptional = /* @__PURE__ */ $constructor("ZodOptional", (inst, def) => {
  $ZodOptional.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function optional(innerType) {
  return new ZodOptional({
    type: "optional",
    innerType
  });
}
var ZodNullable = /* @__PURE__ */ $constructor("ZodNullable", (inst, def) => {
  $ZodNullable.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => nullableProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function nullable(innerType) {
  return new ZodNullable({
    type: "nullable",
    innerType
  });
}
var ZodDefault = /* @__PURE__ */ $constructor("ZodDefault", (inst, def) => {
  $ZodDefault.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => defaultProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
  inst.removeDefault = inst.unwrap;
});
function _default(innerType, defaultValue) {
  return new ZodDefault({
    type: "default",
    innerType,
    get defaultValue() {
      return typeof defaultValue === "function" ? defaultValue() : util_exports.shallowClone(defaultValue);
    }
  });
}
var ZodPrefault = /* @__PURE__ */ $constructor("ZodPrefault", (inst, def) => {
  $ZodPrefault.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => prefaultProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function prefault(innerType, defaultValue) {
  return new ZodPrefault({
    type: "prefault",
    innerType,
    get defaultValue() {
      return typeof defaultValue === "function" ? defaultValue() : util_exports.shallowClone(defaultValue);
    }
  });
}
var ZodNonOptional = /* @__PURE__ */ $constructor("ZodNonOptional", (inst, def) => {
  $ZodNonOptional.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => nonoptionalProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function nonoptional(innerType, params) {
  return new ZodNonOptional({
    type: "nonoptional",
    innerType,
    ...util_exports.normalizeParams(params)
  });
}
var ZodCatch = /* @__PURE__ */ $constructor("ZodCatch", (inst, def) => {
  $ZodCatch.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => catchProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
  inst.removeCatch = inst.unwrap;
});
function _catch(innerType, catchValue) {
  return new ZodCatch({
    type: "catch",
    innerType,
    catchValue: typeof catchValue === "function" ? catchValue : () => catchValue
  });
}
var ZodPipe = /* @__PURE__ */ $constructor("ZodPipe", (inst, def) => {
  $ZodPipe.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => pipeProcessor(inst, ctx, json, params);
  inst.in = def.in;
  inst.out = def.out;
});
function pipe2(in_, out) {
  return new ZodPipe({
    type: "pipe",
    in: in_,
    out
    // ...util.normalizeParams(params),
  });
}
var ZodReadonly = /* @__PURE__ */ $constructor("ZodReadonly", (inst, def) => {
  $ZodReadonly.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => readonlyProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function readonly(innerType) {
  return new ZodReadonly({
    type: "readonly",
    innerType
  });
}
var ZodCustom = /* @__PURE__ */ $constructor("ZodCustom", (inst, def) => {
  $ZodCustom.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => customProcessor(inst, ctx);
});
function refine(fn, _params = {}) {
  return _refine(ZodCustom, fn, _params);
}
function superRefine(fn) {
  return _superRefine(fn);
}
var check = (type, value) => type.safeParse(value).success;
format_exports.Set("base64", (value) => check(string3().base64(), value));
format_exports.Set("base64url", (value) => check(string3().base64url(), value));
format_exports.Set("cidrv4", (value) => check(string3().cidr({ version: "v4" }), value));
format_exports.Set("cidrv6", (value) => check(string3().cidr({ version: "v6" }), value));
format_exports.Set("cidr", (value) => check(string3().cidr(), value));
format_exports.Set("cuid", (value) => check(string3().cuid(), value));
format_exports.Set("cuid2", (value) => check(string3().cuid2(), value));
format_exports.Set("date", (value) => check(string3().date(), value));
format_exports.Set("datetime", (value) => check(string3().datetime({ offset: true }), value));
format_exports.Set("duration", (value) => check(string3().duration(), value));
format_exports.Set("email", (value) => check(string3().email(), value));
format_exports.Set("emoji", (value) => check(string3().emoji(), value));
format_exports.Set("ipv4", (value) => check(string3().ip({ version: "v4" }), value));
format_exports.Set("ipv6", (value) => check(string3().ip({ version: "v6" }), value));
format_exports.Set("ip", (value) => check(string3().ip(), value));
format_exports.Set("jwt", (value) => check(string3().jwt(), value));
format_exports.Set("nanoid", (value) => check(string3().nanoid(), value));
format_exports.Set("time", (value) => check(string3().time(), value));
format_exports.Set("ulid", (value) => check(string3().ulid(), value));
format_exports.Set("url", (value) => check(string3().url(), value));
format_exports.Set("uuid", (value) => check(string3().uuid(), value));

// src/index.ts
function isCloudflareWorker() {
  try {
    if (
      // @ts-ignore
      typeof caches !== "undefined" && // @ts-ignore
      typeof caches.default !== "undefined"
    )
      return true;
    if (typeof WebSocketPair !== "undefined") {
      return true;
    }
  } catch (e) {
    return false;
  }
  return false;
}
var openapi = ({
  enabled = true,
  path = "/openapi",
  provider = "scalar",
  specPath = `${path}/json`,
  documentation = {},
  exclude,
  swagger,
  scalar,
  references,
  mapJsonSchema,
  embedSpec
} = {}) => {
  if (!enabled) return new Elysia({ name: "@elysiajs/openapi" });
  const info = {
    title: "Elysia Documentation",
    description: "Development documentation",
    ...documentation.info
  };
  const relativePath = specPath.startsWith("/") ? specPath.slice(1) : specPath;
  let totalRoutes = 0;
  let cachedSchema;
  const toFullSchema = ({
    paths,
    components: { schemas }
  }) => {
    return cachedSchema = {
      openapi: "3.0.3",
      ...documentation,
      tags: !exclude?.tags ? documentation.tags : documentation.tags?.filter(
        (tag) => !exclude.tags?.includes(tag.name)
      ),
      info: {
        title: "Elysia Documentation",
        description: "Development documentation",
        version: "0.0.0",
        ...documentation.info
      },
      paths: {
        ...paths,
        ...documentation.paths
      },
      components: {
        ...documentation.components,
        schemas: {
          ...schemas,
          ...documentation.components?.schemas
        }
      }
    };
  };
  const app = new Elysia({ name: "@elysiajs/openapi" });
  app.use((app2) => {
    if (provider === null) return app2;
    const page = () => new Response(
      provider === "swagger-ui" ? SwaggerUIRender(info, {
        url: relativePath,
        dom_id: "#swagger-ui",
        version: "latest",
        autoDarkMode: true,
        ...swagger
      }) : ScalarRender(
        info,
        {
          url: relativePath,
          version: "latest",
          cdn: `https://cdn.jsdelivr.net/npm/@scalar/api-reference@${scalar?.version ?? "latest"}/dist/browser/standalone.min.js`,
          ...scalar,
          _integration: "elysiajs"
        },
        embedSpec ? JSON.stringify(
          totalRoutes === app2.routes.length ? cachedSchema : toFullSchema(
            toOpenAPISchema(
              app2,
              exclude,
              references,
              mapJsonSchema
            )
          )
        ) : void 0
      ),
      {
        headers: {
          "content-type": "text/html; charset=utf8"
        }
      }
    );
    return app2.get(
      path,
      embedSpec || isCloudflareWorker() ? page : page(),
      {
        detail: {
          hide: true
        }
      }
    );
  }).get(
    specPath,
    function openAPISchema() {
      if (totalRoutes === app.routes.length && cachedSchema)
        return cachedSchema;
      totalRoutes = app.routes.length;
      return toFullSchema(
        toOpenAPISchema(app, exclude, references, mapJsonSchema)
      );
    },
    {
      error({ error }) {
        console.log("[@elysiajs/openapi] error at specPath");
        console.warn(error);
      },
      detail: {
        hide: true
      }
    }
  );
  return app;
};

const typedEnv = new Elysia().decorate({
  x: void 0
});

function SampleRoutes() {
  const app = new Elysia();
  app.use(typedEnv).get("/patrick", ({ env }) => {
    return Response.json({ x: env, message: "hello" });
  });
  return app;
}

const handle = async (ctx) => {
  const app = new Elysia({
    prefix: "/api",
    adapter: CloudflareAdapter,
    aot: false,
    normalize: true
  }).use(openapi());
  app.decorate({
    env: ctx.locals.runtime.env,
    urlData: ctx.url,
    astroCookies: ctx.cookies
  });
  app.use(SampleRoutes());
  return await app.handle(ctx.request);
};
const GET = handle;
const POST = handle;
const PUT = handle;
const DELETE = handle;
const PATCH = handle;
const HEAD = handle;
const OPTIONS = handle;
const TRACE = handle;
const CONNECT = handle;
const LINK = handle;
const UNLINK = handle;

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  CONNECT,
  DELETE,
  GET,
  HEAD,
  LINK,
  OPTIONS,
  PATCH,
  POST,
  PUT,
  TRACE,
  UNLINK
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
