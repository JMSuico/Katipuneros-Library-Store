// [Layer: Assets/threejs]
// bookHeroScene.ts -- Three.js 3D Book Hero Scene Engine.
// Static 3D Asset module converted from LandingPage/TreeJSAssets/code.html.
// DO NOT put business logic, API calls, or UI rendering here.
import * as THREE from 'three';

export interface BookHeroSceneController {
  destroy: () => void;
}

export function initBookHeroScene(container: HTMLElement): BookHeroSceneController {
  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || window.innerHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
  camera.position.set(0, 0.4, 7.2);

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // Atmospheric Studio & Academic Lighting
  const ambientLight = new THREE.AmbientLight(0xd9eef5, 1.2);
  scene.add(ambientLight);

  const mainKeyLight = new THREE.DirectionalLight(0xffffff, 1.4);
  mainKeyLight.position.set(5, 7, 6);
  mainKeyLight.castShadow = true;
  mainKeyLight.shadow.mapSize.width = 1024;
  mainKeyLight.shadow.mapSize.height = 1024;
  scene.add(mainKeyLight);

  const primaryBlueLight = new THREE.PointLight(0x287ea7, 2.2, 18);
  primaryBlueLight.position.set(-5, 3, 3);
  scene.add(primaryBlueLight);

  const limeAccentLight = new THREE.PointLight(0x9be564, 1.8, 12);
  limeAccentLight.position.set(3, -2, 4);
  scene.add(limeAccentLight);

  const softUnderGlow = new THREE.PointLight(0x67b7d6, 1.5, 15);
  softUnderGlow.position.set(0, -3.5, 2);
  scene.add(softUnderGlow);

  // Helper for realistic scholastic hardcover books
  function createBookMesh(
    coverHex: number,
    spineTextHex: number,
    w = 1.7,
    h = 2.4,
    thickness = 0.36
  ): THREE.Group {
    const group = new THREE.Group();

    const coverMat = new THREE.MeshPhongMaterial({
      color: coverHex,
      specular: 0x67b7d6,
      shininess: 45,
    });

    const pagesMat = new THREE.MeshLambertMaterial({
      color: 0xfaf9f5,
    });

    // Pages Block
    const pagesGeo = new THREE.BoxGeometry(w - 0.08, h - 0.1, thickness - 0.05);
    const pagesMesh = new THREE.Mesh(pagesGeo, pagesMat);
    pagesMesh.position.set(0.04, 0, 0);
    pagesMesh.castShadow = true;
    pagesMesh.receiveShadow = true;
    group.add(pagesMesh);

    // Front & Back Hardcovers
    const coverGeo = new THREE.BoxGeometry(w, h, 0.038);
    const frontCover = new THREE.Mesh(coverGeo, coverMat);
    frontCover.position.set(0, 0, thickness / 2);
    frontCover.castShadow = true;
    group.add(frontCover);

    const backCover = new THREE.Mesh(coverGeo, coverMat);
    backCover.position.set(0, 0, -thickness / 2);
    backCover.receiveShadow = true;
    group.add(backCover);

    // Spine
    const spineGeo = new THREE.BoxGeometry(0.045, h, thickness + 0.038);
    const spine = new THREE.Mesh(spineGeo, coverMat);
    spine.position.set(-w / 2, 0, 0);
    group.add(spine);

    // Gold foil embossed spine detail
    const foilGeo = new THREE.BoxGeometry(0.05, h * 0.45, 0.01);
    const foilMat = new THREE.MeshPhongMaterial({ color: 0x9be564, shininess: 80 });
    const foil = new THREE.Mesh(foilGeo, foilMat);
    foil.position.set(-w / 2 - 0.005, 0, 0);
    group.add(foil);

    // Front cover embossed frame
    const frameGeo = new THREE.BoxGeometry(w * 0.78, h * 0.8, 0.042);
    const frameMat = new THREE.MeshBasicMaterial({
      color: spineTextHex || 0xd9eef5,
      wireframe: true,
    });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.set(0.04, 0, thickness / 2 + 0.004);
    group.add(frame);

    return group;
  }

  // Master book cluster
  const masterCluster = new THREE.Group();
  scene.add(masterCluster);

  // 1. Centerpiece: Open Hardcover Curatorial Book
  const openBookGroup = new THREE.Group();
  const pageHalfGeo = new THREE.BoxGeometry(1.25, 1.85, 0.032);
  const pageMat = new THREE.MeshLambertMaterial({ color: 0xfaf9f5 });
  const centerCoverMat = new THREE.MeshPhongMaterial({ color: 0x164e63, shininess: 35 });

  const leftPage = new THREE.Mesh(pageHalfGeo, pageMat);
  leftPage.position.set(-0.6, 0, 0.06);
  leftPage.rotation.y = 0.28;

  const rightPage = new THREE.Mesh(pageHalfGeo, pageMat);
  rightPage.position.set(0.6, 0, 0.06);
  rightPage.rotation.y = -0.28;

  const leftCover = new THREE.Mesh(pageHalfGeo, centerCoverMat);
  leftCover.position.set(-0.62, 0, 0.01);
  leftCover.rotation.y = 0.28;

  const rightCover = new THREE.Mesh(pageHalfGeo, centerCoverMat);
  rightCover.position.set(0.62, 0, 0.01);
  rightCover.rotation.y = -0.28;

  openBookGroup.add(leftPage, rightPage, leftCover, rightCover);

  // Lime Silk Bookmark Ribbon
  const ribbonGeo = new THREE.BoxGeometry(0.1, 2.0, 0.01);
  const ribbonMat = new THREE.MeshPhongMaterial({ color: 0x9be564, shininess: 70 });
  const ribbon = new THREE.Mesh(ribbonGeo, ribbonMat);
  ribbon.position.set(0.06, -0.25, 0.14);
  ribbon.rotation.z = -0.16;
  openBookGroup.add(ribbon);

  openBookGroup.position.set(0.1, -0.15, 0.75);
  openBookGroup.rotation.set(0.38, 0.08, -0.06);
  masterCluster.add(openBookGroup);

  // 2. Primary Deep Academic Blue Tome (Right Floating Book)
  const bookRight = createBookMesh(0x287ea7, 0x9be564, 1.8, 2.6, 0.42);
  bookRight.position.set(2.1, 0.7, -0.6);
  bookRight.rotation.set(-0.25, -0.55, 0.18);
  masterCluster.add(bookRight);

  // 3. Scholastic Cyan Volume (Left High Flier)
  const bookLeft = createBookMesh(0x164e63, 0xd9eef5, 1.65, 2.35, 0.35);
  bookLeft.position.set(-2.2, 0.85, -0.4);
  bookLeft.rotation.set(0.22, 0.65, -0.2);
  masterCluster.add(bookLeft);

  // 4. Forest Emerald Bound Anthology (Back Upper)
  const bookBack = createBookMesh(0x18323d, 0x9be564, 1.7, 2.4, 0.38);
  bookBack.position.set(0.5, 1.9, -1.8);
  bookBack.rotation.set(0.45, -0.18, 0.32);
  masterCluster.add(bookBack);

  // 5. Golden Amber Manuscript (Lower Left)
  const bookLowerLeft = createBookMesh(0xd9a85c, 0x18323d, 1.55, 2.2, 0.32);
  bookLowerLeft.position.set(-1.8, -1.3, 0.3);
  bookLowerLeft.rotation.set(-0.35, 0.42, 0.25);
  masterCluster.add(bookLowerLeft);

  // 6. Stacked Volumes Base (Lying flat supporting the stack illusion)
  const stackBaseGroup = new THREE.Group();
  const stackBook1 = createBookMesh(0x287ea7, 0xd9eef5, 2.0, 2.8, 0.48);
  stackBook1.rotation.set(Math.PI / 2, 0, 0.18);
  stackBook1.position.set(0, -1.8, -0.5);

  const stackBook2 = createBookMesh(0x7fa58d, 0x18323d, 1.85, 2.6, 0.42);
  stackBook2.rotation.set(Math.PI / 2, 0, -0.12);
  stackBook2.position.set(0.15, -1.38, -0.45);

  stackBaseGroup.add(stackBook1, stackBook2);
  masterCluster.add(stackBaseGroup);

  // 7. Floating Holographic Frosted Glass "Katipuneros Membership Card"
  const cardGroup = new THREE.Group();
  const cardGeo = new THREE.BoxGeometry(1.65, 1.05, 0.025);
  const cardMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.72,
    roughness: 0.15,
    metalness: 0.1,
    transmission: 0.65,
    reflectivity: 0.9,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
  });
  const cardMesh = new THREE.Mesh(cardGeo, cardMat);
  cardMesh.castShadow = true;
  cardGroup.add(cardMesh);

  // Accent chip on card
  const chipGeo = new THREE.BoxGeometry(0.3, 0.22, 0.035);
  const chipMat = new THREE.MeshPhongMaterial({ color: 0x9be564, shininess: 90 });
  const chip = new THREE.Mesh(chipGeo, chipMat);
  chip.position.set(-0.5, 0.2, 0.015);
  cardGroup.add(chip);

  cardGroup.position.set(1.95, -1.05, 1.2);
  cardGroup.rotation.set(-0.2, -0.35, 0.12);
  masterCluster.add(cardGroup);

  // 8. Orbital Torus Rings
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x287ea7,
    transparent: true,
    opacity: 0.35,
    wireframe: true,
  });
  const ring1Geo = new THREE.TorusGeometry(3.6, 0.015, 16, 100);
  const ring1 = new THREE.Mesh(ring1Geo, ringMat);
  ring1.rotation.x = Math.PI / 2.3;
  scene.add(ring1);

  const ring2Mat = new THREE.MeshBasicMaterial({
    color: 0x9be564,
    transparent: true,
    opacity: 0.25,
    wireframe: true,
  });
  const ring2Geo = new THREE.TorusGeometry(4.2, 0.012, 16, 120);
  const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
  ring2.rotation.x = -Math.PI / 2.8;
  ring2.rotation.y = 0.3;
  scene.add(ring2);

  // 9. Ambient Academic Dust / Star Particles
  const particleCount = 48;
  const particlesGeo = new THREE.BufferGeometry();
  const posArray = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount * 3; i += 3) {
    posArray[i] = (Math.random() - 0.5) * 11;
    posArray[i + 1] = (Math.random() - 0.5) * 8;
    posArray[i + 2] = (Math.random() - 0.5) * 6;
  }
  particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

  const particlesMat = new THREE.PointsMaterial({
    size: 0.045,
    color: 0x9be564,
    transparent: true,
    opacity: 0.65,
  });
  const particleSystem = new THREE.Points(particlesGeo, particlesMat);
  scene.add(particleSystem);

  // Mouse Parallax Interaction
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  const onMouseMove = (e: MouseEvent) => {
    mouseX = (e.clientX - window.innerWidth / 2) / 1000;
    mouseY = (e.clientY - window.innerHeight / 2) / 1000;
  };
  window.addEventListener('mousemove', onMouseMove);

  // Resize Handler
  const onResize = () => {
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  window.addEventListener('resize', onResize);

  // Smooth Animation Loop
  let clock = new THREE.Clock();
  let animId = 0;

  const animate = () => {
    animId = requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    targetX += (mouseX - targetX) * 0.045;
    targetY += (mouseY - targetY) * 0.045;

    // Gentle global hover & orientation
    masterCluster.rotation.y = Math.sin(elapsedTime * 0.3) * 0.08 + targetX * 0.8;
    masterCluster.rotation.x = Math.cos(elapsedTime * 0.25) * 0.06 - targetY * 0.6;
    masterCluster.position.y = Math.sin(elapsedTime * 0.7) * 0.12;

    // Open centerpiece breathing/page rustle
    openBookGroup.rotation.z = -0.06 + Math.sin(elapsedTime * 1.2) * 0.025;
    openBookGroup.position.y = -0.15 + Math.sin(elapsedTime * 1.1) * 0.05;

    // Individual floating book harmonic orbits
    bookRight.position.y = 0.7 + Math.sin(elapsedTime * 0.9 + 1.2) * 0.14;
    bookRight.rotation.y = -0.55 + Math.cos(elapsedTime * 0.6) * 0.08;

    bookLeft.position.y = 0.85 + Math.cos(elapsedTime * 0.85 + 2.0) * 0.15;
    bookLeft.rotation.x = 0.22 + Math.sin(elapsedTime * 0.7) * 0.06;

    bookBack.position.y = 1.9 + Math.sin(elapsedTime * 0.7 + 0.5) * 0.18;
    bookLowerLeft.position.y = -1.3 + Math.cos(elapsedTime * 1.1 + 3.1) * 0.11;

    // Floating Glass Card gentle wobble
    cardGroup.rotation.y = -0.35 + Math.sin(elapsedTime * 0.9) * 0.15 + targetX;
    cardGroup.rotation.x = -0.2 + Math.cos(elapsedTime * 0.8) * 0.1 - targetY;
    cardGroup.position.y = -1.05 + Math.sin(elapsedTime * 1.3) * 0.09;

    // Rings slow orbit
    ring1.rotation.z = elapsedTime * 0.07;
    ring2.rotation.z = -elapsedTime * 0.05;

    // Subtle particle drift
    particleSystem.rotation.y = elapsedTime * 0.025;

    renderer.render(scene, camera);
  };

  animate();

  return {
    destroy: () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    },
  };
}
