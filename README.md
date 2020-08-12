# Clypse
## Runtime Typing and Validation for Javascript

Define types in one place and use them anywhere. Validate data structures against 
custom types or primitives.

One of the goals is to embrace the dynamic type system of javascript with native javascript, zero dependencies, and in the context of runtime.
The other size of this puzzle is to provide tools for developers at write/build time (possibly through custom `eslint` plugins)

`Clypse` will be a single instance that holds all the custom types you register through anywhere in your app.
If you create a type in file `a.js` you can import it into file `b.js` or any other files in your app.
You can import the validator into `c.js` and test data against all the types defined through all the files in your app.
However, each type must have a unique name/identifier (ie `[object User]`, `[object Job]`)

### Validator
Clypse exports a `validate` function that allows you to check data against your custom types or even primitives (however,
for convenience it also exports `isA...` functions for all [primitives](#primitives), which may be easier to use and more readable).
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

### Basic Usage
The most common functions will be `validate` and `createType`. `createType` will let you create custom
structures to validate data against. `primitives` will also be useful in creating these definitions.

#### validate
The validate function should be simple and straight forward. Assuming you have created a type with `clypse.createType` you
can call validate using that type to validate any other data/variable to see if it is of that type. It return a tuple like array where
the first element is a boolean (isValid) and the second is an array of objects which are failures in the structure of

```
[
  { id: { actual: '[object String]', expected: '[object Number]' } },
]
```

`validate` will take a single `type` argument and return a new function. This can be nice to create readable and reusable validation
functions per type.

Example (assuming a User type has been created elsewhere)
```
  import User from './types/user.js';

  const isUser = validate(User);

  const jeremy = {
    name: 'jeremy',
    age: 33,
    dob: '2020-06-06T23:09:31.224Z'
  };

  const [isValidUser, failedValidations] = isUser(jeremy);

  // example output of these variables depends on if jeremy fits the structure of the custom defined User type
```

#### createType
The second argument to `createType` is required and is unique `String` name/identifier.

Example
```
  import clypse from 'clypse';

  const { num, str, date } = clypse.primitives;

  const UserType = clypse.createType({
    name: str,
    age: num,
    birthdate: date,
  }, 'User');

  // createType will return a string of the type `[object User]`
  // which can be used through the application to refer to this type
```

You can nest other types structures withing other custom types (assume `UserType` is as defined in above example).
These can even be defined in different files and imported into other files.

Example
```
  const Post = clypse.createType({
    created: date,
    title: str,
    content: str,
    author: UserType
  });
```

If `createType` has nested object structures that are not already defined custom types then a custom type will automatically be created for you.

Example
```
  const Nested = clypse.createType({
    name: str,
    id: num,
    details: {
      title: str,
      created: date,
      etc: str
    }
  });
```

In the above example what happens internally is that the `Nested` type that is created is `[object Nested]` and it's definition will
look like this
```
  Nested {
    name: str,
    id: num,
    details: '[object NestedDetails]`
  }
```
where the unique name created will be a PascalCase of ParentProp and the child prop type created will look like this
```
  NestedDetails {
    title: str,
    created: date,
    etc: str,
  }
```

#### typeOf
The `typeOf` function is an extra function that isn't required. It's a bit of a convenience function. This was original started as
the main way of validating types against data before the separate `validation` implementation. However, it also had another use. It's
other use outside of this was to be able to wrap data to create valid data of a type. By default it will `throw` and `Error` if 
the data does not validate. However, you can provide it with a handler function that can allow it to not `throw` and instead it can
check the failures on the data and decide what to do, use default values, do conversions (if say the custom type wants a number but the data has a string, but is
can safely be parsed into a number) etc.

Instead of creating data somewhere and then validating it. You can create the data in this way (or you can validate through this method as well)
It first takes a type and optional handler `(type, failHandler)` and returns another function that takes in the data.
 
Example (assume some already created `User` type)
```
import User from './types/user.js';

const createUser = typeOf(User);
const safeJeremy = createUser({
  name: 'jeremy',
  age: 33,
  etc: {...etc},
});
```
In the above example you may even want to have a custom type file `export` the type, validation function, and typeOfX function.
Example assuming those are defined in the `types/user.js` file.
`import { User, isUser, createUser } from './types/user.js';`

A better example is to use a custom handler to check validations and return a mix of the valid data passed in with sane defaults or conversions.
This can be as simple or complex as you need it to be. You could also create different `typeOf` function for the same type. (ie `createUserWithDefaults`, `createUserWithOptionalProps`)

Example
```
import { createType, typeOf } from 'clypse';

const User = createType({
  name: str,
  id: num,
  data: num,
}, 'User');
const userValue = {
  name: 'dude-fail',
  id: '10', // notice this is a str, but could be parsed to a number (which is expected)
  data: 'not parsed' // notice we expect a number, but it's a string that will parse to NaN
};

const handleFailure = ({ value, failures }) => {
  const convertedFailures = failures.reduce((acc, failure) => {
    const prop = Object.keys(failure)[0];
    const { actual, expected } = failure[prop];
    const propValue = value[prop];

    if (expected === '[object Number]') {
      const parsedValue = parseInt(propValue, 10);
      return {
        ...acc,
        [prop]: Number.isNaN(parsedValue) ? 0 : parsedValue,
      };
    }

    return {
      ...acc,
      [prop]: propValue,
    };
  }, {});

  return {
    ...value,
    ...convertedFailures,
  };
};

const createUser = typeOf(User, handleFailure);
const someUser = createUser(userValue);
```

In the above example `someUser` will actual return the value
```
// someUser
{
  name: 'dude-fail',
  id: 10,
  data: 0
};
```

Where `id: '10'` was converted to the number `id: 10` and `data: 'not parsed'` was discarded and used the default value `data: 0`

### <a id="primitives">Primitives</a>
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
- `map` / `isMap` => '[object Map]'
- `weakMap` / `isWeakMap` => '[object WeakMap]'
- `set` / `isSet` => '[object Set]'
- `weakSet` / `isWeakSet` => '[object WeakSet]'
- `i8` / `isInt8Array` => '[object Int8Array]'
- `u8` / `isUint8Array` => '[object Uint8Array]'
- `u8Clamped` / `isUint8ClampedArray` => '[object Uint8ClampedArray]'
- `i16` / `isInt16Array` => '[object Int16Array]'
- `u16` / `isUint16Array` => '[object Uint16Array]'
- `i32` / `isInt32Array` => '[object Int32Array]'
- `u32` / `isUint32Array` => '[object Uint32Array]'
- `f32` / `isFloat32Array` => '[object Float32Array]'
- `f64` / `isFloat64Array` '[object Float64Array]'

### Properties
- `types`: [Object] an object containing all registered types keyed by `String[type]`
- `primitives`: See above for a list of all primitives

### Functions
- `validate`: `(type) => (value) => [isValid, failures[{ actual, expected }]]`
- `createType`: `(definition = Object, typeName = String) => String[type]`
- `getTypeMeta`: `(type = String[type]) => Object[{ name, definition }]`
- `typeOf`: `(type = String[type], failureHandler[Function]) => Function[(data)] => data` this function takes a custom type and an optional handler function for when the data fails validation
  - `failureHandler`: `({ message, type, value, failures }) => data`
    - _NOTE_ the default handler will throw an error if the data does not validate against the passed in type
    - `message` is a basic type String message explaining what type was expected and what was received
    - `type` the custom type as a string (ie `[object User]`)
    - `value` prop passed to this function is the original unmodified data
    - `failures` Array, same structure as the `failures` return from the `validate` function
- `is*`: See above for various primitive validation functions
