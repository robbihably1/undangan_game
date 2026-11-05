// =========================================================================
// MOVEMENT.JS - SISTEM PERGERAKAN KARAKTER, KECEPATAN, & INTEGRASI COLLISION
// Menjaga karakter tetap di jalan setapak, sinkronisasi langkah kaki & arah
// =========================================================================

export class MovementSystem {
  constructor(character, collisionSystem, controls) {
    this.character = character;
    this.collision = collisionSystem;
    this.controls = controls;

    this.walkSpeed = 4.2;
    // Posisi awal karakter di jalan utama depan tenda resepsi & photobooth
    this.position = { x: 0, y: 0, z: 9 };

    this.character.setPosition(this.position.x, 0, this.position.z);
  }

  setCharacter(newCharacter) {
    this.character = newCharacter;
    this.character.setPosition(this.position.x, 0, this.position.z);
  }

  update(delta) {
    if (!this.character) return;

    const input = this.controls.getMovementVector();
    let actualSpeed = 0;
    let deltaX = 0;
    let deltaZ = 0;

    if (input.isMoving) {
      const moveSpeed = this.walkSpeed * input.magnitude;

      deltaX = input.x * moveSpeed * delta;
      deltaZ = input.z * moveSpeed * delta;

      // Selesaikan dengan sistem batas jalan & sliding collision
      const result = this.collision.resolveMovement(
        this.position.x,
        this.position.z,
        deltaX,
        deltaZ
      );

      const distanceMoved = Math.hypot(result.x - this.position.x, result.z - this.position.z);
      actualSpeed = delta > 0 ? (distanceMoved / delta) : 0;

      this.position.x = result.x;
      this.position.z = result.z;
    }

    // Hitung ketinggian lantai (napak di panggung pos / jembatan) dengan interpolasi halus
    const targetY = this.collision.getSurfaceHeight ? this.collision.getSurfaceHeight(this.position.x, this.position.z) : 0;
    this.position.y += (targetY - this.position.y) * Math.min(1, delta * 12);

    this.character.setPosition(this.position.x, this.position.y, this.position.z);

    const isActuallyMoving = input.isMoving && actualSpeed > 0.05;
    const speedRatio = Math.max(0.4, actualSpeed / this.walkSpeed);

    this.character.updateAnimation(
      delta,
      { x: input.x, z: input.z },
      isActuallyMoving,
      speedRatio
    );
  }

  getPosition() {
    return this.position;
  }
}
