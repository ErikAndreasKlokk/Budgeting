<script lang="ts">
	import { enhance } from "$app/forms";

    let { user } = $props()

    let openDropdown = $state(false)

</script>

<header class=" h-20 w-full flex items-center justify-between relative">
    <a href="/" class=" text-4xl font-bold font-serif">Budgeting</a>
    {#if user}
        <button onclick={() => openDropdown = !openDropdown} class=" cursor-pointer underline text-lg font-semibold" aria-label="dropdown">{user} ↓</button>
        {#if openDropdown}
            <form use:enhance class=" absolute border border-neutral-700 right-1 top-16 z-50 flex flex-col rounded-md  w-40 h-20 justify-around">
                <button formaction="/auth?/logout" formmethod="POST" class=" hover:border hover:border-neutral-700 rounded-t-md h-full bg-neutral-800 cursor-pointer">Log out</button>
                <hr class=" border-neutral-700">
                <a onclick={() => openDropdown = !openDropdown } href="/profile/settings" class=" hover:border hover:border-neutral-700 rounded-b-md h-full bg-neutral-800 cursor-pointer flex items-center justify-center">Settings</a>
            </form>
        {/if}
    {:else}
        <a href="/auth">Login or register</a>
    {/if}
</header>