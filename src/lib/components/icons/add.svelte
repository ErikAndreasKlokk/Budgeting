<script lang="ts">
    let { size = "small", color = "neutral" }: { size?: "small" | "medium", color?: "green" | "red" | "neutral" | "darkNeutral" } = $props()
</script>

<svg class=" {size === "small" ? "w-5 h-5" : "h-8 w-8"} {color === "green" ? "fill-[#00B86B]" : color === "red" ? "fill-[#ff2222]" : color === "neutral" ? "fill-neutral-200" : "fill-neutral-400"}" viewBox="0 -960 960 960">
    <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/>
</svg>