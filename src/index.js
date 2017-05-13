class Wheel {

  constructor(app) {
    this.app = app;
    // Sector values
    this.sectors = [4, 2, 6, 3, 7, 5, 3, 5, 2, 15, 3, 2, 5, 7, 3, 2];
    this.length = this.sectors.length;
    // Radians for 1 sector
    this.sectorRadians = (360 / this.length / 180) * Math.PI; // radians
    // Spinning duration in ms
    this.spinDuration = {
      min: 2000,
      additional: 2000,
    };
    // Range to spin 2 full spins + random in another 2 spins
    this.spinSectors = {
      min: 2 * this.length,
      additional: (2 * this.length) - 1,
    };

    // Load assets
    const self = this;
    // Callback
    function onAssetLoad() {
      self.wheel = PIXI.Sprite.fromFrame('wheel.png');
      self.arrow = PIXI.Sprite.fromFrame('arrow.png');

      self.arrow.anchor.x = 0.5;
      self.arrow.anchor.y = 0.5;

      // Rotate around the center
      self.wheel.anchor.x = 0.5;
      self.wheel.anchor.y = 0.5;

      // Fix the position of the wheel
      self.wheel.x = app.renderer.width / 2;
      self.wheel.y = app.renderer.height / 2;

      // Fix the position of the arrow
      self.arrow.x = (app.renderer.width / 2) + (self.wheel.width / 2);
      self.arrow.y = app.renderer.height / 2;

      // Add to stage
      app.stage.addChild(self.wheel);
      app.stage.addChild(self.arrow);

      // Set default size to be measured against
      // this is full size of child elements
      // used for scaling to screen size
      self.defaultWidth = self.wheel.width + self.arrow.width;
      self.defaultHeight = self.wheel.height;
    }

    const loader = new PIXI.loaders.Loader('/assets/');
    loader.add('sprite-sheet', 'sprite-sheet.json');
    loader.load(onAssetLoad);

    // Load sound sprite
    this.sounds = new Audio('assets/sound-sprite.mp3');
    this.soundSprites = {
      spin: [0, 2],
      win: [2.418, 1.638],
    };
  }

  /**
   * On window changes reposition the wheel and arrow
   */
  fixPosition() {
    const scale = this.defaultWidth ?
      Math.min(1, this.app.renderer.width / this.defaultWidth,
              this.app.renderer.height / this.defaultHeight)
      : 1;

    if(this.wheel) {
      // Fix the position of the wheel
      this.wheel.x = this.app.renderer.width / 2;
      this.wheel.y = this.app.renderer.height / 2;

      // Scale wheel based on browser size
      this.wheel.scale.x = scale;
      this.wheel.scale.y = scale;
    }

    if(this.arrow) {
      // Fix the position of the arrow
      this.arrow.x = (this.app.renderer.width / 2) + (this.wheel.width / 2);
      this.arrow.y = this.app.renderer.height / 2;

      // Scale arrow based on browser size
      this.arrow.scale.x = scale;
      this.arrow.scale.y = scale;
    }

    this.scale = scale;
  }

  /**
   * Returns calculated angle to spin
   * @returns {Object} In sectors, in radians, duration
   */
  getSpinValue() {
    // At least 2 full spins + random in another 2 spins
    const sectors = this.spinSectors.min + Math.floor(Math.random() * this.spinSectors.additional);
    const value = (sectors - this.spinSectors.min) / this.spinSectors.additional;
    const result = {
      sectors,
      radians: sectors * this.sectorRadians,
      duration: this.spinDuration.min + (this.spinDuration.additional * value),
    };
    return result;
  }

  /**
   * From given wheel rotation state return sector value to which arrow is pointing
   * @param {Number} radians - rotation in radians
   * @returns {Number} spin resulting number
   */
  getValue(radians) {
    const index = Math.round((radians / this.sectorRadians)) % this.length;
    return this.sectors[index];
  }

  /**
   * Easing function easeOutQuad for wheel spinning
   * @param {Number} t progress in range [0, 1]
   * @returns {Number} value
   */
  easing(t) {
    return t * (2 - t);
  }

  /**
   * Spin the wheel
   */
  spin() {
    const spinValue = this.getSpinValue();
    const radians = spinValue.radians;
    // Set status to spinning
    this.spinning = true;
    this.playSound('spin', true);

    const startRotation = this.wheel.rotation;
    const duration = spinValue.duration;
    // Timeout for each interval tick
    const timeout = 20;

    // Previous arrow shake position
    let previousShake = startRotation - (this.sectorRadians / 2);
    let currentDuration = 0;
    const interval = setInterval(() => {
      currentDuration += timeout;
      if(currentDuration <= duration) {
        // Rotate wheel
        const value = startRotation + (radians * this.easing(currentDuration / duration));
        this.wheel.rotation = value;
        // If wheel has turned at least 1 sector then shake arrow
        if(value - previousShake >= this.sectorRadians) {
          this.shakeArrow();
          previousShake = value;
        }
      }
      else {
        clearInterval(interval);
        this.spinning = false;
        // Clear rotation value, so it is in range (0 - 360 degrees)
        this.wheel.rotation = this.wheel.rotation % (this.sectorRadians * this.length);
        // This also stops spinning sound
        this.playSound('win');
        this.showWinningNumbers(this.getValue(this.wheel.rotation));
      }
    }, timeout);
  }

  /**
   * Rotate arrow down and then back up again,
   * continue from previous position if next shake is initiated
   */
  shakeArrow() {
    // Return if asset is not loaded yet
    if(!this.arrow) {
      return;
    }
    let toAdd = -0.1;
    // Stop any previous shakes that are in progress
    clearInterval(this.arrowInterval);
    this.arrowInterval = setInterval(() => {
      // When arrow reaches -0.5 radian rotation,
      // then rotate it back to starting position by changing direction
      if(this.arrow.rotation <= -0.5) {
        toAdd = 0.1;
      }
      this.arrow.rotation += toAdd;
      // When arrow rotation is more than or equals 0, then finish animation
      if(this.arrow.rotation >= 0) {
        this.arrow.rotation = 0;
        clearInterval(this.arrowInterval);
      }
    }, 10)
  }

  /**
   * Call winning numbers recursively
   * @param {Number} number spinning result
   */
  showWinningNumbers(number) {
    // Set status to showing result
    this.showingResult = true;
    this.showWinningNumber(1, number);
  }

  /**
   * Show number when counting up to winning n umber
   * @param {Number} number to show
   * @param {Number} finalNumber finalNumber to check if recursion should continue
   */
  showWinningNumber(number, finalNumber) {
    const timeout = number === finalNumber ? 2250 : 250;
    const textProperties = {
      fontFamily: 'Arial',
      fontSize: 320,
      fill: 0xffffff,
      align: 'center',
      stroke: '#4a1850',
      strokeThickness: 20,
    };
    const text = new PIXI.Text(number, textProperties);

    text.scale.x = this.scale || 1;
    text.scale.y = this.scale || 1;

    // Setup the position of the text
    text.x = this.app.renderer.width / 2;
    text.y = this.app.renderer.height / 2;

    text.anchor.x = 0.5;
    text.anchor.y = 0.5;

    this.app.stage.addChild(text);

    setTimeout(() => {
      // Animation to decrease opacity and scale
      const interval = setInterval(() => {
        text.alpha -= 0.05;
        text.scale.x -= 0.05;
        text.scale.y -= 0.05;
        if(text.scale.x < 0 || text.scale.y < 0) {
          text.scale.x = 0;
          text.scale.y = 0;
        }
        // If animation is done
        if(text.scale.x <= 0 && text.alpha <= 0) {
          clearInterval(interval);
          this.app.stage.removeChild(text);
          if(number < finalNumber)
          {
            // Recursive call for next number
            this.showWinningNumber(number + 1, finalNumber);
          } else {
            this.showingResult = false;
          }
        }
      }, 10);
    }, timeout);
  }

  /**
   * User cant spin the wheel if wheel is already spinning
   * or the results are showing
   * @returns {Boolean} activity status of wheel
   */
  isActive() {
    return this.spinning || this.showingResult;
  }

  /**
   * Play sound from sound sprite
   * @param {String} name of sound to play
   * @param {Boolean} loop sound
   */
  playSound(name, loop) {
    // Stop any previous sound
    this.sounds.pause();
    clearTimeout(this.soundTimeout);

    // Set to time in sprite
    this.sounds.currentTime = this.soundSprites[name][0];
    this.sounds.play();

    // Stop playing after specified duration
    const self = this;
    this.soundTimeout = setTimeout(() => {
      self.sounds.pause();
      // Loop recursively spinning sound
      if(loop) {
        this.playSound(name, loop);
      }
    }, this.soundSprites[name][1] * 1000);
  }

}

class Main {

  constructor() {
    this.app = new PIXI.Application(800, 600);
    document.body.appendChild(this.app.view);

    this.app.ticker.add(
        (deltaTime) => this.enterFrame()
    );

    window.addEventListener('click', () => {
      if(!this.wheel.isActive()) {
        this.wheel.spin();
      }
    });

    this.wheel = new Wheel(this.app);
  }

  /**
   * Main enterFrame loop.
   */
  enterFrame() {
    this.app.renderer.resize(
        Math.min(window.innerWidth, document.documentElement.clientWidth),
        Math.min(window.innerHeight, document.documentElement.clientHeight),
    );
    this.wheel.fixPosition();
  }

}

new Main();
