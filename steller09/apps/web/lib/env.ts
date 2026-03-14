const read = (key: string): string | undefined => process.env[key];

export const appEnv = {
  public: {
    appUrl: read("NEXT_PUBLIC_APP_URL") ?? "http://localhost:3000",
    defaultLocale: read("NEXT_PUBLIC_DEFAULT_LOCALE") ?? "zh-CN"
  },
  server: {
    analyzerBaseUrl: read("ANALYZER_BASE_URL") ?? "",
    analyzerToken: read("ANALYZER_TOKEN") ?? "",
    geminiModel: read("GEMINI_MODEL") ?? "gemini-2.5-flash-lite",
    geminiApiBase: read("GEMINI_API_BASE") ?? "https://generativelanguage.googleapis.com/v1beta",
    geminiApiKey: read("GEMINI_API_KEY") ?? "",
    authSecret: read("AUTH_SECRET") ?? "local-dev-secret",
    newsApiBase: read("NEWS_API_BASE") ?? ""
  }
};
