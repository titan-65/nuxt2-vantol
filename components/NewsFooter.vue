<template>
  <footer class="text-gray-600 body-font">
    <div class="container px-5 py-24 mx-auto">
      <div class="container px-5 py-6 mx-auto flex items-center sm:flex-row flex-col">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512" class="h-4 mr-4 md:h-8 lg:mr-0 text-white"><path d="M248 8C111.1 8 0 119.1 0 256s111.1 248 248 248 248-111.1 248-248S384.9 8 248 8zm100.7 364.9c-4.2 0-6.8-1.3-10.7-3.6-62.4-37.6-135-39.2-206.7-24.5-3.9 1-9 2.6-11.9 2.6-9.7 0-15.8-7.7-15.8-15.8 0-10.3 6.1-15.2 13.6-16.8 81.9-18.1 165.6-16.5 237 26.2 6.1 3.9 9.7 7.4 9.7 16.5s-7.1 15.4-15.2 15.4zm26.9-65.6c-5.2 0-8.7-2.3-12.3-4.2-62.5-37-155.7-51.9-238.6-29.4-4.8 1.3-7.4 2.6-11.9 2.6-10.7 0-19.4-8.7-19.4-19.4s5.2-17.8 15.5-20.7c27.8-7.8 56.2-13.6 97.8-13.6 64.9 0 127.6 16.1 177 45.5 8.1 4.8 11.3 11 11.3 19.7-.1 10.8-8.5 19.5-19.4 19.5zm31-76.2c-5.2 0-8.4-1.3-12.9-3.9-71.2-42.5-198.5-52.7-280.9-29.7-3.6 1-8.1 2.6-12.9 2.6-13.2 0-23.3-10.3-23.3-23.6 0-13.6 8.4-21.3 17.4-23.9 35.2-10.3 74.6-15.2 117.5-15.2 73 0 149.5 15.2 205.4 47.8 7.8 4.5 12.9 10.7 12.9 22.6 0 13.6-11 23.3-23.2 23.3z"/></svg>
        <span class="ml-3 text-xl"> - Now Playing</span>
      </div>
      <div class="flex flex-wrap md:text-left text-center order-first">
        <div class="lg:w-1/4 md:w-1/2 w-full px-4">
          <h2 class="title-font font-medium text-gray-900 tracking-widest text-sm mb-3">Chill Spot</h2>
          <nav class="list-none mb-10">
            <li>
              <NuxtLink to="/" class="text-gray-600 hover:text-gray-800">Home</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/blog" class="text-gray-600 hover:text-gray-800">Blogs</NuxtLink>
            </li>
            <li>
              <a class="text-gray-600 hover:text-gray-800 disabled">Dashboard</a>
            </li>
          </nav>
        </div>
        <div class="lg:w-1/4 md:w-1/2 w-full px-4">
          <h2 class="title-font font-medium text-gray-900 tracking-widest text-sm mb-3">Pan Di Gram</h2>
          <nav class="list-none mb-10">
            <li>
              <a href="https://twitter.com/vantolbennett" class="text-gray-600 hover:text-gray-800">Twitter</a>
            </li>
            <li>
              <a href="https://github.com/titan-65" class="text-gray-600 hover:text-gray-800">Github</a>
            </li>
            <li>
              <a href="https://www.youtube.com/user/teckcare2011" class="text-gray-600 hover:text-gray-800">Youtube</a>
            </li>

          </nav>
        </div>
        <!-- <div class="lg:w-1/4 md:w-1/2 w-full px-4">
          <h2 class="title-font font-medium text-gray-900 tracking-widest text-sm mb-3">CATEGORIES</h2>
          <nav class="list-none mb-10">
            <li>
              <a class="text-gray-600 hover:text-gray-800">First Link</a>
            </li>
            <li>
              <a class="text-gray-600 hover:text-gray-800">Second Link</a>
            </li>
            <li>
              <a class="text-gray-600 hover:text-gray-800">Third Link</a>
            </li>
            <li>
              <a class="text-gray-600 hover:text-gray-800">Fourth Link</a>
            </li>
          </nav>
        </div> -->
        <div class="lg:w-1/4 md:w-1/2 w-full px-4">
          <h2 class="title-font font-medium text-gray-900 tracking-widest text-sm mb-3">SUBSCRIBE</h2>
          <div class="flex xl:flex-nowrap md:flex-nowrap lg:flex-wrap flex-wrap justify-center items-end md:justify-start">
            <div class="relative w-40 sm:w-auto xl:mr-4 lg:mr-0 sm:mr-4 mr-2">
              <label for="footer-field" class="leading-7 text-sm text-gray-600">Give me a bligh</label>
              <input type="text" id="footer-field" name="footer-field" class="w-full bg-gray-100 bg-opacity-50 rounded border
              border-gray-300 focus:bg-transparent focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500
              text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" placeholder="Coming Soon">
            </div>
            <button class="lg:mt-2 xl:mt-0 flex-shrink-0 inline-flex text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded">Click Me!</button>
          </div>
          <p class="text-gray-500 text-sm mt-2 md:text-left text-center">Not every Jamaican is sitting on the beach
            <br class="lg:block hidden">drinking mango juice
          </p>
        </div>
      </div>
    </div>
    <div class="bg-gray-100">
      <div class="container px-5 py-6 mx-auto flex items-center sm:flex-row flex-col">
        <a class="flex title-font font-medium items-center md:justify-start justify-center text-gray-900">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" class="h-8 mr-4 md:h-9 lg:mr-0 text-white">

        <path d="M576 64H64C28.654 64 0 92.654 0 128V384C0 419.346 28.654 448 64 448H208.68C237.006 448 262.699 431.391 274.33 405.562L288.781 373.469C294.688 360.344 306.781 352 320 352S345.312 360.344 351.219 373.469L365.672 405.562C377.301 431.391 402.996 448 431.322 448H576C611.346 448 640 419.346 640 384V128C640 92.654 611.346 64 576 64ZM592 384C592 392.822 584.822 400 576 400H431.322C421.898 400 413.309 394.447 409.438 385.854L394.992 353.771C381.387 323.537 351.949 304 320 304S258.615 323.537 245.014 353.762L230.562 385.854C226.693 394.447 218.104 400 208.68 400H64C55.178 400 48 392.822 48 384V128C48 119.178 55.178 112 64 112H576C584.822 112 592 119.178 592 128V384ZM176 176C140.625 176 112 204.625 112 240S140.625 304 176 304S240 275.375 240 240S211.375 176 176 176ZM464 176C428.625 176 400 204.625 400 240S428.625 304 464 304S528 275.375 528 240S499.375 176 464 176Z"
        />
      </svg>
          <span class="ml-3 text-xl">VantolBennett</span>
        </a>
        <!-- Mad Respect to https://twitter.com/knyttneve for this tailwind block -->
        <p class="text-sm text-gray-500 sm:ml-6 sm:mt-0 mt-4">© 2022
        </p>
        <span class="inline-flex sm:ml-auto sm:mt-0 mt-4 justify-center sm:justify-start">
          <a href="https://www.facebook.com/VantolBennett" class="text-gray-500">
            <svg fill="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="w-5 h-5" viewBox="0 0 24 24">
              <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path>
            </svg>
          </a>
          <a href="https://twitter.com/vantolbennett" class="ml-3 text-gray-500">
            <svg fill="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="w-5 h-5" viewBox="0 0 24 24">
              <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path>
            </svg>
          </a>
          <a href="https://instagram.com/vantolbennett" class="ml-3 text-gray-500">
            <svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="w-5 h-5" viewBox="0 0 24 24">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01"></path>
            </svg>
          </a>
          <a href="https://www.linkedin.com/in/vantol-bennett-288730103/" class="ml-3 text-gray-500">
            <svg fill="currentColor" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="0" class="w-5 h-5" viewBox="0 0 24 24">
              <path stroke="none" d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"></path>
              <circle cx="4" cy="4" r="2" stroke="none"></circle>
            </svg>
          </a>
        </span>
      </div>
    </div>
  </footer>
</template>
