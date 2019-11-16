# snowflake-generator

<div>
<a href="https://www.npmjs.com/package/snowflake-generator"><img src="https://img.shields.io/npm/v/snowflake-generator.svg" alt="NPM version"/></a>
<a href="https://www.npmjs.com/package/snowflake-generator"><img src="https://img.shields.io/npm/dt/snowflake-generator.svg" alt="NPM downloads"/></a>
<a href="https://www.patreon.com/fataussie"><img src="https://img.shields.io/badge/donate-patreon-F96854" alt="Patreon"/></a>
</div>

A lightweight `(12KB)` [Twitter Snowflake](https://github.com/twitter-archive/snowflake) generation package utilising ES6 Promises.

---

## Getting Started
Install the **npm package**
```
npm install snowflake-generator
```
**Require** the package into your code
```js
const SnowflakeGenerator = require('snowflake-generator');
```
Construct a **new** Snowflake Generator with the EPOCH timestamp in milliseconds
```js
const Snowflake = new SnowflakeGenerator(1420070400000); // Thursday, 1 January 2015 00:00:00
```
**Generate** a Snowflake
```js
const flake = Snowflake.generate();
```
Alternatively for a performance test you can run the `example.js` file which console logs the duration it took to generate `1000` Snowflakes and how many are duplicated.
```js
node example.js // Generated 1000 Snowflakes in 29 ms. with 0 duplicates
```
---

## SnowflakeGenerator `(class)`

### Constructor
```js
new SnowflakeGenerator(epoch);
```
| param | type | optional | default | description |
| :------------: | :----------: | :------: | :-----: | :---------- |
| epoch | Date\|Number | false | | Custom EPOCH timestamp in milliseconds
| total_bits | Number | true| 64 | Number of bits a generated Snowflakes id is made of. The combined amount of the `epoch_bits`, `worker_bits`, `process_bits` and `increment_bits` should be less than or equal to this value.
| epoch_bits | Number | true | 42 | Number of bits a generated Snowflakes timestamp is stored in.
| worker_bits | Number | true | 5 | Number of bits a generated Snowflakes worker id is stored in.
| process_bits | Number | true | 5 | Number of bits a generated Snowflakes process id is stored in.
| increment_bits | Number | true | 12 | Number of bits a generated Snowflakes increment value is stored in.

### Properties
#### .EPOCH
> Custom EPOCH timestamp<br/>**@type**  `Number`<br/>**@readonly**

#### .TOTAL_BITS
> Total number of bits a Snowflake id is made of<br/>**@type**  `Number`<br/>**@readonly**

#### .EPOCH_BITS
> Number of bits a Snowflakes EPOCH timestamp uses<br/>**@type**  `Number`<br/>**@readonly**

#### .MAX_EPOCH
> Maximum possible EPOCH timestamp<br/>**@type**  `Number`<br/>**@readonly**

#### .WORKER_BITS
> Number of bits a Snowflakes worker id uses<br/>**@type**  `Number`<br/>**@readonly**

#### .MAX_WORKER
> Maximum possible worker id<br/>**@type**  `Number`<br/>**@readonly**

#### .WORKER_ID
> The generators worker id<br/>**@type**  `Number`<br/>**@readonly**

#### .PID_BITS
> Number of bits a Snowflakes process id uses<br/>**@type**  `Number`<br/>**@readonly**

#### .MAX_PID
> Maximum possible process id<br/>**@type**  `Number`<br/>**@readonly**

#### .PROCESS_ID
> The generators process id<br/>**@type**  `Number`<br/>**@readonly**

#### .INCREMENT_BITS
> Number of bits a Snowflakes increment uses<br/>**@type**  `Number`<br/>**@readonly**

#### .MAX_INCREMENT
> Maximum possible increment<br/>**@type**  `Number`<br/>**@readonly**

#### .INCREMENT
> The generators increment number<br/>**@type**  `Number`

### Methods
#### .generate(timestamp, worker_id, process_id, increment)
> Generate a single Snowflake
>| parameter | type | optional | default | description |
>| :--------: | :----------: | :------: | :------------: | :---------- |
>| timestamp | Date\|Number | true | Date.now | Current/Defined EPOCH timestamp
>| worker_id | Number | true | .WORKER_ID | Worker id
>| process_id | Number | true | .PROCESS_ID | Process id
>| increment | Number | true | .INCREMENT | Snowflake increment
>**@returns**  `Snowflake`

#### .generateMany(amount)
> Generate a defined amount of Snowflakes and returns them in an array.
>>  **Note:** Using this method generates Snowflakes without control over its more specific inputs like the `generate` method allows.
>
>| parameters | type | description |
>| :--------: | :----: | :---------- |
>| amount | Number | Number of Snowflakes to generate
>**@returns**  `Promise<Array<Snowflake>>`

#### .deconstruct(snowflake)
> Deconstruct a Snowflake into its stored values using the generators EPOCH timestamp
>| parameters | type | description |
>| :--------: | :------------: | :---------- |
>| snowflake | String\|Number | Snowflake id to deconstruct
>**@returns**  `Object`

---

## Snowflake `(class)`
### Constructor
```js
new Snowflake(generator, timestamp)
```

### Properties
#### .generator
>The Snowflakes generator<br/>**@type** `SnowflakeGenerator`<br/>**@readonly**

#### .snowflake
>The Snowflake id<br/>**@type** `String`

#### .timestamp
> The Snowflakes stored EPOCH timestamp<br/>**@type** `Number`<br/>**@readonly**

#### .worker_id
>The Snowflakes stored worker id<br/>**@type** `Number`<br/>**@readonly**

#### .process_id
> The Snowflakes stored process id<br/>**@type** `Number`<br/>**@readonly**

#### .increment
> The Snowflakes stored increment value<br/>**@type** `Number`<br/>**@readonly**

#### .binary
> The Snowflakes id in binary format<br/>**@type** `String`<br/>**@readonly**

### Methods
#### .deconstruct()
> Deconstructs the Snowflake into its stored values<br/>
> **@returns** `Object`
---