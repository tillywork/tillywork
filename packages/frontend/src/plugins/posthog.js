import posthog from 'posthog-js';

export default {
    install(app) {
        if (import.meta.env.TW_VITE_POSTHOG_KEY) {
            app.config.globalProperties.$posthog = posthog.init(
                import.meta.env.TW_VITE_POSTHOG_KEY,
                {
                    api_host: 'https://us.i.posthog.com',
                }
            );
        }
    },
};
