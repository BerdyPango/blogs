---
title: aspnetcore-authentication
tags:
---


## Authorization
- `Policy`: 可基于一个或多个 Requirement 定义的授权策略，以 Name 进行区分
- `Requirement`: 定义授权的要求
- `Handler`: 定义如何处理授权 Requirement

### 基于角色的授权机制
- 在 `Role-Based` 授权机制中，如果对某个 `Controller` 或 `Action` 应用了两个 `[Authorize(Roles = "XXX")]`，表示访问者角色必须同时满足两者才授权访问，而如果只应用一个 `[Authorize(Roles = "A, B")]` 则表示访问者角色是 A 或 B 即授权访问。
- 如果使用基于 Policy 的 Role-Based 授权机制，那么在 `Startup` 的 `ConfigureServices` 方法中，指定多个值以允许任一满足条件的访问者角色。
```bash
options.AddPolicy("ElevatedRights", policy => policy.RequireRole("Administrator", "PowerUser", "BackupAdministrator"));
```

### 基于 Claim 的授权机制
- Claim 授权与 Policy 一起工作，Claim 通常以名值对的形式出现
- Claim 声明主体是什么，而非主体能够做什么
- 如果在 Controller 或 Method 上应用多个授权特性，那么访问者必须满足所有 Policy 才会授权，例如:
```
[Authorize(Policy = "EmployeeOnly")]
public class SalaryController : Controller
{
    public ActionResult Payslip()
    {
    }

    [Authorize(Policy = "HumanResources")]
    public ActionResult UpdateSalary()
    {
    }
}
```