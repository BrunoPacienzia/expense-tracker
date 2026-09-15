CREATE TABLE usuarios (
    usuario_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255)
);

CREATE TABLE gastos (
    gasto_id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES usuarios(usuario_id),
    description VARCHAR(255),
    amount DECIMAL(10,2),
    category VARCHAR(50),
    date TIMESTAMP 
);