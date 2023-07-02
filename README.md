# Event Processing System

This project consists of a server that receives events from a client, a client that sends events to the server, and a data processor that reads the events and updates a database accordingly.

## Server

The server is an Express.js application that listens for POST requests at the `/liveEvent` endpoint. When it receives a request, it appends the event data to a file named `events.jsonl`. Every minute, the server renames this file to include a timestamp, allowing the data processor to process the events in the file.

The server also provides a GET endpoint at `/userEvents/:userId` which fetches the revenue data for a specific user from the database.

## Client

The client reads events from a file named `events.jsonl` and sends each event to the server.

## Data Processor

The data processor reads all event files in the current directory, calculates the revenue for each user, and updates the database accordingly.

## Setup

1. Install the necessary dependencies by running `npm install`.
2. Update the PostgreSQL configuration in `server.js` and `data_processor.js`.
3. Start the server by running `node server.js`.
4. Send events from the client by running `node client.js`.
5. Process the events by running `node data_processor.js`.

## Note

The `events.jsonl` file used by the client and server should be in the following format:

```json
{"userId": "user1", "name": "add_revenue", "value": 100}
{"userId": "user1", "name": "subtract_revenue", "value": 50}
{"userId": "user2", "name": "add_revenue", "value": 200}
```

Each line represents an event. The userId field is the ID of the user the event is associated with. The name field is the type of the event, which can be either add_revenue or subtract_revenue. The value field is the amount of revenue to add or subtract.

