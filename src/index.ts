import cluster from "cluster";

const cached64BitZeros = "0000000000000000000000000000000000000000000000000000000000000000";

export class Generator {

    /**
     * The generators epoch timestamp in milliseconds.
     * 
     * Defaults to "1st of January, 2000, 00:00".
     * 
     * @type {number}
     */

    epoch: number;

    /**
     * The id of the shard running this generator.
     * 
     * Defaults to "1".
     * 
     * @type {number}
     */

    shard_id: number;

    /**
     * The current increment iteration this generator is on.
     * @type {number}
     */

    increment: number;

    /**
     * The main class used for generating snowflakes.
     * @param {Date|number} [epoch] - The epoch timestamp (in milliseconds) to generate from
     * @param {number} [shard_id] - Useful when running multiple generators at the same time to prevent duplicates.
     */

    constructor(epoch?: Date|number, shard_id?: number) {
        this.epoch = epoch ? new Date(epoch).valueOf() : Date.UTC(2000, 0, 1).valueOf();
        this.shard_id = shard_id || 1;
        this.increment = 0;
    }

    /**
     * Generates a single snowflake.
     * @param {number} timestamp - Timestamp to generate from
     * @returns {bigint}
     * @private 
     */

    static _generate (generator: Generator, timestamp: number): bigint {
        const i: number = generator.increment++ % 1024;
        let result = ((BigInt(timestamp) - BigInt(generator.epoch)) << 23n);
            result = result | (BigInt(generator.shard_id) << 10n);
            result = result | (BigInt(i));

        return result;
    }

    /**
     * Generates snowflakes.
     * @param {number} [amount = 1] - Amount of snowflakes to generate, recommended not to go above `1024` or duplicates will arise.
     * @param {Date|number} [timestamp = Date.now] - Timestamp to generate from
     * @returns {bigint|bigint[]}
     */

    generate (amount: number = 1, timestamp: Date|number = Date.now()): bigint | bigint[] {
        if (timestamp instanceof Date) timestamp = timestamp.valueOf();
        else timestamp = new Date(timestamp).valueOf();

        if (amount === 1) return Generator._generate(this, timestamp);
        else {
            let results = [];
            for (let i = 0; i < amount; i++) {
                results.push(Generator._generate(this, timestamp));
            }

            return results;
        }
    }

    /**
     * Deconstruct a snowflake to its values.
     * @param {SnowflakeResolvable} snowflake - Snowflake to deconstruct
     * @returns {DeconstructedSnowflake}
     * @private
     */

    static _deconstruct (generator: Generator, snowflake: SnowflakeResolvable): DeconstructedSnowflake {
        const binary = Generator.binary(snowflake);
        return {
            snowflake: BigInt(snowflake),
            timestamp: Generator.extractBits(snowflake, 23n, 64n) + BigInt(generator.epoch),
            shard_id: Generator.extractBits(snowflake, 10n, 13n),
            increment: Generator.extractBits(snowflake, 0n, 10n),
            binary
        };
    }

    /**
     * Deconstruct a snowflake to its values using the `Generator.epoch`.
     * @param {SnowflakeResolvable|SnowflakeResolvable[]} snowflake - Snowflake(s) to deconstruct
     * @returns {DeconstructedSnowflake|DeconstructedSnowflake[]}
     */

    deconstruct (snowflake: SnowflakeResolvable | SnowflakeResolvable[]): DeconstructedSnowflake | DeconstructedSnowflake[] {
        //@ts-ignore
        if (snowflake instanceof Array) return snowflake.map(s => this.deconstruct(s));
        return Generator._deconstruct(this, snowflake);
    }

    /**
     * Extract bits and their values from a snowflake.
     * @param {SnowflakeResolvable} snowflake - Snowflake to extract from
     * @param {number|bigint} shift - Number of bits to shift before extracting
     * @param {number|bigint} length - Number of bits to extract before stopping  
     * @returns {bigint}
     */

    static extractBits(snowflake: SnowflakeResolvable, shift: number | bigint, length: number | bigint): bigint {
        const shiftN = BigInt(shift);
        const bitmask = ((1n << BigInt(length)) - 1n) << shiftN;
        return (BigInt(snowflake) & bitmask) >> shiftN;
    }

    /**
     * Transform a snowflake into its 64Bit binary string.
     * @param {SnowflakeResolvable} snowflake - Snowflake to transform
     * @returns {string}
     * @private
     */

    static binary (snowflake: SnowflakeResolvable): string {
        const binValue = BigInt(snowflake).toString(2);
        return binValue.length < 64 ? cached64BitZeros.substring(0, 64 - binValue.length) + binValue : binValue;
    }
}

/**
 * Resolvable value types for a valid Snowflake.
 * * string
 * * number
 * * bigint
 * @type {SnowflakeResolvable}
 */

type SnowflakeResolvable = string | number | bigint;

/**
 * Interface of a Snowflake after `Generator.deconstruct()`.
 * @property {bigint} snowflake - Snowflake deconstructed from
 * @property {bigint} timestamp - The timestamp the snowflake was generated
 * @property {bigint} shard_id - The shard_id used when generating
 * @property {bigint} increment - The increment of this snowflake
 * @property {string} binary - The 64Bit snowflake binary string
 * @interface DeconstructedSnowflake
 */

interface DeconstructedSnowflake {
    snowflake: bigint,
    timestamp: bigint,
    shard_id: bigint,
    increment: bigint,
    binary: string
}