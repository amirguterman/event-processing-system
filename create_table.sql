CREATE TABLE users_revenue (
    user_id VARCHAR(255) PRIMARY KEY,
    revenue NUMERIC NOT NULL
);

CREATE TABLE processed_batches (
    batch_name VARCHAR(255) PRIMARY KEY
);
