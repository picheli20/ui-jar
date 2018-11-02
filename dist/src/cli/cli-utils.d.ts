export interface CliArgs {
    directory?: string;
    includes?: RegExp[];
    excludes?: RegExp[];
    config?: string[];
    urlPrefix?: string;
    watch?: boolean;
}
export declare function parseCliArguments(args: string[]): CliArgs;
