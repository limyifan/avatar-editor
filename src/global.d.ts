/// <reference types="buffer" />

interface PNGMetadata {
  width: number;
  height: number;
  data: Buffer;
  gamma: number;
  alpha: boolean;
  bpp: number;
  color: boolean;
  colorType: number;
  depth: number;
  interlace: boolean;
  palette: boolean;
  palettes: number[];
}

const PNG: {
  sync: {
    read(data: Buffer, options?: any): PNGMetadata;
    write(metadata: PNGMetadata, options?: any): Buffer;
  };
};
