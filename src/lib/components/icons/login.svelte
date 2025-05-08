<script lang="ts">
    let { size = "small", color = "neutral" }: { size: "small" | "medium", color: "green" | "red" | "neutral" | "darkNeutral" } = $props()
</script>

<svg class=" {size === "small" ? "w-5 h-5" : "h-8 w-8"} {color === "green" ? "fill-[#00B86B]" : color === "red" ? "fill-[#ff2222]" : color === "neutral" ? "fill-neutral-200" : "fill-neutral-400"}" viewBox="0 -960 960 960">
    <path d="M480-120v-80h280v-560H480v-80h280q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H480Zm-80-160-55-58 102-102H120v-80h327L345-622l55-58 200 200-200 200Z"/>
</svg>