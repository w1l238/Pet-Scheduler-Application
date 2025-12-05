# Pet Scheduler Application

React Application to manage pets, clients, appointments, and services.

## Setup

    1. Clone repo
    2. Edit .env in backend folder to setup config
    3. cd ~/backend/ && npm install
    4. node server.js
    5. New Terminal and cd ~/frontend/ && npm install
    6. npm start
    7. Done.

### Issues

For 'Local Storage' error in the frontend change:
    
    "scripts": {
        "start": "react-scripts start",
To
    
    "start": "NODE_OPTIONS='--localstorage-file=~/.local/tmp/Pet-Scheduler-App/localstorage.json' react-scripts start",

### Setup

#### Email Automated Reminders via Cron Job
    
    crontab -e
    */5 * * * * curl -X POST http://localhost:5000/api/reminders/send -H "x-cron-secret: your_super_secret_string_from_env_file_here" >/dev/null 2>&1

This will curl the api/reminders/send address every 5 minutes to automate the reminders.