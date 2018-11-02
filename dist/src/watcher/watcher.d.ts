export interface FileWatcherOptions {
    directory: string;
    files: string[];
}
export declare const FileWatcherEvent: {
    REBUILD: string;
};
export declare class FileWatcher {
    private config;
    private watchEvent;
    constructor(config: FileWatcherOptions);
    start(): void;
    addListener(eventType: string, callback: (fileName: string) => void): void;
    private shouldBeIncluded;
    private eventHandler;
}
