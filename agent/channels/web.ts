import { webChannel } from "eve/channels/web";

export default webChannel({
  route: "/api/eve/chat",
  cors: { origin: "*" },
});
