// =========================================================================
// CONTROLS.JS - SISTEM KONTROL KEYBOARD & VIRTUAL JOYSTICK MOBILE
// Menyatukan input desktop (WASD/Panah) & smartphone (Virtual Joystick)
// =========================================================================

export class GameControls {
  constructor() {
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      interact: false,
      debug: false
    };

    this.joystickVector = { x: 0, z: 0 };
    this.isJoystickActive = false;
    this.interactRequested = false;

    this.initKeyboard();
    this.initVirtualJoystick();
  }

  initKeyboard() {
    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        return;
      }

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.keys.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.keys.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.keys.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.keys.right = true;
          break;
        case 'KeyE':
        case 'Space':
        case 'Enter':
          this.interactRequested = true;
          break;
        case 'KeyH':
          this.keys.debug = !this.keys.debug;
          if (this.onDebugToggle) this.onDebugToggle();
          break;
        case 'Escape':
          if (this.onEscape) this.onEscape();
          break;
      }
    });

    window.addEventListener('keyup', (e) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.keys.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.keys.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.keys.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.keys.right = false;
          break;
      }
    });
  }

  initVirtualJoystick() {
    const base = document.getElementById('joystick-base');
    const thumb = document.getElementById('joystick-thumb');

    if (!base || !thumb) return;

    const maxRadius = 38;
    let touchId = null;
    let baseRect = null;
    let centerX = 0;
    let centerY = 0;

    const handleStart = (clientX, clientY, identifier = null) => {
      touchId = identifier;
      this.isJoystickActive = true;
      baseRect = base.getBoundingClientRect();
      centerX = baseRect.left + baseRect.width / 2;
      centerY = baseRect.top + baseRect.height / 2;
      handleMove(clientX, clientY);
    };

    const handleMove = (clientX, clientY) => {
      if (!this.isJoystickActive) return;

      const deltaX = clientX - centerX;
      const deltaY = clientY - centerY;
      const distance = Math.hypot(deltaX, deltaY);

      let clampedX = deltaX;
      let clampedY = deltaY;

      if (distance > maxRadius) {
        clampedX = (deltaX / distance) * maxRadius;
        clampedY = (deltaY / distance) * maxRadius;
      }

      thumb.style.transform = `translate(${clampedX}px, ${clampedY}px)`;
      this.joystickVector.x = clampedX / maxRadius;
      this.joystickVector.z = clampedY / maxRadius;
    };

    const handleEnd = () => {
      this.isJoystickActive = false;
      touchId = null;
      thumb.style.transform = 'translate(0px, 0px)';
      this.joystickVector.x = 0;
      this.joystickVector.z = 0;
    };

    base.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.changedTouches[0];
      handleStart(touch.clientX, touch.clientY, touch.identifier);
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (!this.isJoystickActive) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchId) {
          handleMove(e.changedTouches[i].clientX, e.changedTouches[i].clientY);
          break;
        }
      }
    }, { passive: false });

    window.addEventListener('touchend', (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchId) {
          handleEnd();
          break;
        }
      }
    });

    window.addEventListener('touchcancel', () => handleEnd());

    base.addEventListener('mousedown', (e) => {
      handleStart(e.clientX, e.clientY);

      const onMouseMove = (ev) => handleMove(ev.clientX, ev.clientY);
      const onMouseUp = () => {
        handleEnd();
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    });
  }

  getMovementVector() {
    let vx = 0;
    let vz = 0;

    if (this.keys.forward) vz -= 1;
    if (this.keys.backward) vz += 1;
    if (this.keys.left) vx -= 1;
    if (this.keys.right) vx += 1;

    if (this.isJoystickActive) {
      vx = this.joystickVector.x;
      vz = this.joystickVector.z;
    }

    const length = Math.hypot(vx, vz);
    if (length > 1.0) {
      vx /= length;
      vz /= length;
    }

    return {
      x: vx,
      z: vz,
      isMoving: length > 0.08,
      magnitude: Math.min(1.0, length)
    };
  }

  consumeInteract() {
    const triggered = this.interactRequested;
    this.interactRequested = false;
    return triggered;
  }
}
