import formData from 'form-data';
import Mailgun from 'mailgun.js';
import dotenv from 'dotenv';
dotenv.config();

const DOMAIN = 'researchbinders.com';
const API_KEY = process.env.MAILGUN_KEY;

const mailgun = new Mailgun(formData);
const client = mailgun.client({ username: 'api', key: API_KEY });

export default async function fetchEvents(options) {

    try {
        // const date = new Date(2021, 10, 1, 0, 0, 0, 0); // Mon Nov 01 2021 00:00:00 GMT+0200
        const date = new Date();
        date.setDate(date.getDate() - options.daysPast || 0);
  
        const events = await client.events.get(DOMAIN, {
          begin: date.toGMTString(), // Sun, 31 Oct 2021 22:00:00 GMT
          ascending: 'yes',
          event: 'failed',
          limit: 5
        });

        return events;

    } catch (error) {
        console.error(error);
    }

    return null;
};
