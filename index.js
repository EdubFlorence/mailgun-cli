import getDomainReasons, { getReasons } from './domain-reasons.mjs';
import { fetchAllEvents } from './fetch-events.mjs';
import fs from 'fs';

const READ_EVENTS_IF_FILE_EXISTS = true;
const OUTPUT_DIR = './output';
const EVENTS_FILE = `${OUTPUT_DIR}/events.json`;
const DOMAINS_FILE = `${OUTPUT_DIR}/domains.json`;
const REASONS_FILE = `${OUTPUT_DIR}/reasons.json`;
let didFetchEvents = false;

console.log("App starting.");

async function getEvents() {

    let events;
    if(READ_EVENTS_IF_FILE_EXISTS
        && fs.existsSync(EVENTS_FILE)) {
    
        console.log(`Reading events from file.`);
        events = JSON.parse(fs.readFileSync(EVENTS_FILE));
    } else {
        events = await fetchAllEvents({
            daysPast: 29
        });
        didFetchEvents = true;
    }

    return events;
}

const events = await getEvents();

const domains = getDomainReasons(events);
const reasons = getReasons(events);

try {
    if(!fs.existsSync(OUTPUT_DIR)){
        fs.mkdirSync(OUTPUT_DIR);
    }
    if(didFetchEvents) {
        fs.writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2));
    }
    fs.writeFileSync(DOMAINS_FILE, JSON.stringify(domains, null, 2));
    fs.writeFileSync(REASONS_FILE, JSON.stringify(reasons, null, 2));
} catch (ex) {
    console.error("Error writing files.");
    console.error(ex);
}
