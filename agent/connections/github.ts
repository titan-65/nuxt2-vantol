import { defineMcpClientConnection } from "eve/connections";

export default defineMcpClientConnection({
  url: "https://mcp.github.com/mcp",
  description: "GitHub integration connection for reading pull requests, issues, and commit activity.",
  auth: {
    getToken: async () => ({ token: process.env.GITHUB_TOKEN || "mock-github-token" }),
  },
});
