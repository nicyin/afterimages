fetch('blues.json')
  .then(response => response.json())
  .then(data => {
    console.log('Total items:', data.length);
    
    const shuffleData = data.sort(() => Math.random() - 0.5);
    
    let currentIndex = 0;
    let wordElements = [];
    let isAnimating = false; // track word animation
    let isShowingImage = true; // track current state
    
    function hideGrid() {
      wordElements.forEach(el => {
        if (el.classList.contains('faded') || el.classList.contains('color-tile')) {
          el.style.display = 'none';
        }
      });
    }
    
    function showGrid() {
      wordElements.forEach(el => {
        if (el.classList.contains('faded') || el.classList.contains('color-tile')) {
          el.style.display = 'block';
        }
      });
    }
    
    function fadeWords(color) {
      wordElements.forEach(el => {
        if (!el.classList.contains('color-tile')) {
          // Only set color for words, not tiles
          el.style.color = color;
        }
        el.classList.add('faded');
      });
      
      // clear bg
      document.body.style.backgroundColor = '';
    }
    
    function animateWords(text, color) {
      const words = text.split(' ');
      let wordIndex = 0;
      let previousY = null; //previoius word y-position
      
      // total char length
      const sentenceLength = text.length;
      
      // mobile detect
      const isMobile = window.innerWidth < 768;
      const minWidth = isMobile ? window.innerWidth * 0.7 : window.innerWidth * 0.3;
      const maxWidth = isMobile ? window.innerWidth * 0.9 : window.innerWidth * 0.9;
      
      // width based on sentence length
      const charRatio = Math.min((sentenceLength - 20) / 80, 1);
      const totalWidth = minWidth + (maxWidth - minWidth) * Math.max(charRatio, 0);
      
      // spacing
      const startX = (window.innerWidth - totalWidth) / 2; // center sentence
      const xSpacing = totalWidth / (words.length + 1);
      
      // scaling duration
      const msPerWord = 300;
      
      document.body.style.backgroundColor = color;

      const tileEl = document.createElement('div');
      tileEl.className = 'color-tile';
      tileEl.style.backgroundColor = color;
      document.body.appendChild(tileEl);
      wordElements.push(tileEl);
      
      function showNextWord() {
        if (wordIndex >= words.length) {
          setTimeout(() => {
            // enable scroll
            isAnimating = false;
          }, 500);
          return;
        }
        
        const word = words[wordIndex];
        const x = startX + xSpacing * (wordIndex + 1);
        
        const screenMinY = isMobile ? window.innerHeight * 0.1 : window.innerHeight * 0.3;
        const screenMaxY = isMobile ? window.innerHeight * 0.9 : window.innerHeight * 0.7;
        
        let y;
        if (previousY === null) {
          y = screenMinY + Math.random() * (screenMaxY - screenMinY);
        } else {

          const maxVariation = isMobile ? 150 : 100;
          const constraintMin = Math.max(screenMinY, previousY - maxVariation);
          const constraintMax = Math.min(screenMaxY, previousY + maxVariation);
          y = constraintMin + Math.random() * (constraintMax - constraintMin);
        }
        
        previousY = y;
        
        // word element
        const wordEl = document.createElement('div');
        wordEl.className = 'word';
        wordEl.textContent = word;
        wordEl.style.left = x + 'px';
        wordEl.style.top = y + 'px';
        document.body.appendChild(wordEl);
        wordElements.push(wordEl);
        
        const variation = (Math.random() - 0.5) * 0.2;
        const delay = msPerWord * (1 + variation);
        
        wordIndex++;
        setTimeout(showNextWord, delay);
      }
      
      showNextWord();
    }
    
    //changing words into grid
    function arrangeWordsInGrid() {
      if (wordElements.length === 0) return;
      
      const totalWords = wordElements.length;
    
      const aspectRatio = window.innerWidth / window.innerHeight;
      const cols = Math.ceil(Math.sqrt(totalWords * aspectRatio));
      const rows = Math.ceil(totalWords / cols);
    
      const cellWidth = window.innerWidth / cols;
      const cellHeight = window.innerHeight / rows;
      
      wordElements.forEach((el, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        const x = (col + 0.5) * cellWidth;
        const y = (row + 0.5) * cellHeight;
        
        el.style.left = x + 'px';
        el.style.top = y + 'px';
      });
    }
    
    function showPhoto(index) {
      if (index >= shuffleData.length) {
        return;
      }
      
      arrangeWordsInGrid();
      showGrid();

      //adding new img
      
      const item = shuffleData[index];
      
      const div = document.createElement('div');
      div.className = 'image';
      
      const img = document.createElement('img');
      img.src = `blue_crops_filtered/${item.filename}`;
      img.alt = item.ai_color;
      
      div.appendChild(img);
      document.body.appendChild(div);
      
      isShowingImage = true;

      div.addEventListener('click', () => {
        if (!isShowingImage) return;

        div.style.transform = 'translate(-50%, -50%) scale(2)';
        div.style.transition = 'transform 0.2s ease-out, opacity 0.2s ease-out';
        div.style.opacity = '0';
        
        document.body.style.backgroundColor = item.hex;
        
        isShowingImage = false;
        isAnimating = true;
        
        hideGrid();
        
        setTimeout(() => {
          div.remove();
          animateWords(item.my_description, item.hex);
        }, 200);
      });
      
      //next image
      const handleClick = () => {
        if (isAnimating) {
          return;
        }
        
        if (!isShowingImage) {
          // animation finish
          fadeWords(item.hex);
          
          currentIndex++;
          showPhoto(currentIndex);
          
          window.removeEventListener('click', handleClick);
        }
      };
      
      window.addEventListener('click', handleClick);
    }
    
    showPhoto(currentIndex);
  });