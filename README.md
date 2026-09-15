# Expense Tracker

Aplicación personal para gestionar y controlar tus gastos. Registra, edita y elimina tus movimientos financieros con una interfaz minimalista y moderna.

**[Ver en vivo](https://expense-tracker-frontend-two-coral.vercel.app)**

## 🚀 Tech Stack

**Backend:**
- Node.js + Express
- TypeScript
- PostgreSQL (Neon)
- JWT Authentication
- Bcrypt (password hashing)

**Frontend:**
- React 18 + TypeScript
- Tailwind CSS
- shadcn/ui components
- Lucide Icons
- Vite

## 📋 Requisitos Previos

- Node.js 18+
- npm
- Una cuenta en Neon (para PostgreSQL en producción)

## 🏠 Correr Localmente

### 1. Clonar el repositorio

```bash
git clone https://github.com/BrunoPacienzia/expense-tracker.git
cd expense-tracker
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Crea un archivo `.env`:
DATABASE_URL_POOLED=postgresql://user:password@host:5432/database
JWT_SECRET=tu_clave_super_secreta_aqui
PORT=5000

Inicia el servidor:
```bash
npm run dev
```

El backend corre en `http://localhost:5000`

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Inicia la app:
```bash
npm run dev
```

La frontend corre en `http://localhost:5173`

## 🔐 Autenticación

La aplicación usa **JWT (JSON Web Tokens)** con expiración de 24 horas. El token se almacena en el `localStorage` del navegador y se envía en cada request protegido.

**Endpoints de auth:**
- `POST /auth/register` - Crear nuevo usuario
- `POST /auth/login` - Iniciar sesión

## 📝 API Endpoints

### Gastos (requieren autenticación)

- `GET /expenses` - Obtener todos los gastos del usuario
- `GET /expenses/:id` - Obtener un gasto específico
- `POST /expenses` - Crear nuevo gasto
- `PUT /expenses/:id` - Actualizar gasto
- `DELETE /expenses/:id` - Eliminar gasto

Todos los endpoints de gastos requieren el header:
Authorization: Bearer <token>

## 📁 Estructura del Proyecto
expense-tracker/
├── backend/
│ ├── server.ts # Servidor Express principal
│ ├── package.json
│ ├── tsconfig.json
│ └── .env # Variables de ambiente (no commitear)
│
├── frontend/
│ ├── src/
│ │ ├── App.tsx # Componente principal
│ │ ├── components/
│ │ │ ├── LoginForm.tsx
│ │ │ ├── RegisterForm.tsx
│ │ │ └── GastosList.tsx
│ │ ├── ui/ # Componentes de shadcn/ui
│ │ ├── index.css
│ │ └── main.tsx
│ ├── package.json
│ ├── vite.config.ts
│ ├── tsconfig.json
│ └── .env.local # Variables de ambiente (no commitear)
│
└── README.md

## 🌐 Deployment

### Backend en Render

1. Pushea el repositorio a GitHub
2. Ve a [Render.com](https://render.com)
3. Crea un nuevo Web Service
4. Conecta tu repo de GitHub
5. Configura:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm run dev`
6. Agrega Environment Variables desde `.env`

### Frontend en Vercel

1. Ve a [Vercel.com](https://vercel.com)
2. Importa tu repositorio de GitHub
3. Configura:
   - Root Directory: `frontend`
   - Framework: React
4. Agrega Environment Variable:
   - `VITE_API_URL` = [Tu URL de Render]
5. Deploy

## ✨ Características

- ✅ Registro de usuarios con validación
- ✅ Login seguro con JWT
- ✅ Crear, leer, actualizar y eliminar gastos
- ✅ Resumen de gastos (total, promedio, cantidad)
- ✅ Interfaz responsiva y minimalista
- ✅ Logout automático al expirar token
- ✅ Validaciones en backend y frontend
- ✅ Tabla de historial de gastos

## 🔧 Scripts Disponibles

### Backend

```bash
npm run dev      # Iniciar en modo desarrollo
npm run build    # Compilar TypeScript
npm run start    # Iniciar en producción
```

### Frontend

```bash
npm run dev      # Iniciar servidor de desarrollo
npm run build    # Build para producción
npm run preview  # Previsualizar build
```

## 🐛 Troubleshooting

**Error: "tsx: not found"**
- Asegúrate que `tsx` esté en `dependencies`, no en `devDependencies`

**Error: "Token inválido"**
- El token expiró (24 horas). Haz logout y login de nuevo.

**CORS errors**
- Verifica que `VITE_API_URL` apunte a la URL correcta del backend

## 📖 Cómo usar la app

1. **Registrate** con un email y contraseña
2. **Inicia sesión** con tus credenciales
3. **Agrega gastos** con descripción, monto y categoría
4. **Edita o elimina** gastos desde la tabla
5. **Mira el resumen** de totales y promedios arriba
6. **Cierra sesión** cuando termines

## 📄 Licencia

Este proyecto es open source y está disponible bajo la licencia MIT.

## 👤 Autor

Bruno Pacienzía - [GitHub](https://github.com/BrunoPacienzia)

---

Hecho con ❤️ como proyecto de aprendizaje en Ingeniería en Sistemas de Información (UTN Facultad Regional Rosario)
