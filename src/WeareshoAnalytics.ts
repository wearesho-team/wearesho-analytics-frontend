import { AxiosInstance, AxiosResponse, AxiosError } from "axios";

import { Response, Request, FingerPrintGenerator } from "./interfaces";

export class WeareshoAnalytics {
    protected onError?: (message: string) => void;
    protected generateFingerPrint: FingerPrintGenerator;

    private axios: AxiosInstance;
    private fingerPrint: {
        token: string;
        components: Array<{ key: string; value: string }>;
    };

    constructor(
        axiosInstance: AxiosInstance,
        generateFingerPrint: FingerPrintGenerator,
        onError?: (message: string) => void
    ) {
        this.axios = axiosInstance;

        this.onError = onError;

        this.generateFingerPrint = generateFingerPrint;
    }

    public init = async (): Promise<void> => {
        this.fingerPrint = await this.generateFingerPrint();

        this.axios.defaults.headers["X-Bobra-Identifier"] = this.fingerPrint.token;

        let response: Response.AplicationInfo;
        try {
            response = await this.axios.get("/");
        } catch (error) {
            return this.onError
                ? this.onError((error as AxiosError).message)
                : console.error(this.errorMessage(`Server is unavailable`, error));
        }

        console.info(`${response.data.name}: ${response.data.version}`);
        return this.registerFingerPrint();
    }

    public action = async (id: string | number): Promise<void> => {
        try {
            await this.axios.put("/action", undefined, {
                params: { id }
            });
        } catch (error) {
            return this.onError
                ? this.onError((error as AxiosError).message)
                : console.error(this.errorMessage(`Action "${id}"`, error));
        }
    }

    public input = async (field: string, values: Array<string>): Promise<void> => {
        try {
            await this.axios.put("/input", { values }, {
                params: { field }
            });
        } catch (error) {
            return this.onError
                ? this.onError((error as AxiosError).message)
                : console.error(this.errorMessage(`Input "${field}"`, error));
        }
    }

    public user = async (id: number): Promise<void> => {
        try {
            await this.axios.put("/user", undefined, {
                params: { id }
            });
        } catch (error) {
            return this.onError
                ? this.onError((error as AxiosError).message)
                : console.error(this.errorMessage(`User "${id}"`, error));
        }
    }

    public handler = (action: (...args) => Promise<void>, ...args) => (): Promise<void> => {
        return action(...args);
    }

    private registerFingerPrint = async (): Promise<void> => {
        const Body: Request.RegisterFingerPrint = {};

        this.fingerPrint.components.forEach(({ key, value }) => {
            Body[key] = value;
        });

        try {
            await this.axios.put<void>("/fingerPrint", Body);
        } catch (error) {
            return this.onError
                ? this.onError((error as AxiosError).message)
                : console.error(this.errorMessage("Registering fingerPrint", error));
        }
    }

    private errorMessage = (messagePrefix: string, error: AxiosError): string => {
        return `${messagePrefix} was failed with message "${error.message}"`;
    }
}
