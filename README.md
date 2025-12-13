# Pet Scheduler Application

React Application to manage pets, clients, appointments, and services.

## Baremetal first steps
Make sure you have `git` and `node.js` installed prior to attempting these commands.

Git clone this repo:

    git clone https://github.com/w1l238/Pet-Scheduler-Application

The next step to build this project is to read the documentation for this project, Run the following commands to start the documentation server:

    cd docs/
    npm install
    npm start

This will start the documentation server which should open in your browser and display the documentation. From here you can read the documentation and choose to either install baremetal or through docker-compose.

## Docker first steps
Instead of running baremetal you can install docker and docker-compose and run `docker-compose up --build -d` to run the application. Check the documentation for editing the `docker-compose.yml` file for your configuration.