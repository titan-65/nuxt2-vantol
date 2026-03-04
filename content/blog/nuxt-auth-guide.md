---
title: "Complete Guide to Authentication in Nuxt 4: From Basics to Production"
description: "A comprehensive guide to implementing authentication in Nuxt 4. Learn about session management, JWT, OAuth, and securing your API routes with type-safe authentication."
date: 2026-03-03
tag: "Technology"
img: "https://images.unsplash.com/photo-1555949963-aa79dcee981c"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
readTime: 15
keywords: [nuxt, authentication, auth, jwt, session, security, nuxt auth]
language: "TypeScript"
rating: 5
---

# Introduction

Every production application needs authentication. Yet it's one of the most commonly botched parts of web development—poorly implemented auth leads to security vulnerabilities, frustrated users, and late-night debugging sessions.

In this comprehensive guide, we'll cover everything you need to know about authentication in **Nuxt 4**:

- Authentication strategies and when to use each
- Implementing session-based auth
- JWT authentication flow
- OAuth with GitHub and Google
- Protecting API routes
- Secure password handling
- Type-safe auth with TypeScript

Let's build a complete auth system for our BrewStop application.

<!--more-->

# Main Content

## Understanding Authentication Strategies

Before we write code, let's understand the three main authentication strategies:

| Strategy | Best For | Pros | Cons |
|----------|----------|------|------|
| **Session** | Traditional web apps | Simple, familiar UX | CSRF concerns, server state |
| **JWT** | SPAs, APIs, mobile | Stateless, scalable | Token management complexity |
| **OAuth** | Social login | Frictionless, trusted | Third-party dependency |

::BlogAlert{type="info"}
For most Nuxt applications, a hybrid approach works best: JWT for API authentication, OAuth for social login, and session-like behavior via cookies.
::

---

## Step 1: Project Setup

Let's create a fresh Nuxt project with authentication in mind.

```bash [terminal]
npx nuxi@latest init brewstop-auth
cd brewstop-auth
npm install
```

We'll need some additional packages:

```bash [terminal]
npm install @sidebase/nuxt-auth next-auth@beta jose
npm install -D @types/node
```

::Callout{icon="🔐" title="Security First"}
We're using `@sidebase/nuxt-auth` which provides first-class support for NextAuth.js in Nuxt, and `jose` for JWT operations.
::

---

## Step 2: Configure Nuxt Auth

Add the auth module to your Nuxt configuration.

Create `nuxt.config.ts`:

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ["@sidebase/nuxt-auth"],
  
  auth: {
    provider: {
      type: "authjs",
      defaultProvider: "credentials",
    },
    globalAppMiddleware: true,
  },
  
  runtimeConfig: {
    authSecret: process.env.AUTH_SECRET,
    public: {
      authOrigin: process.env.AUTH_ORIGIN || "http://localhost:3000",
    },
  },
});
```

::BlogAlert{type="warning"}
Never commit your `AUTH_SECRET`. Use environment variables for all secrets.
::

Create a `.env` file:

```bash [.env]
AUTH_SECRET=your-super-secret-key-change-in-production
AUTH_ORIGIN=http://localhost:3000
```

---

## Step 3: Create the Authentication Backend

We'll build a credentials-based auth system with proper password hashing.

Create `server/utils/auth.ts`:

```ts [server/utils/auth.ts]
import { SignJWT, jwtVerify } from "jose";
import { hash, verify } from "@node-rs/argon2";

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "fallback-secret"
);

export async function hashPassword(password: string): Promise<string> {
  return hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  return verify(hash, password);
}

export async function createToken(userId: string, email: string): Promise<string> {
  return new SignJWT({ userId, email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken(token: string): Promise<{ userId: string; email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as { userId: string; email: string };
  } catch {
    return null;
  }
}
```

::Callout{icon="🔑" title="Password Security"}
We're using Argon2id—the winner of the Password Hashing Competition. It's memory-hard and resistant to GPU attacks.
::

---

## Step 4: Create Users Database

For simplicity, we'll use a file-based approach (replace with Drizzle/Prisma in production).

Create `server/utils/db.ts`:

```ts [server/utils/db.ts]
import { db } from "./db";
import { users } from "./schema";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword } from "./auth";

interface CreateUserInput {
  email: string;
  password: string;
  name: string;
}

export async function createUser(input: CreateUserInput) {
  const hashedPassword = await hashPassword(input.password);
  
  await db.insert(users).values({
    id: crypto.randomUUID(),
    email: input.email,
    password: hashedPassword,
    name: input.name,
  });
}

export async function findUserByEmail(email: string) {
  return db.select().from(users).where(eq(users.email, email)).get();
}

export async function validateUserCredentials(email: string, password: string) {
  const user = await findUserByEmail(email);
  
  if (!user) {
    return null;
  }
  
  const isValid = await verifyPassword(user.password, password);
  
  if (!isValid) {
    return null;
  }
  
  return { id: user.id, email: user.email, name: user.name };
}
```

Create the users schema in `server/db/schema.ts`:

```ts [server/db/schema.ts]
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export type User = typeof users.$inferSelect;
```

---

## Step 5: Create Authentication API Routes

### Register

Create `server/api/auth/register.post.ts`:

```ts [server/api/auth/register.post.ts]
import { createUser, findUserByEmail } from "../../utils/db";
import { createToken } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  
  // Validate input
  if (!body.email || !body.password || !body.name) {
    throw createError({
      statusCode: 400,
      statusMessage: "Email, password, and name are required",
    });
  }
  
  // Check if user exists
  const existing = await findUserByEmail(body.email);
  
  if (existing) {
    throw createError({
      statusCode: 400,
      statusMessage: "User already exists",
    });
  }
  
  // Create user
  await createUser({
    email: body.email,
    password: body.password,
    name: body.name,
  });
  
  // Generate token
  const token = await createToken(body.email, body.email);
  
  setCookie(event, "auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  
  return { success: true, email: body.email };
});
```

### Login

Create `server/api/auth/login.post.ts`:

```ts [server/api/auth/login.post.ts]
import { validateUserCredentials } from "../../utils/db";
import { createToken } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  
  if (!body.email || !body.password) {
    throw createError({
      statusCode: 400,
      statusMessage: "Email and password are required",
    });
  }
  
  const user = await validateUserCredentials(body.email, body.password);
  
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid credentials",
    });
  }
  
  const token = await createToken(user.id, user.email);
  
  setCookie(event, "auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  
  return { success: true, user: { email: user.email, name: user.name } };
});
```

### Logout

Create `server/api/auth/logout.post.ts`:

```ts [server/api/auth/logout.post.ts]
export default defineEventHandler(async (event) => {
  deleteCookie(event, "auth_token");
  return { success: true };
});
```

### Get Current User

Create `server/api/auth/me.get.ts`:

```ts [server/api/auth/me.get.ts]
import { verifyToken } from "../../utils/auth";
import { findUserByEmail } from "../../utils/db";

export default defineEventHandler(async (event) => {
  const token = getCookie(event, "auth_token");
  
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: "Not authenticated",
    });
  }
  
  const payload = await verifyToken(token);
  
  if (!payload) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid token",
    });
  }
  
  const user = await findUserByEmail(payload.email);
  
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "User not found",
    });
  }
  
  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
});
```

---

## Step 6: Protect API Routes

Now let's protect our order management endpoints so only authenticated users can access them.

Update `server/api/orders.get.ts`:

```ts [server/api/orders.get.ts]
import { db } from "../db";
import { orders, orderItems } from "../db/schema";
import { verifyToken } from "../utils/auth";

export default defineEventHandler(async (event) => {
  // Authentication check
  const token = getCookie(event, "auth_token");
  
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: "Authentication required",
    });
  }
  
  const payload = await verifyToken(token);
  
  if (!payload) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid token",
    });
  }
  
  const allOrders = await db
    .select()
    .from(orders)
    .orderBy(orders.createdAt);
  
  const ordersWithItems = await Promise.all(
    allOrders.map(async (order) => {
      const items = await db
        .select()
        .from(orderItems)
        .where(orderItems.orderId.equals(order.id));
      return { ...order, items };
    })
  );
  
  return { orders: ordersWithItems };
});
```

::Callout{icon="🛠️" title="Middleware Pattern"}
You can extract this auth check into a reusable middleware function to protect multiple routes without repetition.
::

---

## Step 7: Add OAuth with GitHub

Let's add social login using GitHub as an example.

First, create a GitHub OAuth app at https://github.com/settings/developers

Add credentials to your `.env`:

```bash [.env]
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
```

Update `nuxt.config.ts`:

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  auth: {
    provider: {
      type: "authjs",
      provider: "github",
    },
    globalAppMiddleware: true,
  },
  
  runtimeConfig: {
    authSecret: process.env.AUTH_SECRET,
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    },
    public: {
      authOrigin: process.env.AUTH_ORIGIN || "http://localhost:3000",
    },
  },
});
```

Create `server/api/auth/[...].ts`:

```ts [server/api/auth/[...].ts]
import { NuxtAuthHandler } from "@sidebase/nuxt-auth";
import GithubProvider from "next-auth/providers/github";

export default NuxtAuthHandler({
  secret: process.env.AUTH_SECRET,
  providers: [
    GithubProvider.default({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
});
```

---

## Step 8: Create the Frontend Auth Pages

Create `pages/login.vue`:

```vue [pages/login.vue]
<template>
  <div class="auth-page">
    <h1>Login to BrewStop</h1>
    
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label>Email</label>
        <input v-model="email" type="email" required />
      </div>
      
      <div class="form-group">
        <label>Password</label>
        <input v-model="password" type="password" required />
      </div>
      
      <button type="submit" :disabled="loading">
        {{ loading ? "Logging in..." : "Login" }}
      </button>
      
      <p v-if="error" class="error">{{ error }}</p>
    </form>
    
    <p class="oauth-separator">or</p>
    
    <button @click="loginWithGithub" class="github-btn">
      Continue with GitHub
    </button>
  </div>
</template>

<script setup lang="ts">
const email = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");

async function handleLogin() {
  loading.value = true;
  error.value = "";
  
  try {
    await $fetch("/api/auth/login", {
      method: "POST",
      body: { email: email.value, password: password.value },
    });
    
    navigateTo("/dashboard");
  } catch (e: any) {
    error.value = e.data?.statusMessage || "Login failed";
  } finally {
    loading.value = false;
  }
}

async function loginWithGithub() {
  await navigateTo("/api/auth/signin/github", { external: true });
}
</script>
```

Create `pages/register.vue`:

```vue [pages/register.vue]
<template>
  <div class="auth-page">
    <h1>Create an Account</h1>
    
    <form @submit.prevent="handleRegister">
      <div class="form-group">
        <label>Name</label>
        <input v-model="name" type="text" required />
      </div>
      
      <div class="form-group">
        <label>Email</label>
        <input v-model="email" type="email" required />
      </div>
      
      <div class="form-group">
        <label>Password</label>
        <input v-model="password" type="password" required />
      </div>
      
      <button type="submit" :disabled="loading">
        {{ loading ? "Creating account..." : "Register" }}
      </button>
      
      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </div>
</template>

<script setup lang="ts">
const name = ref("");
const email = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");

async function handleRegister() {
  loading.value = true;
  error.value = "";
  
  try {
    await $fetch("/api/auth/register", {
      method: "POST",
      body: { name: name.value, email: email.value, password: password.value },
    });
    
    navigateTo("/dashboard");
  } catch (e: any) {
    error.value = e.data?.statusMessage || "Registration failed";
  } finally {
    loading.value = false;
  }
}
</script>
```

---

## Step 9: Use Auth Composable

Nuxt provides a composable for easy auth state management.

```ts [composables/useAuth.ts]
export const useAuth = () => {
  const user = useState("auth-user", () => null);
  const loading = useState("auth-loading", () => true);
  
  const fetchUser = async () => {
    loading.value = true;
    try {
      user.value = await $fetch("/api/auth/me");
    } catch {
      user.value = null;
    } finally {
      loading.value = false;
    }
  };
  
  const logout = async () => {
    await $fetch("/api/auth/logout", { method: "POST" });
    user.value = null;
    navigateTo("/login");
  };
  
  return { user, loading, fetchUser, logout };
};
```

---

## Security Checklist

Before going to production, verify:

::BlogAlert{type="warning"}
- [ ] HTTPS enabled
- [ ] AUTH_SECRET is set and secure
- [ ] Passwords are hashed with Argon2 or bcrypt
- [ ] Cookie has httpOnly, secure, and sameSite flags
- [ ] Rate limiting on login/register endpoints
- [ ] Email validation implemented
- [ ] Password strength requirements enforced
::

---

## API Routes Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create new account |
| POST | `/api/auth/login` | Authenticate user |
| POST | `/api/auth/logout` | Clear session |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/auth/[...]` | OAuth handlers |

---

# Conclusion

Authentication is complex, but with Nuxt 4 and the right tools, you can build a secure system without reinventing the wheel. We've covered:

- **Credentials-based auth** with secure password hashing
- **JWT tokens** stored in httpOnly cookies
- **OAuth integration** with GitHub
- **Protected API routes** for authenticated endpoints
- **Frontend auth pages** with proper error handling

The key takeaways:

1. **Never store plain-text passwords** — use Argon2 or bcrypt
2. **Use httpOnly cookies** for token storage
3. **Validate everything** on both client and server
4. **Use established libraries** rather than rolling your own

In production, consider adding:
- Rate limiting on auth endpoints
- Email verification flow
- Password reset functionality
- Two-factor authentication

Now go forth and secure your applications! 🔐
