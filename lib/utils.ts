export function deepMergeKey(original: any, ingoreArray: boolean, ...objects: any[]): any {
  if (Array.isArray(original) || typeof original !== 'object') return original;

  const isObject = (v: any) => typeof v === 'object' || typeof v === 'function';

  const merge = (target: any, obj: any) => {
    Object.keys(obj)
      .filter(key => key !== '__proto__' && Object.prototype.hasOwnProperty.call(obj, key))
      .forEach(key => {
        const oldValue = obj[key];
        const newValue = target[key];
        if (!ingoreArray && Array.isArray(newValue)) {
          target[key] = [...newValue, ...oldValue];
        } else if (oldValue != null && isObject(oldValue) && newValue != null && isObject(newValue)) {
          target[key] = merge(newValue, oldValue);
        } else {
          target[key] = oldValue;
        }
      });
    return target;
  };

  objects.filter(v => isObject(v)).forEach(v => merge(original, v));

  return original;
}
