<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<form action="?/login" method="post" class="w-72 mx-auto flex flex-col bg-neutral-900 rounded-md p-5 h-80 fixed top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2" use:enhance>
	<div class="relative z-0 w-full mb-5 group mt-2">
		<input autocomplete="off" type="text" name="username" id="username" class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
		<label for="username" class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Username</label>
	</div>
	<div class="relative z-0 w-full mb-5 group">
		<input autocomplete="off" type="password" name="password" id="password" class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
		<label for="password" class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Password</label>
	</div>
	{#if form?.message}
		<p class=" italic"><span class=" not-italic font-semibold text-red-600">Error:</span> {form?.message ?? ''}</p>
	{/if}
	<div class=" mt-10">
		<button type="submit" class=" bg-blue-700 cursor-pointer py-3 px-2 rounded-md text-sm font-semibold active:scale-95 absolute bottom-5 left-5 hover:bg-blue-800 w-24">Log in</button>
		<button type="submit" formaction="?/register" class=" text-neutral-200 bg-neutral-600 cursor-pointer py-3 px-2 rounded-md text-sm font-semibold active:scale-95 absolute bottom-5 right-5 hover:bg-neutral-700 w-20">Register</button>
	</div>
  </form>
  
