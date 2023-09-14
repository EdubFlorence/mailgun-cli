import formData from 'form-data';
import Mailgun from 'mailgun.js';
import dotenv from 'dotenv';
dotenv.config();

const DOMAIN = 'researchbinders.com';
const API_KEY = process.env.MAILGUN_KEY;

const DEFAULT_EVENT_LIMIT = 300;    // this also happens to be the max :)

const mailgun = new Mailgun(formData);
const client = mailgun.client({ username: 'api', key: API_KEY });

// detailed event data not retained longer than 30 days
export default async function fetchPagedEvents(options) {

    try {
        // const date = new Date(2021, 10, 1, 0, 0, 0, 0); // Mon Nov 01 2021 00:00:00 GMT+0200
        const beginDate = new Date();
        beginDate.setDate(beginDate.getDate() - options.daysPast || 0);
        // TODO: allow specify in options
        const endDate = new Date();
  
        const mailgunOptions = {
            begin: beginDate.toGMTString(), // Sun, 31 Oct 2021 22:00:00 GMT
            end: endDate.toGMTString(),
            // ascending: 'yes',
            event: 'failed',
            severity: 'permanent',
            limit: options.limit || DEFAULT_EVENT_LIMIT
          };
          let events;
          if(options.page) {
            events = await client.events.get(DOMAIN, options);
            console.log(`${events.items.length} events on next page.`);
          } else {
            events = await client.events.get(DOMAIN, mailgunOptions);
            console.log(`Fetched ${events.items.length} events for ${beginDate}.`);
          }
        
        return events;

    } catch (error) {
        console.error(error);
    }

    return null;
};

export async function fetchAllEvents(options) {

    console.log('');
    console.log(`Fetching all events ...`);

    let iterationCount = 1;
    const allEvents = [];
    let events = await fetchPagedEvents(options);
    allEvents.push(...events.items);
    while(events?.pages?.next) {

        // stop if we happened to have run out of events
        if(events.items.length === 0) {
            console.log(`Retrieved 0 items. Stopping.`);
            break;
        }

        iterationCount++;
        events = await fetchPagedEvents({
            page: events.pages.next.page
        });
        allEvents.push(...events.items);

        // stop if there's (hopefully) no more events to grab
        if(events.items.length < (options.limit || DEFAULT_EVENT_LIMIT)) {
            console.log(`Retrieved ${events.items.length}. Stopping.`);
            break;
        }
    }

    console.log(`${iterationCount} iterations retrieved ${allEvents.length} total events.`);
    return allEvents;
}
