/* eslint-disable @typescript-eslint/no-explicit-any */
type PlainObject = {
  [key: string]: any;
};

const objectUtils = {
  areArraysEqual(arr1: any[], arr2: any[]): boolean {
    return (
      arr1.length === arr2.length &&
      arr1.every((item, index) => item === arr2[index])
    );
  },

  isEqual(obj1: PlainObject, obj2: PlainObject): boolean {
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
        typeof val1 === 'object' &&
        typeof val2 === 'object'
      ) {
        return this.isEqual(val1, val2);
      }

      return val1 === val2;
    });
  },

  countDifferingProperties(
    obj1: PlainObject,
    obj2: PlainObject,
    options: { ignoreKeys?: string[] } = { ignoreKeys: [] }
  ): number {
    const obj1Keys = Object.keys(obj1);
    const obj2Keys = Object.keys(obj2);

    // Check if both objects have the same number of keys
    if (obj1Keys.length !== obj2Keys.length) {
      throw new Error(
        '[objectUtils#countDifferingProperties] Objects do not have the same number of properties'
      );
    }

    let differenceCount = 0;

    obj1Keys.forEach((key) => {
      if (options.ignoreKeys?.includes(key)) {
        return;
      }

      const val1 = obj1[key];
      const val2 = obj2[key];

      // Check if both values are arrays and compare them
      if (Array.isArray(val1) && Array.isArray(val2)) {
        if (!this.areArraysEqual(val1, val2)) {
          differenceCount++;
        }
      }
      // Check if values are objects, if so, recursively call isEqual
      // Assuming that nested objects have the same structure
      else if (
        val1 &&
        val2 &&
        typeof val1 === 'object' &&
        typeof val2 === 'object'
      ) {
        differenceCount += this.countDifferingProperties(val1, val2);
      }
      // Check individual values for equality
      else if (val1 !== val2) {
        // Check individual values for equality
        console.log('old updatedAt: ', obj1['updatedAt']);
        console.log('new updatedAt: ', obj2['updatedAt']);
        console.log('old firstName: ', obj1['firstName']);
        console.log('new firstName: ', obj2['firstName']);
        console.log(
          val1,
          val2,
          obj1['firstName'],
          obj2['firstName'],
          key,
          val1 === val2
        );
        differenceCount++;
      }
    });

    return differenceCount;
  },
};

export default objectUtils;
