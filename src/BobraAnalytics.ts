import { AxiosInstance, AxiosError, AxiosResponse } from "axios";

import { Fingerprint, FingerprintFallback, fingerprintGenerator } from "./fingerprintGenerator";

export interface ActionConfig {
    [key: string]: string | number | boolean | ActionConfig;
}

export interface BobraAnalyticsInterface<TActionConfig> {
    sendActionHandler: (type: string, config: TActionConfig) => () => Promise<AxiosResponse<void>>;
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
            if (!error.response || !error.response.data) {
                throw error;
            }

            if (error.response.status === 400 && error.response.data.code === ERROR_CODE_UNKNOWN) {
                return this.sendFingerprint();
            }

            throw error;
        });
    }

    public init = async (fingerprintFallback?: FingerprintFallback): Promise<AxiosResponse<void>> | never => {
        if (document.readyState.toLowerCase() === "loading") {
            throw new Error("Preventing initialize BobraAnalytics before page ready");
        }

        this.fingerprint = await fingerprintGenerator(BobraAnalytics.fingerprintCacheKey, fingerprintFallback);

        this.axios.defaults.headers["X-Bobra-Identifier"] = this.fingerprint.token;

        this.initPage();
        return this.sendFingerprint().then(this.watch);
    }

    public sendActionHandler = (type: string, config: TActionConfig) => (): Promise<AxiosResponse<void>> => {
        return this.axios.post(`/analytics/action?type=${type}`, config);
    }

    private sendView = (): Promise<AxiosResponse<void>> => {
        return this.axios.get(`/analytics/page-view?at=${this.timestamp}`);
    }

    private sendFingerprint = (): Promise<AxiosResponse<void>> => {
        return this.axios.post("/analytics/finger-print", this.fingerprint.components);
    }

    private watch = (): Promise<AxiosResponse<void>> => {
        location.pathname !== this.currentLocation && this.initPage();

        return this.sendView().then((result) => {
            clearTimeout(this.timeoutId);
            this.timeoutId = setTimeout(this.watch, this.sendViewDelay);
            return result;
        });
    }

    private initPage = (): void => {
        this.timestamp = Date.now();
        this.currentLocation = location.pathname;
    }
}
