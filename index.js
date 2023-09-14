import fetchEvents from './fetch-events.mjs';

console.log("App starting.");

// TODO: loop through pages and gather all events
const { pages, items: events } = await fetchEvents({
    daysPast: 2
});

const domains = {};
events.forEach(event => {

    let recipientEmails = event.envelope.targets;
    if(!Array.isArray(recipientEmails)) {
        recipientEmails = [recipientEmails];
    }
    recipientEmails.forEach(email => {

        const domain = email.split('@')[1];
        const message = event['delivery-status']?.description 
            || event['delivery-status']?.message 
            || '';
        if(!domains[domain]) {
            domains[domain] = {
                reasons: []
            };
        } 
        if(!domains[domain].reasons.includes(message)) {
            domains[domain].reasons.push(message);
        }
    });
});

console.log(`Domains:`, domains);
