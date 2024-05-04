import { expect } from "chai";
import { ethers } from "hardhat";
import { getWallet, deployContract } from "../deploy/utils";
import dotenv from "dotenv";

dotenv.config();

describe("LinkSwapClone", function () {
  it("Should add liquidity to a pair", async function () {
    const wallet = getWallet(process.env.WALLET_PRIVATE_KEY!);
    const linkswap = await ethers.getContractAt(
      "LinkSwapClone",
      process.env.LINKSWAP_ADDRESS
    );
    const sktToken = await ethers.getContractAt(
      "contracts/interfaces/IERC20.sol:IERC20",
      process.env.SKT_TOKEN_ADDRESS
    );
    const testToken = await ethers.getContractAt(
      "contracts/interfaces/IERC20.sol:IERC20",
      process.env.TEST_TOKEN_ADDRESS
    );
    const tx1 = await sktToken
      .connect(wallet)
      .approve(linkswap.address, ethers.utils.parseEther("100"));
    await tx1.wait(1);
    console.log("Approved native token" + tx1.hash);
    const tx2 = await testToken
      .connect(wallet)
      .approve(linkswap.address, ethers.utils.parseEther("100"));
    await tx2.wait(1);
    console.log("Approved test token" + tx2.hash);
    const tx3 = await linkswap
      .connect(wallet)
      .addLiquidity(
        process.env.SKT_TOKEN_ADDRESS,
        process.env.TEST_TOKEN_ADDRESS,
        ethers.utils.parseEther("10"),
        ethers.utils.parseEther("10"),
        0,
        0,
        wallet.address,
        ethers.constants.MaxUint256
      );
    await tx3.wait(1);
    console.log("Added liquidity" + tx3.hash);
  }).timeout(1000000);

  it("Should swap tokens TTK -> STK", async function () {
    const wallet = getWallet(process.env.WALLET_PRIVATE_KEY!);
    const testtoken = await ethers.getContractAt(
      "contracts/interfaces/IERC20.sol:IERC20",
      process.env.TEST_TOKEN_ADDRESS
    );
    const tx1 = await testtoken
      .connect(wallet)
      .approve(process.env.LINKSWAP_ADDRESS, ethers.utils.parseEther("500"));
    await tx1.wait(1);
    console.log("Approved native token" + tx1.hash);
    const linkswap = await ethers.getContractAt(
      "LinkSwapClone",
      process.env.LINKSWAP_ADDRESS
    );
    const tx2 = await linkswap
      .connect(wallet)
      .swapExactTokensForTokens(
        ethers.utils.parseEther("2"),
        0,
        [process.env.TEST_TOKEN_ADDRESS, process.env.SKT_TOKEN_ADDRESS],
        wallet.address,
        ethers.constants.MaxUint256,
        {
          gasLimit: 9999999,
        }
      );
    await tx2.wait(1);
    console.log("Swapped tokens" + tx2.hash);
  }).timeout(1000000);
});
