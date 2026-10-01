import { deployScript, artifacts } from "../rocketh/deploy.js";

export default deployScript(
  async env => {
    const { deployer } = env.namedAccounts;

    await env.deploy("Voting", {
      account: deployer,
      artifact: artifacts.Voting,
      args: ["Какой язык программирования вам нравится больше?", ["Python", "JavaScript", "Solidity"]],
    });
  },
  {
    tags: ["Voting"],
  },
);
