import fetchEvents from './fetch-events.mjs';

console.log("Hello world.");

const { pages, items: events } = await fetchEvents({
    daysPast: 2
});
console.log(events.length);
