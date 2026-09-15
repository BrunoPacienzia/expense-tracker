"use client";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  ArrowUpRight,
  CircleDollarSign,
  LogOut,
  Pencil,
  Plus,
  ReceiptText,
  Trash2,
  X,
} from "lucide-react";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";

interface Gasto {
  gasto_id: number;
  usuario_id: number;
  description: string;
  amount: number;
  category: string;
  date: string | Date;
}

const API_URL = import.meta.env.API_URL || "http://localhost:5000";
const currency = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 2,
});

export default function App() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [editingGasto, setEditingGasto] = useState<Gasto | null>(null);
  const [deletingGasto, setDeletingGasto] = useState<Gasto | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  const handleLogin = (newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setGastos([]);
  };

  const fetchGastos = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/expenses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) return handleLogout();
      const data = await res.json();
      setGastos(data.data ?? []);
    } catch {
      setGastos([]);
    }
  };

  useEffect(() => {
    if (token) fetchGastos();
  }, [token]);

  const resetForm = () => {
    setDescription("");
    setAmount("");
    setCategory("");
    setEditingGasto(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!description.trim() || !amount.trim() || !category.trim()) return;
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0 || !token) return;

    setIsLoading(true);
    const isEditing = editingGasto !== null;
    const url = isEditing
      ? `${API_URL}/expenses/${editingGasto.gasto_id}`
      : `${API_URL}/expenses`;
    try {
      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ description, amount: numericAmount, category }),
      });
      if (res.status === 401) return handleLogout();
      resetForm();
      await fetchGastos();
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (gasto: Gasto) => {
    setEditingGasto(gasto);
    setDescription(gasto.description);
    setAmount(String(gasto.amount));
    setCategory(gasto.category);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async () => {
    if (!deletingGasto || !token) return;
    const res = await fetch(`${API_URL}/expenses/${deletingGasto.gasto_id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) return handleLogout();
    setDeletingGasto(null);
    await fetchGastos();
  };

  const total = useMemo(
    () => gastos.reduce((sum, gasto) => sum + Number(gasto.amount), 0),
    [gastos],
  );
  const average = gastos.length ? total / gastos.length : 0;

  if (!token) {
    return isLogin ? (
      <LoginForm onLogin={handleLogin} setIsLogin={setIsLogin} />
    ) : (
      <RegisterForm onRegister={handleLogin} setIsLogin={setIsLogin} />
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f7f6] text-zinc-950">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-sm">
              <CircleDollarSign className="size-5" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
                Personal finance
              </p>
              <h1 className="text-lg font-semibold tracking-tight">
                Expense tracker
              </h1>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-3.5 py-2 text-sm font-medium text-zinc-600 transition hover:border-zinc-950 hover:bg-zinc-950 hover:text-white focus:outline-none focus:ring-2 focus:ring-zinc-300"
            type="button"
          >
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
        <section className="mb-9 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-sm font-medium text-zinc-500">
              Resumen de actividad
            </p>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              Tus gastos
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              Controlá tus finanzas de forma simple y clara.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <span className="size-2 rounded-full bg-emerald-500" /> Datos
            actualizados
          </div>
        </section>

        <section className="mb-8 grid gap-4 sm:grid-cols-3">
          <SummaryCard
            label="Gasto total"
            value={currency.format(total)}
            icon={<CircleDollarSign />}
          />
          <SummaryCard
            label="Movimientos"
            value={String(gastos.length).padStart(2, "0")}
            icon={<ReceiptText />}
          />
          <SummaryCard
            label="Promedio por gasto"
            value={currency.format(average)}
            icon={<ArrowUpRight />}
          />
        </section>

        <section className="mb-8 rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)] sm:p-7">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                {editingGasto ? "Editar movimiento" : "Nuevo movimiento"}
              </p>
              <h3 className="mt-1 text-xl font-semibold tracking-tight">
                {editingGasto ? "Actualizá el gasto" : "Agregá un gasto"}
              </h3>
            </div>
            {editingGasto && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-1 text-sm font-medium text-zinc-500 hover:text-zinc-950"
              >
                <X className="size-4" /> Cancelar
              </button>
            )}
          </div>
          <form
            onSubmit={handleSubmit}
            className="grid gap-4 lg:grid-cols-[1.6fr_1fr_1fr_auto] lg:items-end"
          >
            <Field
              label="Descripción"
              value={description}
              onChange={setDescription}
              placeholder="Ej. Suscripción mensual"
            />
            <Field
              label="Monto"
              value={amount}
              onChange={setAmount}
              placeholder="0,00"
              type="number"
            />
            <Field
              label="Categoría"
              value={category}
              onChange={setCategory}
              placeholder="Ej. Entretenimiento"
            />
            <button
              disabled={isLoading}
              type="submit"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-zinc-950 px-5 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="size-4" />{" "}
              {editingGasto ? "Guardar cambios" : "Agregar gasto"}
            </button>
          </form>
        </section>

        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-5 sm:px-7">
            <div>
              <h3 className="text-lg font-semibold tracking-tight">
                Historial de gastos
              </h3>
              <p className="mt-1 text-sm text-zinc-500">
                Todos tus movimientos recientes.
              </p>
            </div>
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600">
              {gastos.length} {gastos.length === 1 ? "registro" : "registros"}
            </span>
          </div>
          {gastos.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <ReceiptText className="mx-auto size-9 text-zinc-300" />
              <p className="mt-4 font-medium text-zinc-700">
                Todavía no hay gastos registrados
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                Agregá tu primer movimiento para comenzar.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left">
                <thead className="bg-zinc-50 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                  <tr>
                    <th className="px-5 py-3.5 sm:px-7">Descripción</th>
                    <th className="px-5 py-3.5">Categoría</th>
                    <th className="px-5 py-3.5">Monto</th>
                    <th className="px-5 py-3.5 text-right sm:px-7">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {gastos.map((gasto) => (
                    <tr
                      key={gasto.gasto_id}
                      className="group transition hover:bg-zinc-50/70"
                    >
                      <td className="px-5 py-5 font-medium text-zinc-800 sm:px-7">
                        {gasto.description}
                      </td>
                      <td className="px-5 py-5">
                        <span className="rounded-md border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600">
                          {gasto.category}
                        </span>
                      </td>
                      <td className="px-5 py-5 font-semibold text-zinc-900">
                        {currency.format(Number(gasto.amount))}
                      </td>
                      <td className="px-5 py-5 sm:px-7">
                        <div className="flex justify-end gap-1">
                          <IconButton
                            label="Editar gasto"
                            onClick={() => handleEdit(gasto)}
                          >
                            <Pencil />
                          </IconButton>
                          <IconButton
                            label="Eliminar gasto"
                            destructive
                            onClick={() => setDeletingGasto(gasto)}
                          >
                            <Trash2 />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {deletingGasto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 px-5 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl">
            <div className="mb-5 flex size-11 items-center justify-center rounded-full bg-zinc-100 text-zinc-700">
              <Trash2 className="size-5" />
            </div>
            <h2
              id="delete-title"
              className="text-xl font-semibold tracking-tight"
            >
              ¿Eliminar este gasto?
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Se eliminará{" "}
              <strong className="font-semibold text-zinc-800">
                {deletingGasto.description}
              </strong>{" "}
              de tu historial. Esta acción no se puede deshacer.
            </p>
            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeletingGasto(null)}
                className="rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-lg bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700"
              >
                Eliminar gasto
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
      <div className="mb-6 flex items-center justify-between text-zinc-400">
        <span className="text-sm font-medium">{label}</span>
        <span className="flex size-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700">
          {icon}
        </span>
      </div>
      <p className="text-2xl font-semibold tracking-tight text-zinc-950">
        {value}
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-zinc-700">
        {label}
      </span>
      <input
        required
        type={type}
        min={type === "number" ? "0" : undefined}
        step={type === "number" ? "0.01" : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3.5 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-200"
      />
    </label>
  );
}

function IconButton({
  children,
  label,
  onClick,
  destructive = false,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`flex size-9 items-center justify-center rounded-lg transition focus:outline-none focus:ring-2 focus:ring-zinc-300 ${destructive ? "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-950" : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-950"}`}
    >
      {children}
    </button>
  );
}
