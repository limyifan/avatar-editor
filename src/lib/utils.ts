// import { PNG } from "pngjs/browser";
// import { Buffer } from "buffer";

type ResourceManifest = Array<{
  category: string;
  priority: number;
  files: string[];
}>;

export type Resource = {
  category: string;
  priority: number;
  images: ResourceImage[];
};

export type ResourceItem = {
  category: string;
  priority: number;
  image: ResourceImage;
  palettes?: { [from: string]: string };
};

export type ResourceImage = {
  filename: string;
  blob: Blob;
  url: string;
  png: PNGMetadata;
};

function parsePNG(data: Buffer) {
  const png = PNG.sync.read(data, { filterType: -1 });
  const pxLen = png.data.length / 4;
  const palettes = new Set<number>();
  for (let i = 0; i < pxLen; i++) {
    const j = i * 4;
    const alpha = png.data[j + 3];
    if (!alpha) continue;

    const rgba = png.data.readUInt32BE(j);
    let rgb = rgba;
    // remove alpha channel
    // js bitwise op is applied on Int32, not Uint32
    // thus we need to account for leading sign bit
    // which is when value is >= 0x80000000
    // v == NOT NOT v :: unsign int
    if (rgba == ~~rgba) {
      rgb = rgba >> 8;
    } else {
      rgb = ((rgba ^ 0x80000000) >> 8) ^ 0x800000;
    }
    palettes.add(rgb);
  }

  png.palettes = Array.from(palettes);
  return png;
}

export async function loadResourceFromManifest(manifestPath: string) {
  const resp = await fetch(manifestPath);
  const manifestJson = (await resp.json()) as ResourceManifest;

  return Promise.all(
    manifestJson.map(async ({ category, priority, files }) => {
      return {
        category,
        priority,
        images: await Promise.all(
          files.map(async (filename) => {
            const resp = await fetch(import.meta.env.BASE_URL + filename);
            const blob = await resp.blob();
            const png = parsePNG(Buffer.from(await blob.arrayBuffer()));
            return { filename, blob, url: URL.createObjectURL(blob), png };
          })
        ),
      };
    })
  );
}

export function blendColors(...args: Array<ArrayLike<number>>) {
  let base = [0, 0, 0, 0];
  let added: ArrayLike<number>;
  while ((added = args.shift())) {
    // check if both alpha channels exist.
    if (base[3] && added[3]) {
      if (added[3] == 255) {
        base = Array.from(added);
        continue;
      }

      const mix = [0, 0, 0, 0];
      // alpha
      // mix[3] = Math.round((1 - (1 - added[3] / 255) * (1 - base[3] / 255)) * 255);
      mix[3] = Math.round(added[3] + base[3] - (added[3] * base[3]) / 255);
      // red
      mix[0] = Math.round((added[0] * added[3]) / mix[3] + (base[0] * base[3] * (1 - added[3] / 255)) / mix[3]);
      // green
      mix[1] = Math.round((added[1] * added[3]) / mix[3] + (base[1] * base[3] * (1 - added[3] / 255)) / mix[3]);
      // blue
      mix[2] = Math.round((added[2] * added[3]) / mix[3] + (base[2] * base[3] * (1 - added[3] / 255)) / mix[3]);

      base = mix;
    } else if (base[3] == 0) {
      base = Array.from(added);
    }
  }

  return base;
}
