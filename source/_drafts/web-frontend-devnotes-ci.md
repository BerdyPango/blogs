---
title: Web Front-end Notes - CI/CD Practice(TBD)
date: 2021-11-29 16:21:58
description: Notes of Practice using Gitlab CI
category:
    - WebFrontend
tags:
    - javascript
    - engineering
---

## Budge Setup

### Pipeline status

TBD


___
## Gitlab CI

### Variable

Define a variable:

```yaml
variables:
  EXAMPLE_VARIABLE: "This is a variable avalue"
```

Use a variable:

```yaml
script: 
    - echo $EXAMPLE_VARIABLE
```

Use variables in string interpolation:

```yaml
script: 
    - echo "variable interpolation ${EXAMPLE_VARIABLE}"
```

## Test coverage

### Setting project test coverage parsing

At Gitlab Git repo, go to **Settings** => **CI/CD** => **General Pipelines** section, fill the regular expressions for code coverage of the language. Find examples at [Test coverage examples](https://docs.gitlab.com/ee/ci/pipelines/settings.html#test-coverage-examples).


### Extract coverage data from Gitlab CI job

Gitlab extract code coverage from job output. Use `coverage` keyword with a custom regular expression to configure how code coverage is extracted from the job output.

```yaml
job1:
  script: rspec
  coverage: '/Code coverage: \d+\.\d+/'
```


Collect coverage data

Gitlab CI supports `.cobertura` XML.


Visualize Code Coverage:

- Visual Studio extension: [Fine Code Coverage](https://marketplace.visualstudio.com/items?itemName=FortuneNgwenya.FineCodeCoverage).

Add Gitlab badge for code coverage:


___
## Misc

- `Allow_failure`: `true` let the pipeline run not taking the job for success measurement.
- `$GITLAB_USER_NAME` variable can be utilized to check who did trigger the pipeline run. One use case to decide whether the triggerer is a human user or a CI bot.
