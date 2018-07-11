import { AxiosInstance, AxiosResponse, AxiosError } from "axios";

import { Response, Request, FingerPrintGenerator } from "./interfaces";

export class WeareshoAnalytics {
    protected generateFingerPrint: FingerPrintGenerator;

    private axios: AxiosInstance;
    private fingerPrint: {
        token: string;
        components: Array<{ key: string; value: string }>;
    };

    constructor(axiosInstance: AxiosInstance, generateFingerPrint: FingerPrintGenerator) {
        this.axios = axiosInstance;

        this.generateFingerPrint = generateFingerPrint;
    }

    public init = async (): Promise<AxiosResponse> => {
        this.fingerPrint = await this.generateFingerPrint();

        this.axios.defaults.headers["X-Bobra-Identifier"] = this.fingerPrint.token;

        const response: Response.AplicationInfo = await this.axios.get("/");

        console.info(`${response.data.name}: ${response.data.version}`);
        return this.registerFingerPrint();
    }

    public action = (id: string | number): Promise<AxiosResponse> => {
        return this.axios.put("/action", undefined, {
            params: { id }
        });
    }

    public input = (field: string, values: Array<string>): Promise<AxiosResponse> => {
        return this.axios.put("/input", { values }, {
            params: { field }
        });
    }

    public user = (id: number): Promise<AxiosResponse> => {
        return this.axios.put("/user", undefined, {
            params: { id }
        });
    }

    public handler = (action: (...args) => Promise<AxiosResponse>, ...args) => (): Promise<AxiosResponse> => {
        return action(...args);
    }

    private registerFingerPrint = (): Promise<AxiosResponse> => {
        const Body: Request.RegisterFingerPrint = {};

        this.fingerPrint.components.forEach(({ key, value }) => {
            Body[key] = value;
        });

        return this.axios.put<void>("/fingerPrint", Body);
    }
}
