export class Generator {
    public constructor(epoch?: Date|number, shard_id?: number);

    public epoch: number;
    public shard_id: number;
    public increment: number;

    private _generate(generator: Generator, timestamp: number): bigint;
    public generate(amount: number, timestamp: Date|number): bigint | bigint[];
    
    private _deconstruct(generator: Generator, snowflake: SnowflakeResolvable): DeconstructedSnowflake;
    public deconstruct(snowflake: SnowflakeResolvable | SnowflakeResolvable[]): DeconstructedSnowflake | DeconstructedSnowflake[];

    private extractBits(snowflake: SnowflakeResolvable, shift: number | bigint, length: number | bigint): bigint;
    private binary(snowflake: SnowflakeResolvable): string;
}

export type SnowflakeResolvable = string | number | bigint;

export interface DeconstructedSnowflake {
    snowflake: bigint;
    timestamp: bigint;
    shard_id: bigint;
    increment: bigint;
    binary: string
}