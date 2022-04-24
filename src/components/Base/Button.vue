<template>
    <button @click="$emit('press')" :class="size">{{ buttonText }}</button>
</template>

<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{ buttonText: string; size: string }>();
</script>
