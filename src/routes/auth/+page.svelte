<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	let isLogin = $state(true);
	let password = $state('');
	let confirmPassword = $state('');

	// Client-side password match check
	function passwordsMatch(): boolean {
		return password === confirmPassword;
	}
</script>

<div class="min-h-screen w-full flex items-center justify-center bg-neutral-900 px-4">
	<div class="w-full max-w-md">
		<!-- Logo and title -->
		<div class="text-center mb-8">
			<a href="/" class="inline-block mb-4">
				<img class="h-12 mx-auto" src="/2.png" alt="Logo">
			</a>
			<h1 class="text-2xl font-bold text-white">
				{isLogin ? 'Welcome back' : 'Create an account'}
			</h1>
			<p class="text-neutral-400 mt-2">
				{isLogin ? 'Sign in to access your dashboard' : 'Get started with your financial journey'}
			</p>
		</div>

		<!-- Auth card -->
		<div class="bg-neutral-800 rounded-xl border border-neutral-700 p-8">
			<!-- Tab switcher -->
			<div class="flex mb-6 bg-neutral-900 rounded-lg p-1">
				<button
					type="button"
					onclick={() => isLogin = true}
					class="flex-1 py-2.5 text-sm font-medium rounded-md transition-colors cursor-pointer {isLogin ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-neutral-200'}"
				>
					Sign In
				</button>
				<button
					type="button"
					onclick={() => isLogin = false}
					class="flex-1 py-2.5 text-sm font-medium rounded-md transition-colors cursor-pointer {!isLogin ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-neutral-200'}"
				>
					Register
				</button>
			</div>

			<!-- Error message -->
			{#if form?.message}
				<div class="mb-6 p-3 rounded-lg bg-red-900/30 border border-red-800 text-red-300 text-sm flex items-center gap-2">
					<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
					</svg>
					{form.message}
				</div>
			{/if}

			<!-- Login Form -->
			{#if isLogin}
				<form action="?/login" method="post" class="space-y-5" use:enhance>
					<div>
						<label for="login-username" class="block text-sm font-medium text-neutral-300 mb-2">Username</label>
						<input
							type="text"
							name="username"
							id="login-username"
							autocomplete="username"
							required
							class="w-full px-4 py-3 rounded-lg bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
							placeholder="Enter your username"
						/>
					</div>
					<div>
						<label for="login-password" class="block text-sm font-medium text-neutral-300 mb-2">Password</label>
						<input
							type="password"
							name="password"
							id="login-password"
							autocomplete="current-password"
							required
							class="w-full px-4 py-3 rounded-lg bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
							placeholder="Enter your password"
						/>
					</div>
					<button
						type="submit"
						class="w-full py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors cursor-pointer"
					>
						Sign In
					</button>
				</form>
			{:else}
				<!-- Register Form -->
				<form action="?/register" method="post" class="space-y-5" use:enhance>
					<div>
						<label for="register-username" class="block text-sm font-medium text-neutral-300 mb-2">Username</label>
						<input
							type="text"
							name="username"
							id="register-username"
							autocomplete="username"
							required
							class="w-full px-4 py-3 rounded-lg bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
							placeholder="Choose a username"
						/>
						<p class="mt-1.5 text-xs text-neutral-500">3-31 characters, letters, numbers, _ and - only</p>
					</div>
					<div>
						<label for="register-password" class="block text-sm font-medium text-neutral-300 mb-2">Password</label>
						<input
							type="password"
							name="password"
							id="register-password"
							autocomplete="new-password"
							required
							bind:value={password}
							class="w-full px-4 py-3 rounded-lg bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
							placeholder="Create a password"
						/>
						<p class="mt-1.5 text-xs text-neutral-500">Minimum 4 characters</p>
					</div>
					<div>
						<label for="register-confirm-password" class="block text-sm font-medium text-neutral-300 mb-2">Confirm Password</label>
						<input
							type="password"
							name="confirmPassword"
							id="register-confirm-password"
							autocomplete="new-password"
							required
							bind:value={confirmPassword}
							class="w-full px-4 py-3 rounded-lg bg-neutral-900 border transition-colors {confirmPassword && !passwordsMatch() ? 'border-red-500 focus:ring-red-500' : 'border-neutral-700 focus:ring-blue-500'} text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:border-transparent"
							placeholder="Confirm your password"
						/>
						{#if confirmPassword && !passwordsMatch()}
							<p class="mt-1.5 text-xs text-red-400 flex items-center gap-1">
								<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
								</svg>
								Passwords do not match
							</p>
						{:else if confirmPassword && passwordsMatch()}
							<p class="mt-1.5 text-xs text-emerald-400 flex items-center gap-1">
								<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
								</svg>
								Passwords match
							</p>
						{/if}
					</div>
					<button
						type="submit"
						disabled={!passwordsMatch() && confirmPassword !== ''}
						class="w-full py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Create Account
					</button>
				</form>
			{/if}

			<!-- Footer text -->
			<p class="mt-6 text-center text-sm text-neutral-500">
				{#if isLogin}
					Don't have an account?
					<button type="button" onclick={() => isLogin = false} class="text-blue-400 hover:text-blue-300 font-medium cursor-pointer">Register</button>
				{:else}
					Already have an account?
					<button type="button" onclick={() => isLogin = true} class="text-blue-400 hover:text-blue-300 font-medium cursor-pointer">Sign in</button>
				{/if}
			</p>
		</div>

		<!-- Back to home -->
		<p class="mt-6 text-center">
			<a href="/" class="text-sm text-neutral-500 hover:text-neutral-300 transition-colors flex items-center justify-center gap-2">
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
				</svg>
				Back to home
			</a>
		</p>
	</div>
</div>
