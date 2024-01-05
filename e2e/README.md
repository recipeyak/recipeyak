# e2e

> some playwright tests that screenshot snapshot various pages

## usage

```shell
npx playwright codegen

npx playwright test

npx playwright test --debug
# or limit to a select test
npx playwright test --project=webkit --debug page-recipe-detail.spec.ts:93:5

npx playwright show-report

npx playwright test --update-snapshots
```
