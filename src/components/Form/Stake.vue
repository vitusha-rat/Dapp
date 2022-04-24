<template>
    <div class="flex flex-col w-[400px] h-[400px] bg-gradient-to-t from-amber-800 to-green-800 rounded-2xl">
        <base-input v-model="amount" />
        <base-button :buttonText="'Stake'" :size="'w-full h-10'" class="bg-slate-500" @press="StakeAmount" />
        <base-button :buttonText="wallet" :size="'w-full h-10'" class="bg-blue-500" @press="connectMetamask" />
    </div>
</template>

<script setup lang="ts">
import BaseButton from "../Base/Button.vue";
import BaseInput from "../Base/Input.vue";
import { ref } from "vue";
import { ethers, Contract, BigNumber, providers } from "ethers";
import config from "../../../blockchain/config.json";
import abis from "../../../blockchain/abis.json";

const providerETH = new ethers.providers.JsonRpcProvider(config.ETH.provider);
const Staking = new Contract(config.ETH.addresses.Staking, abis.Staking, providerETH);
const TokenA = new Contract(config.ETH.addresses.TokenA, abis.TokenA, providerETH);

const CHAIN_ID = 4;

const provider = ref(null as null | ethers.providers.Web3Provider);
const signer = ref(null as null | ethers.providers.JsonRpcSigner);
const wallet = ref("");
const amount = ref("");

async function StakeAmount() {
    try {
        await TokenA.connect(signer.value!).approve(config.ETH.addresses.Staking, 100000000);
    } catch (error) {
        console.log(error);
    }
    // await Staking.connect(signer.value!).stake(amount, 1);
}

async function connectMetamask() {
    try {
        console.log("connect");
        if (!(window as any).ethereum) throw new Error("Please set up MetaMask properly");

        wallet.value = (
            await (window as any).ethereum.request?.({
                method: "eth_requestAccounts",
            })
        )[0] as string;

        provider.value = new providers.Web3Provider(((window as any).ethereum as any) || (window as any).web3);
        console.log(provider);
        signer.value = provider.value.getSigner();
        console.log(signer);

        await function updateChainId() {
            ((window as any).ethereum as any).once("chainChanged", async (chainId: string) => {
                await connectMetamask();
            });
            ((window as any).ethereum as any).once("accountsChanged", handleWalletChanged);
        };
        // if (chainId !== Number(config.ETH.chainId)) await switchChainIdBSC()
    } catch (error) {
        console.error(error);
    }
}

async function updateChainId() {
    const chainId = (await provider.value?.getNetwork())?.chainId || null;
}
async function handleWalletChanged(addresses: string[]) {
    if (addresses[0]) {
        wallet.value = addresses[0];
    }
    // ;((window as any).ethereum as any).once('accountsChanged', handleWalletChanged)
}
</script>
