export interface URNGResult {
  number: Number
  release(): void
}

// Locally unique random numbers
export class UniqueRNG {
  private static numSet: Set<Number>

  constructor() {
    UniqueRNG.numSet = new Set()
  }

  public getRand(): URNGResult  {
    const number: Number = crypto.getRandomValues(new Uint32Array(1))[0];
    if (UniqueRNG.numSet.has(number)) {
      return this.getRand();
    }
    const release = () => {
      UniqueRNG.numSet.delete(number)
    }
    return {number, release}
  }
}