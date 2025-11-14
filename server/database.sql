
CREATE TABLE usertbl (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    role ENUM('customer', 'receptionist', 'owner') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO `usertbl` (`username`, `email`, `phone`, `password`, `role`, `created_at`) VALUES ('receptionist', 'receptionist@mail.com', NULL, '$2a$12$KSbauU6r3jbjf61r/ghyHefQ5zQ/neHEcJk75tDe6eGjARjm5QfE2', 'receptionist', NOW()), ('owner', 'owner@mail.com', NULL, '$2a$12$KSbauU6r3jbjf61r/ghyHefQ5zQ/neHEcJk75tDe6eGjARjm5QfE2', 'owner', NOW());
