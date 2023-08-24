type PartialClass<T> = {
  [P in keyof T]?: T[P];
};

function PartialType<T extends new (...args: any[]) => any>(BaseClass: T) {
  return class extends BaseClass {
    constructor(...data: any[]) {
      super(data);
    }
  };
}
