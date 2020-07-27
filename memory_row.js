class MemoryRow {
  static COLUMN_INDEXES() {
    return {
      URL: 1
    };
  }

  constructor(parameters) {
    if (parameters.constructor.name === 'Array') {
      for (const [key, value] of Object.entries(MemoryRow.COLUMN_INDEXES())) {
        this[key.toLowerCase()] = parameters[value - 1];
      }
    } else if (parameters.constructor.name === 'Object') {
      for (const key of Object.keys(MemoryRow.COLUMN_INDEXES())) {
        this[key.toLowerCase()] = parameters[key.toLowerCase()];
      }
    }
  }

  toArray() {
    return [this.url];
  }
}
