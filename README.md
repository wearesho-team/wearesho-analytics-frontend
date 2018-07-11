# Wearesho Analytics Frontend

## Usage

### Setup

Create instance of WeareshoAnalytics with following params:

```ts
const axiosInstance = Axios.create({baseURL: "https://wearesho.public.api.com/"});
const fingerPrintGenerator = (): Promise<{token: string, components: Array<{key: string; value: string}>}> => {
    // some code
    return result;
};
const analytics = new WeaareshoAnalytics(axiosInstance, fingerPrintGenerator, onError: (message: string) => console.error(message));
```
where
- `axiosInstance` - instance of [Axios](https://github.com/axios/axios). Required.
- `fingerPrintGenerator` - function that generate fingerPrint. Required.
- `onError` - callback that calls on any request error. Optional.

then initialize:

```ts
analytics.init();
```

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
