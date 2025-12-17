
import { useEffect, useRef } from 'react';

export interface HotkeyConfig {
  combo: string; // e.g. "ctrl+k", "meta+s", "escape", "?"
  onTrigger: (e: KeyboardEvent) => void;
  preventDefault?: boolean;
}

export const useHotkeys = (configs: HotkeyConfig[], deps: any[] = []) => {
    // Usamos ref para tener siempre acceso a la última versión de configs sin reinicializar el effect
    const configsRef = useRef(configs);
    
    useEffect(() => {
        configsRef.current = configs;
    }, [configs]); // Actualizamos la ref si configs cambia

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignorar inputs si no es un comando global explícito (como ESC o Ctrl+Enter)
            // Pero permitimos que el callback decida o filtramos aquí. 
            // Para una app tipo sidecar, queremos atajos globales a menos que estemos escribiendo.
            
            const isInput = (e.target as HTMLElement).tagName === 'INPUT' || 
                            (e.target as HTMLElement).tagName === 'TEXTAREA' ||
                            (e.target as HTMLElement).isContentEditable;

            configsRef.current.forEach(config => {
                const keys = config.combo.toLowerCase().split('+');
                const mainKey = keys[keys.length - 1];
                
                const needsCtrl = keys.includes('ctrl');
                const needsMeta = keys.includes('meta') || keys.includes('cmd'); // Mac command
                const needsShift = keys.includes('shift');
                const needsAlt = keys.includes('alt');

                // Detección de Mod (Ctrl en Win/Linux, Meta en Mac)
                // Simplificación: tratamos 'mod' como ctrl o meta
                const needsMod = keys.includes('mod');
                const isModPressed = e.ctrlKey || e.metaKey;

                // Verificación de teclas modificadoras
                if (needsCtrl && !e.ctrlKey) return;
                if (needsMeta && !e.metaKey) return;
                if (needsShift && !e.shiftKey) return;
                if (needsAlt && !e.altKey) return;
                if (needsMod && !isModPressed) return;

                // Verificación de tecla principal
                // Mapeos especiales
                let pressedKey = e.key.toLowerCase();
                if (pressedKey === ' ') pressedKey = 'space';
                if (pressedKey === 'escape') pressedKey = 'esc';

                // Si la tecla principal coincide
                if (pressedKey === mainKey || (mainKey === '?' && e.key === '?')) {
                    // Lógica para no disparar en inputs a menos que sea un comando con modificador (ej: Ctrl+Enter)
                    const hasModifier = e.ctrlKey || e.metaKey || e.altKey;
                    
                    // Excepciones: ESC siempre funciona, Ctrl+... siempre funciona
                    if (isInput && !hasModifier && mainKey !== 'esc') {
                        return; 
                    }

                    if (config.preventDefault) {
                        e.preventDefault();
                    }
                    config.onTrigger(e);
                }
            });
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, deps); // Re-bind si las dependencias cambian (útil para closures)
};
