import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Crown, Trophy, Calendar, MapPin, Play, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function Ganadores() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: winners = [], isLoading } = useQuery({
    queryKey: ["winners"],
    queryFn: () => base44.entities.Winner.list("-winner_date")
  });

  const filteredWinners = winners.filter(winner => 
    winner.prize_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    winner.winner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (winner.winner_country && winner.winner_country.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-yellow-600/20 border border-yellow-500/30 px-4 py-2 rounded-full mb-6">
            <Crown className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-300 font-bold text-sm">HALL DE LA FAMA</span>
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-black text-white mb-6">
            Nuestros <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">Ganadores</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
            <span className="text-yellow-400 font-bold">100% transparencia.</span> Todos los sorteos se transmiten en vivo por TikTok Live. 
            Aquí puedes ver a todos los ganadores y los videos de los sorteos.
          </p>

          {/* Search */}
          <div className="max-w-md mx-auto">
            <Input
              type="text"
              placeholder="Buscar por premio, ganador o país..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-12 bg-purple-900/30 border-purple-500/30 text-white placeholder:text-gray-500 rounded-xl"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card className="bg-gradient-to-br from-yellow-900/30 to-transparent border border-yellow-500/20 p-6 rounded-2xl text-center">
            <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
            <div className="text-4xl font-black text-white mb-1">{winners.length}</div>
            <div className="text-gray-400 font-semibold">Ganadores Totales</div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/30 to-transparent border border-purple-500/20 p-6 rounded-2xl text-center">
            <Trophy className="w-12 h-12 text-purple-400 mx-auto mb-3" />
            <div className="text-4xl font-black text-white mb-1">
              {new Set(winners.map(w => w.prize_id)).size}
            </div>
            <div className="text-gray-400 font-semibold">Premios Entregados</div>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/30 to-transparent border border-green-500/20 p-6 rounded-2xl text-center">
            <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <div className="text-4xl font-black text-white mb-1">100%</div>
            <div className="text-gray-400 font-semibold">Transparencia</div>
          </Card>
        </div>

        {/* Winners List */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-gradient-to-br from-purple-900/30 to-transparent border border-purple-500/20 p-6 rounded-2xl animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-20 h-20 bg-purple-900/40 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-6 bg-purple-900/40 rounded mb-2"></div>
                    <div className="h-4 bg-purple-900/40 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="h-24 bg-purple-900/40 rounded"></div>
              </Card>
            ))}
          </div>
        ) : filteredWinners.length === 0 ? (
          <Card className="bg-gradient-to-br from-purple-900/30 to-transparent border border-purple-500/20 p-12 rounded-3xl text-center">
            <Crown className="w-20 h-20 text-purple-400 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-white mb-2">No se encontraron ganadores</h3>
            <p className="text-gray-400 mb-6">Intenta con otra búsqueda</p>
            <Button 
              onClick={() => setSearchTerm("")}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
            >
              Ver Todos
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {filteredWinners.map((winner) => (
              <Card 
                key={winner.id}
                className="bg-gradient-to-br from-yellow-900/20 to-purple-900/20 border border-yellow-500/30 rounded-2xl overflow-hidden card-hover"
              >
                <div className="p-6">
                  {/* Winner Info */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="relative">
                      {winner.winner_photo_url ? (
                        <img 
                          src={winner.winner_photo_url} 
                          alt={winner.winner_name}
                          className="w-20 h-20 rounded-full object-cover border-4 border-yellow-500"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-3xl font-black text-white border-4 border-yellow-500">
                          {winner.winner_name[0].toUpperCase()}
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                        <Crown className="w-5 h-5 text-black" />
                      </div>
                    </div>

                    <div className="flex-1">
                      <h3 className="text-2xl font-black text-white mb-1">{winner.winner_name}</h3>
                      {winner.winner_country && (
                        <div className="flex items-center gap-1 text-gray-400 mb-2">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm font-semibold">{winner.winner_country}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs font-semibold">
                          {new Date(winner.winner_date).toLocaleDateString('es-ES', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Prize Won */}
                  <div className="bg-black/40 p-4 rounded-xl mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                      <span className="text-yellow-400 font-black text-sm uppercase tracking-wide">GANÓ</span>
                    </div>
                    <p className="text-white font-bold text-lg">{winner.prize_title}</p>
                  </div>

                  {/* Video Link */}
                  {winner.draw_video_url && (
                    <a 
                      href={winner.draw_video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button className="w-full h-12 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold rounded-xl">
                        <Play className="w-5 h-5 mr-2" />
                        Ver Sorteo en TikTok Live
                      </Button>
                    </a>
                  )}
                </div>

                {/* Confetti Effect */}
                <div className="h-2 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500"></div>
              </Card>
            ))}
          </div>
        )}

        {/* Bottom Section */}
        {filteredWinners.length > 0 && (
          <div className="mt-20 text-center">
            <Card className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 p-12 rounded-3xl inline-block max-w-2xl">
              <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-3xl font-black text-white mb-3">¿Quieres Ser el Próximo?</h3>
              <p className="text-gray-300 mb-6">
                Únete a nuestra comunidad y participa en los sorteos. ¡Tu nombre podría estar aquí pronto!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button className="h-12 px-8 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-black font-black rounded-xl">
                  Ver Premios Activos
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}