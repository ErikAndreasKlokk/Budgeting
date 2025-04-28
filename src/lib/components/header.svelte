<script lang="ts">
    let { user } = $props()
</script>

<header class=" min-w-60 flex flex-col items-center relative bg-neutral-900">
    <a href="/" class=" text-neutral-200 text-3xl font-bold font-serif italic mt-10"><span class=" text-blue-700 text-5xl font-sans not-italic">B</span>udgeting</a>
    <div class=" mt-20 w-40">
        <a href="/" class=" cursor-pointer flex items-center my-3 underline text-xl font-medium">Home</a>
        {#if user}
            <a href="/dashboard" class=" cursor-pointer flex items-center my-3 underline text-xl font-medium">Dashboard</a>
            <a href="/settings" class=" cursor-pointer flex items-center my-3 underline text-xl font-medium">Settings</a>
            <form>
                <button formaction="/auth?/logout" formmethod="POST" class=" cursor-pointer flex items-center my-3 underline text-xl font-medium">Log out</button>
            </form>
            {:else}
            <a href="/auth" class=" cursor-pointer flex items-center my-3 underline text-xl font-medium">Login</a>
        {/if}
    </div>
</header>