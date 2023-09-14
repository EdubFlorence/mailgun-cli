import fetchEvents from './fetch-events.mjs';

console.log("Hello world.");

const { pages, items: events } = await fetchEvents();
console.log(events.length);
