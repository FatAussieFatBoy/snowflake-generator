let started = Date.now(),
    duplicates = (array) => { return array.reduce((acc, el, i, arr) => { if (arr.indexOf(el) !== i && acc.indexOf(el) < 0) acc.push(el); return acc; }, [])}

const SnowflakeGenerator = require('./index');
const Generator = new SnowflakeGenerator(started);

const args = process.argv.splice(2);
const amount = parseInt(args[args.indexOf('-amount') + 1]) || 1000;

Generator.generateMany(amount).then(snowflakes => {
    let ids = [];
    for(let snowflake of snowflakes) {
        ids.push(snowflake.snowflake);
    }

    console.log("\x1b[33m%s\x1b[0m", 'Checking for duplicates.. this can take a while..');
    let duration = Date.now() - started;
    let dups = duplicates(ids);

    console.log('Generated', "\x1b[42m\x1b[30m", snowflakes.length, '\x1b[0m Snowflakes in', "\x1b[42m\x1b[30m", `${duration} ms.`, '\x1b[0m with', "\x1b[42m\x1b[30m", dups.length, '\x1b[0m duplicates');
    if (dups.length > 0) {
        console.log(dups.join(', '));
        for (let dup of dups) {
            console.log(snowflakes.filter(e => e.snowflake == dup));
        }
    }
});