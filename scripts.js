fetch('blues.json')
  .then(response => response.json())
  .then(data => {
    const shuffleData = data.sort(() => Math.random() - 0.5);
    
    let currentIndex = 0;
    let wordElements = [];
    let isAnimating = false;
    let isShowingImage = true;
    
    function toggleGrid(show) {
      wordElements.forEach(el => {
        if (el.classList.contains('faded') || el.classList.contains('color-tile')) {
          el.style.display = show ? 'block' : 'none';
        }
      });
    }
    
    function fadeWords(color) {
      wordElements.forEach(el => {
        if (!el.classList.contains('color-tile')) {
          el.style.color = color;
        }
        el.classList.add('faded');
      });
      
      document.body.style.backgroundColor = '';
    }
    
    function animateWords(text, color) {
      const words = text.split(' ');
      let wordIndex = 0;
      let previousY = null;
      
      const isMobile = window.innerWidth < 768;
      const minWidth = isMobile ? window.innerWidth * 0.7 : window.innerWidth * 0.3;
      const maxWidth = window.innerWidth * 0.9;
      
      const charRatio = Math.min((text.length - 20) / 80, 1);
      const totalWidth = minWidth + (maxWidth - minWidth) * Math.max(charRatio, 0);
      
      const startX = (window.innerWidth - totalWidth) / 2;
      const wordSpacing = totalWidth / (words.length + 1);
      const msPerWord = 300;
      
      document.body.style.backgroundColor = color;

      const tile = document.createElement('div');
      tile.className = 'color-tile';
      tile.style.backgroundColor = color;
      document.body.appendChild(tile);
      wordElements.push(tile);
      
      function showNextWord() {
        if (wordIndex >= words.length) {
          setTimeout(() => {
            isAnimating = false;
          }, 500);
          return;
        }
        
        const word = words[wordIndex];
        const x = startX + wordSpacing * (wordIndex + 1);
        
        const minY = isMobile ? window.innerHeight * 0.1 : window.innerHeight * 0.3;
        const maxY = isMobile ? window.innerHeight * 0.9 : window.innerHeight * 0.7;
        const maxVariation = isMobile ? 150 : 100;
        
        let y;
        if (previousY === null) {
          y = minY + Math.random() * (maxY - minY);
        } else {
          const constraintMin = Math.max(minY, previousY - maxVariation);
          const constraintMax = Math.min(maxY, previousY + maxVariation);
          y = constraintMin + Math.random() * (constraintMax - constraintMin);
        }
        
        previousY = y;
        
        const wordEl = document.createElement('div');
        wordEl.className = 'word';
        wordEl.textContent = word;
        wordEl.style.left = x + 'px';
        wordEl.style.top = y + 'px';
        document.body.appendChild(wordEl);
        wordElements.push(wordEl);
        
        const delay = msPerWord * (1 + (Math.random() - 0.5) * 0.2);
        
        wordIndex++;
        setTimeout(showNextWord, delay);
      }
      
      showNextWord();
    }
    
    function makeGrid() {
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
        el.style.left = (col + 0.5) * cellWidth + 'px';
        el.style.top = (row + 0.5) * cellHeight + 'px';
      });
    }
    
    function showPhoto(index) {
      if (index >= shuffleData.length) return;
      
      makeGrid();
      toggleGrid(true);
      
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
        
        toggleGrid(false);
        
        setTimeout(() => {
          div.remove();
          animateWords(item.my_description, item.hex);
        }, 200);
      });
      
      const handleClick = () => {
        if (isAnimating || isShowingImage) return;
        
        fadeWords(item.hex);
        currentIndex++;
        showPhoto(currentIndex);
        window.removeEventListener('click', handleClick);
      };
      
      window.addEventListener('click', handleClick);
      window.addEventListener('touchend', handleClick);
    }
    
    showPhoto(currentIndex);
  });