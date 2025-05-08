<!-- web/src/components/ImageCropper.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  
  export let shape: any;
  
  const dispatch = createEventDispatcher<{
    update: any;
  }>();
  
  let shapeType = shape.type;
  let width = 'type' in shape && 'width' in shape ? shape.width || 0 : 0;
  let height = 'type' in shape && 'height' in shape ? shape.height || 0 : 0;
  let radius = shape.type === 'roundedRect' ? shape.radius || 10 : 10;
  
  function updateShape() {
    let newShape: any;
    
    switch (shapeType) {
      case 'circle':
        newShape = { type: 'circle' };
        break;
      case 'square':
        newShape = { type: 'square' };
        break;
      case 'rectangle':
        newShape = { 
          type: 'rectangle',
          width: width || undefined,
          height: height || undefined
        };
        break;
      case 'roundedRect':
        newShape = { 
          type: 'roundedRect',
          width: width || undefined,
          height: height || undefined,
          radius: radius
        };
        break;
      default:
        newShape = { type: 'rectangle' };
    }
    
    dispatch('update', newShape);
  }
</script>

<div class="cropper-container">
  <h3>Crop Shape</h3>
  
  <div class="form-group">
    <label for="shape-type">Shape Type</label>
    <select id="shape-type" bind:value={shapeType} on:change={updateShape}>
      <option value="rectangle">Rectangle</option>
      <option value="circle">Circle</option>
      <option value="square">Square</option>
      <option value="roundedRect">Rounded Rectangle</option>
    </select>
  </div>
  
  {#if shapeType === 'rectangle' || shapeType === 'roundedRect'}
    <div class="form-group">
      <label for="width">Width (optional, in pixels)</label>
      <input 
        type="number" 
        id="width" 
        bind:value={width} 
        on:input={updateShape} 
        min="0" 
        step="1" 
        placeholder="Auto"
      />
    </div>
    
    <div class="form-group">
      <label for="height">Height (optional, in pixels)</label>
      <input 
        type="number" 
        id="height" 
        bind:value={height} 
        on:input={updateShape} 
        min="0" 
        step="1" 
        placeholder="Auto"
      />
    </div>
  {/if}
  
  {#if shapeType === 'roundedRect'}
    <div class="form-group">
      <label for="radius">Corner Radius</label>
      <input 
        type="range" 
        id="radius" 
        bind:value={radius} 
        on:input={updateShape} 
        min="1" 
        max="50" 
        step="1"
      />
      <span class="range-value">{radius}px</span>
    </div>
  {/if}
  
  <div class="shape-preview">
    <h4>Shape Preview</h4>
    <div class="preview-box">
      {#if shapeType === 'circle'}
        <div class="preview-circle"></div>
      {:else if shapeType === 'square'}
        <div class="preview-square"></div>
      {:else if shapeType === 'rectangle'}
        <div class="preview-rectangle" style="width: 150px; height: 100px;"></div>
      {:else if shapeType === 'roundedRect'}
        <div 
          class="preview-rounded-rect" 
          style="width: 150px; height: 100px; border-radius: {radius}px;"
        ></div>
      {/if}
    </div>
  </div>
</div>

<style>
  .cropper-container {
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
  
  .range-value {
    margin-left: 10px;
  }
  
  .shape-preview {
    margin-top: 20px;
    border: 1px solid #ddd;
    padding: 15px;
    border-radius: 8px;
  }
  
  .preview-box {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 150px;
    background-color: #f0f0f0;
    border-radius: 4px;
  }
  
  .preview-circle {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background-color: #3498db;
  }
  
  .preview-square {
    width: 100px;
    height: 100px;
    background-color: #3498db;
  }
  
  .preview-rectangle,
  .preview-rounded-rect {
    background-color: #3498db;
  }
</style>