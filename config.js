module.exports = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY
  },
  linkedin: {
    clientId: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    redirectUri: process.env.LINKEDIN_REDIRECT_URI
  },
  server: {
    port: process.env.PORT || 5000
  }
};