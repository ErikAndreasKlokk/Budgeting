<script lang="ts">
	import type { accountStatementFormat } from "../../routes/dashboard/proxy+page.server";
    import { enhance, applyAction  } from '$app/forms';

    const { accountStatements, statistics }: { accountStatements: accountStatementFormat[], statistics: any} = $props()

    let editStatementModal = $state(false)
	let addCategoryModal = $state(false)
	let addCategoryValue = $state("")
	let isMainCategory = $state(false)
	let confirmDeleteStatementModal = $state(false)

	let selectedStatement: accountStatementFormat | null = $state(null)
	let selectedStatements: accountStatementFormat[] = $state([])

    let accountStatementsEditable = $state(accountStatements)

</script>

<div>
    <!-- ------------------ -->
    <!-- add category modal -->
    <!-- ------------------ -->
    {#if addCategoryModal}
        <div class=" fixed w-screen h-screen top-0 left-0 flex justify-center items-center z-50">
            <button onclick={() => addCategoryModal = false} aria-label="Closes the edit statement modal" class=" fixed h-screen w-screen bg-neutral-900/60 z-30 top-0 left-0 backdrop-blur-xs"></button>
            <form class=" flex flex-col w-80 z-30 bg-neutral-800 h-96 relative rounded-md p-4">
                <div class="flex items-center justify-center w-full flex-col">

                    <div class="relative z-0 w-full mb-5 group mt-2">
                        <label for="text" class="block mb-2 text-sm font-medium text-white">Add {isMainCategory ? "main" : "sub"} category</label>
                        <input type="text" bind:value={addCategoryValue} id="text" name="text" class=" text-sm rounded-lg block w-full p-2.5 bg-neutral-700 border-neutral-600 placeholder-neutral-400 text-white focus:ring-blue-500 focus:border-blue-500">
                    </div>
                </div> 
                <button type="button" onclick={() => {
                    if (isMainCategory && statistics) {
                        statistics.hovedkategorier.push(addCategoryValue)
                    } else {
                        if (statistics) {
                            statistics.underkategorier.push(addCategoryValue)
                        }
                    }

                    addCategoryModal = false
                }} 
                class=" bg-blue-700 cursor-pointer py-3 px-2 rounded-md text-sm font-semibold active:scale-95 absolute bottom-5 left-5  hover:bg-blue-800">Add category</button>
                <button onclick={() => addCategoryModal = false} type="button" class="  bg-neutral-600 cursor-pointer py-3 px-2 rounded-md text-sm font-semibold active:scale-95 absolute bottom-5 right-5 hover:bg-neutral-700 ">Cancel</button>
            </form>
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

                        if (result.data && typeof result.data.formId === "string") {
                            if (typeof JSON.parse(result.data.formId) === "object") {
                                JSON.parse(result.data.formId).map((formStatement: accountStatementFormat) => {
                                    accountStatementsEditable = accountStatementsEditable.filter((statement) => {
                                        if (statement.statementId === formStatement.statementId) {
                                            statement.hovedkategori = result.data?.formHovedkategori ? result.data.formHovedkategori as string : statement.hovedkategori
                                            statement.underkategori = result.data?.underkategori ? result.data?.underkategori as string : statement.underkategori
                                            statement.tekst = result.data?.tekst ? result.data?.tekst as string : statement.tekst
                                        }
                                        return statement;
                                    })
                                    return accountStatementsEditable;
                                })
                            } else {
                                accountStatementsEditable = accountStatementsEditable.filter((statement) => {
                                    if (result.data?.formId && statement.statementId === Number(result.data.formId)) {
                                        statement.hovedkategori = result.data.formHovedkategori as string | null
                                        statement.underkategori = result.data.formUnderkategori as string | null
                                        statement.tekst = result.data.formTekst as string | null
                                    }
                                    return statement;
                                })
                            }
                        }
                        update();
                    }
                }
            }}>
                <div class="flex items-center justify-center w-full flex-col">
                    <div class="relative z-0 w-full mb-5 group mt-2">
                        <label for="text" class="block mb-2 text-sm font-medium text-white">Text</label>
                        <input type="text" id="text" name="text" value={selectedStatement ? selectedStatement?.tekst : null} class=" text-sm rounded-lg block w-full p-2.5 bg-neutral-700 border-neutral-600 placeholder-neutral-400 text-white focus:ring-blue-500 focus:border-blue-500">
                    </div>
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
                                {#if statistics}
                                    {#each statistics.hovedkategorier as hovedkategori}
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
                                {#if statistics}
                                    {#each statistics.underkategorier as underkategori}
                                        <option selected={selectedStatement?.underkategori === underkategori} value={underkategori}>{underkategori}</option>	
                                    {/each}
                                {/if}
                            </select>
                        </div>
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
                        
                        accountStatementsEditable = [...accountStatements.filter((statement) => statement.statementId !== selectedStatement?.statementId)]
                        
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

                        accountStatementsEditable = [...accountStatements.filter((dataStatement) => {
                            return selectedStatements.filter((selectedStatementFilter) => dataStatement.statementId === selectedStatementFilter.statementId).length === 0
                        })]
                    }

                    selectedStatement = null
                    selectedStatements = []
                    confirmDeleteStatementModal = false
                }}

                class=" bg-blue-700 cursor-pointer py-3 px-2 rounded-md text-sm font-semibold active:scale-95 absolute bottom-5 left-5  hover:bg-blue-800">Confirm delete</button>
                <button onclick={() => [confirmDeleteStatementModal = false, selectedStatement = null]} type="button" class="  bg-neutral-600 cursor-pointer py-3 px-2 rounded-md text-sm font-semibold active:scale-95 absolute bottom-5 right-5 hover:bg-neutral-700 ">Cancel</button>
            </form>
        </div>
    {/if}
    <!-- ------------ -->
    <!-- Table filter -->
    <!-- ------------ -->
    <div class=" mb-5">
        <div class=" flex w-full justify-between items-center">
            <div class="relative z-0 w-80 mb-5 group mt-2">
                <label for="text" class="block mb-2 text-sm font-medium text-white">Search</label>
                <input type="text" id="text" name="text" class=" text-sm rounded-lg block w-full p-2.5 bg-neutral-700 border-neutral-600 placeholder-neutral-400 text-white focus:ring-blue-500 focus:border-blue-500">
            </div>
            <!-- <div class=" flex gap-3">
                <button class=" bg-neutral-700 cursor-pointer py-2.5 px-5 rounded-md text-sm font-semibold active:scale-95 flex gap-2 items-center hover:bg-neutral-600 border border-neutral-600">Date</button>
                <button class=" bg-neutral-700 cursor-pointer py-2.5 px-5 rounded-md text-sm font-semibold active:scale-95 flex gap-2 items-center hover:bg-neutral-600 border border-neutral-600">Amount</button>
            </div> -->
        </div>
        <div class=" flex w-full justify-between items-center">
            <p class=" text-xs text-neutral-400">Showing <span class=" font-bold text-neutral-200">{accountStatementsEditable.length}</span> account statements of <span class=" font-bold text-neutral-200">{accountStatements.length}</span></p>
            <!-- <div class=" flex gap-2">
                <div class=" text-xs p-1 text-neutral-400 border border-neutral-600 font-medium  rounded-sm">Mar 18 2025 - Feb 17 2025 x</div>
                <div class=" text-xs p-1 text-neutral-400 border border-neutral-600 font-medium  rounded-sm">0kr - 10000kr x</div>
            </div> -->
        </div>
    </div>
    <!-- --------------------------- -->
    <!-- Table of account statements -->
    <!-- --------------------------- -->
    <div class=" rounded-xl bg-neutral-900 overflow-x-auto ">
        <table class="w-full text-sm text-left rounded-4xl">
            <thead class="text-xs uppercase bg-neutral-950  text-nowrap">
                <tr>
                    <th scope="col" class="px-6 py-5">
                        <input onchange={() => {if (accountStatementsEditable.length === selectedStatements.length) {selectedStatements = []} else {selectedStatements = accountStatementsEditable}}} checked={accountStatementsEditable.length === selectedStatements.length} type="checkbox" name="checkbox" id="checkbox"  class=" cursor-pointer w-4 h-4 text-blue-600 bg-neutral-700 border-neutral-600 rounded-sm focus:ring-0"/>
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
                {#each accountStatementsEditable as statement}
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
            </tbody>
        </table>
        <div>

        </div>
    </div>
</div>
