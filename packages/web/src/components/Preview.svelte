
<script lang="ts">
  export let originalUrl: string | null;
  export let processedUrl: string | null;
  export let loading: boolean;
  
  let viewMode: 'side-by-side' | 'before-after' | 'split' = 'side-by-side';
  let splitPosition = 50;
  
  function handleSplitChange(event: Event) {
    const input = event.target as HTMLInputElement;
    splitPosition = parseInt(input.value);
  }
  
  let displaySize = 'contain';
  
  function downloadProcessedImage() {
    if (!processedUrl) return;
    
    const link = document.createElement('a');
    link.href = processedUrl;
    link.download = `processed-image-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
</script>

<div class="preview-container">
  <h3>Image Preview</h3>
  
  <div class="view-options">
    <div class="view-mode-selector">
      <button 
        class="view-button {viewMode === 'side-by-side' ? 'active' : ''}" 
        on:click={() => viewMode = 'side-by-side'}
      >
        Side by Side
      </button>
      <button 
        class="view-button {viewMode === 'before-after' ? 'active' : ''}" 
        on:click={() => viewMode = 'before-after'}
      >
        Before/After
      </button>
      <button 
        class="view-button {viewMode === 'split' ? 'active' : ''}" 
        on:click={() => viewMode = 'split'}
      >
        Split View
      </button>
    </div>
    
    <div class="display-size-selector">
      <button 
        class="size-button {displaySize === 'contain' ? 'active' : ''}" 
        on:click={() => displaySize = 'contain'}
      >
        Fit
      </button>
      <button 
        class="size-button {displaySize === 'cover' ? 'active' : ''}" 
        on:click={() => displaySize = 'cover'}
      >
        Fill
      </button>
      <button 
        class="size-button {displaySize === 'actual' ? 'active' : ''}" 
        on:click={() => displaySize = 'actual'}
      >
        Actual
      </button>
    </div>
  </div>
  
  {#if viewMode === 'split' && originalUrl && processedUrl}
    <div class="split-controls">
      <input 
        type="range" 
        min="0" 
        max="100" 
        bind:value={splitPosition} 
        on:input={handleSplitChange}
      />
      <span class="split-value">{splitPosition}%</span>
    </div>
  {/if}
  
  <div class="image-preview">
    {#if loading}
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Processing image...</p>
      </div>
    {:else if !originalUrl}
      <div class="no-image">
        <p>No image selected. Please upload an image or choose a sample.</p>
      </div>
    {:else if viewMode === 'side-by-side'}
      <div class="side-by-side">
        <div class="image-container">
          <h4>Original</h4>
          <div class="image-wrapper">
            <img 
              src={originalUrl} 
              alt="Original" 
              style="object-fit: {displaySize === 'actual' ? 'none' : displaySize};"
            />
          </div>
        </div>
        <div class="image-container">
          <h4>Processed</h4>
          <div class="image-wrapper">
            {#if processedUrl}
              <img 
                src={processedUrl} 
                alt="Processed" 
                style="object-fit: {displaySize === 'actual' ? 'none' : displaySize};"
              />
            {:else}
              <div class="not-processed">Not processed yet</div>
            {/if}
          </div>
        </div>
      </div>
    {:else if viewMode === 'before-after'}
      <div class="before-after">
        <div class="tab-buttons">
          <button class="tab-button active" id="before-tab">Original</button>
          <button class="tab-button" id="after-tab">Processed</button>
        </div>
        <div class="image-wrapper full">
          <img 
            src={originalUrl} 
            alt="Original" 
            style="object-fit: {displaySize === 'actual' ? 'none' : displaySize};"
            id="before-image"
          />
          {#if processedUrl}
            <img 
              src={processedUrl} 
              alt="Processed" 
              style="object-fit: {displaySize === 'actual' ? 'none' : displaySize}; display: none;"
              id="after-image"
            />
          {/if}
        </div>
      </div>
    {:else if viewMode === 'split' && processedUrl}
      <div class="split-view">
        <div class="image-wrapper full">
          <div class="split-image left" style="width: {splitPosition}%;">
            <img 
              src={originalUrl} 
              alt="Original" 
              style="object-fit: {displaySize === 'actual' ? 'none' : displaySize};"
            />
            <div class="split-label">Original</div>
          </div>
          <div class="split-image right" style="width: calc(100% - {splitPosition}%);">
            <img 
              src={processedUrl} 
              alt="Processed" 
              style="object-fit: {displaySize === 'actual' ? 'none' : displaySize};"
            />
            <div class="split-label">Processed</div>
          </div>
          <div class="split-divider" style="left: {splitPosition}%;"></div>
        </div>
      </div>
    {/if}
  </div>
  
  {#if processedUrl}
    <div class="download-section">
      <button class="download-button" on:click={downloadProcessedImage}>
        Download Processed Image
      </button>
    </div>
  {/if}
</div>

<style>
  .preview-container {
    padding: 10px;
  }
  
  .view-options {
    display: flex;
    justify-content: space-between;
    margin-bottom: 15px;
  }
  
  .view-mode-selector,
  .display-size-selector {
    display: flex;
    gap: 5px;
  }
  
  .view-button,
  .size-button {
    padding: 5px 10px;
    border: none;
    background-color: #f0f0f0;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9em;
  }
  
  .view-button.active,
  .size-button.active {
    background-color: #3498db;
    color: white;
  }
  
  .split-controls {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
  }
  
  .split-controls input {
    flex: 1;
  }
  
  .split-value {
    margin-left: 10px;
    font-weight: bold;
  }
  
  .image-preview {
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
    min-height: 300px;
    position: relative;
  }
  
  .loading-spinner, .no-image {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 300px;
    background-color: #f9f9f9;
  }
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top-color: #3498db;
    animation: spin 1s ease-in-out infinite;
    margin-bottom: 15px;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .side-by-side {
    display: flex;
    height: 350px;
  }
  
  .image-container {
    flex: 1;
    padding: 10px;
    display: flex;
    flex-direction: column;
  }
  
  .image-container h4 {
    text-align: center;
    margin-top: 0;
    margin-bottom: 10px;
  }
  
  .image-wrapper {
    flex: 1;
    overflow: hidden;
    background-color: #f0f0f0;
    position: relative;
    border-radius: 4px;
  }
  
  .image-wrapper.full {
    height: 350px;
  }
  
  .image-wrapper img {
    width: 100%;
    height: 100%;
    object-position: center;
  }
  
  .not-processed {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #666;
  }
  
  .tab-buttons {
    display: flex;
    margin-bottom: 10px;
  }
  
  .tab-button {
    flex: 1;
    padding: 8px;
    text-align: center;
    background-color: #f0f0f0;
    border: none;
    cursor: pointer;
  }
  
  .tab-button.active {
    background-color: #3498db;
    color: white;
  }
  
  .split-view {
    position: relative;
    height: 350px;
  }
  
  .split-image {
    position: absolute;
    top: 0;
    height: 100%;
    overflow: hidden;
  }
  
  .split-image.left {
    left: 0;
  }
  
  .split-image.right {
    right: 0;
  }
  
  .split-image img {
    width: 100%;
    height: 100%;
  }
  
  .split-divider {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 4px;
    background-color: #3498db;
    cursor: ew-resize;
  }
  
  .split-label {
    position: absolute;
    bottom: 10px;
    padding: 3px 8px;
    background-color: rgba(0, 0, 0, 0.6);
    color: white;
    border-radius: 4px;
    font-size: 0.8em;
  }
  
  .split-image.left .split-label {
    right: 10px;
  }
  
  .split-image.right .split-label {
    left: 10px;
  }
  
  .download-section {
    margin-top: 15px;
    text-align: center;
  }
  
  .download-button {
    padding: 10px 20px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    transition: background-color 0.2s;
  }
  
  .download-button:hover {
    background-color: #2980b9;
  }
</style>

<script context="module">
  document.addEventListener('DOMContentLoaded', () => {
    setupBeforeAfterTabs();
  });
  
  function setupBeforeAfterTabs() {
    const beforeTab = document.querySelector('#before-tab');
    const afterTab = document.querySelector('#after-tab');
    const beforeImage = document.querySelector('#before-image');
    const afterImage = document.querySelector('#after-image');
    
    if (beforeTab && afterTab && beforeImage && afterImage) {
      beforeTab.addEventListener('click', () => {
        beforeTab.classList.add('active');
        afterTab.classList.remove('active');
        beforeImage.style.display = 'block';
        afterImage.style.display = 'none';
      });
      
      afterTab.addEventListener('click', () => {
        afterTab.classList.add('active');
        beforeTab.classList.remove('active');
        afterImage.style.display = 'block';
        beforeImage.style.display = 'none';
      });
    }
  }
</script>