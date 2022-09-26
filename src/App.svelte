<script lang="ts">
import Closet from "./components/Closet.svelte";
import Preview from "./components/Preview.svelte";
import { loadResourceFromManifest, type ResourceItem } from "./lib/utils";

const resourcesPromise = loadResourceFromManifest(import.meta.env.BASE_URL + "parts/manifest.json");

let lookConfig: { [key: string]: ResourceItem } = {}

function collectItem(item: ResourceItem) {
  if (item.image) {
    lookConfig[item.category] = item
  } else {
    delete lookConfig[item.category]
    lookConfig = lookConfig
  }
}
</script>

<main>
  {#await resourcesPromise}
    <div>Loading...</div>
  {:then resources}
    <section class="preview-section">
      <Preview config={lookConfig} />
    </section>

    <section class="config-section">
      <div class="container">
        {#each resources as resource}
          <Closet {resource} on:updateConfig={(e) => collectItem(e.detail)} />
        {/each}
      </div>
    </section>
  {/await}
</main>

<style>
@media (max-width: 768px) {
  main {
    flex-direction: column;
  }
}

main {
  display: flex;
  height: 100%;
  align-items: stretch;
  /* border: 1px solid cyan; */
  overflow: hidden;
  padding: 1rem;
}
.config-section {
  flex: 1 0 0;
  overflow: hidden;
  position: relative;
}
.container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: scroll;
}
</style>
