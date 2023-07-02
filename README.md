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

6. **Start the application**

    ```sh
    npm start
    ```

The application will now be running, with the server accepting events at the `/liveEvent` endpoint, the client reading and sending events to the server, and the data processor updating the user revenue data in the database.

## Note

The `events.jsonl` file used by the client to send events to the server will be created automatically and should be in the following format:

```json
{"userId": "user1", "name": "add_revenue", "value": 100}
{"userId": "user1", "name": "subtract_revenue", "value": 50}
{"userId": "user2", "name": "add_revenue", "value": 200}
