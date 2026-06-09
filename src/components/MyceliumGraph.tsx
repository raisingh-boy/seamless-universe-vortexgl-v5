/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { SomaticNode, SomaticLink, Domain, World, NodeStatus, CommunityUser, MyceliumGraphProps } from '../types';
import { SAMPLE_AUDIO } from '../data/nodesData';
import { Flame } from 'lucide-react';

export const DOMAIN_COLORS: Record<Domain, string> = {
  body: '#E8A95C',      // Теплый янтарный
  science: '#5C9BE8',   // Холодный синий
  philosophy: '#9B5CE8',// Фиолетовый
  movement: '#5CE87A',  // Зеленый
  cognition: '#EAEAEA',  // Серебристо-белый
  hybrid: '#E85C7A'     // Кораллово-розовый
};

export function getEpochNumberForNode(node: SomaticNode): number {
  if (node.id === 'central-me' || node.id === 'root') return 0;
  if (node.world === 'field') return 8;
  const years = (node.epochEn || '').toLowerCase();
  const desc = (node.descriptionEn || '').toLowerCase();
  const id = node.id.toLowerCase();
  if (
    id.includes('buddha') || id.includes('aristotle') || id.includes('plato') || id.includes('antiquity') ||
    desc.includes('antiquity') || desc.includes('ancient greece') || desc.includes('buddhism') ||
    years.includes('bc') || (years.includes('ce') && !years.includes('19') && !years.includes('20') && !years.includes('18')) ||
    id.includes('yoga') || id.includes('socrates') || id.includes('zen') || id.includes('qigong')
  ) {
    return 1;
  }
  if (
    id.includes('sufi') || desc.includes('medieval') || desc.includes('middle ages') ||
    id.includes('zen_masters') || id.includes('kabbalah') || years.includes('1100') || years.includes('1200') ||
    years.includes('1300') || years.includes('1400')
  ) {
    return 2;
  }
  if (
    id.includes('descartes') || id.includes('newton') || id.includes('spinoza') || id.includes('renaissance') ||
    desc.includes('renaissance') || desc.includes('17th century') || desc.includes('18th century') ||
    years.includes('1500') || years.includes('1600') || years.includes('1700') ||
    id.includes('shinto') || id.includes('martial_arts')
  ) {
    return 3;
  }
  if (
    id.includes('darwin') || id.includes('nietzsche') || id.includes('freud') || id.includes('19th_century') ||
    desc.includes('19th century') || years.includes('18') || years.includes('1800') || years.includes('1860') ||
    years.includes('1880') || id.includes('duncan') || id.includes('alexander_technique')
  ) {
    return 4;
  }
  if (
    id.includes('phenomenology') || id.includes('graham') || id.includes('cunningham') ||
    desc.includes('early 20th') || years.includes('1900') || years.includes('1910') || years.includes('1920') ||
    years.includes('1930') || years.includes('1940') || id.includes('laban') || id.includes('wigman') ||
    id.includes('bateson')
  ) {
    return 5;
  }
  if (
    id.includes('contact_improv') || id.includes('somatics') || id.includes('cybernetics') ||
    id.includes('paxton') || id.includes('feldenkrais') || id.includes('hanna') || id.includes('rolfing') ||
    years.includes('1950') || years.includes('1960') || years.includes('1970') ||
    years.includes('1972') || years.includes('1959')
  ) {
    return 6;
  }
  if (
    id.includes('complexity') || id.includes('embodied_ai') || id.includes('cognitive_sci') ||
    years.includes('1980') || years.includes('1990') || desc.includes('late 20th')
  ) {
    return 7;
  }
  return 8;
}

// Кастомный хук для детекции и трансляции положения курсора в 3D сцену
function usePointer3D() {
  const { camera, raycaster } = useThree();
  const pointer3D = useRef(new THREE.Vector3());
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);

  useFrame((state) => {
    raycaster.setFromCamera(state.pointer, camera);
    raycaster.ray.intersectPlane(plane, pointer3D.current);
  });

  return pointer3D;
}

export const getNodeHash = (node: SomaticNode) => {
  const contentStr = (node.nameEn || '') + (node.nameRu || '') + (node.id || '') + (node.type || '') + (node.domain || '');
  let hash = 0;
  for (let i = 0; i < contentStr.length; i++) {
    hash = (hash << 5) - hash + contentStr.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

function SomaticSphere({
  node, isSelected, isHovered, isActiveAudio, color, onClick, currentWorld, overlayUser, selectedEpoch, linksCount = 0
}: {
  node: SomaticNode; isSelected: boolean; isHovered: boolean; isActiveAudio: boolean;
  color: string; onClick: (n: SomaticNode) => void; currentWorld: World; overlayUser: string | null;
  selectedEpoch?: number; linksCount?: number;
}) {
  const outerGroupRef = useRef<THREE.Group>(null!);
  const meshRef = useRef<THREE.Mesh>(null!);
  const coreRef = useRef<THREE.Mesh>(null!);
  const glowRef = useRef<THREE.Mesh>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);
  const particlesRef = useRef<THREE.Points>(null!);
  const SCALE = 0.045;

  const inEpoch = selectedEpoch === undefined || selectedEpoch === 0 || node.id === 'central-me' || getEpochNumberForNode(node) === selectedEpoch;
  const isOverlayMatch = !!(overlayUser && (
    node.authorRu?.includes(overlayUser) ||
    node.authorEn?.includes(overlayUser) ||
    node.descriptionEn?.toLowerCase().includes(overlayUser.toLowerCase()) ||
    node.descriptionRu?.toLowerCase().includes(overlayUser.toLowerCase())
  ));
  const finalColor = isOverlayMatch ? '#FFD700' : color;

  const statusOpacity: Record<NodeStatus, number> = {
    seed: 0.15, sprout: 0.45, alive: 0.8, rooted: 1.0, atlas: 1.0
  };
  let baseOpacity = (currentWorld === 'field' && node.world === 'atlas')
    ? 0.25
    : (statusOpacity[node.status] || 1.0);
  const idleDays = node.lastActiveAt ? (Date.now() - node.lastActiveAt) / (1000 * 3600 * 24) : 0;
  const decayFactor = (node.world === 'field' && idleDays > 30) ? Math.max(0.08, Math.pow(0.95, idleDays - 30)) : 1.0;
  const opacity = baseOpacity * decayFactor * (inEpoch ? 1.0 : 0.2);

  // Extract phenotypic visual genes from node content hash
  const geneSeed = useMemo(() => getNodeHash(node), [node]);
  const getGene = (index: number, min: number, max: number) => {
    const x = Math.sin(geneSeed + index * 138.29) * 10000;
    const p = x - Math.floor(x);
    return min + p * (max - min);
  };

  const roughness = useMemo(() => getGene(1, 0.05, 0.35), [geneSeed]);
  const transmission = useMemo(() => getGene(2, 0.5, 0.95), [geneSeed]);
  const thickness = useMemo(() => getGene(3, 0.4, 1.8), [geneSeed]);
  const ior = useMemo(() => getGene(4, 1.25, 1.7), [geneSeed]);
  const clearcoat = useMemo(() => getGene(5, 0.6, 1.0), [geneSeed]);
  const sheen = useMemo(() => getGene(6, 0.4, 1.0), [geneSeed]);

  // Harmonizing glowing inner nucleus color
  const coreColor = useMemo(() => {
    const baseColor = new THREE.Color(finalColor);
    const hsl = { h: 0, s: 0, l: 0 };
    baseColor.getHSL(hsl);
    const shiftedHue = (hsl.h + 0.12) % 1.0;
    const highSat = Math.min(1.0, hsl.s * 1.25);
    const vibrantLight = Math.min(0.9, hsl.l * 1.15);
    return new THREE.Color().setHSL(shiftedHue, highSat, vibrantLight);
  }, [finalColor]);

  // Glowing core scale reflects maturity/resonance level beautifully
  const coreScaleFactor = useMemo(() => {
    const baseRes = node.resonances || 0;
    return 0.38 + Math.min(0.35, baseRes * 0.003); // range 0.38 to 0.73
  }, [node.resonances]);

  // Memoized DNA context settings
  const nodeTypeIndex = useMemo(() => {
    switch (node.type) {
      case 'concept': return 0.0;
      case 'practice': return 1.0;
      case 'person': return 2.0;
      case 'movement': return 3.0;
      case 'event': return 4.0;
      case 'observation': return 5.0;
      case 'question': return 6.0;
      default: return 0.0;
    }
  }, [node.type]);

  const nodeMaturity = useMemo(() => {
    switch (node.status) {
      case 'seed': return 0.5;
      case 'sprout': return 0.8;
      case 'alive': return 1.1;
      case 'rooted': return 1.4;
      case 'atlas': return 1.6;
      default: return 1.0;
    }
  }, [node.status]);

  // Custom shader uniforms for smooth organic cellular deformation (onBeforeCompile)
  const shaderUniforms = useRef({
    uTime: { value: 0 },
    uDnaSeed: { value: geneSeed },
    uSelected: { value: 0 },
    uActiveAudio: { value: 0 },
    uSpeedFactor: { value: 1.0 },
    uAmpFactor: { value: 1.0 },
    uFreqFactor: { value: 1.0 },
    uPseudopodFactor: { value: 1.0 },
    uLinksWeight: { value: 0.0 },
    uNodeType: { value: 0.0 },
    uResonances: { value: 0.0 },
    uMaturity: { value: 1.0 },
    uTension: { value: new THREE.Vector3() }
  });

  // Calculate dynamic parameters based on academic/somatic domain DNA
  const domainPhysics = useMemo(() => {
    switch (node.domain) {
      case 'body': // fast, deep somatic undulations
        return { speed: 1.5, amp: 1.15, freq: 0.95, pseudopod: 1.4 };
      case 'science': // highly structured concentric waves
        return { speed: 0.6, amp: 0.55, freq: 1.8, pseudopod: 0.35 };
      case 'movement': // swift sweeps along the locomotion path
        return { speed: 2.1, amp: 0.95, freq: 1.3, pseudopod: 0.85 };
      case 'philosophy': // deep, tranquil, meditative breathing waves
        return { speed: 0.4, amp: 1.4, freq: 0.65, pseudopod: 1.6 };
      case 'cognition': // ultra-high frequency electric nerve ripples
        return { speed: 1.8, amp: 0.75, freq: 2.1, pseudopod: 0.5 };
      default:
        return { speed: 1.0, amp: 1.0, freq: 1.0, pseudopod: 1.0 };
    }
  }, [node.domain]);

  // Callback to compiled vertex shader for gorgeous biological shapes (fully accelerated on GPU!)
  const handleBeforeCompile = React.useCallback((shader: any) => {
    shader.uniforms.uTime = shaderUniforms.current.uTime;
    shader.uniforms.uDnaSeed = shaderUniforms.current.uDnaSeed;
    shader.uniforms.uSelected = shaderUniforms.current.uSelected;
    shader.uniforms.uActiveAudio = shaderUniforms.current.uActiveAudio;
    shader.uniforms.uSpeedFactor = shaderUniforms.current.uSpeedFactor;
    shader.uniforms.uAmpFactor = shaderUniforms.current.uAmpFactor;
    shader.uniforms.uFreqFactor = shaderUniforms.current.uFreqFactor;
    shader.uniforms.uPseudopodFactor = shaderUniforms.current.uPseudopodFactor;
    shader.uniforms.uLinksWeight = shaderUniforms.current.uLinksWeight;
    shader.uniforms.uNodeType = shaderUniforms.current.uNodeType;
    shader.uniforms.uResonances = shaderUniforms.current.uResonances;
    shader.uniforms.uMaturity = shaderUniforms.current.uMaturity;
    shader.uniforms.uTension = shaderUniforms.current.uTension;

    shader.vertexShader = `
      uniform float uTime;
      uniform float uDnaSeed;
      uniform float uSelected;
      uniform float uActiveAudio;
      uniform float uSpeedFactor;
      uniform float uAmpFactor;
      uniform float uFreqFactor;
      uniform float uPseudopodFactor;
      uniform float uLinksWeight;
      uniform float uNodeType;
      uniform float uResonances;
      uniform float uMaturity;
      uniform vec3 uTension;

      vec3 rotate3D(vec3 p, float angle) {
        float s = sin(angle), c = cos(angle);
        float nx = p.x * c - p.z * s;
        float nz = p.x * s + p.z * c;
        return vec3(nx, p.y, nz);
      }

      float getBiologicalDisplacement(vec3 pos, float time, float seed) {
        float localSpeed = 0.65 + sin(seed) * 0.25;
        float t = time * 1.05 * uSpeedFactor * localSpeed;
        
        float seedPhase1 = seed * 1.37;
        float seedPhase2 = seed * 3.19;
        
        vec3 flowCoord = pos * uFreqFactor * 1.1;
        flowCoord.y += sin(t * 0.4 + seedPhase1) * 0.5;
        flowCoord.xz += vec2(cos(t * 0.3 - seedPhase2), sin(t * 0.55 + seedPhase1)) * 0.4;
        
        // 1. Amoebic pseudopod lobes deformed by DNA & ACTIVE LINKS!
        // Highly connected nodes sprout active biological synapses (tentacles/protrusions)
        float linksBoost = 1.0 + uLinksWeight * 1.4;
        float lobe1 = sin(flowCoord.x * 1.3 + t * 0.45) * cos(flowCoord.y * 1.2 - t * 0.32) * 0.25 * uPseudopodFactor * linksBoost;
        float lobe2 = cos(flowCoord.z * 1.4 - t * 0.52) * sin(flowCoord.x * 1.05 + t * 0.28) * 0.25 * uPseudopodFactor * linksBoost;
        
        // 2. Secondary organic cell-membrane bulges scaled by resources and maturity
        vec3 rotCoord2 = rotate3D(pos * uFreqFactor * (2.6 + uLinksWeight * 1.2), seed * 0.52 + t * 0.15);
        float bulgeFreq = 0.09 * uAmpFactor * (1.0 + uResonances * 0.005);
        float bulge = (sin(rotCoord2.x) * cos(rotCoord2.y) + sin(rotCoord2.z) * cos(rotCoord2.x)) * bulgeFreq;
        
        // 3. High-frequency delicate cytoplasmic ripples
        vec3 rotCoord3 = rotate3D(pos * uFreqFactor * 4.8, -seed * 0.84 - t * 0.22);
        float ripples = (cos(rotCoord3.y) * sin(rotCoord3.z) + sin(rotCoord3.x) * cos(rotCoord3.y)) * 0.04 * uAmpFactor;
        
        // 4. Base biological morph geometry based on uNodeType (0 to 6)!
        // Morph the single unified surface coordinates organically based on categorization:
        float typeMorph = 0.0;
        
        if (uNodeType > 0.5 && uNodeType < 1.5) { // 1. PRACTICE: Rounded Cube
          // Pull faces out to form a soft rounded box surface organically
          float boxTension = 0.15 * uMaturity;
          typeMorph += (pow(abs(pos.x), 4.0) + pow(abs(pos.y), 4.0) + pow(abs(pos.z), 4.0) - 0.5) * boxTension;
        }
        else if (uNodeType > 1.5 && uNodeType < 2.5) { // 2. PERSON: Majestic Ellipsoid Bulge (Agency)
          // Organic stretch along axial gravities
          typeMorph += (sin(pos.y * 2.0 + t * 0.5) * 0.18 + cos(pos.x * 2.0) * 0.08) * uMaturity;
        }
        else if (uNodeType > 2.5 && uNodeType < 3.5) { // 3. MOVEMENT: Amoeboid Elongation (Locomotion)
          // Tear-drop or crawling dual-lobe movement sweep along rotation vector
          vec3 sweepDir = rotate3D(pos, t * 0.8);
          typeMorph += (pow(max(0.0, sweepDir.y + 0.3), 2.5) * 0.16) * uMaturity;
        }
        else if (uNodeType > 3.5 && uNodeType < 4.5) { // 4. EVENT: Peak Conical Wave (Action spike)
          // Directional high-amplitude pointed wave
          typeMorph += (max(0.0, dot(pos, vec3(0.0, 1.0, 0.0))) * 0.35 * (1.0 + sin(t * 3.0) * 0.2)) * uMaturity;
        }
        else if (uNodeType > 4.5 && uNodeType < 5.5) { // 5. OBSERVATION: Crystalline Ripply Gaze
          // High-frequency star-like faceted peaks
          float starFactor = (cos(pos.x * 6.0) * sin(pos.y * 6.0) * cos(pos.z * 6.0));
          typeMorph += starFactor * 0.14 * uMaturity;
        }
        else if (uNodeType > 5.5 && uNodeType < 6.5) { // 6. QUESTION: Triangle Tensile Pull
          // Stress pulling in 3 directions along the equator
          float angle = atan(pos.y, pos.x);
          typeMorph += sin(angle * 3.0 + t * 0.3) * 0.16 * (1.0 - abs(pos.z)) * uMaturity;
        }
        
        float envelope = lobe1 + lobe2 + bulge + ripples + typeMorph;
        
        float boost = 1.0 + uActiveAudio * 0.65 + uSelected * 0.25;
        return envelope * boost;
      }
    ` + shader.vertexShader;

    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      float dForce = getBiologicalDisplacement(position, uTime, uDnaSeed);

      // Apply tension deformation - stretch towards tension vector
      float stretch = dot(normal, normalize(uTension + vec3(0.0001))) * length(uTension);
      transformed += normal * (dForce * (1.1 + uSelected * 0.32) + stretch * 0.5);
      `
    );
  }, [nodeTypeIndex, nodeMaturity]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const breath = 1 + Math.sin(t * (node.breathSpeed || 0.4) + (node.breathPhase || 0)) * 0.07;
    const base = (node.currentRadius || 10) * SCALE;

    const camDist = state.camera.position.length();
    let lodScale = 1.0;
    if (node.level === 'micro' && node.id !== 'central-me') {
      if (camDist > 24) lodScale = 0.0;
      else if (camDist > 16) lodScale = 1.0 - (camDist - 16) / 8;
    } else if (node.level === 'meso' && node.id !== 'central-me') {
      if (camDist > 38) lodScale = 0.0;
      else if (camDist > 28) lodScale = 1.0 - (camDist - 28) / 10;
    }

    // Pass dynamic clock time and properties directly to shader uniforms
    shaderUniforms.current.uTime.value = t;
    shaderUniforms.current.uSelected.value = isSelected ? 1.0 : 0.0;
    shaderUniforms.current.uActiveAudio.value = isActiveAudio ? 1.0 : 0.0;
    shaderUniforms.current.uSpeedFactor.value = domainPhysics.speed;
    shaderUniforms.current.uAmpFactor.value = domainPhysics.amp;
    shaderUniforms.current.uFreqFactor.value = domainPhysics.freq;
    shaderUniforms.current.uPseudopodFactor.value = domainPhysics.pseudopod;
    shaderUniforms.current.uLinksWeight.value = Math.min(6.0, Number(linksCount || 0)) / 6.0;
    shaderUniforms.current.uNodeType.value = nodeTypeIndex;
    shaderUniforms.current.uResonances.value = Number(node.resonances || 0);
    shaderUniforms.current.uMaturity.value = nodeMaturity;

    // Calculate tension based on velocity (drag/physics)
    const vel = new THREE.Vector3(node.vx || 0, node.vy || 0, node.vz || 0);
    shaderUniforms.current.uTension.value.lerp(vel.multiplyScalar(0.5), 0.1);

    // Apply decay factor to opacity
    const idleDays = node.lastActiveAt ? (Date.now() - node.lastActiveAt) / (1000 * 3600 * 24) : 0;
    const decayFactor = (node.world === 'field' && idleDays > 30) ? Math.max(0.08, Math.pow(0.95, idleDays - 30)) : 1.0;

    shaderUniforms.current.uMaturity.value = nodeMaturity * decayFactor;

    // Soft organic breathing scale factor
    const squishX = base * breath * lodScale;
    const squishY = base * breath * lodScale;
    const squishZ = base * breath * lodScale;

    let sx = squishX;
    let sy = squishY;
    let sz = squishZ;

    if (isSelected) {
      sx *= 1.45;
      sy *= 1.45;
      sz *= 1.45;
    } else if (isActiveAudio) {
      sx *= 1.35;
      sy *= 1.35;
      sz *= 1.35;
    }

    // Set group position with majestic, slow biological swaying (purely visual-only to avoid coordinate noise in physics simulation!)
    const x = (node.x || 0) * SCALE;
    const y = (node.y || 0) * SCALE;
    const z = (node.z || 0) * SCALE;

    const swaySpeed = 0.55;
    const swayAmpX = 0.14;
    const swayAmpY = 0.14;
    const swayAmpZ = 0.08;
    const indexOffset = (node.breathPhase || 0) * 1.5;

    const visualX = x + Math.sin(t * swaySpeed + indexOffset) * swayAmpX;
    const visualY = y + Math.cos(t * swaySpeed * 0.85 + indexOffset) * swayAmpY;
    const visualZ = z + Math.sin(t * swaySpeed * 1.25 + indexOffset * 1.5) * swayAmpZ;

    if (outerGroupRef.current) {
      outerGroupRef.current.position.set(visualX, visualY, visualZ);
    }

    meshRef.current.scale.set(sx, sy, sz);
    glowRef.current.scale.set(sx * (isActiveAudio ? 2.3 : 1.6), sy * (isActiveAudio ? 2.3 : 1.6), sz * (isActiveAudio ? 2.3 : 1.6));
    glowRef.current.position.set(visualX, visualY, visualZ);

    if (coreRef.current) {
      const coreBreath = coreScaleFactor + Math.sin(t * 3.8 + (node.breathPhase || 0)) * 0.04;
      coreRef.current.scale.setScalar(coreBreath * base * lodScale * (isSelected ? 1.35 : 1.0));
      coreRef.current.rotation.x = -t * 0.35 + (node.breathPhase || 0);
      coreRef.current.rotation.y = t * 0.25;
    }

    if (node.id === 'central-me') {
      if (ringRef.current) {
        ringRef.current.scale.setScalar(base * 1.8 * (1 + Math.sin(t * 2) * 0.1) * lodScale);
        ringRef.current.rotation.z = t * 0.5;
      }
      if (particlesRef.current) {
        particlesRef.current.rotation.y = t * 0.3;
        particlesRef.current.rotation.z = t * 0.2;
      }
    }

    meshRef.current.rotation.x = t * 0.18 + (node.breathPhase || 0);
    meshRef.current.rotation.y = t * 0.14;

    let bootFade = 1.0;
    if (t < 3.0) {
      const hash = node.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 100 / 100;
      const revealDelay = hash * 2.0;
      bootFade = t < revealDelay ? 0.0 : Math.min(1.0, (t - revealDelay) / 1.0);
    }

    const mat = meshRef.current.material as THREE.MeshPhysicalMaterial;
    if (isActiveAudio) {
      mat.emissive.set('#DFB757');
      mat.emissiveIntensity = (0.7 + Math.sin(t * 8) * 0.3) * (inEpoch ? 1.0 : 0.15) * bootFade;
    } else {
      mat.emissive.set(new THREE.Color(finalColor));
      let baseInt = isOverlayMatch ? 1.6 : isSelected ? 1.0 : isHovered ? 0.7 : 0.25;
      mat.emissiveIntensity = baseInt * (inEpoch ? 1.0 : 0.15) * bootFade;
    }

    mat.transparent = true;
    mat.opacity = opacity * lodScale * bootFade;
    
    if (coreRef.current && coreRef.current.material) {
      const cMat = coreRef.current.material as THREE.MeshStandardMaterial;
      cMat.transparent = true;
      cMat.opacity = opacity * lodScale * bootFade * 0.85;
    }
  });

  const c = new THREE.Color(finalColor);
  
  // Visual biological geometry depending on content types for diverse shapes
  const renderGeometry = () => {
    // We always use a highly detailed, smooth single-surface envelope representing
    // the single continuous biological membrane deforming organically according to context DNA.
    return <icosahedronGeometry args={[1.0, 5]} />;
  };

  const centralMeParticles = useMemo(() => {
    if (node.id !== 'central-me') return null;
    const count = 40;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 1.8 + Math.random() * 0.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, [node.id]);

  return (
    <group onClick={(e) => { e.stopPropagation(); onClick(node); }}>
      {/* Ambient Additive Glow Background */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.0, 16, 16]} />
        <meshStandardMaterial
          color={c}
          transparent
          opacity={isSelected ? 0.22 : isActiveAudio ? 0.32 : inEpoch ? 0.07 : 0.01}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Central Me exclusive visual elements */}
      {node.id === 'central-me' && (
        <group position={outerGroupRef.current?.position}>
          <mesh ref={ringRef}>
            <ringGeometry args={[1, 1.05, 64]} />
            <meshStandardMaterial color="#DFB757" transparent opacity={0.6} side={THREE.DoubleSide} />
          </mesh>
          <points ref={particlesRef}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[centralMeParticles!, 3]} />
            </bufferGeometry>
            <pointsMaterial size={0.05} color="#DFB757" transparent opacity={0.8} />
          </points>
        </group>
      )}

      {/* Living Multi-layered Cell Structure */}
      <group ref={outerGroupRef}>
        {/* 1. Translucent Soft Jelly Envelope */}
        <mesh ref={meshRef}>
          {renderGeometry()}
          <meshPhysicalMaterial
            color={c}
            emissive={c}
            emissiveIntensity={0.25}
            roughness={roughness}
            metalness={0.08}
            transmission={transmission}
            thickness={thickness}
            ior={ior}
            clearcoat={clearcoat}
            clearcoatRoughness={0.08}
            sheen={sheen}
            sheenColor={c}
            transparent
            opacity={opacity}
            onBeforeCompile={handleBeforeCompile}
          />
        </mesh>

        {/* 2. Glowing Internal Nucleus */}
        <mesh ref={coreRef}>
          <sphereGeometry args={[0.52, 24, 24]} />
          <meshStandardMaterial
            color={coreColor}
            emissive={coreColor}
            emissiveIntensity={isActiveAudio ? 3.0 : isSelected ? 2.2 : isHovered ? 1.6 : 1.0}
            roughness={0.15}
            transparent
            opacity={opacity}
          />
        </mesh>
      </group>
    </group>
  );
}

function MyceliumEdge({
  source, target, color, activity, isActive, linkType = 'conceptual'
}: {
  source: SomaticNode; target: SomaticNode;
  color: string; activity: number; isActive: boolean;
  linkType?: 'conceptual' | 'historical' | 'practical' | 'resonance' | 'opposition';
}) {
  const particlesGroupRef = useRef<THREE.Group>(null!);

  const baseProgress = useRef(Math.random());
  const SCALE = 0.045;
  const PARTICLE_COUNT = 16;

  // Keep track of positions to scatter when node shifts
  const prevSourcePos = useRef<THREE.Vector3 | null>(null);
  const prevTargetPos = useRef<THREE.Vector3 | null>(null);
  const scatterIntensity = useRef(0.0);

  const getCurve = React.useCallback(() => {
    const s = new THREE.Vector3((source.x || 0) * SCALE, (source.y || 0) * SCALE, (source.z || 0) * SCALE);
    const t = new THREE.Vector3((target.x || 0) * SCALE, (target.y || 0) * SCALE, (target.z || 0) * SCALE);
    const mid = new THREE.Vector3().addVectors(s, t).multiplyScalar(0.5);
    const seed = ((source.id || '').charCodeAt(0) || 0) + ((target.id || '').charCodeAt(0) || 0);
    const perp = new THREE.Vector3(-(t.y - s.y), (t.x - s.x), (seed % 7) * 0.2).normalize().multiplyScalar(0.6 + (seed % 20) / 20 * 1.0);
    return new THREE.QuadraticBezierCurve3(s, mid.add(perp), t);
  }, [source.x, source.y, source.z, target.x, target.y, target.z]);

  const styleSettings = React.useMemo(() => {
    switch (linkType) {
      case 'historical':
        return { hexColor: '#818CF8', baseSpeed: 0.003, baseOpacity: isActive ? 0.75 : 0.35 };
      case 'practical':
        return { hexColor: '#10B981', baseSpeed: 0.009, baseOpacity: isActive ? 0.95 : 0.45 };
      case 'resonance':
        return { hexColor: '#FFAE00', baseSpeed: 0.015, baseOpacity: isActive ? 1.0 : 0.60 };
      case 'opposition':
        return { hexColor: '#EF4444', baseSpeed: 0.022, baseOpacity: isActive ? 0.90 : 0.55 };
      case 'conceptual':
      default:
        return { hexColor: color || '#6366F1', baseSpeed: 0.005, baseOpacity: isActive ? 0.85 : 0.40 };
    }
  }, [color, isActive, linkType]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const multiplier = 1 + activity * 0.12;
    const currentSpeed = (isActive ? styleSettings.baseSpeed * 2.2 : styleSettings.baseSpeed * 1.3) * multiplier;

    baseProgress.current = (baseProgress.current + currentSpeed) % 1.0;

    const curve = getCurve();
    
    // Position shifting check to trigger spore/particle scattering
    const currSource = new THREE.Vector3((source.x || 0) * SCALE, (source.y || 0) * SCALE, (source.z || 0) * SCALE);
    const currTarget = new THREE.Vector3((target.x || 0) * SCALE, (target.y || 0) * SCALE, (target.z || 0) * SCALE);
    
    if (prevSourcePos.current && prevTargetPos.current) {
      const sDist = currSource.distanceTo(prevSourcePos.current);
      const tDist = currTarget.distanceTo(prevTargetPos.current);
      if (sDist > 0.015 || tDist > 0.015) {
        // Boost scattering intensity
        scatterIntensity.current = Math.min(1.2, scatterIntensity.current + 0.35);
      }
    }
    
    prevSourcePos.current = currSource;
    prevTargetPos.current = currTarget;
    
    // Fade scatter intensity slowly
    scatterIntensity.current *= 0.92;

    // Highly fluid, continuous stream of glowing particle nodes flowing like water/light
    if (particlesGroupRef.current) {
      const children = particlesGroupRef.current.children;
      for (let i = 0; i < children.length; i++) {
        const child = children[i] as THREE.Mesh;
        // Spaced progress offset per particle to map out a seamless flowing trail
        const prog = (baseProgress.current + (i / children.length)) % 1.0;
        const pt = curve.getPoint(prog);

        // Fluid organic sinusoidal wiggles swimming through space
        const wiggleSpeed = linkType === 'resonance' ? 12.0 : linkType === 'opposition' ? 16.0 : 7.0;
        const wiggleAmp = linkType === 'opposition' ? 0.09 : linkType === 'resonance' ? 0.06 : 0.04;
        const wiggle = Math.sin(t * wiggleSpeed + prog * Math.PI * 6.0 + i) * wiggleAmp;

        const tangent = curve.getTangent(prog).normalize();
        const sideVector = new THREE.Vector3(-tangent.y, tangent.x, 0.1).normalize();
        pt.add(sideVector.multiplyScalar(wiggle));

        // Apply physical scattering offset if nodes are moving fast!
        if (scatterIntensity.current > 0.01) {
          const randOffset = new THREE.Vector3(
            Math.sin(prog * 100.0 + i) * 0.45,
            Math.cos(prog * 80.0 - i) * 0.45,
            Math.sin(prog * 120.0 + i * 2) * 0.3
          ).multiplyScalar(scatterIntensity.current);
          pt.add(randOffset);
        }

        child.position.copy(pt);

        // Sinusoidal fade in and fade out at the edges to make them emerge and submerge organically at node surfaces
        const edgeFade = Math.sin(prog * Math.PI); 
        let particleScale = (0.2 + 0.85 * edgeFade) * (1.1 - (i % 3) * 0.18);
        
        // Activity adjusts density and scale (сила от активности - гуще или реже)
        particleScale *= (0.65 + activity * 0.22);

        if (linkType === 'resonance') {
          particleScale *= (1.25 + Math.sin(t * 14.0 + prog * 9.0) * 0.4);
        }
        if (isActive) {
          particleScale *= 1.5;
        }

        child.scale.setScalar(particleScale * 0.052);

        if (child.material) {
          const mat = child.material as THREE.MeshStandardMaterial;
          mat.opacity = (0.3 + 0.7 * edgeFade * styleSettings.baseOpacity);
          mat.emissiveIntensity = (isActive ? 4.5 : 2.5) * edgeFade;
        }
      }
    }
  });

  const finalColor = new THREE.Color(styleSettings.hexColor);
  return (
    <group>
      <group ref={particlesGroupRef}>
        {Array.from({ length: PARTICLE_COUNT }).map((_, idx) => (
          <mesh key={idx}>
            <sphereGeometry args={[1, 6, 6]} />
            <meshStandardMaterial
              color={finalColor}
              emissive={finalColor}
              emissiveIntensity={2.0}
              roughness={0.1}
              transparent
              opacity={0.9}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function GoldenOverlayBridges({ nodes, SCALE }: { nodes: SomaticNode[]; SCALE: number }) {
  const line1Ref = useRef<THREE.Line>(null!);
  const line2Ref = useRef<THREE.Line>(null!);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const opacity = 0.45 + Math.sin(t * 3.5) * 0.15;

    const somaticsNode = nodes.find(n => n.id === 'soma-hanna');
    const batesonNode = nodes.find(n => n.id === 'pattern-bateson');
    const gazeNode = nodes.find(n => n.id === 'field-gaze');

    if (somaticsNode && batesonNode && line1Ref.current) {
      const p1 = new THREE.Vector3((somaticsNode.x || 0) * SCALE, (somaticsNode.y || 0) * SCALE, (somaticsNode.z || 0) * SCALE);
      const p2 = new THREE.Vector3((batesonNode.x || 0) * SCALE, (batesonNode.y || 0) * SCALE, (batesonNode.z || 0) * SCALE);
      line1Ref.current.geometry.setFromPoints([p1, p2]);
      (line1Ref.current.material as THREE.LineBasicMaterial).opacity = opacity;
    }

    if (batesonNode && gazeNode && line2Ref.current) {
      const p1 = new THREE.Vector3((batesonNode.x || 0) * SCALE, (batesonNode.y || 0) * SCALE, (batesonNode.z || 0) * SCALE);
      const p2 = new THREE.Vector3((gazeNode.x || 0) * SCALE, (gazeNode.y || 0) * SCALE, (gazeNode.z || 0) * SCALE);
      line2Ref.current.geometry.setFromPoints([p1, p2]);
      (line2Ref.current.material as THREE.LineBasicMaterial).opacity = opacity;
    }
  });

  const somaticsNode = nodes.find(n => n.id === 'soma-hanna');
  const batesonNode = nodes.find(n => n.id === 'pattern-bateson');
  const gazeNode = nodes.find(n => n.id === 'field-gaze');

  return (
    <>
      {somaticsNode && batesonNode && (
        <line ref={line1Ref as any}>
          <bufferGeometry />
          <lineBasicMaterial color="#DFB757" transparent />
        </line>
      )}
      {batesonNode && gazeNode && (
        <line ref={line2Ref as any}>
          <bufferGeometry />
          <lineBasicMaterial color="#DFB757" transparent />
        </line>
      )}
    </>
  );
}

function SomaticDust({ count = 1200, vibeMode }: { count?: number; vibeMode?: 'colour' | 'mono' | 'cinematic' }) {
  const pointsRef = useRef<THREE.Points>(null!);
  const particles = React.useMemo(() => {
    const tempPositions = new Float32Array(count * 3);
    const tempColors = new Float32Array(count * 3);
    const tempSpeeds = new Float32Array(count);
    const tempPhases = new Float32Array(count);

    const colorsPalette = vibeMode === 'mono'
      ? ['#4B5563', '#6B7280', '#9CA3AF', '#D1D5DB']
      : ['#E8A95C', '#5C9BE8', '#9B5CE8', '#5CE87A', '#EAEAEA', '#E85C7A'];

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2 + Math.pow(Math.random(), 2.2) * 65;

      tempPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      tempPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      tempPositions[i * 3 + 2] = r * Math.cos(phi);

      const hexColor = colorsPalette[Math.floor(Math.random() * colorsPalette.length)];
      const c = new THREE.Color(hexColor);
      tempColors[i * 3] = c.r;
      tempColors[i * 3 + 1] = c.g;
      tempColors[i * 3 + 2] = c.b;

      tempSpeeds[i] = 0.04 + Math.random() * 0.12;
      tempPhases[i] = Math.random() * Math.PI * 2;
    }

    return { positions: tempPositions, colors: tempColors, speeds: tempSpeeds, phases: tempPhases };
  }, [count, vibeMode]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.getElapsedTime();
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;

    for (let i = 0; i < count; i++) {
      const sp = particles.speeds[i];
      const ph = particles.phases[i];
      posAttr.setY(i, posAttr.getY(i) + Math.sin(t * sp + ph) * 0.0055);
      posAttr.setX(i, posAttr.getX(i) + Math.cos(t * sp * 0.7 + ph) * 0.0035);
    }
    posAttr.needsUpdate = true;

    const rotSpeed = vibeMode === 'cinematic' ? 0.024 : 0.007;
    pointsRef.current.rotation.y = t * rotSpeed;
    pointsRef.current.rotation.z = t * rotSpeed * 0.45;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[particles.positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[particles.colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.065}
        sizeAttenuation={true}
        vertexColors={true}
        transparent={true}
        opacity={0.65}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function SelectedHologramOrbit({ selectedNode, SCALE }: { selectedNode: SomaticNode | null; SCALE: number }) {
  const meshRef = useRef<THREE.LineLoop>(null!);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = state.clock.getElapsedTime() * 0.45;
      meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.12;
    }
  });

  const points = React.useMemo(() => {
    if (!selectedNode) return [];
    const r = ((selectedNode.currentRadius || 12) * SCALE) * 1.9;
    const pts: THREE.Vector3[] = [];
    const segments = 48;
    for (let i = 0; i < segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(theta) * r, Math.sin(theta) * r, 0));
    }
    return pts;
  }, [selectedNode, SCALE]);

  if (!selectedNode || points.length === 0) return null;

  return (
    <group
      position={[(selectedNode.x || 0) * SCALE, (selectedNode.y || 0) * SCALE, (selectedNode.z || 0) * SCALE]}
      rotation={[Math.PI / 2.3, 0, 0]}
    >
      <lineLoop ref={meshRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array(points.flatMap(p => [p.x, p.y, p.z])), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#DFB757" transparent opacity={0.65} />
      </lineLoop>
    </group>
  );
}

function NodeLabel({ node, language, SCALE, isSelected, isActiveAudio }: {
  node: SomaticNode; language: 'ru' | 'en'; SCALE: number; isSelected: boolean; isActiveAudio: boolean;
}) {
  if (node.status === 'seed' && node.id !== 'central-me') return null;

  const label = language === 'ru' ? node.nameRu : node.nameEn;
  const radius = (node.currentRadius || 10) * SCALE;

  let color = '#D1D7E0';
  if (isSelected || isActiveAudio || node.status === 'rooted' || node.id === 'central-me') {
    color = '#DFB757';
  } else if (node.status === 'sprout') {
    color = '#6B7280';
  }

  return (
    <Billboard position={[(node.x || 0) * SCALE, (node.y || 0) * SCALE + radius + 0.15, (node.z || 0) * SCALE]}>
      <Text
        fontSize={(isSelected || isActiveAudio || node.status === 'rooted') ? 0.18 : 0.12}
        color={color}
        anchorX="center"
        anchorY="bottom"
        maxWidth={2.5}
      >
        {label}
      </Text>
    </Billboard>
  );
}

function InteractiveSomaticSphere({
  node, isSelected, isHovered, isActiveAudio, color, onClick, onLongSelect, currentWorld, overlayUser, selectedEpoch, ascendingNodeId,
  onDragStart, onDragEnd, onHoverState, linksCount = 0
}: {
  node: SomaticNode; isSelected: boolean; isHovered: boolean; isActiveAudio: boolean;
  color: string; onClick: (n: SomaticNode) => void; onLongSelect?: (node: SomaticNode, cursorX: number, cursorY: number) => void;
  currentWorld: World; overlayUser: string | null; selectedEpoch?: number; ascendingNodeId?: string | null;
  onDragStart: (nodeId: string, node: SomaticNode, e: any) => void;
  onDragEnd: () => void;
  onHoverState?: (isHovered: boolean) => void;
  linksCount?: number;
}) {
  const pointerTimeRef = useRef(0);
  const pointerPosRef = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    pointerTimeRef.current = Date.now();
    pointerPosRef.current = { x: e.clientX, y: e.clientY };
    onDragStart(node.id, node, e);
  };

  const handlePointerUp = (e: any) => {
    e.stopPropagation();
    const duration = Date.now() - pointerTimeRef.current;
    const distance = Math.sqrt((e.clientX - pointerPosRef.current.x) ** 2 + (e.clientY - pointerPosRef.current.y) ** 2);
    
    onDragEnd();

    if (distance < 10) {
      if (duration > 650) {
        onLongSelect?.(node, e.clientX, e.clientY);
      } else {
        onClick(node);
      }
    }
  };

  return (
    <group
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerOver={(e) => { e.stopPropagation(); onHoverState?.(true); }}
      onPointerOut={(e) => { e.stopPropagation(); onHoverState?.(false); }}
    >
      <SomaticSphere
        node={node}
        isSelected={isSelected}
        isHovered={isHovered}
        isActiveAudio={isActiveAudio}
        color={color}
        onClick={() => {}}
        currentWorld={currentWorld}
        overlayUser={overlayUser}
        selectedEpoch={selectedEpoch}
        linksCount={linksCount}
      />
    </group>
  );
}

function GraphScene({
  nodes, links, currentWorld, language, onNodeSelect,
  selectedNodeId, overlayUser, resonatedNodeIds, carriedNodeIds,
  currentUserName, isFilterHot, activeAudioNodeId, visibleLayers,
  selectedEpoch, vibeMode, ascendingNodeId, communityUsers, fieldSubMode,
  onUserSelect, onLongPressNode
}: MyceliumGraphProps & { isFilterHot: boolean }) {
  const SCALE = 0.045;
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [camDist, setCamDist] = useState(24);
  const pointer3D = usePointer3D();

  const controlsRef = useRef<any>(null);
  const { camera } = useThree();

  // Dragging support refs
  const draggedNodeIdRef = useRef<string | null>(null);
  const dragPlaneRef = useRef(new THREE.Plane());
  const dragIntersectionRef = useRef(new THREE.Vector3());
  const isPointerDownRef = useRef(false);

  // Capture mouse up/down at window level for reliable controls recovery
  useEffect(() => {
    const handleDown = () => {
      isPointerDownRef.current = true;
    };
    const handleUp = () => {
      isPointerDownRef.current = false;
      draggedNodeIdRef.current = null;
      if (controlsRef.current) {
        controlsRef.current.enabled = true;
      }
    };
    window.addEventListener('pointerdown', handleDown);
    window.addEventListener('pointerup', handleUp);
    return () => {
      window.removeEventListener('pointerdown', handleDown);
      window.removeEventListener('pointerup', handleUp);
    };
  }, []);

  const handleDragStart = (nodeId: string, node: SomaticNode, e: any) => {
    e.stopPropagation();
    if (e.target && e.target.setPointerCapture) {
      e.target.setPointerCapture(e.pointerId);
    }
    draggedNodeIdRef.current = nodeId;
    const nodePos3D = new THREE.Vector3((node.x || 0) * SCALE, (node.y || 0) * SCALE, (node.z || 0) * SCALE);
    const camDir = new THREE.Vector3();
    camera.getWorldDirection(camDir);
    dragPlaneRef.current.setFromNormalAndCoplanarPoint(camDir.negate(), nodePos3D);
    if (controlsRef.current) {
      controlsRef.current.enabled = false;
    }
  };

  const handleDragEnd = () => {
    draggedNodeIdRef.current = null;
    if (controlsRef.current) {
      controlsRef.current.enabled = true;
    }
  };

  // Инициализация неизменяемой ссылки на физическое состояние симуляции для обхода механизма примирения React
  const graphStateRef = useRef<{
    nodes: (SomaticNode & {
      vx: number; vy: number; vz: number;
      targetX: number; targetY: number; targetZ: number;
      breathPhase: number; breathSpeed: number;
      baseRadius: number; currentRadius: number;
    })[];
    links: SomaticLink[];
    lastWorld: World | null;
    transitionProgress: number;
  }>({ nodes: [], links: [], lastWorld: null, transitionProgress: 1.0 });

  const usersStateRef = useRef<any[]>([]);

  useEffect(() => {
    if (communityUsers && communityUsers.length > 0) {
      usersStateRef.current = communityUsers.map((u, idx) => {
        const existing = usersStateRef.current.find(eu => eu.id === u.id);
        if (existing) {
          return { ...u, x: existing.x, y: existing.y, z: existing.z, vx: existing.vx, vy: existing.vy, vz: existing.vz };
        }
        const angle = (idx * Math.PI * 2) / communityUsers.length;
        const r = 35 + Math.random() * 25;
        return {
          ...u,
          x: Math.cos(angle) * r,
          y: Math.sin(angle) * r,
          z: (Math.random() - 0.5) * 15,
          vx: 0, vy: 0, vz: 0
        };
      });
    }
  }, [communityUsers]);

  useEffect(() => {
    const gState = graphStateRef.current;
    const internalNodes = gState.nodes;
    const worldChanged = gState.lastWorld !== currentWorld;
    if (worldChanged) {
      gState.lastWorld = currentWorld;
      gState.transitionProgress = 0.0;
    }

    const newNodes = nodes.map((n, idx) => {
      const ex = internalNodes.find(e => e.id === n.id);
      let x = ex?.x;
      let y = ex?.y;
      let z = ex?.z;

      let tx = 0, ty = 0, tz = 0;
      if (currentWorld === 'atlas') {
        const domains: Domain[] = ['body', 'science', 'philosophy', 'movement', 'cognition', 'hybrid'];
        const domainIndex = domains.indexOf(n.domain);
        const baseAngle = (domainIndex * Math.PI * 2) / domains.length;

        let dist = 0;
        let zRange = 0;

        if (n.level === 'macro') {
          dist = 100;
          zRange = 8;
        } else if (n.level === 'meso') {
          dist = 160;
          zRange = 15;
        } else {
          dist = 220;
          zRange = 25;
        }

        // Spread nodes slightly within their domain "sector"
        const angleOffset = (Math.sin(idx * 0.5) * 0.3);
        const finalAngle = baseAngle + angleOffset;
        const radialOffset = (Math.cos(idx * 0.7) * 15);
        const finalDist = dist + radialOffset;

        tx = Math.cos(finalAngle) * finalDist;
        ty = Math.sin(finalAngle) * finalDist;
        tz = (Math.sin(idx * 1.3) * zRange);

        if (x === undefined || y === undefined || z === undefined) {
          x = tx + (Math.random() - 0.5) * 20;
          y = ty + (Math.random() - 0.5) * 20;
          z = tz + (Math.random() - 0.5) * 10;
        }
      } else if (currentWorld === 'field') {
        // Organic cloud, slightly flattened
        const angle = (idx * 137.5 * Math.PI) / 180; // Golden angle
        const r = Math.sqrt(idx) * 25;
        tx = Math.cos(angle) * r;
        ty = Math.sin(angle) * r;
        tz = (Math.random() - 0.5) * 40; // Spatially flattened

        if (x === undefined || y === undefined || z === undefined) {
          x = tx; y = ty; z = tz;
        }
      } else {
        if (n.id === 'central-me') {
          tx = 0; ty = 0; tz = 0;
          if (x === undefined) { x = 0; y = 0; z = 0; }
        } else {
          if (x === undefined || y === undefined || z === undefined) {
            x = (Math.random() - 0.5) * 4;
            y = (Math.random() - 0.5) * 4;
            z = (Math.random() - 0.5) * 4;
          }
          const orbitRadius = 45 + (idx % 5) * 20;
          const initialAngle = (idx * 1.2) % (Math.PI * 2);
          tx = Math.cos(initialAngle) * orbitRadius;
          ty = Math.sin(initialAngle) * orbitRadius;
          tz = Math.sin(idx) * 8;
        }
      }

      const lvl = n.level || 'meso';
      const levelFactor = lvl === 'macro' ? 1.6 : lvl === 'meso' ? 1.1 : 0.7;
      const stat = n.status || 'seed';
      const statusFactor = stat === 'rooted' || stat === 'atlas' ? 1.5 : stat === 'alive' ? 1.25 : stat === 'sprout' ? 0.95 : 0.7;
      const bRad = (n.id === 'central-me') ? 22 : Math.round(11 * levelFactor * statusFactor);

      return {
        ...n,
        x, y, z,
        vx: ex?.vx || 0, vy: ex?.vy || 0, vz: ex?.vz || 0,
        targetX: tx, targetY: ty, targetZ: tz,
        breathPhase: ex?.breathPhase ?? Math.random() * Math.PI * 2,
        breathSpeed: ex?.breathSpeed ?? (0.3 + Math.random() * 0.45),
        baseRadius: bRad,
        currentRadius: ex?.currentRadius ?? bRad,
      };
    });

    gState.nodes = newNodes as any;
    gState.links = links;
  }, [nodes, links, currentWorld]);

  // Интеграция 3D Boids (Reynolds) + Curl-Noise вихревых течений + тактильного курсорного взаимодействия + 3D Dragging
  useFrame((state) => {
    const gState = graphStateRef.current;
    const time = state.clock.elapsedTime;
    const nodesList = gState.nodes;

    const springStrength = 0.030;
    const restDistance = 8.0;
    const damping = 0.80; // viscous gel-like damping prevents rapid shaking

    const maxBoidsSpeed = 0.85; // slower, stately biological glide
    const maxBoidsForce = 0.05; // smooth gentle accelerations
    const separationRadius = 15.0;
    const cohesionRadius = 24.0;
    const alignmentRadius = 24.0;

    const wSeparation = 1.95;
    const wCohesion = 0.35;
    const wAlignment = 0.25;
    const wSpring = 0.80;
    const wCurlNoise = 0.15; // lower random curl perturbation to stay peaceful at rest
    const wMouseForce = 2.8;

    const pointerWorld = pointer3D.current.clone().multiplyScalar(1 / SCALE);

    // Dynamic 3D mouse drag projection to simulation coordinate space
    if (draggedNodeIdRef.current) {
      const draggedNode = nodesList.find(n => n.id === draggedNodeIdRef.current);
      if (draggedNode) {
        state.raycaster.setFromCamera(state.pointer, state.camera);
        if (state.raycaster.ray.intersectPlane(dragPlaneRef.current, dragIntersectionRef.current)) {
          const targetX = dragIntersectionRef.current.x / SCALE;
          const targetY = dragIntersectionRef.current.y / SCALE;
          const targetZ = dragIntersectionRef.current.z / SCALE;

          draggedNode.x = targetX;
          draggedNode.y = targetY;
          draggedNode.z = targetZ;

          draggedNode.vx = 0;
          draggedNode.vy = 0;
          draggedNode.vz = 0;
        }
      }
    }

    // Коррекция плавающих траекторий орбит в персональной вселенной
    if (currentWorld === 'me' && nodesList.length) {
      nodesList.forEach((node, idx) => {
        if (node.id !== 'central-me') {
          const orbitRadius = 45 + (idx % 5) * 20;
          const orbitSpeed = (120 / orbitRadius) * 0.08 + (idx % 2) * 0.02;
          const currentAngle = (node.breathPhase || 0) + time * orbitSpeed;
          node.targetX = Math.cos(currentAngle) * orbitRadius;
          node.targetY = Math.sin(currentAngle) * orbitRadius;
          node.targetZ = Math.sin(time * 0.4 + idx) * 6;
        }
      });
    }

    if (gState.transitionProgress < 1.0) {
      gState.transitionProgress += 0.04;
      nodesList.forEach(node => {
        node.x += (node.targetX - node.x) * 0.12;
        node.y += (node.targetY - node.y) * 0.12;
        node.z += (node.targetZ - node.z) * 0.12;
      });
    }

    // Итерационный обсчет сил на уровне ядер рендеринга
    for (let i = 0; i < nodesList.length; i++) {
      const n1 = nodesList[i];
      if (n1.id === 'central-me') continue;

      // Skip forces recalculation for the actively dragged node to guarantee 1:1 mouse tracking
      if (n1.id === draggedNodeIdRef.current) {
        const bp = (n1.breathPhase || 0) + time * (n1.breathSpeed || 0.4) * 0.03;
        n1.currentRadius = (n1.baseRadius || 10) * (1 + Math.sin(bp) * 0.08);
        continue;
      }

      let fSep = new THREE.Vector3();
      let fCoh = new THREE.Vector3();
      let fAli = new THREE.Vector3();
      let fSpring = new THREE.Vector3();

      let sepCount = 0;
      let cohCount = 0;
      let aliCount = 0;

      let centerOfMass = new THREE.Vector3();
      let averageVelocity = new THREE.Vector3();

      // Наложение векторов роевой кластеризации (также учитываем central-me для разделения, чтобы исключить наложение на центр!)
      for (let j = 0; j < nodesList.length; j++) {
        if (i === j) continue;
        const n2 = nodesList[j];

        const dX = n2.x - n1.x;
        const dY = n2.y - n1.y;
        const dZ = n2.z - n1.z;
        const dist = Math.sqrt(dX * dX + dY * dY + dZ * dZ) || 0.1;

        // Dynamic pairwise soft-body separation cushion representing their individual atmospheric membranes
        // A coefficient of 1.35 provides an absolute bounciness to guarantee perfect spacing and deep legibility.
        const dynamicSeparationDistance = (n1.baseRadius + (n2.baseRadius || 10)) * 1.35;

        if (dist < dynamicSeparationDistance) {
          const overlap = dynamicSeparationDistance - dist;
          // Exponential repulsive spike as they get closer, keeping their atmospheres completely distinct
          const pushStrength = (overlap / dynamicSeparationDistance) * 4.6 + (dynamicSeparationDistance / (dist + 0.12)) * 0.85;
          const push = new THREE.Vector3(n1.x - n2.x, n1.y - n2.y, n1.z - n2.z).normalize().multiplyScalar(pushStrength);
          fSep.add(push);
          sepCount++;
        }

        // Only flock/cohere and align with normal non-central node bodies to keep orbit lines clean
        if (n2.id !== 'central-me') {
          if (dist < cohesionRadius) {
            centerOfMass.add(new THREE.Vector3(n2.x, n2.y, n2.z));
            cohCount++;
          }
          if (dist < alignmentRadius) {
            averageVelocity.add(new THREE.Vector3(n2.vx || 0, n2.vy || 0, n2.vz || 0));
            aliCount++;
          }
        }
      }

      if (sepCount > 0) {
        // Robust ADDITIVE separation force: keeps nodes bouncy and firm like real balloons instead of decaying when clustered!
        fSep.multiplyScalar(1.9 + sepCount * 0.4);
      }
      if (cohCount > 0) {
        centerOfMass.divideScalar(cohCount);
        fCoh.add(centerOfMass.sub(new THREE.Vector3(n1.x, n1.y, n1.z))).normalize().multiplyScalar(maxBoidsSpeed);
      }
      if (aliCount > 0) {
        averageVelocity.divideScalar(aliCount);
        fAli.add(averageVelocity).normalize().multiplyScalar(maxBoidsSpeed);
      }

      gState.links.forEach(link => {
        if (link.source === n1.id || link.target === n1.id) {
          const otherId = link.source === n1.id ? link.target : link.source;
          const otherNode = nodesList.find(nodeItem => nodeItem.id === otherId);
          if (otherNode) {
            const dX = otherNode.x - n1.x;
            const dY = otherNode.y - n1.y;
            const dZ = otherNode.z - n1.z;
            const dist = Math.sqrt(dX * dX + dY * dY + dZ * dZ) || 0.1;
            
            // Rest distance is proportional to the combined sizes of the two somatic envelopes plus a comfortable padding!
            const baseCombinedRadius = (n1.baseRadius + (otherNode.baseRadius || 10));
            // Let the link's rest distance be around 1.65x of their combined radius, plus a tiny organic breath!
            const dynamicRestDistance = baseCombinedRadius * 1.65 + Math.sin(time * 0.8 + i) * 3.0;

            const delta = dist - dynamicRestDistance;
            // Elastic spring force: pulls if dist > rest, pushes if dist < rest
            let forceStrength = delta * springStrength * Math.log(link.resonanceWeight + 1.5);

            // Anti-collapse safeguard: if nodes are physically closer than their combined cell envelopes,
            // we smoothly nullify any positive (pulling/attractive) force to keep separation in charge!
            const combinedCapsuleRadius = (n1.baseRadius + (otherNode.baseRadius || 10)) * 1.35;
            if (dist < combinedCapsuleRadius && forceStrength > 0) {
              forceStrength *= Math.max(0.0, (dist - combinedCapsuleRadius * 0.55) / (combinedCapsuleRadius * 0.45));
            }

            fSpring.add(new THREE.Vector3(dX, dY, dZ).normalize().multiplyScalar(forceStrength));
          }
        }
      });

      // Математическая симуляция curl-шума течения на тригонометрических триплетах
      const k = 0.08;
      const curlX = Math.sin(n1.y * k) - Math.cos(n1.z * k);
      const curlY = Math.cos(n1.x * k) - Math.sin(n1.z * k);
      const curlZ = Math.sin(n1.x * k) - Math.cos(n1.y * k);
      const fCurl = new THREE.Vector3(curlX, curlY, curlZ);

      // Gentle continuous anchor attraction to their home/target coordinate points.
      // Encourages nodes to orbit, breathe, and drift localized to their designated domain clusters rather than wandering off.
      const fHome = new THREE.Vector3(n1.targetX - n1.x, n1.targetY - n1.y, n1.targetZ - n1.z);
      const homeDist = fHome.length();
      if (homeDist > 0.05) {
        const homePullStrength = homeDist > 16.0 ? 0.05 : 0.012;
        fHome.normalize().multiplyScalar(homeDist * homePullStrength);
      } else {
        fHome.set(0, 0, 0);
      }

      // Математическое моделирование сил курсора (Gravity Well при зажатии, Predator Repulsion при наведении)
      let fMouse = new THREE.Vector3();
      const distToPointer = pointerWorld.distanceTo(new THREE.Vector3(n1.x, n1.y, n1.z));
      if (distToPointer < 55.0) {
        const dir = new THREE.Vector3(n1.x, n1.y, n1.z).sub(pointerWorld).normalize();
        const factor = (1.0 - distToPointer / 55.0);
        if (isPointerDownRef.current) {
          // Gravity Well with tangential vortex swirl! Instead of crashing, nodes spin in a beautiful cosmic spiral orbit
          const radialPullForce = -wMouseForce * 1.65 * factor;
          
          // Tangential/perpendicular vector for elegant 3D orbital swing
          const tangent = new THREE.Vector3(-dir.y, dir.x, 0.1).normalize();
          const swirlDirection = (i % 2 === 0 ? 1 : -1);
          const tangentialVortexForce = wMouseForce * 1.55 * factor * swirlDirection;

          fMouse.copy(dir.multiplyScalar(radialPullForce)).addScaledVector(tangent, tangentialVortexForce);
        } else {
          // Predator Repulsion (Выталкивание) - отталкивает их
          fMouse.copy(dir.multiplyScalar(wMouseForce * factor));
        }
      }

      // Итоговое сложение векторов ускорения
      const finalAcceleration = new THREE.Vector3()
        .addScaledVector(fSep, wSeparation)
        .addScaledVector(fCoh, wCohesion)
        .addScaledVector(fAli, wAlignment)
        .addScaledVector(fSpring, wSpring)
        .addScaledVector(fCurl, wCurlNoise)
        .addScaledVector(fHome, 1.0)
        .add(fMouse);

      finalAcceleration.clampLength(0.0, maxBoidsForce);

      // Численное интегрирование Эйлера
      n1.vx = ((n1.vx || 0) + finalAcceleration.x) * damping;
      n1.vy = ((n1.vy || 0) + finalAcceleration.y) * damping;
      n1.vz = ((n1.vz || 0) + finalAcceleration.z) * damping;

      if (n1.id === ascendingNodeId) {
        n1.vy += 1.2;
        n1.vz += 0.6;
      }

      n1.x += n1.vx;
      n1.y += n1.vy;
      n1.z += n1.vz;

      const bp = (n1.breathPhase || 0) + time * (n1.breathSpeed || 0.4) * 0.03;
      n1.currentRadius = (n1.baseRadius || 10) * (1 + Math.sin(bp) * 0.08);
    }

    if (selectedNodeId && controlsRef.current) {
      const selNode = nodesList.find(n => n.id === selectedNodeId);
      if (selNode) {
        const tx = (selNode.x || 0) * SCALE;
        const ty = (selNode.y || 0) * SCALE;
        const tz = (selNode.z || 0) * SCALE;
        controlsRef.current.target.x += (tx - controlsRef.current.target.x) * 0.09;
        controlsRef.current.target.y += (ty - controlsRef.current.target.y) * 0.09;
        controlsRef.current.target.z += (tz - controlsRef.current.target.z) * 0.09;
      }
    } else if (controlsRef.current && nodesList.length > 0) {
      // Dynamic collective center of mass of all nodes determines index center relative to them!
      const activeNodes = nodesList.filter(n => n.id !== 'central-me' || nodesList.length === 1);
      const targetNodes = activeNodes.length > 0 ? activeNodes : nodesList;
      
      let sumX = 0, sumY = 0, sumZ = 0;
      targetNodes.forEach(n => {
        sumX += n.x || 0;
        sumY += n.y || 0;
        sumZ += n.z || 0;
      });
      const avgX = (sumX / targetNodes.length) * SCALE;
      const avgY = (sumY / targetNodes.length) * SCALE;
      const avgZ = (sumZ / targetNodes.length) * SCALE;

      // Smoothly drift target to center of mass
      controlsRef.current.target.x += (avgX - controlsRef.current.target.x) * 0.04;
      controlsRef.current.target.y += (avgY - controlsRef.current.target.y) * 0.04;
      controlsRef.current.target.z += (avgZ - controlsRef.current.target.z) * 0.04;
    }

    // Физика отталкивания на уровне пользовательских созвездий
    if (currentWorld === 'field' && fieldSubMode === 'people' && usersStateRef.current.length > 0) {
      const users = usersStateRef.current;
      for (let i = 0; i < users.length; i++) {
        const u1 = users[i];
        for (let j = i + 1; j < users.length; j++) {
          const u2 = users[j];
          let dx = u2.x - u1.x;
          let dy = u2.y - u1.y;
          let dz = u2.z - u1.z;
          if (!dx && !dy && !dz) { dx = 0.1; dy = 0.1; dz = 0.1; }
          const distSq = dx * dx + dy * dy + dz * dz;
          const dist = Math.sqrt(distSq);

          const isSimilar = u1.dominantDomain === u2.dominantDomain;
          const force = isSimilar ? -12 / (distSq + 12) : 420 / (distSq + 30);

          u1.vx = (u1.vx || 0) - (dx / dist) * force * 0.02;
          u1.vy = (u1.vy || 0) - (dy / dist) * force * 0.02;
          u1.vz = (u1.vz || 0) - (dz / dist) * force * 0.02;
          u2.vx = (u2.vx || 0) + (dx / dist) * force * 0.02;
          u2.vy = (u2.vy || 0) + (dy / dist) * force * 0.02;
          u2.vz = (u2.vz || 0) + (dz / dist) * force * 0.02;
        }
      }

      users.forEach((u, idx) => {
        const d = Math.sqrt(u.x * u.x + u.y * u.y + u.z * u.z);
        if (d > 1) {
          u.vx -= (u.x / d) * 0.02;
          u.vy -= (u.y / d) * 0.02;
          u.vz -= (u.z / d) * 0.02;
        }

        u.x = (u.x || 0) + (u.vx || 0);
        u.y = (u.y || 0) + (u.vy || 0);
        u.z = (u.z || 0) + (u.vz || 0);

        u.vx *= 0.84;
        u.vy *= 0.84;
        u.vz *= 0.84;

        u.x += Math.sin(time * 0.9 + idx * 0.4) * 0.06;
        u.y += Math.cos(time * 0.8 + idx * 0.7) * 0.06;
        u.z += Math.sin(time * 1.0 + idx * 0.3) * 0.04;
      });
    }
  });

  const getFilteredNodes = (): SomaticNode[] => {
    if (currentWorld === 'field' && fieldSubMode === 'people') return [];
    const gState = graphStateRef.current;
    let base = [...gState.nodes];
    if (currentWorld === 'me' && !base.find(n => n.id === 'central-me')) {
      base.unshift({
        id: 'central-me', nameRu: 'Я', nameEn: 'Me',
        type: 'concept', level: 'macro',
        domain: 'hybrid', world: 'me', status: 'rooted', resonances: 150,
        descriptionRu: 'Центр вашей личной вселенной',
        descriptionEn: 'The center of your personal universe',
        x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0,
        targetX: 0, targetY: 0, targetZ: 0,
        baseRadius: 18, currentRadius: 18, breathPhase: 0, breathSpeed: 0.5
      } as any);
      gState.nodes = base as any;
    }

    const audioNodeIds = new Set(SAMPLE_AUDIO?.flatMap(a => a.timelineNodes.map(t => t.nodeId)) || []);
    const fieldConnectedAtlasIds = new Set<string>();
    if (currentWorld === 'field') {
      const fieldNodeIds = new Set(base.filter(n => n.world === 'field' || n.id === 'central-me').map(n => n.id));
      links.forEach(link => {
        if (fieldNodeIds.has(link.source) && !fieldNodeIds.has(link.target)) fieldConnectedAtlasIds.add(link.target);
        if (fieldNodeIds.has(link.target) && !fieldNodeIds.has(link.source)) fieldConnectedAtlasIds.add(link.source);
      });
    }

    const resSet = resonatedNodeIds instanceof Set ? resonatedNodeIds : new Set(resonatedNodeIds || []);
    const carrSet = carriedNodeIds instanceof Set ? carriedNodeIds : new Set(carriedNodeIds || []);

    return base.filter(n => {
      if (currentWorld === 'atlas') {
        if (n.world !== 'atlas') return false;
      }
      if (currentWorld === 'field') {
        if (n.world !== 'field' && n.id !== 'central-me') {
          if (n.world === 'atlas' && fieldConnectedAtlasIds.has(n.id)) return true;
          return false;
        }
      }
      if (currentWorld === 'me') {
        if (n.id === 'central-me') return true;
        const isMine = n.addedBy === currentUserName;
        const isResonated = resSet?.has(n.id);
        const isCarried = carrSet?.has(n.id);
        // show center as well as any mine, resonated, carried, or the custom local coordination node
        if (!isMine && !isResonated && !isCarried && n.id !== 'embodiedcoord') return false;
      }

      if (visibleLayers) {
        if (!visibleLayers.atlas && n.world === 'atlas' && n.id !== 'central-me') return false;
        if (!visibleLayers.field && n.world === 'field' && n.id !== 'central-me') return false;
        if (visibleLayers.hot && n.resonances < 50 && n.id !== 'central-me') return false;
        if (visibleLayers.withAudio && !audioNodeIds.has(n.id) && n.id !== 'central-me') return false;
      }

      if (isFilterHot && n.resonances < 50 && n.id !== 'central-me') return false;
      return true;
    });
  };

  const filteredNodes = getFilteredNodes();
  const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
  const activeLinks = links.filter(link => filteredNodeIds.has(link.source) && filteredNodeIds.has(link.target));

  return (
    <>
      <Stars radius={110} depth={55} count={1650} factor={4} fade speed={1.2} />
      <SomaticDust count={1200} vibeMode={vibeMode} />

      {selectedNodeId && (
        <SelectedHologramOrbit
          selectedNode={filteredNodes.find(n => n.id === selectedNodeId) || null}
          SCALE={SCALE}
        />
      )}

      <ambientLight intensity={0.4} />
      <pointLight position={[15, 8, 15]} intensity={2.2} color="#ccddff" />
      <pointLight position={[-15, -8, -15]} intensity={1.7} color="#9977ee" />
      <pointLight position={[8, -10, 8]} intensity={1.2} color="#7755aa" />

      <OrbitControls ref={controlsRef}
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        zoomSpeed={0.8}
        panSpeed={0.7}
        rotateSpeed={0.5}
        minDistance={3}
        maxDistance={75}
        makeDefault
        autoRotate={vibeMode === 'cinematic'}
        autoRotateSpeed={0.4}
        onChange={(e: any) => {
          if (e?.target?.object) {
            setCamDist(e.target.object.position.length());
          }
        }}
      />

      {activeLinks.map(link => {
        const src = filteredNodes.find(n => n.id === link.source);
        const tgt = filteredNodes.find(n => n.id === link.target);
        if (!src || !tgt) return null;
        const isActive = selectedNodeId === link.source || selectedNodeId === link.target;

        if (src.level === 'micro' && camDist > 24) return null;
        if (tgt.level === 'micro' && camDist > 24) return null;
        if (src.level === 'meso' && camDist > 38) return null;
        if (tgt.level === 'meso' && camDist > 38) return null;

        let color = currentWorld === 'field' ? '#14B8A6' : (DOMAIN_COLORS[src.domain] || '#ffffff');
        if (vibeMode === 'mono') color = '#555A64';

        return (
          <MyceliumEdge
            key={link.id}
            source={src}
            target={tgt}
            color={color}
            activity={link.activity}
            isActive={isActive}
            linkType={link.type}
          />
        );
      })}

      {overlayUser && <GoldenOverlayBridges nodes={filteredNodes} SCALE={SCALE} />}

      {filteredNodes.map(node => {
        let color = node.id === 'central-me'
          ? '#DFB757'
          : currentWorld === 'field'
            ? '#14B8A6'
            : (DOMAIN_COLORS[node.domain] || '#ffffff');

        if (vibeMode === 'mono') {
          color = node.id === 'central-me' ? '#DFB757' : (node.level === 'macro' ? '#E5E7EB' : node.level === 'meso' ? '#9CA3AF' : '#4B5563');
        }

        const linksCount = activeLinks.filter(l => l.source === node.id || l.target === node.id).length;

        return (
          <InteractiveSomaticSphere
            key={node.id}
            node={node}
            isSelected={selectedNodeId === node.id}
            isHovered={hoveredId === node.id}
            isActiveAudio={activeAudioNodeId === node.id}
            color={color}
            onClick={onNodeSelect}
            onLongSelect={onLongPressNode}
            currentWorld={currentWorld}
            overlayUser={overlayUser}
            selectedEpoch={selectedEpoch}
            ascendingNodeId={ascendingNodeId}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onHoverState={(hovered) => setHoveredId(hovered ? node.id : null)}
            linksCount={linksCount}
          />
        );
      })}

      {currentWorld === 'field' && fieldSubMode === 'people' && (usersStateRef.current || []).map((user, idx) => {
        const size = Math.max(0.6, Math.min(2.0, (user.reputation / 100) * 1.5)) * SCALE * 13;
        const finalColor = user.id === 'user-me' ? '#DFB757' : (DOMAIN_COLORS[user.dominantDomain] || '#ffffff');
        const uc = new THREE.Color(finalColor);
        const ux = (user.x || 0) * SCALE;
        const uy = (user.y || 0) * SCALE;
        const uz = (user.z || 0) * SCALE;
        const isUserHovered = hoveredId === user.id;

        const time = state => state.clock.getElapsedTime(); // fallback

        return (
          <group key={user.id} onClick={(e) => { e.stopPropagation(); onUserSelect?.(user); }}>
            <mesh
              position={[ux, uy, uz]}
              onPointerOver={(e) => { e.stopPropagation(); setHoveredId(user.id); }}
              onPointerOut={() => setHoveredId(null)}
            >
              <octahedronGeometry args={[size, 0]} />
              <meshStandardMaterial
                color={uc}
                emissive={uc}
                emissiveIntensity={isUserHovered ? 1.9 : 0.8}
                transparent
                opacity={0.92}
              />
            </mesh>
            <mesh position={[ux, uy, uz]}>
              <sphereGeometry args={[size * 1.8, 12, 12]} />
              <meshStandardMaterial color={uc} transparent opacity={0.15} depthWrite={false} />
            </mesh>
            <Billboard position={[ux, uy + size + 0.18, uz]}>
              <Text
                fontSize={0.14}
                color={finalColor}
                anchorX="center"
                anchorY="bottom"
                maxWidth={3.0}
              >
                {user.name}
              </Text>
              {isUserHovered && (
                <Text
                  fontSize={0.11}
                  color="#9CA3AF"
                  position={[0, -0.16, 0]}
                  anchorX="center"
                  anchorY="top"
                  maxWidth={4.0}
                >
                  {`♦ resonances: ${user.resonances.join(' • ')}`}
                </Text>
              )}
            </Billboard>
          </group>
        );
      })}

      {filteredNodes.map(node => {
        const inEpoch = selectedEpoch === undefined || selectedEpoch === 0 || node.id === 'central-me' || getEpochNumberForNode(node) === selectedEpoch;
        if (!inEpoch) return null;

        if (node.level === 'micro' && camDist > 20) return null;
        if (node.level === 'meso' && camDist > 34) return null;

        return (
          <NodeLabel
            key={`label-${node.id}`}
            node={node}
            language={language}
            SCALE={SCALE}
            isSelected={selectedNodeId === node.id}
            isActiveAudio={activeAudioNodeId === node.id}
          />
        );
      })}
    </>
  );
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; language: 'ru' | 'en' },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; language: 'ru' | 'en' }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ThreeJS Visual Engine Error: ", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950 text-gray-300 p-8 text-center z-50 font-sans border border-white/5 rounded-2xl m-4">
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-full mb-4 text-rose-400 text-3xl">⚠️</div>
          <h3 className="text-lg font-bold text-white mb-2">
            {this.props.language === 'ru' ? 'Ошибка загрузки графа' : 'Error Loading 3D Lattice'}
          </h3>
          <p className="text-xs text-gray-400 max-w-sm mb-4 leading-relaxed font-mono">
            {this.state.error?.message || (this.props.language === 'ru' ? 'Сбой визуализации Three.js' : 'Three.js runtime visual crash')}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-indigo-600/35 hover:bg-indigo-600 border border-indigo-500 text-xs font-mono text-white rounded-lg cursor-pointer active:scale-95 transition-all"
          >
            {this.props.language === 'ru' ? 'Перезапустить рендер' : 'Restart Renderer'}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function MyceliumGraph(props: MyceliumGraphProps) {
  const [isFilterHot, setIsFilterHot] = useState(false);
  const resSet = props.resonatedNodeIds instanceof Set ? props.resonatedNodeIds : new Set(props.resonatedNodeIds || []);
  const carrSet = props.carriedNodeIds instanceof Set ? props.carriedNodeIds : new Set(props.carriedNodeIds || []);

  return (
    <div className="relative w-full h-full select-none rounded-xl overflow-hidden" id="webgl-canvas-box-container">
      <ErrorBoundary language={props.language}>
        <Canvas
          camera={{ position: [0, 8, 30], fov: 55, near: 0.1, far: 500 }}
          gl={{
            antialias: true,
            powerPreference: 'high-performance',
            alpha: false
          }}
          dpr={typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1}
        >
          <color attach="background" args={['#050508']} />
          <fog attach="fog" args={['#050508', 35, 100]} />

          <GraphScene
            nodes={props.nodes}
            links={props.links}
            currentWorld={props.currentWorld}
            language={props.language}
            onNodeSelect={props.onNodeSelect}
            selectedNodeId={props.selectedNodeId}
            overlayUser={props.overlayUser}
            resonatedNodeIds={resSet}
            carriedNodeIds={carrSet}
            currentUserName={props.currentUserName}
            isFilterHot={isFilterHot}
            activeAudioNodeId={props.activeAudioNodeId || null}
            visibleLayers={props.visibleLayers}
            selectedEpoch={props.selectedEpoch}
            vibeMode={props.vibeMode}
            ascendingNodeId={props.ascendingNodeId}
            communityUsers={props.communityUsers}
            fieldSubMode={props.fieldSubMode}
            onUserSelect={props.onUserSelect}
            onLongPressNode={props.onLongPressNode}
          />
        </Canvas>
      </ErrorBoundary>

      <div className="absolute bottom-12 left-4 flex gap-1.5 z-20 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-xl border border-white/5 shadow-xl">
        <button
          onClick={() => setIsFilterHot(!isFilterHot)}
          className={`p-2 rounded-lg transition-all active:scale-95 flex items-center gap-1.5 px-3 text-xs font-medium cursor-pointer ${
            isFilterHot ? 'text-amber-400 bg-amber-500/15' : 'text-gray-400 bg-white/5'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>{isFilterHot ? (props.language === 'ru' ? 'ГОРЯЧИЕ' : 'HOT') : (props.language === 'ru' ? 'ВСЕ' : 'ALL')}</span>
        </button>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-mono text-white/25 pointer-events-none select-none text-center bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/5 whitespace-nowrap">
        {props.language === 'ru'
          ? 'Вращение: левый клик + drag • Зум: скролл / щипок • Пан: правый клик + drag'
          : 'Rotate: left-click drag • Zoom: scroll / pinch • Pan: right-click drag'}
      </div>
    </div>
  );
}
