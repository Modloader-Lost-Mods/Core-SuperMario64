import IMemory from 'modloader64_api/IMemory';
import { FlagManager } from 'modloader64_api/FlagManager';

export * from './Bitmaps';
export * from './Enums';
export * from './ICommandBuffer';
export * from './Interfaces';

export class BaseObj {
  protected emulator: IMemory;

  constructor(emu: IMemory) {
    this.emulator = emu;
  }

  toJSON() {
    const proto = Object.getPrototypeOf(this);
    const jsonObj: any = Object.assign({}, this);

    Object.entries(Object.getOwnPropertyDescriptors(proto))
      .filter(([key, descriptor]) => typeof descriptor.get === 'function')
      .map(([key, descriptor]) => {
        if (descriptor && key[0] !== '_') {
          try {
            const val = (this as any)[key];
            jsonObj[key] = val;
          } catch (error) {
            console.error(`Error calling getter ${key}`, error);
          }
        }
      });

    return jsonObj;
  }
}

export class BufferObj extends BaseObj {
  private manager: FlagManager;
  private instance: number;
  private length: number;

  constructor(emu: IMemory, instance: number, length: number) {
    super(emu);
    this.manager = new FlagManager(emu, instance);
    this.instance = instance;
    this.length = length;
  }

  get_all(): Buffer {
    return this.emulator.rdramReadBuffer(this.instance, this.length);
  }
  set_all(value: Buffer) {
    this.emulator.rdramWriteBuffer(this.instance, value);
  }
  get_bit(flag: number): boolean {
    return this.manager.isBitSet(flag);
  }
  set_bit(flag: number, value: boolean) {
    this.manager.setBit(flag, value);
  }
  get(offset: number): number {
    return this.emulator.rdramRead8(this.instance + offset);
  }
  set(offset: number, value: number) {
    this.emulator.rdramWrite8(this.instance + offset, value);
  }
}
