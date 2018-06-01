import Fingerprint2 from "fingerprintjs2";
import Axios, { AxiosInstance } from "axios";

export interface BobraAnalyticsInterface {
    sendActionHandler: (type: string) => () => Promise<void>;
}

export class BobraAnalytics implements BobraAnalyticsInterface {
    private timeoutId: any;
    private timestamp: number;
    private fingerprint: string;
    private axios: AxiosInstance;
    private sendViewDelay: number;
    private currentLocation: string;

    constructor(viewDelay: number = 5000, fingerprintFallback?: (error: string) => void) {
        try {
            (new Fingerprint2()).get((result) => {
                this.fingerprint = result;
            });
        } catch (error) {
            fingerprintFallback && fingerprintFallback(error);
            this.fingerprint = btoa((new Date()).toISOString());
        }

        this.axios = Axios.create({});

        this.sendViewDelay = viewDelay;
        this.sendFingerprint();
    }

    public sendActionHandler = (type: string) => async (): Promise<void> => {
        // await this.axios.get(`/action?type=${type}`);
    }

    private sendView = async (): Promise<void> => {
        // await this.axios.get(`/pageView?at=${this.timestamp}`);
    }

    private sendFingerprint = async (): Promise<void> => {
        this.initPage();

        // await this.axios.get("/fingerprint");

        this.watch();
    }

    private watch = async (): Promise<void> => {
        location.pathname !== this.currentLocation && this.initPage();

        await this.sendView();
        clearTimeout(this.timeoutId);
        this.timeoutId = setTimeout(this.watch, this.sendViewDelay);
    }

    private initPage = () => {
        this.timestamp = Date.now();
        this.currentLocation = location.pathname;
    }
}
