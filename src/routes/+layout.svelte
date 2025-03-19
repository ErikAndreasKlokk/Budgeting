<script lang="ts">
	import Header from '$lib/components/header.svelte';
	import type { LayoutProps } from './$types';
	import '../app.css';
	let { children, data }: LayoutProps = $props();
</script>

<div class=" bg-neutral-900 text-white min-h-screen min-w-screen px-2 flex justify-center">
	<div class=" max-w-[1200px] w-full">
		<Header user={data.user}/>
		{@render children()}
	</div>
</div>
