type PlainObject = {
  [key: string]: any;
};

const objectUtils = {
  areArraysEqual(arr1: any[], arr2: any[]): boolean {
    return (
      arr1.length === arr2.length &&
      arr1.every((item, index) => {
        if (
          item &&
          arr2[index] &&
          typeof item === 'object' &&
          typeof arr2[index] === 'object'
        ) {
          return this.isEqual(item, arr2[index]);
        } else {
          return item === arr2[index];
        }
      })
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

        differenceCount++;
      }
    });

    return differenceCount;
  },

  isNotEmptyObject(obj: PlainObject) {
    return Object.keys(obj).length > 0;
  },

  deepMergeObjects(target: PlainObject, source: PlainObject): PlainObject {
    if (source && typeof source === 'object' && !Array.isArray(source)) {
      Object.keys(source).forEach((key) => {
        if (
          source[key] &&
          typeof source[key] === 'object' &&
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
  },
};

export default objectUtils;
