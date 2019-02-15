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

export interface FingerPrint {
    token: string;
    components: FingerPrintComponents;
}

export class Service {

    public static create(axios: AxiosInstance, fingerPrint: FingerPrint): Promise<Service> {
        return (new Service(axios, fingerPrint)).init();
    }

    private axios: AxiosInstance;
    private fingerPrint: {
        token: string;
        components: FingerPrintComponents;
    };

    private constructor(axiosInstance: AxiosInstance, fingerPrint: FingerPrint) {
        this.axios = axiosInstance;
        this.fingerPrint = fingerPrint;
    }

    public init = async (): Promise<Service> => {
        this.axios.defaults.headers["X-Bobra-Identifier"] = this.fingerPrint.token;

        const response: Response.AplicationInfo = await this.axios.get("/");
        if (!response.data.version.match(/^1\.\d+\.\d+$/)) {
            throw new Error(`Version ${response.data.version} is not supported by current package version`);
        }

        console.info(`${response.data.name}: ${response.data.version}`);

        await this.registerFingerPrint();

        return this;
    };

    public action = (id: string | number): Promise<AxiosResponse<undefined>> => {
        return this.axios.put<undefined>("/action", undefined, {
            params: { id }
        });
    };

    public input = (
        field: string,
        values: Array<string | { value: string, createdAt?: string }>
    ): Promise<AxiosResponse<undefined>> => {
        return this.axios.put<undefined>("/input", {
            values: values.map((value) => typeof value === "string" ? { value } : value),
        }, {
            params: { field }
        });
    };

    public user = (id: number): Promise<AxiosResponse<undefined>> => {
        return this.axios.put<undefined>("/user", undefined, {
            params: { id }
        });
    };

    public handler = (action: (...args) => Promise<AxiosResponse>, ...args) => (): Promise<AxiosResponse> => {
        return action(...args);
    };

    private registerFingerPrint = (): Promise<AxiosResponse<undefined>> => {
        return this.axios.put<undefined>("/fingerPrint", this.fingerPrint.components);
    }
}
