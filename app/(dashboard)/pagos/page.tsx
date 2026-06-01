"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, X, DollarSign, Calendar, Clock, CheckCircle, AlertCircle, CreditCard, GraduationCap, Layers, ChevronRight } from "lucide-react";
import { getEnrollmentsWithDebt, getPaymentDetail, registerPayment } from "@/lib/actions/pagos";

type EnrollmentInfo = {
  enrollmentId: number; studentId: number;
  studentName: string | null; studentLastname: string | null; studentDni: string | null;
  groupCodigo: string | null; courseName: string | null;
  montoCurso: string; montoMatricula: string;
  modalidadPago: string | null;
  totalPagado: number;
};

type Detail = {
  enrollment: {
    id: number; studentId: number;
    montoCurso: string; montoMatricula: string;
    studentName: string | null; studentLastname: string | null; studentDni: string | null;
    groupCodigo: string | null; courseName: string | null;
    modalidadPago: string | null;
  };
  cuotas: { id: number; numeroCuota: number; monto: string; fechaVencimiento: string; estado: string }[];
  historial: { id: number; fechaPago: string; monto: string; metodoPago: string | null; observacion: string | null }[];
  total: number;
  pagado: number;
  pendiente: number;
} | null;

const inp = "flex h-10 w-full rounded-xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.18_0.003_85)] px-4 text-sm text-[oklch(0.92_0.003_85)] outline-none focus:border-[oklch(0.72_0.12_85/0.5)] transition-all";
const sf = "flex h-10 rounded-xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.18_0.003_85)] px-4 text-sm text-[oklch(0.92_0.003_85)] outline-none focus:border-[oklch(0.72_0.12_85/0.5)] transition-all";
const btn = "flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[oklch(0.72_0.12_85)] px-4 text-sm font-semibold text-white transition-all hover:bg-[oklch(0.68_0.13_83)] active:scale-[0.98] cursor-pointer shadow-md shadow-[oklch(0.72_0.12_85/0.2)]";
const L = "text-[11px] uppercase tracking-wider font-medium text-[oklch(0.58_0.008_70)]";

export default function PagosPage() {
  const [enrollments, setEnrollments] = useState<EnrollmentInfo[]>([]);
  const [detail, setDetail] = useState<Detail>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [payOpen, setPayOpen] = useState(false);
  const [payMonto, setPayMonto] = useState("");
  const [payMetodo, setPayMetodo] = useState("");
  const [payFecha, setPayFecha] = useState(new Date().toISOString().split("T")[0]);
  const [payObservacion, setPayObservacion] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    const data = await getEnrollmentsWithDebt();
    setEnrollments(data as EnrollmentInfo[]);
  }

  async function selectEnrollment(enrollmentId: number) {
    setSelectedId(enrollmentId);
    const d = await getPaymentDetail(enrollmentId);
    setDetail(d as Detail);
  }

  const filtered = useMemo(() => enrollments.filter(e => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (e.studentName?.toLowerCase().includes(q) || e.studentLastname?.toLowerCase().includes(q) || e.studentDni?.toLowerCase().includes(q) || e.groupCodigo?.toLowerCase().includes(q));
  }), [enrollments, search]);

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId || !payMonto) return;
    await registerPayment({
      enrollmentId: selectedId,
      monto: Number(payMonto),
      metodoPago: payMetodo || undefined,
      fechaPago: payFecha,
      observacion: payObservacion || undefined,
    });
    setPayOpen(false);
    setPayMonto("");
    setPayMetodo("");
    setPayObservacion("");
    await load();
    if (selectedId) await selectEnrollment(selectedId);
  }

  const hasFilters = search;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-semibold tracking-wide text-[oklch(0.92_0.003_85)]">Pagos</h1>
        <p className="text-sm text-[oklch(0.55_0.01_75)] mt-1">Gestión de cobranzas y cuotas</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left panel: Student list */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.145_0.003_85)] overflow-hidden">
            <div className="p-4 border-b border-[oklch(0.19_0.004_80)]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[oklch(0.48_0.008_72)]" strokeWidth={1.5} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar estudiante..." className={sf+" pl-10 w-full"} />
                {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[oklch(0.48_0.008_72)] hover:text-[oklch(0.82_0.1_82)] cursor-pointer"><X className="h-4 w-4" /></button>}
              </div>
            </div>
            <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
              {filtered.map(e => {
                const pendiente = Number(e.montoCurso) + Number(e.montoMatricula) - e.totalPagado;
                return (
                  <button
                    key={e.enrollmentId}
                    onClick={() => selectEnrollment(e.enrollmentId)}
                    className={`w-full text-left px-4 py-3 border-b border-[oklch(0.18_0.003_85)] transition-colors cursor-pointer ${
                      selectedId === e.enrollmentId
                        ? "bg-[oklch(0.72_0.12_85/0.1)] border-l-2 border-l-[oklch(0.72_0.12_85)]"
                        : "hover:bg-[oklch(0.17_0.003_85)]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[oklch(0.9_0.003_85)]">{e.studentName} {e.studentLastname}</p>
                        <p className="text-xs text-[oklch(0.55_0.01_75)]">{e.groupCodigo} · {e.courseName}</p>
                      </div>
                      <ChevronRight className={`h-4 w-4 text-[oklch(0.48_0.008_72)] transition-transform ${selectedId === e.enrollmentId ? "rotate-90" : ""}`} strokeWidth={1.5} />
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex-1 h-1.5 rounded-full bg-[oklch(0.19_0.003_85)] overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${pendiente <= 0 ? "bg-[oklch(0.6_0.1_155)]" : "bg-[oklch(0.72_0.12_85)]"}`}
                          style={{ width: `${Math.min(100, (e.totalPagado / (Number(e.montoCurso) + Number(e.montoMatricula))) * 100)}%` }}
                        />
                      </div>
                      <span className={`text-xs font-medium ${pendiente > 0 ? "text-[oklch(0.62_0.12_22)]" : "text-[oklch(0.6_0.1_155)]"}`}>
                        S/ {pendiente.toFixed(0)}
                      </span>
                    </div>
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-[oklch(0.55_0.01_75)]">No se encontraron estudiantes{hasFilters ? " con los filtros" : ""}.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right panel: Detail */}
        <div className="lg:col-span-2">
          {detail ? (
            <div className="space-y-4">
              {/* Summary card */}
              <div className="rounded-2xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.145_0.003_85)] p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-heading text-xl font-semibold text-[oklch(0.92_0.003_85)]">
                      {detail.enrollment.studentName} {detail.enrollment.studentLastname}
                    </h2>
                    <p className="text-sm text-[oklch(0.55_0.01_75)]">
                      {detail.enrollment.groupCodigo} · {detail.enrollment.courseName}
                    </p>
                  </div>
                  <button onClick={() => { setPayMonto(String(detail.pendiente > 0 ? detail.pendiente : "")); setPayOpen(true); }} className={btn}>
                    <DollarSign className="h-4 w-4" /> Registrar Pago
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-xl bg-[oklch(0.18_0.003_85)] border border-[oklch(0.19_0.003_85)] p-4 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-[oklch(0.48_0.008_72)]">Total</p>
                    <p className="text-xl font-heading font-semibold text-[oklch(0.9_0.003_85)] mt-1">S/ {detail.total.toFixed(2)}</p>
                  </div>
                  <div className="rounded-xl bg-[oklch(0.35_0.08_150/0.08)] border border-[oklch(0.35_0.08_150/0.15)] p-4 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-[oklch(0.48_0.008_72)]">Pagado</p>
                    <p className="text-xl font-heading font-semibold text-[oklch(0.6_0.1_155)] mt-1">S/ {detail.pagado.toFixed(2)}</p>
                  </div>
                  <div className={`rounded-xl border p-4 text-center ${detail.pendiente > 0 ? "bg-[oklch(0.48_0.16_20/0.08)] border-[oklch(0.48_0.16_20/0.15)]" : "bg-[oklch(0.35_0.08_150/0.08)] border-[oklch(0.35_0.08_150/0.15)]"}`}>
                    <p className="text-[10px] uppercase tracking-wider text-[oklch(0.48_0.008_72)]">Pendiente</p>
                    <p className={`text-xl font-heading font-semibold mt-1 ${detail.pendiente > 0 ? "text-[oklch(0.62_0.12_22)]" : "text-[oklch(0.6_0.1_155)]"}`}>S/ {detail.pendiente.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Installments */}
              {detail.cuotas.length > 0 && (
                <div className="rounded-2xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.145_0.003_85)] p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Layers className="h-5 w-5 text-[oklch(0.82_0.1_82)]" strokeWidth={1.5} />
                    <h3 className="font-heading text-lg font-semibold text-[oklch(0.92_0.003_85)]">Plan de Cuotas</h3>
                  </div>
                  <div className="space-y-2">
                    {detail.cuotas.map(c => (
                      <div key={c.id} className={`flex items-center justify-between rounded-xl border p-3 ${
                        c.estado === "pagado" ? "bg-[oklch(0.35_0.08_150/0.06)] border-[oklch(0.35_0.08_150/0.15)]" :
                        c.estado === "vencido" ? "bg-[oklch(0.48_0.16_20/0.06)] border-[oklch(0.48_0.16_20/0.15)]" :
                        "bg-[oklch(0.18_0.003_85)] border-[oklch(0.19_0.003_85)]"
                      }`}>
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[oklch(0.72_0.12_85/0.12)] text-xs font-semibold text-[oklch(0.82_0.1_82)]">
                            {c.numeroCuota}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-[oklch(0.9_0.003_85)]">Cuota {c.numeroCuota}</p>
                            <p className="text-xs text-[oklch(0.55_0.01_75)]">
                              <Calendar className="inline h-3 w-3 mr-1" />
                              Vence: {c.fechaVencimiento}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-[oklch(0.85_0.005_78)]">S/ {Number(c.monto).toFixed(2)}</p>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            c.estado === "pagado" ? "bg-[oklch(0.35_0.08_150/0.15)] text-[oklch(0.6_0.1_155)]" :
                            c.estado === "vencido" ? "bg-[oklch(0.48_0.16_20/0.12)] text-[oklch(0.62_0.12_22)]" :
                            "bg-[oklch(0.35_0.07_80/0.2)] text-[oklch(0.8_0.1_82)]"
                          }`}>{c.estado}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment History */}
              <div className="rounded-2xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.145_0.003_85)] p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="h-5 w-5 text-[oklch(0.8_0.1_82)]" strokeWidth={1.5} />
                  <h3 className="font-heading text-lg font-semibold text-[oklch(0.92_0.003_85)]">Historial de Pagos</h3>
                </div>
                {detail.historial.length === 0 ? (
                  <p className="text-sm text-[oklch(0.55_0.01_75)]">No hay pagos registrados aún.</p>
                ) : (
                  <div className="space-y-2">
                    {detail.historial.map(h => (
                      <div key={h.id} className="flex items-center justify-between rounded-xl bg-[oklch(0.18_0.003_85)] border border-[oklch(0.19_0.003_85)] px-4 py-3">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-[oklch(0.6_0.1_155)]" strokeWidth={1.5} />
                          <div>
                            <p className="text-sm text-[oklch(0.82_0.005_78)]">{h.fechaPago}</p>
                            {h.observacion && <p className="text-xs text-[oklch(0.55_0.01_75)]">{h.observacion}</p>}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-[oklch(0.6_0.1_155)]">S/ {Number(h.monto).toFixed(2)}</p>
                          <p className="text-xs text-[oklch(0.48_0.008_72)]">{h.metodoPago || "—"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.145_0.003_85)] p-12 text-center">
              <CreditCard className="h-12 w-12 text-[oklch(0.32_0.004_75)] mx-auto mb-3" strokeWidth={1} />
              <p className="text-sm text-[oklch(0.55_0.01_75)]">Selecciona un estudiante para ver su detalle de pagos</p>
            </div>
          )}
        </div>
      </div>

      {/* Pay Dialog */}
      {payOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setPayOpen(false)}>
          <div className="w-full max-w-sm rounded-2xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.145_0.003_85)] p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="font-heading text-lg font-semibold text-[oklch(0.92_0.003_85)] mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-[oklch(0.6_0.1_155)]" /> Registrar Pago
            </h2>
            {detail?.pendiente !== undefined && (
              <p className="text-sm text-[oklch(0.55_0.01_75)] mb-4">
                Pendiente: <span className="text-[oklch(0.62_0.12_22)] font-semibold">S/ {detail.pendiente.toFixed(2)}</span>
                {detail.pendiente > 0 && (
                  <button onClick={() => setPayMonto(String(detail.pendiente))} className="ml-2 text-xs text-[oklch(0.72_0.12_85)] hover:underline cursor-pointer">
                    Usar saldo pendiente
                  </button>
                )}
              </p>
            )}
            <form onSubmit={handlePay} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5"><label className={L}>Monto (S/)</label><input value={payMonto} onChange={e => setPayMonto(e.target.value)} type="number" step="0.01" min="0.01" required className={inp} /></div>
              <div className="flex flex-col gap-1.5"><label className={L}>Método</label><select value={payMetodo} onChange={e => setPayMetodo(e.target.value)} className="flex h-10 w-full rounded-xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.18_0.003_85)] px-4 text-sm text-[oklch(0.92_0.003_85)] outline-none"><option value="">Seleccionar...</option><option value="efectivo">Efectivo</option><option value="transferencia">Transferencia</option><option value="yape">Yape / Plin</option><option value="tarjeta">Tarjeta</option></select></div>
              <div className="flex flex-col gap-1.5"><label className={L}>Fecha</label><input value={payFecha} onChange={e => setPayFecha(e.target.value)} type="date" required className={inp} /></div>
              <div className="flex flex-col gap-1.5"><label className={L}>Observación</label><input value={payObservacion} onChange={e => setPayObservacion(e.target.value)} className={inp} /></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setPayOpen(false)} className="flex-1 h-10 rounded-xl border border-[oklch(0.2_0.004_80)] text-sm text-[oklch(0.65_0.008_72)] hover:bg-[oklch(0.18_0.003_85)] transition-all cursor-pointer">Cancelar</button>
                <button type="submit" className={btn+" flex-1"}>Registrar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
