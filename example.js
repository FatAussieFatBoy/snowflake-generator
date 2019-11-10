let started = Date.now(),
    duplicates = (array) => { return array.reduce((acc, el, i, arr) => { if (arr.indexOf(el) !== i && acc.indexOf(el) < 0) acc.push(el); return acc; }, [])}

const SnowflakeGenerator = require('./index');
const Generator = new SnowflakeGenerator(started);

Generator.generateMany(1000).then(snowflakes => {
    let duration = Date.now() - started;
    let dups = duplicates(snowflakes);

    console.log(snowflakes);
    console.log(`Generated ${snowflakes.length} Snowflakes in ${duration} ms. with ${dups.length} duplicates`, dups.join(', '));
});