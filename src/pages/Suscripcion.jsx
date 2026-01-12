import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trophy, Zap, CheckCircle, Star, Crown, Sparkles, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import LanguageCurrencySelector from "../components/LanguageCurrencySelector";
import SubscriptionModal from "../components/SubscriptionModal";
import PrizesSlider from "../components/PrizesSlider";

const translations = {
  es: {
    title: "Elige tu Dosis de",
    titleHighlight: "SUERTE",
    subtitle: "Elige tu plan recurrente y confía en tu suerte",
    monthly: "PLAN MENSUAL",
    quarterly: "PLAN TRIMESTRAL",
    semestral: "PLAN SEMESTRAL",
    perMonth: "Mensuales",
    perQuarter: "Trimestrales",
    perSemester: "Semestrales",
    subscribe: "¡Suscribirme ya!",
    benefits: {
      allPrizes: "Participas en TODOS los premios semanales",
      active: "mientras tu suscripción esté activa",
      discounts: "Descuentos en marcas aliadas",
      vip: "Te conviertes en Suertudo VIP",
      yape: "Puedes pagar con Yape"
    }
  },
  en: {
    title: "Choose your Dose of",
    titleHighlight: "LUCK",
    subtitle: "Choose your recurring plan and trust your luck",
    monthly: "MONTHLY PLAN",
    quarterly: "QUARTERLY PLAN",
    semestral: "SEMESTRAL PLAN",
    perMonth: "Per Month",
    perQuarter: "Per Quarter",
    perSemester: "Per Semester",
    subscribe: "Subscribe now!",
    benefits: {
      allPrizes: "Participate in ALL weekly prizes",
      active: "while your subscription is active",
      discounts: "Discounts on partner brands",
      vip: "You become a VIP Member",
      yape: "You can pay with Yape"
    }
  }
};

export default function Suscripcion() {
  const [language, setLanguage] = useState("es");
  const [currency, setCurrency] = useState("PEN");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const queryClient = useQueryClient();

  const t = translations[language];

  const { data: plans = [] } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: () => base44.entities.SubscriptionPlan.filter({ active: true }, "-created_date")
  });

  const { data: userSubscription } = useQuery({
    queryKey: ["user-subscription"],
    queryFn: async () => {
      try {
        const user = await base44.auth.me();
        if (!user) return null;
        const subs = await base44.entities.Subscription.filter({ 
          user_email: user.email, 
          status: "active" 
        }, "-created_date", 1);
        return subs[0] || null;
      } catch {
        return null;
      }
    }
  });

  const formatPrice = (plan) => {
    if (!plan) return "";
    const price = currency === "PEN" ? plan.price_pen : plan.price_usd;
    const symbol = currency === "PEN" ? "S/" : "$";
    return `${symbol}${price}`;
  };

  const getPlanName = (plan) => {
    return language === "es" ? plan.name_es : (plan.name_en || plan.name_es);
  };

  const getPlanDescription = (plan) => {
    return language === "es" ? plan.description_es : (plan.description_en || plan.description_es);
  };

  const getBenefitText = (benefit) => {
    return language === "es" ? benefit.text_es : (benefit.text_en || benefit.text_es);
  };

  return (
    <div className="min-h-screen py-20 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-pink-900/30 to-purple-900/40"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Language & Currency Selector */}
        <div className="flex justify-end mb-8">
          <LanguageCurrencySelector 
            language={language} 
            setLanguage={setLanguage}
            currency={currency}
            setCurrency={setCurrency}
          />
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl lg:text-7xl font-black text-white mb-4 leading-tight">
            {t.title}<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-cyan-400 to-purple-400">
              {t.titleHighlight}
            </span>
          </h1>
          <p className="text-xl lg:text-2xl text-gray-300 font-semibold">
            {t.subtitle}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.filter(p => p.duration_months === 1).map((plan) => (
            <Card 
              key={plan.id}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border-2 border-white/20 rounded-3xl p-8 lg:p-10 hover:scale-105 transition-transform duration-300"
            >
              <div className="text-center mb-8">
                <div className="inline-block bg-purple-600 text-white px-4 py-2 rounded-full font-black text-sm mb-4">
                  {t.monthly}
                </div>
                
                <div className="mb-4">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                    <Zap className="w-16 h-16 text-white" />
                  </div>
                </div>

                <h3 className="text-3xl font-black text-white mb-2">{getPlanName(plan)}</h3>
                <p className="text-gray-300 text-sm mb-6">{getPlanDescription(plan)}</p>

                {/* Price */}
                <div className="mb-6">
                  <div className="text-6xl font-black text-white mb-2">
                    {formatPrice(plan)}
                  </div>
                  <div className="text-gray-300 font-bold">{t.perMonth}</div>
                </div>
              </div>

              {/* Benefits */}
              <div className="space-y-4 mb-8">
                {plan.benefits?.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-1" />
                    <span className="text-white font-semibold">{getBenefitText(benefit)}</span>
                  </div>
                ))}
              </div>

              <Button 
                onClick={() => setSelectedPlan(plan)}
                disabled={userSubscription?.plan_id === plan.id}
                className="w-full h-14 bg-gradient-to-r from-green-400 to-cyan-400 hover:from-green-500 hover:to-cyan-500 text-black font-black text-lg rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {userSubscription?.plan_id === plan.id ? (language === "es" ? "Plan Actual" : "Current Plan") : t.subscribe}
              </Button>
            </Card>
          ))}

          {plans.filter(p => p.duration_months === 3).map((plan) => (
            <Card 
              key={plan.id}
              className={`relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border-2 rounded-3xl p-8 lg:p-10 hover:scale-105 transition-transform duration-300 ${
                plan.featured ? "border-yellow-400" : "border-white/20"
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-6 py-2 rounded-full font-black text-sm flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  RECOMENDADO
                </div>
              )}

              <div className="text-center mb-8">
                <div className="inline-block bg-cyan-600 text-white px-4 py-2 rounded-full font-black text-sm mb-4">
                  {t.quarterly}
                </div>
                
                <div className="mb-4">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
                    <Trophy className="w-16 h-16 text-white" />
                  </div>
                </div>

                <h3 className="text-3xl font-black text-white mb-2">{getPlanName(plan)}</h3>
                <p className="text-gray-300 text-sm mb-6">{getPlanDescription(plan)}</p>

                {/* Price */}
                <div className="mb-6">
                  <div className="text-6xl font-black text-white mb-2">
                    {formatPrice(plan)}
                  </div>
                  <div className="text-gray-300 font-bold">{t.perQuarter}</div>
                </div>
              </div>

              {/* Benefits */}
              <div className="space-y-4 mb-8">
                {plan.benefits?.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-1" />
                    <span className="text-white font-semibold">{getBenefitText(benefit)}</span>
                  </div>
                ))}
              </div>

              <Button 
                onClick={() => setSelectedPlan(plan)}
                disabled={userSubscription?.plan_id === plan.id}
                className="w-full h-14 bg-gradient-to-r from-green-400 to-cyan-400 hover:from-green-500 hover:to-cyan-500 text-black font-black text-lg rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {userSubscription?.plan_id === plan.id ? (language === "es" ? "Plan Actual" : "Current Plan") : t.subscribe}
              </Button>
            </Card>
          ))}

          {plans.filter(p => p.duration_months === 6).map((plan) => (
            <Card 
              key={plan.id}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border-2 border-white/20 rounded-3xl p-8 lg:p-10 hover:scale-105 transition-transform duration-300"
            >
              <div className="text-center mb-8">
                <div className="inline-block bg-yellow-600 text-white px-4 py-2 rounded-full font-black text-sm mb-4">
                  {t.semestral}
                </div>
                
                <div className="mb-4">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mb-4">
                    <Crown className="w-16 h-16 text-white" />
                  </div>
                </div>

                <h3 className="text-3xl font-black text-white mb-2">{getPlanName(plan)}</h3>
                <p className="text-gray-300 text-sm mb-6">{getPlanDescription(plan)}</p>

                {/* Price */}
                <div className="mb-6">
                  <div className="text-6xl font-black text-white mb-2">
                    {formatPrice(plan)}
                  </div>
                  <div className="text-gray-300 font-bold">{t.perSemester}</div>
                </div>
              </div>

              {/* Benefits */}
              <div className="space-y-4 mb-8">
                {plan.benefits?.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-1" />
                    <span className="text-white font-semibold">{getBenefitText(benefit)}</span>
                  </div>
                ))}
              </div>

              <Button 
                onClick={() => setSelectedPlan(plan)}
                disabled={userSubscription?.plan_id === plan.id}
                className="w-full h-14 bg-gradient-to-r from-green-400 to-cyan-400 hover:from-green-500 hover:to-cyan-500 text-black font-black text-lg rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {userSubscription?.plan_id === plan.id ? (language === "es" ? "Plan Actual" : "Current Plan") : t.subscribe}
              </Button>
            </Card>
          ))}
        </div>

        {/* Prizes Section */}
        <div className="mt-20">
          <h3 className="text-3xl font-black text-white mb-8 text-center">
            {language === "es" ? "Premios Semanales" : "Weekly Prizes"}
          </h3>
          <PrizesSlider />
        </div>

        {/* Subscription Modal */}
        {selectedPlan && (
          <SubscriptionModal
            plan={selectedPlan}
            currency={currency}
            language={language}
            onClose={() => setSelectedPlan(null)}
          />
        )}
      </div>
    </div>
  );
}