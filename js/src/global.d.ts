declare class Runtime implements Runtime {
  public importObject: WebAssembly.Imports
  public run(instance: WebAssembly.Instance): Promise<any>
}