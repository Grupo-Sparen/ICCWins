import React from "react";
import { Card } from "@/components/ui/card";
import { Trophy, CheckCircle } from "lucide-react";

export default function TournamentBracket({ matches, isAdmin, onRegisterResult }) {
  // Si no hay matches, mostrar mensaje
  if (!matches || matches.length === 0) {
    return (
      <div className="bg-gradient-to-br from-purple-900/30 to-transparent border border-purple-500/20 p-12 rounded-2xl text-center">
        <div className="text-gray-400">No hay partidos generados aún</div>
      </div>
    );
  }

  // Organizar partidos por rondas
  const roundsData = {};
  matches.forEach(match => {
    if (!roundsData[match.round]) {
      roundsData[match.round] = [];
    }
    roundsData[match.round].push(match);
  });

  const rounds = Object.keys(roundsData).sort((a, b) => parseInt(a) - parseInt(b));
  const maxRound = rounds.length > 0 ? Math.max(...rounds.map(r => parseInt(r))) : 1;

  // Nombres de rondas
  const getRoundName = (round, totalRounds) => {
    const roundNum = parseInt(round);
    if (roundNum === totalRounds) return "Final";
    if (roundNum === totalRounds - 1) return "Semifinales";
    if (roundNum === totalRounds - 2) return "Cuartos";
    return `Ronda ${roundNum}`;
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/30 to-transparent border border-purple-500/20 p-6 rounded-2xl overflow-x-auto">
      <div className="flex gap-8 min-w-max">
        {rounds.map((round) => {
          const roundMatches = roundsData[round].sort((a, b) => a.match_number - b.match_number);
          const isLastRound = parseInt(round) === maxRound;

          return (
            <div key={round} className="flex flex-col gap-4 min-w-[220px]">
              {/* Round Header */}
              <div className="text-center mb-2">
                <h3 className="text-sm font-black text-purple-400 uppercase">
                  {getRoundName(round, maxRound)}
                </h3>
              </div>

              {/* Matches */}
              <div className="flex flex-col justify-around gap-4" style={{ minHeight: `${roundMatches.length * 120}px` }}>
                {roundMatches.map((match) => (
                  <div key={match.id} className="relative">
                    <Card className="bg-[#2A2A3E] border border-purple-500/30 p-3 rounded-xl hover:border-purple-500/60 transition-all">
                      {/* Player 1 */}
                      <div className={`flex items-center justify-between mb-2 px-3 py-2 rounded-lg ${
                        match.winner_id && match.winner_id === match.player1_id 
                          ? "bg-yellow-600/30 border border-yellow-500/50" 
                          : match.status === "completed" && match.winner_id && match.winner_id !== match.player1_id
                          ? "bg-gray-700/30 border border-gray-600/50"
                          : "bg-[#1A1A2E]"
                      }`}>
                        <div className={`font-bold text-sm truncate flex-1 ${
                          match.winner_id && match.winner_id === match.player1_id 
                            ? "text-yellow-400" 
                            : match.status === "completed" && match.winner_id && match.winner_id !== match.player1_id
                            ? "text-gray-500"
                            : "text-white"
                        }`}>
                          {match.player1_name || "TBD"}
                        </div>
                        {match.status === "completed" && (
                          <div className="text-white font-bold ml-2">{match.player1_score}</div>
                        )}
                        {isAdmin && match.status === "pending" && match.player1_id && match.player2_id && (
                          <button
                            onClick={() => onRegisterResult(match, match.player1_id, match.player1_name)}
                            className="ml-2 p-1 rounded-full hover:bg-green-600/20 transition-colors"
                          >
                            <CheckCircle className="w-5 h-5 text-green-400 hover:text-green-300" />
                          </button>
                        )}
                      </div>

                      {/* VS or Score */}
                      <div className="text-center text-xs text-gray-500 my-1">
                        {match.status === "completed" ? (
                          <span className="text-green-400 font-bold">FINALIZADO</span>
                        ) : match.status === "in_progress" ? (
                          <span className="text-blue-400 font-bold">EN CURSO</span>
                        ) : (
                          <span>VS</span>
                        )}
                      </div>

                      {/* Player 2 */}
                      <div className={`flex items-center justify-between px-3 py-2 rounded-lg ${
                        match.winner_id && match.winner_id === match.player2_id 
                          ? "bg-yellow-600/30 border border-yellow-500/50" 
                          : match.status === "completed" && match.winner_id && match.winner_id !== match.player2_id
                          ? "bg-gray-700/30 border border-gray-600/50"
                          : "bg-[#1A1A2E]"
                      }`}>
                        <div className={`font-bold text-sm truncate flex-1 ${
                          match.winner_id && match.winner_id === match.player2_id 
                            ? "text-yellow-400" 
                            : match.status === "completed" && match.winner_id && match.winner_id !== match.player2_id
                            ? "text-gray-500"
                            : "text-white"
                        }`}>
                          {match.player2_name || "TBD"}
                        </div>
                        {match.status === "completed" && (
                          <div className="text-white font-bold ml-2">{match.player2_score}</div>
                        )}
                        {isAdmin && match.status === "pending" && match.player1_id && match.player2_id && (
                          <button
                            onClick={() => onRegisterResult(match, match.player2_id, match.player2_name)}
                            className="ml-2 p-1 rounded-full hover:bg-green-600/20 transition-colors"
                          >
                            <CheckCircle className="w-5 h-5 text-green-400 hover:text-green-300" />
                          </button>
                        )}
                      </div>
                    </Card>

                    {/* Connection Line to Next Round */}
                    {!isLastRound && (
                      <div className="absolute top-1/2 left-full w-8 h-0.5 bg-purple-500/30" style={{ transform: 'translateY(-50%)' }}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Winner Column */}
        {maxRound > 0 && (() => {
          const finalMatches = roundsData[maxRound] || [];
          // Solo mostrar ganador si TODOS los matches de la final están completados
          const allFinalCompleted = finalMatches.length > 0 && finalMatches.every(m => m.status === "completed");
          const winner = allFinalCompleted ? finalMatches[0]?.winner_name : null;

          return (
            <div className="flex flex-col gap-4 min-w-[220px]">
              <div className="text-center mb-2">
                <h3 className="text-sm font-black text-yellow-400 uppercase">
                  Ganador
                </h3>
              </div>
              <div className="flex items-center justify-center" style={{ minHeight: `${(roundsData[maxRound]?.length || 1) * 120}px` }}>
                {winner ? (
                  <Card className="bg-gradient-to-br from-yellow-600/30 to-orange-600/20 border-2 border-yellow-500/50 p-6 rounded-2xl text-center">
                    <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                    <div className="text-xl font-black text-yellow-400">{winner}</div>
                    <div className="text-xs text-yellow-300/70 mt-2">CAMPEÓN</div>
                  </Card>
                ) : (
                  <Card className="bg-[#2A2A3E] border border-purple-500/30 p-6 rounded-2xl text-center">
                    <Trophy className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <div className="text-sm text-gray-400">Por determinar</div>
                  </Card>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}