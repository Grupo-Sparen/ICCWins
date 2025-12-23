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
  const [language, setLanguage] = useState("es");
  const [currency, setCurrency] = useState("PEN");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Detect user location on mount
    const detectLocation = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        
        // Set language based on country
        const countryCode = data.country_code;
        const spanishCountries = ["PE", "AR", "CL", "CO", "MX", "EC", "BO", "PY", "UY", "VE", "PA", "CR", "ES"];
        
        if (spanishCountries.includes(countryCode)) {
          setLanguage("es");
        } else {
          setLanguage("en");
        }

        // Set currency based on country
        if (countryCode === "PE") {
          setCurrency("PEN");
        } else {
          setCurrency("USD");
        }
      } catch (error) {
        console.error("Error detecting location:", error);
        // Default to Spanish and PEN if detection fails
        setLanguage("es");
        setCurrency("PEN");
      } finally {
        setIsLoading(false);
      }
    };

    detectLocation();
  }, []);

  const value = {
    language,
    setLanguage,
    currency,
    setCurrency,
    isLoading
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};