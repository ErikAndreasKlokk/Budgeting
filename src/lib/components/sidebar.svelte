<script lang="ts">
	import { page } from '$app/state';
	import Home from "./icons/home.svelte";
	import Login from "./icons/login.svelte";
	import Logout from "./icons/logout.svelte";
	import Settings from "./icons/settings.svelte";
	import TrendingUp from "./icons/trendingUp.svelte";

	let { user } = $props();

	let collapsed = $state(false);

	// Load collapsed state from localStorage on mount
	$effect(() => {
		if (typeof window !== 'undefined') {
			const saved = localStorage.getItem('sidebarCollapsed');
			if (saved !== null) {
				collapsed = saved === 'true';
			}
		}
	});

	function toggleSidebar() {
		collapsed = !collapsed;
		if (typeof window !== 'undefined') {
			localStorage.setItem('sidebarCollapsed', String(collapsed));
		}
	}

	function isActive(path: string): boolean {
		return page.url.pathname === path;
	}
</script>

<aside class="flex flex-col bg-neutral-900 border-r border-neutral-800 transition-all duration-300 h-screen sticky top-0 {collapsed ? 'w-16' : 'w-64'}">
	<!-- Header with logo and toggle -->
	<div class="flex items-center justify-between p-4 border-b border-neutral-800">
		{#if !collapsed}
			<a href="/" class="flex items-center gap-2">
				<img class="h-8" src="/2.png" alt="Logo">
				<span class="text-lg font-bold text-white">Budgeting</span>
			</a>
		{:else}
			<a href="/" class="mx-auto">
				<img class="h-8" src="/2.png" alt="Logo">
			</a>
		{/if}
	</div>

	<!-- Toggle button -->
	<button
		onclick={toggleSidebar}
		class="flex items-center {collapsed ? 'justify-center' : ''} p-3 mx-2 mt-3 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer text-neutral-400 hover:text-white"
		title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
	>
		<svg class="w-5 h-5 transition-transform {collapsed ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path>
		</svg>
		{#if !collapsed}
			<span class="ml-3 text-sm">Collapse</span>
		{/if}
	</button>

	<!-- Main Navigation -->
	<nav class="flex-1 px-2 py-4 space-y-1">
		{#if user}
			<a
				href="/dashboard"
				class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors {isActive('/dashboard') ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'}"
				title="Dashboard"
			>
				<TrendingUp />
				{#if !collapsed}
					<span class="font-medium">Dashboard</span>
				{/if}
			</a>
		{:else}
			<a
				href="/"
				class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors {isActive('/') ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'}"
				title="Home"
			>
				<Home />
				{#if !collapsed}
					<span class="font-medium">Home</span>
				{/if}
			</a>
			<a
				href="/auth"
				class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors {isActive('/auth') ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'}"
				title="Login"
			>
				<Login />
				{#if !collapsed}
					<span class="font-medium">Login</span>
				{/if}
			</a>
		{/if}
	</nav>

	<!-- Footer with Settings and Logout -->
	{#if user}
		<div class="px-2 py-3 border-t border-neutral-800 space-y-1">
			<a
				href="/settings"
				class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors {isActive('/settings') ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'}"
				title="Settings"
			>
				<Settings />
				{#if !collapsed}
					<span class="font-medium">Settings</span>
				{/if}
			</a>
			<form method="POST" action="/auth?/logout">
				<button
					type="submit"
					class="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-neutral-400 hover:bg-red-900/30 hover:text-red-400 transition-colors cursor-pointer"
					title="Log out"
				>
					<Logout />
					{#if !collapsed}
						<span class="font-medium">Log out</span>
					{/if}
				</button>
			</form>
		</div>
	{/if}
</aside>
