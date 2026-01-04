<script setup lang="ts">
import { Mail, Twitter, Github, Linkedin } from 'lucide-vue-next'

useSeoMeta({
  title: 'Contact - VantolBennett',
  description: 'Get in touch with Vantol R. Bennett',
})

const socials = [
  {
    name: 'Email',
    icon: Mail,
    href: 'mailto:vantolbennett@gmail.com',
    label: 'vantolbennett@gmail.com',
    description: 'Send me an email'
  },
  {
    name: 'Twitter',
    icon: Twitter,
    href: 'https://twitter.com/vantolbennett',
    label: '@vantolbennett',
    description: 'Follow me on Twitter'
  },
  {
    name: 'GitHub',
    icon: Github,
    href: 'https://github.com/titan-65',
    label: 'titan-65',
    description: 'Check out my projects'
  },
  {
    name: 'LinkedIn',
    icon: Linkedin,
    href: 'https://linkedin.com/in/vantolbennett',
    label: 'vantolbennett',
    description: 'Connect on LinkedIn'
  }
]

const formData = ref({
  name: '',
  email: '',
  subject: '',
  message: ''
})

const handleSubmit = () => {
  // Form submission logic can be added here
  console.log('Form submitted:', formData.value)
}
</script>

<template>
  <div class="min-h-screen bg-[#F3F3F3] font-sans">
    <!-- Hero Section -->
    <section class="py-20 border-b border-black/10">
      <div class="container mx-auto px-6">
        <div class="max-w-3xl">
          <div class="flex items-center gap-2 mb-4">
            <span class="w-2 h-2 bg-[#FF4F4F] rounded-full"></span>
            <span class="text-xs font-medium tracking-widest text-gray-500 uppercase">GET IN TOUCH</span>
          </div>
          
          <h1 class="text-5xl md:text-6xl font-medium tracking-tight mb-8">
            Contact Me
          </h1>
          
          <p class="text-xl text-gray-600 font-light leading-relaxed border-l-2 border-black/10 pl-6">
            Have a question or want to work together? Feel free to reach out!
          </p>
        </div>
      </div>
    </section>

    <!-- Contact Form & Social Links Section -->
    <section class="py-16 md:py-24 bg-white">
      <div class="container mx-auto px-6">
        <div class="grid gap-12 lg:grid-cols-2">
          <!-- Contact Form -->
          <div>
            <div class="mb-8">
              <h2 class="text-2xl font-bold uppercase tracking-wide mb-2">Send a Message</h2>
              <p class="text-gray-500 font-light">Fill out the form below and I'll get back to you.</p>
            </div>
            
            <form @submit.prevent="handleSubmit" class="space-y-6 border border-black/20 p-8 bg-[#FAFAFA]">
              <div class="space-y-2">
                <label for="name" class="text-xs font-bold uppercase tracking-widest">Name</label>
                <input
                  id="name"
                  v-model="formData.name"
                  placeholder="YOUR NAME"
                  required
                  class="w-full bg-white border border-black/20 px-4 py-3 text-sm font-mono focus:outline-none focus:border-black transition-colors"
                />
              </div>
              
              <div class="space-y-2">
                <label for="email" class="text-xs font-bold uppercase tracking-widest">Email</label>
                <input
                  id="email"
                  v-model="formData.email"
                  type="email"
                  placeholder="YOUR.EMAIL@EXAMPLE.COM"
                  required
                  class="w-full bg-white border border-black/20 px-4 py-3 text-sm font-mono focus:outline-none focus:border-black transition-colors"
                />
              </div>
              
              <div class="space-y-2">
                <label for="subject" class="text-xs font-bold uppercase tracking-widest">Subject</label>
                <input
                  id="subject"
                  v-model="formData.subject"
                  placeholder="WHAT'S THIS ABOUT?"
                  required
                  class="w-full bg-white border border-black/20 px-4 py-3 text-sm font-mono focus:outline-none focus:border-black transition-colors"
                />
              </div>
              
              <div class="space-y-2">
                <label for="message" class="text-xs font-bold uppercase tracking-widest">Message</label>
                <textarea
                  id="message"
                  v-model="formData.message"
                  placeholder="YOUR MESSAGE..."
                  rows="6"
                  required
                  class="w-full bg-white border border-black/20 px-4 py-3 text-sm font-mono focus:outline-none focus:border-black transition-colors resize-none"
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                class="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>

          <!-- Social Links -->
          <div class="space-y-8">
            <div>
              <h2 class="text-2xl font-bold uppercase tracking-wide mb-2">Connect With Me</h2>
              <p class="text-gray-500 font-light">Prefer social media? You can find me on these platforms.</p>
            </div>
            
            <div class="grid gap-4">
              <a
                v-for="social in socials"
                :key="social.name"
                :href="social.href"
                target="_blank"
                rel="noopener noreferrer"
                class="group flex items-center gap-6 p-6 border border-black/20 bg-white hover:border-black transition-all"
              >
                <div class="p-3 bg-gray-100 group-hover:bg-black group-hover:text-white transition-colors">
                  <component :is="social.icon" class="h-6 w-6" />
                </div>
                <div>
                  <h3 class="font-bold uppercase tracking-wider mb-1">{{ social.name }}</h3>
                  <p class="text-sm text-gray-500 font-mono mb-1">{{ social.description }}</p>
                  <p class="text-xs font-bold text-black group-hover:underline">{{ social.label }}</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
