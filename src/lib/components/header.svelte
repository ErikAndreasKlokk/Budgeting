<script lang="ts">
	import { clickOutside } from "svelte-outside";

    let { user } = $props()

    let openDropdown = $state(false)

</script>

<header class=" h-20 w-full flex items-center justify-between relative mb-12">
    <a href="/" class=" text-3xl font-bold font-serif"><span class=" text-emerald-600 text-5xl">B</span>udgeting</a>
    {#if user}
    <div use:clickOutside={() => openDropdown = false} >
        <button onclick={() => openDropdown = !openDropdown} class=" cursor-pointer underline text-lg font-semibold" aria-label="dropdown">{user} ↓</button>
        {#if openDropdown}
            <form class=" absolute border border-neutral-700 right-1 top-16 z-50 flex flex-col rounded-md  w-40 h-28 justify-around">
                <button formaction="/auth?/logout" formmethod="POST" class=" border border-neutral-800 hover:border-neutral-700 rounded-t-md h-full bg-neutral-800 cursor-pointer">Log out</button>
                <hr class=" border-neutral-700">
                <a onclick={() => openDropdown = !openDropdown } href="/profile" class=" border border-neutral-800 hover:border-neutral-700 h-full bg-neutral-800 cursor-pointer flex items-center justify-center">Profile</a>
                <hr class=" border-neutral-700">
                <a onclick={() => openDropdown = !openDropdown } href="/profile/settings" class=" border border-neutral-800 hover:border-neutral-700 rounded-b-md h-full bg-neutral-800 cursor-pointer flex items-center justify-center">Settings</a>
            </form>
        {/if}
    </div>
    {:else}
        <a href="/auth">Login or register</a>
    {/if}
</header> 