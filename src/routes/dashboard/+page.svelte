<script lang="ts">
	import { enhance, applyAction  } from '$app/forms';
	import { clickOutside } from 'svelte-outside';
	import type { PageServerData } from './$types';
	import type { ActionData } from './$types';
	import Table from '$lib/components/table.svelte';
	import TableSkeleton from '$lib/components/tableSkeleton.svelte';
	import CloudUpload from '$lib/components/icons/cloudUpload.svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import CalendarButton from '$lib/components/calendarButton.svelte';
	import { page } from '$app/state';

	let uploadModal = $state(false)
	let file: FileList | null | undefined = $state(null)
	let selectedBank: string = $state("bulder")
	let bankDropdownOpen = $state(false)
	let expandedSpendingCategory: string | null = $state(null)
	let expandedIncomeCategory: string | null = $state(null)

	let { data, form }: {data: PageServerData, form: ActionData} = $props();

	let dateRange: { from: Date | undefined; to: Date | undefined } = $state({
        from: data.defaultDateRange?.from ? new Date(data.defaultDateRange.from) : undefined,
        to: data.defaultDateRange?.to ? new Date(data.defaultDateRange.to) : undefined
    });

	// Sync dateRange with URL params after navigation
	$effect(() => {
		const url = page.url;
		const fromParam = url.searchParams.get('cardsDateRangeFrom');
		const toParam = url.searchParams.get('cardsDateRangeTo');

		if (fromParam && toParam) {
			dateRange.from = new Date(fromParam);
			dateRange.to = new Date(toParam);
		} else if (!fromParam && !toParam && data.defaultDateRange) {
			dateRange.from = data.defaultDateRange.from ? new Date(data.defaultDateRange.from) : undefined;
			dateRange.to = data.defaultDateRange.to ? new Date(data.defaultDateRange.to) : undefined;
		}
	});

	function handleDateSelect() {
        const params = new URLSearchParams(window.location.search);
        if (!dateRange.from || !dateRange.to) {
            params.set('cardsDateRangeFrom', "")
            params.set('cardsDateRangeTo', "")
            goto(`?${params.toString()}`, { replaceState: true, noScroll: true });
            return;
        };
        params.set('cardsDateRangeFrom', new Date(dateRange.from.setDate(dateRange.from.getDate() + 1)).toISOString().slice(0, 10))
        params.set('cardsDateRangeTo', new Date(dateRange.to.setDate(dateRange.to.getDate() + 1)).toISOString().slice(0, 10))

        dateRange.from.setDate(dateRange.from.getDate() - 1)
        dateRange.to.setDate(dateRange.to.getDate() - 1)
        goto(`?${params.toString()}`, { replaceState: true, noScroll: true });
    }

</script>

<main class=" w-full flex flex-col items-center bg-neutral-900 h-full">
	<div class=" flex flex-col gap-5 mt-20 mb-60 px-12 z-0 w-full max-w-[1100px]">
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
					<form method="post" action="?/uploadCsv" class="flex flex-col w-[480px] z-30 bg-neutral-800 relative rounded-xl overflow-hidden" enctype="multipart/form-data"
					use:enhance={({}) => {
						return async ({ result }) => {
							if (result.type === "success") {
								uploadModal = false;
								file = null;
								selectedBank = "bulder";
								invalidateAll();
							}

							await applyAction(result);
						}
					}}>
						<!-- Header -->
						<div class="flex items-center justify-between px-6 py-4 border-b border-neutral-700">
							<div>
								<h2 class="text-xl font-bold text-white">Upload Statement</h2>
								<p class="text-sm text-neutral-400 mt-0.5">Import your bank account data</p>
							</div>
							<button type="button" aria-label="Close the upload modal" onclick={() => [uploadModal = false, file = null, selectedBank = "bulder"]} class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-700 transition-colors cursor-pointer">
								<svg class="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
								</svg>
							</button>
						</div>

						<!-- Content -->
						<div class="p-6 space-y-6">
							<!-- Error messages -->
							{#if form?.missing}
								<div class="p-3 rounded-lg bg-red-900/30 border border-red-800 text-red-300 text-sm">
									No file selected or incorrect file type.
								</div>
							{/if}
							{#if form?.incorrect}
								<div class="p-3 rounded-lg bg-red-900/30 border border-red-800 text-red-300 text-sm">
									You are not logged in. Please log in to upload files.
								</div>
							{/if}

							<!-- Bank selection -->
							<div class="space-y-2">
								<label for="bank" class="block text-sm font-medium text-neutral-200">Select your bank</label>
								<div class="relative" use:clickOutside={() => bankDropdownOpen = false}>
									<button
										type="button"
										onclick={() => bankDropdownOpen = !bankDropdownOpen}
										class="w-full text-sm rounded-lg p-3 bg-neutral-700 border border-neutral-600 text-white cursor-pointer transition-colors flex items-center justify-between {bankDropdownOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}"
									>
										<span>{selectedBank === 'bulder' ? 'Bulder Bank' : selectedBank === 'dnb' ? 'DNB' : 'Other Bank'}</span>
										<svg class="w-4 h-4 text-neutral-400 transition-transform {bankDropdownOpen ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
										</svg>
									</button>
									{#if bankDropdownOpen}
										<div class="absolute z-50 w-full mt-2 bg-neutral-700 border border-neutral-600 rounded-lg overflow-hidden shadow-lg">
											<button
												type="button"
												onclick={(e) => {e.stopPropagation(); selectedBank = 'bulder'; bankDropdownOpen = false}}
												class="w-full px-3 py-2.5 text-sm text-left text-white hover:bg-neutral-600 transition-colors cursor-pointer {selectedBank === 'bulder' ? 'bg-neutral-600' : ''}"
											>
												Bulder Bank
											</button>
											<button
												type="button"
												onclick={(e) => {e.stopPropagation(); selectedBank = 'dnb'; bankDropdownOpen = false}}
												class="w-full px-3 py-2.5 text-sm text-left text-white hover:bg-neutral-600 transition-colors cursor-pointer {selectedBank === 'dnb' ? 'bg-neutral-600' : ''}"
											>
												DNB
											</button>
											<button
												type="button"
												disabled
												class="w-full px-3 py-2.5 text-sm text-left text-neutral-500 cursor-not-allowed"
											>
												More banks coming soon...
											</button>
										</div>
									{/if}
									<input type="hidden" name="bank" value={selectedBank} />
								</div>
							</div>

							<!-- File upload area -->
							<div class="space-y-2">
								<label for="csv" class="block text-sm font-medium text-neutral-200">Upload file</label>
								<label for="csv" class="flex flex-col items-center justify-center w-full h-52 border-2 border-dashed rounded-xl cursor-pointer transition-all hover:bg-neutral-700/50 bg-neutral-700/30 border-neutral-600 hover:border-neutral-500">
									<div class="flex flex-col items-center justify-center py-6">
										{#if file?.length !== 0 && file}
											<div class="w-12 h-12 rounded-full bg-emerald-900/50 flex items-center justify-center mb-3">
												<svg class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
												</svg>
											</div>
											<p class="text-sm font-medium text-white">{file[0].name}</p>
											<p class="text-xs text-neutral-400 mt-1">Click to change file</p>
										{:else}
											<div class="w-12 h-12 rounded-full bg-neutral-600 flex items-center justify-center mb-3">
												<CloudUpload size="medium" />
											</div>
											<p class="text-sm text-neutral-200"><span class="font-semibold text-blue-400">Click to upload</span> or drag and drop</p>
											<p class="text-xs text-neutral-500 mt-1">CSV files only</p>
										{/if}
									</div>
									<input bind:files={file} id="csv" type="file" name="csv" class="hidden" accept=".csv" required={true} />
								</label>
							</div>
						</div>

						<!-- Footer -->
						<div class="flex justify-end gap-3 px-6 py-4 border-t border-neutral-700">
							<button onclick={() => [uploadModal = false, file = null, selectedBank = "bulder"]} type="button" class="px-5 py-2.5 rounded-lg text-sm font-medium bg-neutral-700 hover:bg-neutral-600 transition-colors cursor-pointer">Cancel</button>
							<button type="submit" class="px-5 py-2.5 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer flex items-center gap-2">
								<CloudUpload />
								Upload file
							</button>
						</div>
					</form>
				</div>
			{/if}
		</div>
		{#await data.statistics}
			<CalendarButton/>
			<div class=" flex justify-evenly w-full gap-6">
				<!-- ---------------- -->
				<!-- Money spent card -->
				<!-- ---------------- -->
				<div class=" w-0 flex-1 min-w-0 overflow-hidden rounded-xl flex flex-col p-6 border border-neutral-800">
					<p class=" text-sm font-medium text-neutral-400 mb-1">Money spent</p>
					<div class="h-8 mb-4">
						<div class="h-6 w-32 bg-neutral-800 rounded animate-pulse"></div>
					</div>
					<div class="border-t border-neutral-800 pt-4">
						<p class="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-4">By category</p>
						<div class="flex items-end justify-between gap-2 h-32">
							{#each [100, 75, 50, 35, 20] as height}
								<div class="flex-1 flex flex-col items-center gap-2">
									<div class="w-full bg-neutral-800 rounded-t animate-pulse" style="height: {height}%"></div>
								</div>
							{/each}
						</div>
					</div>
				</div>
				<!-- ----------------- -->
				<!-- Money earned card -->
				<!-- ----------------- -->
				<div class=" w-0 flex-1 min-w-0 overflow-hidden rounded-xl flex flex-col p-6 border border-neutral-800">
					<p class=" text-sm font-medium text-neutral-400 mb-1">Money earned</p>
					<div class="h-8 mb-4">
						<div class="h-6 w-32 bg-neutral-800 rounded animate-pulse"></div>
					</div>
					<div class="border-t border-neutral-800 pt-4">
						<p class="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-4">By category</p>
						<div class="flex items-end justify-between gap-2 h-32">
							{#each [100, 75, 50, 35, 20] as height}
								<div class="flex-1 flex flex-col items-center gap-2">
									<div class="w-full bg-neutral-800 rounded-t animate-pulse" style="height: {height}%"></div>
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div>
		{:then statistics}
			<CalendarButton range={true} dateFormat={{ dateStyle: "medium"}} bind:rangeFrom={dateRange.from} bind:rangeTo={dateRange.to} onclear={handleDateSelect} onselect={handleDateSelect}/>
			<div class=" flex justify-evenly w-full gap-6">
				<!-- ---------------- -->
				<!-- Money spent card -->
				<!-- ---------------- -->
				<div class=" w-0 flex-1 min-w-0 overflow-hidden rounded-xl flex flex-col p-6 border border-neutral-800">
					<p class=" text-sm font-medium text-neutral-400 mb-1">Money spent</p>
					{#if statistics?.kategoriData?.length !== 0}
						{@const sortedOut = statistics?.kategoriData?.sort((a, b) => b?.moneyOut - a?.moneyOut) ?? []}
						{@const maxOut = sortedOut[0]?.moneyOut || 1}
						{@const spendingChange = statistics?.previousMoneyOut > 0 ? ((statistics?.moneyOut - statistics?.previousMoneyOut) / statistics?.previousMoneyOut) * 100 : 0}
						<div class="flex items-baseline gap-3 mb-4">
							<p class=" text-3xl font-bold">{statistics?.moneyOut.toFixed(0)} <span class="text-base text-neutral-400 font-medium">kr</span></p>
							{#if statistics?.previousMoneyOut > 0}
								<p class="text-sm flex items-center gap-1 {spendingChange <= 0 ? 'text-emerald-500' : 'text-red-500'}">
									<span class="text-neutral-500 font-normal">vs prev:</span>
									{#if spendingChange < 0}
										<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
									{:else if spendingChange > 0}
										<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd"></path></svg>
									{/if}
									<span class="font-semibold">{spendingChange > 0 ? '+' : ''}{spendingChange.toFixed(0)}%</span>
								</p>
							{/if}
						</div>
						<div class="border-t border-neutral-800 pt-4">
							<p class="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-4">By category <span class="text-neutral-600">(click to expand)</span></p>
							<div class="overflow-x-auto pb-2 px-1 custom-scrollbar">
								<div class="flex gap-3">
								{#each sortedOut as category}
									{@const percentage = ((category?.moneyOut / (statistics?.moneyOut ?? 1)) * 100)}
									<button
										onclick={() => expandedSpendingCategory = expandedSpendingCategory === category?.hovedkategori ? null : category?.hovedkategori}
										class="w-16 flex-shrink-0 flex flex-col items-center cursor-pointer group"
									>
										<div class="flex flex-col items-center gap-1 h-36 justify-end w-full mb-2">
											<span class="text-xs font-semibold text-neutral-300">{percentage.toFixed(0)}%</span>
											<div
												class="w-full bg-blue-500 rounded-t transition-all duration-300 min-h-1 group-hover:bg-blue-400 {expandedSpendingCategory === category?.hovedkategori ? 'ring-2 ring-blue-300' : ''}"
												style="height: {(category?.moneyOut / maxOut) * 100}%"
											></div>
										</div>
										<div class="text-center hover:bg-neutral-800 rounded p-1 transition-colors w-full {expandedSpendingCategory === category?.hovedkategori ? 'bg-neutral-800' : ''}">
											<p class="text-xs text-neutral-400 truncate" title={category?.hovedkategori}>{category?.hovedkategori}</p>
											<p class="text-xs font-medium text-neutral-500">{category?.moneyOut.toFixed(0)} kr</p>
										</div>
									</button>
								{/each}
								</div>
							</div>
							{#if expandedSpendingCategory}
								{@const expandedCat = sortedOut.find(c => c?.hovedkategori === expandedSpendingCategory)}
								{#if expandedCat && expandedCat.underkategorier?.length > 0}
									<div class="mt-4 pt-4 border-t border-neutral-700">
										<div class="flex items-center justify-between mb-3">
											<p class="text-xs font-medium text-neutral-400">{expandedSpendingCategory} breakdown</p>
											<button onclick={() => expandedSpendingCategory = null} class="text-xs text-neutral-500 hover:text-neutral-300">Close</button>
										</div>
										<div class="space-y-2">
											{#each expandedCat.underkategorier.sort((a, b) => b.moneyOut - a.moneyOut) as subcategory}
												{@const subPercentage = ((subcategory.moneyOut / expandedCat.moneyOut) * 100)}
												<div class="flex items-center gap-3">
													<div class="flex-1">
														<div class="flex justify-between text-xs mb-1">
															<span class="text-neutral-400">{subcategory.underkategori || 'Uncategorized'}</span>
															<span class="text-neutral-500">{subcategory.moneyOut.toFixed(0)} kr</span>
														</div>
														<div class="h-2 bg-neutral-800 rounded-full overflow-hidden">
															<div class="h-full bg-blue-400 rounded-full transition-all duration-300" style="width: {subPercentage}%"></div>
														</div>
													</div>
													<span class="text-xs font-medium text-neutral-400 w-10 text-right">{subPercentage.toFixed(0)}%</span>
												</div>
											{/each}
										</div>
									</div>
								{/if}
							{/if}
						</div>
					{:else}
						<p class=" text-3xl font-bold text-neutral-600 mb-4">0 <span class="text-base font-medium">kr</span></p>
						<div class="border-t border-neutral-800 pt-4">
							<p class="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-4">By category</p>
							<div class="flex items-end justify-between gap-3 h-36">
								{#each [60, 45, 30, 20, 10] as height}
									<div class="flex-1 flex flex-col items-center h-full justify-end">
										<div class="w-full bg-neutral-800 rounded-t" style="height: {height}%"></div>
									</div>
								{/each}
							</div>
							<p class="text-neutral-600 text-xs mt-4 italic text-center">No data for selected period</p>
						</div>
					{/if}
				</div>
				<!-- ----------------- -->
				<!-- Money earned card -->
				<!-- ----------------- -->
				<div class=" w-0 flex-1 min-w-0 overflow-hidden rounded-xl flex flex-col p-6 border border-neutral-800">
					<p class=" text-sm font-medium text-neutral-400 mb-1">Money earned</p>
					{#if statistics?.kategoriData?.length !== 0 && statistics?.moneyIn !== undefined && statistics?.moneyOut !== undefined}
						{@const sortedIn = statistics?.kategoriData?.sort((a, b) => b?.moneyIn - a?.moneyIn).filter(c => c?.moneyIn > 0) ?? []}
						{@const maxIn = sortedIn[0]?.moneyIn || 1}
						{@const incomeChange = statistics?.previousMoneyIn > 0 ? ((statistics?.moneyIn - statistics?.previousMoneyIn) / statistics?.previousMoneyIn) * 100 : 0}
						<div class="flex items-baseline gap-3 mb-4">
							<p class=" text-3xl font-bold">{statistics?.moneyIn.toFixed(0)} <span class="text-base text-neutral-400 font-medium">kr</span></p>
							<p class="text-sm {statistics?.moneyIn - statistics?.moneyOut < 0 ? 'text-red-500' : 'text-emerald-500'}">
								<span class="text-neutral-500 font-normal">Net:</span> <span class="font-semibold">{statistics?.moneyIn - statistics?.moneyOut < 0 ? '' : '+'}{(statistics?.moneyIn - statistics?.moneyOut).toFixed(0)} kr</span>
							</p>
							{#if statistics?.previousMoneyIn > 0}
								<p class="text-sm flex items-center gap-1 {incomeChange >= 0 ? 'text-emerald-500' : 'text-red-500'}">
									<span class="text-neutral-500 font-normal">vs prev:</span>
									{#if incomeChange > 0}
										<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd"></path></svg>
									{:else if incomeChange < 0}
										<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
									{/if}
									<span class="font-semibold">{incomeChange > 0 ? '+' : ''}{incomeChange.toFixed(0)}%</span>
								</p>
							{/if}
						</div>
						<div class="border-t border-neutral-800 pt-4">
							<p class="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-4">By category <span class="text-neutral-600">(click to expand)</span></p>
							{#if sortedIn.length > 0}
								<div class="overflow-x-auto pb-2 px-1 custom-scrollbar">
									<div class="flex gap-3">
									{#each sortedIn as category}
										{@const percentage = ((category?.moneyIn / statistics?.moneyIn) * 100)}
										<button
											onclick={() => expandedIncomeCategory = expandedIncomeCategory === category?.hovedkategori ? null : category?.hovedkategori}
											class="w-16 flex-shrink-0 flex flex-col items-center cursor-pointer group"
										>
											<div class="flex flex-col items-center gap-1 h-36 justify-end w-full mb-2">
												<span class="text-xs font-semibold text-neutral-300">{percentage.toFixed(0)}%</span>
												<div
													class="w-full bg-emerald-500 rounded-t transition-all duration-300 min-h-1 group-hover:bg-emerald-400 {expandedIncomeCategory === category?.hovedkategori ? 'ring-2 ring-emerald-300' : ''}"
													style="height: {(category?.moneyIn / maxIn) * 100}%"
												></div>
											</div>
											<div class="text-center hover:bg-neutral-800 rounded p-1 transition-colors w-full {expandedIncomeCategory === category?.hovedkategori ? 'bg-neutral-800' : ''}">
												<p class="text-xs text-neutral-400 truncate" title={category?.hovedkategori}>{category?.hovedkategori}</p>
												<p class="text-xs font-medium text-neutral-500">{category?.moneyIn.toFixed(0)} kr</p>
											</div>
										</button>
									{/each}
									</div>
								</div>
								{#if expandedIncomeCategory}
									{@const expandedCat = sortedIn.find(c => c?.hovedkategori === expandedIncomeCategory)}
									{#if expandedCat && expandedCat.underkategorier?.length > 0}
										<div class="mt-4 pt-4 border-t border-neutral-700">
											<div class="flex items-center justify-between mb-3">
												<p class="text-xs font-medium text-neutral-400">{expandedIncomeCategory} breakdown</p>
												<button onclick={() => expandedIncomeCategory = null} class="text-xs text-neutral-500 hover:text-neutral-300">Close</button>
											</div>
											<div class="space-y-2">
												{#each expandedCat.underkategorier.sort((a, b) => b.moneyIn - a.moneyIn) as subcategory}
													{@const subPercentage = ((subcategory.moneyIn / expandedCat.moneyIn) * 100)}
													<div class="flex items-center gap-3">
														<div class="flex-1">
															<div class="flex justify-between text-xs mb-1">
																<span class="text-neutral-400">{subcategory.underkategori || 'Uncategorized'}</span>
																<span class="text-neutral-500">{subcategory.moneyIn.toFixed(0)} kr</span>
															</div>
															<div class="h-2 bg-neutral-800 rounded-full overflow-hidden">
																<div class="h-full bg-emerald-400 rounded-full transition-all duration-300" style="width: {subPercentage}%"></div>
															</div>
														</div>
														<span class="text-xs font-medium text-neutral-400 w-10 text-right">{subPercentage.toFixed(0)}%</span>
													</div>
												{/each}
											</div>
										</div>
									{/if}
								{/if}
							{:else}
								<div class="flex items-end justify-between gap-3 h-36">
									{#each [60, 45, 30, 20, 10] as height}
										<div class="flex-1 flex flex-col items-center h-full justify-end">
											<div class="w-full bg-neutral-800 rounded-t" style="height: {height}%"></div>
										</div>
									{/each}
								</div>
								<p class="text-neutral-600 text-xs mt-4 italic text-center">No income data</p>
							{/if}
						</div>
					{:else}
						<p class=" text-3xl font-bold text-neutral-600 mb-4">0 <span class="text-base font-medium">kr</span></p>
						<div class="border-t border-neutral-800 pt-4">
							<p class="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-4">By category</p>
							<div class="flex items-end justify-between gap-3 h-36">
								{#each [60, 45, 30, 20, 10] as height}
									<div class="flex-1 flex flex-col items-center h-full justify-end">
										<div class="w-full bg-neutral-800 rounded-t" style="height: {height}%"></div>
									</div>
								{/each}
							</div>
							<p class="text-neutral-600 text-xs mt-4 italic text-center">No data for selected period</p>
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
					<Table {accountStatements} statistics={data.statistics} {accountStatementsCount} defaultDateRange={data.defaultDateRange} />
				{/await}
			{:else}
				<Table accountStatements={[]} statistics={{}} accountStatementsCount={data.accountStatementsCount} defaultDateRange={data.defaultDateRange} />
			{/if}
		{/await}
	</div>
</main>

<style>
	/* Custom scrollbar for category containers */
	:global(.custom-scrollbar) {
		scrollbar-width: thin;
		scrollbar-color: #525252 transparent;
	}

	:global(.custom-scrollbar::-webkit-scrollbar) {
		height: 6px;
	}

	:global(.custom-scrollbar::-webkit-scrollbar-track) {
		background: transparent;
		border-radius: 3px;
	}

	:global(.custom-scrollbar::-webkit-scrollbar-thumb) {
		background: #525252;
		border-radius: 3px;
	}

	:global(.custom-scrollbar::-webkit-scrollbar-thumb:hover) {
		background: #737373;
	}
</style>