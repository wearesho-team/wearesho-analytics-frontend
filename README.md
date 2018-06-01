## Bobra Analytics Frontend

#### Setup

Create instance of BobraAnalytics with following params:

```ts
/*
    viewDelay - frequency of sending info about page view, ms
    axiosInstance - instance of Axios (https://github.com/axios/axios)
*/
constructor(axiosInstance: AxiosInstance, viewDelay: number = 5000)
```

then initialize:

```ts
/*
    fingerprintFallback - called when fingerprint does not supported by browser
*/
const analytics = new BobraAnalytics(axios, 1000);
document.addEventListener("DOMContentLoaded", () => {
    const fingerprintFallback = (error) => console.info("Fingerprint does not supports (" + error + ")");
    analytics.init(fingerprintFallback);
});
```

##### NOTE: If you try to initialize BobraAnalytics when document.readyState === "loading", error will be thrown

After that, analytics will be collecting automatically

### Action

To send user action, export BobraAnalytics instance globaly, and 

```ts
const config = {
    button: true,
    buttonType: "submit"
};
analytics.sendActionHandler("event", config)();
```

### Generic

If you want specify config for action event, pass it to generic arguments on instantiating

```ts
interface ActionConfig {
    button: boolean;
    buttonType: string;
    dataCollection: Array<string>;
}

const analytics = new BobraAnalytics<ActionConfig>(axios, 1000);
// ...
const config = {
    button: true,
    buttonType: "submit",
    dataCollection: ["some", "data", "collection"]
};
analytics.sendActionHandler("event", config)();
```
