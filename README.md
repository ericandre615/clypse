# Clypse
## Runtime Typing and Validation for Javascript

Define types in one place and use them anywhere. Validate data structures against 
custom types or primitives. 

`Clypse` will be a single instance that holds all the custom types you register through anywhere in your app.
If you create a type in file `a.js` you can import it into file `b.js` or any other files in your app.
You can import the validator into `c.js` and test data against all the types defined through all the files in your app.
However, each type must have a unique name/identifier (ie `[object User]`, `[object Job]`)

### Validator
Clypse exports a `validate` function that allows you to check data against your custom types or even primitives (however,
for convenience it also exports `isA...` functions for all primitives, which may be easier to use and more readable).
The `validate` function takes a `type` a returns a function that accepts `data` to validate against.

Example
```
const isUser = validate(User); // User is a reference to a custom type

const jeremy = { name: 'Jeremy', age: 33, username: 'dudeman' };

// validate that jeremy variable is of our custom User type
const [valid, failures] = isUser(jeremy);

if (valid) {
  // jeremy is of type User
} else {
  // jeremy does not of type User
}
```

notice that calling `validate` with data returns an array of 2 values, the first is a boolean
for whether or not the data is of that type. The second is an array of objects of each property that fails the validation

Example
```
  /* let's say User type expects this structure
  ** { username: string, age: number, job: Job }
  ** where `Job` is another custom object type
  ** { desc: str, years: num }
  */

  const jeremy = {
    username: 'jman',
    age: '33',
    job: { desc: 'developer' }
  };

  const [isValid, failures] = validate(User)(jeremy);

  // isValid will be `false`
  // failures will have this structure

  /*
  ** [
  **   { "job.years": { "actual": "[object Undefined]","expected": "[object Number]" }},
  **   { "age": { "actual": "[object String]","expected": "[object Number]" }}
  ** ]
  */

  // NOTE: the property name for the nested object failure `job.years`
```

### Usage


### Primitives
Below is a list of primitives that come with Clypse and their associated
validation functions. In addition the `isPrimitive` function can be used to check
if a value is any one of the below values. 

- `undef` / `isUndefined` => '[object Undefined]'
- `nul` / `isNull` => '[object Null]'
- `obj` / `isObject` => '[object Object]'
- `arr` / `isArray` => '[object Array]'
- `str` / `isString` => '[object String]'
- `num` / `isNumber` => '[object Number]'
- `bool` / `isBoolean` => '[object Boolean]'
- `func` / `isFunction` => '[object Function]'
- `buffer` / `isBuffer` => '[object Uint8Array]'
- `date` / `isDate` => '[object Date]'
- `symb` / `isSymbol` => '[object Symbol]'
- `regex` / `isRegex` => '[object RegExp]'
- `i8` / `isInt8Array` => '[object Int8Array]'
- `u8` / `isUint8Array` => '[object Uint8Array]'
- `u8Clamped` / `isUint8ClampedArray` => '[object Uint8ClampedArray]'
- `i16` / `isInt16Array` => '[object Int16Array]'
- `u16` / `isUint16Array` => '[object Uint16Array]'
- `i32` / `isInt32Array` => '[object Int32Array]'
- `u32` / `isUint32Array` => '[object Uint32Array]'
- `f32` / `isFloat32Array` => '[object Float32Array]'
- `f64` / `isFloat64Array` '[object Float64Array]'

