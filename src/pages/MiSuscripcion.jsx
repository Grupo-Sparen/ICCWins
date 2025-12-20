import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Crown, Calendar, CreditCard, CheckCircle, XCircle, AlertCircle, Gift, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";

export default function MiSuscripcion() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);

  // Get current user
  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: subscriptions = [] } = useQuery({
    queryKey: ["my-subscriptions", user?.email],
    queryFn: () => base44.entities.Subscription.filter({ user_email: user?.email }, "-created_date"),
    enabled: !!user?.email
  });

  const activeSubscription = subscriptions.find(s => s.status === "active");

  const cancelMutation = useMutation({
    mutationFn: (subId) => base44.entities.Subscription.update(subId, { auto_renew: false }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-subscriptions"] });
    }
  });

  if (!user) {
    return (
      <div className="min-h-screen py-20 flex items-center justify-center">
        <Card className="bg-gradient-to-br from-purple-900/30 to-transparent border border-purple-500/20 p-12 rounded-3xl text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-white mb-4">Inicia Sesión</h2>
          <p className="text-gray-400 mb-6">Debes iniciar sesión para ver tu suscripción</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Crown className="w-12 h-12 text-yellow-400" />
            <div>
              <h1 className="text-4xl font-black text-white">Mi Suscripción</h1>
              <p className="text-gray-400 font-semibold">Gestiona tu plan y beneficios</p>
            </div>
          </div>
        </div>

        {activeSubscription ? (
          <div className="space-y-8">
            {/* Active Subscription Card */}
            <Card className="bg-gradient-to-br from-green-900/30 to-purple-900/30 border-2 border-green-500/30 p-8 rounded-3xl">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">{activeSubscription.plan_name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-400 font-bold text-sm">ACTIVA</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-3xl font-black text-white">
                    {activeSubscription.currency === "PEN" ? "S/" : "$"}
                    {activeSubscription.amount_paid}
                  </div>
                  <div className="text-sm text-gray-400 font-semibold">por período</div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-black/30 p-4 rounded-xl">
                  <Calendar className="w-5 h-5 text-purple-400 mb-2" />
                  <div className="text-xs text-gray-400 mb-1">Inicio</div>
                  <div className="text-white font-bold">
                    {new Date(activeSubscription.start_date).toLocaleDateString('es-ES')}
                  </div>
                </Card>

                <Card className="bg-black/30 p-4 rounded-xl">
                  <Calendar className="w-5 h-5 text-cyan-400 mb-2" />
                  <div className="text-xs text-gray-400 mb-1">Próximo Cobro</div>
                  <div className="text-white font-bold">
                    {new Date(activeSubscription.next_billing_date).toLocaleDateString('es-ES')}
                  </div>
                </Card>

                <Card className="bg-black/30 p-4 rounded-xl">
                  <CreditCard className="w-5 h-5 text-green-400 mb-2" />
                  <div className="text-xs text-gray-400 mb-1">Método de Pago</div>
                  <div className="text-white font-bold">{activeSubscription.payment_method || "Yape"}</div>
                </Card>
              </div>

              {activeSubscription.auto_renew ? (
                <div className="bg-green-900/30 border border-green-500/30 p-4 rounded-xl mb-4">
                  <div className="flex items-center gap-2 text-green-400 font-bold text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Renovación automática activada
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-900/30 border border-yellow-500/30 p-4 rounded-xl mb-4">
                  <div className="flex items-center gap-2 text-yellow-400 font-bold text-sm">
                    <AlertCircle className="w-4 h-4" />
                    Tu suscripción se cancelará al final del período
                  </div>
                </div>
              )}

              {activeSubscription.auto_renew && (
                <Button
                  onClick={() => cancelMutation.mutate(activeSubscription.id)}
                  variant="outline"
                  className="w-full border-red-500/30 text-red-400 hover:bg-red-900/30"
                >
                  <XCircle className="w-5 h-5 mr-2" />
                  Cancelar Renovación Automática
                </Button>
              )}
            </Card>

            {/* Benefits */}
            <Card className="bg-gradient-to-br from-purple-900/30 to-transparent border border-purple-500/20 p-8 rounded-3xl">
              <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                <Gift className="w-8 h-8 text-purple-400" />
                Tus Beneficios
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-1" />
                  <span className="text-white font-semibold">Participas en TODOS los sorteos semanales</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-1" />
                  <span className="text-white font-semibold">Descuentos exclusivos en marcas aliadas</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-1" />
                  <span className="text-white font-semibold">Acceso VIP a contenido exclusivo</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-1" />
                  <span className="text-white font-semibold">Sin costo adicional por premio</span>
                </div>
              </div>
            </Card>

            {/* Prizes */}
            <Card className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border border-yellow-500/30 p-8 rounded-3xl">
              <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                <Trophy className="w-8 h-8 text-yellow-400" />
                Premios Disponibles Esta Semana
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-black/30 p-6 rounded-xl text-center">
                  <div className="text-4xl mb-3">🎮</div>
                  <h4 className="text-lg font-black text-white mb-2">Nintendo Switch</h4>
                  <p className="text-gray-400 text-sm">Sorteo: Viernes</p>
                </div>
                <div className="bg-black/30 p-6 rounded-xl text-center">
                  <div className="text-4xl mb-3">🎯</div>
                  <h4 className="text-lg font-black text-white mb-2">PlayStation 5</h4>
                  <p className="text-gray-400 text-sm">Sorteo: Sábado</p>
                </div>
                <div className="bg-black/30 p-6 rounded-xl text-center">
                  <div className="text-4xl mb-3">🎲</div>
                  <h4 className="text-lg font-black text-white mb-2">Juegos AAA</h4>
                  <p className="text-gray-400 text-sm">Sorteo: Domingo</p>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <Card className="bg-gradient-to-br from-purple-900/30 to-transparent border border-purple-500/20 p-12 rounded-3xl text-center">
            <XCircle className="w-20 h-20 text-gray-400 mx-auto mb-6" />
            <h2 className="text-3xl font-black text-white mb-4">No Tienes Suscripción Activa</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Suscríbete ahora para participar en todos los sorteos semanales y obtener beneficios exclusivos.
            </p>
            <Link to={createPageUrl("Suscripcion")}>
              <Button className="h-14 px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-black text-lg rounded-xl">
                <Crown className="w-5 h-5 mr-2" />
                Ver Planes de Suscripción
              </Button>
            </Link>
          </Card>
        )}

        {/* Subscription History */}
        {subscriptions.length > 1 && (
          <Card className="bg-gradient-to-br from-gray-900/30 to-transparent border border-gray-500/20 p-8 rounded-3xl mt-8">
            <h3 className="text-2xl font-black text-white mb-6">Historial</h3>
            <div className="space-y-4">
              {subscriptions.filter(s => s.status !== "active").map((sub) => (
                <div key={sub.id} className="bg-black/30 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-bold">{sub.plan_name}</h4>
                    <p className="text-gray-400 text-sm">
                      {new Date(sub.start_date).toLocaleDateString('es-ES')} - {new Date(sub.end_date).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    sub.status === "expired" ? "bg-gray-600 text-white" :
                    sub.status === "cancelled" ? "bg-red-600 text-white" :
                    "bg-yellow-600 text-black"
                  }`}>
                    {sub.status.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}