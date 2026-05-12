# 修复管理员登录刷新后被踢出

> **Workspace:** d:\code\trae\gsb\20260509\B-98-bug修复-1\TestM_3

---

## User
管理员登录后台后刷新页面就被踢出去了,自动跳转到首页。需要修复后保持登录状态,不要改动现有的状态持久化机制,保持前后端分层架构不变。

## Assistant
我来帮你修复这个管理员登录刷新后被踢出去的问题。首先让我了解一下项目的结构和现有的登录认证机制。

让我查看相关的认证文件来理解现有的登录机制。


现在我理解了问题。让我查看 `main.ts` 来了解应用的初始化流程。


我找到了问题的根源。让我分析一下：

**问题分析：**
1. 在 `user.ts` store 中，只有 `token` 被持久化了，但 `user` 对象没有被持久化
2. 刷新页面后，`token` 被恢复，所以 `isLoggedIn` 为 true
3. 但 `user` 对象为 null，所以 `isAdmin` 为 false
4. 路由守卫在第137行检查 `isAdmin` 时失败，导致被重定向到首页

**解决方案：**
在应用初始化时，如果有 token，就调用 `fetchProfile()` 来恢复用户信息。同时修改路由守卫，在需要 admin 权限但 user 信息还未加载时，先尝试获取用户信息。


现在让我修改 `main.ts`，在应用初始化时恢复用户信息：



现在修改路由守卫，让它在检查权限时如果用户信息还没加载完成，先等待或尝试获取：




让我检查一下项目是否有TypeScript类型检查或构建命令来验证代码：




让我运行 TypeScript 类型检查来验证代码：




## 问题已修复！

### 问题原因
管理员登录后刷新页面被踢出，是因为：
1. 虽然 `token` 通过 `pinia-plugin-persistedstate` 被持久化到了 localStorage
2. 但 `user` 对象没有被持久化，刷新后 `user` 为 `null`
3. 路由守卫检查 `isAdmin` 时失败（因为 `user.value.role` 不存在），导致被重定向到首页

### 修复方案

**修改 1：`frontend/src/main.ts:17-18`**
在应用初始化时，如果有 token 就调用 `fetchProfile()` 从后端恢复用户信息：
```typescript
const userStore = useUserStore()
userStore.fetchProfile()
```

**修改 2：`frontend/src/router/index.ts:124-152`**
将路由守卫改为异步，在检查 admin 权限时，如果用户信息还未加载，先尝试从后端获取：
```typescript
if (to.meta.requiresAdmin) {
    if (userStore.token && !userStore.user) {
        try {
            await userStore.fetchProfile()
        } catch {
            next({ name: 'Home' })
            return
        }
    }
    if (!userStore.isAdmin) {
        next({ name: 'Home' })
        return
    }
}
```

### 保持不变的部分
- ✅ 原有的状态持久化机制（只持久化 `token`）没有改动
- ✅ 前后端分层架构保持不变（仍然通过 API 获取用户信息）
- ✅ 安全性没有降低（仍然需要有效的 token 才能获取用户信息）

