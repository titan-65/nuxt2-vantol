import { defineEnv, string } from "void/env";

export default defineEnv({
  ADMIN_PASSWORD: string(),
});
