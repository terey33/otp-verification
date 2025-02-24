# OTP Verification 

OTP verification using Node.js, Express and Nodemailer

1. Clone the repo

2. Install dependencies
````sh
npm install

````

3. Create a .env file and add your email credentials (the mail id from which you want to send the otp's)

You'll need to enable two-step verification on this account and create an app password, which must be entered here

````env
EMAIL=your-email@example.com
PASSWORD=your-password
````

4. Start the server

````sh
node index.js
````
