<script lang="ts">
	import { enhance, applyAction  } from '$app/forms';
	import { clickOutside } from 'svelte-outside';
	import type { PageServerData } from './$types';
	import type { ActionData } from './$types';
	import { Arc, Chart, Group, LinearGradient, Pie, Svg, Tooltip, Text } from 'layerchart';
	import Table from '$lib/components/table.svelte';
	import TableSkeleton from '$lib/components/tableSkeleton.svelte';
	import CloudUpload from '$lib/components/icons/cloudUpload.svelte';
	import ArrowDown from '$lib/components/icons/arrowDown.svelte';
	import Leaderboard from '$lib/components/icons/leaderboard.svelte';
	import { invalidateAll } from '$app/navigation';

	let uploadModal = $state(false)
	let file: FileList | null | undefined = $state(null)
	
	let { data, form }: {data: PageServerData, form: ActionData} = $props();
	
	const keyColors = [
		'#1C86EE', // Darker Dodger Blue
		'#36648B', // Darker Steel Blue
		'#53868B', // Darker Cadet Blue
		'#2E8B8B', // Darker Light Sea Green
		'#3CB3B3', // Darker Turquoise
		'#43B3AE', // Slightly Darker Medium Turquoise
		'#009ACD', // Darker Deep Sky Blue
		'#00AAAA', // Darker Dark Turquoise
		'#66CDAA', // Darker Aquamarine
		'#00C77F', // Darker Medium Spring Green
		'#00B76F', // Darker Spring Green
		'#5CBF00', // Darker Lawn Green
		'#2CA02C', // Darker Lime Green
		'#4FA088', // Darker Medium Aquamarine
		'#5D478B', // Darker Slate Blue
		'#6959CD', // Darker Medium Slate Blue
		'#7A5DC7', // Darker Medium Purple
		'#7D26CD', // Darker Blue Violet
		'#483D8B', // Dark Slate Blue
		'#2E2E8B', // Even Darker Slate Blue
		'#191970', // Midnight Blue (already dark)
		'#2F4F4F'  // Dark Slate Gray (already dark)
	];

</script>

<main class=" w-full flex flex-col items-center bg-neutral-800 h-full">
	<div class=" flex flex-col gap-20 mt-20 mb-60 px-12 items-center z-0 w-full max-w-[1100px]">
		<div use:clickOutside={() => uploadModal = false} class=" w-full flex justify-between items-center">
			<p class=" text-4xl font-bold ">Dashboard</p>
			<button onclick={() => uploadModal = true} class=" bg-blue-700 cursor-pointer py-3 px-2 rounded-md text-sm font-semibold active:scale-95 flex gap-2 items-center hover:bg-blue-800">
				Upload account statement
				<CloudUpload />
			</button>
			<!-- ---------------- -->
			<!-- Upload csv modal -->
			<!-- ---------------- -->
			{#if uploadModal}
				<div class=" fixed w-screen h-screen top-0 left-0 flex justify-center items-center z-50">
					<button onclick={() => uploadModal = false} aria-label="Closes the upload modal" class=" fixed h-screen w-screen bg-neutral-900/60 z-30 top-0 left-0 backdrop-blur-xs"></button>
					{#if form?.missing}
						<p>No file or incorrect file type.</p>
					{/if}
					{#if form?.incorrect}
						<p>You are not logged in, log in to upload file.</p>
					{/if}
					<form method="post" action="?/uploadCsv" class=" flex flex-col w-80 z-30 bg-neutral-800 h-96 relative rounded-md p-4" enctype="multipart/form-data" 
					use:enhance={({}) => {
						return async ({ result }) => {
							if (result.type === "success") {
								uploadModal = false;
								file = null;
								invalidateAll();
							}
	
							await applyAction(result);
						}
					}}>
						<div class="flex items-center justify-center w-full">
							<label for="csv" class="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-neutral-700 bg-neutral-600 border-neutral-500 hover:border-neutral-400">
								<div class="flex flex-col items-center justify-center pt-5 pb-6">
									{#if file?.length !== 0 && file}
										<p>File "{file[0].name}" selected!</p>
									{:else}
										<CloudUpload size="medium" />
										<p class="my-2 text-sm "><span class="font-semibold">Click to upload</span> or drag and drop</p>
										<p class="text-xs ">CSV files only</p>
									{/if}
								</div>
								<input bind:files={file} id="csv" type="file"  name="csv" class="hidden" accept=".csv" required={true} />
							</label>
						</div> 
						<button type="submit" class=" bg-blue-700 cursor-pointer py-3 px-2 rounded-md text-sm font-semibold active:scale-95 absolute bottom-5 left-5  hover:bg-blue-800">Upload file</button>
						<button onclick={() => [uploadModal = false, file = null]} type="button" class="  bg-neutral-600 cursor-pointer py-3 px-2 rounded-md text-sm font-semibold active:scale-95 absolute bottom-5 right-5 hover:bg-neutral-700 ">Cancel</button>
					</form>
				</div>
			{/if}
		</div>
		{#await data.statistics}
			<!-- TODO: Add money spent and money earned skeleton cards -->
			<p>Awaiting data...</p>
		{:then statistics}
			<div class=" flex justify-evenly w-full gap-20">
				<!-- ---------------- -->
				<!-- Money spent card -->
				<!-- ---------------- -->
				<div class=" w-full rounded-2xl h-[600px] bg-neutral-900 flex flex-col p-10">
					<div class=" mb-9">
						<p class=" text-4xl font-bold ">Money spent</p>
						<!-- TODO: add functionality for choosing what dates to show data from -->
						<button class=" flex items-center text-neutral-400 italic cursor-pointer mt-1">
							Feb 2025 - Mar 2025
							<ArrowDown color="darkNeutral"/>
						</button>
					</div>
					{#if statistics?.kategoriData.length !== 0}
						<div class="h-[300px] p-4 overflow-auto relative w-full mb-9">
							<Chart data={statistics?.kategoriData} x="moneyOut" c="hovedkategori" cRange={keyColors} let:tooltip>
								<Svg center>
									<Pie outerRadius={100} innerRadius={80} {tooltip} padAngle={0.02}/>
								</Svg>
								<Tooltip.Root let:data>
									<Tooltip.List>
										<Tooltip.Item
										label={data.hovedkategori}
										value={data.moneyOut.toFixed(0) + " kr"}
										format="integer"
										valueAlign="left"
										/>
									</Tooltip.List>
								</Tooltip.Root>
							</Chart>
							<p class=" absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-2xl ">{statistics?.moneyOut.toFixed(0)} kr</p>
						</div>
						<div class=" h-[200px] flex flex-col">
							<div class=" flex items-center gap-2 ">
								<Leaderboard  size="medium"/>
								<p class="text-2xl font-bold">Top 3 categories</p> 
							</div>
							<div class=" flex mt-6 w-full justify-between">
								<ol>
									<li>1. {statistics?.kategoriData?.sort((a, b) => b?.moneyOut - a?.moneyOut)[0]?.hovedkategori}</li>
									<li>2. {statistics?.kategoriData?.sort((a, b) => b?.moneyOut - a?.moneyOut)[1]?.hovedkategori}</li>
									<li>3. {statistics?.kategoriData?.sort((a, b) => b?.moneyOut - a?.moneyOut)[2]?.hovedkategori}</li>
								</ol>
								<ol class=" text-end font-bold italic">
									<li>{statistics?.kategoriData.sort((a, b) => b?.moneyOut - a?.moneyOut)[0]?.moneyOut.toFixed(0)} kr</li>
									<li>{statistics?.kategoriData.sort((a, b) => b?.moneyOut - a?.moneyOut)[1]?.moneyOut.toFixed(0)} kr</li>
									<li>{statistics?.kategoriData.sort((a, b) => b?.moneyOut - a?.moneyOut)[2]?.moneyOut.toFixed(0)} kr</li>
								</ol>
							</div>
						</div>
					{/if}
				</div>
				<!-- ----------------- -->
				<!-- Money earned card -->
				<!-- ----------------- -->
				<div class=" w-full rounded-2xl h-[600px] bg-neutral-900 flex flex-col p-10">
					<div class=" mb-9">
						<p class=" text-4xl font-bold ">Money earned</p>
						<button class=" flex items-center text-neutral-400 italic cursor-pointer mt-1">
							<!-- TODO: add functionality for choosing what dates to show data from -->
							Feb 2025 - Mar 2025
							<ArrowDown color="darkNeutral"/>
						</button>
					</div>
					{#if statistics?.kategoriData.length !== 0 && statistics?.moneyIn !== undefined && statistics?.moneyOut !== undefined}
						<div class="h-[300px] p-4 relative w-full mb-9 overflow-hidden">
							<Chart data={[{value: statistics?.moneyIn - statistics?.moneyOut, label: "Money left to spend"}, {value: statistics?.moneyOut, label: "Money spent"}]} x="value" c="value" cRange={statistics?.moneyIn - statistics?.moneyOut < 0 ? ["#320801", "#ff2222"] : ["#013220", "#00B86B"]} let:tooltip>
								<Svg center>
									<Pie outerRadius={100} innerRadius={80} {tooltip}/>
								</Svg>
								<Tooltip.Root let:data>
									
									<Tooltip.List>
										<Tooltip.Item
										label={data.label}
										value={data.value.toFixed(0) + " kr"}
										format="integer"
										valueAlign="left"
										/>
									</Tooltip.List>
								</Tooltip.Root>
							</Chart>
							<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
								<p class=" {statistics?.moneyIn - statistics?.moneyOut < 0 ? "text-[#ff2222]" : "text-[#00B86B]"} text-2xl font-bold">{statistics?.moneyIn - statistics?.moneyOut < 0 ? "" : "+"}{(statistics?.moneyIn - statistics?.moneyOut).toFixed(0)} kr</p>
								<p class=" font-semibold text-xs text-end absolute right-0 top-7 text-neutral-400">/ {statistics?.moneyIn.toFixed(0)} kr</p>
							</div>
						</div>
						<div class=" h-[200px] flex flex-col">
							<div class=" flex items-center gap-2 ">
								<Leaderboard  size="medium"/>
								<p class="text-2xl font-bold">Top 3 categories</p> 
							</div>
							<div class=" flex mt-6 w-full justify-between">
								<ol>
									<li>1. {statistics?.kategoriData?.sort((a, b) => b?.moneyIn - a?.moneyIn)[0]?.hovedkategori}</li>
									<li>2. {statistics?.kategoriData?.sort((a, b) => b?.moneyIn - a?.moneyIn)[1]?.hovedkategori}</li>
									<li>3. {statistics?.kategoriData?.sort((a, b) => b?.moneyIn - a?.moneyIn)[2]?.hovedkategori}</li>
								</ol>
								<ol class=" text-end font-bold italic">
									<li>{statistics?.kategoriData?.sort((a, b) => b?.moneyIn - a?.moneyIn)[0]?.moneyIn.toFixed(0)} kr</li>
									<li>{statistics?.kategoriData?.sort((a, b) => b?.moneyIn - a?.moneyIn)[1]?.moneyIn.toFixed(0)} kr</li>
									<li>{statistics?.kategoriData?.sort((a, b) => b?.moneyIn - a?.moneyIn)[2]?.moneyIn.toFixed(0)} kr</li>
								</ol>
							</div>
						</div>
					{/if}
				</div>
			</div>
		{/await}
			

	<!-- ----------------------------------------------------------------------------------------------------------- -->
	
		{#await data.accountStatements}
			<TableSkeleton />
		{:then accountStatements} 
			{#if accountStatements?.length !== 0 && accountStatements !== undefined}
				{#await data.accountStatementsCount}
					<TableSkeleton />
				{:then accountStatementsCount} 
					<Table {accountStatements} statistics={data.statistics} {accountStatementsCount} />
				{/await}
			{:else}
				<TableSkeleton />
			{/if}
		{/await}
	</div>
</main>