<template>
  <!-- header block -->
  <header
    class="flex justify-between max-w-screen-xl px-6 py-4 mx-auto lg:px-8 xl:px-4 lg:py-6"
  >
    <NuxtLink :to="{ name: 'index' }">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" class="h-8 mr-4 md:h-9 lg:mr-0 text-white">
        <!-- Font Awesome Pro 6.0.0-alpha2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) -->
        <path d="M576 64H64C28.654 64 0 92.654 0 128V384C0 419.346 28.654 448 64 448H208.68C237.006 448 262.699 431.391 274.33 405.562L288.781 373.469C294.688 360.344 306.781 352 320 352S345.312 360.344 351.219 373.469L365.672 405.562C377.301 431.391 402.996 448 431.322 448H576C611.346 448 640 419.346 640 384V128C640 92.654 611.346 64 576 64ZM592 384C592 392.822 584.822 400 576 400H431.322C421.898 400 413.309 394.447 409.438 385.854L394.992 353.771C381.387 323.537 351.949 304 320 304S258.615 323.537 245.014 353.762L230.562 385.854C226.693 394.447 218.104 400 208.68 400H64C55.178 400 48 392.822 48 384V128C48 119.178 55.178 112 64 112H576C584.822 112 592 119.178 592 128V384ZM176 176C140.625 176 112 204.625 112 240S140.625 304 176 304S240 275.375 240 240S211.375 176 176 176ZM464 176C428.625 176 400 204.625 400 240S428.625 304 464 304S528 275.375 528 240S499.375 176 464 176Z"
        />
      </svg>
      VantolBennett
    </NuxtLink>
    <nav class="flex items-center space-x-4">
      <NuxtLink to="/blog" class="text-gray-500 hover:text-gray-700">
        Blog</NuxtLink
      >
      <!-- <a href="#" class="flex items-center space-x-1 hover:text-gray-500">
        <svg
          class="hidden w-5 h-5 sm:inline"
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
        <span>Sign in</span>
      </a>
      <a
        href="#"
        class="inline-block px-5 py-2 font-semibold text-white rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-700"
        >Sign up</a
      > -->
    </nav>
  </header>
  <!--/ header block -->
</template>

<script></script>

<style></style>
