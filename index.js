import formData from 'form-data';
import Mailgun from 'mailgun.js';
import dotenv from 'dotenv';
dotenv.config();

const DOMAIN = 'researchbinders.com';
const API_KEY = process.env.MAILGUN_KEY;
console.log(API_KEY);

const mailgun = new Mailgun(formData);
const client = mailgun.client({ username: 'api', key: API_KEY });

console.log("Client established, probably.");

(async () => {
    try {
      // const date = new Date(2021, 10, 1, 0, 0, 0, 0); // Mon Nov 01 2021 00:00:00 GMT+0200
      const date = new Date();
      date.setDate(date.getDate() - 2);

      const events = await client.events.get(DOMAIN, {
        begin: date.toGMTString(), // Sun, 31 Oct 2021 22:00:00 GMT
        ascending: 'yes',
        limit: 5
      });
      console.log('events', events)
    } catch (error) {
        console.error(error);
    }
  })();
