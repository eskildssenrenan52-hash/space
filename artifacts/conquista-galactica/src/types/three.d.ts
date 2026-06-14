declare module 'three' {
  export * from 'three/src/Three.js';
  export class Vector3 {
    x: number; y: number; z: number;
    constructor(x?: number, y?: number, z?: number);
    set(x: number, y: number, z: number): this;
    clone(): Vector3;
    copy(v: Vector3): this;
    add(v: Vector3): this;
    sub(v: Vector3): this;
    multiplyScalar(s: number): this;
    length(): number;
    normalize(): this;
    dot(v: Vector3): number;
    cross(v: Vector3): this;
    distanceTo(v: Vector3): number;
    applyMatrix4(m: Matrix4): this;
    project(camera: Camera): this;
    unproject(camera: Camera): this;
    [key: string]: unknown;
  }
  export class Matrix4 { [key: string]: unknown; }
  export class Camera { [key: string]: unknown; }
  export class Color { [key: string]: unknown; constructor(color?: string | number); r: number; g: number; b: number; }
  export class BufferGeometry { [key: string]: unknown; }
  export class Material { [key: string]: unknown; }
  export class Mesh { [key: string]: unknown; }
  export class Group { [key: string]: unknown; }
  export class Scene { [key: string]: unknown; }
  export class WebGLRenderer { [key: string]: unknown; }
  export class PerspectiveCamera { [key: string]: unknown; }
  export class AmbientLight { [key: string]: unknown; }
  export class PointLight { [key: string]: unknown; }
  export class DirectionalLight { [key: string]: unknown; }
  export class Float32BufferAttribute { [key: string]: unknown; constructor(array: number[], itemSize: number); }
  export class Points { [key: string]: unknown; }
  export class PointsMaterial { [key: string]: unknown; }
  export class SphereGeometry { [key: string]: unknown; }
  export class MeshStandardMaterial { [key: string]: unknown; }
  export class MeshBasicMaterial { [key: string]: unknown; }
  export class MeshPhongMaterial { [key: string]: unknown; }
  export class LineBasicMaterial { [key: string]: unknown; }
  export class BufferAttribute { [key: string]: unknown; }
  export class Raycaster { [key: string]: unknown; }
  export class Euler { [key: string]: unknown; }
  export class Quaternion { [key: string]: unknown; }
  export class Object3D { [key: string]: unknown; }
  export class Line { [key: string]: unknown; }
  export class CatmullRomCurve3 { [key: string]: unknown; }
  export class TubeGeometry { [key: string]: unknown; }
  export class TextureLoader { [key: string]: unknown; }
  export class Texture { [key: string]: unknown; }
  export class ShaderMaterial { [key: string]: unknown; }
  export class PlaneGeometry { [key: string]: unknown; }
  export class BoxGeometry { [key: string]: unknown; }
  export class CylinderGeometry { [key: string]: unknown; }
  export class TorusGeometry { [key: string]: unknown; }
  export class RingGeometry { [key: string]: unknown; }
  export class InstancedMesh { [key: string]: unknown; }
  export class Clock { [key: string]: unknown; getDelta(): number; getElapsedTime(): number; }
  export const MathUtils: { [key: string]: unknown; clamp(x: number, min: number, max: number): number; lerp(x: number, y: number, t: number): number; };
  export const AdditiveBlending: number;
  export const NormalBlending: number;
  export const DoubleSide: number;
  export const FrontSide: number;
  export const BackSide: number;
  export const NoBlending: number;
  export const LinearFilter: number;
  export const NearestFilter: number;
  export const RepeatWrapping: number;
  export const ClampToEdgeWrapping: number;
  export const PCFSoftShadowMap: number;
  export const sRGBEncoding: number;
  export const SRGBColorSpace: string;
}
