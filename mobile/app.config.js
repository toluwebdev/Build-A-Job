/**
 * Dynamic Expo config: defaults API to production; override locally with
 * EXPO_PUBLIC_API_BASE_URL=https://192.168.x.x:5000 (no trailing slash)
 */
module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    apiBaseUrl:
      process.env.EXPO_PUBLIC_API_BASE_URL ??
      "https://build-a-job-server.vercel.app",
  },
});
