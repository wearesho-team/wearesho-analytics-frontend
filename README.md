## Bobra Analytics Frontend

#### Setup

After page load, create instance of BobraAnalytics with following params:

```ts
/*
    viewDelay - frequency of sending info about page view, ms
    fingerprintFallback - called when fingerprint does not supported by browser
*/
constructor(viewDelay: number = 5000, fingerprintFallback?: (error: string) => void)
```

```ts
const analytics = new BobraAnalytics(1000, (error) => console.info("Fingerprint does not supports (" + error + ")"));
```

After that, analytics will be collecting automatically

### Action

To send user action, export BobraAnalytics instance globaly, and 

```ts
analytics.sendActionHandler("submit.click")();
```
