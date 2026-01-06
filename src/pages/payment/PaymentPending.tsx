import React from "react";
import { Clock3, ArrowLeft, QrCode } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function PaymentPending() {
  const navigate = useNavigate();
  const q = useQuery();
  const orderId = q.get("order_id");

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        <div className="bg-white rounded-2xl shadow-xl border border-cyan-100 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-6 text-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Clock3 className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold">Pagamento pendente</h1>
                <p className="text-white/90 text-sm">
                  Assim que for confirmado, seu plano será liberado.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-start gap-3 text-gray-700">
              <QrCode className="w-5 h-5 text-amber-500 mt-0.5" />
              <div>
                <p className="font-semibold">Se você escolheu Pix</p>
                <p className="text-sm text-gray-600">
                  Pode levar alguns minutos para confirmar. Você pode voltar para o app e tentar de novo mais tarde.
                </p>
              </div>
            </div>

            {orderId && (
              <div className="mt-5 bg-gray-50 border border-gray-100 rounded-xl p-4">
                <p className="text-xs text-gray-500">Pedido</p>
                <p className="font-mono text-sm text-gray-800 break-all">{orderId}</p>
              </div>
            )}

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate("/")}
                className="flex-1 py-3 rounded-xl font-bold bg-cyan-500 text-white hover:bg-cyan-600 transition-all shadow-lg"
              >
                Voltar para o app
              </button>

              <button
                onClick={() => navigate(-1)}
                className="flex-1 py-3 rounded-xl font-bold bg-cyan-100 text-cyan-800 hover:bg-cyan-200 transition-all"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Voltar
                </span>
              </button>
            </div>

            <p className="mt-4 text-center text-xs text-gray-500">
              Status: aguardando confirmação.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
