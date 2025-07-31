'use client';
import { useEffect } from 'react';

export default function ElementXLoader() {
  useEffect(() => {
    import('@bhavinpatel57/element-x').then((mod) => {
      mod.createTheme?.({
        light: {
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          backgroundColor: "#ffffff",
          text: {
            primary: "#1a1a1a",   
            secondary: "#4d4d4d",   
            tertiary: "#808080",   
            quaternary: "#b3b3b3", 
            quinary: "#e6e6e6",     
            dark: "#0d0d0d",
            light: "#ffffff",
          },
          glass: {
            baseColor: "rgba(255, 255, 255, 0.8)",
            opacities: { 
              primary: 0.8, 
              secondary: 0.6, 
              tertiary: 0.4, 
              solid: 1.0 
            },
          },
          overlay: {
            color: "rgba(0, 0, 0, 0.5)",
            opacities: { 
              primary: 0.5, 
              secondary: 0.3, 
              tertiary: 0.1, 
              solid: 1.0 
            },
          },
          glassHover: {
            color: "rgba(255, 255, 255, 0.9)",
            opacity: { 
              primary: 0.9, 
              secondary: 0.7, 
              tertiary: 0.5, 
              solid: 1.0 
            },
          },
          blur: { 
            primary: "6px", 
            secondary: "12px", 
            tertiary: "18px" 
          },
          radius: {
            primary: "6px",
            secondary: "12px",
            tertiary: "18px",
            full: "9999px",
          },
          boxshadow: {
            primary: "0 1px 3px rgba(0, 0, 0, 0.03)",
            secondary: "0 2px 6px rgba(0, 0, 0, 0.05)",
            tertiary: "0 4px 12px rgba(0, 0, 0, 0.08)",
            inset: "inset 0 1px 2px rgba(0, 0, 0, 0.05)",
            hover: "0 8px 24px rgba(0, 0, 0, 0.12)",
          },
          brightness: { 
            primary: "105%", 
            secondary: "110%", 
            tertiary: "120%" 
          },
          saturation: { 
            primary: "110%", 
            secondary: "120%", 
            tertiary: "130%" 
          },
          color: {
            active: "#4361ee",     
            success: "#2ecc71",     
            warning: "#f39c12",   
            danger: "#e74c3c",    
            info: "#3498db",     
          },
          separator: "rgba(0, 0, 0, 0.015)",  
          border: {
            primary: "1px solid rgba(0, 0, 0, 0.04)",
            secondary: "1px solid rgba(0, 0, 0, 0.08)",
            tertiary: "1px solid rgba(0, 0, 0, 0.12)",
          },
        },
        dark: {
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          backgroundColor: "#121212",
          text: {
            primary: "#f5f5f5",   
            secondary: "#d9d9d9",   
            tertiary: "#a6a6a6",   
            quaternary: "#737373", 
            quinary: "#404040",     
            dark: "#000000",
            light: "#ffffff",
          },
          glass: {
            baseColor: "rgba(18, 18, 18, 0.8)",
            opacities: { 
              primary: 0.8, 
              secondary: 0.6, 
              tertiary: 0.4, 
              solid: 1.0 
            },
          },
          overlay: {
            color: "rgba(0, 0, 0, 0.7)",
            opacities: { 
              primary: 0.7, 
              secondary: 0.5, 
              tertiary: 0.3, 
              solid: 1.0 
            },
          },
          glassHover: {
            color: "rgba(30, 30, 30, 0.9)",
            opacity: { 
              primary: 0.9, 
              secondary: 0.7, 
              tertiary: 0.5, 
              solid: 1.0 
            },
          },
          blur: { 
            primary: "6px", 
            secondary: "12px", 
            tertiary: "18px" 
          },
          radius: {
            primary: "6px",
            secondary: "12px",
            tertiary: "18px",
            full: "9999px",
          },
          boxshadow: {
            primary: "0 1px 3px rgba(0, 0, 0, 0.15)",
            secondary: "0 2px 6px rgba(0, 0, 0, 0.2)",
            tertiary: "0 4px 12px rgba(0, 0, 0, 0.3)",
            inset: "inset 0 1px 2px rgba(255, 255, 255, 0.05)",
            hover: "0 8px 24px rgba(0, 0, 0, 0.4)",
          },
          brightness: { 
            primary: "110%", 
            secondary: "120%", 
            tertiary: "130%" 
          },
          saturation: { 
            primary: "110%", 
            secondary: "120%", 
            tertiary: "130%" 
          },
          color: {
            active: "#5a7aff",     
            success: "#48d68b",     
            warning: "#ffb142",   
            danger: "#ff6b5c",    
            info: "#5dade2",     
          },
          separator: "rgba(255, 255, 255, 0.15)",  
          border: {
            primary: "1px solid rgba(255, 255, 255, 0.04)",
            secondary: "1px solid rgba(255, 255, 255, 0.08)",
            tertiary: "1px solid rgba(255, 255, 255, 0.12)",
          },
        },
      });
    });
  }, []);

  return null;
}