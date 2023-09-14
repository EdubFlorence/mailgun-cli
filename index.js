import getDomainReasons from './domain-reasons.mjs';
import { fetchAllEvents } from './fetch-events.mjs';
import fs from 'fs';

console.log("App starting.");

// TODO: if events file exists, allow to read from that instead
const events = await fetchAllEvents({
    daysPast: 29
});

const domains = getDomainReasons(events);

try {
    if(!fs.existsSync('./output')){
        fs.mkdirSync('./output');
    }
    fs.writeFileSync('./output/events.json', JSON.stringify(events, null, 2));
    fs.writeFileSync('./output/domains.json', JSON.stringify(domains, null, 2));
} catch (ex) {
    console.error("Error writing files.");
    console.error(ex);
}
