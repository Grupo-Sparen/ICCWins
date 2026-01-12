import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";
import { Calendar, Gift } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";

export default function PrizesSlider() {
  const { data: prizes = [], isLoading } = useQuery({
    queryKey: ["active-prizes"],
    queryFn: () => base44.entities.Prize.filter({ status: "active" }, "-draw_date", 10)
  });

  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-black/30 p-6 rounded-xl animate-pulse">
            <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-4"></div>
            <div className="h-6 bg-gray-700 rounded mb-2"></div>
            <div className="h-4 bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (prizes.length === 0) {
    return (
      <div className="text-center py-8">
        <Gift className="w-12 h-12 text-gray-500 mx-auto mb-3" />
        <p className="text-gray-400">No hay premios activos en este momento</p>
      </div>
    );
  }

  return (
    <Carousel
      plugins={[plugin.current]}
      className="w-full"
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent>
        {prizes.map((prize) => (
          <CarouselItem key={prize.id} className="md:basis-1/2 lg:basis-1/3">
            <Card className="bg-black/30 p-6 rounded-xl border border-yellow-500/20 hover:border-yellow-500/40 transition-all">
              {prize.image_url ? (
                <img 
                  src={prize.image_url} 
                  alt={prize.title}
                  className="w-full h-32 object-cover rounded-lg mb-4"
                />
              ) : (
                <div className="text-4xl mb-4 text-center">🎁</div>
              )}
              <h4 className="text-lg font-black text-white mb-2 text-center line-clamp-2">
                {prize.title}
              </h4>
              <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
                <Calendar className="w-4 h-4" />
                <span>Sorteo: {new Date(prize.draw_date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}</span>
              </div>
              {prize.featured && (
                <div className="mt-3 text-center">
                  <span className="px-3 py-1 bg-yellow-600 text-black text-xs font-bold rounded-full">
                    ⭐ DESTACADO
                  </span>
                </div>
              )}
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden md:flex -left-12 bg-purple-600 hover:bg-purple-700 border-purple-500" />
      <CarouselNext className="hidden md:flex -right-12 bg-purple-600 hover:bg-purple-700 border-purple-500" />
    </Carousel>
  );
}