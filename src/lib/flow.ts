import * as fcl from "@onflow/fcl";

// Global Flow config for dBattle
fcl.config()
  .put("app.detail.title", "dBattle")
  .put("app.detail.icon", "https://dbattle.com/icon.png")
  .put("flow.network", "mainnet")
  .put("accessNode.api", "https://access-mainnet.onflow.org")
  .put("discovery.wallet", "https://fcl-discovery.onflow.org/authn")
  .put("discovery.wallet.method.default", "IFRAME/RPC");

export { fcl };
