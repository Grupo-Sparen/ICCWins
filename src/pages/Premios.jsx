import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Calendar, DollarSign, Users, Zap, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Premios() {
  const [filter, setFilter] = useState("active");

  const { data: prizes = [], isLoading } = useQuery({
    queryKey: ["prizes"],
    queryFn: () => base44.entities.Prize.list("-draw_date")
  });

  const filteredPrizes = prizes.filter(prize => {
    if (filter === "all") return true;
    return prize.status === filter;
  });

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-purple-600/20 border border-purple-500/30 px-4 py-2 rounded-full mb-6">
            <Trophy className="w-4 h-4 text-purple-400" />
            <span className="text-purple-300 font-bold text-sm">PREMIOS DISPONIBLES</span>
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-black text-white mb-6">
            Premios <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Increíbles</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Explora todos los premios disponibles. Cada premio tiene su propio sorteo independiente. 
            <span className="text-purple-400 font-bold"> ¡Participa en el que más te guste!</span>
          </p>
        </div>

        {/* Filters */}
        <div className="flex justify-center mb-12">
          <Tabs value={filter} onValueChange={setFilter} className="w-auto">
            <TabsList className="bg-purple-900/30 border border-purple-500/30 p-1 h-auto">
              <TabsTrigger 
                value="active" 
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-400 font-bold px-6 py-3 rounded-lg"
              >
                <Zap className="w-4 h-4 mr-2" />
                Activos
              </TabsTrigger>
              <TabsTrigger 
                value="upcoming"
                className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-gray-400 font-bold px-6 py-3 rounded-lg"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Próximos
              </TabsTrigger>
              <TabsTrigger 
                value="finished"
                className="data-[state=active]:bg-gray-600 data-[state=active]:text-white text-gray-400 font-bold px-6 py-3 rounded-lg"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Finalizados
              </TabsTrigger>
              <TabsTrigger 
                value="all"
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400 font-bold px-6 py-3 rounded-lg"
              >
                Todos
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Prizes Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="bg-gradient-to-br from-purple-900/30 to-transparent border border-purple-500/20 p-6 rounded-2xl animate-pulse">
                <div className="w-full h-64 bg-purple-900/40 rounded-xl mb-4"></div>
                <div className="h-8 bg-purple-900/40 rounded mb-3"></div>
                <div className="h-20 bg-purple-900/40 rounded mb-4"></div>
                <div className="h-12 bg-purple-900/40 rounded"></div>
              </Card>
            ))}
          </div>
        ) : filteredPrizes.length === 0 ? (
          <Card className="bg-gradient-to-br from-purple-900/30 to-transparent border border-purple-500/20 p-12 rounded-3xl text-center">
            <Filter className="w-20 h-20 text-purple-400 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-white mb-2">No hay premios en esta categoría</h3>
            <p className="text-gray-400 mb-6">Prueba con otro filtro o vuelve pronto</p>
            <Button 
              onClick={() => setFilter("active")}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
            >
              Ver Premios Activos
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPrizes.map((prize) => (
              <Card 
                key={prize.id} 
                className="bg-gradient-to-br from-purple-900/30 to-transparent border border-purple-500/20 rounded-2xl overflow-hidden card-hover group"
              >
                {/* Image */}
                <div className="relative overflow-hidden">
                  <img 
                    src={prize.image_url || "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600"} 
                    alt={prize.title}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    {prize.status === "active" && (
                      <div className="bg-green-600 text-white px-4 py-2 rounded-full font-black text-sm flex items-center gap-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        ACTIVO
                      </div>
                    )}
                    {prize.status === "upcoming" && (
                      <div className="bg-cyan-600 text-white px-4 py-2 rounded-full font-black text-sm">
                        PRÓXIMAMENTE
                      </div>
                    )}
                    {prize.status === "finished" && (
                      <div className="bg-gray-600 text-white px-4 py-2 rounded-full font-black text-sm">
                        FINALIZADO
                      </div>
                    )}
                  </div>

                  {/* Featured Badge */}
                  {prize.featured && (
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-4 py-2 rounded-full font-black text-sm flex items-center gap-1">
                      <Trophy className="w-4 h-4" />
                      DESTACADO
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-2xl font-black text-white mb-3 group-hover:text-purple-400 transition-colors">
                    {prize.title}
                  </h3>
                  
                  <p className="text-gray-400 mb-6 line-clamp-3">
                    {prize.description}
                  </p>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-black/30 p-3 rounded-xl">
                      <div className="flex items-center gap-1 text-purple-400 mb-1">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-xs font-semibold">Costo</span>
                      </div>
                      <div className="text-xl font-black text-white">S/ {prize.participation_cost}</div>
                    </div>
                    
                    <div className="bg-black/30 p-3 rounded-xl">
                      <div className="flex items-center gap-1 text-cyan-400 mb-1">
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs font-semibold">Sorteo</span>
                      </div>
                      <div className="text-sm font-bold text-white">
                        {new Date(prize.draw_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                  </div>

                  {prize.total_participants > 0 && (
                    <div className="flex items-center gap-2 mb-4 text-sm text-gray-400">
                      <Users className="w-4 h-4" />
                      <span className="font-semibold">{prize.total_participants} participantes</span>
                    </div>
                  )}

                  {/* CTA Button */}
                  {prize.status === "active" ? (
                    <Link to={createPageUrl("Participar") + "?prize=" + prize.id} className="block">
                      <Button className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-black rounded-xl">
                        <Zap className="w-5 h-5 mr-2" />
                        Participar Ahora
                      </Button>
                    </Link>
                  ) : prize.status === "upcoming" ? (
                    <Button disabled className="w-full h-12 bg-gray-700 text-gray-400 font-bold rounded-xl cursor-not-allowed">
                      Próximamente
                    </Button>
                  ) : (
                    <Link to={createPageUrl("Ganadores") + "?prize=" + prize.id} className="block">
                      <Button className="w-full h-12 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl">
                        <Trophy className="w-5 h-5 mr-2" />
                        Ver Ganador
                      </Button>
                    </Link>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        {filteredPrizes.length > 0 && (
          <div className="mt-20 text-center">
            <Card className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 p-12 rounded-3xl inline-block">
              <Trophy className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-3xl font-black text-white mb-3">¿Listo para Ganar?</h3>
              <p className="text-gray-300 mb-6 max-w-md">
                Elige tu premio favorito y participa ahora. ¡Podrías ser el próximo ganador increíble!
              </p>
              <Link to={createPageUrl("Participar")}>
                <Button className="h-14 px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-black text-lg rounded-xl">
                  <Zap className="w-5 h-5 mr-2" />
                  Participar Ahora
                </Button>
              </Link>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}