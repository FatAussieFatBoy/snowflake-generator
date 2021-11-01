# snowflake-generator

<div>
<a href="https://www.npmjs.com/package/snowflake-generator"><img src="https://img.shields.io/npm/v/snowflake-generator.svg" alt="NPM version"/></a>
<a href="https://www.npmjs.com/package/snowflake-generator"><img src="https://img.shields.io/npm/dt/snowflake-generator.svg" alt="NPM downloads"/></a>
<a href="https://www.patreon.com/fataussie"><img src="https://img.shields.io/badge/donate-patreon-F96854" alt="Patreon"/></a>
</div>

A lightweight [Twitter Snowflake](https://github.com/twitter-archive/snowflake) generation package utilising TypeScript.

---

## Getting Started
Install the **npm package**
```
npm install snowflake-generator
```
**Require** the package into your code
```js
const { Generator } = require('snowflake-generator');
```
Construct a **new** Snowflake Generator with the EPOCH timestamp in milliseconds
```js
const SnowflakeGenerator = new Generator(1420070400000); 
// Thursday, 1 January 2015 00:00:00
```
**Generate** a Snowflake
```js
const Snowflake = SnowflakeGenerator.generate();
```
---

## Generator `(class)`

### Constructor
```ts
new Generator(epoch?: Date|number, shardID?: number);
```
| param          | type         | optional | default      | description |
| :------------- | :----------- | :------- | :----------- | :---------- |
| epoch          | Date\|number | true     | 946684800000 | The epoch timestamp to generate from.
| shardID       | number       | true     | 1            | Useful when running multiple generators at the same time to prevent duplicates.

### Properties
#### .EPOCH
> The generators epoch timestamp in milliseconds.<br/>**@type**  `number`

#### .SHARD_ID
> The id of the shard running this generator.<br/>**@type**  `number`

#### .INCREMENT
> The current increment iteration this generator is on.<br/>**@type**  `number`

### Methods
Generates snowflakes.
```ts
Generator.generate(amount?: number, timestamp?: Date|number);
```
| parameter | type         | optional | default  | description |
| :-------- | :----------- | :------- | :------- | :---------- |
| amount    | number       | true     | 1        | Amount of snowflakes to generate, recommended not to go above `1024` or duplicates will arise.
| timestamp | Date\|number | true     | Date.now | Timestamp to generate from

**@returns**  `bigint|bigint[]`
<br/><br/>

Deconstruct a snowflake to its values using the `Generator.epoch`.
```ts
Generator.deconstruct(snowflake: SnowflakeResolvable);
```
| parameters | type           | description |
| :--------- | :------------- | :---------- |
| snowflake  | [SnowflakeResolvable](#snowflakeresolvable) | Snowflake(s) to deconstruct

**@returns**  [DeconstructedSnowflake](#deconstructedsnowflake)

---

## Types & Interfaces

### SnowflakeResolvable
> Resolvable value types for a valid Snowflake.
> - string
> - number
> - bigint

### DeconstructedSnowflake
> Interface of a Snowflake after `Generator.deconstruct()`.
> - snowflake - Snowflake deconstructed from<br/>**@type**  `bigint`
> - timestamp - The timestamp the snowflake was generated<br/>**@type**  `bigint`
> - shard_id - The shard_id used when generating<br/>**@type**  `bigint`
> - increment - The increment of this snowflake<br/>**@type**  `bigint`
> - binary - The 64Bit snowflake binary string<br/>**@type**  `string`

---

## Extra Credit

### Generating more than 1024 snowflakes

```js
let snowflakes = [];
let ts = Date.now();
let amount = 20000;
for (let i = 0; i < (amount / 1024); i++) {
    // this could be improved, but is proof of concept.
    let new_amount = i + 1 >= (amount / 1024) ? amount % 1024 : 1024;
    snowflakes = snowflakes.concat(generator.generate(new_amount, ts + i));
}
```
> **Note:** When parsing this array through a duplication checking function it returns `0` found duplicates.

```console
> console.log(generator) after running script.
> Note: increment == amount.

Generator { epoch: 1420070400000, shard_id: 1, increment: 20000 }
```
