'use client';
import { useEffect } from 'react';

export default function ElementXLoader() {
  useEffect(() => {
    import('@bhavinpatel57/element-x').then((mod) => {
      mod.createTheme?.({
        light: {
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
          backgroundColor: "#ffffff",
          text: {
            primary: "#111827",    // gray-900
            secondary: "#374151",   // gray-700
            tertiary: "#6b7280",    // gray-500
            quaternary: "#9ca3af", // gray-400
            quinary: "#e5e7eb",     // gray-200
            dark: "#111827",
            light: "#f9fafb",
          },
          glass: {
            baseColor: "#ffffff",
            opacities: { 
              primary: 0.95, 
              secondary: 0.85, 
              tertiary: 0.75, 
              solid: 1.0 
            },
          },
          overlay: {
            color: "#ffffff",
            opacities: { 
              primary: 0.8, 
              secondary: 0.6, 
              tertiary: 0.4, 
              solid: 1.0 
            },
          },
          glassHover: {
            color: "#111827",
            opacity: { 
              primary: 0.04, 
              secondary: 0.06, 
              tertiary: 0.08, 
              solid: 1.0 
            },
          },
          blur: { 
            primary: "8px", 
            secondary: "12px", 
            tertiary: "16px" 
          },
          radius: {
            primary: "8px",
            secondary: "12px",
            tertiary: "16px",
            full: "9999px",
          },
          boxshadow: {
            primary: "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)",
            secondary: "0 4px 6px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.1)",
            tertiary: "0 10px 15px rgba(0,0,0,0.05), 0 4px 6px rgba(0,0,0,0.1)",
            inset: "inset 0 2px 4px rgba(0,0,0,0.05)",
            hover: "0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04)",
          },
          brightness: { 
            primary: "1", 
            secondary: "1.02", 
            tertiary: "1.05" 
          },
          saturation: { 
            primary: "1", 
            secondary: "1.05", 
            tertiary: "1.1" 
          },
          color: {
            active: "#2563eb",      // blue-600
            success: "#10b981",     // emerald-500
            warning: "#f59e0b",     // amber-500
            danger: "#ef4444",     // red-500
            info: "#06b6d4",        // cyan-500
          },
          separator: "#e5e7eb",     // gray-200
          border: {
            primary: "1px solid #e5e7eb",
            secondary: "1px dashed #d1d5db",
            tertiary: "1px dotted #d1d5db",
          },
        },
        dark: {
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
          backgroundColor: "#111827", // gray-900
          text: {
            primary: "#f9fafb",     // gray-50
            secondary: "#e5e7eb",    // gray-200
            tertiary: "#9ca3af",    // gray-400
            quaternary: "#6b7280",   // gray-500
            quinary: "#374151",      // gray-700
            dark: "#111827",
            light: "#f9fafb",
          },
          glass: {
            baseColor: "#1f2937",   // gray-800
            opacities: { 
              primary: 0.95, 
              secondary: 0.85, 
              tertiary: 0.75, 
              solid: 1.0 
            },
          },
          overlay: {
            color: "#111827",
            opacities: { 
              primary: 0.85, 
              secondary: 0.7, 
              tertiary: 0.5, 
              solid: 1.0 
            },
          },
          glassHover: {
            color: "#f9fafb",
            opacity: { 
              primary: 0.05, 
              secondary: 0.08, 
              tertiary: 0.12, 
              solid: 1.0 
            },
          },
          blur: { 
            primary: "8px", 
            secondary: "12px", 
            tertiary: "16px" 
          },
          radius: {
            primary: "8px",
            secondary: "12px",
            tertiary: "16px",
            full: "9999px",
          },
          boxshadow: {
            primary: "0 1px 3px rgba(0,0,0,0.2), 0 1px 2px rgba(0,0,0,0.3)",
            secondary: "0 4px 6px rgba(0,0,0,0.2), 0 1px 3px rgba(0,0,0,0.3)",
            tertiary: "0 10px 15px rgba(0,0,0,0.2), 0 4px 6px rgba(0,0,0,0.3)",
            inset: "inset 0 2px 4px rgba(0,0,0,0.3)",
            hover: "0 20px 25px rgba(0,0,0,0.3), 0 10px 10px rgba(0,0,0,0.2)",
          },
          brightness: { 
            primary: "1", 
            secondary: "1.02", 
            tertiary: "1.05" 
          },
          saturation: { 
            primary: "1", 
            secondary: "1.05", 
            tertiary: "1.1" 
          },
          color: {
            active: "#3b82f6",     // blue-500
            success: "#34d399",    // emerald-400
            warning: "#fbbf24",     // amber-400
            danger: "#f87171",     // red-400
            info: "#22d3ee",        // cyan-400
          },
          separator: "#374151",     // gray-700
          border: {
            primary: "1px solid #374151",
            secondary: "1px dashed #4b5563",
            tertiary: "1px dotted #4b5563",
          },
        },
      });
    });
  }, []);

  return null;
}