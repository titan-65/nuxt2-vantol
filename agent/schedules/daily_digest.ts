import { defineSchedule } from "eve/schedules";

export default defineSchedule({
  cron: "0 9 * * *",
  markdown: "Pull latest blog articles and GitHub PRs, assemble daily site digest, and cache metrics.",
});
