<script lang="ts">
    let { size = "small", color = "neutral" }: { size?: "small" | "medium", color?: "green" | "red" | "neutral" | "darkNeutral" } = $props()
</script>

<svg class=" {size === "small" ? "w-5 h-5" : "h-8 w-8"} {color === "green" ? "fill-[#00B86B]" : color === "red" ? "fill-[#ff2222]" : color === "neutral" ? "fill-neutral-200" : "fill-neutral-400"}" viewBox="0 -960 960 960">
    <path d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z"/>
</svg>