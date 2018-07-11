import { AxiosResponse } from "axios";

export namespace Response {
    export type AplicationInfo = AxiosResponse<{
        readonly name: string;
        readonly version: string;
    }>;
}

export namespace Request {
    export interface RegisterFingerPrint {
        [key: string]: string;
    };
}

export type FingerPrintGenerator = () => Promise<{
    token: string;
    components: Array<{ key: string; value: string }>;
}>;
