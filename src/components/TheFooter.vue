<template>
  <footer class="bg-gray-800 text-gray-400 border-t border-gray-700">
    <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
        <!-- About Section -->
        <div>
          <h3 class="text-sm font-semibold text-gray-300 tracking-wider uppercase">About</h3>
          <ul role="list" class="mt-4 space-y-4">
            <li>
              <a href="#" class="text-base hover:text-gray-200">About UnderNET</a>
            </li>
            <li>
              <a href="#" class="text-base hover:text-gray-200">Portal Features</a>
            </li>
            <li>
              <a href="#" class="text-base hover:text-gray-200">Team (Placeholder)</a>
            </li>
          </ul>
        </div>

        <!-- Resources Section -->
        <div>
          <h3 class="text-sm font-semibold text-gray-300 tracking-wider uppercase">Resources</h3>
          <ul role="list" class="mt-4 space-y-4">
            <li>
              <a
                href="https://www.undernet.org/docs"
                target="_blank"
                rel="noopener noreferrer"
                class="text-base hover:text-gray-200"
                >UnderNET Docs</a
              >
            </li>
            <li>
              <a
                href="https://www.undernet.org/help"
                target="_blank"
                rel="noopener noreferrer"
                class="text-base hover:text-gray-200"
                >Help / FAQ</a
              >
            </li>
            <li>
              <a href="#" class="text-base hover:text-gray-200">Developer API (Soon)</a>
            </li>
          </ul>
        </div>

        <!-- Legal Section -->
        <div>
          <h3 class="text-sm font-semibold text-gray-300 tracking-wider uppercase">Legal</h3>
          <ul role="list" class="mt-4 space-y-4">
            <li>
              <a href="#" class="text-base hover:text-gray-200">Terms of Service</a>
            </li>
            <li>
              <a
                href="https://www.undernet.org/docs/acceptable-use-policy"
                target="_blank"
                rel="noopener noreferrer"
                class="text-base hover:text-gray-200"
                >Acceptable Use Policy</a
              >
            </li>
            <li>
              <a href="#" class="text-base hover:text-gray-200">Privacy Policy</a>
            </li>
          </ul>
        </div>

        <!-- Contact Section -->
        <div>
          <h3 class="text-sm font-semibold text-gray-300 tracking-wider uppercase">Contact</h3>
          <ul role="list" class="mt-4 space-y-4">
            <li>
              <a href="#" class="text-base hover:text-gray-200">Contact Support</a>
            </li>
            <li>
              <a href="#" class="text-base hover:text-gray-200">Report Abuse</a>
            </li>
            <li>
              <a href="#" class="text-base hover:text-gray-200">Security</a>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="mt-8 border-t border-gray-700 pt-8 text-center">
        <p class="text-base">
          &copy; {{ new Date().getFullYear() }} UnderNET. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
// No script logic needed for this simple footer yet
</script>

<style scoped>
/* Add specific scoped styles if needed */
</style>
