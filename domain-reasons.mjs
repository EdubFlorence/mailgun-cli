function abbreviateReason(reason) {

    const errorCodes = [
        'unable to connect to MX servers',
        '5.1.1 The email account that you tried to reach does not exist.',
        '5.1.10 RESOLVER.ADR.RecipientNotFound',
        '5.2.1 The email account that you tried to reach is disabled.',
        '5.2.2 mailbox full',
        '5.4.1 Recipient address rejected: Access denied.',
        '5.4.12 smtp; hop count exceeded - possible mail loop',
        '5.4.14 Hop count exceeded - possible mail loop',
        '5.5.0 Requested action not taken: mailbox unavailable',
        '5.7.1 transport.rules.rejectmessage; the message was rejected by organization policy',
        '550 DMARC Sender Invalid - envelope rejected',
        '550 5.7.1 this message failed dmarc evaluation of domain researchbinders.com',
        'please turn on smtp authentication in your mail client',
    ]
    errorCodes.forEach(errorCode => {
        if(reason.toLowerCase().indexOf(errorCode.toLowerCase()) > -1) {
            reason = errorCode;
        }
    });

    return reason;
}

function getReason(event) {

    const message = event['delivery-status']?.description 
    || event['delivery-status']?.message 
    || '';
    const reason = abbreviateReason(message);

    return reason;
}

// TODO: These can probably be refactored as a flag on the event itself, rather than doing it this way
function reasonIsIndividual(reason) {

    return reasonIsUserNotFound(reason)
    || reason == "not delivering to previously bounced address"
    || reason.indexOf('may not exist') > -1
}

function reasonIsUserNotFound(reason) {

    return reason.indexOf('user unknown') > -1
            || reason.indexOf('user not known') > -1
            || reason.indexOf('mailbox unavailable') > -1
            || reason.indexOf('mailbox full') > -1
            || reason.indexOf('mailbox not found') > -1
            || reason.indexOf('mailbox does not exist') > -1
            || reason.indexOf('mailbox is disabled') > -1

            || reason.indexOf('addressee unknown') > -1
            || reason.indexOf('unroutable address') > -1
            || reason.indexOf('recipient not found') > -1
            || reason.indexOf('invalid recipient') > -1
            || reason.indexOf('no such recipient') > -1
            || reason.indexOf('no such person') > -1
            || reason.indexOf('no such user') > -1
            || reason.indexOf('address rejected') > -1
            || reason.indexOf('recipientnotfound') > -1
            || reason.indexOf('over quota') > -1
            || reason.indexOf('recipient rejected') > -1
            || reason.indexOf('email account that you tried to reach is disabled') > -1
            || reason.indexOf('is not a valid user') > -1
            || reason.indexOf('user does not exist') > -1
            || reason.indexOf('intended recipients no longer have') > -1
            || reason.indexOf('email account that you tried to reach does not exist') > -1
            || reason.indexOf('5.4.1 ') > -1
            || reason.indexOf('5.1.0 ') > -1
            || reason.indexOf('5.1.1 ') > -1
            || reason.indexOf('5.1.10 ') > -1
            || reason.indexOf('5.2.0 ') > -1
            || reason.indexOf('5.2.1 ') > -1
            || reason.indexOf('5.2.2 ') > -1
            || reason.indexOf('5.5.1 ') > -1
            || reason.indexOf('5.7.1 ') > -1;
}

function shouldIgnoreReason(reason, options) {

    if(options?.ignoreRecipientErrors == true && reasonIsIndividual(reason)) {
        return true;
    }

    if(options?.ignoreMxErrors == true && reasonIsMx(reason)) {
        return true;
    }

    if(options?.ignoreOld == true && reason == "too old") {
        return true;
    }

    return false;
}

/**
 * 
 * @param {Array} events 
 * @param {Object} options 
 * @param {Boolean} options.ignoreRecipientErrors
 * @param {Boolean} options.ignoreMxErrors
 * @param {Boolean} options.ignoreOld
 * @returns 
 */
export default function getDomainReasons(events, options) {

    const domains = {};
    events.forEach(event => {
    
        const domain = event['recipient-domain'];
        const reason = getReason(event).toLowerCase().trim();

        if(!reason || reason.length < 1) return;

        if(shouldIgnoreReason(reason, options)) return;

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

function reasonIsMx(reason) {

    return reason == "unable to connect to mx servers"
        || reason.indexOf("no mx for") > -1
        || reason.indexOf('hop count exceeded') > -1
        || reason.indexOf("delivery loop") > -1;
}

export function getReasons(events) {

    const reasons = {};
    events.forEach(event => {
    
        const domain = event['recipient-domain'];
        let reason = getReason(event).toLowerCase();

        if(reason.indexOf(' mx for ') > -1
        || reason.indexOf('unable to connect to mx servers') > -1) {
            reason = 'no mx';
        }

        if(reasonIsUserNotFound(reason)
            || reason.indexOf('this is the mail system at host') > -1
            || reason.length == 0) {
            return;
        }

        if(!reasons[reason]) {
            reasons[reason] = {
                domains: []
            };
        }

        if(!reasons[reason].domains.includes(domain)) {
            reasons[reason].domains.push(domain);
        }
    });

    return reasons;
}

export function getAsCSV(domains) {

    const domainNames = Object.keys(domains);
    let csvString = 'domain,reason\n';

    domainNames.forEach(domainName => {
        const domain = domains[domainName];
        domain.reasons.forEach(reason => {
            csvString += `${domainName},\"${reason}\"\n`;
        });
    });

    return csvString;
}
