import { expect } from "chai";
import { network } from "hardhat";
import type { Abi_Voting } from "../generated/abis/Voting.js";
import { loadAndExecuteDeploymentsFromFiles } from "../rocketh/environment.js";

const { provider, networkHelpers, ethers } = await network.create();

async function deployFixture() {
  const env = await loadAndExecuteDeploymentsFromFiles({ provider });

  const { address, abi } = env.get<Abi_Voting>("Voting");

  const voting = await ethers.getContractAt(abi, address);

  const signers = await ethers.getSigners();
  const voter = signers[1];

  return { voting, voter };
}

describe("Voting", function () {
  describe("Deployment", function () {
    it("Should save the question", async function () {
      const { voting } = await networkHelpers.loadFixture(deployFixture);

      expect(await voting.question()).to.equal("Какой язык программирования вам нравится больше?");
    });

    it("Should create three options", async function () {
      const { voting } = await networkHelpers.loadFixture(deployFixture);

      expect(await voting.getOptionsCount()).to.equal(3n);
    });

    it("Should create Python as the first option with zero votes", async function () {
      const { voting } = await networkHelpers.loadFixture(deployFixture);

      const option = await voting.options(0);

      expect(option[0]).to.equal("Python");
      expect(option[1]).to.equal(0n);
    });
  });

  describe("Voting process", function () {
    it("Should allow an address to vote", async function () {
      const { voting, voter } = await networkHelpers.loadFixture(deployFixture);

      const tx = await voting.connect(voter).vote(1);
      await tx.wait();

      const option = await voting.options(1);

      expect(option[0]).to.equal("JavaScript");
      expect(option[1]).to.equal(1n);

      expect(await voting.hasVoted(voter.address)).to.equal(true);
    });

    it("Should not allow the same address to vote twice", async function () {
      const { voting, voter } = await networkHelpers.loadFixture(deployFixture);

      const firstTx = await voting.connect(voter).vote(1);
      await firstTx.wait();

      await expect(voting.connect(voter).vote(2)).to.be.revertedWith("You have already voted");
    });

    it("Should reject an invalid option", async function () {
      const { voting, voter } = await networkHelpers.loadFixture(deployFixture);

      await expect(voting.connect(voter).vote(99)).to.be.revertedWith("Invalid option");
    });
  });
});
