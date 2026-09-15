import express from "express";
import { Pool } from "pg";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user_id?: number;
    }
  }
}

dotenv.config(); //para que se pueda usar el archivo .env

const app = express();
const port = 5000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL_POOLED,
}); //Mantiene un "pool" de conexiones disponibles

app.use(express.json());
app.use(cors());

const authMiddleware = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Token requerido" });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!,
    ) as jwt.JwtPayload & {
      user_id: number;
    };
    req.user_id = decoded.user_id;
    next();
  } catch (error) {
    res.status(401).json({ error: "Token inválido" });
  }
};

app.get("/health", (req, res) => {
  res.send({ status: "OK" });
});

app.get("/db-test", async (req, res) => {
  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    res.send({ status: "OK" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ status: "Error" });
  }
});

app.get("/expenses", authMiddleware, async (req, res) => {
  try {
    const user_id = req.user_id;
    const client = await pool.connect();
    const result = await client.query(
      "SELECT * FROM gastos WHERE usuario_id = $1",
      [user_id],
    );
    client.release();
    res.json({ data: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).send({ status: "Error" });
  }
});

app.get("/expenses/:id", authMiddleware, async (req, res) => {
  try {
    const user_id = req.user_id;
    const id = req.params.id;
    const client = await pool.connect();
    const result = await client.query(
      "SELECT * FROM gastos where gasto_id = $1 and usuario_id = $2",
      [id, user_id],
    );
    client.release();
    res.json({ data: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).send({ status: "Error" });
  }
});

app.post("/expenses", authMiddleware, async (req, res) => {
  try {
    const { description, amount, category } = req.body;
    const user_id = req.user_id;
    if (!description || !amount || !category) {
      res.status(400).json({ error: "Todos los campos son requeridos" });
      return;
    }

    const amountNum = Number(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      res.status(400).json({ error: "El monto debe ser un número positivo" });
      return;
    }
    const client = await pool.connect();
    await client.query(
      "INSERT INTO gastos (usuario_id, description, amount, category) VALUES($1,$2,$3,$4)",
      [user_id, description, amount, category],
    );
    client.release();
    res.json({ message: "Gasto creado" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ status: "Error" });
  }
});

app.put("/expenses/:id", authMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    const user_id = req.user_id;
    const { description, amount, category } = req.body;
    if (!description || !amount || !category) {
      res.status(400).json({ error: "Todos los campos son requeridos" });
      return;
    }

    const amountNum = Number(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      res.status(400).json({ error: "El monto debe ser un número positivo" });
      return;
    }
    const client = await pool.connect();
    await client.query(
      "UPDATE gastos SET description = $1, amount = $2, category = $3 WHERE gasto_id = $4 and usuario_id = $5",
      [description, amount, category, id, user_id],
    );
    client.release();
    res.json({ message: "Gasto modificado" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ status: "Error" });
  }
});

app.delete("/expenses/:id", authMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    const user_id = req.user_id;
    const client = await pool.connect();
    await client.query(
      "DELETE FROM gastos WHERE gasto_id = $1 and usuario_id = $2",
      [id, user_id],
    );
    client.release();
    res.json({ message: "Gasto borrado" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ status: "Error" });
  }
});

app.post("/auth/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email y contraseña son requeridos" });
      return;
    }

    if (!email.includes("@")) {
      res.status(400).json({ error: "Email inválido" });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: "Contraseña mínimo 6 caracteres" });
      return;
    }
    const hashed_password = await bcrypt.hash(password, 10);
    const client = await pool.connect();
    const result = await client.query(
      "INSERT INTO usuarios (email, password) VALUES($1,$2) RETURNING usuario_id",
      [email, hashed_password],
    );
    const user = result.rows[0];
    client.release();
    const token = jwt.sign(
      { user_id: user.usuario_id },
      process.env.JWT_SECRET!,
      { expiresIn: "24h" },
    );
    res.json({ token });
  } catch (error: any) {
    if (error.code == "23505") {
      //error de PK duplicada
      res.status(409).json({ error: "email ya existe" });
    } else {
      console.error(error);
      res.status(500).send({ status: "Error" });
    }
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email y contraseña son requeridos" });
      return;
    }

    if (!email.includes("@")) {
      res.status(400).json({ error: "Email inválido" });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: "Contraseña mínimo 6 caracteres" });
      return;
    }
    const client = await pool.connect();
    const result = await client.query(
      "SELECT * FROM usuarios WHERE email = $1",
      [email],
    );
    if (result.rows.length == 0) {
      res.status(404).json({ error: "Usuario no encontrado" });
      return;
    }
    const user = result.rows[0];
    if (!(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ error: "Contraseña incorrecta" });
      return;
    }
    const token = jwt.sign(
      { user_id: user.usuario_id },
      process.env.JWT_SECRET!,
      { expiresIn: "24h" },
    );
    client.release();
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).send({ status: "Error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
