---
title: Web Front-end Development Notes - Engineering
date: 2021-11-29 10:56:49
description: Notes of HTML5/CCS3
category:
    - Engineering
tags:
    - gitlab
    - ci/cd
    - engineering
---

## Setup budges

### Pipeline status

TBD

### Test coverage

TBD

## Notes

- `Allow_failure`: `true` let the pipeline run not taking the job for success measurement.
- `$GITLAB_USER_NAME` variable can be utilized to check who did trigger the pipeline run. One use case to decide whether the triggerer is a human user or a CI bot.
- Use `${VARIABLE}` format instead of `$VARIABLE` in string interpolation
