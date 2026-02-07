<script lang="ts">
	import Sidebar from '$lib/components/sidebar.svelte';
	import { page } from '$app/state';
	import type { LayoutProps } from './$types';
	import '../app.css';

	let { children, data }: LayoutProps = $props();

	// Hide sidebar on frontpage and auth page
	const hideSidebarRoutes = ['/', '/auth'];

	function shouldShowSidebar(): boolean {
		return !hideSidebarRoutes.includes(page.url.pathname);
	}
</script>

<div class="bg-neutral-900 text-neutral-200 flex min-h-screen">
	{#if shouldShowSidebar()}
		<Sidebar user={data.user}/>
	{/if}
	<div class="flex-1">
		{@render children()}
	</div>
</div>
