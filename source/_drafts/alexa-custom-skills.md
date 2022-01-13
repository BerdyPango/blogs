---
title: alexa-custom-skills
date: 2018-10-20 08:33:28
description:
category:
tags:
---

## 背景

`Home Assistant` 作为家庭智能网关，可以有很多不同的接入点来调用其 API，例如 iOS 客户端，Web UI 或者是 Echo。使用 `Alexa` 作为智能语音接入点控制 HA 已经在[通过 Amazon Alexa 控制 HomeAssistant](/smarthome-control-via-alexa/)介绍了两种方法，本文将介绍第三种，也是最灵活最高级的方式 - 为 `Alexa` 开发 `Skill`。

## 前置条件
要为 `Alexa` 开发一款自定义的 `Skill`，至少需要:
- 一个[亚马逊开发者账号](https://developer.amazon.com/)，可免费注册。
- 一个能够控制各种家居设备的 API 服务，这里 HA 扮演了该角色
- 一个 `Alexa` 的载体设备，如 `Echo` 或 `Echo Dot`。
- 一个 [AWS 账号](https://aws.amazon.com/)，用以将 `Skill` 源码以 `AWS Lambda` 函数的方式寄宿。
- 熟悉 JSON
- 熟悉 Java，Node.js，C# 或 Python 至少一种语言，Lambda 函数都可以这些语言实现
- 理解 [OAuth 2.0](https://oauth.net/2/)，或参考博主的[OAuth 2.0 简介](/https://blog.frosthe.net/security-oauth2/)

## 术语前瞻
### Skill Models
创建自定义 `Skill` 之前，首先要决定该 `Skill` 要做什么，进而选择一个合适的模板作为起始点。`Alexa Skill Kit` 支持多种不同类型的 `Skill`。每种 `SKill` 包含了「交互模式(interaction model)」来决定该 `Skill` 可以处理哪种请求以及用来被触发 `Skill` 的「用户辞藻」，「自定义 `Skill` 模型」允许开发人员自定义这些内容，同时，`Alexa Skill Kit` 也提供了「预定义模型」以支持特定场景的「用户辞藻」。具体参考 [Understand the Different Skill Models](https://developer.amazon.com/docs/ask-overviews/understanding-the-different-types-of-skills.html)

### Intents
`Intents` 可解释为被 `Alexa` 理解的 `Requests`，例如，`Skill` 可以做以下事情:
- 查阅 Tide 的信息
- 预订一份披萨
- 呼叫一辆计程车
- 其他你能想象到的事情

### 用户辞藻
触发 `Intents` 的用户关键词，在交互场景种，用户说出的语句将以「Voice User Interface」翻译成 `Skill` 的 `Intents`，例如，当用户说出
- "Get high tide for Seattle"，该语句将映射 `Skill` 的 `TideRequest` Intent。
- "Order a large pepperoni pizza"，该语句将映射 `Skill` 的 `OrderPizza` Intent。

### Invocation Name
`Alexa` 用以识别 `Skill` 的名称，用户在说出请求时包含的内容，例如 `tide pooler`。

将以上所有整合到一起，当用户说出 "get high tide for Seattle from Tide Pooler"，`Alexa` 会理解该请求并发送 `TideRequest` 到 `Skill` 提供的 `Web` 服务。

### AWS Lambda Function
`AWS Lambda` 是 `AWS` 推出的一项云服务，该产品以服务的形式执行源码，而无需管理服务器。`Alexa` 的 `Skill` 要求以这种方式实现。

## 选择 Smart Home Skills 模板开始
`Smart Home SKill` 是官方预定义的 `Skill Model`，使用类似的预定义模型以牺牲灵活性换取开发效率，因为预定义模型定义了:
- `Skill` 可以处理的请求，在 `Smart Home Skills` 中被称为「设备指令」，例如:
    - turn on / turn off
    - increase / decrease temperature
    - change the dimness or brightness for a light
    - lock a door
    - change the channel on a television
    - view a live video stream from a smart home camera on Echo Show or Fire TV
- 内置的用户辞藻以触发这些请求，例如:
    - "turn off the living room lights"
    - "increase the temperature by two degrees"
    - "dim the living room lights to 20%"
    - "lock the back door"
    - "change channel to PBS"
    - "show the front door camera"

开发人员仅需定义 `Skill` 如何响应这些指令即可，例如，编写打开一盏灯的源代码当 `Skill` 接收到 "turn on the light" 指令，该源码以一个 `AWS Lambda` 函数的形式存在。

### 创建新的 Skill
- 使用 Amazon Developer 账号登录到控制台，点击 **Create Skill**
- 填写 **Skill Name**，选择 **Language**，选择 **SmartHone** 模型，点击 **Create Skill**
- 在 **Payload Version** 一栏选择 **v3**
- 复制 `Skill ID` 信息，并点击 **Save**

### 添加一个 Lambda 函数
`Skill` 的源码将会以 `AWS Lambda` 函数的形式寄宿在 `AWS`，`Alexa` 将 `Skill` 的请求发送给 `AWS Lambda` 函数，源代码从请求中获取有用的信息并发送给智能家居网关 `API` 以执行操作，完成之后再返回一条响应消息。

#### 添加 IAM 角色(Optional)
如果是第一次创建 `Lambda`，有必要创建一个 IAM(Identity and Access Management) 角色，导航到 [IAM 控制台](https://console.aws.amazon.com/iam/home?#/home)
- 点击 **Role** -> **Create Role**
- 在 **AWS service** Tab 下选择 **Lambda**
- 在搜索框中输入 `basic` 并选择 **AWSLambdaBasicExecutionRole**，点击 **Next Step**
- 输入一个名称，最后点击 **Create Role**

### 创建 Lambda 函数
- 导航到 AWS 控制台，选择左侧面板的 **Lambda**
- 右上角的区域选择 **US West**
    - N.Virginia: English(US) 或 English(CA) skills
    - EU(Ireland): English(UK), English(IN), German 或 French(FR) skills
    - US West(Oregon): Japanese 和 English(AU) skills

> 选择正确的区域可以避免延迟问题

- 点击 **Create a Lambda function**
- 选择 **Author from scratch**，输入以下信息:
    - Name: 作为该 `Lambda` 函数的可视化识别，将由控制台列出，并在执行 `ListsFunctions` API 时进行显示，必须唯一
    - Runtime: 选择适合自己的语言进行开发，此处选择 .NET Core 2.1(C#/PowerShell)
    - For Role: 选择之前创建的 **Role**
- 点击 **Create Function**，等待创建完成之后，将会自动导航到 **Configuration**
- 在 **Configuration** 页面的 **Designer** 板块，在 **Add triggers** 面板中选择 **Alexa Smart Home**，可以看到 GUI 中添加了一个触发器
- 在 **Configure triggers** 板块，填写之前粘贴的 **Skill ID** 至 **Application ID** 表单中
- 勾选 **Enable trigger**，如果不在创建时勾选，之后通过控制台将无法勾选。
- 最后，点击 **Add** -> **Save**

填写完成如下图所示:
{%asset_img 02.png 创建 Lambda Function%}

### 为 Lambda Function 添加源代码
在 `Function Code` 一栏，C# 仅支持上传 .zip 文件的方式，而 `Python`，`Node.js` 支持在线编辑器，贴入以下代码到 index.js 文件中:
```js
exports.handler = function (request, context) {
    if (request.directive.header.namespace === 'Alexa.Discovery' && request.directive.header.name === 'Discover') {
        log("DEBUG:", "Discover request",  JSON.stringify(request));
        handleDiscovery(request, context, "");
    }
    else if (request.directive.header.namespace === 'Alexa.PowerController') {
        if (request.directive.header.name === 'TurnOn' || request.directive.header.name === 'TurnOff') {
            log("DEBUG:", "TurnOn or TurnOff Request", JSON.stringify(request));
            handlePowerControl(request, context);
        }
    }

    function handleDiscovery(request, context) {
        var payload = {
            "endpoints":
            [
                {
                    "endpointId": "demo_id",
                    "manufacturerName": "Smart Device Company",
                    "friendlyName": "Bedroom Outlet",
                    "description": "Smart Device Switch",
                    "displayCategories": ["SWITCH"],
                    "cookie": {
                        "key1": "arbitrary key/value pairs for skill to reference this endpoint.",
                        "key2": "There can be multiple entries",
                        "key3": "but they should only be used for reference purposes.",
                        "key4": "This is not a suitable place to maintain current endpoint state."
                    },
                    "capabilities":
                    [
                        {
                          "type": "AlexaInterface",
                          "interface": "Alexa",
                          "version": "3"
                        },
                        {
                            "interface": "Alexa.PowerController",
                            "version": "3",
                            "type": "AlexaInterface",
                            "properties": {
                                "supported": [{
                                    "name": "powerState"
                                }],
                                 "retrievable": true
                            }
                        }
                    ]
                }
            ]
        };
        var header = request.directive.header;
        header.name = "Discover.Response";
        log("DEBUG", "Discovery Response: ", JSON.stringify({ header: header, payload: payload }));
        context.succeed({ event: { header: header, payload: payload } });
    }

    function log(message, message1, message2) {
        console.log(message + message1 + message2);
    }

    function handlePowerControl(request, context) {
        // get device ID passed in during discovery
        var requestMethod = request.directive.header.name;
        var responseHeader = request.directive.header;
        responseHeader.namespace = "Alexa";
        responseHeader.name = "Response";
        responseHeader.messageId = responseHeader.messageId + "-R";
        // get user token pass in request
        var requestToken = request.directive.endpoint.scope.token;
        var powerResult;

        if (requestMethod === "TurnOn") {

            // Make the call to your device cloud for control
            // powerResult = stubControlFunctionToYourCloud(endpointId, token, request);
            powerResult = "ON";
        }
       else if (requestMethod === "TurnOff") {
            // Make the call to your device cloud for control and check for success
            // powerResult = stubControlFunctionToYourCloud(endpointId, token, request);
            powerResult = "OFF";
        }
        var contextResult = {
            "properties": [{
                "namespace": "Alexa.PowerController",
                "name": "powerState",
                "value": powerResult,
                "timeOfSample": "2017-09-03T16:20:50.52Z", //retrieve from result.
                "uncertaintyInMilliseconds": 50
            }]
        };
        var response = {
            context: contextResult,
            event: {
                header: responseHeader,
                endpoint: {
                    scope: {
                        type: "BearerToken",
                        token: requestToken
                    },
                    endpointId: "demo_id"
                },
                payload: {}
            }
        };
        log("DEBUG", "Alexa.PowerController ", JSON.stringify(response));
        context.succeed(response);
    }
};
```
该段源码为实现 Smart Home Skill 提供了一个起始点，其中包含了响应发现及设备控制的基础结构，可以添加代码来响应 `ReportState` 指令及指定设备类型的具体类型，更多示例代码可在 [GitHub repository for Alexa smart home](https://github.com/alexa/alexa-smarthome) 仓库找到。

### 完成配置并测试 Lambda 函数
1. 点击 **Save**
2. 如果希望立即对新建的 Function 进行测试，点击上方的 **Test** 按钮，一个 **Configure test event** 窗口将会弹出
3. 勾选 **Create new test event**，**Event template** 保持默认的 **Hello World** 选项，在 **Event name** 中输入 `discovery` 并使用以下 JSON 替换编辑器中的内容:
```json
{
    "directive": {
        "header": {
            "namespace": "Alexa.Discovery",
            "name": "Discover",
            "payloadVersion": "3",
            "messageId": "1bd5d003-31b9-476f-ad03-71d471922820"
        },
        "payload": {
            "scope": {
                "type": "BearerToken",
                "token": "access-token-from-skill"
            }
        }
    }
}
```
{%asset_img 03.png 配置测试事件%}
4. 点击 **Create** -> **Test**，如果成功，**Execution Result** 将会产生如下的输出:
```json
{
  "event": {
    "header": {
      "correlationToken": "12345692749237492",
      "messageId": "1bd5d003-31b9-476f-ad03-71d471922820",
      "name": "Discover.Response",
      "namespace": "Alexa.Discovery",
      "payloadVersion": "3"
    },
    "payload": {
      "endpoints": [
        {
          "endpointId": "demo_id",
          "manufacturerName": "Smart Device Company",
          "friendlyName": "Bedroom Outlet",
          "description": "Smart Device Switch",
          "displayCategories": ["SWITCH"],
          "cookie": {
            "key1": "arbitrary key/value pairs for skill to reference this endpoint.",
            "key2": "There can be multiple entries",
            "key3": "but they should only be used for reference purposes.",
            "key4": "This is not a suitable place to maintain current endpoint state."
          },
          "capabilities": [
            {
              "type": "AlexaInterface",
              "interface": "Alexa",
              "version": "3"
            },
            {
              "interface": "Alexa.PowerController",
              "version": "3",
              "type": "AlexaInterface",
              "properties": {
                "supported": [
                  {
                    "name": "powerState"
                  }
                ],
                "retrievable": true
              }
            }
          ]
        }
      ]
    }
  }
}
```

### 配置 Smart Home Service 接入点
必须在 Skill 的 Developer 控制中为 Lambda 函数提供 **ARN(Amazon Resource Name)**
1. 导航到 Developer 控制台的 Skill
2. 在 **2. Smart Home service endpoint** 的 **Default endpoint** 表单中填入 Lambda Function 对应的 ARN
3. 如果 Skill 仅支持一个地区，则在对应的区域填入与 **Default enpoint** 一样的值。

{%asset_img 04.png 配置 Default enpoint%}

### 提供账号链接信息
在 Section **3.Account Linking** 中，Amazon 要求 Skill 必须将用户身份与智能网关进行链接，该行为称为 Account Linking，其目的是为了在 Alexa 用户和智能网关之间建立关系。

1. 用户在 Alexa app 中**启用** Skill 时，将会触发 **Account Linking** 流程
2. App 显示一个智能家居网关的 Login 页面
3. 用户提供其凭证
4. 用户在 Alexa App 中被导航至 Success 页面
5. 用户开始寻找智能设备，一旦该过程完成，Skill 就可以使用了

**Account Linking** 完成以后，Alexa 将存储 access token 以识别用户，该 token 将被包含在所有向 Skill 发出的请求中，因此，当用户向 Skill 发出请求时 Skill 便可访问用户的在第三方系统中的信息。

可惜 Amazon 必须要提供 Authentication Provider 提供的 SSL 证书在其信任列表之列，并且 Let's Encrypt 被排除在外了。