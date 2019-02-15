# Wearesho Analytics

## Installation

```bash
npm i --save @wearesho/analytics
```

## Usage

### Setup

Create instance of [WeareshoAnalytics.Service](./src/Service.ts) with following params:

```typescript
import * as WeareshoAnalytics from "@wearesho/analytics";

const axiosInstance = Axios.create({baseURL: "https://wearesho.public.api.com/"});

const token = ""; // your way to receive unique fingerprint value
const components = {
    resolution: "1920,1080",
    offset: 3,
    // ... other key/value pairs
};

const fingerPrint: FingerPrint = { token, components }

const analytics = await WeareshoAnalytics.Service.create(axiosInstance, fingerPrint);
```
where
- `axiosInstance` - instance of [Axios](https://github.com/axios/axios). Required.
- `fingerPrint` - fingerprint data. Required.

### Actions

```ts
analytics.action("some unique action name");
```

```ts
analytics.input("fieldName", ["valuePrev", "valueNext"]);
```

```ts
analytics.user(1 /* UserId */);
```

### Helpers

```tsx
const actionHandler = analytics.handler(analytics.action, "some unique action name");
const inputHandler = analytics.handler(analytics.input, "fieldName", ["valuePrev", "valueNext"]);
const userHandler = analytics.handler(analytics.input, 1);

<button onClick={actionHandler}/>
<button onClick={inputHandler}/>
<button onClick={userHandler}/>
```
