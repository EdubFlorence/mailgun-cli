function abbreviateReason(reason) {

    const errorCodes = [
        '5.1.1 The email account that you tried to reach does not exist.',
        '5.1.10 RESOLVER.ADR.RecipientNotFound',
        '5.2.1 The email account that you tried to reach is disabled.',
        '5.2.2 mailbox full',
        '5.4.1 Recipient address rejected: Access denied.',
        '5.4.14 Hop count exceeded - possible mail loop ATTR34',
        '5.5.0 Requested action not taken: mailbox unavailable',
        '550 DMARC Sender Invalid - envelope rejected',
    ]
    errorCodes.forEach(errorCode => {
        if(reason.indexOf(errorCode) > -1) {
            reason = errorCode;
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
