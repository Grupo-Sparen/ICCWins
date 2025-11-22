import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, Trophy, Crown, Mic, Gamepad2, Users, Upload, Plus, Edit, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Admin() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [showPrizeForm, setShowPrizeForm] = useState(false);
  const [showWinnerForm, setShowWinnerForm] = useState(false);
  const [showPodcastForm, setShowPodcastForm] = useState(false);
  const [showGamingForm, setShowGamingForm] = useState(false);

  // Queries
  const { data: prizes = [] } = useQuery({
    queryKey: ["admin-prizes"],
    queryFn: () => base44.entities.Prize.list("-created_date")
  });

  const { data: participations = [] } = useQuery({
    queryKey: ["admin-participations"],
    queryFn: () => base44.entities.Participation.list("-created_date")
  });

  const { data: winners = [] } = useQuery({
    queryKey: ["admin-winners"],
    queryFn: () => base44.entities.Winner.list("-created_date")
  });

  const { data: podcasts = [] } = useQuery({
    queryKey: ["admin-podcasts"],
    queryFn: () => base44.entities.PodcastEpisode.list("-created_date")
  });

  const { data: gaming = [] } = useQuery({
    queryKey: ["admin-gaming"],
    queryFn: () => base44.entities.StreamingContent.list("-created_date")
  });

  // Stats
  const totalRevenue = participations
    .filter(p => p.payment_status === "confirmed")
    .reduce((sum, p) => sum + (p.amount_paid || 0), 0);

  const pendingPayments = participations.filter(p => p.payment_status === "pending").length;

  return (
    <div className="min-h-screen py-20 bg-gradient-to-b from-[#0A0A0F] to-[#0F0F1E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white">Panel de Administración</h1>
              <p className="text-gray-400 font-semibold">Gestiona tu plataforma gaming</p>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-purple-900/30 to-transparent border border-purple-500/20 p-6 rounded-2xl">
              <Trophy className="w-10 h-10 text-purple-400 mb-3" />
              <div className="text-3xl font-black text-white mb-1">{prizes.length}</div>
              <div className="text-gray-400 font-semibold text-sm">Premios Totales</div>
            </Card>

            <Card className="bg-gradient-to-br from-green-900/30 to-transparent border border-green-500/20 p-6 rounded-2xl">
              <Users className="w-10 h-10 text-green-400 mb-3" />
              <div className="text-3xl font-black text-white mb-1">{participations.length}</div>
              <div className="text-gray-400 font-semibold text-sm">Participaciones</div>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-900/30 to-transparent border border-yellow-500/20 p-6 rounded-2xl">
              <Crown className="w-10 h-10 text-yellow-400 mb-3" />
              <div className="text-3xl font-black text-white mb-1">{winners.length}</div>
              <div className="text-gray-400 font-semibold text-sm">Ganadores</div>
            </Card>

            <Card className="bg-gradient-to-br from-cyan-900/30 to-transparent border border-cyan-500/20 p-6 rounded-2xl">
              <div className="text-sm text-gray-400 mb-1">Ingresos Totales</div>
              <div className="text-3xl font-black text-cyan-400 mb-1">S/ {totalRevenue}</div>
              <div className="text-xs text-yellow-400 font-bold">{pendingPayments} pagos pendientes</div>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-purple-900/30 border border-purple-500/30 p-1 mb-8 flex-wrap h-auto">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="prizes" className="data-[state=active]:bg-purple-600">
              <Trophy className="w-4 h-4 mr-2" />
              Premios
            </TabsTrigger>
            <TabsTrigger value="winners" className="data-[state=active]:bg-yellow-600">
              <Crown className="w-4 h-4 mr-2" />
              Ganadores
            </TabsTrigger>
            <TabsTrigger value="participations" className="data-[state=active]:bg-green-600">
              <Users className="w-4 h-4 mr-2" />
              Participaciones
            </TabsTrigger>
            <TabsTrigger value="podcast" className="data-[state=active]:bg-pink-600">
              <Mic className="w-4 h-4 mr-2" />
              Podcast
            </TabsTrigger>
            <TabsTrigger value="gaming" className="data-[state=active]:bg-cyan-600">
              <Gamepad2 className="w-4 h-4 mr-2" />
              Gaming
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <Card className="bg-gradient-to-br from-purple-900/30 to-transparent border border-purple-500/20 p-8 rounded-3xl">
              <h2 className="text-2xl font-black text-white mb-6">Resumen General</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-black/30 rounded-xl">
                  <span className="text-gray-400">Premios Activos</span>
                  <span className="text-white font-bold">{prizes.filter(p => p.status === "active").length}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-black/30 rounded-xl">
                  <span className="text-gray-400">Pagos Confirmados</span>
                  <span className="text-green-400 font-bold">{participations.filter(p => p.payment_status === "confirmed").length}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-black/30 rounded-xl">
                  <span className="text-gray-400">Pagos Pendientes</span>
                  <span className="text-yellow-400 font-bold">{pendingPayments}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-black/30 rounded-xl">
                  <span className="text-gray-400">Episodios de Podcast</span>
                  <span className="text-white font-bold">{podcasts.length}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-black/30 rounded-xl">
                  <span className="text-gray-400">Contenido Gaming</span>
                  <span className="text-white font-bold">{gaming.length}</span>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Prizes Tab */}
          <TabsContent value="prizes">
            <div className="mb-6">
              <Button
                onClick={() => setShowPrizeForm(!showPrizeForm)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nuevo Premio
              </Button>
            </div>

            {showPrizeForm && (
              <Card className="bg-gradient-to-br from-purple-900/30 to-transparent border border-purple-500/20 p-6 rounded-2xl mb-6">
                <h3 className="text-xl font-black text-white mb-4">Crear Nuevo Premio</h3>
                <p className="text-gray-400 text-sm mb-4">Usa el panel de datos para crear premios manualmente</p>
                <Button variant="outline" className="border-purple-500/30 text-white">
                  Ir a Gestión de Datos
                </Button>
              </Card>
            )}

            <div className="grid gap-4">
              {prizes.map((prize) => (
                <Card key={prize.id} className="bg-gradient-to-br from-purple-900/30 to-transparent border border-purple-500/20 p-6 rounded-2xl">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      {prize.image_url && (
                        <img src={prize.image_url} alt={prize.title} className="w-24 h-24 object-cover rounded-xl" />
                      )}
                      <div>
                        <h3 className="text-xl font-black text-white mb-1">{prize.title}</h3>
                        <p className="text-gray-400 text-sm mb-2">{prize.description}</p>
                        <div className="flex gap-4 text-sm">
                          <span className="text-purple-400 font-bold">S/ {prize.participation_cost}</span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-400">{new Date(prize.draw_date).toLocaleDateString('es-ES')}</span>
                          <span className="text-gray-500">•</span>
                          <span className={`font-bold ${
                            prize.status === "active" ? "text-green-400" : 
                            prize.status === "upcoming" ? "text-cyan-400" : "text-gray-400"
                          }`}>
                            {prize.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Winners Tab */}
          <TabsContent value="winners">
            <div className="mb-6">
              <Button
                onClick={() => setShowWinnerForm(!showWinnerForm)}
                className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-black font-bold"
              >
                <Plus className="w-5 h-5 mr-2" />
                Registrar Ganador
              </Button>
            </div>

            <div className="grid gap-4">
              {winners.map((winner) => (
                <Card key={winner.id} className="bg-gradient-to-br from-yellow-900/20 to-transparent border border-yellow-500/20 p-6 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-2xl font-black text-white">
                      {winner.winner_name[0]}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-black text-white">{winner.winner_name}</h3>
                      <p className="text-yellow-400 font-bold">{winner.prize_title}</p>
                      <p className="text-gray-500 text-sm">{new Date(winner.winner_date).toLocaleDateString('es-ES')}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Participations Tab */}
          <TabsContent value="participations">
            <div className="grid gap-4">
              {participations.map((participation) => (
                <Card key={participation.id} className="bg-gradient-to-br from-purple-900/30 to-transparent border border-purple-500/20 p-6 rounded-2xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-black text-white">{participation.user_name}</h3>
                      <p className="text-gray-400 text-sm">{participation.user_email}</p>
                      <p className="text-purple-400 font-bold mt-2">{participation.prize_title}</p>
                      <p className="text-gray-500 text-sm">S/ {participation.amount_paid}</p>
                    </div>
                    <div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        participation.payment_status === "confirmed" ? "bg-green-600 text-white" :
                        participation.payment_status === "pending" ? "bg-yellow-600 text-black" :
                        "bg-red-600 text-white"
                      }`}>
                        {participation.payment_status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  {participation.payment_screenshot_url && (
                    <div className="mt-4">
                      <a href={participation.payment_screenshot_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="border-purple-500/30 text-purple-400">
                          Ver Comprobante
                        </Button>
                      </a>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Podcast Tab */}
          <TabsContent value="podcast">
            <div className="mb-6">
              <Button
                onClick={() => setShowPodcastForm(!showPodcastForm)}
                className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nuevo Episodio
              </Button>
            </div>

            <div className="grid gap-4">
              {podcasts.map((episode) => (
                <Card key={episode.id} className="bg-gradient-to-br from-pink-900/20 to-transparent border border-pink-500/20 p-6 rounded-2xl">
                  <div className="flex gap-4">
                    {episode.cover_image_url && (
                      <img src={episode.cover_image_url} alt={episode.title} className="w-24 h-24 object-cover rounded-xl" />
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-black text-white mb-1">{episode.title}</h3>
                      <p className="text-gray-400 text-sm mb-2">{episode.description}</p>
                      <div className="flex gap-3 text-sm text-gray-500">
                        <span>{new Date(episode.publish_date).toLocaleDateString('es-ES')}</span>
                        {episode.duration && <><span>•</span><span>{episode.duration}</span></>}
                        {episode.guests && <><span>•</span><span className="text-purple-400">{episode.guests}</span></>}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Gaming Tab */}
          <TabsContent value="gaming">
            <div className="mb-6">
              <Button
                onClick={() => setShowGamingForm(!showGamingForm)}
                className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white font-bold"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nuevo Contenido
              </Button>
            </div>

            <div className="grid gap-4">
              {gaming.map((content) => (
                <Card key={content.id} className="bg-gradient-to-br from-cyan-900/20 to-transparent border border-cyan-500/20 p-6 rounded-2xl">
                  <div className="flex gap-4">
                    {content.thumbnail_url && (
                      <img src={content.thumbnail_url} alt={content.title} className="w-32 h-24 object-cover rounded-xl" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          content.platform === "youtube" ? "bg-red-600" :
                          content.platform === "twitch" ? "bg-purple-600" : "bg-pink-600"
                        } text-white`}>
                          {content.platform.toUpperCase()}
                        </span>
                        <span className="px-2 py-1 bg-cyan-600/30 text-cyan-400 rounded text-xs font-bold">
                          {content.category}
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-white mb-1">{content.title}</h3>
                      <p className="text-gray-400 text-sm">{content.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}