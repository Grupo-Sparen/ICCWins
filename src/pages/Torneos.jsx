import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trophy, Calendar, Users, DollarSign, Plus, Gamepad2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Countdown from "../components/Countdown";

export default function Torneos() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("registration_open");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const [paymentData, setPaymentData] = useState({
    screenshot_url: "",
    amount_paid: ""
  });
  
  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch {
        return null;
      }
    }
  });

  const { data: tournaments = [], isLoading } = useQuery({
    queryKey: ["tournaments"],
    queryFn: () => base44.entities.Tournament.list("-created_date")
  });

  const isAdmin = user?.role === "admin";

  const registerMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.TournamentParticipant.create({
        tournament_id: selectedTournament.id,
        tournament_name: selectedTournament.name,
        user_id: user.id,
        user_name: user.full_name,
        user_email: user.email,
        payment_status: selectedTournament.entry_fee > 0 ? "pending" : "free"
      });

      await base44.entities.Tournament.update(selectedTournament.id, {
        current_participants: selectedTournament.current_participants + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["tournaments"]);
      setShowPaymentModal(false);
      setSelectedTournament(null);
      setPaymentData({ screenshot_url: "", amount_paid: "" });
      alert("¡Inscripción exitosa! Tu pago está pendiente de confirmación.");
    }
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingScreenshot(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setPaymentData({ ...paymentData, screenshot_url: result.file_url });
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setUploadingScreenshot(false);
    }
  };

  const handleRegister = (tournament, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      alert("Debes iniciar sesión para inscribirte");
      return;
    }

    setSelectedTournament(tournament);
    setPaymentData({ screenshot_url: "", amount_paid: tournament.entry_fee.toString() });
    setShowPaymentModal(true);
  };

  const filteredTournaments = tournaments.filter(tournament => {
    if (statusFilter === "all") return true;
    if (statusFilter === "registration_open") {
      return tournament.status === "registration_open" || tournament.status === "upcoming";
    }
    return tournament.status === statusFilter;
  });

  const getStatusBadge = (status) => {
    const badges = {
      upcoming: { text: "Próximamente", color: "bg-blue-600" },
      registration_open: { text: "Inscripciones Abiertas", color: "bg-green-600" },
      in_progress: { text: "En Curso", color: "bg-yellow-600" },
      completed: { text: "Finalizado", color: "bg-gray-600" },
      cancelled: { text: "Cancelado", color: "bg-red-600" }
    };
    return badges[status] || badges.upcoming;
  };

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <div className="inline-flex items-center gap-2 bg-cyan-600/20 border border-cyan-500/30 px-4 py-2 rounded-full mb-6">
              <Trophy className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-300 font-bold text-sm">TORNEOS GAMING</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-black text-white mb-6">
              Torneos <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Competitivos</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl">
              Participa en torneos organizados de tus videojuegos favoritos.
            </p>
          </div>
          
          {isAdmin && (
            <Link to={createPageUrl("CrearTorneo")}>
              <Button className="h-12 px-6 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white font-bold">
                <Plus className="w-5 h-5 mr-2" />
                Crear Torneo
              </Button>
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="mb-8">
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList className="bg-purple-900/30 border border-purple-500/30 p-1">
              <TabsTrigger value="registration_open" className="data-[state=active]:bg-green-600">Inscripciones Abiertas</TabsTrigger>
              <TabsTrigger value="in_progress" className="data-[state=active]:bg-yellow-600">En Curso</TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:bg-gray-600">Finalizados</TabsTrigger>
              <TabsTrigger value="all" className="data-[state=active]:bg-purple-600">Todos</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Tournaments Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="bg-gradient-to-br from-purple-900/30 to-transparent border border-purple-500/20 p-6 rounded-2xl animate-pulse">
                <div className="h-48 bg-purple-900/40 rounded mb-4"></div>
              </Card>
            ))}
          </div>
        ) : filteredTournaments.length === 0 ? (
          <Card className="bg-gradient-to-br from-purple-900/30 to-transparent border border-purple-500/20 p-12 rounded-3xl text-center">
            <Trophy className="w-20 h-20 text-purple-400 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-white mb-2">No hay torneos</h3>
            <p className="text-gray-400">Vuelve pronto para nuevos torneos</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTournaments.map(tournament => {
              const badge = getStatusBadge(tournament.status);
              const spotsLeft = tournament.max_participants - tournament.current_participants;
              const canRegister = (tournament.status === "registration_open" || tournament.status === "upcoming") && spotsLeft > 0;
              
              return (
                <div key={tournament.id} className="relative">
                  <Link to={createPageUrl(`DetalleTorneo?id=${tournament.id}`)}>
                    <Card className="bg-gradient-to-br from-cyan-900/20 to-purple-900/20 border border-cyan-500/30 rounded-2xl overflow-hidden card-hover">
                      {tournament.image_url && (
                        <img src={tournament.image_url} alt={tournament.name} className="w-full h-40 object-cover" />
                      )}
                      
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <span className={`${badge.color} text-white px-3 py-1 rounded-full text-xs font-bold`}>
                            {badge.text}
                          </span>
                          <Gamepad2 className="w-6 h-6 text-cyan-400" />
                        </div>

                        <h3 className="text-2xl font-black text-white mb-2">{tournament.name}</h3>
                        <p className="text-cyan-400 font-bold mb-4">{tournament.game}</p>

                        <div className="space-y-2 text-sm mb-4">
                          <div className="flex items-center gap-2 text-gray-400">
                            <Calendar className="w-4 h-4" />
                            {new Date(tournament.start_date).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short'
                            })}
                          </div>
                          <div className="flex items-center gap-2 text-gray-400">
                            <Users className="w-4 h-4" />
                            {tournament.current_participants} / {tournament.max_participants} participantes
                          </div>
                          {tournament.entry_fee > 0 && (
                            <div className="flex items-center gap-2 text-yellow-400">
                              <DollarSign className="w-4 h-4" />
                              S/ {tournament.entry_fee}
                            </div>
                          )}
                        </div>

                        {tournament.status === "registration_open" && spotsLeft > 0 && (
                          <div className="bg-green-600/20 border border-green-500/30 rounded-xl p-3 text-center mb-3">
                            <div className="text-green-400 font-bold text-sm">
                              {spotsLeft} {spotsLeft === 1 ? "cupo disponible" : "cupos disponibles"}
                            </div>
                          </div>
                        )}

                        {(tournament.status === "registration_open" || tournament.status === "upcoming") && new Date(tournament.start_date) > new Date() && (
                          <Countdown targetDate={tournament.start_date} />
                        )}

                        {canRegister && (
                          <Button
                            onClick={(e) => handleRegister(tournament, e)}
                            className="w-full h-12 bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700 text-white font-black mt-3"
                          >
                            Inscribirme Ahora
                          </Button>
                        )}

                        {tournament.status === "completed" && tournament.winner_name && (
                          <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-xl p-3 text-center">
                            <Trophy className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                            <div className="text-yellow-400 font-bold text-xs">CAMPEÓN</div>
                            <div className="text-white font-black">{tournament.winner_name}</div>
                          </div>
                        )}
                      </div>
                    </Card>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="bg-gradient-to-br from-cyan-900 to-gray-900 border-2 border-cyan-500/40 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-white flex items-center gap-2">
              <Trophy className="w-6 h-6 text-cyan-400" />
              Inscripción - {selectedTournament?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-black/30 p-4 rounded-xl">
              <div className="text-sm text-gray-400 mb-1">Torneo</div>
              <div className="text-white font-bold">{selectedTournament?.name}</div>
            </div>

            <div className="bg-black/30 p-4 rounded-xl">
              <div className="text-sm text-gray-400 mb-1">Costo de Inscripción</div>
              <div className="text-2xl font-black text-cyan-400">
                {selectedTournament?.entry_fee > 0 ? `S/ ${selectedTournament?.entry_fee}` : "GRATIS"}
              </div>
            </div>

            {selectedTournament?.entry_fee > 0 && (
              <>
                <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-xl p-4">
                  <div className="text-yellow-400 font-bold text-sm mb-2">Información de Pago</div>
                  <div className="text-white text-xs space-y-1">
                    <div>• Realiza el pago por Yape</div>
                    <div>• Sube la captura de pantalla del pago</div>
                    <div>• Espera confirmación del administrador</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white font-bold">Captura de Pago (Yape) *</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingScreenshot}
                    className="bg-black/30 border-cyan-500/30 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-cyan-600 file:text-white file:font-bold file:cursor-pointer hover:file:bg-cyan-700"
                  />
                  {uploadingScreenshot && <span className="text-cyan-400 text-sm">Subiendo...</span>}
                  {paymentData.screenshot_url && (
                    <img src={paymentData.screenshot_url} alt="Preview" className="w-full h-48 object-cover rounded-xl mt-2" />
                  )}
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              onClick={() => {
                setShowPaymentModal(false);
                setSelectedTournament(null);
                setPaymentData({ screenshot_url: "", amount_paid: "" });
              }}
              variant="outline"
              className="border-gray-500/30 text-black"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => registerMutation.mutate()}
              disabled={registerMutation.isPending || (selectedTournament?.entry_fee > 0 && !paymentData.screenshot_url)}
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold"
            >
              {registerMutation.isPending ? "Procesando..." : "Confirmar Inscripción"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}