# 注册确认密码 flarum-sign-confirm-password

给 Flarum 2.x 论坛的注册弹窗加一个「确认密码」输入框，并在输入密码时实时提示密码强度，所有提示样式都可以在后台调整。

## 功能

1. **注册弹窗确认密码框**：密码框下方多出一个「确认密码」输入框，两次输入不一致时注册请求会被拒绝，弹窗里提示「两次输入的密码不一致。」并自动聚焦到该输入框。
2. **密码强度提示**：输入密码时，密码框下方出现三格强度条与文字（弱 / 一般 / 强），颜色按强度变化；强度在浏览器本地计算，不依赖任何外部服务。
3. **显示密码按钮**：密码框右侧可显示一个「眼睛」按钮，点击切换明文 / 密文；可在后台关闭。
4. **后台设置**：扩展页可配置弱 / 一般 / 强三种颜色、输入框边框是否随强度变色、输入文字是否随强度变色、是否显示「显示密码」按钮。
5. **服务端兜底校验**：除了前端提示，后端同样校验 `password === confirmPassword`，绕过前端直接调接口也建不了号；QQ / GitHub / 微软 / 皮肤站等带 `token` 的注册不显示确认框、也不做校验，管理员通过 API 创建用户同样不受限制。

## 安装

```bash
composer require tacraft-sociality/flarum-sign-confirm-password:@dev
php flarum extension:enable tacraft-sociality-sign-confirm-password
php flarum cache:clear
```

## 兼容性

- Flarum `^2.0`
- PHP `^8.2`

## 说明

- 前端：扩展 `SignUpModal` 的 `oninit` / `fields` / `submitData`（模块路径形式，兼容懒加载），确认框优先级 5，位于密码框（10）与注册按钮（-10）之间。
- 后端：监听 `Flarum\User\Event\Saving`，仅对「新用户 + 非管理员 + 无 token」的请求校验，不一致时抛 `ValidationException`（422，字段 `confirmPassword`）。
- 强度设置保存在 `tacraft-sociality-sign-confirm-password.*`，通过 `serializeToForum()` 传给前端。
