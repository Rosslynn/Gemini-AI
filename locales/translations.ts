
export type Language = 'es' | 'en';

export const translations = {
  es: {
    // APP GENERAL
    'app.title': 'Code Sidecar',
    'app.desc': 'Tu copiloto de programación.',
    'app.welcome': 'Configura tu API Key para empezar.',
    
    // STATUS & ERRORS
    'status.online': 'En línea',
    'status.offline': 'Sin conexión a Internet',
    'status.offline_desc': 'Sin conexión a Internet. Gemini no podrá responder.',
    'error.title': 'Algo salió mal',
    'error.desc': 'El copiloto ha encontrado un error crítico.',
    'error.reload': 'Recargar Aplicación',
    'error.uncaught': 'Error no controlado',

    // INPUT
    'input.placeholder': 'Escribe o pega código...',
    'input.placeholder.listening': 'Escuchando... (habla ahora)',
    'input.placeholder.loading': 'Gemini está pensando...',
    'input.tool.screenshot': 'Captura de Pantalla',
    'input.tool.attach': 'Adjuntar Archivo',
    'input.tool.search': 'Búsqueda Web',
    'input.tool.templates': 'Plantillas',
    'input.tool.mic_start': 'Dictar por voz',
    'input.tool.mic_stop': 'Detener escucha',
    'drag.drop_files': 'Soltar archivos',

    // BUTTONS & ACTIONS
    'btn.send': 'Enviar',
    'btn.stop': 'Detener',
    'btn.cancel': 'Cancelar',
    'btn.save': 'Guardar',
    'btn.back': 'Volver',
    'btn.close': 'Cerrar',
    'btn.create': 'Crear',
    'btn.delete': 'Eliminar',

    // HEADER
    'header.export': 'Exportar Markdown',
    'header.clear': 'Borrar Historial',
    'header.popout': 'Desacoplar',
    'header.shortcuts': 'Atajos',
    'header.context': 'Contexto (Ctrl+J)',
    'header.clear_all': 'Borrar Todo',
    'model.flash': 'Flash',
    'model.pro': 'Pro',

    // SETTINGS
    'settings.title': 'Configuración',
    'settings.tab.general': 'General',
    'settings.tab.context': 'Contexto & Tokens',
    'settings.language': 'Idioma / Language',
    'settings.apikey': 'Gemini API Key',
    'settings.apikey.help': 'Obtén tu clave gratuita en Google AI Studio.',
    'settings.apikey.saved': '✅ API Key Configurada',
    'settings.apikey.hidden': 'Por seguridad, tu clave está oculta. Para cambiarla, primero debes eliminar la actual.',
    'settings.apikey.remove': 'Eliminar y Cambiar',
    'settings.behavior': 'Comportamiento (System Prompt)',
    'settings.behavior.placeholder': 'Ej: "Eres un Arquitecto Senior experto en Modyo. Tus soluciones son de clase mundial."',
    'settings.reset': 'Restaurar Prompt Experto',
    'settings.save': 'Guardar y Continuar',
    
    // SETTINGS -> CONTEXT
    'settings.context.title': '🧠 ¿Qué es el Contexto?',
    'settings.context.desc': 'El "contexto" es la memoria de la IA. Incluye tu historial de chat, el código que analizas y las imágenes adjuntas. Si tu chat es muy largo, podrías recibir errores en el plan gratuito.',
    'settings.tokens.limit': 'Límite de Tokens (Memoria)',
    'settings.tokens.low': '10k (Ahorro)',
    'settings.tokens.high': '1M (Masivo)',
    'settings.tokens.warning': '⚠️ Límites altos pueden causar errores en el plan gratuito.',
    'settings.prune.title': 'Limpieza inteligente de imágenes',
    'settings.prune.desc': 'Ahorra tokens eliminando automáticamente imágenes antiguas del historial (mantiene solo las del último mensaje).',

    // TOKENS GAUGE
    'tokens.label': 'Contexto',
    'tokens.popover.title': 'Uso de Tokens',
    'tokens.popover.desc': 'Representa cuánta "memoria" estás usando. Texto es barato, imágenes son caras (~1k tokens). Si se llena, la IA olvidará lo anterior.',
    'tokens.optimize.btn': 'imgs',
    'tokens.optimize.tooltip': 'Hay imágenes en memoria. Click para limpiar.',

    // QUICK ACTIONS (Labels & Prompts)
    'action.explain': 'Explicar',
    'action.refactor': 'Refactor',
    'action.fix': 'Fix',
    'action.tests': 'Tests',
    'action.analyze': 'Analizar Pág.',
    
    // PROMPTS FOR AI (Hidden)
    'prompts.explain': 'Explica este código brevemente y destaca los puntos clave.',
    'prompts.refactor': 'Refactoriza este código aplicando principios Clean Code y SOLID. Explica los cambios.',
    'prompts.fix': 'Analiza este código en busca de errores o bugs potenciales y propón una solución corregida.',
    'prompts.tests': 'Genera Unit Tests robustos (usando Vitest/Jest) para este código, cubriendo casos borde.',

    // TEMPLATES
    'templates.title.list': 'Plantillas',
    'templates.title.create': 'Nueva Plantilla',
    'templates.btn.new': 'Nueva',
    'templates.loading': 'Cargando...',
    'templates.empty': 'No hay plantillas guardadas.',
    'templates.form.name': 'Nombre',
    'templates.form.name_placeholder': 'Nombre de la plantilla',
    'templates.form.prompt': 'Prompt',
    'templates.form.prompt_placeholder': 'Escribe el prompt aquí...',
    'templates.confirm_delete': '¿Eliminar plantilla?',

    // SHORTCUTS
    'shortcuts.title': 'Atajos de Teclado',
    'shortcuts.send': 'Enviar mensaje',
    'shortcuts.stop': 'Cerrar / Detener',
    'shortcuts.context': 'Alternar contexto',
    'shortcuts.focus': 'Focar input',
    'shortcuts.help': 'Ayuda',

    // CONTEXT PANEL
    'ctx.title': 'CONTEXTO',
    'ctx.recapture': 'Recapturar',
    'ctx.clear': 'Borrar',

    // CHAT & MESSAGES
    'chat.stopped': '🛑 Detenido.',
    'chat.sources': 'Fuentes:',
    'chat.copy_code': 'Copiar código',
    'chat.thinking': 'Gemini está pensando',
    'chat.system': 'Sistema',
    'alt.thumbnail': 'Miniatura adjunta',

    // ALERTS & TOASTS
    'alert.clear_history': '¿Borrar todo el historial?',
    'alert.optimize_history': '¿Limpiar imágenes del historial?\n\nSolo se guardará el texto para liberar memoria.',
    'alert.token_critical': '⚠️ Memoria crítica (Tokens). Es posible que el modelo olvide información o falle. ¿Enviar?',
    'toast.history_cleared': 'Historial borrado',
    'toast.images_cleared': 'Imágenes eliminadas del historial',
    'toast.no_history_export': 'No hay historial suficiente para exportar',
    'toast.export_success': 'Chat exportado correctamente',
    'toast.generation_stopped': 'Generación detenida',
    'toast.screenshot_added': 'Captura añadida',
    'toast.screenshot_error': 'Error al capturar pantalla',
    'toast.context_captured': 'Contexto capturado',
    'toast.no_code_detected': 'No se detectó código',
    'toast.page_read_error': 'No se pudo leer la página',
    'toast.no_code_analyze': 'No hay código para analizar',
    'toast.quick_action_error': 'Error en acción rápida',
    'toast.mic_not_supported': 'Tu navegador no soporta reconocimiento de voz.',
    'toast.files_attached': 'archivo(s) adjuntado(s)',
    'toast.settings_saved': 'Configuración guardada',
    'toast.code_copied': 'Código copiado al portapapeles',
    'toast.code_copy_error': 'Error al copiar código',
    'toast.template_saved': 'Plantilla guardada',
    'toast.template_deleted': 'Plantilla eliminada',
    'toast.load_error': 'Error cargando datos',

    // ARIA LABELS (Accessibility)
    'aria.clear_history': 'Borrar historial',
    'aria.attachments': 'Archivos adjuntos',
    'aria.clear_attachments': 'Borrar todos los adjuntos',
    'aria.remove_file': 'Eliminar archivo',
    'aria.main_controls': 'Controles principales',
    'aria.model_selection': 'Selección de modelo IA',
    'aria.more_options': 'Más opciones',
    'aria.input_tools': 'Herramientas de entrada',
    'aria.message_input': 'Mensaje para Gemini',
    'aria.close': 'Cerrar',
    'aria.close_notification': 'Cerrar notificación',
    'aria.loading': 'Cargando...'
  },
  en: {
    // APP GENERAL
    'app.title': 'Code Sidecar',
    'app.desc': 'Your coding copilot.',
    'app.welcome': 'Configure your API Key to start.',

    // STATUS & ERRORS
    'status.online': 'Online',
    'status.offline': 'No Internet Connection',
    'status.offline_desc': 'No Internet Connection. Gemini cannot respond.',
    'error.title': 'Something went wrong',
    'error.desc': 'The copilot encountered a critical error.',
    'error.reload': 'Reload Application',
    'error.uncaught': 'Uncaught Error',

    // INPUT
    'input.placeholder': 'Type or paste code...',
    'input.placeholder.listening': 'Listening... (speak now)',
    'input.placeholder.loading': 'Gemini is thinking...',
    'input.tool.screenshot': 'Screenshot',
    'input.tool.attach': 'Attach File',
    'input.tool.search': 'Web Search',
    'input.tool.templates': 'Templates',
    'input.tool.mic_start': 'Voice Dictation',
    'input.tool.mic_stop': 'Stop Listening',
    'drag.drop_files': 'Drop files here',

    // BUTTONS & ACTIONS
    'btn.send': 'Send',
    'btn.stop': 'Stop',
    'btn.cancel': 'Cancel',
    'btn.save': 'Save',
    'btn.back': 'Back',
    'btn.close': 'Close',
    'btn.create': 'Create',
    'btn.delete': 'Delete',

    // HEADER
    'header.export': 'Export Markdown',
    'header.clear': 'Clear History',
    'header.popout': 'Popout',
    'header.shortcuts': 'Shortcuts',
    'header.context': 'Context (Ctrl+J)',
    'header.clear_all': 'Clear All',
    'model.flash': 'Flash',
    'model.pro': 'Pro',

    // SETTINGS
    'settings.title': 'Settings',
    'settings.tab.general': 'General',
    'settings.tab.context': 'Context & Tokens',
    'settings.language': 'Language',
    'settings.apikey': 'Gemini API Key',
    'settings.apikey.help': 'Get your free key at Google AI Studio.',
    'settings.apikey.saved': '✅ API Key Configured',
    'settings.apikey.hidden': 'For security, your key is hidden. To change it, you must remove the current one first.',
    'settings.apikey.remove': 'Remove & Change',
    'settings.behavior': 'Behavior (System Prompt)',
    'settings.behavior.placeholder': 'E.g., "You are a World-Class Frontend Architect. Expert in Modyo."',
    'settings.reset': 'Reset to Expert Prompt',
    'settings.save': 'Save & Continue',

    // SETTINGS -> CONTEXT
    'settings.context.title': '🧠 What is Context?',
    'settings.context.desc': 'Context is the AI\'s memory. It includes chat history, analyzed code, and images. Large chats may cause errors on the free tier.',
    'settings.tokens.limit': 'Token Limit (Memory)',
    'settings.tokens.low': '10k (Saver)',
    'settings.tokens.high': '1M (Massive)',
    'settings.tokens.warning': '⚠️ High limits may cause errors on the free tier.',
    'settings.prune.title': 'Smart Image Pruning',
    'settings.prune.desc': 'Saves tokens by automatically removing old images from history (keeps only the last message\'s images).',

    // TOKENS GAUGE
    'tokens.label': 'Context',
    'tokens.popover.title': 'Token Usage',
    'tokens.popover.desc': 'Represents how much "memory" you are using. Text is cheap, images are expensive (~1k tokens). If full, AI forgets early messages.',
    'tokens.optimize.btn': 'imgs',
    'tokens.optimize.tooltip': 'Images in memory. Click to prune.',

    // QUICK ACTIONS
    'action.explain': 'Explain',
    'action.refactor': 'Refactor',
    'action.fix': 'Fix',
    'action.tests': 'Tests',
    'action.analyze': 'Analyze Page',

    // PROMPTS FOR AI (Hidden)
    'prompts.explain': 'Explain this code briefly and highlight key points.',
    'prompts.refactor': 'Refactor this code applying Clean Code and SOLID principles. Explain the changes.',
    'prompts.fix': 'Analyze this code for potential errors or bugs and propose a corrected solution.',
    'prompts.tests': 'Generate robust Unit Tests (using Vitest/Jest) for this code, covering edge cases.',

    // TEMPLATES
    'templates.title.list': 'Templates',
    'templates.title.create': 'New Template',
    'templates.btn.new': 'New',
    'templates.loading': 'Loading...',
    'templates.empty': 'No saved templates.',
    'templates.form.name': 'Name',
    'templates.form.name_placeholder': 'Template Name',
    'templates.form.prompt': 'Prompt',
    'templates.form.prompt_placeholder': 'Write your prompt here...',
    'templates.confirm_delete': 'Delete template?',

    // SHORTCUTS
    'shortcuts.title': 'Keyboard Shortcuts',
    'shortcuts.send': 'Send message',
    'shortcuts.stop': 'Close / Stop',
    'shortcuts.context': 'Toggle Context',
    'shortcuts.focus': 'Focus Input',
    'shortcuts.help': 'Help',

    // CONTEXT PANEL
    'ctx.title': 'CONTEXT',
    'ctx.recapture': 'Recapture',
    'ctx.clear': 'Clear',

    // CHAT & MESSAGES
    'chat.stopped': '🛑 Stopped.',
    'chat.sources': 'Sources:',
    'chat.copy_code': 'Copy code',
    'chat.thinking': 'Gemini is thinking',
    'chat.system': 'System',
    'alt.thumbnail': 'Attached thumbnail',

    // ALERTS & TOASTS
    'alert.clear_history': 'Clear entire history?',
    'alert.optimize_history': 'Clear images from history?\n\nOnly text will be kept to free up memory.',
    'alert.token_critical': '⚠️ Critical Memory (Tokens). The model might forget info or fail. Send anyway?',
    'toast.history_cleared': 'History cleared',
    'toast.images_cleared': 'Images removed from history',
    'toast.no_history_export': 'Not enough history to export',
    'toast.export_success': 'Chat exported successfully',
    'toast.generation_stopped': 'Generation stopped',
    'toast.screenshot_added': 'Screenshot added',
    'toast.screenshot_error': 'Error taking screenshot',
    'toast.context_captured': 'Context captured',
    'toast.no_code_detected': 'No code detected',
    'toast.page_read_error': 'Could not read page',
    'toast.no_code_analyze': 'No code to analyze',
    'toast.quick_action_error': 'Error in quick action',
    'toast.mic_not_supported': 'Your browser does not support voice recognition.',
    'toast.files_attached': 'file(s) attached',
    'toast.settings_saved': 'Settings saved',
    'toast.code_copied': 'Code copied to clipboard',
    'toast.code_copy_error': 'Error copying code',
    'toast.template_saved': 'Template saved',
    'toast.template_deleted': 'Template deleted',
    'toast.load_error': 'Error loading data',

    // ARIA LABELS
    'aria.clear_history': 'Clear history',
    'aria.attachments': 'Attachments',
    'aria.clear_attachments': 'Clear all attachments',
    'aria.remove_file': 'Remove file',
    'aria.main_controls': 'Main controls',
    'aria.model_selection': 'AI Model selection',
    'aria.more_options': 'More options',
    'aria.input_tools': 'Input tools',
    'aria.message_input': 'Message for Gemini',
    'aria.close': 'Close',
    'aria.close_notification': 'Close notification',
    'aria.loading': 'Loading...'
  }
};

export type TranslationKey = keyof typeof translations.es;
