import getDomainReasons, { getReasons, getAsCSV } from './domain-reasons.mjs';
import { fetchAllEvents } from './fetch-events.mjs';
import fs from 'fs';

const READ_EVENTS_IF_FILE_EXISTS = true;
const OUTPUT_DIR = './output';
const EVENTS_FILE = `${OUTPUT_DIR}/events.json`;
const DOMAINS_FILE = `${OUTPUT_DIR}/domains.json`;
const REASONS_FILE = `${OUTPUT_DIR}/reasons.json`;
const DOMAINS_CSV = `${OUTPUT_DIR}/domains.csv`;
let didFetchEvents = false;

console.log("App starting.");

async function getEvents() {

    let events;
    // later, we could theoretically add a date created check
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

const domainReasonOptions = {
    ignoreRecipientErrors: true,
    ignoreMxErrors: true,
    ignoreOld: true
};
const domains = getDomainReasons(events, domainReasonOptions);
const reasons = getReasons(events);
const domainsCSV = getAsCSV(domains);

try {
    if(!fs.existsSync(OUTPUT_DIR)){
        fs.mkdirSync(OUTPUT_DIR);
    }
    if(didFetchEvents) {
        fs.writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2));
    }
    fs.writeFileSync(DOMAINS_FILE, JSON.stringify(domains, null, 2));
    fs.writeFileSync(REASONS_FILE, JSON.stringify(reasons, null, 2));
    fs.writeFileSync(DOMAINS_CSV, domainsCSV);
} catch (ex) {
    console.error("Error writing files.");
    console.error(ex);
}
