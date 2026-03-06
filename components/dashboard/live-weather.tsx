"use client";

import { useEffect, useState } from "react";
import { Sun, CloudRain, Snowflake, Cloud, CloudLightning, Loader2, MapPin } from "lucide-react";

// Open-Meteo weather codes mapping
// 0: Clear sky
// 1, 2, 3: Mainly clear, partly cloudy, and overcast
// 45, 48: Fog and depositing rime fog
// 51, 53, 55: Drizzle
// 61, 63, 65: Rain
// 71, 73, 75: Snow fall
// 77: Snow grains
// 80, 81, 82: Rain showers
// 85, 86: Snow showers
// 95: Thunderstorm
// 96, 99: Thunderstorm with slight and heavy hail

type WeatherCondition = "sunny" | "cloudy" | "rainy" | "snowy" | "stormy";

export function LiveWeather() {
    const [temp, setTemp] = useState<number | null>(null);
    const [condition, setCondition] = useState<WeatherCondition | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const { latitude, longitude } = position.coords;
                        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
                        const data = await res.json();

                        if (data.current_weather) {
                            setTemp(Math.round(data.current_weather.temperature));

                            const code = data.current_weather.weathercode;
                            if (code === 0) setCondition("sunny");
                            else if (code >= 1 && code <= 3) setCondition("cloudy");
                            else if (code >= 45 && code <= 48) setCondition("cloudy"); // Fog
                            else if (code >= 51 && code <= 65) setCondition("rainy");
                            else if (code >= 80 && code <= 82) setCondition("rainy");
                            else if (code >= 71 && code <= 77) setCondition("snowy");
                            else if (code >= 85 && code <= 86) setCondition("snowy");
                            else if (code >= 95 && code <= 99) setCondition("stormy");
                            else setCondition("sunny"); // Fallback
                        } else {
                            setError(true);
                        }
                    } catch (err) {
                        console.error("Failed to fetch weather", err);
                        setError(true);
                    } finally {
                        setLoading(false);
                    }
                },
                (err) => {
                    console.warn("Geolocation denied or failed", err);
                    setError(true);
                    setLoading(false);
                }
            );
        } else {
            setError(true);
            setLoading(false);
        }
    }, []);

    if (loading) {
        return (
            <div className="hidden sm:flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-muted/40 rounded-full border border-border/50 animate-pulse w-[80px]">
                <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
            </div>
        );
    }

    if (error || temp === null || condition === null) {
        return (
            <div className="hidden sm:flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-muted/40 rounded-full border border-border/50 opacity-50 cursor-pointer" title="Weather unavailable">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs md:text-sm font-medium tracking-wide">--°C</span>
            </div>
        );
    }

    const renderIcon = () => {
        switch (condition) {
            case "sunny":
                return <Sun className="w-5 h-5 text-yellow-500 hover:rotate-180 transition-transform duration-700 animate-[spin_10s_linear_infinite]" />;
            case "cloudy":
                return <Cloud className="w-5 h-5 text-slate-400 hover:scale-110 transition-transform duration-300 animate-[pulse_4s_ease-in-out_infinite]" />;
            case "rainy":
                return (
                    <div className="relative flex items-center justify-center w-5 h-5 overflow-hidden rounded-full group">
                        <CloudRain className="w-5 h-5 text-blue-400 absolute z-10 group-hover:-translate-y-1 transition-transform" />
                        <div className="w-1 h-1 bg-blue-300 rounded-full absolute bottom-0 left-1 animate-[bounce_1s_infinite]" />
                        <div className="w-1 h-1 bg-blue-300 rounded-full absolute bottom-0 right-1 animate-[bounce_1s_infinite_0.3s]" />
                    </div>
                );
            case "snowy":
                return <Snowflake className="w-5 h-5 text-cyan-300 hover:rotate-90 transition-transform duration-500 animate-[spin_8s_linear_infinite]" />;
            case "stormy":
                return <CloudLightning className="w-5 h-5 text-purple-500 animate-[pulse_1s_ease-in-out_infinite]" />;
        }
    };

    const getBgClass = () => {
        switch (condition) {
            case "sunny": return "hover:bg-yellow-500/10 hover:border-yellow-500/30";
            case "cloudy": return "hover:bg-slate-500/10 hover:border-slate-500/30";
            case "rainy": return "hover:bg-blue-500/10 hover:border-blue-500/30";
            case "snowy": return "hover:bg-cyan-500/10 hover:border-cyan-500/30";
            case "stormy": return "hover:bg-purple-500/10 hover:border-purple-500/30";
            default: return "hover:bg-muted/60";
        }
    };

    return (
        <div className={`hidden sm:flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-background/40 to-muted/40 backdrop-blur-sm rounded-full border border-border/50 cursor-pointer transition-all duration-300 shadow-[0_0_10px_rgba(0,0,0,0.05)] hover:shadow-md ${getBgClass()}`} title="Local Weather">
            {renderIcon()}
            <span className="text-xs md:text-sm font-semibold tracking-wide bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
                {temp}°C
            </span>
        </div>
    );
}
