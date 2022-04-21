---
title: OAuth2.0 和 Openid Connect
date: 2018-08-03 10:58:04
description: 本文介绍了 OAuth2.0 和 OpenID Connect 的关系，以及 OpenID Connect 对认证机制的扩展和使用场景
category:
- Cryptography
tags:
- security
- oauth
- jwt

---
参考资料:
- [Identity, Claims, & Tokens – An OpenID Connect Primer](https://developer.okta.com/blog/2017/07/25/oidc-primer-part-1)


## OpenID Connect 和 OAuth 2.0 结合用于认证
OAuth 在设计之初并不是为了做认证，因为 OAuth 没有提供获取用户信息的标准方式，OAuth 被用于用户认证是业界对其滥用的结果。而 OpenID Connect 则是基于 OAuth 2.0 的扩展认证协议，OpenID Connect 对 OAuth 2.0 做了以下扩展:
- `ID Token`: 包含了用户的 ID 或其他代表该用户信息的 `token`
- 用户信息接口用于获取详细的用户信息
- 标准化的 Scope 集合
- 标准化实现

`OpenID Connect` 的流程中 `Authorization Server` 在返回中增加了 `ID Token`，而 `ID Token` 以 **JWT(JSON Web Token)** 被熟知，它以标准化的方式将一系列信息加密，并在网络中传输。JWT 由三部分组成:
- `Header`: 包含如 Token 类型，加密算法等信息。
- `Payload`: 有时又称作 Claims，该值可由应用程序解码得到。
- `Signature`: 用于验证 JWT 数据完整性。

## OpenID Connect 原理及过程
与 OpenID Connect(OIDC) 相关的有两个角色，分别是
- `OpenID Provider(OP)`: 一个用于认证用户并提供认证结果的 OAuth 2.0 服务
- `Relying Party(RP)`: 依赖于 OP 处理认证请求的应用程序

通常情况下，OIDC 开始于一个指向形如 `/authorization` 入口点的 HTTP GET 请求，该请求携带一系列参数指示了该请求期望得到的认证结果和拥有哪些资源的访问权限。接下来，另一个指向 `/token` 入口点的 HTTP POST 请求用于获取访问其他资源服务的 Token 凭证。同时，OIDC 还提供了形如 `/introspect` 的入口点用于检查 Token 以及 `/userinfo` 的入口点用于获取用户的身份信息。

以上所有入口点的名称都是行业惯例，也可以由 OP 定义为其他名称，OIDC 一项显著的改进是 OP 端加入了元数据机制来发现资源入口点。例如，当访问 https://micah.okta.com/oauth2/aus2yrcz7aMrmDAKZ1t7/.well-known/openid-configuration 链接会得到一个包含了所有入口点的元数据 JSON 格式的文档:
``` JSON
{
   "issuer":"https://micah.okta.com/oauth2/aus2yrcz7aMrmDAKZ1t7",
   "authorization_endpoint":"https://micah.okta.com/oauth2/aus2yrcz7aMrmDAKZ1t7/v1/authorize",
   "token_endpoint":"https://micah.okta.com/oauth2/aus2yrcz7aMrmDAKZ1t7/v1/token",
   "userinfo_endpoint":"https://micah.okta.com/oauth2/aus2yrcz7aMrmDAKZ1t7/v1/userinfo",
   "registration_endpoint":"https://micah.okta.com/oauth2/v1/clients",
   "jwks_uri":"https://micah.okta.com/oauth2/aus2yrcz7aMrmDAKZ1t7/v1/keys",
   "response_types_supported":[
      "code",
      "id_token",
      "code id_token",
      "code token",
      "id_token token",
      "code id_token token"
   ],
   "response_modes_supported":[
      "query",
      "fragment",
      "form_post",
      "okta_post_message"
   ],
   "grant_types_supported":[
      "authorization_code",
      "implicit",
      "refresh_token",
      "password"
   ],
   "subject_types_supported":[
      "public"
   ],
   "id_token_signing_alg_values_supported":[
      "RS256"
   ],
   "scopes_supported":[
      "openid",
      "profile",
      "email",
      "address",
      "phone",
      "offline_access"
   ],
   "token_endpoint_auth_methods_supported":[
      "client_secret_basic",
      "client_secret_post",
      "client_secret_jwt",
      "none"
   ],
   "claims_supported":[
      "iss",
      "ver",
      "sub",
      "aud",
      "iat",
      "exp",
      "jti",
      "auth_time",
      "amr",
      "idp",
      "nonce",
      "name",
      "nickname",
      "preferred_username",
      "given_name",
      "middle_name",
      "family_name",
      "email",
      "email_verified",
      "profile",
      "zoneinfo",
      "locale",
      "address",
      "phone_number",
      "picture",
      "website",
      "gender",
      "birthdate",
      "updated_at",
      "at_hash",
      "c_hash"
   ],
   "code_challenge_methods_supported":[
      "S256"
   ],
   "introspection_endpoint":"https://micah.okta.com/oauth2/aus2yrcz7aMrmDAKZ1t7/v1/introspect",
   "introspection_endpoint_auth_methods_supported":[
      "client_secret_basic",
      "client_secret_post",
      "client_secret_jwt",
      "none"
   ],
   "revocation_endpoint":"https://micah.okta.com/oauth2/aus2yrcz7aMrmDAKZ1t7/v1/revoke",
   "revocation_endpoint_auth_methods_supported":[
      "client_secret_basic",
      "client_secret_post",
      "client_secret_jwt",
      "none"
   ],
   "end_session_endpoint":"https://micah.okta.com/oauth2/aus2yrcz7aMrmDAKZ1t7/v1/logout",
   "request_parameter_supported":true,
   "request_object_signing_alg_values_supported":[
      "HS256",
      "HS384",
      "HS512"
   ]
}
```

## Scope
`/authorization` 请求中的 `scope` 查询参数将决定返回的 Token 中具有何种资源的访问权限。Scope 是 `Authorization Server` 系统中预定义的细粒度权限等级，以空白字符进行分隔，详细的 Scope 标识在 [RFC 6749](https://tools.ietf.org/html/rfc6749) 中定义，OIDC 中也指定了一些内置的 Scope，`openid` 是必须指定的 scope 值，其他都是可选的(包括自定义的)，内置的 scope 有:

| Scope   | Purpose                                                          |
| ------- | ---------------------------------------------------------------- |
| profile | requests access to default profile claims                        |
| email   | requests access to email and email_verified claims               |
| address | requests access to address claim                                 |
| phone   | requests access to phone_number and phone_number_verified claims |

`profile` scope 默认包含的 `claim` 有:
- name
- family_name
- given_name
- middle_name
- nickname
- preferred_username
- profile
- picture
- website
- gender
- birthdate
- zoneinfo
- locale
- updated_at

> 注意 Scope 是如何与 Claim 进行关联的，Claim 详见下文。

## Claim
简单来说，Claim 就是有关用户身份信息和 OIDC 服务的以键值对存储的元数据。以下是一个典型的 Claims 集合:
```bash JSON
{
    "family_name": "Silverman",
    "given_name": "Micah",
    "locale": "en-US",
    "name": "Micah Silverman",
    "preferred_username": "micah.silverman@okta.com",
    "sub": "00u9vme99nxudvxZA0h7",
    "updated_at": 1490198843,
    "zoneinfo": "America/Los_Angeles"
}
```
以上代码列出了 `profile` Scope 的部分 `claim`，这是由于想要获取用户信息的请求指定了 `profile` 的 scope 值，于是返回的 Token 中包含了这些信息。

## Response Type
`/authorization` 请求中的 `response_type` 查询参数不同的值控制着不同的流程，采用哪种类型需要考虑将以何种方式确保 Token(走 `Front Channel` 还是 `Back Channel`)的安全性以及如何获取额外的身份信息(直接包含在 Token 中还是发起另一个请求)。主要的有以下三种:
- `Authorization Code`: 由后台服务向 OP 请求 Token，走 `Back Channel`，其查询字符串为 `response_type=code`，该方式在 OP 认证成功会返回一个 `code` 值，后续 RP 用该 `code` 向 OP 请求 Token 交换，即 `access_token` 和 `id_token`。这种方式适用于后台服务端存储一个由 OP 分配的 `client_id` 和 `client_secret`，并通过 `/token` 入口点交换 Token，服务端在得到 Token 后可在隐藏 `client_id` 和 `client_secret` 的前提下将 Token 返回给客户端(浏览器或 app)，之后客户端使用该 Token 与其他资源服务器进行交互。同时还可以通过 `refresh_token` 获取新的 `access_token` 以支持长时会话，这也是[OAuth2.0 简介](/Security/Web/security-oauth2)中举例所使用的方式。
- `Implict`: 直接由用户代理端(浏览器或 App) 向 OP 请求 Token，其查询字符串为 `response_type=id_token token` 或 `response_type=id_token`，OP 认证成功后将直接返回 `id_token` + `access_token` 或仅返回 `id_token`。这种方式不支持长时会话。
- `Hybrid`: 这种方式结合了以上两种，情况，可指定 `response_type=code id_token` 的值，OP 在认证成功后立即返回 `id_token` 和 `code` 值用于交换访问资源的 `access_token` 和 `refresh_token`。

## Tokens
在了解了 Scopes，Claims 和 Response Type 之后，Tokens 就易于理解了，一共有三种类型的 Token

### ID Token
一个 `id_token` 就是一个 JWT(JSON Web Token)，这意味着:
- 用户信息直接被包含在 Token 中
- Token 同时包含了足够的信息以校验内容是否被篡改

官方声明中定义了一组用于校验 `id_token` 的规则，`id_token` 中的 `exp` Claim 必须作为参与校验程序的一部分，同时，JWT 使用一个用于签名的 key 来验证数据完整性。

### Access Tokens
`Access Token`s 用作 Bearer Tokens，Bearer Token 意味着来访者可以直接访问授权的资源而无需额外的身份认证。因此，确保 Bearer Token 的安全性非常重要，如果其他人得到了这些 Token，那么就可以冒充受信任的来访者而盗取用户信息。

`Access Token`s 通常只有很短的有效期(由其 `exp` Claim 指定)，当该 Token 过期，用户必须重新认证以得到新的 Bearer Token。OIDC 没有强制规定，于是许多授权服务也将 JWTs 用作 `Access Token`。

OIDC 将 `/userinfo` 定义为返回身份信息的入口点，使用 `access_token` 即可访问该入口点获取资源:
```bash
http https://micah.oktapreview.com/oauth2/.../v1/userinfo

HTTP/1.1 400 Bad Request
...
WWW-Authenticate: Bearer error="invalid_request", error_description="The access token is missing."
...
```
携带 `access_token` 以访问该资源，但该 Token 已过期:
```bash
http https://micah.oktapreview.com/oauth2/.../v1/userinfo \
Authorization:"Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6Ik93bFNJS3p3Mmt1Wk8zSmpnMW5Dc2RNelJhOEV1elY5emgyREl6X3RVRUkifQ..."

HTTP/1.1 401 Unauthorized
...
WWW-Authenticate: Bearer error="invalid_token", error_description="The token has expired."
...
```
使用一个有效的 `access_token` 进行访问:
```
http https://micah.oktapreview.com/oauth2/.../v1/userinfo \
Authorization:"Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6Ik93bFNJS3p3Mmt1Wk8zSmpnMW5Dc2RNelJhOEV1elY5emgyREl6X3RVRUkifQ..."

HTTP/1.1 200 OK
...
{
    "family_name": "Silverman",
    "given_name": "Micah",
    "groups": [
        "ABC123",
        "Everyone"
    ],
    "locale": "en-US",
    "name": "Micah Silverman",
    "preferred_username": "micah+okta@afitnerd.com",
    "sub": "...",
    "updated_at": 1490198843,
    "zoneinfo": "America/Los_Angeles"
}
```
### Refresh Tokens
`Refresh Token` 用于获取新的 `Access Token`。通常，`Refresh Token` 有效期会长于 `Access Token`。以下是一种典型的案例:
1. 用户登录并取得了一个 `Access Token` 和 `Refresh Token`。
2. 应用程序检测到 `Access Token` 过期了
3. 应用程序使用 `Refresh Token` 来取得一个新的 `Access Token`
4. 重复步骤 2 和 3 直至 `Refresh Token` 过期
5. `Refresh Token` 过期之后，用户必须重新认证

这种做的意义是要在用户体验和安全之间取得平衡，假设用户账号被盗，或用户订阅的服务过期了。管理员可以在任何时候撤销用户的 `Refresh Token`，步骤 3 以上就将失效并强制用户重新认证，如果用户账号此时被挂起或锁定，那么用户也无法再进行认证了。

## 快速识别 Token

- ID Token 直接携带了用户身份信息，必须是 JWT Token
- Access Token 以 Bearer Token 的形式匿名访问特定资源
- Refresh Tokens 仅仅用于获取更多的 Access Token
-
# 总结-
以下情况使用 OAuth 2.0:-
- 为请求 API 的客户端分配权限-
- 获取其他系统的用户数据

以下情况使用 OpenID Connect:
- 登录用户
- 使系统内用户在其他系统中可访问

应用场景举例:
- 带有后台服务的网站应用程序(例如 MVC): OpenID Connect，前台请求认证服务，换取 Access Token 和 ID Token，客户端将其以 Cookie 存入浏览器本地以保持状态，这样的优势在于，前后端不再依赖不同平台的 Session 实现，更好的前后端解耦。
- 本地移动应用: 客户端请求认证服务，换取 Access Token 和 ID Token，将其存储于与设备安全相关的内容栈上，例如 Keychain。
- SPA: 前台请求认证服务，以 Implict 模式返回 Access Token 和 Id Token，并确保其安全。
