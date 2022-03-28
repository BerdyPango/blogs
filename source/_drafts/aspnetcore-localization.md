---
title: ASP.NET Core 应用 - 国际化与本土化
description: ASP.NET Core 国际化与本土化的最佳实践，阅读微软官网文档的摘抄和心得
date: 2017-07-12 19:32:00
categories: 
- ASP.NET Core
tags: 
- aspnet-core
---

参考资料:
- [Globalization and localization in ASP.NET Core](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/localization?view=aspnetcore-2.1)

本文大纲:
- [国际化和本土化](#%E5%9B%BD%E9%99%85%E5%8C%96%E5%92%8C%E6%9C%AC%E5%9C%9F%E5%8C%96)
    - [IStringLocalizer 和 IStringLocalizer<T>](#istringlocalizer-%E5%92%8C-istringlocalizert)
    - [IHtmlLocalizer 和 IHtmlLocalizer<T>](#ihtmllocalizer-%E5%92%8C-ihtmllocalizert)
    - [IStringLocalizerFactory](#istringlocalizerfactory)
    - [视图本土化](#%E8%A7%86%E5%9B%BE%E6%9C%AC%E5%9C%9F%E5%8C%96)
    - [数据注解实现本土化](#%E6%95%B0%E6%8D%AE%E6%B3%A8%E8%A7%A3%E5%AE%9E%E7%8E%B0%E6%9C%AC%E5%9C%9F%E5%8C%96)
        - [数据注解使用统一资源定位](#%E6%95%B0%E6%8D%AE%E6%B3%A8%E8%A7%A3%E4%BD%BF%E7%94%A8%E7%BB%9F%E4%B8%80%E8%B5%84%E6%BA%90%E5%AE%9A%E4%BD%8D)
- [为支持的语言文化提供本土化资源](#%E4%B8%BA%E6%94%AF%E6%8C%81%E7%9A%84%E8%AF%AD%E8%A8%80%E6%96%87%E5%8C%96%E6%8F%90%E4%BE%9B%E6%9C%AC%E5%9C%9F%E5%8C%96%E8%B5%84%E6%BA%90)
    - [SupportedCultures 和 SupportedUICultures](#supportedcultures-%E5%92%8C-supporteduicultures)
    - [资源文件](#%E8%B5%84%E6%BA%90%E6%96%87%E4%BB%B6)
- [语言文化的回退(fallback)行为](#%E8%AF%AD%E8%A8%80%E6%96%87%E5%8C%96%E7%9A%84%E5%9B%9E%E9%80%80fallback%E8%A1%8C%E4%B8%BA)
    - [Visual Studio 生成资源文件](#visual-studio-%E7%94%9F%E6%88%90%E8%B5%84%E6%BA%90%E6%96%87%E4%BB%B6)
    - [添加对其他语言文化的支持](#%E6%B7%BB%E5%8A%A0%E5%AF%B9%E5%85%B6%E4%BB%96%E8%AF%AD%E8%A8%80%E6%96%87%E5%8C%96%E7%9A%84%E6%94%AF%E6%8C%81)
- [实现语言文化选择的机制](#%E5%AE%9E%E7%8E%B0%E8%AF%AD%E8%A8%80%E6%96%87%E5%8C%96%E9%80%89%E6%8B%A9%E7%9A%84%E6%9C%BA%E5%88%B6)
    - [配置本土化](#%E9%85%8D%E7%BD%AE%E6%9C%AC%E5%9C%9F%E5%8C%96)
    - [本土化中间件](#%E6%9C%AC%E5%9C%9F%E5%8C%96%E4%B8%AD%E9%97%B4%E4%BB%B6)
    - [QueryStringRequestCultureProvider](#querystringrequestcultureprovider)
    - [CookieRequestCultureProvider](#cookierequestcultureprovider)
    - [Accept-Language HTTP Header](#accept-language-http-header)
    - [使用自定义提供器](#%E4%BD%BF%E7%94%A8%E8%87%AA%E5%AE%9A%E4%B9%89%E6%8F%90%E4%BE%9B%E5%99%A8)
    - [程序化设置语言文化](#%E7%A8%8B%E5%BA%8F%E5%8C%96%E8%AE%BE%E7%BD%AE%E8%AF%AD%E8%A8%80%E6%96%87%E5%8C%96)
- [国际化与本土化术语](#%E5%9B%BD%E9%99%85%E5%8C%96%E4%B8%8E%E6%9C%AC%E5%9C%9F%E5%8C%96%E6%9C%AF%E8%AF%AD)

参考文档: [Globalization and localization in ASP.NET Core](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/localization?view=aspnetcore-2.1)

# 国际化和本土化

**「国际化(Globalization)」** 表示将 app 设计为支持不同语言文化的过程。

**「本土化(Localization)」** 表示将 app 调整为支持某个特定语言文化的过程。

要实现本土化，至少需要: 
- 提供本土化的 app 的内容
- 提供支持语言文化的本土化 Resources
- 为每一个 request 实现选择语言文化的策略

## IStringLocalizer 和 IStringLocalizer<T>

`IStringLocalizer` 和 `IStringLocalizer<T>` 在框架层面提供了对本土化的支持，该接口使用 `ResourceManager` 和 `ResourceReader` 在运行时提供特定语言文化的资源，该接口公开一个索引器来查询本土化的字符串。该接口不需要在开发时设置中立语言并为不同的字符串提供默认值，示例代码如下: 

{%codeblock lang:CSharp %}
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;

namespace Localization.StarterWeb.Controllers
{
    [Route("api/[controller]")]
    public class AboutController : Controller
    {
        private readonly IStringLocalizer<AboutController> _localizer;

        public AboutController(IStringLocalizer<AboutController> localizer)
        {
            _localizer = localizer;
        }

        [HttpGet]
        public string Get()
        {
            return _localizer["About Title"];
        }
    }
}
{%endcodeblock%}
以上代码中，`IStringLocalizer<AboutController>` 的实例由容器注入，如果在对应的资源中找不到 'About Title' 的值，将直接返回该键，这里的 'About Title' 是字面值，当有其他语言文化的资源文件被创建并提供了针对该字面值的本土化版本后，这里将返回相应的本土化字符串。这样在开发时无需预先定义资源文件并提供默认值。但遇到字面值较长的情况时，仍然建议使用传统方式来实现本土化——即为各个资源事先定义键，再在各个资源文件中提供对应的翻译版本。

## IHtmlLocalizer 和 IHtmlLocalizer<T>
IHtmlLocalizer 和 IHtmlLocalizer<T> 支持 HTML 化的资源，该接口对格式化的参数进行编码，但 HTML 部分不会编码，示例如下: 
{%codeblock lang:CSharp %}
using System;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Localization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Localization;

namespace Localization.StarterWeb.Controllers
{
    public class BookController : Controller
    {
        private readonly IHtmlLocalizer<BookController> _localizer;

        public BookController(IHtmlLocalizer<BookController> localizer)
        {
            _localizer = localizer;
        }

        public IActionResult Hello(string name)
        {
            ViewData["Message"] = _localizer["<b>Hello</b><i> {0}</i>", name];

            return View();
        }
{%endcodeblock%}
注意上述代码引用了 `Microsoft.AspNetCore.Localization` 和 `Microsoft.AspNetCore.Mvc.Localization` 命名空间，只有 `name` 参数被 HTML 编码。

## IStringLocalizerFactory
`IStringLocalizerFactory` 演示了一种更加底层的方法，示例如下: 
{%codeblock lang:CSharp %}
{
    public class TestController : Controller
    {
        private readonly IStringLocalizer _localizer;
        private readonly IStringLocalizer _localizer2;

        public TestController(IStringLocalizerFactory factory)
        {
            var type = typeof(SharedResource);
            var assemblyName = new AssemblyName(type.GetTypeInfo().Assembly.FullName);
            _localizer = factory.Create(type);
            _localizer2 = factory.Create("SharedResource", assemblyName.Name);
        }       

        public IActionResult About()
        {
            ViewData["Message"] = _localizer["Your application description page."] 
                + " loc 2: " + _localizer2["Your application description page."];
{%endcodeblock%}
以上代码演示了 `IStringLocalizerFactory.Create` 方法的两种重载，从演示中可以看出，`SharedResource` 被放置到了另一个程序集中，通过这种方式可以将资源与控制器等分离。

> 你可以以控制器，区域为单位对字符串资源进行划分，或者不划分直接使用一个包含所有资源的类型。一些开发人员喜欢以 `Startup` 类来承载共享字符串资源。

下面的示例使用了两个不同的 `IStringLocalizer<T>` 实例: 
{%codeblock lang:CSharp %}
public class InfoController : Controller
{
    private readonly IStringLocalizer<InfoController> _localizer;
    private readonly IStringLocalizer<SharedResource> _sharedLocalizer;

    public InfoController(IStringLocalizer<InfoController> localizer,
                   IStringLocalizer<SharedResource> sharedLocalizer)
    {
        _localizer = localizer;
        _sharedLocalizer = sharedLocalizer;
    }

    public string TestLoc()
    {
        string msg = "Shared resx: " + _sharedLocalizer["Hello!"] +
                     " Info resx " + _localizer["Hello!"];
        return msg;
    }
{%endcodeblock%}

## 视图本土化
`IViewLocalizer` 接口为视图提供本土化字符串，ViewLocalizer 类型为该接口的默认实现，以下代码展示了如何使用该类型: 
{%codeblock lang:CSharp %}
@using Microsoft.AspNetCore.Mvc.Localization

@inject IViewLocalizer Localizer

@{
    ViewData["Title"] = Localizer["About"];
}
<h2>@ViewData["Title"].</h2>
<h3>@ViewData["Message"]</h3>

<p>@Localizer["Use this area to provide additional information."]</p>
{%endcodeblock%}
IViewLocalizer 的默认实现基于 View 的文件名查找资源，该类型没有提供设置共享资源文件的选项，并且该类型实现了 IHtmlLocalizer 接口，要在 View 中使用共享资源文件，注入 `IHtmlLocalizer<T>`: 
{%codeblock lang:CSharp %}
@using Microsoft.AspNetCore.Mvc.Localization
@using Localization.StarterWeb.Services

@inject IViewLocalizer Localizer
@inject IHtmlLocalizer<SharedResource> SharedLocalizer

@{
    ViewData["Title"] = Localizer["About"];
}
<h2>@ViewData["Title"].</h2>

<h1>@SharedLocalizer["Hello!"]</h1>
{%endcodeblock%}

## 数据注解实现本土化
数据注解的字符串内容默认与 `IStringLocalizer<T>` 协同实现本土化，因为已经设置了 `ResourcesPath = "Resources"`，**RegiserViewModel** 中 `Attribute` 查询消息的依据为:
- Resources/ViewModels.Account.RegisterViewModel.fr.resx
- Resources/ViewModels/Account/RegisterViewModel.fr.resx
{%codeblock lang:CSharp%}
public class RegisterViewModel
{
    [Required(ErrorMessage = "The Email field is required.")]
    [EmailAddress(ErrorMessage = "The Email field is not a valid email address.")]
    [Display(Name = "Email")]
    public string Email { get; set; }

    [Required(ErrorMessage = "The Password field is required.")]
    [StringLength(8, ErrorMessage = "The {0} must be at least {2} characters long.", MinimumLength = 6)]
    [DataType(DataType.Password)]
    [Display(Name = "Password")]
    public string Password { get; set; }

    [DataType(DataType.Password)]
    [Display(Name = "Confirm password")]
    [Compare("Password", ErrorMessage = "The password and confirmation password do not match.")]
    public string ConfirmPassword { get; set; }
}
{%endcodeblock%}

### 数据注解使用统一资源定位
如前文所述，数据注解将以所在类型文件名称为依据查询对应的资源，以下代码展示了如何为不同的类型统一查询资源的地址:
{%codeblock lang:CSharp%}
public void ConfigureServices(IServiceCollection services)
{
    services.AddMvc()
        .AddDataAnnotationsLocalization(options => {
            options.DataAnnotationLocalizerProvider = (type, factory) =>
                factory.Create(typeof(SharedResource));
        });
}
{%endcodeblock%}
`SharedResource` 对应于存储字符串资源的类型，通过这种方式，数据注解将使用该类型作为查询依据。

# 为支持的语言文化提供本土化资源
## SupportedCultures 和 SupportedUICultures
ASP.NET CORE 允许指定两个接收 `CultureInfo` 值的属性:
- `SupportedCultures`: 该属性决定与语言文化有关的输出结果，如日期，时间，数字和货币等格式；该值还决定文本的排序规则，大小写转换和字符串比较，有关服务器如何获取语言文化信息，参见 [CultureInfo.CurrentCulture](https://docs.microsoft.com/en-us/dotnet/api/system.stringcomparer.currentculture?view=netframework-4.7.2#System_StringComparer_CurrentCulture)。
- `SupportedUICultures`: 该属性决定 ResourceMangaer 该从哪一个 *.resx* 文件读取对应资源的翻译版本，.NET 的每一个线程都包含一个 `CurrentCulture` 和 `CurrentUICulture` 属性，ASP.NET CORE 在渲染与语言文化相关的功能时会检查它们。

## 资源文件
非默认语言的字符串资源字典为单独的 *.resx* 资源文件。资源文件的默认命名约定为类型的完全限定名去掉程序集部分，例如，LocalizationWebSite.Web.dll 程序集的类型 LocalizationWebSite.Web.Startup 的法语版本资源文件的名称为 `Startup.fr.resx`，其中 fr 为语言文化编码，LocalizationWebsite.Web.Controllers.HomeController 的对应资源文件会命名为 `Controllers.HomeController.fr.resx`。如果目标类型命名空间与所在程序集不同，则命名时以完全限定名开头。

在 Startup.cs 类型中的 `ConfigureServices` 方法中将 `ResourcesPath` 设置为 "Resources"，那么 HomeController 对应的法语版本资源文件的相对路径为 `Resources/Controllers.HomeController.fr.resx`。另外，可以通过文件夹组织资源文件，如果不设置 `ResourcesPath`，将在项目根目录下查找 *.resx* 文件，使用 `.` 语法还是 `/` 路径作为约定取决于如何组织资源文件。

在 Razor 视图中应用资源文件基于相同的模式，假设 `ResourcesPath` 设置为 "Resources"，那么 Views/Home/About.cshtml 视图的法语版本资源文件就应该定位在: 
- Resources/Views/Home/About.fr.resx
- Resources/Views.Home.About.fr.resx

如果不指定 `ResourcesPath`，那么系统将在与视图相同的文件夹下查找资源文件。

# 语言文化的回退(fallback)行为
本土化机制首先从目标的语言文化开始查找，如果没有找到，它首先还原为目标语言文化的父级文化，即 `CultureInfo.Parent`，如果父级语言文化也未能找到，则返回默认资源文件中的值，如果默认资源文件也没有，则直接返回键。

## Visual Studio 生成资源文件
如果通过 Visuall Studio 新建一个默认资源文件(不带任何语言编码的 .resx 文件)，Visuall Studio 会为该文件生成一个类，为每一个新添加的键生成一个对应的属性，这不是 ASP.NET CORE 推荐的方式，我们希望每次新建资源文件时都带上语言编码，这样 Visuall Studio 便不会为其生成类型。

## 添加对其他语言文化的支持
除了默认语言，每一个语言文化都需要一个唯一的资源文件，新建带有语言文化编码的资源文件是支持新语言文件的必须步骤。

# 实现语言文化选择的机制
## 配置本土化
本土化由 `ConfigureServices` 方法配置: 
{%codeblock lang:csharp%}
services.AddLocalization(options => options.ResourcesPath = "Resources");

services.AddMvc()
    .AddViewLocalization(LanguageViewLocationExpanderFormat.Suffix)
    .AddDataAnnotationsLocalization();
{%endcodeblock%}
- `AddLocalization`: 将本土化服务添加到服务容器，以上代码同时设置了 `ResourcesPath`。
- `AddViewLocalization`: 添加对视图文件的本土化支持，在此例中，视图本土化基于视图文件名称的后缀。例如，Index.fr.cshtml 文件中的 "fr" 以示区别。
- `AddDataAnnotationsLocalization`: 对数据注解本土化的支持，以 `IStringLocalizer` 抽象实现。

## 本土化中间件
请求的当前语言文化由本土化中间件进行设置，该中间件在 `Configure` 方法中启用。该中间件必须在任何试图检查请求语言文化数据的中间件(例如，`app.UseMvcWithDefaultRoute()`)启用之前启用。
{%codeblock lang:csharp%}
var supportedCultures = new[]
{
    new CultureInfo(enUSCulture),
    new CultureInfo("en-AU"),
    new CultureInfo("en-GB"),
    new CultureInfo("en"),
    new CultureInfo("es-ES"),
    new CultureInfo("es-MX"),
    new CultureInfo("es"),
    new CultureInfo("fr-FR"),
    new CultureInfo("fr"),
};

app.UseRequestLocalization(new RequestLocalizationOptions
{
    DefaultRequestCulture = new RequestCulture(enUSCulture),
    // Formatting numbers, dates, etc.
    SupportedCultures = supportedCultures,
    // UI strings that we have localized.
    SupportedUICultures = supportedCultures
});

app.UseStaticFiles();
// To configure external authentication, 
// see: http://go.microsoft.com/fwlink/?LinkID=532715
app.UseAuthentication();
app.UseMvcWithDefaultRoute();
{%endcodeblock%}
`UseRequestLocalization` 初始化一个 `RequestLocalizationOptions` 对象，每次有请求到达时，系统会遍历 `RequestLocalizationOptions` 中的 `RequestCultureProvider` 列表，第一个匹配请求语言文化的提供器将被应用。`RequestLocalizationOptions` 类型包含了以下默认的提供器:
1. QueryStringRequestCultureProvider
2. CookieRequestCultureProvider
3. AcceptLanguageHeaderRequestCultureProvider

默认提供器遍历列表从最具体到最抽象，后文将讨论如何改变遍历顺序抑或添加一个自定义的提供器。如果任何提供器都不能匹配请求的语言文化，那么采用 `DefaultRequestCulture`。

## QueryStringRequestCultureProvider
一些网站应用会在查询字符串中携带代表语言文化的参数，该方法易于调试和测试。默认情况下，`QueryStringRequestCultureProvider` 作为第一个本土化提供器注册到 `RequestCultureProvider` 列表，那么在查询字符串中携带 `culture` 和 `ui-culture` 参数则会被解析为对应的语言文化，例如: 
``` bash
http://localhost:500/?culture=es-MX&ui-culture=es-MX
```
> 如果只传递其中一个值，那么 `culture` 和 `ui-culture` 都将被设置为该值。

## CookieRequestCultureProvider
部署到生产环境中运行网站应用程序通常会使用 `ASP.NET Core culture cookie` 来实现本土化，使用 `MakeCookieValue` 方法创建 `cookie`。

`CookieRequestCultureProvider.DefaultCookieName` 返回默认的 `cookie` 名称，该默认值为 `.AspNetCore.Culture`。该值的格式为 `c=%LANGCODE%|uic=%LANGCODE%`，其中 `c` 代表 `culture`，`uic` 代表 `ui-culture`，例如: 
``` bash
c=en-UK|uic=en-US
```
> 如果只传递其中一个值，那么 `culture` 和 `ui-culture` 都将被设置为该值。

## Accept-Language HTTP Header
[Accept-Language header](https://www.w3.org/International/questions/qa-accept-lang-locales) 在多数浏览器中都可以修改，它最初是用来指定用户的语言，该值指示浏览器应该将何种语言包含在请求头中，该值通常继承自操作系统。从浏览器发送的请求头中检查用户的偏好语言通常不是一种可靠的办法，应用程序应该提供另一种机制允许用户设置偏好语言。

## 使用自定义提供器
假设想要将用户偏好的语言保存在数据库中，可通过编写一个自定义提供器来查询这些值，以下代码展示了如何添加一个自定义本土化提供器: 
{%codeblock lang:csharp%}
private const string enUSCulture = "en-US";

services.Configure<RequestLocalizationOptions>(options =>
{
    var supportedCultures = new[]
    {
        new CultureInfo(enUSCulture),
        new CultureInfo("fr")
    };

    options.DefaultRequestCulture = new RequestCulture(culture: enUSCulture, uiCulture: enUSCulture);
    options.SupportedCultures = supportedCultures;
    options.SupportedUICultures = supportedCultures;

    options.RequestCultureProviders.Insert(0, new CustomRequestCultureProvider(async context =>
    {
        // My custom request culture logic
        return new ProviderCultureResult("en");
    }));
});
{%endcodeblock%}
使用 `RequestLocalizationOptions` 来添加和移除本土化提供器，Insert 方法的第一个参数为索引值，该值同时决定了顺序。

## 程序化设置语言文化


# 国际化与本土化术语
即使所有的计算机以数字编码的方式存储文本，但不同的系统却使用不同的数字编码来存储相同的文本。
RFC 4646 格式提供了 `<languagecode2>-<country/regioncode2>` 格式的参考，`<languagecode2>` 为语言码，`<country/regioncode2>` 为子文化码，例如 en-US 和 en-AU 分别代表美国英语和澳大利亚英语。RFC 4646 是 ISO 639 代表语言的两位小写语言码与 ISO 3166 代表国家和地区的两位大写文化码的组合。