export interface IURNGResult {
  num: number
  release(): void
}

// Locally unique random numbers
export class UniqueRNG {
  private numSet: Set<number>

  constructor() {
    this.numSet = new Set()
  }

  public getRand(): IURNGResult {
    const num: number = crypto.getRandomValues(new Uint32Array(1))[0]
    if (this.numSet.has(num)) {
      return this.getRand()
    }
    const release = () => {
      this.numSet.delete(num)
    }
    return { num, release }
  }
}