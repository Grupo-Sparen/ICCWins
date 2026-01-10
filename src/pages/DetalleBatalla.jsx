import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Swords, Calendar, Trophy, MessageCircle, Check, X, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import toast from "react-hot-toast";

export default function DetalleBatalla() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const battleId = urlParams.get("id");

  const [message, setMessage] = useState("");

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

  const { data: battle, isLoading } = useQuery({
    queryKey: ["battle", battleId],
    queryFn: () => base44.entities.Battle.filter({ id: battleId }).then(b => b[0]),
    enabled: !!battleId
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["battle-messages", battleId],
    queryFn: () => base44.entities.ChatMessage.filter({ battle_id: battleId }, "-created_date"),
    enabled: !!battleId,
    refetchInterval: 5000
  });

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.ChatMessage.create({
        battle_id: battleId,
        from_user_id: user.id,
        from_user_name: user.full_name,
        message,
        timestamp: new Date().toISOString()
      });
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries(["battle-messages", battleId]);
    }
  });

  const confirmBattleMutation = useMutation({
    mutationFn: async () => {
      const isCreator = battle.creator_id === user.id;
      const updateData = isCreator
        ? { creator_confirmed: true }
        : { opponent_confirmed: true };

      const bothConfirmed = isCreator
        ? battle.opponent_confirmed
        : battle.creator_confirmed;

      if (bothConfirmed) {
        updateData.status = "confirmed";
      }

      await base44.entities.Battle.update(battleId, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["battle", battleId]);
    }
  });

  const registerResultMutation = useMutation({
    mutationFn: async (winnerId) => {
      await base44.entities.Battle.update(battleId, {
        status: "completed",
        winner_id: winnerId
      });

      const creatorStats = await base44.entities.BattleStats.filter({ user_id: battle.creator_id }).then(s => s[0]);
      const opponentStats = await base44.entities.BattleStats.filter({ user_id: battle.opponent_id }).then(s => s[0]);

      if (creatorStats) {
        const won = winnerId === battle.creator_id ? 1 : 0;
        const lost = winnerId === battle.creator_id ? 0 : 1;
        const total = creatorStats.total_battles + 1;
        const winRate = ((creatorStats.battles_won + won) / total) * 100;
        
        await base44.entities.BattleStats.update(creatorStats.id, {
          battles_won: creatorStats.battles_won + won,
          battles_lost: creatorStats.battles_lost + lost,
          total_battles: total,
          win_rate: winRate
        });
      } else {
        const won = winnerId === battle.creator_id ? 1 : 0;
        await base44.entities.BattleStats.create({
          user_id: battle.creator_id,
          user_name: battle.creator_name,
          battles_won: won,
          battles_lost: 1 - won,
          total_battles: 1,
          win_rate: won * 100
        });
      }

      if (opponentStats) {
        const won = winnerId === battle.opponent_id ? 1 : 0;
        const lost = winnerId === battle.opponent_id ? 0 : 1;
        const total = opponentStats.total_battles + 1;
        const winRate = ((opponentStats.battles_won + won) / total) * 100;
        
        await base44.entities.BattleStats.update(opponentStats.id, {
          battles_won: opponentStats.battles_won + won,
          battles_lost: opponentStats.battles_lost + lost,
          total_battles: total,
          win_rate: winRate
        });
      } else {
        const won = winnerId === battle.opponent_id ? 1 : 0;
        await base44.entities.BattleStats.create({
          user_id: battle.opponent_id,
          user_name: battle.opponent_name,
          battles_won: won,
          battles_lost: 1 - won,
          total_battles: 1,
          win_rate: won * 100
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["battle", battleId]);
      alert("Resultado registrado exitosamente");
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen py-20 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  if (!battle) {
    return (
      <div className="min-h-screen py-20 flex items-center justify-center">
        <Card className="bg-gradient-to-br from-red-900/30 to-transparent border border-red-500/20 p-12 rounded-3xl text-center">
          <Swords className="w-20 h-20 text-red-400 mx-auto mb-4" />
          <h3 className="text-2xl font-black text-white mb-2">Batalla no encontrada</h3>
        </Card>
      </div>
    );
  }

  const isParticipant = user && (battle.creator_id === user.id || battle.opponent_id === user.id);
  const isAdmin = user?.role === "admin";
  const canConfirm = isParticipant && battle.status === "invited";
  const userHasConfirmed = user && (
    (battle.creator_id === user.id && battle.creator_confirmed) ||
    (battle.opponent_id === user.id && battle.opponent_confirmed)
  );

  return (
    <div className="min-h-screen pt-40 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Battle Header */}
            <Card className="bg-gradient-to-br from-red-900/30 to-orange-900/20 border border-red-500/30 p-8 rounded-2xl">
              <div className="flex items-center gap-2 mb-6">
                <Swords className="w-8 h-8 text-red-400" />
                <h1 className="text-3xl font-black text-white">Batalla Épica</h1>
              </div>

              <div className="flex items-center justify-between mb-8">
                <div className="text-center flex-1">
                  <div className="text-2xl font-black text-white mb-2">{battle.creator_name}</div>
                  {battle.creator_confirmed && (
                    <span className="inline-block bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                      ✓ Confirmado
                    </span>
                  )}
                </div>

                <div className="px-6">
                  <Swords className="w-12 h-12 text-red-400" />
                </div>

                <div className="text-center flex-1">
                  <div className="text-2xl font-black text-white mb-2">{battle.opponent_name || "Pendiente"}</div>
                  {battle.opponent_confirmed && (
                    <span className="inline-block bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                      ✓ Confirmado
                    </span>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-black/30 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Fecha y Hora</span>
                  </div>
                  <div className="text-white font-bold">
                    {new Date(battle.date_time).toLocaleString('es-ES')}
                  </div>
                </div>

                <div className="bg-black/30 p-4 rounded-xl">
                  <div className="text-gray-400 text-sm mb-1">Estado</div>
                  <div className="text-white font-bold capitalize">{battle.status}</div>
                </div>
              </div>

              {battle.prize && (
                <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    <div>
                      <div className="text-yellow-400 font-bold text-sm">Premio</div>
                      <div className="text-white font-black">{battle.prize}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-black/30 p-4 rounded-xl mb-6">
                <h3 className="text-white font-bold mb-2">Reglas</h3>
                <p className="text-gray-300 whitespace-pre-wrap">{battle.rules}</p>
              </div>

              {canConfirm && !userHasConfirmed && (
                <Button
                  onClick={() => confirmBattleMutation.mutate()}
                  disabled={confirmBattleMutation.isPending}
                  className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold"
                >
                  <Check className="w-5 h-5 mr-2" />
                  Confirmar Participación
                </Button>
              )}

              {battle.status === "completed" && battle.winner_id && (
                <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-xl p-6 text-center">
                  <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
                  <div className="text-yellow-400 font-bold mb-1">GANADOR</div>
                  <div className="text-3xl font-black text-white">
                    {battle.winner_id === battle.creator_id ? battle.creator_name : battle.opponent_name}
                  </div>
                </div>
              )}

              {isAdmin && battle.status === "confirmed" && (
                <Card className="bg-black/40 p-6 rounded-xl mt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-5 h-5 text-purple-400" />
                    <h3 className="text-white font-bold">Registrar Resultado (Admin)</h3>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => registerResultMutation.mutate(battle.creator_id)}
                      disabled={registerResultMutation.isPending}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold"
                    >
                      {battle.creator_name} ganó
                    </Button>
                    <Button
                      onClick={() => registerResultMutation.mutate(battle.opponent_id)}
                      disabled={registerResultMutation.isPending}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold"
                    >
                      {battle.opponent_name} ganó
                    </Button>
                  </div>
                </Card>
              )}
            </Card>
          </div>

          {/* Chat Sidebar */}
          {isParticipant && (
            <div className="lg:col-span-1">
              <Card className="bg-gradient-to-br from-purple-900/30 to-transparent border border-purple-500/20 p-6 rounded-2xl">
                <div className="flex items-center gap-2 mb-6">
                  <MessageCircle className="w-6 h-6 text-purple-400" />
                  <h2 className="text-xl font-black text-white">Chat</h2>
                </div>

                <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                  {messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-xl ${
                        msg.from_user_id === user?.id
                          ? "bg-purple-600/30 ml-4"
                          : "bg-black/30 mr-4"
                      }`}
                    >
                      <div className="text-xs text-gray-400 mb-1">{msg.from_user_name}</div>
                      <div className="text-white text-sm">{msg.message}</div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && !sendMessageMutation.isPending && sendMessageMutation.mutate()}
                    placeholder="Escribe un mensaje..."
                    className="bg-black/30 border-purple-500/30 text-white"
                  />
                  <Button
                    onClick={() => sendMessageMutation.mutate()}
                    disabled={!message || sendMessageMutation.isPending}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Enviar
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}