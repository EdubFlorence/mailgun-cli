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

function abbreviateReason(reason) {

    const prefixes = [
        'smtp;554 5.4.14 Hop count exceeded - possible mail loop ATTR34',
        'smtp; 550 5.4.1 Recipient address rejected: Access denied',
        '5.1.1 The email account that you tried to reach does not exist.'
    ];
    prefixes.forEach(prefix => {
        if(reason.startsWith(prefix)) {
            // reason = reason.replace(prefix, '');
            reason = reason.substring(0, prefix.length);
        }
    });

    return reason;
}

export default function getDomainReasons(events) {

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
        const reason = abbreviateReason(message);
        if(!domains[domain]) {
            domains[domain] = {
                reasons: []
            };
        }
        if(!domains[domain].reasons.includes(reason)) {
            domains[domain].reasons.push(reason);
        }
    });

    return domains;
}
