import { AxiosInstance, AxiosError } from "axios";

import { Fingerprint, FingerprintFallback, fingerprintGenerator } from "./fingerprintGenerator";

export interface ActionConfig {
    [key: string]: string | number | boolean | ActionConfig;
}

export interface BobraAnalyticsInterface<TActionConfig> {
    sendActionHandler: (type: string, config: TActionConfig) => () => Promise<void>;
    init: (fingerprintFallback?: (error: string) => void) => void | never;
}

const ERROR_CODE_MISSING = 18001;
const ERROR_CODE_INVALID = 18002;
const ERROR_CODE_UNKNOWN = 18003;

export class BobraAnalytics<TActionConfig = ActionConfig> implements BobraAnalyticsInterface<TActionConfig> {
    public static readonly fingerprintCacheKey = "BobraAnalytics.fingerprint";

    private timeoutId: any;
    private timestamp: number;
    private axios: AxiosInstance;
    private sendViewDelay: number;
    private currentLocation: string;
    private fingerprint: Fingerprint;

    constructor(axiosInstance: AxiosInstance, viewDelay: number = 5000) {
        this.axios = axiosInstance;
        this.sendViewDelay = viewDelay;

        this.axios.interceptors.response.use(undefined, (error: AxiosError) => {
            if (!error.response || !error.response.status) {
                throw error;
            }

            if (error.response.status === ERROR_CODE_UNKNOWN) {
                return this.sendFingerprint();
            }

            throw error;
        });
    }

    public init = (fingerprintFallback?: FingerprintFallback): void | never => {
        if (document.readyState.toLowerCase() === "loading") {
            throw new Error("Preventing initialize BobraAnalytics before page ready");
        }

        this.fingerprint = fingerprintGenerator(BobraAnalytics.fingerprintCacheKey, fingerprintFallback);

        this.axios.defaults.headers["X-Bobra-Identifier"] = this.fingerprint.token;

        this.initPage();
        this.sendFingerprint();
        this.watch();
    }

    public sendActionHandler = (type: string, config: TActionConfig) => async (): Promise<void> => {
        await this.axios.post(`/action?type=${type}`, config);
    }

    private sendView = async (): Promise<void> => {
        await this.axios.get(`/pageView?at=${this.timestamp}`);
    }

    private sendFingerprint = async (): Promise<void> => {
        await this.axios.post("/fingerPrint", this.fingerprint.components);
    }

    private watch = async (): Promise<void> => {
        location.pathname !== this.currentLocation && this.initPage();

        await this.sendView();
        clearTimeout(this.timeoutId);
        this.timeoutId = setTimeout(this.watch, this.sendViewDelay);
    }

    private initPage = (): void => {
        this.timestamp = Date.now();
        this.currentLocation = location.pathname;
    }
}
