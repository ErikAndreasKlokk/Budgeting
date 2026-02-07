<script lang="ts">
    let { size = "small", color = "neutral" }: { size?: "small" | "medium", color?: "green" | "red" | "neutral" | "darkNeutral" } = $props()
</script>

<svg class=" {size === "small" ? "w-5 h-5" : "h-8 w-8"} {color === "green" ? "fill-[#00B86B]" : color === "red" ? "fill-[#ff2222]" : color === "neutral" ? "fill-neutral-200" : "fill-neutral-400"}" viewBox="0 -960 960 960">
    <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/>
</svg>