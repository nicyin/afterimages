fetch('blues.json')
  .then(response => response.json())
  .then(data => {
    const shuffleData = data.sort(() => Math.random() - 0.5);
    
    let current = 0;
    let allwords = [];
    let animating = false;
    let showing_image = true;
    
    function toggleGrid(show) {
      allwords.forEach(el => {
        if (el.classList.contains('faded') || el.classList.contains('color-tile')) {
          el.style.display = show ? 'block' : 'none';
        }
      });
    }
    
    function fadeWords(color) {
      allwords.forEach(el => {
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
      let lastY = null;
      
      // mobile check
      let ismobile = window.innerWidth < 768;
      let min_width = ismobile ? window.innerWidth * 0.73 : window.innerWidth * 0.32;
      let max_width = window.innerWidth * 0.88;
      
      // trying to scale based on text length
      const charRatio = Math.min((text.length - 20) / 80, 1);
      const totalWidth = min_width + (max_width - min_width) * Math.max(charRatio, 0);
      
      const startX = (window.innerWidth - totalWidth) / 2;
      const wordSpacing = totalWidth / (words.length + 1);
      let wordtime = 280; 
      
      document.body.style.backgroundColor = color;

      // color square at start of each sentence
      const tile = document.createElement('div');
      tile.className = 'color-tile';
      tile.style.backgroundColor = color;
      document.body.appendChild(tile);
      allwords.push(tile);
      
      function showNextWord() {
        if (wordIndex >= words.length) {
          setTimeout(() => {
            animating = false;
            //document.body.classList.add('clickable');
          }, 480);
          return;
        }
        
        const word = words[wordIndex];
        const x = startX + wordSpacing * (wordIndex + 1);
        
        // vertical positioning (mobile spread)
        const minY = ismobile ? window.innerHeight * 0.12 : window.innerHeight * 0.28;
        const maxY = ismobile ? window.innerHeight * 0.87 : window.innerHeight * 0.72;
        const jumpsize = ismobile ? 145 : 95;
        
        let y;
        if (lastY === null) {
          y = minY + Math.random() * (maxY - minY);
        } else {
          const constraintMin = Math.max(minY, lastY - jumpsize);
          const constraintMax = Math.min(maxY, lastY + jumpsize);
          y = constraintMin + Math.random() * (constraintMax - constraintMin);
        }
        
        lastY = y;
        
        const wordEl = document.createElement('div');
        wordEl.className = 'word';
        wordEl.textContent = word;
        wordEl.style.left = x + 'px';
        wordEl.style.top = y + 'px';
        document.body.appendChild(wordEl);
        allwords.push(wordEl);
        
        // random variation in timing so it feels more natural
        const delay = wordtime * (1 + (Math.random() - 0.5) * 0.18);
        
        wordIndex++;
        setTimeout(showNextWord, delay);
      }
      
      showNextWord();
    }
    
    // arrange everything into grid
    function makeGrid() {
      if (allwords.length === 0) return;
      
      const total = allwords.length;
      const aspectRatio = window.innerWidth / window.innerHeight;
      const cols = Math.ceil(Math.sqrt(total * aspectRatio));
      const rows = Math.ceil(total / cols);
      const cellWidth = window.innerWidth / cols;
      const cellHeight = window.innerHeight / rows;
      
      allwords.forEach((el, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        el.style.left = (col + 0.5) * cellWidth + 'px';
        el.style.top = (row + 0.5) * cellHeight + 'px';
      });
    }
    
    function showPhoto(index) {
      window.showPhoto = showPhoto;
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
      
      showing_image = true;
      //document.body.classList.remove('clickable');

      div.addEventListener('click', () => {
        if (!showing_image) return;

        // zoom and fade out
        div.style.transform = 'translate(-50%, -50%) scale(1.95)';
        div.style.transition = 'transform 0.2s ease-out, opacity 0.2s ease-out';
        div.style.opacity = '0';
        
        document.body.style.backgroundColor = item.hex;
        
        showing_image = false;
        animating = true;
        
        toggleGrid(false);
        
        setTimeout(() => {
          div.remove();
          animateWords(item.my_description, item.hex);
        }, 200);
      });
      
      const handleClick = () => {
        if (animating || showing_image) return;
        
        fadeWords(item.hex);
        current++;
        showPhoto(current);
        window.removeEventListener('click', handleClick);
      };
      
      window.addEventListener('click', handleClick);
      window.addEventListener('touchend', handleClick);
    }
    
    showPhoto(current);
  });