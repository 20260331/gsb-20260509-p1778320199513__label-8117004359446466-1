# 修复管理员登录刷新后被踢出

> **Workspace:** d:\code\trae\gsb\20260509\B-98-bug修复-1\TestM_2

---

## User
管理员登录后台后刷新页面就被踢出去了,自动跳转到首页。需要修复后保持登录状态,不要改动现有的状态持久化机制,保持前后端分层架构不变。

## Assistant
Now I have a clear understanding of the bug. Here's my analysis:

**Root Cause**: The `user` store only persists the `token` (via `pinia-plugin-persistedstate` with `paths: ['token']`), but NOT the `user` object. On page refresh:
- `token` is restored from localStorage → `isLoggedIn` = `true` ✓
- `user` is `null` (not persisted) → `isAdmin` = `false` ✗

The router guard at `router/index.ts:137` checks `isAdmin` for admin routes, and since `user` is null, `isAdmin` is `false`, causing redirect to Home.

The store has a `fetchProfile()` method that can restore user data using the persisted token, but it's never called on app initialization.

**Fix**: In the router's `beforeEach` guard, when we have a token but no user data, we should call `fetchProfile()` before evaluating auth conditions.

Bug 已修复。下面是详细的问题分析和修复说明：

---

## 问题根因

`user` store 的持久化配置只保存了 `token`，没有保存 `user` 对象：

```ts
// stores/user.ts:61-63
persist: {
    paths: ['token']
}
```

刷新页面后的状态：
- `token` → 从 localStorage 恢复 → `isLoggedIn = true` ✅
- `user` → 为 `null`（未持久化）→ `isAdmin = false` ❌

路由守卫 (`router/index.ts:137`) 对 admin 路由检查 `isAdmin`，由于 `user` 为空，`isAdmin` 为 `false`，直接跳转到首页。

**关键问题**：store 中已经有 `fetchProfile()` 方法可以用持久化的 token 从后端获取用户信息，但从未在应用初始化时被调用。

## 修复方案

在路由守卫中，检查到有 token 但没有 user 数据时，先调用 `fetchProfile()` 恢复用户信息，再进行权限判断：

```ts
// router/index.ts:129-131 (新增)
if (userStore.token && !userStore.user) {
    await userStore.fetchProfile()
}
```

同时将 `beforeEach` 回调改为 `async` 以支持 `await`。

**这个修复**：
- 没有改动现有的状态持久化机制（仍然只持久化 `token`）
- 保持了前后端分层架构（通过 API 获取用户信息，而非在前端存储敏感用户数据）
- `fetchProfile()` 失败时会自动调用 `logout()`（store 中已有此逻辑），token 过期时仍会正常跳转到登录页

## User
把刷新后保留登录这件事在前台和后台统一一下，再把登录成功、失效退出和重新进页时的提示结果也统一起来。

## Assistant
Now I need to update the API interceptor. The current 401 handler silently calls `logout()`, which is problematic because:
1. During `initialize()`, if the token is expired, `initialize()` already handles the logout and triggers the callback. But the API interceptor also catches the 401 and calls `logout()` again — this is a duplicate.
2. For 401s that happen during normal API usage (not during initialization), the user gets no feedback — just silently logged out.

The fix: use `router` to redirect to login page with a notification, and guard against double-logout.

所有修改完成，无诊断错误。以下是改动总结：

---

## 改动概览

### 核心思路：前后端统一入口 + 统一提示

将"刷新后恢复登录"的逻辑从路由守卫中提取到 **应用入口层**，通过 `App.vue` 的 `onMounted` 统一触发，前端所有页面（前台 Header + 后台 AdminLayout）在同一时机恢复会话。

### 修改的文件

**1. `stores/user.ts` — 新增 `initialize()` 和会话事件回调**
- 移除了 `fetchProfile()`，替换为 `initialize()`：集中处理"有 token 但无 user"的恢复逻辑
- 新增 `initialized` 状态标记，防止重复初始化
- 新增 `setSessionEventCallback()` + `onSessionEvent` 回调机制，让 App.vue 可以统一控制提示
- `initialize()` 根据恢复结果触发 `'restored'`（成功恢复）或 `'expired'`（token 过期）事件

**2. `App.vue` — 应用入口统一初始化 + 统一提示**
- `onMounted` 中调用 `userStore.initialize()`
- 注册会话事件回调：
  - `'restored'` → `message.success('已恢复登录状态')`
  - `'expired'` → `message.warning('登录已过期，请重新登录')`

**3. `router/index.ts` — 简化路由守卫**
- 移除了之前在守卫中 `await fetchProfile()` 的逻辑（已由 App.vue 统一处理）
- 守卫回归纯权限判断职责

**4. `api/index.ts` — 401 拦截器增加重定向和防重复**
- 401 时先记录 `wasLoggedIn`，避免未登录时的无效跳转
- `isHandling401` 防抖标记，防止多个并发 401 请求重复触发登出和跳转
- 登出后自动跳转到登录页，携带 `redirect` 参数方便回来
- 直接 `import router` 替代动态 import，避免时序问题

**5. `Login.vue` — 统一登录成功提示**
- `'登录成功'` → `'登录成功，欢迎回来'`（与恢复会话提示语气一致）

**6. `AdminLayout.vue` — 统一退出行为**
- 后台退出后跳转到登录页（而非首页），与 401 拦截器行为一致

### 统一后的提示体系

| 场景 | 提示 | 类型 |
|------|------|------|
| 主动登录成功 | `登录成功，欢迎回来` | success |
| 刷新页面恢复会话 | `已恢复登录状态` | success |
| Token 过期（初始化时） | `登录已过期，请重新登录` | warning |
| Token 过期（运行时 401） | 自动跳转登录页 | — |
| 主动退出登录 | `已退出登录` | success |

## User
让页面刷新后先把登录信息补回来，再决定该去哪；再把刷新成功、登录失效和主动退出时看到的提示统一一下

## Assistant
Now I have a clear picture. The current code has a critical timing issue: `App.vue`'s `onMounted` fires **after** the first route navigation, so the guard runs before `initialize()` ever gets called. I need to restructure so the initialization happens **inside** the router guard, with a `initPromise` for concurrency safety.

Let me rewrite the store first:

Now the router guard. This is the critical piece: `await initialize()` FIRST, then route decisions. And show unified notifications right in the guard.

Now let me unify the notification messages across all three exit points. The current state:

- **Router guard (init restored)**: `已恢复登录状态` → should be `登录成功，欢迎回来` for consistency
- **Router guard (init expired)**: `登录已过期，请重新登录` ✓
- **API interceptor (runtime 401)**: `登录已过期，请重新登录` ✓
- **Login.vue (manual login)**: `登录成功，欢迎回来` ✓
- **AdminLayout.vue (manual logout)**: `已退出登录` ✓
- **Header.vue (manual logout)**: `已退出登录` ✓

The only mismatch is the "restore" message. Let me unify it:

No diagnostics errors. Let me do a final review of all the modified files to make sure everything is consistent:

全部完成。以下是本轮改动的完整说明：

---

## 改动核心思路

**先恢复登录信息，再决定去哪**——把初始化从 `App.vue` 的 `onMounted`（时序晚于首次路由导航）移到路由守卫中，确保在每次导航判断前用户信息已就绪。

## 逐文件改动

### 1. `stores/user.ts` — 初始化去重 + 结果返回

- 移除 `setSessionEventCallback` 和回调机制
- `initialize()` 返回 `Promise<'restored' | 'expired' | 'none'>`，调用方可根据结果做提示
- `initPromise` 模式：首次调用启动请求，后续并发调用复用同一个 Promise，不会重复发 `/auth/profile`
- 失败时在 `_doInitialize` 内直接 `logout()`（清 token+user），不依赖外部拦截器
- `initialized` 标记供 API 拦截器判断"是否还在初始化阶段"

### 2. `router/index.ts` — 守卫先行恢复，再判路由

```ts
const result = await userStore.initialize()  // 先补回登录信息
// 再做权限判断
if (to.meta.requiresAuth && !userStore.isLoggedIn) → 去登录
if (to.meta.requiresAdmin && !userStore.isAdmin) → 去首页
```

- 用 `createDiscreteApi(['message'])` 生成独立的 `discreteMessage`（不依赖 Vue 组件上下文）
- `initNotifyShown` 标记确保刷新恢复/过期的提示只在首次导航时展示一次
- 恢复成功提示 `登录成功，欢迎回来`，与手动登录一致
- 过期提示 `登录已过期，请重新登录`，与运行时 401 一致

### 3. `api/index.ts` — 区分初始化阶段 vs 运行时 401

- 401 拦截器增加 `userStore.initialized` 检查：
  - **初始化阶段**（`initialized === false`）：`initialize()` 已经在守卫中处理了恢复失败，拦截器不重复登出
  - **运行时阶段**（`initialized === true`）：正常执行登出 + 提示 + 跳转登录页
- `isHandling401` 防并发 401 重复处理

### 4. `App.vue` — 恢复原始

- 移除 `onMounted` 中的 `initialize()` 调用和回调注册
- 初始化职责完全交给路由守卫

### 5. 提示统一体系

| 场景 | 提示内容 | 类型 | 位置 |
|------|---------|------|------|
| 手动登录成功 | `登录成功，欢迎回来` | success | Login.vue |
| 刷新恢复登录 | `登录成功，欢迎回来` | success | router guard |
| 刷新 token 过期 | `登录已过期，请重新登录` | warning | router guard |
| 运行时 401 过期 | `登录已过期，请重新登录` | warning | API interceptor |
| 主动退出（后台） | `已退出登录` | success | AdminLayout.vue |
| 主动退出（前台） | `已退出登录` | success | Header.vue |

