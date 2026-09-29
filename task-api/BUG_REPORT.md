# Bug Report

## Bug: Incorrect Pagination Offset

### Location

`src/services/taskService.js`

### Problem

The pagination logic originally calculated the offset as:

```js
const offset = (page - 1) * limit;
```
