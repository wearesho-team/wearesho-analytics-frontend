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
