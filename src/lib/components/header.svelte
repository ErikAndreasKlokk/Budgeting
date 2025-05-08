<script lang="ts">
	import Home from "./icons/home.svelte";
	import Login from "./icons/login.svelte";
	import Logout from "./icons/logout.svelte";
	import Settings from "./icons/settings.svelte";
	import TrendingUp from "./icons/trendingUp.svelte";

    let { user } = $props()
</script>

<header class=" min-w-60 flex flex-col items-center relative bg-neutral-900">
    <a href="/" class=" text-neutral-200 text-3xl font-bold font-serif italic mt-10"><span class=" text-blue-700 text-5xl font-sans not-italic">B</span>udgeting</a>
    <div class=" mt-20 w-40">
        <a href="/" class=" cursor-pointer flex items-center my-3 underline text-xl font-medium gap-1">
            <Home />
            Home
        </a>
        {#if user}
            <a href="/dashboard" class=" cursor-pointer flex items-center my-3 underline text-xl font-medium gap-1">
                <TrendingUp />
                Dashboard
            </a>
            <a href="/settings" class=" cursor-pointer flex items-center my-3 underline text-xl font-medium gap-1">
                <Settings />
                Settings
            </a>
            <form>
                <button formaction="/auth?/logout" formmethod="POST" class=" cursor-pointer flex items-center my-3 underline text-xl font-medium gap-1">
                    <Logout />
                    Log out
                </button>
            </form>
            {:else}
            <a href="/auth" class=" cursor-pointer flex items-center my-3 underline text-xl font-medium gap-1">
                <Login />
                Login
            </a>
        {/if}
    </div>
</header> 