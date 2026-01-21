import React, { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("language") || "es";
  });
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem("currency") || "PEN";
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Detect user location on mount only if no preferences saved
    const savedLanguage = localStorage.getItem("language");
    const savedCurrency = localStorage.getItem("currency");
    
    if (savedLanguage && savedCurrency) {
      setIsLoading(false);
      return;
    }

    const detectLocation = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        
        // Set language based on country
        const countryCode = data.country_code;
        const spanishCountries = ["PE", "AR", "CL", "CO", "MX", "EC", "BO", "PY", "UY", "VE", "PA", "CR", "ES"];
        
        const detectedLanguage = spanishCountries.includes(countryCode) ? "es" : "en";
        const detectedCurrency = countryCode === "PE" ? "PEN" : "USD";

        if (!savedLanguage) {
          setLanguage(detectedLanguage);
          localStorage.setItem("language", detectedLanguage);
        }
        if (!savedCurrency) {
          setCurrency(detectedCurrency);
          localStorage.setItem("currency", detectedCurrency);
        }
      } catch (error) {
        console.error("Error detecting location:", error);
        if (!savedLanguage) {
          setLanguage("es");
          localStorage.setItem("language", "es");
        }
        if (!savedCurrency) {
          setCurrency("PEN");
          localStorage.setItem("currency", "PEN");
        }
      } finally {
        setIsLoading(false);
      }
    };

    detectLocation();
  }, []);

  const handleSetLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem("language", newLanguage);
  };

  const handleSetCurrency = (newCurrency) => {
    setCurrency(newCurrency);
    localStorage.setItem("currency", newCurrency);
  };

  const convertPrice = (priceInPEN, targetCurrency = currency) => {
    if (targetCurrency === "USD") {
      return (priceInPEN / 3.4).toFixed(2);
    }
    return priceInPEN.toFixed(2);
  };

  const formatPrice = (priceInPEN, targetCurrency = currency) => {
    const convertedPrice = convertPrice(priceInPEN, targetCurrency);
    const symbol = targetCurrency === "PEN" ? "S/" : "$";
    return `${symbol}${convertedPrice}`;
  };

  const value = {
    language,
    setLanguage: handleSetLanguage,
    currency,
    setCurrency: handleSetCurrency,
    isLoading,
    convertPrice,
    formatPrice
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};