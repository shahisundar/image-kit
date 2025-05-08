
<script lang="ts">
import { createEventDispatcher } from 'svelte';
  
  export let angle: number;
  
  const dispatch = createEventDispatcher<{
    update: number;
  }>();
  
  function rotateLeft() {
    angle = (angle - 90) % 360;
    if (angle < 0) angle += 360;
    dispatch('update', angle);
  }
  
  function rotateRight() {
    angle = (angle + 90) % 360;
    dispatch('update', angle);
  }
  
  function updateAngle() {

    angle = ((angle % 360) + 360) % 360;
    dispatch('update', angle);
  }
  
  function resetAngle() {
    angle = 0;
    dispatch('update', angle);
  }
</script>

<div class="rotator-container">
  <h3>Image Rotation</h3>
  
  <div class="rotation-preview">
    <div class="rotation-display" style="transform: rotate({angle}deg)">
      <div class="image-placeholder">
        <span>Image</span>
      </div>
    </div>
    <div class="angle-display">{angle}°</div>
  </div>
  
  <div class="rotation-controls">
    <button class="rotation-button" on:click={rotateLeft}>
      <span class="rotation-icon">↺</span> 
      90° Left
    </button>
    
    <button class="rotation-button" on:click={rotateRight}>
      <span class="rotation-icon">↻</span> 
      90° Right
    </button>
    
    <button class="rotation-button reset-button" on:click={resetAngle}>
      Reset
    </button>
  </div>
  
  <div class="form-group">
    <label for="angle">Custom Angle ({angle}°)</label>
    <input 
      type="range" 
      id="angle" 
      bind:value={angle} 
      on:input={updateAngle} 
      min="0" 
      max="359" 
      step="1"
    />
    <div class="range-labels">
      <span>0°</span>
      <span>359°</span>
    </div>
  </div>
  
  <div class="form-group">
    <label for="angle-input">Precise Angle</label>
    <input 
      type="number" 
      id="angle-input" 
      bind:value={angle} 
      on:input={updateAngle} 
      min="0" 
      max="359" 
      step="1"
    />
  </div>
</div>

<style>
  .rotator-container {
    padding: 10px;
  }
  
  .rotation-preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    background-color: #f9f9f9;
    border-radius: 8px;
    margin-bottom: 20px;
  }
  
  .rotation-display {
    transition: transform 0.3s ease;
  }
  
  .image-placeholder {
    width: 100px;
    height: 100px;
    background-color: #3498db;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
  }
  
  .angle-display {
    margin-top: 15px;
    font-size: 18px;
    font-weight: bold;
  }
  
  .rotation-controls {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
  }
  
  .rotation-button {
    flex: 1;
    padding: 10px;
    border: none;
    background-color: #e0e0e0;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    transition: background-color 0.2s;
  }
  
  .rotation-button:hover {
    background-color: #d0d0d0;
  }
  
  .rotation-icon {
    font-size: 1.2em;
  }
  
  .reset-button {
    background-color: #f0f0f0;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
  }
  
  input {
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
</style>