import { Injectable } from "@nestjs/common";

@Injectable()
export class ObjectHelper {
    static deepMergeObjects(target: any, source: any): any {
        if (source && typeof source === "object" && !Array.isArray(source)) {
            Object.keys(source).forEach((key) => {
                if (
                    source[key] &&
                    typeof source[key] === "object" &&
                    !Array.isArray(source[key])
                ) {
                    if (!target[key]) target[key] = {};
                    this.deepMergeObjects(target[key], source[key]);
                } else if (Array.isArray(source[key])) {
                    target[key] = target[key] || [];
                    target[key] = target[key].concat(source[key]);
                } else {
                    target[key] = source[key];
                }
            });
        }
        return target;
    }
}
