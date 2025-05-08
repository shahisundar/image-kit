<!-- web/src/components/ImageResizer.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  export let options: any;
  
  const dispatch = createEventDispatcher<{
    update: any;
  }>();
  
  let width = options._width || null;
  let height = options._height || null;
  let aspectRatio = options._aspectRatio || 'original';
  let crop = options.crop || 'thumbnail';
  let gravity = typeof options._gravity === 'string' ? options._gravity : 'center';
  let customGravityX = typeof options._gravity === 'object' ? options._gravity.x : 0;
  let customGravityY = typeof options._gravity === 'object' ? options._gravity.y : 0;
  let useCustomGravity = typeof options._gravity === 'object';
  
  const aspectRatios = [
    { value: 'original', label: 'Original' },
    { value: '1:1', label: 'Square (1:1)' },
    { value: '4:3', label: 'Standard (4:3)' },
    { value: '16:9', label: 'Widescreen (16:9)' },
    { value: '3:2', label: 'Photo (3:2)' },
    { value: '2:3', label: 'Portrait (2:3)' }
  ];
  
  const cropModes = [
    { value: 'thumbnail', label: 'Thumbnail (maintain aspect ratio)' },
    { value: 'crop', label: 'Crop (exact dimensions)' },
    { value: 'fill', label: 'Fill (stretch to fit)' }
  ];
  
  const gravityOptions = [
    { value: 'center', label: 'Center' },
    { value: 'top', label: 'Top' },
    { value: 'bottom', label: 'Bottom' },
    { value: 'left', label: 'Left' },
    { value: 'right', label: 'Right' },
    { value: 'top-left', label: 'Top Left' },
    { value: 'top-right', label: 'Top Right' },
    { value: 'bottom-left', label: 'Bottom Left' },
    { value: 'bottom-right', label: 'Bottom Right' },
    { value: 'custom', label: 'Custom (x,y)' }
  ];
  
  function updateOptions() {
    const newOptions: any = {
      _width: width,
      _height: height,
      _aspectRatio: aspectRatio,
      crop: crop,
      _gravity: useCustomGravity 
        ? { x: customGravityX, y: customGravityY }
        : gravity
    };
    
    dispatch('update', newOptions);
  }
  
  function toggleCustomGravity(value: string) {
    useCustomGravity = value === 'custom';
    if (!useCustomGravity) {
      gravity = 'center';
    }
    updateOptions();
  }
</script>

<div class="resizer-container">
  <h3>Resize Options</h3>
  
  <div class="form-group">
    <label for="width">Width (pixels)</label>
    <input 
      type="number" 
      id="width" 
      bind:value={width} 
      on:input={updateOptions} 
      min="0" 
      step="1" 
      placeholder="Auto" 
    />
  </div>
  
  <div class="form-group">
    <label for="height">Height (pixels)</label>
    <input 
      type="number" 
      id="height" 
      bind:value={height} 
      on:input={updateOptions} 
      min="0" 
      step="1" 
      placeholder="Auto" 
    />
  </div>
  
  <div class="form-group">
    <label for="aspect-ratio">Aspect Ratio</label>
    <select id="aspect-ratio" bind:value={aspectRatio} on:change={updateOptions}>
      {#each aspectRatios as option}
        <option value={option.value}>{option.label}</option>
      {/each}
    </select>
  </div>
  
  <div class="form-group">
    <label for="crop-mode">Crop Mode</label>
    <select id="crop-mode" bind:value={crop} on:change={updateOptions}>
      {#each cropModes as option}
        <option value={option.value}>{option.label}</option>
      {/each}
    </select>
  </div>
  
  <div class="form-group">
    <label for="gravity">Gravity (Focus Point)</label>
    <select 
      id="gravity" 
      bind:value={gravity} 
      on:change={(e:any) => toggleCustomGravity(e.target.value)}
      disabled={useCustomGravity}
    >
      {#each gravityOptions as option}
        <option value={option.value}>{option.label}</option>
      {/each}
    </select>
  </div>
  
  <div class="custom-gravity-toggle">
    <label>
      <input 
        type="checkbox" 
        bind:checked={useCustomGravity} 
        on:change={() => updateOptions()}
      />
      Use custom coordinates
    </label>
  </div>
  
  {#if useCustomGravity}
    <div class="custom-gravity">
      <div class="form-group">
        <label for="gravity-x">X Coordinate</label>
        <input 
          type="number" 
          id="gravity-x" 
          bind:value={customGravityX} 
          on:input={updateOptions} 
          step="1" 
        />
      </div>
      
      <div class="form-group">
        <label for="gravity-y">Y Coordinate</label>
        <input 
          type="number" 
          id="gravity-y" 
          bind:value={customGravityY} 
          on:input={updateOptions} 
          step="1" 
        />
      </div>
    </div>
  {/if}
</div>

<style>
  .resizer-container {
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
  
  .custom-gravity-toggle {
    margin-bottom: 15px;
  }
  
  .custom-gravity-toggle input {
    width: auto;
    margin-right: 8px;
  }
  
  .custom-gravity {
    padding: 10px;
    background-color: #eee;
    border-radius: 4px;
    margin-bottom: 15px;
  }
</style>