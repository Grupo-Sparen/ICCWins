import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Swords, Search, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CrearBatalla() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [battleForm, setBattleForm] = useState({
    date_time: "",
    rules: "",
    prize: ""
  });
  const [filters, setFilters] = useState({
    minFollowers: "",
    minViewers: "",
    minPoints: "",
    language: "all"
  });
  const [selectedOpponent, setSelectedOpponent] = useState(null);

  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => base44.auth.me()
  });

  const { data: tiktokers = [] } = useQuery({
    queryKey: ["tiktokers", filters],
    queryFn: async () => {
      const users = await base44.entities.User.filter({ is_verified_tiktoker: true });
      return users.filter(u => {
        if (u.email === user?.email) return false;
        if (filters.minFollowers && u.followers < parseInt(filters.minFollowers)) return false;
        if (filters.minViewers && u.avg_viewers < parseInt(filters.minViewers)) return false;
        if (filters.minPoints && u.avg_points < parseInt(filters.minPoints)) return false;
        if (filters.language !== "all" && u.language !== filters.language) return false;
        return true;
      });
    },
    enabled: !!user
  });

  const createBattleMutation = useMutation({
    mutationFn: async () => {
      const battle = await base44.entities.Battle.create({
        creator_id: user.id,
        creator_name: user.full_name,
        opponent_id: selectedOpponent.id,
        opponent_name: selectedOpponent.full_name,
        date_time: battleForm.date_time,
        rules: battleForm.rules,
        prize: battleForm.prize,
        status: "invited"
      });

      await base44.entities.BattleInvitation.create({
        battle_id: battle.id,
        from_user_id: user.id,
        from_user_name: user.full_name,
        to_user_id: selectedOpponent.id,
        to_user_name: selectedOpponent.full_name,
        message: `Te invito a una batalla el ${new Date(battleForm.date_time).toLocaleString('es-ES')}`
      });

      return battle;
    },
    onSuccess: (battle) => {
      navigate(createPageUrl(`DetalleBatalla?id=${battle.id}`));
    }
  });

  const handleCreateBattle = () => {
    if (!battleForm.date_time || !battleForm.rules || !selectedOpponent) {
      alert("Por favor completa todos los campos requeridos");
      return;
    }
    createBattleMutation.mutate();
  };

  if (!user || (user.role !== "admin" && !user.is_verified_tiktoker)) {
    return (
      <div className="min-h-screen py-20 flex items-center justify-center">
        <Card className="bg-gradient-to-br from-red-900/30 to-transparent border border-red-500/20 p-12 rounded-3xl text-center">
          <Swords className="w-20 h-20 text-red-400 mx-auto mb-4" />
          <h3 className="text-2xl font-black text-white mb-2">Acceso Restringido</h3>
          <p className="text-gray-400">Solo admins y tiktokers verificados pueden crear batallas</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl lg:text-5xl font-black text-white mb-4">
            Crear <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">Batalla</span>
          </h1>
          <p className="text-lg text-gray-400">Paso {step} de 2</p>
        </div>

        {step === 1 && (
          <Card className="bg-gradient-to-br from-red-900/30 to-orange-900/20 border border-red-500/30 p-8 rounded-2xl">
            <h2 className="text-2xl font-black text-white mb-6">Detalles de la Batalla</h2>
            
            <div className="space-y-6">
              <div>
                <Label className="text-white font-bold mb-2">Fecha y Hora *</Label>
                <Input
                  type="datetime-local"
                  value={battleForm.date_time}
                  onChange={(e) => setBattleForm({ ...battleForm, date_time: e.target.value })}
                  className="bg-black/30 border-red-500/30 text-white"
                />
              </div>

              <div>
                <Label className="text-white font-bold mb-2">Reglas de la Batalla *</Label>
                <Textarea
                  value={battleForm.rules}
                  onChange={(e) => setBattleForm({ ...battleForm, rules: e.target.value })}
                  className="bg-black/30 border-red-500/30 text-white min-h-32"
                  placeholder="Describe las reglas de la batalla..."
                />
              </div>

              <div>
                <Label className="text-white font-bold mb-2">Premio (Opcional)</Label>
                <Input
                  value={battleForm.prize}
                  onChange={(e) => setBattleForm({ ...battleForm, prize: e.target.value })}
                  className="bg-black/30 border-red-500/30 text-white"
                  placeholder="Ej: $100 USD"
                />
              </div>

              <Button
                onClick={() => setStep(2)}
                disabled={!battleForm.date_time || !battleForm.rules}
                className="w-full h-12 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold"
              >
                Continuar
              </Button>
            </div>
          </Card>
        )}

        {step === 2 && (
          <>
            <Card className="bg-gradient-to-br from-red-900/30 to-orange-900/20 border border-red-500/30 p-8 rounded-2xl mb-6">
              <h2 className="text-2xl font-black text-white mb-6">Buscar Oponente</h2>
              
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <Label className="text-white font-bold mb-2">Mín. Seguidores</Label>
                  <Input
                    type="number"
                    value={filters.minFollowers}
                    onChange={(e) => setFilters({ ...filters, minFollowers: e.target.value })}
                    className="bg-black/30 border-red-500/30 text-white"
                    placeholder="Ej: 10000"
                  />
                </div>

                <div>
                  <Label className="text-white font-bold mb-2">Mín. Viewers</Label>
                  <Input
                    type="number"
                    value={filters.minViewers}
                    onChange={(e) => setFilters({ ...filters, minViewers: e.target.value })}
                    className="bg-black/30 border-red-500/30 text-white"
                    placeholder="Ej: 1000"
                  />
                </div>

                <div>
                  <Label className="text-white font-bold mb-2">Mín. Puntos Promedio</Label>
                  <Input
                    type="number"
                    value={filters.minPoints}
                    onChange={(e) => setFilters({ ...filters, minPoints: e.target.value })}
                    className="bg-black/30 border-red-500/30 text-white"
                    placeholder="Ej: 5000"
                  />
                </div>

                <div>
                  <Label className="text-white font-bold mb-2">Idioma</Label>
                  <Select value={filters.language} onValueChange={(value) => setFilters({ ...filters, language: value })}>
                    <SelectTrigger className="bg-black/30 border-red-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="en">Inglés</SelectItem>
                      <SelectItem value="pt">Portugués</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            <div className="grid gap-4 mb-6">
              {tiktokers.map(tiktoker => (
                <Card
                  key={tiktoker.id}
                  className={`p-6 rounded-2xl cursor-pointer transition-all ${
                    selectedOpponent?.id === tiktoker.id
                      ? "bg-gradient-to-br from-red-600/40 to-orange-600/40 border-2 border-red-500"
                      : "bg-gradient-to-br from-purple-900/30 to-transparent border border-purple-500/20 hover:border-red-500/50"
                  }`}
                  onClick={() => setSelectedOpponent(tiktoker)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-black text-white mb-1">{tiktoker.full_name}</h3>
                      {tiktoker.tiktok_username && (
                        <p className="text-gray-400 text-sm mb-2">@{tiktoker.tiktok_username}</p>
                      )}
                      <div className="flex gap-4 text-sm">
                        <span className="text-purple-400">{tiktoker.followers?.toLocaleString()} seguidores</span>
                        <span className="text-cyan-400">{tiktoker.avg_viewers} viewers</span>
                        <span className="text-yellow-400">{tiktoker.avg_points} pts</span>
                      </div>
                    </div>
                    {selectedOpponent?.id === tiktoker.id && (
                      <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">✓</span>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => setStep(1)}
                variant="outline"
                className="flex-1 h-12 border-red-500/30 text-white"
              >
                Atrás
              </Button>
              <Button
                onClick={handleCreateBattle}
                disabled={!selectedOpponent || createBattleMutation.isPending}
                className="flex-1 h-12 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold"
              >
                <Send className="w-5 h-5 mr-2" />
                {createBattleMutation.isPending ? "Enviando..." : "Enviar Invitación"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}