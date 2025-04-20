<template>
  <div class="flex flex-col min-h-screen bg-background text-text-primary">
    <!-- Header: Logo (Left) and Buttons (Right) -->
    <header class="w-full p-4 sm:p-6 md:p-8">
      <div class="max-w-7xl mx-auto flex justify-between items-center">
        <!-- Logo Link -->
        <router-link to="/" class="flex-shrink-0 flex items-center">
          <!-- Logo height adjusted for header -->
          <img src="/images/logo.png" alt="UnderNET Logo" class="h-8 w-auto" />
        </router-link>

        <!-- Buttons Group -->
        <div class="flex items-center space-x-4">
          <button
            @click="navigateToSignUp"
            class="px-4 py-2 text-sm font-medium rounded-md text-text-primary bg-secondary hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-150 ease-in-out"
          >
            Sign Up
          </button>
          <button
            @click="navigateToLogin"
            class="px-4 py-2 text-sm font-medium text-white rounded-md bg-primary hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-150 ease-in-out border border-primary hover:border-blue-500"
          >
            Login
          </button>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="flex items-center justify-center px-4 pt-16 pb-8 text-center sm:pt-24 sm:pb-12">
      <div class="max-w-3xl">
        <h1 class="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Welcome to the <span class="text-primary">UnderNET</span> Portal
        </h1>
        <p class="mt-6 text-lg leading-8 text-text-secondary">
          Your central hub for managing services on the UnderNET IRC Network. Connect with one of
          the oldest and largest real-time chat communities, active since 1992.
        </p>
        <div class="mt-10">
          <button
            @click="navigateToLogin"
            class="px-8 py-3 text-base font-medium text-white rounded-md border border-primary bg-primary hover:bg-blue-500 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-all duration-150 ease-in-out shadow hover:shadow-lg"
          >
            Get Started
          </button>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-8 bg-secondary sm:py-12">
      <div class="max-w-4xl px-4 mx-auto sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold tracking-tight text-center text-text-primary sm:text-4xl">
          Portal Features
        </h2>
        <div class="grid grid-cols-1 gap-8 mt-10 text-center md:mt-12 md:grid-cols-3">
          <!-- Feature Card 1 -->
          <div
            class="p-6 transition-shadow duration-200 ease-in-out border rounded-lg shadow-lg bg-background border-slate-700 hover:shadow-indigo-500/10"
          >
            <svg
              class="w-12 h-12 mx-auto text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              ></path>
            </svg>
            <h3 class="mt-4 text-xl font-semibold text-text-primary">Channel Services</h3>
            <p class="mt-2 text-text-secondary">
              Register and manage your IRC channels with X, the official Undernet Channel Service
              bot.
            </p>
          </div>
          <!-- Feature Card 2 -->
          <div
            class="p-6 transition-shadow duration-200 ease-in-out border rounded-lg shadow-lg bg-background border-slate-700 hover:shadow-indigo-500/10"
          >
            <svg
              class="w-12 h-12 mx-auto text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              ></path>
            </svg>
            <h3 class="mt-4 text-xl font-semibold text-text-primary">User Accounts</h3>
            <p class="mt-2 text-text-secondary">
              Manage your UnderNET username, settings, and access levels across the network.
            </p>
          </div>
          <!-- Feature Card 3 -->
          <div
            class="p-6 transition-shadow duration-200 ease-in-out border rounded-lg shadow-lg bg-background border-slate-700 hover:shadow-indigo-500/10"
          >
            <svg
              class="w-12 h-12 mx-auto text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              ></path>
            </svg>
            <h3 class="mt-4 text-xl font-semibold text-text-primary">Global Community</h3>
            <p class="mt-2 text-text-secondary">
              Connect with thousands of users worldwide on one of the most established IRC networks.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer is handled by App.vue -->
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function navigateToLogin(): void {
  router.push({ name: 'login' })
}

function navigateToSignUp(): void {
  // TODO: Implement sign-up navigation when the route exists
  console.warn('Sign Up navigation not yet implemented.')
  // router.push({ name: 'signup' });
}
</script>

<style scoped>
/* Add specific scoped styles if needed */
</style>
