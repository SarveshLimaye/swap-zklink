import { deployContract } from "./utils";

// An example of a basic deploy script
// It will deploy a Greeter contract to selected network
// as well as verify it on Block Explorer if possible for the network
export default async function () {
  const contractArtifactName = "SwapFactory";
  const constructorArguments = ["0xDd656E7883EEBCAFa5a274612Bd4f94f7E86a6D1"];
  const Factory = await deployContract(
    contractArtifactName,
    constructorArguments
  );

  console.log("Factory deployed to:", Factory.address);

  const contractArtifactName1 = "NativeToken";

  const Token = await deployContract(contractArtifactName1, []);
  console.log("Token deployed to:", Token.address);

  const contractArtifactName2 = "LinkSwapClone";
  const constructorArguments2 = [Factory.address, Token.address];
  const LinkSwap = await deployContract(
    contractArtifactName2,
    constructorArguments2
  );
  console.log("LinkSwap deployed to:", LinkSwap.address);
}
