const cluster = require('cluster');
const merge = require('lite-merge');
let lts = -1;

class SnowflakeGenerator {
    
    /**
     * 
     * @param {Date|Number} epoch - Custom EPOCH timestamp 
     * @param {Number} [total_bits] @default 64 - Number of total bits the Snowflake id should take up
     * @param {Number} [epoch_bits] @default 42 - Number of bits the epoch timestamp should use of the total bits
     * @param {Number} [worker_bits] @default 5 - Number of bits the worker id should use of the total bits
     * @param {Number} [process_bits] @default 5 - Number of bits the process id should use of the total bits
     * @param {Number} [increment_bits] @default 12 - Number of bits the increment should use of the total bits
     */
    
    constructor(epoch, total_bits = 64, epoch_bits = 42, worker_bits = 5, process_bits = 5, increment_bits = 12) {

        /**
         * EPOCH timestamp to generate Snowflakes with
         * @type {Number}
         * @readonly
         */
    
        //if (!(epoch instanceof Date) || (Number.isNaN(epoch) && !(parseInt(epoch)))) throw new TypeError(`Invalid "epoch" timestamp provided, must be a Date instance or number. ${typeof epoch} provided.`);
        Object.defineProperty(this, 'EPOCH', { value: Number.isNaN(epoch) ? new Date(epoch).getTime() : parseInt(epoch), writable: false });
            
        /**
         * Total number of bits a Snowflake id should use
         * @type {Number}
         * @readonly
         */
    
        if (Number.isNaN(total_bits) && !(parseInt(total_bits))) throw new TypeError('Invalid "total_bits" provided, must be a number.');
        Object.defineProperty(this, 'TOTAL_BITS', { value: parseInt(total_bits), writable: false });
    
        /**
         * Number of bits a Snowflakes EPOCH timestamp should use
         * @type {Number}
         * @readonly
         */
    
        if (Number.isNaN(epoch_bits) && !(parseInt(epoch_bits))) throw new TypeError('Invalid "epoch_bits" provided, must be a number.');
        Object.defineProperty(this, 'EPOCH_BITS', { value: parseInt(epoch_bits), writable: false });
    
        /**
         * Maximum possible EPOCH timestamp
         * @type {Number}
         * @readonly
         */
    
        Object.defineProperty(this, 'MAX_EPOCH', { value: new Date(parseInt(Math.pow(2, this.EPOCH_BITS) + this.EPOCH)).getTime(), writable: false });
            
        /**
         * Number of bits a Snowflakes worker id should use
         * @type {Number}
         * @readonly
         */
    
        if (Number.isNaN(worker_bits) && !(parseInt(worker_bits))) throw new TypeError('Invalid "worker_bits" provided, must be a number.');
        Object.defineProperty(this, 'WORKER_BITS', { value: parseInt(worker_bits), writable: false });
    
        /**
         * Maximum possible worker id
         * @type {Number}
         * @readonly
         */
    
        Object.defineProperty(this, 'MAX_WORKER', { value: parseInt(Math.pow(2, this.WORKER_BITS) - 1), writable: false});

        /**
         * Number of bits a Snowflakes process id should use
         * @type {Number}
         * @readonly
         */
    
        if (Number.isNaN(process_bits) && !(parseInt(process_bits))) throw new TypeError('Invalid "process_bits" provided, must be a number.');
        Object.defineProperty(this, 'PID_BITS', { value: parseInt(process_bits), writable: false });
    
        /**
         * Maximum possible process id
         * @type {Number}
         * @readonly
         */
    
        Object.defineProperty(this, 'MAX_PID', { value: parseInt(Math.pow(2, this.PID_BITS) - 1), writable: false });

        /**
         * Number of bits a Snowflakes increment should use
         * @type {Number}
         * @readonly
         */
    
        if (Number.isNaN(increment_bits) && !(parseInt(increment_bits))) throw new TypeError('Invalid "increment_bits" provided, must be a number.');
        Object.defineProperty(this, 'INCREMENT_BITS', { value: parseInt(increment_bits), writable: false });
    
        /**
         * Maximum possible increment
         * @type {Number}
         * @readonly
         */
    
        Object.defineProperty(this, 'MAX_INCREMENT', { value: parseInt(Math.pow(2, this.INCREMENT_BITS)), writable: false });
    
        /**
         * Generators increment count
         * @type {Number}
         */

        Object.defineProperty(this, 'INCREMENT', {
            increment: 0,
            get: function() { return this.increment },
            set: function(inc) {
                if (Number.isNaN(inc) && !parseInt(inc)) throw new TypeError('invalid "increment" provided, must be a number.');
                this.increment = parseInt(inc);
            }
        });
    }

    /**
     * Worker id
     * @type {Number}
     * @readonly
     */

    get WORKER_ID() {
        const id = cluster.isWorker ? parseInt(cluster.worker.id) : 1;
        return id > this.MAX_WORKER ? id & this.MAX_WORKER : id;
    }

    /**
     * Process id
     * @type {Number}
     * @readonly
     */

    get PROCESS_ID() {
        const id = process ? process.pid : 0;
        return id > this.MAX_PID ? id & this.MAX_PID : id;
    }

    /**
     * @typedef {SnowflakeOptions}
     * @property {Date|Number} timestamp - EPOCH timestamp, defaults to current timestamp
     * @property {Number} worker_id - Worker id, defaults to 1
     * @property {Number} process_id - Process id, defaults to 0
     * @property {Number} increment - Increment value
     */

    /**
     * Generate a single Snowflake and returns its instance
     * @param {SnowflakeOptions} [options] - The generators options
     * @returns {Snowflake}
     */

    generate(options = {}) {
        options = merge(options, {
            timestamp: Date.now(),
            worker_id: this.WORKER_ID || 1,
            process_id: this.PROCESS_ID || 0
        });

        let timestamp = Number.isNaN(options.timestamp) ? new Date(options.timestamp).getTime() : options.timestamp;
        if (timestamp < (this.EPOCH + 3)) timestamp = this.EPOCH + 3;
        if (timestamp > this.MAX_EPOCH) throw new Error("The current EPOCH timestamp is too old, please update the generators EPOCH to be something more recent.");

        if (options.increment) this.INCREMENT = parseInt(options.increment);
        else if (timestamp === lts) {
            this.INCREMENT = this.INCREMENT < this.MAX_INCREMENT ? this.INCREMENT + 1 : 0;
            if (this.INCREMENT === 0) timestamp++;
        } else this.INCREMENT = 0;

        lts = timestamp;

        return new Snowflake(this, timestamp, options.worker_id, options.process_id, this.INCREMENT);
    }

    /**
     * Generate a certain amount of Snowflakes and return them all in an array.
     * This method creates Snowflakes using the default generate method but using default variables
     * @param {Number} amount - Number of Snowflakes to generate
     * @param {SnowflakeOptions} [options] - The generator options, "increment" and "timestamp" are used as starting points but are changed when generating snowflakes to avoid duplicates
     * @returns {Promise<Array<Snowflake>>}
     */

    generateMany(amount, options = {}) {
        if ((Number.isNaN(amount) && !(parseInt(amount))) || parseInt(amount) < 1) throw new Error('Invalid "amount" provided, must be number and greater than 0.');
        if (parseInt(amount) === 1) return [this.generate(options)];
        let snowflakes = [];

        // make sure the snowflake generator will provide proper snowflakes
        if (options.timestamp && options.timestamp < (this.EPOCH + 3)) options['timestamp'] = this.EPOCH + 3;

        while(snowflakes.length < parseInt(amount)) {
            snowflakes.push(this.generate(options));

            // if the increment option still exists, delete it so the default generator incrementation takes over
            if (options.increment) delete options.increment;

            // if the timestamp option is set, determine how many times it will need to be changed and change it when needed
            if (options.timestamp) {
                let loops = Math.ceil(parseInt(amount) / this.MAX_INCREMENT);

                // generating more snowflakes than the max increment can produce
                // and the increment counter has been reset to zero..
                if (loops > 1 && this.INCREMENT == 0) {
                    options['timestamp'] = lts;
                }
            }
        }

        return Promise.all(snowflakes);
    }
    
    /**
     * Deconstruct a Snowflake into its stored components using the classes EPOCH timestamp
     * @param {String|Number} snowflake - Snowflake id to deconstruct
     * @returns {Object}
     */

    deconstruct(snowflake) {
        return deconstruct(this.EPOCH, snowflake, this.TOTAL_BITS, this.EPOCH_BITS, this.WORKER_BITS, this.PID_BITS, this.INCREMENT_BITS);
    }
}

class Snowflake {

    /**
     * @param {SnowflakeGenerator} generator - This Snowflakes, Snowflake Generator
     * @param {Number} timestamp - EPOCH timestamp
     * @param {Number} [wid] - Worker ID
     * @param {Number} [pid] - Process ID
     * @param {Number} [inc] - Increment value
     */

    constructor(generator, timestamp, wid, pid, inc) {

        /**
         * The Snowflake generator
         * @type {SnowflakeGenerator}
         * @readonly
         */

        Object.defineProperty(this, 'generator', { value: generator, writable: false });

        /**
         * The Snowflake id
         * @type {String}
         */

        this.snowflake = this._getId(timestamp, wid, pid, inc);

        /**
         * The Snowflake timestamp
         * @type {Number}
         * @readonly
         */
        
        this.timestamp = this.deconstruct().timestamp;
        
        /**
         * The Snowflake worker id
         * @type {Number}
         * @readonly
         */
        
        this.worker_id = this.deconstruct().worker_id;
        
        /**
         * The Snowflake process id
         * @type {Number}
         * @readonly
         */
        
        this.process_id = this.deconstruct().process_id;
        
        /**
         * The Snowflake increment
         * @type {Number}
         * @readonly
         */
        
        this.increment = this.deconstruct().increment;
        
        /**
         * The Snowflake binary code
         * @type {String}
         * @readonly
         */
        
        this.binary = this.deconstruct().binary;
    }

    /**
     * Get the snowflake id of this timestamp, worker id, process id and increment
     * @param {Number} ts - EPOCH timestamp
     * @param {Number} [wid] @default generator.WORKER_ID - Worker ID
     * @param {Number} [pid] @default generator.PROCESS_ID - Process ID
     * @param {Number} [inc] @default generator.INCREMENT - Increment value
     * @returns {String}
     * 
     * @private
     */

    _getId(ts, wid, pid, inc) {
        if (!(wid)) wid = this.generator.WORKER_ID;
        if (!(pid)) pid = this.generator.PROCESS_ID;
        if (!(inc)) inc = this.generator.INCREMENT;

        const BINARY = `${(ts - this.generator.EPOCH).toString(2).padStart(this.generator.EPOCH_BITS, '0')}${wid.toString(2).padStart(this.generator.WORKER_BITS, '0')}${pid.toString(2).padStart(this.generator.PID_BITS, '0')}${inc.toString(2).padStart(this.generator.INCREMENT_BITS, '0')}`;
        return binaryToDec(BINARY);
    }

    deconstruct() {
        return this.generator.deconstruct(this.snowflake);
    }
}

/**
 * Deconstruct a Snowflake and return its components
 * @param {Date|Number} epoch - EPOCH timestamp
 * @param {String|Number} snowflake 
 * @param {Number} total_bits 
 * @param {Number} epoch_bits 
 * @param {Number} worker_bits 
 * @param {Number} process_bits 
 * @param {Number} increment_bits
 * @returns {Object}
 */

function deconstruct(epoch, snowflake, total_bits, epoch_bits, worker_bits, process_bits, increment_bits) {
    if (Number.isNaN(epoch)) epoch = new Date(epoch);
    let errors = [total_bits, epoch_bits, worker_bits, process_bits, increment_bits].filter(b => Number.isNaN(parseInt(b)));
    if (errors.length > 0) throw new TypeError(`${errors.join(', ')} ${errors.length > 1 ? "are not valid numbers" : "is not a valid number"}`);

    const BINARY = decToBinary(snowflake).toString(2).padStart(total_bits, '0');
    let start_substring = (total_bits - increment_bits - process_bits - worker_bits - epoch_bits),
        epoch_substring = (total_bits - increment_bits - process_bits - worker_bits),
        wid_substring = (total_bits - increment_bits - process_bits),
        pid_substring = (total_bits - increment_bits);
    
    const res = {
        timestamp: parseInt(BINARY.substring(start_substring, epoch_substring), 2) + epoch,
        worker_id: parseInt(BINARY.substring(epoch_substring, wid_substring), 2),
        process_id: parseInt(BINARY.substring(wid_substring, pid_substring), 2),
        increment: parseInt(BINARY.substring(pid_substring, total_bits), 2),
        binary: BINARY
    };
    
    Object.defineProperty(res, 'date', {
        get: function get() { return new Date(this.timestamp) },
        enumerable: true
    });
    
    return res;
}

/**
 * Convert a decimal into its binary string
 * @param {String|Number} dec - Decimal to convert
 * @returns {String}
 */

function decToBinary (dec) {
    if (!Number.isNaN(dec)) dec = dec.toString();

    let bin = '',
        high = parseInt(dec.slice(0, -10)) || 0,
        low = parseInt(dec.slice(-10));

    while (low > 0 || high > 0) {
        bin = String(low & 1) + bin;
        low = Math.floor(low / 2);
        if (high > 0) {
            low += 5000000000 * (high % 2);
            high = Math.floor(high / 2);
        }
    };

    return bin;
}

/**
 * Convert binary into its decimal string
 * @param {String|Number} bin - Binary to convert
 * @returns {String}
 */

function binaryToDec (bin) {
    if (!Number.isNaN(bin)) bin = bin.toString();

    let dec = '';

    while(bin.length > 50) {
        let high = parseInt(bin.slice(0, -32), 2),
            low = parseInt((high % 10).toString(2) + bin.slice(-32), 2);

        dec = (low % 10).toString() + dec;
        bin = Math.floor(high / 10).toString(2) + Math.floor(low / 10).toString(2).padStart(32, '0');
    };

    bin = parseInt(bin, 2);
    while (bin > 0) {
        dec = (bin % 10).toString() + dec;
        bin = Math.floor(bin / 10);
    };

    return dec;
}

module.exports = SnowflakeGenerator;
exports.Snowflake = Snowflake;