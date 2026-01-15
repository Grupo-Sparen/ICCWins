import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Swords, Calendar, Trophy, Users, Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Countdown from "../components/Countdown";

export default function Batallas() {
  const [statusFilter, setStatusFilter] = useState("all");
  
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

  const { data: battles = [], isLoading } = useQuery({
    queryKey: ["battles"],
    queryFn: () => base44.entities.Battle.list("-created_date")
  });

  const canCreateBattle = user && (user.role === "admin" || user.is_verified_tiktoker);

  const filteredBattles = battles.filter(battle => {
    if (statusFilter === "all") return true;
    return battle.status === statusFilter;
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: "Pendiente", color: "bg-yellow-600" },
      invited: { text: "Invitado", color: "bg-blue-600" },
      confirmed: { text: "Confirmada", color: "bg-green-600" },
      completed: { text: "Completada", color: "bg-gray-600" },
      cancelled: { text: "Cancelada", color: "bg-red-600" }
    };
    return badges[status] || badges.pending;
  };

  return (
    <div className="min-h-screen pt-40 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <div className="inline-flex items-center gap-2 bg-red-600/20 border border-red-500/30 px-4 py-2 rounded-full mb-6">
              <Swords className="w-4 h-4 text-red-400" />
              <span className="text-red-300 font-bold text-sm">BATALLAS TIKTOK</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-black text-white mb-6">
              Batallas <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">ÉPICAS</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl">
              Desafía a otros tiktokers y demuestra quién es el mejor en la arena.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList className="bg-purple-900/30 border border-purple-500/30 p-1">
              <TabsTrigger value="all" className="data-[state=active]:bg-purple-600">Todas</TabsTrigger>
              <TabsTrigger value="confirmed" className="data-[state=active]:bg-green-600">Confirmadas</TabsTrigger>
              <TabsTrigger value="invited" className="data-[state=active]:bg-blue-600">Invitaciones</TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:bg-gray-600">Completadas</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Battles Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="bg-gradient-to-br from-purple-900/30 to-transparent border border-purple-500/20 p-6 rounded-2xl animate-pulse">
                <div className="h-32 bg-purple-900/40 rounded mb-4"></div>
              </Card>
            ))}
          </div>
        ) : filteredBattles.length === 0 ? (
          <Card className="bg-gradient-to-br from-purple-900/30 to-transparent border border-purple-500/20 p-12 rounded-3xl text-center">
            <Swords className="w-20 h-20 text-purple-400 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-white mb-2">No hay batallas</h3>
            <p className="text-gray-400">Sé el primero en crear una batalla épica</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBattles.map(battle => {
              const badge = getStatusBadge(battle.status);
              return (
                <Link key={battle.id} to={createPageUrl(`DetalleBatalla?id=${battle.id}`)}>
                  <Card className="bg-gradient-to-br from-red-900/20 to-orange-900/20 border border-red-500/30 p-6 rounded-2xl card-hover">
                    <div className="flex justify-between items-start mb-4">
                      <span className={`${badge.color} text-white px-3 py-1 rounded-full text-xs font-bold`}>
                        {badge.text}
                      </span>
                      <Swords className="w-6 h-6 text-red-400" />
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between text-center mb-2">
                        <div className="flex-1">
                          <div className="text-lg font-black text-white">{battle.opponent_name || "???"}</div>
                          <div className="text-xs text-gray-400">Oponente 1</div>
                        </div>
                        <div className="px-3">
                          <div className="text-2xl">⚔️</div>
                        </div>
                        <div className="flex-1">
                          <div className="text-lg font-black text-white">{battle.opponent_name_2 || "???"}</div>
                          <div className="text-xs text-gray-400">Oponente 2</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Calendar className="w-4 h-4" />
                        {new Date(battle.date_time).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      {battle.prize && (
                        <div className="flex items-center gap-2 text-yellow-400">
                          <Trophy className="w-4 h-4" />
                          {battle.prize}
                        </div>
                      )}
                    </div>

                    {battle.status === "confirmed" && new Date(battle.date_time) > new Date() && (
                      <Countdown targetDate={battle.date_time} />
                    )}

                    {battle.status === "completed" && battle.winner_id && (
                      <div className="mt-4 bg-yellow-600/20 border border-yellow-500/30 rounded-xl p-3 text-center">
                        <Trophy className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                        <div className="text-yellow-400 font-bold text-xs">GANADOR</div>
                        <div className="text-white font-black">
                          {battle.winner_id === battle.opponent_id ? battle.opponent_name : battle.opponent_name_2}
                        </div>
                      </div>
                    )}
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}