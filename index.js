const DOMAIN = 'researchbinders.com';

import formData from 'form-data';
import { Mailgun } from "mailgun";

const mailgun = new Mailgun(formData);
// const client = mailgun.client({ username: 'api', key: 'YOUR_API_KEY' || '' });

console.log("Hello world.");