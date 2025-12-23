import React from "react";
import { Globe, DollarSign } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "./LanguageContext";

export default function LanguageCurrencySelector() {
  const { language, setLanguage, currency, setCurrency } = useLanguage();
  
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Globe className="w-4 h-4 text-gray-400" />
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="h-9 w-24 bg-white/5 border-white/10 text-white text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="es">🇪🇸 ES</SelectItem>
            <SelectItem value="en">🇺🇸 EN</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <DollarSign className="w-4 h-4 text-gray-400" />
        <Select value={currency} onValueChange={setCurrency}>
          <SelectTrigger className="h-9 w-24 bg-white/5 border-white/10 text-white text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PEN">S/ PEN</SelectItem>
            <SelectItem value="USD">$ USD</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}