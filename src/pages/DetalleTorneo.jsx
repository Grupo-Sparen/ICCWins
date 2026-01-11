import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trophy, Calendar, Users, DollarSign, UserPlus, Shield, Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import TournamentBracket from "../components/TournamentBracket";

export default function DetalleTorneo() {
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const tournamentId = urlParams.get("id");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [confirmWinnerDialog, setConfirmWinnerDialog] = useState({ open: false, match: null, winnerId: null, winnerName: null });
  const [isConfirmingWinner, setIsConfirmingWinner] = useState(false);

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

  const { data: tournament, isLoading } = useQuery({
    queryKey: ["tournament", tournamentId],
    queryFn: () => base44.entities.Tournament.filter({ id: tournamentId }).then(t => t[0]),
    enabled: !!tournamentId
  });

  const { data: participants = [] } = useQuery({
    queryKey: ["tournament-participants", tournamentId],
    queryFn: () => base44.entities.TournamentParticipant.filter({ tournament_id: tournamentId }),
    enabled: !!tournamentId
  });

  const { data: matches = [], isLoading: matchesLoading, error: matchesError } = useQuery({
    queryKey: ["tournament-matches", tournamentId],
    queryFn: async () => {
      if (!tournamentId) return [];
      console.log("📡 FETCHING MATCHES FOR TOURNAMENT:", tournamentId);
      try {
        const matches = await base44.entities.Match.filter({ tournament_id: tournamentId });
        console.log("✅ MATCHES FETCHED:", matches.length, matches);
        // Ordenar manualmente por round y match_number
        return matches.sort((a, b) => {
          if (a.round !== b.round) return a.round - b.round;
          return a.match_number - b.match_number;
        });
      } catch (error) {
        console.error("❌ ERROR FETCHING MATCHES:", error);
        throw error;
      }
    },
    enabled: !!tournamentId,
    onError: (error) => {
      console.error("❌ Query error for matches:", error);
    }
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      // Si el torneo tiene entrada de pago, ir a Stripe
      if (tournament.entry_fee > 0) {
        // Validar que no esté en iframe
        if (window.self !== window.top) {
          throw new Error("El pago solo funciona desde la app publicada. Por favor abre en una nueva pestaña.");
        }

        const response = await base44.functions.invoke('stripeCheckout', {
          type: 'tournament',
          tournamentId: tournamentId
        });

        if (response.data.sessionUrl) {
          window.location.href = response.data.sessionUrl;
        }
      } else {
        // Entrada gratis
        await base44.entities.TournamentParticipant.create({
          tournament_id: tournamentId,
          tournament_name: tournament.name,
          user_id: user.id,
          user_name: user.full_name,
          user_email: user.email,
          payment_status: "free"
        });

        await base44.entities.Tournament.update(tournamentId, {
          current_participants: tournament.current_participants + 1
        });

        queryClient.invalidateQueries(["tournament", tournamentId]);
        queryClient.invalidateQueries(["tournament-participants", tournamentId]);
        setShowSuccessModal(true);
      }
    },
    onError: (error) => {
      alert(error.message || "Error al procesar la inscripción");
    }
  });

  const generateBracketMutation = useMutation({
    mutationFn: async () => {
      console.log("🔥 GENERAR BRACKET - DetalleTorneo");
      console.log("👥 Participants:", participants.length);

      if (!participants || participants.length < 2) {
        throw new Error("Se necesitan al menos 2 participantes para generar el bracket");
      }

      // Validar que sea potencia de 2 (excluye 0 y 1)
      const isPowerOfTwo = (n) => n > 1 && (n & (n - 1)) === 0;
      
      if (!isPowerOfTwo(participants.length)) {
        throw new Error(`Se necesita un número de participantes que sea potencia de 2 (2, 4, 8, 16, 32...). Actualmente hay ${participants.length} participantes.`);
      }

      console.log("🎲 Mezclando participantes...");
      const shuffled = [...participants].sort(() => Math.random() - 0.5);
      
      console.log("🏗️ Creando matches de Ronda 1...");
      for (let i = 0; i < shuffled.length; i += 2) {
        const player1 = shuffled[i];
        const player2 = shuffled[i + 1];

        console.log(`  Match ${Math.floor(i / 2) + 1}: ${player1.player_username} vs ${player2.player_username}`);

        await base44.entities.Match.create({
          tournament_id: tournamentId,
          round: 1,
          round_name: "Ronda 1",
          match_number: Math.floor(i / 2) + 1,
          player1_id: player1.user_id,
          player1_name: player1.player_username,
          player2_id: player2.user_id,
          player2_name: player2.player_username,
          status: "pending"
        });
      }

      console.log("🏆 Actualizando estado del torneo...");
      await base44.entities.Tournament.update(tournamentId, {
        bracket_generated: true,
        status: "in_progress"
      });
      
      console.log("✅ Bracket generado exitosamente");
    },
    onSuccess: async () => {
      console.log("🔄 Refrescando queries...");
      await queryClient.invalidateQueries(["tournament", tournamentId]);
      await queryClient.invalidateQueries(["tournament-matches", tournamentId]);
      
      await queryClient.refetchQueries(["tournament", tournamentId]);
      await queryClient.refetchQueries(["tournament-matches", tournamentId]);
      console.log("✅ Queries refrescadas");
    },
    onError: (error) => {
      console.error("❌ Error en generateBracketMutation:", error);
    }
  });

  const handleRegisterResult = (match, winnerId, winnerName) => {
    setConfirmWinnerDialog({ open: true, match, winnerId, winnerName });
  };

  const confirmWinner = async () => {
    if (isConfirmingWinner) return; // Prevenir doble click
    
    setIsConfirmingWinner(true);
    try {
      const { match, winnerId, winnerName } = confirmWinnerDialog;
      
      // Update del match
      await base44.entities.Match.update(match.id, {
        winner_id: winnerId,
        winner_name: winnerName,
        status: "completed"
      });

      // Pequeño delay para evitar race conditions
      await new Promise(resolve => setTimeout(resolve, 300));

      // Verificar si se completó toda la ronda
      const allMatches = await base44.entities.Match.filter({ tournament_id: tournamentId });
      const currentRound = match.round;
      const currentRoundMatches = allMatches.filter(m => m.round === currentRound);
      const allCompleted = currentRoundMatches.every(m => m.status === "completed");

      if (allCompleted) {
        // Avanzar a la siguiente ronda
        const winners = currentRoundMatches.map(m => ({
          id: m.winner_id,
          name: m.winner_name
        }));

        // Verificar si es la final
        if (winners.length === 1) {
          // Es el campeón
          await base44.entities.Tournament.update(tournamentId, {
            status: "completed",
            winner_id: winners[0].id,
            winner_name: winners[0].name
          });
        } else {
          // Crear siguiente ronda
          const nextRound = currentRound + 1;
          const roundNames = {
            2: "Final",
            3: "Semifinales",
            4: "Cuartos de Final",
            5: "Octavos de Final"
          };
          
          for (let i = 0; i < winners.length; i += 2) {
            await base44.entities.Match.create({
              tournament_id: tournamentId,
              round: nextRound,
              round_name: roundNames[nextRound] || `Ronda ${nextRound}`,
              match_number: Math.floor(i / 2) + 1,
              player1_id: winners[i].id,
              player1_name: winners[i].name,
              player2_id: winners[i + 1]?.id,
              player2_name: winners[i + 1]?.name,
              status: "pending"
            });
          }
        }
      }

      // Invalidate queries
      queryClient.invalidateQueries(["tournament-matches", tournamentId]);
      queryClient.invalidateQueries(["tournament", tournamentId]);
      
      setConfirmWinnerDialog({ open: false, match: null, winnerId: null, winnerName: null });
    } finally {
      setIsConfirmingWinner(false);
    }
  };



  if (isLoading) {
    return (
      <div className="min-h-screen py-20 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen py-20 flex items-center justify-center">
        <Card className="bg-gradient-to-br from-cyan-900/30 to-transparent border border-cyan-500/20 p-12 rounded-3xl text-center">
          <Trophy className="w-20 h-20 text-cyan-400 mx-auto mb-4" />
          <h3 className="text-2xl font-black text-white mb-2">Torneo no encontrado</h3>
        </Card>
      </div>
    );
  }

  const isAdmin = user?.role === "admin";
  const isModerator = user?.role === "admin";
  const isRegistered = participants.some(p => p.user_id === user?.id);
  const canRegister = user && !isRegistered && tournament.status === "registration_open" && 
                      tournament.current_participants < tournament.max_participants;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0F] via-[#0F0F1E] to-[#0A0A0F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        {/* Header */}
        {tournament.image_url && (
          <div className="mb-6 rounded-2xl overflow-hidden h-48">
            <img src={tournament.image_url} alt={tournament.name} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-10 h-10 text-cyan-400" />
              <div>
                <h1 className="text-3xl font-black text-white">{tournament.name}</h1>
                <p className="text-cyan-400 font-bold">{tournament.game}</p>
              </div>
            </div>

            <Card className="bg-gradient-to-br from-cyan-900/30 to-purple-900/20 border border-cyan-500/30 p-6 rounded-2xl">
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="bg-black/30 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Inicio</span>
                  </div>
                  <div className="text-white font-bold">
                    {new Date(tournament.start_date).toLocaleDateString('es-ES')}
                  </div>
                </div>

                <div className="bg-black/30 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">Participantes</span>
                  </div>
                  <div className="text-white font-bold">
                    {tournament.current_participants} / {tournament.max_participants}
                  </div>
                </div>

                <div className="bg-black/30 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm">Entrada</span>
                  </div>
                  <div className="text-white font-bold">
                    {tournament.entry_fee > 0 ? `S/ ${tournament.entry_fee}` : "Gratis"}
                  </div>
                </div>
              </div>

              {tournament.description && (
                <div className="mb-3">
                  <h3 className="text-white font-bold mb-1">Descripción</h3>
                  <p className="text-gray-300 text-sm whitespace-pre-wrap">{tournament.description}</p>
                </div>
              )}

              {tournament.prizes && (
                <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-xl p-4 mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    <h3 className="text-white font-bold">Premios</h3>
                  </div>
                  <p className="text-white text-sm whitespace-pre-wrap">{tournament.prizes}</p>
                </div>
              )}

              {tournament.rules && (
                <div className="bg-black/30 p-3 rounded-xl mb-3">
                  <h3 className="text-white font-bold text-sm mb-1">Reglas</h3>
                  <p className="text-gray-300 text-sm whitespace-pre-wrap">{tournament.rules}</p>
                </div>
              )}

              {canRegister && (
                <Button
                  onClick={() => registerMutation.mutate()}
                  disabled={registerMutation.isPending}
                  className="w-full h-14 bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700 text-white font-black text-lg"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  {registerMutation.isPending ? "Inscribiendo..." : "Inscribirme Ahora"}
                </Button>
              )}

              {isRegistered && (
                <div className="bg-green-600/20 border border-green-500/30 rounded-xl p-4 text-center">
                  <div className="text-green-400 font-bold">✓ Ya estás inscrito en este torneo</div>
                </div>
              )}
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="participants" className="w-full">
              <TabsList className="bg-purple-900/30 border border-purple-500/30 p-1 mb-4">
                <TabsTrigger value="participants">Participantes</TabsTrigger>
                <TabsTrigger value="bracket">Bracket</TabsTrigger>
              </TabsList>

              <TabsContent value="participants">
                <Card className="bg-gradient-to-br from-purple-900/30 to-transparent border border-purple-500/20 p-4 rounded-2xl">
                  <h3 className="text-lg font-black text-white mb-3">Participantes ({participants.length})</h3>
                  <div className="grid md:grid-cols-3 gap-3">
                    {participants.map((participant, index) => (
                      <div key={participant.id} className="bg-black/30 p-3 rounded-xl">
                        <div className="text-white font-bold text-sm">{index + 1}. {participant.player_username}</div>
                        <div className="text-xs text-gray-500 mt-1">{participant.country}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="bracket">
                {matchesLoading ? (
                  <Card className="bg-gradient-to-br from-purple-900/30 to-transparent border border-purple-500/20 p-8 rounded-2xl text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-3"></div>
                    <p className="text-gray-400">Cargando bracket...</p>
                  </Card>
                ) : matchesError ? (
                  <Card className="bg-gradient-to-br from-red-900/30 to-transparent border border-red-500/20 p-8 rounded-2xl text-center">
                    <p className="text-red-400 font-bold">Error cargando matches</p>
                    <p className="text-gray-400 text-sm mt-2">{matchesError.message}</p>
                  </Card>
                ) : matches.length === 0 ? (
                  <Card className="bg-gradient-to-br from-purple-900/30 to-transparent border border-purple-500/20 p-8 rounded-2xl text-center">
                    <Trophy className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                    <h3 className="text-lg font-black text-white mb-2">Bracket no generado</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      {participants.length < 2 
                        ? "Se necesitan al menos 2 participantes para generar el bracket"
                        : `Hay ${participants.length} participantes inscritos`}
                    </p>
                    {isAdmin && (
                      <Button
                        onClick={() => generateBracketMutation.mutate()}
                        disabled={generateBracketMutation.isPending || participants.length < 2}
                        className="mt-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {generateBracketMutation.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Generando Bracket...
                          </>
                        ) : (
                          <>
                            <Play className="w-5 h-5 mr-2" />
                            Generar Bracket con Inscritos Actuales
                          </>
                        )}
                      </Button>
                    )}
                    {generateBracketMutation.isError && (
                      <p className="text-red-400 text-sm mt-2">{generateBracketMutation.error.message}</p>
                    )}
                  </Card>
                ) : (
                  <TournamentBracket 
                    matches={matches} 
                    isAdmin={isAdmin}
                    onRegisterResult={handleRegisterResult}
                  />
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="bg-gradient-to-br from-purple-900/30 to-transparent border border-purple-500/20 p-4 rounded-2xl">
              <h3 className="text-lg font-black text-white mb-3">Información</h3>
              <div className="space-y-2 text-xs">
                <div>
                  <div className="text-gray-400 mb-1">Plataforma</div>
                  <div className="text-white font-bold">{tournament.platform}</div>
                </div>
                <div>
                  <div className="text-gray-400 mb-1">Formato</div>
                  <div className="text-white font-bold capitalize">
                    {tournament.format.replace("_", " ")}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 mb-1">Estado</div>
                  <div className="text-white font-bold capitalize">{tournament.status.replace("_", " ")}</div>
                </div>
              </div>
            </Card>

            {tournament.winner_name && (
              <Card className="bg-gradient-to-br from-yellow-900/30 to-transparent border border-yellow-500/30 p-4 rounded-2xl text-center">
                <Trophy className="w-10 h-10 text-yellow-400 mx-auto mb-2" />
                <div className="text-yellow-400 font-bold text-xs mb-1">CAMPEÓN</div>
                <div className="text-xl font-black text-white">{tournament.winner_name}</div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="bg-gradient-to-br from-green-900 to-gray-900 border-2 border-green-500/40 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-white flex items-center gap-2">
              <Trophy className="w-6 h-6 text-green-400" />
              ¡Inscripción Exitosa!
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <p className="text-gray-300 mb-2">Ya estás registrado en el torneo</p>
            <p className="text-green-400 font-bold text-lg">{tournament.name}</p>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold"
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Winner Dialog */}
      <Dialog open={confirmWinnerDialog.open} onOpenChange={(open) => setConfirmWinnerDialog({ ...confirmWinnerDialog, open })}>
        <DialogContent className="bg-gradient-to-br from-green-900 to-gray-900 border-2 border-green-500/40 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-white flex items-center gap-2">
              <Trophy className="w-6 h-6 text-green-400" />
              Confirmar Ganador
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-300 mb-2">¿Confirmar como ganador del match?</p>
            <p className="text-white font-bold text-xl text-center my-4">{confirmWinnerDialog.winnerName}</p>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setConfirmWinnerDialog({ open: false, match: null, winnerId: null, winnerName: null })}
              variant="outline"
              className="border-gray-500/30 text-black"
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmWinner}
              disabled={isConfirmingWinner}
              className="bg-green-600 hover:bg-green-700 text-white font-bold disabled:opacity-50"
            >
              {isConfirmingWinner ? "Procesando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}