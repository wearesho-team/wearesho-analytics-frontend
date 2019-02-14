import { AxiosInstance, AxiosResponse } from "axios";

export namespace Response {
    export type AplicationInfo = AxiosResponse<{
        readonly name: string;
        readonly version: string;
    }>;
}

export namespace Request {
    export interface RegisterFingerPrint {
        [key: string]: string;
    }
}

export interface FingerPrintComponents {
    resolution: string;
    timezone_offset: number;
    [K: string]: any;
}

export type FingerPrintGenerator = () => Promise<{
    token: string;
    components: FingerPrintComponents;
}>;

export class WeareshoAnalytics {
    protected generateFingerPrint: FingerPrintGenerator;

    private axios: AxiosInstance;
    private fingerPrint: {
        token: string;
        components: FingerPrintComponents;
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

    public action = (id: string | number): Promise<AxiosResponse<undefined>> => {
        return this.axios.put<undefined>("/action", undefined, {
            params: { id }
        });
    }

    public input = (
        field: string,
        values: Array<string | { value: string, createdAt?: string }>
    ): Promise<AxiosResponse<undefined>> => {
        return this.axios.put<undefined>("/input", {
            values: values.map((value) => typeof value === "string" ? { value } : value),
        }, {
            params: { field }
        });
    }

    public user = (id: number): Promise<AxiosResponse<undefined>> => {
        return this.axios.put<undefined>("/user", undefined, {
            params: { id }
        });
    }

    public handler = (action: (...args) => Promise<AxiosResponse>, ...args) => (): Promise<AxiosResponse> => {
        return action(...args);
    }

    private registerFingerPrint = (): Promise<AxiosResponse<undefined>> => {
        return this.axios.put<undefined>("/fingerPrint", this.fingerPrint.components);
    }
}
