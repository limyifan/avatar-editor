<script lang="ts">
import type { Resource, ResourceImage, ResourceItem } from "src/lib/utils";
import {beforeUpdate, createEventDispatcher, onMount} from "svelte";

const dispatch = createEventDispatcher<{ updateConfig: ResourceItem }>();

export let resource: Resource | null = null;
// let selection: ResourceImage | null = null;
// let palettes: string[] | null = null;
let config: ResourceItem = {
  category: "",
  priority: -1,
  image: null,
  palettes: null,
};

$: {
  config.category = resource.category;
  config.priority = resource.priority;
}

onMount(() => {
  selectImage(resource.images[0]);
});

  function onColorClick(id, initialValue) {
    const picker = document.getElementById(id)
    picker.addEventListener('input', (e) => {
      const selectedColor = e.target.value;
      changePalette(initialValue ,selectedColor);
    });
  }

function toHex(n: number) {
  return n.toString(16).padStart(6, "0");
}

function getImagePalettes(image: ResourceImage) {
  const palettesEntries = image.png.palettes.map((n) => [`#${toHex(n)}`, ""]);
  return Object.fromEntries(palettesEntries);
}

function selectImage(image: ResourceImage) {
  if (!resource) return;
  if (config.image === image) {
    config.image = null;
    config.palettes = null;
  } else {
    config.image = image;
    config.palettes = getImagePalettes(image);
  }

  dispatch("updateConfig", { ...config });
}

function changePalette(from: string, to: string) {
  config.palettes = { ...config.palettes, [from]: to };
  dispatch("updateConfig", { ...config });
}
</script>

{#if resource}
  <fieldset>
    <legend>{resource.category}</legend>
    <div class="images">
      {#each resource.images as image}
        <div class="image-select" class:selected={config.image === image} on:click={() => selectImage(image)}>
          <img src={URL.createObjectURL(image.blob)} alt="" />
        </div>
      {/each}
    </div>

    {#if config.palettes}
      <div>Palette:</div>
      {#each Object.entries(config.palettes) as palette,i}
        <input
          type="color"
          class="input-color-picker"
          id="input-color-picker-{resource.category+i}"
          value={palette[0]}
          on:click={(e) => onColorClick(e.currentTarget.id,palette[0])}
          on:change={(e) => {
            changePalette(palette[0], e.currentTarget.value);
            removeEventListener('input', (e) => {
              const selectedColor = e.target.value;
              console.log(selectedColor);
              changePalette(palette[0] ,selectedColor);
            });
          }}
        />
      {/each}
    {/if}
  </fieldset>
{/if}

<style>
.images {
  display: flex;
}

.image-select {
  display: flex;
  background-color: lightgray;
  cursor: pointer;
}

.selected {
  background-color: lightblue;
}
</style>
