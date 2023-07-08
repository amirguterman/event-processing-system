# Event Processing System

This is a Node.js application that consists of a server that receives events from a client and a data processor that reads the events and updates a database accordingly.

## Setup & Running

1. **Clone the repository to your local machine.**

    ```sh
    git clone https://github.com/amirguterman/event-processing-system.git
    ```

2. **Navigate to the project directory.**

    ```sh
    cd event-processing-system
    ```

3. **Install the necessary dependencies by running:**

    ```sh
    npm install
    ```

4. **Setup the database by running the SQL commands located in the provided SQL file.** 

    ```sh
    psql -h localhost -U postgres -d postgres -f create_table.sql
    ```

    **Note:** The password for the postgres user is `password1!`. You may need to input this password during the execution of the above command.

5. **Update the database connection configurations in `server.js`, `client.js` and `data_processor.js` if needed.**

6. **Start the server**

    ```sh
    node server.js
    ```

7. **Run the client**

    ```sh
    node client.js
    ```

    **Note:** The client script is not a long-running process. It reads the events from the `events.jsonl` file and sends each event to the server, then exits.

8. **Run the data processor**

    ```sh
    node data_processor.js
    ```

    **Note:** The data processor script is not a long-running process. It reads the events from the `server-events.jsonl` file, updates the user revenue data in the database, then exits.

The application will now be running, with the server accepting events at the `/liveEvent` endpoint, the client reading and sending events to the server, and the data processor updating the user revenue data in the database.

## How the System Works

### Server
The server, implemented in Node.js, listens to incoming POST requests at the /liveEvent endpoint. Upon receiving an event, the server logs the event data to a `server-events.jsonl` file. The server also provides a GET endpoint, /userEvents/:userId, which fetches the revenue for a specific user from the PostgreSQL database.

### Client
The client module is responsible for sending events to the server. It reads the events from the `events.jsonl` file and sends each event to the server, then exits.

### Data Processor
The data processor is responsible for processing the logged events and updating the user revenue data in the PostgreSQL database accordingly. It reads the events from the `server-events.jsonl` file, calculates the revenue changes for each user, updates the database, then exits.

## Event Format

The `events.jsonl` file used by the client to send events to the server should be in the following format:

```json
{"userId": "user1", "name": "add_revenue", "value": 100}
{"userId": "user1", "name": "subtract_revenue", "value": 50}
{"userId": "user2", "name": "add_revenue", "value": 200}
```

Each line is a JSON object representing an event, where:

"userId" is the ID of the user.
"name" is the type of event. For this system, the event type can be either "add_revenue" or "subtract_revenue".
"value" is the amount of revenue to be added to or subtracted from the user's total.

Events are separated by newlines (hence the .jsonl extension, indicating the file contains JSON Lines text).