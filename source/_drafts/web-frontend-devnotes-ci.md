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

### Test coverage

TBD

___
## Misc

- `Allow_failure`: `true` let the pipeline run not taking the job for success measurement.
- `$GITLAB_USER_NAME` variable can be utilized to check who did trigger the pipeline run. One use case to decide whether the triggerer is a human user or a CI bot.
- Use `${VARIABLE}` format instead of `$VARIABLE` in string interpolation
