<template>
    <div class="flex flex-col items-center justify-center">
        <p :class="design">
            {{ title }}
        </p>
        <input type="text" v-model="inputText" />
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{
    modelValue: string;
    title?: string;
    design?: string;
}>();

const emit = defineEmits(["update:modelValue"]);

const inputText = ref(props.modelValue);

watch(inputText, (oldValue, newValue) => {
    emit("update:modelValue", newValue);
});
</script>
