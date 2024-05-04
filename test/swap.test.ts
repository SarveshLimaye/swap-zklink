import { expect } from "chai";
import { ethers } from "hardhat";
import { getWallet, deployContract } from "../deploy/utils";
import dotenv from "dotenv";

dotenv.config();

describe("LinkSwapClone", function () {
  it("Should set treasy address", async function () {
    const wallet = getWallet(process.env.WALLET_PRIVATE_KEY!);

    const factory = await ethers.getContractAt(
      "SwapFactory",
      process.env.FACTORY_ADDRESS
    );

    const tx = await factory
      .connect(wallet)
      .setFeeReceipt(process.env.TREASURY_ADDRESS);

    await tx.wait(1);

    console.log("Treasury address set successfully " + tx.hash);

    const treasury = await factory.feeReceipt();

    console.log("Treasury address: " + treasury);

    expect(treasury).to.equal(process.env.TREASURY_ADDRESS);
  }).timeout(1000000);

  it("Create a ERC20-ERC20 pair and add liquidity", async function () {
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
    console.log("Approved native token " + tx1.hash);
    const tx2 = await testToken
      .connect(wallet)
      .approve(linkswap.address, ethers.utils.parseEther("100"));
    await tx2.wait(1);
    console.log("Approved test token " + tx2.hash);
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
    console.log("Added liquidity hash " + tx3.hash);

    expect(tx3.hash).to.not.equal(null);
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
    console.log("Approved native token hash " + tx1.hash);
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
    console.log("Swapped tokens hash " + tx2.hash);

    expect(tx2.hash).to.not.equal(null);
  }).timeout(1000000);

  it("Should create a WETH-ERC20 pair and add liquidity", async function () {
    const wallet = getWallet(process.env.WALLET_PRIVATE_KEY!);
    const linkswap = await ethers.getContractAt(
      "LinkSwapClone",
      process.env.LINKSWAP_ADDRESS
    );
    const testToken = await ethers.getContractAt(
      "contracts/interfaces/IERC20.sol:IERC20",
      process.env.TEST_TOKEN_ADDRESS
    );
    const tx1 = await testToken
      .connect(wallet)
      .approve(linkswap.address, ethers.utils.parseEther("100"));
    await tx1.wait(1);
    console.log("Approved test token " + tx1.hash);

    const tx2 = await linkswap
      .connect(wallet)
      .addLiquidityNativeToken(
        process.env.TEST_TOKEN_ADDRESS,
        ethers.utils.parseEther("10"),
        0,
        0,
        wallet.address,
        ethers.constants.MaxUint256,
        {
          gasLimit: 9999999,
          value: ethers.utils.parseEther("0.01"),
        }
      );

    await tx2.wait(1);

    console.log("Added liquidity hash " + tx2.hash);
  }).timeout(1000000);

  it("Should swap ETH -> ERC20(TTK)", async function () {
    const wallet = getWallet(process.env.WALLET_PRIVATE_KEY!);

    const linkswap = await ethers.getContractAt(
      "LinkSwapClone",
      process.env.LINKSWAP_ADDRESS
    );

    const tx1 = await linkswap
      .connect(wallet)
      .swapExactNativeTokenForTokens(
        0,
        [process.env.NATIVE_TOKEN_ADDRESS, process.env.TEST_TOKEN_ADDRESS],
        wallet.address,
        ethers.constants.MaxUint256,
        {
          gasLimit: 9999999,
          value: ethers.utils.parseEther("0.01"),
        }
      );

    await tx1.wait(1);

    console.log("Swapped tokens hash " + tx1.hash);
  }).timeout(1000000);

  it("Should swap ERC20(TTK) -> ETH", async function () {
    const wallet = getWallet(process.env.WALLET_PRIVATE_KEY);

    const linkswap = await ethers.getContractAt(
      "LinkSwapClone",
      process.env.LINKSWAP_ADDRESS
    );

    const testToken = await ethers.getContractAt(
      "contracts/interfaces/IERC20.sol:IERC20",
      process.env.TEST_TOKEN_ADDRESS
    );

    const tx1 = await testToken
      .connect(wallet)
      .approve(linkswap.address, ethers.utils.parseEther("500"));

    await tx1.wait(1);

    console.log("Approved test token hash " + tx1.hash);

    const tx2 = await linkswap
      .connect(wallet)
      .swapTokensForExactNativeToken(
        ethers.utils.parseEther("0.1"),
        0,
        [process.env.TEST_TOKEN_ADDRESS, process.env.NATIVE_TOKEN_ADDRESS],
        wallet.address,
        ethers.constants.MaxUint256,
        {
          gasLimit: 99999999,
        }
      );

    await tx2.wait(1);

    console.log("Swap successfull ! Hash is " + tx2.hash);
  }).timeout(1000000);
});
