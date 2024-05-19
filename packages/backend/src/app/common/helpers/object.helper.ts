/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from "@nestjs/common";

type PlainObject = {
    [key: string]: any;
};

@Injectable()
export class ObjectHelper {
    static deepMergeObjects(
        target: PlainObject,
        source: PlainObject
    ): PlainObject {
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

    static areArraysEqual(arr1: any[], arr2: any[]): boolean {
        return (
            arr1.length === arr2.length &&
            arr1.every((item, index) => item === arr2[index])
        );
    }

    static isEqual(obj1: PlainObject, obj2: PlainObject): boolean {
        const obj1Keys = Object.keys(obj1);
        const obj2Keys = Object.keys(obj2);

        // Check if both objects have the same number of keys
        if (obj1Keys.length !== obj2Keys.length) {
            return false;
        }

        return obj1Keys.every((key) => {
            const val1 = obj1[key];
            const val2 = obj2[key];

            // Check if both values are arrays and compare them
            if (Array.isArray(val1) && Array.isArray(val2)) {
                this.areArraysEqual(val1, val2);
            }

            // Check if values are objects, if so, recursively call isEqual
            // Note: This only checks for pure objects. Functions and special objects are not supported
            if (
                val1 &&
                val2 &&
                typeof val1 === "object" &&
                typeof val2 === "object"
            ) {
                return this.isEqual(val1, val2);
            }

            return val1 === val2;
        });
    }
}
