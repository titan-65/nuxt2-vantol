<script setup lang="ts">
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

defineProps<{
  post: any
}>()

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<template>
  <Card class="flex flex-col h-full hover:shadow-lg transition-shadow">
    <div class="relative w-full aspect-video overflow-hidden rounded-t-lg">
      <img
        :src="post.img"
        :alt="post.title"
        class="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
      />
      <div class="absolute top-2 right-2">
        <Badge variant="secondary" class="bg-background/80 backdrop-blur-sm">
          {{ post.tag }}
        </Badge>
      </div>
    </div>
    <CardHeader>
      <div class="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
        <span>{{ formatDate(post.date || post.createdAt) }}</span>
        <span>•</span>
        <span>{{ post.readTime || 5 }} min read</span>
      </div>
      <CardTitle class="line-clamp-2 hover:text-primary transition-colors">
        <NuxtLink :to="{ name: 'blog-slug', params: { slug: post.slug } }">
          {{ post.title }}
        </NuxtLink>
      </CardTitle>
      <CardDescription class="line-clamp-3">
        {{ post.description }}
      </CardDescription>
    </CardHeader>
    <CardContent class="flex-grow">
      <!-- Optional extra content -->
    </CardContent>
    <CardFooter class="flex items-center justify-between border-t pt-4">
      <div class="flex items-center space-x-2">
        <Avatar class="h-8 w-8">
          <AvatarImage :src="post.author?.img" :alt="post.author?.name" />
          <AvatarFallback>{{ post.author?.name?.charAt(0) || 'A' }}</AvatarFallback>
        </Avatar>
        <span class="text-sm font-medium">{{ post.author?.name }}</span>
      </div>
      <Button variant="ghost" size="sm" as-child>
        <NuxtLink :to="{ name: 'blog-slug', params: { slug: post.slug } }">
          Read More
        </NuxtLink>
      </Button>
    </CardFooter>
  </Card>
</template>
