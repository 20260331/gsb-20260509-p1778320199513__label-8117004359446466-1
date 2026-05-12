# 修复管理员登录刷新后被踢出

> **Workspace:** d:\code\trae\gsb\20260509\B-98-bug修复-1\TestM_4

---

## User
管理员登录后台后刷新页面就被踢出去了,自动跳转到首页。需要修复后保持登录状态,不要改动现有的状态持久化机制,保持前后端分层架构不变。

## Assistant
我来帮你修复这个登录状态丢失的问题。首先让我了解一下项目的结构和登录相关的代码。

让我查看前端的用户状态管理和路由守卫，以及后端的认证中间件：


让我查看一下 main.ts 和 API 配置：



现在我明白问题了。让我创建一个修复计划：



问题原因已经明确：刷新页面后，`token` 通过持久化被恢复了，但 `user` 信息为空，导致 `isAdmin` 返回 `false`，被路由守卫跳转到首页。

现在修改路由守卫，在有 token 但无 user 信息时先获取用户信息：




现在在应用初始化时也添加获取用户信息的逻辑：






让我检查一下 TypeScript 是否有错误：








让我检查一下完整的输出：





让我直接运行类型检查：








类型检查通过了。让我完成任务：







修复完成！

## 问题原因
管理员登录后台后刷新页面被踢出的根本原因是：刷新页面后，`token` 通过 `pinia-plugin-persistedstate` 持久化机制被恢复了，但 `user` 信息为空，导致 `isAdmin` 计算属性返回 `false`，被路由守卫跳转到首页。

## 修复方案
我做了两处修改，**没有改动现有的状态持久化机制**，保持了前后端分层架构不变：

### 1. 修改路由守卫 (`frontend/src/router/index.ts:124`)
在路由守卫中添加逻辑：当有 `token` 但无 `user` 信息时，先调用 `fetchProfile()` 获取用户信息，再进行权限判断。

```typescript
router.beforeEach(async (to, _from, next) => {
    // ...
    const userStore = useUserStore()

    if (userStore.token && !userStore.user) {
        await userStore.fetchProfile()
    }
    // 权限判断...
})
```

### 2. 应用初始化时获取用户信息 (`frontend/src/main.ts:17-20`)
在应用启动时就检查并获取用户信息，确保用户信息尽早加载。

```typescript
const userStore = useUserStore()
if (userStore.token && !userStore.user) {
    userStore.fetchProfile()
}
```

这样修改后，管理员登录后台后刷新页面会自动获取用户信息，保持登录状态，不会被踢出。

## User
把补充用户资料的请求合并成一次，进入后台时不要重复请求

## Assistant
我来优化代码，避免重复请求用户资料。


我来优化代码，在 user store 中添加防重逻辑，避免重复请求：




现在移除 main.ts 中的调用，只保留路由守卫中的逻辑：






现在验证代码没有 TypeScript 错误：







让我检查可用的脚本：








让我运行 build 来检查类型错误：










需要先安装依赖：













让我直接使用 GetDiagnostics 来检查 TypeScript 错误：















优化完成！

## 优化内容

### 1. 在 `user store` 中添加防重逻辑 (`frontend/src/stores/user.ts`)

添加了 `profilePromise` 变量来跟踪正在进行的请求，确保：
- **如果已经有用户数据**：直接返回，不发送请求
- **如果正在请求中**：返回同一个 Promise，避免重复发送请求
- **请求完成后**：清空 Promise 状态，允许后续重新获取

```typescript
let profilePromise: Promise<void> | null = null

async function fetchProfile() {
    if (!token.value) return
    if (user.value) return           // 已有数据，直接返回
    if (profilePromise) return profilePromise  // 请求中，复用 Promise

    profilePromise = (async () => {
        try {
            const response = await api.auth.profile()
            user.value = response.user
        } catch {
            logout()
        } finally {
            profilePromise = null    // 请求完成后清空
        }
    })()

    return profilePromise
}
```

### 2. 移除 `main.ts` 中的预加载调用

只在路由守卫中按需调用，避免应用启动时不必要的请求。

### 效果

- 进入后台时，路由守卫调用 `fetchProfile()` 只会发送一次请求
- 即使有多个地方同时调用，也只会发送一次网络请求
- 保持登录状态刷新页面后，用户资料只获取一次

