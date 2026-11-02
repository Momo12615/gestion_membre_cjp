"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { Sparkles, MousePointerClick } from "lucide-react";

export function Cjp3DScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [hintVisible, setHintVisible] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Dimensions
    let width = container.clientWidth;
    let height = container.clientHeight || 340;

    // 1. SCÈNE, CAMÉRA & RENDERER
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    // Distance adaptée mobile vs desktop
    const updateCameraZ = () => {
      camera.position.z = window.innerWidth < 640 ? 8.5 : 7.2;
    };
    updateCameraZ();

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    container.appendChild(renderer.domElement);

    // 2. ÉCLAIRAGES STUDIO PRO
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffa500, 3.5);
    mainLight.position.set(5, 6, 6);
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xf5b51b, 2.0);
    fillLight.position.set(-6, -3, 4);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xffffff, 2.5, 20);
    rimLight.position.set(0, 4, -4);
    scene.add(rimLight);

    const goldPoint = new THREE.PointLight(0xffa500, 3.0, 15);
    goldPoint.position.set(0, 0, 3);
    scene.add(goldPoint);

    // 3. MATÉRIAUX DORÉS HAUTE PRÉCISION (CJP GOLD)
    const goldMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffa500,
      emissive: 0xff8c00,
      emissiveIntensity: 0.15,
      metalness: 0.85,
      roughness: 0.22,
      clearcoat: 0.8,
      clearcoatRoughness: 0.15,
      reflectivity: 0.9,
    });

    // 4. CRÉATION DES GÉOMÉTRIES 3D PROCEDURALES ("C", "J", "P")
    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: 0.42,
      bevelEnabled: true,
      bevelSegments: 5,
      steps: 1,
      bevelSize: 0.08,
      bevelThickness: 0.08,
    };

    // --- LETTRE "C" ---
    const shapeC = new THREE.Shape();
    shapeC.moveTo(0.95, 1.45);
    shapeC.lineTo(-0.25, 1.45);
    shapeC.quadraticCurveTo(-1.1, 1.45, -1.1, 0.7);
    shapeC.lineTo(-1.1, -0.7);
    shapeC.quadraticCurveTo(-1.1, -1.45, -0.25, -1.45);
    shapeC.lineTo(0.95, -1.45);
    shapeC.lineTo(0.95, -0.8);
    shapeC.lineTo(0.0, -0.8);
    shapeC.quadraticCurveTo(-0.48, -0.8, -0.48, -0.25);
    shapeC.lineTo(-0.48, 0.25);
    shapeC.quadraticCurveTo(-0.48, 0.8, 0.0, 0.8);
    shapeC.lineTo(0.95, 0.8);
    shapeC.closePath();
    const geoC = new THREE.ExtrudeGeometry(shapeC, extrudeSettings);
    geoC.center();

    // --- LETTRE "J" ---
    const shapeJ = new THREE.Shape();
    shapeJ.moveTo(0.95, 1.45);
    shapeJ.lineTo(0.95, -0.5);
    shapeJ.quadraticCurveTo(0.95, -1.45, -0.1, -1.45);
    shapeJ.quadraticCurveTo(-1.0, -1.45, -1.0, -0.5);
    shapeJ.lineTo(-1.0, -0.2);
    shapeJ.lineTo(-0.4, -0.2);
    shapeJ.lineTo(-0.4, -0.5);
    shapeJ.quadraticCurveTo(-0.4, -0.85, -0.1, -0.85);
    shapeJ.quadraticCurveTo(0.3, -0.85, 0.3, -0.4);
    shapeJ.lineTo(0.3, 1.45);
    shapeJ.closePath();
    const geoJ = new THREE.ExtrudeGeometry(shapeJ, extrudeSettings);
    geoJ.center();

    // --- LETTRE "P" ---
    const shapeP = new THREE.Shape();
    shapeP.moveTo(-0.95, -1.45);
    shapeP.lineTo(-0.95, 1.45);
    shapeP.lineTo(0.25, 1.45);
    shapeP.quadraticCurveTo(1.05, 1.45, 1.05, 0.7);
    shapeP.quadraticCurveTo(1.05, -0.15, 0.25, -0.15);
    shapeP.lineTo(-0.25, -0.15);
    shapeP.lineTo(-0.25, -1.45);
    shapeP.closePath();

    const holeP = new THREE.Path();
    holeP.moveTo(-0.25, 0.5);
    holeP.lineTo(0.25, 0.5);
    holeP.quadraticCurveTo(0.48, 0.5, 0.48, 0.7);
    holeP.quadraticCurveTo(0.48, 0.9, 0.25, 0.9);
    holeP.lineTo(-0.25, 0.9);
    holeP.closePath();
    shapeP.holes.push(holeP);

    const geoP = new THREE.ExtrudeGeometry(shapeP, extrudeSettings);
    geoP.center();

    // 5. CRÉATION DES MESHES DANS UN GROUPE CENTRAL
    const cjpGroup = new THREE.Group();
    scene.add(cjpGroup);

    const spacing = 2.45;

    const meshC = new THREE.Mesh(geoC, goldMaterial.clone());
    meshC.position.x = -spacing;
    meshC.name = "meshC";
    cjpGroup.add(meshC);

    const meshJ = new THREE.Mesh(geoJ, goldMaterial.clone());
    meshJ.position.x = 0;
    meshJ.name = "meshJ";
    cjpGroup.add(meshJ);

    const meshP = new THREE.Mesh(geoP, goldMaterial.clone());
    meshP.position.x = spacing;
    meshP.name = "meshP";
    cjpGroup.add(meshP);

    const letters = [meshC, meshJ, meshP];

    // 6. CHAMP DE PARTICULES ET CRISTAUX 3D FLOTTANTS
    const particlesGroup = new THREE.Group();
    scene.add(particlesGroup);

    const particleCount = 45;
    const particleGeo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
    const particleMat = new THREE.MeshPhysicalMaterial({
      color: 0xffd700,
      emissive: 0xffa500,
      emissiveIntensity: 0.6,
      metalness: 0.9,
      roughness: 0.1,
    });

    const particleMeshes: THREE.Mesh[] = [];
    for (let i = 0; i < particleCount; i++) {
      const p = new THREE.Mesh(particleGeo, particleMat);
      p.position.set(
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 6
      );
      p.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      const s = 0.5 + Math.random() * 0.8;
      p.scale.set(s, s, s);
      particlesGroup.add(p);
      particleMeshes.push(p);
    }

    // 7. ANIMATION D'ENTRÉE GSAP ("POPPING" 3D DES LETTRES)
    letters.forEach((l) => {
      l.scale.set(0.001, 0.001, 0.001);
      l.rotation.set(0.8, -0.6, 0.2);
    });

    const introTl = gsap.timeline({ delay: 0.15 });

    introTl.to(meshC.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 1.1,
      ease: "elastic.out(1.1, 0.55)",
    });
    introTl.to(
      meshC.rotation,
      { x: 0, y: 0, z: 0, duration: 1.0, ease: "power3.out" },
      "<0.05"
    );

    introTl.to(
      meshJ.scale,
      {
        x: 1,
        y: 1,
        z: 1,
        duration: 1.1,
        ease: "elastic.out(1.1, 0.55)",
      },
      "-=0.85"
    );
    introTl.to(
      meshJ.rotation,
      { x: 0, y: 0, z: 0, duration: 1.0, ease: "power3.out" },
      "<0.05"
    );

    introTl.to(
      meshP.scale,
      {
        x: 1,
        y: 1,
        z: 1,
        duration: 1.1,
        ease: "elastic.out(1.1, 0.55)",
      },
      "-=0.85"
    );
    introTl.to(
      meshP.rotation,
      { x: 0, y: 0, z: 0, duration: 1.0, ease: "power3.out" },
      "<0.05"
    );

    // 8. ANIMATION CONTINUE DE FLOTTEMENT (IDLE HOVER)
    gsap.to(cjpGroup.position, {
      y: 0.18,
      duration: 2.2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    // Rotation lente continue du nuage de particules
    gsap.to(particlesGroup.rotation, {
      y: Math.PI * 2,
      duration: 50,
      repeat: -1,
      ease: "none",
    });

    // 9. GESTION DE LA SOURIS ET DU RAYCASTER (INTERACTION PRO)
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const raycaster = new THREE.Raycaster();
    const mouseCoord = new THREE.Vector2();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      mouse.targetX = x;
      mouse.targetY = y;
      mouseCoord.x = x;
      mouseCoord.y = y;

      // Inclinaison 3D ultra fluide vers la souris
      gsap.to(cjpGroup.rotation, {
        y: x * 0.45,
        x: -y * 0.35,
        duration: 0.6,
        ease: "power2.out",
      });

      // Lueur suit la souris
      gsap.to(goldPoint.position, {
        x: x * 3.5,
        y: y * 2.5,
        duration: 0.5,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      gsap.to(cjpGroup.rotation, {
        x: 0,
        y: 0,
        z: 0,
        duration: 1.2,
        ease: "power2.out",
      });
      gsap.to(goldPoint.position, {
        x: 0,
        y: 0,
        duration: 1.0,
      });
    };

    const handleMouseEnter = () => {
      setIsHovered(true);
      setHintVisible(false);
    };

    // Clic / Tap sur une lettre pour déclencher un spin 3D à 360°
    const handleClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseCoord.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseCoord.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouseCoord, camera);
      const intersects = raycaster.intersectObjects(letters);

      if (intersects.length > 0) {
        const clickedLetter = intersects[0].object as THREE.Mesh;
        setHintVisible(false);

        // Rotation acrobatique 360° + petit saut en Z
        gsap.to(clickedLetter.rotation, {
          y: clickedLetter.rotation.y + Math.PI * 2,
          duration: 0.85,
          ease: "back.out(1.8)",
        });

        gsap.to(clickedLetter.position, {
          z: 0.6,
          duration: 0.25,
          yoyo: true,
          repeat: 1,
          ease: "power2.out",
        });

        // Flash de brillance sur le matériau
        const mat = clickedLetter.material as THREE.MeshPhysicalMaterial;
        gsap.to(mat, {
          emissiveIntensity: 0.8,
          duration: 0.15,
          yoyo: true,
          repeat: 1,
        });
      }
    };

    // Support tactile (mobile)
    const handleTouchMove = (e: TouchEvent) => {
      if (!e.touches[0]) return;
      const touch = e.touches[0];
      const rect = container.getBoundingClientRect();
      const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;

      gsap.to(cjpGroup.rotation, {
        y: x * 0.45,
        x: -y * 0.35,
        duration: 0.5,
        ease: "power2.out",
      });
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);
    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("click", handleClick);
    container.addEventListener("touchmove", handleTouchMove, { passive: true });

    // 10. REDIMENSIONNEMENT FLUIDE
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight || 340;
      camera.aspect = width / height;
      updateCameraZ();
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    // 11. BOUCLE DE RENDU 60/120 FPS
    let animationFrameId: number;
    const startTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = (performance.now() - startTime) * 0.001;

      // Petite rotation individuelle des particules
      particleMeshes.forEach((p, idx) => {
        p.rotation.x += 0.008;
        p.rotation.y += 0.01;
        p.position.y += Math.sin(elapsedTime * 1.5 + idx) * 0.002;
      });

      renderer.render(scene, camera);
    };

    animate();

    // NETTOYAGE
    return () => {
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("click", handleClick);
      container.removeEventListener("touchmove", handleTouchMove);
      cancelAnimationFrame(animationFrameId);

      introTl.kill();
      gsap.killTweensOf(cjpGroup.position);
      gsap.killTweensOf(cjpGroup.rotation);
      gsap.killTweensOf(particlesGroup.rotation);

      letters.forEach((l) => {
        l.geometry.dispose();
        (l.material as THREE.Material).dispose();
      });
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full max-w-2xl mx-auto flex flex-col items-center">
      {/* CONTENEUR CANVAS 3D INTERACTIF */}
      <div
        ref={containerRef}
        className="w-full h-[240px] sm:h-[320px] md:h-[360px] cursor-grab active:cursor-grabbing relative select-none touch-pan-y"
        title="Lettres 3D CJP - Bougez la souris ou cliquez sur les lettres !"
      />

      {/* INDICATION INTERACTIVE DISCRÈTE */}
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#FFA500]/30 bg-[#FFA500]/10 text-[#FFA500] text-[11px] font-semibold transition-opacity duration-300 pointer-events-none -mt-4 sm:-mt-6 ${
          hintVisible ? "opacity-90 animate-pulse" : "opacity-40"
        }`}
      >
        <MousePointerClick className="w-3.5 h-3.5" />
        <span>Survolez ou cliquez sur les lettres pour animer en 3D</span>
      </div>
    </div>
  );
}
