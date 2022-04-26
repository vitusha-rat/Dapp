<template>
    <div class="flex flex-col justify-center items-center w-screen h-screen">
        <base-button
            :buttonText="isConnected ? wallet.substring(0, 10) + '...' : 'Connect MetaMask'"
            :size="'w-[200px] h-10'"
            class="transition bg-transparent ml-[700px] font-semibold font-base text-lg text-green-600 rounded-xl outline outline-4 hover:bg-blue-400 hover:text-white duration-1000"
            :class="isConnected ? 'bg-blue-400 text-white' : ''"
            @press="connectMetamask"
        />
        <div class="flex flex-col items-center justify-center w-[400px] h-[400px]">
            <!-- Loading screen -->
            <div class="absolute flex flex-col items-center justify-center w-[400px] h-[400px]" v-if="isLoading">
                <img src="/imgs/sonic.png" class="animate-spin z-50" />
                <p class="font-semibold font-base text-xl text-blue-400 text-center animate-pulse mt-4 z-50">
                    Transaction is being processed
                </p>
            </div>
            <div
                class="flex flex-col items-center justify-center w-[400px] h-fit py-5 px-2 bg-gradient-to-t from-amber-800 to-green-800 rounded-2xl"
                :class="[isLoading ? 'blur-sm ' : '']"
            >
                <div class="flex flex-col justify-center items-center bg-gradient-to-b from-blue-400 to-green-500 bg-clip-text">
                    <div class="font-sonic text-[60px] text-transparent text-center">Sonic</div>
                    <div class="font-stake text-[50px] text-transparent text-center -mt-10">Stake</div>
                </div>
                <base-input
                    v-model="amount"
                    :design="'flex flex-col w-[300px] h-14 items-center rounded-lg'"
                    :title="'Amount to Stake'"
                    class="mb-6 font-semibold font-base text-lg text-black"
                />
                <!-- Period selector component -->
                <div class="flex flex-row">
                    <div class="flex flex-col">
                        <input type="radio" id="1" v-model="period" value="1" />
                        <label for="1" class="text-center font-semibold font-base text-lg text-white">30 days 150%</label>
                    </div>
                    <div class="flex flex-col">
                        <input type="radio" id="2" v-model="period" value="2" />
                        <label for="2" class="text-center font-semibold font-base text-lg text-white">90 days 200%</label>
                    </div>
                    <div class="flex flex-col">
                        <input type="radio" id="3" v-model="period" value="3" />
                        <label for="3" class="text-center font-semibold font-base text-lg text-white">180 days 250%</label>
                    </div>
                    <div class="flex flex-col">
                        <input type="radio" id="4" v-model="period" value="4" />
                        <label for="4" class="text-center font-semibold font-base text-lg text-white">test 10 min 100%</label>
                    </div>
                </div>
                <base-button
                    :buttonText="isStakeHolder ? 'Restake!' : 'Stake!'"
                    :size="'w-3/4 h-10'"
                    class="bg-blue-500 rounded-lg font-semibold font-base text-lg text-black transition hover:scale-105 mt-6 mb-4"
                    @press="StakeAmount(amount, period)"
                />
                <base-button
                    :buttonText="'Unstake tokens: ' + stakedAmount.substring(0, 10) + '...'"
                    :size="'w-3/4 h-10'"
                    class="bg-yellow-500 rounded-lg font-semibold font-base text-lg text-black mb-2 transition hover:scale-105"
                    @press="unstake"
                    v-if="isStakeHolder"
                />
                <div class="flex flex-col justify-center">
                    <p class="border-2 border-blue-400 rounded-lg font-semibold font-base text-lg text-white text-center p-2">
                        {{ time }} seconds remaining
                    </p>
                </div>
            </div>
        </div>
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
const data = { provider: null as null | ethers.providers.Web3Provider, signer: null as null | ethers.providers.JsonRpcSigner };
const chainId = 4;

const isLoading = ref(false);
const isStakeHolder = ref(false);
const isConnected = ref(false);
const wallet = ref("");
const amount = ref("");
const stakedAmount = ref("");
const period = ref("");
const time = ref("");

async function getRemainTime() {
    try {
        const _time = await Staking.connect(data.provider!).stakes(wallet.value);
        time.value = BigNumber.from(_time[2]).toString();
        const _now = new Date();
        time.value = (Number(time.value) - _now.getSeconds()).toString();
    } catch (e) {
        console.error(e);
    }
}

async function getInfo(wallet: string) {
    try {
        if (wallet == "") {
            stakedAmount.value = "";
        } else {
            const _amount = await Staking.connect(data.provider!).stakes(wallet);
            stakedAmount.value = ethers.utils.formatEther(BigNumber.from(_amount[0]).toString());
            if (Number(stakedAmount.value) != 0) {
                isStakeHolder.value = true;
            }
            setInterval(getRemainTime, 1000);
        }
    } catch (e) {
        console.error(e);
    }
}

async function unstake() {
    try {
        isLoading.value = true;
        const tx1 = await Staking.connect(data.signer!).unstake();
        await tx1.wait();
        isLoading.value = false;
        getInfo(wallet.value);
    } catch (error) {
        isLoading.value = false;
        console.log(error);
    }
}

async function StakeAmount(amount: string, period: string) {
    try {
        if (period === "") {
            alert("Enter needed period!");
            return { error: true };
        }
        if (amount === "") {
            alert("Enter needed amount!");
            return { error: true };
        }
        const tx = await TokenA.connect(data.signer!).approve(config.ETH.addresses.Staking, BigNumber.from("10000000000000000000000"));
        isLoading.value = true;
        await tx.wait();
        console.log("tx1");
        const tx2 = await Staking.connect(data.signer!).stake(ethers.utils.parseUnits(amount, 18), period);
        await tx2.wait();
        isLoading.value = false;
        getInfo(wallet.value);
    } catch (error) {
        isLoading.value = false;
        console.log(error);
    }
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
        data.provider = new providers.Web3Provider(((window as any).ethereum as any) || (window as any).web3);

        data.signer = data.provider.getSigner();
        await function updateChainId() {
            ((window as any).ethereum as any).once("chainChanged", async (chainId: string) => {
                await connectMetamask();
            });
            ((window as any).ethereum as any).once("accountsChanged", handleWalletChanged);
        };
        getInfo(wallet.value);
        isConnected.value = true;
        // if (chainId !== Number(config.ETH.chainId)) await switchChainIdBSC()
    } catch (error) {
        console.error(error);
    }
}

async function updateChainId() {
    const chainId = (await data.provider?.getNetwork())?.chainId || null;
}
async function handleWalletChanged(addresses: string[]) {
    if (addresses[0]) {
        wallet.value = addresses[0];
    }
    // ;((window as any).ethereum as any).once('accountsChanged', handleWalletChanged)
}
</script>
