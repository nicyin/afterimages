fetch('blues.json')
  .then(response => response.json())
  .then(data => {
    console.log('Total items:', data.length);
    
    const shuffleData = data.sort(() => Math.random() - 0.5);
    
    let currentIndex = 0;
    let wordElements = [];
    let isAnimating = false; // track word animation
    let isShowingImage = true; // track current state
    
    function fadeWords(color) {
      wordElements.forEach(el => {
        el.style.color = color;
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

      const minWidth = window.innerWidth * 0.3;
      const maxWidth = window.innerWidth * 0.9;
      
      // width based on sentence length
      const charRatio = Math.min((sentenceLength - 20) / 80, 1);
      const totalWidth = minWidth + (maxWidth - minWidth) * Math.max(charRatio, 0);
      
      // spacing
      const startX = (window.innerWidth - totalWidth) / 2; // center sentence
      const xSpacing = totalWidth / (words.length + 1);
      
      // scaling duration
      const msPerWord = 300;
      
      document.body.style.backgroundColor = color;
      
      function showNextWord() {
        if (wordIndex >= words.length) {
          // All words shown - keep white text and full color background
          setTimeout(() => {
            // Enable scrolling - ready for next scroll
            isAnimating = false;
          }, 500);
          return;
        }
        
        const word = words[wordIndex];
        const x = startX + xSpacing * (wordIndex + 1);
        
        // y position
        const screenMinY = window.innerHeight * 0.3;
        const screenMaxY = window.innerHeight * 0.7;
        
        let y;
        if (previousY === null) {
          y = screenMinY + Math.random() * (screenMaxY - screenMinY);
        } else {
          // within 200px
          const constraintMin = Math.max(screenMinY, previousY - 100);
          const constraintMax = Math.min(screenMaxY, previousY + 100);
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
    
    function showPhoto(index) {
      if (index >= shuffleData.length) {
        console.log('All photos viewed!');
        return;
      }
      
      const item = shuffleData[index];
      
      const div = document.createElement('div');
      div.className = 'image';
      
      const img = document.createElement('img');
      img.src = `blue_crops_filtered/${item.filename}`;
      img.alt = item.ai_color;
      
      div.appendChild(img);
      document.body.appendChild(div);
      
      isShowingImage = true;
      
      // delay before scroll
      let canScroll = false;
      setTimeout(() => {
        canScroll = true;
      }, 1500);
      
      const handleScroll = (e) => {
        if (!canScroll) {
          return;
        }
        
        e.preventDefault();
        
        if (isAnimating) {
          return;
        }
        
        if (isShowingImage) {
          // start animation
          div.remove();
          isShowingImage = false;
          isAnimating = true;
          animateWords(item.my_description, item.hex);
        } else {
          // animation end
          fadeWords(item.hex);
          currentIndex++;
          showPhoto(currentIndex);
          // remove scroll listener
          window.removeEventListener('wheel', handleScroll);
        }
      };
      
      window.addEventListener('wheel', handleScroll, { passive: false });
    }
    
    showPhoto(currentIndex);
  });