---
description: Where to find the OpenAPI documentation
---

# Swagger (OpenAPI)

Our backend has a Swagger instance attached, which you can view by going to `your-api-link.com/docs`, for example: `http://localhost:3000/docs`.

## Updating the Swagger docs

The Swagger docs is not auto-generated once the API is launched. Instead, you have to trigger it when you made a change that you want to be visible.

To update the Swagger docs generation, use the following command:

```
nx run backend:metadata
```

This updates the `metadata.ts` file under `packages/backend/src`, which contains the Swagger docs data.
