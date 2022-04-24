const hre = require("hardhat");
const ethers = hre.ethers;

const main = async () => {
    const [signer] = await ethers.getSigners()

    const TokenA = await ethers.getContractFactory('TokenA', signer)
    const tokena = await TokenA.deploy();
    await tokena.deployed();
    console.log(tokena.address)
};

main()
    .then(() => process.exit(0))
    .catch((error) => {
    console.error(error);
    process.exit(1);
    });

