<script lang="ts">
	import Header from '$lib/components/header.svelte';
	import type { LayoutProps } from './$types';
	import '../app.css';
	let { children, data }: LayoutProps = $props();
</script>

<div class=" bg-neutral-800 text-white flex justify-center min-h-screen">
	<div class="w-full flex">
		<Header user={data.user}/>
		{@render children()}
		
	</div>
</div>
