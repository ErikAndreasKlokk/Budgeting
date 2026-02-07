<script lang="ts">
    let { size = "small", color = "neutral" }: { size?: "small" | "medium", color?: "green" | "red" | "neutral" | "darkNeutral" } = $props()
</script>

<svg class=" {size === "small" ? "w-5 h-5" : "h-8 w-8"} {color === "green" ? "fill-[#00B86B]" : color === "red" ? "fill-[#ff2222]" : color === "neutral" ? "fill-neutral-200" : "fill-neutral-400"}" viewBox="0 -960 960 960">
    <path d="M240-200h120v-240h240v240h120v-360L480-740 240-560v360Zm-80 80v-480l320-240 320 240v480H520v-240h-80v240H160Zm320-350Z"/>
</svg>