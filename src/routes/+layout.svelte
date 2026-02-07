<script lang="ts">
	import Sidebar from '$lib/components/sidebar.svelte';
	import type { LayoutProps } from './$types';
	import '../app.css';
	let { children, data }: LayoutProps = $props();
</script>

<div class=" bg-neutral-800 text-neutral-200 flex justify-center min-h-screen">
	<div class="w-full flex">
		<Sidebar user={data.user}/>
		{@render children()}
		
	</div>
</div>
