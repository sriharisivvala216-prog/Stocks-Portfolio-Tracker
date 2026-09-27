
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS portfolio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    company_symbol VARCHAR(10) NOT NULL,
    company_name VARCHAR(100) NOT NULL,
    transaction_type ENUM('BUY', 'SELL') NOT NULL,
    quantity FLOAT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);



select * from portfolio;