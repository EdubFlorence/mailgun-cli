import { fetchAllEvents } from './fetch-events.mjs';

console.log("App starting.");

function getDomain(event) {

    let recipientEmails = event.envelope.targets;
    if(!Array.isArray(recipientEmails)) {
        recipientEmails = [recipientEmails];
    }

    recipientEmails.forEach(email => {

        const domain = email.split('@')[1];
        return domain;
    });

}

const events = await fetchAllEvents({
    daysPast: 1
});

const domains = {};
events.forEach(event => {

    const domain = event['recipient-domain'];

    if(!domain.length) {
        console.warn(`No domain for event.`);
        return;
    }

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

console.log('');
console.log(`Domains:`, domains);
