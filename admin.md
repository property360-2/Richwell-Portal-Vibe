CREATE USER 'admin' IDENTIFIED BY '1234';
GRANT ALL PRIVILEGES ON richwell_portal.* TO 'richwell_user'@'localhost';
FLUSH PRIVILEGES;
