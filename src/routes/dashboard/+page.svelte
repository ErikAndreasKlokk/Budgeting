<script lang="ts">
	import { enhance, applyAction  } from '$app/forms';
	import { clickOutside } from 'svelte-outside';
	import type { PageServerData } from './$types';
	import type { ActionData } from './$types';
	import { Arc, Chart, Group, LinearGradient, Pie, Svg, Tooltip, Text } from 'layerchart';
	import type { accountStatementFormat } from './proxy+page.server';



	let uploadModal = $state(false)
	let editStatementModal = $state(false)
	let addCategoryModal = $state(false)
	let addCategoryValue = $state("")
	let isMainCategory = $state(false)
	let confirmDeleteStatementModal = $state(false)

	let selectedStatement: accountStatementFormat | null = $state(null)
	let selectedStatements: accountStatementFormat[] = $state([])

	
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

	function toggleAllCheckboxes() {
		console.log(data.accountStatements)
		selectedStatements = data.accountStatements
		console.log(selectedStatements)
	}

</script>

<main class=" w-full flex flex-col items-center bg-neutral-800 h-full">
	<div class=" flex flex-col gap-20 my-20 px-12 items-center z-0 w-full max-w-[1100px]">
		<div use:clickOutside={() => uploadModal = false} class=" w-full flex justify-between items-center">
			<p class=" text-4xl font-bold ">Dashboard</p>
			<button onclick={() => uploadModal = true} class=" bg-blue-700 cursor-pointer py-3 px-2 rounded-md text-sm font-semibold active:scale-95 flex gap-2 items-center hover:bg-blue-800">
				Upload account statement
				<svg class="w-5 h-5 text-neutral-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
					<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
				</svg>
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
								uploadModal = false
								location.reload()
							}
	
							await applyAction(result);
						}
					}}>
						<div class="flex items-center justify-center w-full">
							<label for="csv" class="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-neutral-700 bg-neutral-600 border-neutral-500 hover:border-neutral-400">
								<div class="flex flex-col items-center justify-center pt-5 pb-6">
									<svg class="w-8 h-8 mb-4 text-neutral-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
										<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
									</svg>
									<p class="mb-2 text-sm "><span class="font-semibold">Click to upload</span> or drag and drop</p>
									<p class="text-xs ">CSV files only</p>
								</div>
								<input id="csv" type="file"  name="csv" class="hidden" accept=".csv" required={true} />
							</label>
						</div> 
						<button type="submit" class=" bg-blue-700 cursor-pointer py-3 px-2 rounded-md text-sm font-semibold active:scale-95 absolute bottom-5 left-5  hover:bg-blue-800">Upload file</button>
						<button onclick={() => uploadModal = false} type="button" class="  bg-neutral-600 cursor-pointer py-3 px-2 rounded-md text-sm font-semibold active:scale-95 absolute bottom-5 right-5 hover:bg-neutral-700 ">Cancel</button>
					</form>
				</div>
			{/if}
		</div>
		<!-- ---------------- -->
		<!-- Money spent card -->
		<!-- ---------------- -->
		<div class=" flex justify-evenly w-full gap-20">
			<div class=" w-full rounded-2xl h-[600px] bg-neutral-900 flex flex-col p-10">
				<div class=" mb-9">
					<p class=" text-4xl font-bold ">Money spent</p>
					<p class=" italic text-neutral-400">The last 30 days</p>
				</div>
				{#await data.statistics}
					<p>Awaiting data...</p>
				{:then statistics} 
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
						<div class=" h-[200px] flex flex-col items-center">
							<p class="text-2xl w-full font-bold">Top 3 categories</p>
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
				{/await}
			</div>
			<!-- ----------------- -->
			<!-- Money earned card -->
			<!-- ----------------- -->
			<div class=" w-full rounded-2xl h-[600px] bg-neutral-900 flex flex-col p-10">
				<div class=" mb-9">
					<p class=" text-4xl font-bold ">Money earned</p>
					<p class=" italic text-neutral-400">The last 30 days</p>
				</div>
				{#await data.statistics}
					<p>Awaiting data...</p>
				{:then statistics}
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
							<p class="text-2xl w-full font-bold">Top 3 categories</p>
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
				{/await}
			</div>
		</div>


<!-- ----------------------------------------------------------------------------------------------------------- -->


		{#await data.accountStatements}
			<div class=" w-11/12 rounded-xl bg-neutral-800 border border-neutral-700 h-60"></div>
		{:then accountStatements} 
			{#if accountStatements?.length !== 0 && accountStatements !== undefined}
				<!-- ------------------ -->
				<!-- add category modal -->
				<!-- ------------------ -->
				{#if addCategoryModal}
					<div class=" fixed w-screen h-screen top-0 left-0 flex justify-center items-center z-50">
						<button onclick={() => addCategoryModal = false} aria-label="Closes the edit statement modal" class=" fixed h-screen w-screen bg-neutral-900/60 z-30 top-0 left-0 backdrop-blur-xs"></button>
						{#await data.statistics}
							<p>Awaiting data...</p>
						{:then statistics}
						<form class=" flex flex-col w-80 z-30 bg-neutral-800 h-96 relative rounded-md p-4">
							<div class="flex items-center justify-center w-full flex-col">

								<div class="relative z-0 w-full mb-5 group mt-2">
									<label for="text" class="block mb-2 text-sm font-medium text-white">Add {isMainCategory ? "main" : "sub"} category</label>
									<input type="text" bind:value={addCategoryValue} id="text" name="text" class=" text-sm rounded-lg block w-full p-2.5 bg-neutral-700 border-neutral-600 placeholder-neutral-400 text-white focus:ring-blue-500 focus:border-blue-500">
								</div>
							</div> 
							<button type="button" onclick={() => {
								if (isMainCategory && data.statistics) {
									const statistics = data.statistics
									statistics.hovedkategorier.push(addCategoryValue)
									data = { ...data, statistics}
								} else {
									if (data.statistics) {
										const statistics = data.statistics
										statistics.underkategorier.push(addCategoryValue)
										data = { ...data, statistics}
									}
								}

								addCategoryModal = false
							}} 
							class=" bg-blue-700 cursor-pointer py-3 px-2 rounded-md text-sm font-semibold active:scale-95 absolute bottom-5 left-5  hover:bg-blue-800">Add category</button>
							<button onclick={() => addCategoryModal = false} type="button" class="  bg-neutral-600 cursor-pointer py-3 px-2 rounded-md text-sm font-semibold active:scale-95 absolute bottom-5 right-5 hover:bg-neutral-700 ">Cancel</button>
						</form>
						{/await}
					</div>
				{/if}
				<!-- -------------------- -->
				<!-- edit statement modal -->
				<!-- -------------------- -->
				{#if editStatementModal}
					<div class=" fixed w-screen h-screen top-0 left-0 flex justify-center items-center">
						<button onclick={() => editStatementModal = false} aria-label="Closes the edit statement modal" class=" fixed h-screen w-screen bg-neutral-900/60 z-30 top-0 left-0 backdrop-blur-xs"></button>
						<form method="post" action="?/editStatement" class=" flex flex-col w-80 z-30 bg-neutral-800 h-96 relative rounded-md p-4"
						use:enhance={({}) => {
							return async ({ result, update }) => {

								await applyAction(result);
								
								if (result.type === "success") {
									editStatementModal = false
									selectedStatement = null
									selectedStatements = []
									update();
								}
							}
						}}>
							<div class="flex items-center justify-center w-full flex-col">
								<div class="relative z-0 w-full mb-5 group mt-2">
									<label for="text" class="block mb-2 text-sm font-medium text-white">Text</label>
									<input type="text" id="text" name="text" value={selectedStatement ? selectedStatement?.tekst : null} class=" text-sm rounded-lg block w-full p-2.5 bg-neutral-700 border-neutral-600 placeholder-neutral-400 text-white focus:ring-blue-500 focus:border-blue-500">
								</div>
								{#await data.statistics}
									<p>Awaiting data...</p>
								{:then statistics}
									<p class=" w-full text-start mb-2 text-sm font-medium ">Main category</p>
									<div class="flex w-full mb-5">
										<button onclick={() => {
											isMainCategory = true
											addCategoryModal = true
										}} class="cursor-pointer shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center border  rounded-s-lg  focus:ring-4 focus:outline-none  bg-neutral-700 hover:bg-neutral-600 focus:ring-neutral-700 text-white border-neutral-600" type="button">
											+
										</button>
										<label for="hovedkategori" class="sr-only">Choose a main category</label>
										<select id="hovedkategori" name="hovedkategori" class=" cursor-pointer text-sm rounded-e-lg border-s-neutral-700 border-s-2 block w-full p-2.5 bg-neutral-700 border-neutral-600 placeholder-neutral-400 text-white focus:ring-blue-500 focus:border-blue-500">
											{#if !selectedStatement}
												<option selected={true} value={null}></option>	
											{/if}
											{#if data.statistics}
												{#each data.statistics.hovedkategorier as hovedkategori}
													<option selected={selectedStatement?.hovedkategori === hovedkategori} value={hovedkategori}>{hovedkategori}</option>	
												{/each}
											{/if}
										</select>
									</div>
									<p class=" w-full text-start mb-2 text-sm font-medium ">Sub category</p>
									<div class="flex w-full mb-5">
										<button onclick={() => {
											isMainCategory = false
											addCategoryModal = true
										}} class="cursor-pointer shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center border  rounded-s-lg  focus:ring-4 focus:outline-none  bg-neutral-700 hover:bg-neutral-600 focus:ring-neutral-700 text-white border-neutral-600" type="button">
											+
										</button>
										<label for="underkategori" class="sr-only">Choose a sub category</label>
										<select id="underkategori" name="underkategori" class=" cursor-pointer text-sm rounded-e-lg border-s-neutral-700 border-s-2 block w-full p-2.5 bg-neutral-700 border-neutral-600 placeholder-neutral-400 text-white focus:ring-blue-500 focus:border-blue-500">
											{#if !selectedStatement}
												<option selected={true} value={null}></option>	
											{/if}
											{#if data.statistics}
												{#each data.statistics.underkategorier as underkategori}
													<option selected={selectedStatement?.underkategori === underkategori} value={underkategori}>{underkategori}</option>	
												{/each}
											{/if}
										</select>
									</div>
								{/await}
								<input class=" hidden" type="text" name="id" id="id" value={selectedStatement ? selectedStatement?.statementId : JSON.stringify(selectedStatements.flat())}>
							</div> 
							<button type="submit" class=" bg-blue-700 cursor-pointer py-3 px-2 rounded-md text-sm font-semibold active:scale-95 absolute bottom-5 left-5  hover:bg-blue-800">Confirm changes</button>
							<button onclick={() => [editStatementModal = false, selectedStatement = null]} type="button" class="  bg-neutral-600 cursor-pointer py-3 px-2 rounded-md text-sm font-semibold active:scale-95 absolute bottom-5 right-5 hover:bg-neutral-700 ">Cancel</button>
						</form>
					</div>
				{/if}
				<!-- ------------------------------ -->
				<!-- confirm delete statement modal -->
				<!-- ------------------------------ -->
				{#if confirmDeleteStatementModal}
					<div class=" fixed w-screen h-screen top-0 left-0 flex justify-center items-center z-50">
						<button onclick={() => addCategoryModal = false} aria-label="Closes the edit statement modal" class=" fixed h-screen w-screen bg-neutral-900/60 z-30 top-0 left-0 backdrop-blur-xs"></button>
						{#await data.statistics}
							<p>Awaiting data...</p>
						{:then statistics}
						<form class=" flex flex-col w-80 z-30 bg-neutral-800 h-48 relative rounded-md p-4">
							<div class="flex justify-center w-full flex-col">
								{#if selectedStatement}
									<p class=" font-semibold">Confirm delete statement</p>
									<p>You are about to delete a statement!</p>
								{:else}
									<p class=" font-semibold">Confirm delete statements</p>
									<p>You are about to delete {selectedStatements.flat().length} statements!</p>
								{/if}
							</div> 
							<button type="button" onclick={async (e) => {
								if (selectedStatement) {
									await fetch("/api/accountStatements/deleteStatement", {
										method: "DELETE",
										headers: {
											'Content-Type': 'application/json'
										},
										body: JSON.stringify(selectedStatement?.statementId)
									});
									
									if (data.accountStatements) {
										const accountStatements = data.accountStatements.filter((dataStatement) => dataStatement.statementId !== selectedStatement?.statementId);
										data = { ...data, accountStatements}
									}
								} else {
									selectedStatements = selectedStatements.flat()
									selectedStatements.forEach(async statement => {
										await fetch("/api/accountStatements/deleteStatement", {
											method: "DELETE",
											headers: {
												'Content-Type': 'application/json'
											},
											body: JSON.stringify(statement.statementId)
										});
									});
	
									if (data.accountStatements) {
										const accountStatements = data.accountStatements.filter((dataStatement) => {
											return selectedStatements.filter((selectedStatementFilter) => dataStatement.statementId === selectedStatementFilter.statementId).length === 0
										});
										data = { ...data, accountStatements}
									}
								}

								selectedStatement = null
								selectedStatements = []
								confirmDeleteStatementModal = false
							}}

							class=" bg-blue-700 cursor-pointer py-3 px-2 rounded-md text-sm font-semibold active:scale-95 absolute bottom-5 left-5  hover:bg-blue-800">Confirm delete</button>
							<button onclick={() => [confirmDeleteStatementModal = false, selectedStatement = null]} type="button" class="  bg-neutral-600 cursor-pointer py-3 px-2 rounded-md text-sm font-semibold active:scale-95 absolute bottom-5 right-5 hover:bg-neutral-700 ">Cancel</button>
						</form>
						{/await}
					</div>
				{/if}
				<!-- --------------------------- -->
				<!-- Table of account statements -->
				<!-- --------------------------- -->
				<div class=" rounded-xl bg-neutral-900 overflow-x-auto ">
					<table class="w-full text-sm text-left rounded-4xl">
						<thead class="text-xs uppercase bg-neutral-950  text-nowrap">
							<tr>
								<th scope="col" class="px-6 py-5">
									<input bind:group={selectedStatements} onchange={() => toggleAllCheckboxes()} checked={accountStatements.length === selectedStatements.length} type="checkbox" name="checkbox" id="checkbox"  class=" cursor-pointer w-4 h-4 text-blue-600 bg-neutral-700 border-neutral-600 rounded-sm focus:ring-0"/>
								</th>
								<th scope="col" class="px-6 py-5">
									Date
								</th>
								<th scope="col" class="px-6 py-5">
									Money in (+)
								</th>
								<th scope="col" class="px-6 py-5">
									Money out (-)
								</th>
								<th scope="col" class="px-6 py-5">
									Text
								</th>
								<th scope="col" class="px-6 py-5">
									Main category
								</th>
								<th scope="col" class="px-6 py-5">
									Sub category
								</th>
								<td class="px-6 py-4">
									<button 
										disabled={selectedStatements.length <= 0} 
										onclick={() => [editStatementModal = true]} 
										class=" flex text-nowrap font-bold cursor-pointer">. . .
									</button>
								</td>
								<td class="px-6 py-4">
									<button 
										disabled={selectedStatements.length <= 0}
										onclick={() => confirmDeleteStatementModal = true}
										class=" flex text-nowrap font-bold cursor-pointer">x
									</button>
								</td>
							</tr>
						</thead>
						<tbody>
							{#if data.accountStatements !== undefined}
							{#each data.accountStatements as statement}
								<tr class=" border-b bg-neutral-900 border-neutral-800 text-xs text-neutral-400">
									<th scope="col" class="px-6 py-5">
										<input bind:group={selectedStatements} value={statement} type="checkbox" name="checkbox" id="checkbox" class=" cursor-pointer w-4 h-4 bg-neutral-700 border border-neutral-600 rounded-sm focus:ring-0"/>
									</th>
									<td class="px-6 py-4 text-nowrap">
										{new Date(statement.dato).toDateString()}
									</td>
									<td class="px-6 py-4">
										{statement.innPaaKonto}
									</td>
									<td class="px-6 py-4">
										{statement.utFraKonto}
									</td>
									<td class="px-6 py-4">
										{statement.tekst}
									</td>
									<td class="px-6 py-4">
										{statement.hovedkategori}
									</td>
									<td class="px-6 py-4">
										{statement.underkategori}
									</td>
									<td class="px-6 py-4">
										<button onclick={() => [editStatementModal = true, selectedStatement = statement]} class=" flex text-nowrap font-bold cursor-pointer">. . .</button>
									</td>
									<td class="px-6 py-4">
										<button 
											onclick={() => [confirmDeleteStatementModal = true, selectedStatement = statement]}
											class=" flex text-nowrap font-bold cursor-pointer">x</button>
									</td>
								</tr>
							{/each}
							{/if}
						</tbody>
					</table>
					<div>

					</div>
				</div>
			{/if}
		{/await}
	</div>
</main>