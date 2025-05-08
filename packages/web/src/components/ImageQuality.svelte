<!-- web/src/components/ImageQuality.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  export let quality: number;
  export let format: string;
  export let sharpeningLevel: number;
  export let algorithm: any;
  
  const dispatch = createEventDispatcher<{
    update: {
      quality: number;
      format: string;
      sharpeningLevel: number;
      algorithm: any;
    };
  }>();
  
  const formatOptions = [
    { value: 'image/jpeg', label: 'JPEG' },
    { value: 'image/png', label: 'PNG' },
    { value: 'image/webp', label: 'WebP' },
    { value: 'image/avif', label: 'AVIF' }
  ];
  
  const algorithmOptions: any[] = [
    'standard',
    'lanczos2',
    'lanczos3',
    'mitchell',
    'nearest',
    'cubic'
  ];
  
  function updateOptions() {
    dispatch('update', {
      quality,
      format,
      sharpeningLevel,
      algorithm
    });
  }
</script>

<div class="quality-container">
  <h3>Image Quality & Format</h3>
  
  <div class="form-group">
    <label for="format">Output Format</label>
    <select id="format" bind:value={format} on:change={updateOptions}>
      {#each formatOptions as formatOption}
        <option value={formatOption.value}>{formatOption.label}</option>
      {/each}
    </select>
  </div>
  
  <div class="form-group">
    <label for="quality">Quality ({quality}%)</label>
    <input 
      type="range" 
      id="quality" 
      bind:value={quality} 
      on:input={updateOptions} 
      min="1" 
      max="100" 
      step="1"
    />
    <div class="range-labels">
      <span>Low</span>
      <span>High</span>
    </div>
  </div>
  
  <div class="form-group">
    <label for="algorithm">Resize Algorithm</label>
    <select id="algorithm" bind:value={algorithm} on:change={updateOptions}>
      {#each algorithmOptions as algo}
        <option value={algo}>{algo}</option>
      {/each}
    </select>
    
    <div class="option-description">
      {#if algorithm === 'standard'}
        <p>Default algorithm with good balance of quality and speed</p>
      {:else if algorithm === 'lanczos2'}
        <p>High quality but slightly slower Lanczos filter with radius 2</p>
      {:else if algorithm === 'lanczos3'}
        <p>Highest quality Lanczos filter with radius 3</p>
      {:else if algorithm === 'mitchell'}
        <p>Mitchell-Netravali filter for smooth results</p>
      {:else if algorithm === 'nearest'}
        <p>Nearest neighbor for fastest resizing, but pixelated results</p>
      {:else if algorithm === 'cubic'}
        <p>Bicubic interpolation for smooth resizing</p>
      {/if}
    </div>
  </div>
  
  <div class="form-group">
    <label for="sharpening">Sharpening ({sharpeningLevel})</label>
    <input 
      type="range" 
      id="sharpening" 
      bind:value={sharpeningLevel} 
      on:input={updateOptions} 
      min="0" 
      max="5" 
      step="0.1"
    />
    <div class="range-labels">
      <span>None</span>
      <span>Strong</span>
    </div>
  </div>
</div>

<style>
  .quality-container {
    padding: 10px;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
  }
  
  input, select {
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
  .range-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.8em;
    color: #666;
  }
  
  .option-description {
    font-size: 0.9em;
    color: #666;
    margin-top: 5px;
  }
</style>