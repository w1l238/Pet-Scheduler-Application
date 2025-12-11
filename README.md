# Pet Scheduler Application

React Application to manage pets, clients, appointments, and services.

## First Steps
Make sure you have `git` and `node.js` installed prior to attempting these commands.

Git clone this repo:

    git clone https://github.com/w1l238/Pet-Scheduler-Application

The next step to build this project is to read the documentation for this project, Run the following commands to start the documentation server:

    cd docs/
    npm start

This will start the documentation server which should open in your browser and display the documentation. From here you can read the documentation and choose to either install baremetal or through docker-compose.

<!-- #### Email Automated Reminders via Cron Job
    
    crontab -e
    */5 * * * * curl -X POST http://localhost:5000/api/reminders/send -H "x-cron-secret: your_super_secret_string_from_env_file_here" >/dev/null 2>&1

This will curl the api/reminders/send address every 5 minutes to automate the reminders. -->