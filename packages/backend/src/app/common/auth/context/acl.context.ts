import { Injectable } from "@nestjs/common";
import { AsyncLocalStorage } from "async_hooks";

@Injectable()
export class AclContext {
    private readonly asyncLocalStorage = new AsyncLocalStorage<{
        skipAcl: boolean;
    }>();

    run<T>(skipAcl: boolean, fn: () => Promise<T>): Promise<T> {
        return this.asyncLocalStorage.run({ skipAcl }, fn);
    }

    shouldSkipAcl(): boolean {
        return this.asyncLocalStorage.getStore()?.skipAcl ?? false;
    }
}
