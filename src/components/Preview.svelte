<script lang="ts">
  import { blendColors, type ResourceItem } from "../lib/utils";

  export let config: { [category: string]: ResourceItem } = {};

  const w = 33;
  const h = 33;

  let canvas: HTMLCanvasElement;
  //let newcanvas:HTMLCanvasElement;
  async function drawItems(items: ResourceItem[]) {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // ctx.imageSmoothingEnabled = false;
    // ctx.clearRect(0, 0, w, h);

    const imageData = blendItems(items);

    if (!imageData) return;

    ctx.putImageData(scaleImageData(imageData,9), 2, 2);

    /*
    for (const item of items) {
      const data = item.image.png.data;
      // const imageData = new Blob([data]);
      const imageData = new ImageData(new Uint8ClampedArray(data), width);
      const bitmap = await createImageBitmap(imageData, 0, 0, w, h)
      ctx.drawImage(bitmap, 0, 0);
    }
    */
  }
  //function to resize images
  function scaleImageData(imageData, scale) {
    const ctx = canvas.getContext("2d");
    var scaled = ctx.createImageData(imageData.width * scale, imageData.height * scale);
    var subLine = ctx.createImageData(scale, 1).data
    for (var row = 0; row < imageData.height; row++) {
      for (var col = 0; col < imageData.width; col++) {
        var sourcePixel = imageData.data.subarray(
                (row * imageData.width + col) * 4,
                (row * imageData.width + col) * 4 + 4
        );
        for (var x = 0; x < scale; x++) subLine.set(sourcePixel, x*4)
        for (var y = 0; y < scale; y++) {
          var destRow = row * scale + y;
          var destCol = col * scale;
          scaled.data.set(subLine, (destRow * scaled.width + destCol) * 4)
        }
      }
    }

    return scaled;
  }
  function colorHexToRgb(hex: string) {
    return parseInt(hex.slice(1), 16)
  }

  function convertPaletteToColorMapping(palette: { [from: string]: string }) {
    const colorMapping = Object.entries(palette).filter(p => p[1] && p[1] != p[0])
    const entries = colorMapping.map(([from, to]) => {
      const key = colorHexToRgb(from)
      const v = colorHexToRgb(to)
      const r = (v & 0xff0000) >> 16
      const g = (v & 0x00ff00) >> 8
      const b = (v & 0x0000ff)
      const value = [r, g, b]
      return [key, value] as const
    })

    return new Map(entries)
  }

  function blendItems(items: ResourceItem[]) {
    if (!items.length) return null;
    const sample = items[0]
    const { width, height } = sample.image.png;

    const imageData = new ImageData(width, height);
    const pixelLength = items[0].image.png.data.length / 4;

    const colorMappingCache = new Map<ResourceItem, Map<number, number[]>>()
    // iterate thro px and blend them
    for (let i = 0; i < pixelLength; i++) {
      const stack: ArrayLike<number>[] = []
      const j = i * 4;
      for (const item of items) {
        const data = item.image.png.data;
        if (!colorMappingCache.has(item)) {
          const m = convertPaletteToColorMapping(item.palettes)
          colorMappingCache.set(item, m)
        }
        if (data[j+3] != 0) {
          // const rgba = data.subarray(j, j + 4);
          const rgba = [data[j], data[j+1], data[j+2], data[j+3]]
          const rgb = (rgba[0] << 16) + (rgba[1] << 8) + rgba[2]
          // if palette customized
          const mp = colorMappingCache.get(item);
          if (mp.has(rgb)) {
            const m = mp.get(rgb)
            rgba[0] = m[0]
            rgba[1] = m[1]
            rgba[2] = m[2]
          }
          stack.push(rgba);
        }
      }
      const mix = blendColors(...stack)
      imageData.data[j] = mix[0]
      imageData.data[j+1] = mix[1]
      imageData.data[j+2] = mix[2]
      imageData.data[j+3] = mix[3]
    }
    return imageData
  }

  $: {
    const items = Object.values(config).filter(Boolean);
    items.sort((a, b) => a.priority - b.priority);
    drawItems(items);
  }

  function saveCanvasImage(){
    const downloadLink = document.createElement('a');
    downloadLink.setAttribute('download', 'Avatar.png');
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      downloadLink.setAttribute('href', url);
      downloadLink.click();
    });

  }

</script>

<div class="preview">
  <div class="canvas-container">
    <canvas id="preview-canvas" height="350" width="350" bind:this={canvas} />
    <!-- <canvas id="new-canvas" height="150" width="150" bind:this={newcanvas}/> -->
  </div>
  <div>
    <button on:click={saveCanvasImage}>Save Image</button>
  </div>
</div>

<style>
  @media (max-width: 768px) {
    .preview {
      flex-direction: row;
      align-items: center;
    }
  }

  @media (min-width: 769px) {
    .preview {
      flex-direction: column;
    }
  }

  .preview {
    border: 1px solid gray;
    display: flex;
  }

  canvas#preview-canvas {
    height: 430px;
    width: 430px;
    image-rendering: pixelated;
  }
</style>
