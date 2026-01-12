import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Crown, Calendar, CreditCard, CheckCircle, XCircle, AlertCircle, Gift, Trophy, User, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import PrizesSlider from "../components/PrizesSlider";

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

  const { data: tournamentParticipations = [] } = useQuery({
    queryKey: ["my-tournament-participations", user?.id],
    queryFn: () => base44.entities.TournamentParticipant.filter({ user_id: user?.id }, "-created_date"),
    enabled: !!user?.id
  });

  const activeSubscription = subscriptions.find(s => s.status === "active");

  const { data: allSubscriptionPlans = [] } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: () => base44.entities.SubscriptionPlan.list()
  });

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

        {/* User Profile Card */}
        <Card className="bg-gradient-to-br from-purple-900/30 to-transparent border border-purple-500/20 p-8 rounded-3xl mb-8">
          <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
            <User className="w-8 h-8 text-purple-400" />
            Mi Perfil
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <div className="text-xs text-gray-400 mb-1">Nombre Completo</div>
                  <div className="text-white font-bold">{user?.full_name || "No especificado"}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <div className="text-xs text-gray-400 mb-1">Email</div>
                  <div className="text-white font-bold">{user?.email}</div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <div className="text-xs text-gray-400 mb-1">Miembro Desde</div>
                  <div className="text-white font-bold">
                    {new Date(user?.created_date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Crown className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <div className="text-xs text-gray-400 mb-1">Estado</div>
                  <div className="text-white font-bold">
                    {activeSubscription ? (
                      <span className="text-green-400 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        Suscriptor Activo
                      </span>
                    ) : (
                      <span className="text-gray-400">Sin suscripción</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {activeSubscription || subscriptions.find(s => s.status === "pending") ? (
          <div className="space-y-8">
            {/* Active or Pending Subscription Card */}
            {(activeSubscription || subscriptions.find(s => s.status === "pending")) && (
              <Card className={`bg-gradient-to-br ${activeSubscription ? 'from-green-900/30 to-purple-900/30 border-2 border-green-500/30' : 'from-yellow-900/30 to-orange-900/30 border-2 border-yellow-500/30'} p-8 rounded-3xl`}>
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-16 h-16 bg-gradient-to-br ${activeSubscription ? 'from-green-500 to-cyan-500' : 'from-yellow-500 to-orange-500'} rounded-full flex items-center justify-center`}>
                      {activeSubscription ? <CheckCircle className="w-8 h-8 text-white" /> : <AlertCircle className="w-8 h-8 text-white" />}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white">{(activeSubscription || subscriptions.find(s => s.status === "pending")).plan_name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`w-2 h-2 ${activeSubscription ? 'bg-green-400' : 'bg-yellow-400'} rounded-full animate-pulse`}></div>
                        <span className={`${activeSubscription ? 'text-green-400' : 'text-yellow-400'} font-bold text-sm`}>
                          {activeSubscription ? 'ACTIVA' : 'PENDIENTE DE CONFIRMACIÓN'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-3xl font-black text-white">
                      {(activeSubscription || subscriptions.find(s => s.status === "pending")).currency === "PEN" ? "S/" : "$"}
                      {(activeSubscription || subscriptions.find(s => s.status === "pending")).amount_paid}
                    </div>
                    <div className="text-sm text-gray-400 font-semibold">por período</div>
                  </div>
                </div>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-black/30 p-4 rounded-xl">
                  <Calendar className="w-5 h-5 text-purple-400 mb-2" />
                  <div className="text-xs text-gray-400 mb-1">Inicio</div>
                  <div className="text-white font-bold">
                    {new Date((activeSubscription || subscriptions.find(s => s.status === "pending")).start_date).toLocaleDateString('es-ES')}
                  </div>
                </Card>

                {activeSubscription && activeSubscription.next_billing_date && (
                  <Card className="bg-black/30 p-4 rounded-xl">
                    <Calendar className="w-5 h-5 text-cyan-400 mb-2" />
                    <div className="text-xs text-gray-400 mb-1">Próximo Cobro</div>
                    <div className="text-white font-bold">
                      {new Date(activeSubscription.next_billing_date).toLocaleDateString('es-ES')}
                    </div>
                  </Card>
                )}

                <Card className="bg-black/30 p-4 rounded-xl">
                  <CreditCard className="w-5 h-5 text-green-400 mb-2" />
                  <div className="text-xs text-gray-400 mb-1">Método de Pago</div>
                  <div className="text-white font-bold">{(activeSubscription || subscriptions.find(s => s.status === "pending")).payment_method || "Yape"}</div>
                </Card>
              </div>

              {activeSubscription && activeSubscription.auto_renew ? (
                <div className="bg-green-900/30 border border-green-500/30 p-4 rounded-xl mb-4">
                  <div className="flex items-center gap-2 text-green-400 font-bold text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Renovación automática activada
                  </div>
                </div>
              ) : activeSubscription ? (
                <div className="bg-yellow-900/30 border border-yellow-500/30 p-4 rounded-xl mb-4">
                  <div className="flex items-center gap-2 text-yellow-400 font-bold text-sm">
                    <AlertCircle className="w-4 h-4" />
                    Tu suscripción se cancelará al final del período
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-900/30 border border-yellow-500/30 p-4 rounded-xl mb-4">
                  <div className="flex items-center gap-2 text-yellow-400 font-bold text-sm">
                    <AlertCircle className="w-4 h-4" />
                    Tu suscripción está pendiente de aprobación por el administrador
                  </div>
                </div>
              )}

              {activeSubscription && activeSubscription.auto_renew && (
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
            )}

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
              <PrizesSlider />
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

        {/* Tournament Participations */}
        {tournamentParticipations.length > 0 && (
          <Card className="bg-gradient-to-br from-cyan-900/30 to-transparent border border-cyan-500/20 p-8 rounded-3xl mt-8">
            <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
              <Trophy className="w-8 h-8 text-cyan-400" />
              Mis Torneos
            </h3>
            <div className="space-y-3">
              {tournamentParticipations.map((participation) => (
                <div key={participation.id} className="bg-black/30 p-5 rounded-xl">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-white font-bold text-lg">{participation.tournament_name}</h4>
                      <p className="text-cyan-400 text-sm mt-1 font-semibold">
                        Jugador: {participation.player_username}
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        Inscrito el {new Date(participation.created_date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-right">
                      {participation.amount_paid > 0 && (
                        <div className="text-xl font-black text-white mb-2">
                          S/ {participation.amount_paid}
                        </div>
                      )}
                      <div className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${
                        participation.payment_status === "paid" ? "bg-green-600 text-white" :
                        participation.payment_status === "free" ? "bg-blue-600 text-white" :
                        "bg-yellow-600 text-black"
                      }`}>
                        {participation.payment_status === "paid" ? "PAGADO" :
                         participation.payment_status === "free" ? "GRATIS" :
                         "PENDIENTE"}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-gray-700">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">País</div>
                      <div className="text-gray-300 text-sm font-semibold">{participation.country}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Edad</div>
                      <div className="text-gray-300 text-sm font-semibold">{participation.age} años</div>
                    </div>
                    {participation.payment_method && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Método de Pago</div>
                        <div className="text-gray-300 text-sm font-semibold capitalize">{participation.payment_method}</div>
                      </div>
                    )}
                    {participation.payment_date && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Fecha de Pago</div>
                        <div className="text-gray-300 text-sm font-semibold">
                          {new Date(participation.payment_date).toLocaleDateString('es-ES')}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Payment History */}
        {subscriptions.length > 0 && (
          <Card className="bg-gradient-to-br from-gray-900/30 to-transparent border border-gray-500/20 p-8 rounded-3xl mt-8">
            <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-gray-400" />
              Historial de Pagos de Suscripción
            </h3>
            <div className="space-y-3">
              {subscriptions.map((sub) => (
                <div key={sub.id} className="bg-black/30 p-5 rounded-xl">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-white font-bold text-lg">{sub.plan_name}</h4>
                      <p className="text-gray-400 text-sm mt-1">
                        {new Date(sub.start_date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black text-white">
                        {sub.currency === "PEN" ? "S/" : "$"} {sub.amount_paid}
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold mt-2 inline-block ${
                        sub.status === "active" ? "bg-green-600 text-white" :
                        sub.status === "expired" ? "bg-gray-600 text-white" :
                        sub.status === "cancelled" ? "bg-red-600 text-white" :
                        "bg-yellow-600 text-black"
                      }`}>
                        {sub.status === "active" ? "ACTIVO" :
                         sub.status === "expired" ? "EXPIRADO" :
                         sub.status === "cancelled" ? "CANCELADO" :
                         sub.status.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-gray-700">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Método de Pago</div>
                      <div className="text-gray-300 text-sm font-semibold">{sub.payment_method || "Yape"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Fecha de Inicio</div>
                      <div className="text-gray-300 text-sm font-semibold">
                        {new Date(sub.start_date).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Fecha de Fin</div>
                      <div className="text-gray-300 text-sm font-semibold">
                        {new Date(sub.end_date).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                    {sub.next_billing_date && sub.status === "active" && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Próximo Cobro</div>
                        <div className="text-cyan-400 text-sm font-semibold">
                          {new Date(sub.next_billing_date).toLocaleDateString('es-ES')}
                        </div>
                      </div>
                    )}
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