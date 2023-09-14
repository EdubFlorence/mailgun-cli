import getDomainReasons from './domain-reasons.mjs';
import { fetchAllEvents } from './fetch-events.mjs';
import fs from 'fs';

console.log("App starting.");

const events = await fetchAllEvents({
    daysPast: 1
});

const domains = getDomainReasons(events);

fs.writeFileSync('./domains.json', JSON.stringify(domains, null, 2));
