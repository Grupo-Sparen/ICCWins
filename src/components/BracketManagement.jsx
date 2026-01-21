import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trophy, Trash2, Play, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import TournamentBracket from "./TournamentBracket";

export default function BracketManagement({ tournaments }) {
  const queryClient = useQueryClient();
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, match: null, winnerId: null, winnerName: null });

  const { data: participants = [], isLoading: loadingParticipants } = useQuery({
    queryKey: ["bracket-participants", selectedTournament?.id],
    queryFn: () => base44.entities.TournamentParticipant.filter({ tournament_id: selectedTournament.id }),
    enabled: !!selectedTournament?.id,
    staleTime: 30000 // Cache por 30 segundos para reducir llamadas
  });

  const { data: matches = [], isLoading: loadingMatches } = useQuery({
    queryKey: ["bracket-matches", selectedTournament?.id],
    queryFn: async () => {
      if (!selectedTournament?.id) return [];
      const matches = await base44.entities.Match.filter({ tournament_id: selectedTournament.id });
      return matches.sort((a, b) => {
        if (a.round !== b.round) return a.round - b.round;
        return a.match_number - b.match_number;
      });
    },
    enabled: !!selectedTournament?.id,
    staleTime: 10000, // Cache por 10 segundos
    refetchInterval: false // No auto-refetch
  });

  const generateBracketMutation = useMutation({
    mutationFn: async () => {
      if (!participants || participants.length < 2) {
        throw new Error("Se necesitan al menos 2 participantes");
      }

      const isPowerOfTwo = (n) => n > 1 && (n & (n - 1)) === 0;
      if (!isPowerOfTwo(participants.length)) {
        throw new Error(`Se necesita un número de participantes que sea potencia de 2 (2, 4, 8, 16...). Actualmente hay ${participants.length} participantes.`);
      }

      const shuffled = [...participants].sort(() => Math.random() - 0.5);
      const matchesToCreate = [];

      for (let i = 0; i < shuffled.length; i += 2) {
        matchesToCreate.push({
          tournament_id: selectedTournament.id,
          round: 1,
          round_name: "Ronda 1",
          match_number: Math.floor(i / 2) + 1,
          player1_id: shuffled[i].user_id,
          player1_name: shuffled[i].player_username,
          player2_id: shuffled[i + 1].user_id,
          player2_name: shuffled[i + 1].player_username,
          status: "pending"
        });
      }

      // Crear todos los matches en paralelo
      await Promise.all(matchesToCreate.map(match => base44.entities.Match.create(match)));

      await base44.entities.Tournament.update(selectedTournament.id, {
        bracket_generated: true,
        status: "in_progress"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["bracket-matches", selectedTournament?.id]);
      queryClient.invalidateQueries(["admin-tournaments"]);
    }
  });

  const clearBracketMutation = useMutation({
    mutationFn: async () => {
      const allMatches = await base44.entities.Match.filter({ tournament_id: selectedTournament.id });
      
      // Eliminar en lotes de 3 con delay para evitar rate limit
      const batchSize = 3;
      for (let i = 0; i < allMatches.length; i += batchSize) {
        const batch = allMatches.slice(i, i + batchSize);
        await Promise.all(batch.map(match => base44.entities.Match.delete(match.id)));
        
        // Pequeño delay entre lotes
        if (i + batchSize < allMatches.length) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
      
      await base44.entities.Tournament.update(selectedTournament.id, { bracket_generated: false });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["bracket-matches", selectedTournament?.id]);
      queryClient.invalidateQueries(["admin-tournaments"]);
    }
  });

  const registerWinnerMutation = useMutation({
    mutationFn: async ({ match, winnerId, winnerName }) => {
      // Update match
      await base44.entities.Match.update(match.id, {
        winner_id: winnerId,
        winner_name: winnerName,
        status: "completed"
      });

      // Esperar un momento antes de verificar
      await new Promise(resolve => setTimeout(resolve, 500));

      // Verificar ronda completa
      const allMatches = await base44.entities.Match.filter({ tournament_id: selectedTournament.id });
      const currentRound = match.round;
      const currentRoundMatches = allMatches.filter(m => m.round === currentRound);
      const allCompleted = currentRoundMatches.every(m => m.status === "completed");

      if (allCompleted) {
        const winners = currentRoundMatches.map(m => ({ id: m.winner_id, name: m.winner_name }));

        if (winners.length === 1) {
          // Es el campeón
          await base44.entities.Tournament.update(selectedTournament.id, {
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

          const nextMatches = [];
          for (let i = 0; i < winners.length; i += 2) {
            nextMatches.push({
              tournament_id: selectedTournament.id,
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

          await Promise.all(nextMatches.map(m => base44.entities.Match.create(m)));
        }
      }
    },
    onSuccess: () => {
      // Solo invalidar las queries específicas de brackets, sin hacer refetch automático
      queryClient.invalidateQueries({ 
        queryKey: ["bracket-matches", selectedTournament?.id],
        refetchType: 'none' // No refetch automáticamente, esperamos que el usuario cierre el diálogo
      });
      queryClient.invalidateQueries({ 
        queryKey: ["admin-tournaments"],
        refetchType: 'none' 
      });
      
      // Actualizar los datos localmente sin hacer fetch
      queryClient.setQueryData(["bracket-matches", selectedTournament?.id], (oldData) => {
        if (!oldData) return oldData;
        return oldData.map(m => 
          m.id === confirmDialog.match?.id 
            ? { ...m, winner_id: confirmDialog.winnerId, winner_name: confirmDialog.winnerName, status: "completed" }
            : m
        );
      });
      
      setConfirmDialog({ open: false, match: null, winnerId: null, winnerName: null });
      
      // Refetch manual después de cerrar el diálogo (con delay para evitar rate limit)
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ["bracket-matches", selectedTournament?.id] });
      }, 500);
    }
  });

  const handleRegisterResult = (match, winnerId, winnerName) => {
    setConfirmDialog({ open: true, match, winnerId, winnerName });
  };

  const tournamentsWithBrackets = tournaments.filter(t => 
    t.status === "in_progress" || t.bracket_generated
  );

  return (
    <div>
      {!selectedTournament ? (
        <div>
          <h3 className="text-xl font-black text-white mb-6">Selecciona un Torneo para Gestionar su Bracket</h3>
          <div className="grid gap-4">
            {tournamentsWithBrackets.length === 0 ? (
              <Card className="bg-gradient-to-br from-purple-900/30 to-transparent border border-purple-500/20 p-12 rounded-2xl text-center">
                <Trophy className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-black text-white mb-2">No hay torneos en curso</h3>
                <p className="text-gray-400">Los torneos deben estar en estado "En Curso" para gestionar brackets</p>
              </Card>
            ) : (
              tournamentsWithBrackets.map(tournament => (
                <Card key={tournament.id} className="bg-gradient-to-br from-purple-900/30 to-transparent border border-purple-500/20 p-6 rounded-2xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-black text-white mb-2">{tournament.name}</h3>
                      <p className="text-gray-400 text-sm mb-2">{tournament.game}</p>
                      <div className="flex gap-4 text-sm">
                        <span className="text-purple-400 font-bold">
                          {tournament.current_participants}/{tournament.max_participants} participantes
                        </span>
                        <span className="text-gray-500">•</span>
                        <span className={`font-bold ${
                          tournament.bracket_generated ? "text-green-400" : "text-gray-400"
                        }`}>
                          {tournament.bracket_generated ? "Bracket Generado" : "Sin Bracket"}
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={() => setSelectedTournament(tournament)}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
                    >
                      Gestionar Bracket
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-6">
            <Button
              onClick={() => setSelectedTournament(null)}
              variant="outline"
              className="border-purple-500/30 text-purple-400 mb-4"
            >
              ← Volver a Torneos
            </Button>
            <Card className="bg-gradient-to-br from-purple-900/30 to-transparent border border-purple-500/20 p-6 rounded-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white mb-2">
                    <Trophy className="w-6 h-6 text-purple-400 inline-block mr-2" />
                    Gestionar Brackets - {selectedTournament.name}
                  </h2>
                  <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                    <div>
                      <span className="text-gray-400">Participantes</span>
                      <p className="text-white font-bold">{selectedTournament.current_participants}/{selectedTournament.max_participants}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Formato</span>
                      <p className="text-white font-bold capitalize">{selectedTournament.format.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Estado</span>
                      <p className="text-white font-bold capitalize">{selectedTournament.status === "in_progress" ? "En Curso" : selectedTournament.status === "completed" ? "Completado" : "Pendiente"}</p>
                    </div>
                  </div>
                </div>
                {!selectedTournament.bracket_generated && (
                  <Button
                    onClick={() => generateBracketMutation.mutate()}
                    disabled={generateBracketMutation.isPending || loadingParticipants}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold"
                  >
                    {generateBracketMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Generando...
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        Generar Bracket
                      </>
                    )}
                  </Button>
                )}
                {selectedTournament.bracket_generated && (
                  <Button
                    onClick={() => {
                      if (confirm("¿Estás seguro de limpiar y regenerar el bracket? Se perderán todos los resultados.")) {
                        clearBracketMutation.mutate();
                      }
                    }}
                    disabled={clearBracketMutation.isPending}
                    variant="outline"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/20"
                  >
                    <Trash2 className="w-5 h-5 mr-2" />
                    Limpiar y Regenerar Bracket
                  </Button>
                )}
              </div>
            </Card>
          </div>

          {loadingMatches || loadingParticipants ? (
            <Card className="bg-gradient-to-br from-purple-900/30 to-transparent border border-purple-500/20 p-8 rounded-2xl text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-3"></div>
              <p className="text-gray-400">Cargando bracket...</p>
            </Card>
          ) : generateBracketMutation.isError ? (
            <Card className="bg-gradient-to-br from-red-900/30 to-transparent border border-red-500/20 p-8 rounded-2xl text-center">
              <p className="text-red-400 font-bold">Error al generar bracket</p>
              <p className="text-gray-400 text-sm mt-2">{generateBracketMutation.error.message}</p>
            </Card>
          ) : matches.length === 0 ? (
            <Card className="bg-gradient-to-br from-purple-900/30 to-transparent border border-purple-500/20 p-8 rounded-2xl text-center">
              <Trophy className="w-12 h-12 text-purple-400 mx-auto mb-3" />
              <h3 className="text-lg font-black text-white mb-2">Bracket no generado</h3>
              <p className="text-gray-400 text-sm mb-4">
                {participants.length < 2 
                  ? "Se necesitan al menos 2 participantes"
                  : `Hay ${participants.length} participantes inscritos`}
              </p>
            </Card>
          ) : (
            <TournamentBracket 
              matches={matches} 
              isAdmin={true}
              onRegisterResult={handleRegisterResult}
            />
          )}
        </div>
      )}

      {/* Confirm Winner Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <DialogContent className="bg-gradient-to-br from-green-900 to-gray-900 border-2 border-green-500/40 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-white flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-400" />
              Confirmar Ganador
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-300 mb-2">¿Confirmar como ganador del match?</p>
            <p className="text-white font-bold text-xl text-center my-4">{confirmDialog.winnerName}</p>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setConfirmDialog({ open: false, match: null, winnerId: null, winnerName: null })}
              variant="outline"
              className="border-gray-500/30 text-black"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => registerWinnerMutation.mutate(confirmDialog)}
              disabled={registerWinnerMutation.isPending}
              className="bg-green-600 hover:bg-green-700 text-white font-bold"
            >
              {registerWinnerMutation.isPending ? "Procesando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}