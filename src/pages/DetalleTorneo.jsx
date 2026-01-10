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

export default function DetalleTorneo() {
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const tournamentId = urlParams.get("id");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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

  const { data: matches = [] } = useQuery({
    queryKey: ["tournament-matches", tournamentId],
    queryFn: () => base44.entities.Match.filter({ tournament_id: tournamentId }, "round,match_number"),
    enabled: !!tournamentId && tournament?.bracket_generated
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.TournamentParticipant.create({
        tournament_id: tournamentId,
        tournament_name: tournament.name,
        user_id: user.id,
        user_name: user.full_name,
        user_email: user.email,
        payment_status: tournament.entry_fee > 0 ? "pending" : "free"
      });

      await base44.entities.Tournament.update(tournamentId, {
        current_participants: tournament.current_participants + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["tournament", tournamentId]);
      queryClient.invalidateQueries(["tournament-participants", tournamentId]);
      setShowSuccessModal(true);
    }
  });

  const generateBracketMutation = useMutation({
    mutationFn: async () => {
      const shuffled = [...participants].sort(() => Math.random() - 0.5);
      const rounds = Math.ceil(Math.log2(participants.length));
      
      for (let i = 0; i < shuffled.length; i += 2) {
        const player1 = shuffled[i];
        const player2 = shuffled[i + 1];

        await base44.entities.Match.create({
          tournament_id: tournamentId,
          round: 1,
          round_name: `Ronda ${1}`,
          match_number: Math.floor(i / 2) + 1,
          player1_id: player1.user_id,
          player1_name: player1.user_name,
          player2_id: player2?.user_id,
          player2_name: player2?.user_name,
          status: "pending"
        });
      }

      await base44.entities.Tournament.update(tournamentId, {
        bracket_generated: true,
        status: "in_progress"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["tournament", tournamentId]);
      queryClient.invalidateQueries(["tournament-matches", tournamentId]);
    }
  });

  const registerMatchResultMutation = useMutation({
    mutationFn: async ({ matchId, winnerId, winnerName, score1, score2 }) => {
      await base44.entities.Match.update(matchId, {
        winner_id: winnerId,
        winner_name: winnerName,
        player1_score: score1,
        player2_score: score2,
        status: "completed"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["tournament-matches", tournamentId]);
    }
  });

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
              <TabsList className="bg-purple-900/30 border border-purple-500/30 p-1 mb-6">
                <TabsTrigger value="participants">Participantes</TabsTrigger>
                <TabsTrigger value="bracket">Bracket</TabsTrigger>
              </TabsList>

              <TabsContent value="participants">
                <Card className="bg-gradient-to-br from-purple-900/30 to-transparent border border-purple-500/20 p-6 rounded-2xl">
                  <h3 className="text-xl font-black text-white mb-4">Participantes ({participants.length})</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {participants.map((participant, index) => (
                      <div key={participant.id} className="bg-black/30 p-3 rounded-xl">
                        <div className="text-white font-bold text-sm">{index + 1}. {participant.user_name}</div>
                        <div className="text-xs text-gray-500 mt-1">ID: {participant.user_id.substring(0, 8)}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="bracket">
                {!tournament.bracket_generated ? (
                  <Card className="bg-gradient-to-br from-purple-900/30 to-transparent border border-purple-500/20 p-12 rounded-2xl text-center">
                    <Trophy className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-xl font-black text-white mb-2">Bracket no generado</h3>
                    {isAdmin && (
                      <Button
                        onClick={() => generateBracketMutation.mutate()}
                        disabled={generateBracketMutation.isPending || participants.length < 2}
                        className="mt-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold"
                      >
                        <Play className="w-5 h-5 mr-2" />
                        Generar Bracket
                      </Button>
                    )}
                  </Card>
                ) : (
                  <Card className="bg-gradient-to-br from-purple-900/30 to-transparent border border-purple-500/20 p-6 rounded-2xl">
                    <h3 className="text-xl font-black text-white mb-4">Bracket del Torneo</h3>
                    <div className="space-y-4">
                      {matches.map(match => (
                        <div key={match.id} className="bg-black/30 p-4 rounded-xl">
                          <div className="text-xs text-gray-400 mb-2">{match.round_name} - Match {match.match_number}</div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex-1">
                              <div className={`font-bold ${match.winner_id === match.player1_id ? "text-yellow-400" : "text-white"}`}>
                                {match.player1_name || "TBD"}
                              </div>
                            </div>
                            <div className="px-4 text-gray-400">VS</div>
                            <div className="flex-1 text-right">
                              <div className={`font-bold ${match.winner_id === match.player2_id ? "text-yellow-400" : "text-white"}`}>
                                {match.player2_name || "TBD"}
                              </div>
                            </div>
                          </div>
                          {match.status === "completed" && (
                            <div className="text-center text-sm text-gray-400">
                              Resultado: {match.player1_score} - {match.player2_score}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-gradient-to-br from-purple-900/30 to-transparent border border-purple-500/20 p-6 rounded-2xl">
              <h3 className="text-xl font-black text-white mb-4">Información</h3>
              <div className="space-y-3 text-sm">
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
              <Card className="bg-gradient-to-br from-yellow-900/30 to-transparent border border-yellow-500/30 p-6 rounded-2xl text-center">
                <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                <div className="text-yellow-400 font-bold text-sm mb-1">CAMPEÓN</div>
                <div className="text-2xl font-black text-white">{tournament.winner_name}</div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}